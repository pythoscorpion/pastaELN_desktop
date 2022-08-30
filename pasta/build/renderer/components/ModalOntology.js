"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _core = require("@material-ui/core");

var _icons = require("@material-ui/icons");

var _lab = require("@material-ui/lab");

var _axios = _interopRequireDefault(require("axios"));

var _Store = _interopRequireDefault(require("../Store"));

var Actions = _interopRequireWildcard(require("../Actions"));

var _ModalHelp = _interopRequireDefault(require("./ModalHelp"));

var _style = require("../style");

var _localInteraction = require("../localInteraction");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* Modal that allows the user to add/edit the ontology
*/
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
class ModalOntology extends _react.Component {
  constructor() {
    super();

    this.pressedLoadBtn = () => {
      var ontology = _Store.default.getOntology();

      this.setState({
        ontology: ontology
      });
      var docType = Object.keys(ontology).filter(item => {
        return item[0] != '_';
      })[0];
      if (ontology['x0']) //have a fixed default
        docType = 'x0';
      if (docType == null) docType = '--addNew--';
      this.setState({
        docType: docType,
        docLabels: _Store.default.getDocTypeLabels()
      });
    };

    this.pressedSaveBtn = () => {
      var ontology = this.state.ontology; // get rid of empty entries: names not given or empty

      var error = null;

      for (var [key, value] of Object.entries(ontology)) {
        if (key[0] != '-' && key[0] != '_') {
          //skip entries in ontology which are not for documents: _id, _rev
          value = value.filter(item => {
            return item.name && item.name.length > 0 || item.heading || item.attachment;
          }); //filter out lines in docType

          const rowNames = value.map(item => {
            return item.name;
          });
          const doubles = rowNames.filter((i, idx) => {
            return rowNames.indexOf(i) != idx;
          }).filter(i => {
            return i;
          });
          if (doubles.length > 0) error = 'Rows with the same name "' + doubles[0] + '" in docType "' + key + '"';
          value = value.map(item => {
            // if (key=='measurement')
            //   console.log(key+' before: '+JSON.stringify(item));
            if (item.heading) {
              item.heading = item.heading.trim();
              return item;
            }

            if (item.attachment) {
              item.attachment = item.attachment.trim();
              if (!item.docType) item.docType = null;
              return item;
            }

            item.name = item.name.trim().replace(/^[_\d]/g, '');
            ['query', 'unit'].forEach(i => {
              if (item[i]) {
                item[i] = item[i].trim().replace('\n', '');
                if (item[i] == '') delete item[i];
              }
            });

            if (item.list && typeof item.list == 'string') {
              item.list = item.list.split(',').map(i => i.trim());
              if (item.list.length == 0) delete item.list;
              if (item.list.length == 1) item.list = item.list[0];
            }

            if (_Store.default.itemDB.indexOf(item.name) > -1 && _Store.default.itemSkip.indexOf(item.name) > -1 && item.query) item.name += '_'; // if (key=='measurement')
            //   console.log('after : '+JSON.stringify(item));

            return item;
          });
          ontology[key] = value;
        }
      }

      if (error) {
        this.setState({
          error: error
        });
      } else {
        _Store.default.updateDocument(ontology, false); //save to database...directly


        (0, _localInteraction.saveTableLabel)(this.state.docLabels); //save docLabels to .pasta.json
        //clean

        this.setState({
          ontology: {},
          docLabels: {}
        });
        this.props.callback('save');
      }
    };

    this.changeTypeSelector = (event, item) => {
      /* change in row of "Data type": incl. delete */
      switch (item) {
        case 'doctype':
          this.setState({
            docType: event.target.value
          });
          break;

        case 'delete':
          var ontology = this.state.ontology;
          delete ontology[this.state.docType];
          var docTypes = Object.keys(ontology).filter(i => {
            return i[0] != '_';
          }).sort();
          this.setState({
            ontology: ontology,
            docType: docTypes.length > 0 ? docTypes[0] : '--addNew--'
          });
          break;

        case 'addSubType':
          this.setState({
            docType: '--addNewSub' + this.state.docType
          });
          break;

        case 'addStructureLevel':
          var l = Object.keys(this.state.ontology).filter(i => {
            return i[0] == 'x';
          }).length;
          var docType = 'x' + l.toString();
          var ontology2 = this.state.ontology;
          ontology2[docType] = this.defaultProperties;
          var docLabels = this.state.docLabels;
          docLabels[docType] = 'sub'.repeat(l - 2) + 'tasks';
          docLabels[docType] = 'S' + docLabels[docType].slice(1);
          this.setState({
            docType: docType,
            ontology: ontology2,
            docLabels: docLabels
          });
          break;

        default:
          console.log('ModalOntology:changeTypeSelector: default case not possible');
      }
    };

    this.changeImport = (event, item) => {
      /** change in import form **/
      if (item === 'collection') {
        this.setState({
          selectCollection: event.target.value
        });

        const url = _axios.default.create({
          baseURL: this.baseURL
        });

        const thePath = this.basePath + event.target.value + '.json';
        url.get(thePath).then(res => {
          this.setState({
            remoteOntology: res.data
          });
        }).catch(() => {
          console.log('Error encountered during ' + event.target.value + '.json reading.');
        });
      } else if (item === 'scheme') {
        this.setState({
          selectScheme: event.target.value,
          tempDocType: event.target.value
        });
      } else if (item === 'doctype') {
        this.setState({
          tempDocType: event.target.value
        });
      } else if (item === 'done') {
        var ontology = this.state.ontology;
        ontology[this.state.tempDocType] = this.state.remoteOntology[this.state.selectScheme];
        this.setState({
          ontology: ontology,
          docType: this.state.tempDocType
        });
      } else {
        console.log('ModalOntology,changeImport: get bad item: |' + item + '|');
      }
    };

    this.change = (event, row, column) => {
      /** change in form of this specific  doctype **/
      var ontology = this.state.ontology;

      if (row == -2) {
        //change docType
        if (column === 'doctype') {
          //change the name of the docType
          var newString = event.target.value.replace(/^[_x\d]|\s|\W/g, '').toLowerCase();
          this.setState({
            tempDocType: newString
          });
        } else {
          //pressed "Create" button after entering doctype name
          var docType = this.state.tempDocType;

          if (this.state.docType == '--addNew--') {
            ontology[docType] = this.defaultProperties;
          } else {
            var parentDocType = this.state.docType.slice(11);
            docType = parentDocType + '/' + this.state.tempDocType;
            ontology[docType] = [...ontology[parentDocType]]; //deep array copy
          }

          this.setState({
            docType: docType,
            tempDocType: ''
          });
        }
      } else if (row == -1) {
        //select addRow or addHeading
        if (column === 'addRow') ontology[this.state.docType] = ontology[this.state.docType].concat({
          name: ''
        });
        if (column === 'addHeading') ontology[this.state.docType] = ontology[this.state.docType].concat({
          heading: ' '
        });
        if (column === 'addAttachment') ontology[this.state.docType] = ontology[this.state.docType].concat({
          attachment: ' '
        });
      } else {
        if (column == 'delete') {
          ontology[this.state.docType].splice(row, 1); //delete row in array
        } else if (column == 'up') {
          if (row == 0) //do nothing
            return;
          ontology[this.state.docType].splice(row - 1, 0, ontology[this.state.docType][row]);
          ontology[this.state.docType].splice(row + 1, 1); //delete row+1
        } else {
          if (event.target.type === 'checkbox') ontology[this.state.docType][row][column] = !ontology[this.state.docType][row][column];else if (column == 'name') {
            var newString2 = event.target.value.replace(/^[_\d]|\s|[^a-zA-Z0-9_/]/g, ''); //which names are allowed

            newString2 = newString2.charAt(0).toLowerCase() + newString2.slice(1); //force first letter to small

            ontology[this.state.docType][row][column] = newString2;
          } else ontology[this.state.docType][row][column] = event.target.value;
        }
      }

      this.setState({
        ontology: ontology
      });
    };

    this.state = {
      ontology: {},
      docType: '--addNew--',
      docLabels: {},
      tempDocType: '',
      listCollections: [''],
      selectCollection: '',
      remoteOntology: [],
      selectScheme: ''
    };
    this.baseURL = 'https://jugit.fz-juelich.de';
    this.basePath = 'pasta/ontology/-/raw/master/';
    this.defaultProperties = [{
      name: '-name',
      query: 'What is the name / ID?'
    }, {
      name: 'comment',
      query: '#tags comments remarks :field:value:'
    }];
  }

  componentDidMount() {
    /* after mounting, read list of all possible collections from README.md
    */
    const url = _axios.default.create({
      baseURL: this.baseURL
    });

    const thePath = this.basePath + 'README.md';
    url.get(thePath).then(res => {
      var lines = res.data.split('\n');
      lines = lines.map(line => {
        if (line.indexOf('.json :') > 0) return line.split('.json :')[0].substring(2);else return null;
      });
      lines = [''].concat(lines.filter(item => {
        return item;
      }));
      this.setState({
        listCollections: lines,
        selectCollection: lines[0]
      });
      this.pressedLoadBtn();
    }).catch(() => {
      console.log('Error encountered during README.md reading.');
    });
  }
  /** Functions as class properties (immediately bound): react on user interactions **/


  /** create html-structure; all should return at least <div></div> **/
  showTypeSelector() {
    /* show type selector incl. delete button */
    var listTypes = Object.keys(this.state.ontology);
    listTypes = listTypes.filter(item => {
      return item[0] != '_' && item[0] != '-';
    });
    listTypes.sort();
    var options = listTypes.map(item => {
      if (item[0] == 'x') return /*#__PURE__*/_react.default.createElement(_core.MenuItem, {
        value: item,
        key: item
      }, "Structure level ", parseInt(item[1]) + 1);
      return /*#__PURE__*/_react.default.createElement(_core.MenuItem, {
        value: item,
        key: item
      }, item);
    });
    options = options.concat( /*#__PURE__*/_react.default.createElement(_core.MenuItem, {
      key: "--addNew--",
      value: "--addNew--"
    }, '-- Add new --'));
    options = options.concat( /*#__PURE__*/_react.default.createElement(_core.MenuItem, {
      key: "--importNew",
      value: "--importNew--"
    }, '-- Import from server --'));
    const numHierarchyDocTypes = listTypes.filter(item => {
      return item[0] == 'x';
    }).length;
    const allowDelete = !(this.state.docType[1] != numHierarchyDocTypes - 1 && this.state.docType[0] == 'x');
    return /*#__PURE__*/_react.default.createElement("div", {
      key: "typeSelector",
      className: "container-fluid"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "row"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-2 text-right pt-2"
    }, "Data type"), /*#__PURE__*/_react.default.createElement(_core.FormControl, {
      fullWidth: true,
      className: "col-sm-4"
    }, /*#__PURE__*/_react.default.createElement(_core.Select, {
      onChange: e => this.changeTypeSelector(e, 'doctype'),
      value: this.state.docType.slice(0, 11) === '--addNewSub' ? '' : this.state.docType
    }, options)), /*#__PURE__*/_react.default.createElement(_core.FormControl, {
      fullWidth: true,
      className: "col-sm-3 p-1"
    }, /*#__PURE__*/_react.default.createElement(_core.Input, {
      placeholder: "Label",
      value: this.state.docLabels[this.state.docType],
      onChange: e => this.change(e, null, 'label'),
      key: 'label_doc_type'
    })), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-1 pl-2 pr-0"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: e => this.changeTypeSelector(e, 'delete'),
      variant: "contained",
      style: _style.btn,
      fullWidth: true,
      disabled: !allowDelete
    }, "Delete")), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-2 pl-2 pr-0"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      variant: "contained",
      style: _style.btn,
      fullWidth: true,
      disabled: this.state.docType.slice(0, 2) == '--',
      onClick: e => this.changeTypeSelector(e, this.state.docType[0] == 'x' ? 'addStructureLevel' : 'addSubType')
    }, /*#__PURE__*/_react.default.createElement(_icons.Add, null), "\xA0", this.state.docType[0] == 'x' ? 'structure level' : 'subtype'))));
  }

  showForm() {
    /* show form to change ontology*/
    var listRows = this.state.ontology[this.state.docType];

    if (listRows) {
      listRows = listRows.map((item, idx) => {
        if (!item.name && item.heading) {
          //IF HEADING
          return /*#__PURE__*/_react.default.createElement("div", {
            key: 'row' + idx.toString(),
            className: "row p-3"
          }, /*#__PURE__*/_react.default.createElement("div", {
            className: "col-sm-2 pt-2 pl-1"
          }, /*#__PURE__*/_react.default.createElement("strong", null, "Heading")), /*#__PURE__*/_react.default.createElement(_core.FormControl, {
            fullWidth: true,
            className: "col-sm-8"
          }, /*#__PURE__*/_react.default.createElement(_core.Input, {
            required: true,
            placeholder: "Heading",
            value: item.heading,
            onChange: e => this.change(e, idx, 'heading'),
            key: 'heading' + idx.toString()
          })), /*#__PURE__*/_react.default.createElement("div", {
            className: "col-sm-2"
          }, /*#__PURE__*/_react.default.createElement(_core.IconButton, {
            onClick: e => this.change(e, idx, 'up'),
            size: "small",
            className: "mr-2 float-right"
          }, /*#__PURE__*/_react.default.createElement(_icons.ArrowUpward, null)), /*#__PURE__*/_react.default.createElement(_core.IconButton, {
            onClick: e => this.change(e, idx, 'delete'),
            size: "small",
            className: "float-right"
          }, /*#__PURE__*/_react.default.createElement(_icons.Delete, null))));
        } else if (!item.name && item.attachment) {
          //IF ATTACHMENT
          return /*#__PURE__*/_react.default.createElement("div", {
            key: 'row' + idx.toString(),
            className: "row p-3"
          }, /*#__PURE__*/_react.default.createElement("div", {
            className: "col-sm-2 pt-2 pl-1"
          }, /*#__PURE__*/_react.default.createElement("strong", null, "Attachment")), /*#__PURE__*/_react.default.createElement(_core.FormControl, {
            fullWidth: true,
            className: "col-sm-4 p-1"
          }, /*#__PURE__*/_react.default.createElement(_core.Input, {
            required: true,
            placeholder: "Name",
            value: item.attachment,
            onChange: e => this.change(e, idx, 'attachment'),
            key: 'attachment' + idx.toString()
          })), /*#__PURE__*/_react.default.createElement(_core.FormControl, {
            fullWidth: true,
            className: "col-sm-4 p-1"
          }, /*#__PURE__*/_react.default.createElement(_core.Input, {
            required: true,
            placeholder: "doc-type. Leave empty, if this is an issue-board",
            value: item.docType ? item.docType : '',
            onChange: e => this.change(e, idx, 'docType'),
            key: 'docType' + idx.toString()
          })), /*#__PURE__*/_react.default.createElement("div", {
            className: "col-sm-2"
          }, /*#__PURE__*/_react.default.createElement(_core.IconButton, {
            onClick: e => this.change(e, idx, 'up'),
            size: "small",
            className: "mr-2 float-right"
          }, /*#__PURE__*/_react.default.createElement(_icons.ArrowUpward, null)), /*#__PURE__*/_react.default.createElement(_core.IconButton, {
            onClick: e => this.change(e, idx, 'delete'),
            size: "small",
            className: "float-right"
          }, /*#__PURE__*/_react.default.createElement(_icons.Delete, null))));
        } else {
          //IF NOT HEADING, nor attachment
          return /*#__PURE__*/_react.default.createElement("div", {
            key: 'row' + idx.toString(),
            className: "row px-3"
          }, /*#__PURE__*/_react.default.createElement(_core.FormControl, {
            fullWidth: true,
            className: "col-sm-2 p-1"
          }, /*#__PURE__*/_react.default.createElement(_core.Input, {
            required: true,
            placeholder: "Name",
            value: item.name,
            onChange: e => this.change(e, idx, 'name'),
            key: 'name' + idx.toString()
          })), /*#__PURE__*/_react.default.createElement(_core.FormControl, {
            fullWidth: true,
            className: "col-sm-4 p-1"
          }, /*#__PURE__*/_react.default.createElement(_core.Input, {
            placeholder: "Questions (keep empty to create automatically)",
            value: item.query ? item.query : '',
            onChange: e => this.change(e, idx, 'query'),
            key: 'query' + idx.toString()
          })), /*#__PURE__*/_react.default.createElement(_core.FormControl, {
            fullWidth: true,
            className: "col-sm-4 p-1"
          }, /*#__PURE__*/_react.default.createElement(_core.Input, {
            placeholder: "Is this a list? (, separated)",
            value: item.list ? item.list : '',
            onChange: e => this.change(e, idx, 'list'),
            key: 'list' + idx.toString()
          })), /*#__PURE__*/_react.default.createElement("div", {
            key: 'subrow' + idx.toString(),
            className: "col-sm-2 row pl-2 pr-0"
          }, /*#__PURE__*/_react.default.createElement(_core.Checkbox, {
            className: "col-sm-3",
            checked: item.required ? item.required : false,
            onChange: e => this.change(e, idx, 'required')
          }), /*#__PURE__*/_react.default.createElement(_core.FormControl, {
            fullWidth: true,
            className: "col-sm-6 p-1"
          }, /*#__PURE__*/_react.default.createElement(_core.Input, {
            placeholder: "m",
            value: item.unit ? item.unit : '',
            onChange: e => this.change(e, idx, 'unit'),
            key: 'unit' + idx.toString()
          })), /*#__PURE__*/_react.default.createElement("div", {
            className: "col-sm-3 px-0"
          }, /*#__PURE__*/_react.default.createElement(_core.IconButton, {
            onClick: e => this.change(e, idx, 'delete'),
            size: "small"
          }, /*#__PURE__*/_react.default.createElement(_icons.Delete, null)), /*#__PURE__*/_react.default.createElement(_core.IconButton, {
            onClick: e => this.change(e, idx, 'up'),
            size: "small"
          }, /*#__PURE__*/_react.default.createElement(_icons.ArrowUpward, null)))));
        }
      });
    }

    return /*#__PURE__*/_react.default.createElement("div", null, listRows && /*#__PURE__*/_react.default.createElement("div", {
      className: "row mt-5 px-3"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-2 pl-1"
    }, "Name:"), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-4 pl-1"
    }, "Query:"), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-4 pl-1"
    }, "List:"), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-2 row"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-3 ml-0 pl-0"
    }, "Required"), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6 pl-1"
    }, "Unit:"))), listRows, /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: e => this.change(e, -1, 'addRow'),
      variant: "contained",
      className: "col-sm-1 mt-4",
      style: _style.btn,
      id: "ontologyAddRow"
    }, /*#__PURE__*/_react.default.createElement(_icons.Add, null), "\xA0row"), /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: e => this.change(e, -1, 'addHeading'),
      variant: "contained",
      className: "col-sm-1 ml-2 mt-4",
      style: _style.btn,
      id: "ontologyAddHeading"
    }, /*#__PURE__*/_react.default.createElement(_icons.Add, null), "\xA0heading"), /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: e => this.change(e, -1, 'addAttachment'),
      variant: "contained",
      className: "col-sm-1 ml-2 mt-4",
      style: _style.btn,
      id: "ontologyAddAttach"
    }, /*#__PURE__*/_react.default.createElement(_icons.Add, null), "\xA0attachment"));
  }

  showCreateDoctype(doctype) {
    /* create a new doctype form*/
    var lineHeader = null;

    if (doctype.slice(0, 11) == '--addNewSub') {
      lineHeader = doctype.slice(11) + ' / ';
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "row pt-5"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-2 text-right pt-2 pr-0"
    }, "Name: ", lineHeader && /*#__PURE__*/_react.default.createElement("strong", null, lineHeader)), /*#__PURE__*/_react.default.createElement(_core.FormControl, {
      fullWidth: true,
      className: "col-sm-4 ml-3 p-1"
    }, /*#__PURE__*/_react.default.createElement(_core.Input, {
      placeholder: "Document type",
      value: this.state.tempDocType,
      onChange: e => this.change(e, -2, 'doctype'),
      key: "doctype"
    })), /*#__PURE__*/_react.default.createElement(_lab.Alert, {
      className: "col-sm-4",
      severity: "info"
    }, "Single case of type name!"), /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: e => this.change(e, -2, 'done'),
      variant: "contained",
      className: "col-sm-1 m-2",
      style: _style.btn
    }, "Create"));
  }

  showImport() {
    /* form for getting ontology from remote server*/
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "row py-5"
    }, /*#__PURE__*/_react.default.createElement("div", {
      key: "typeSelector",
      className: "container-fluid"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "row mt-1"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-3 text-right pt-2"
    }, "Collection:"), /*#__PURE__*/_react.default.createElement(_core.FormControl, {
      fullWidth: true,
      className: "col-sm-8"
    }, /*#__PURE__*/_react.default.createElement(_core.Select, {
      onChange: e => this.changeImport(e, 'collection'),
      value: this.state.selectCollection
    }, this.state.listCollections.map(item => {
      return /*#__PURE__*/_react.default.createElement(_core.MenuItem, {
        key: item,
        value: item
      }, item);
    }))), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-3 text-right my-3 pt-2"
    }, "Scheme:"), /*#__PURE__*/_react.default.createElement(_core.FormControl, {
      fullWidth: true,
      className: "col-sm-8 my-3"
    }, Object.keys(this.state.remoteOntology).length > 0 && /*#__PURE__*/_react.default.createElement(_core.Select, {
      onChange: e => this.changeImport(e, 'scheme'),
      value: this.state.selectScheme
    }, Object.keys(this.state.remoteOntology).map(item => {
      return /*#__PURE__*/_react.default.createElement(_core.MenuItem, {
        key: item,
        value: item
      }, item);
    }))), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-3 text-right pt-2"
    }, "Save as type:"), /*#__PURE__*/_react.default.createElement(_core.FormControl, {
      fullWidth: true,
      className: "col-sm-7 p-1 pr-3"
    }, /*#__PURE__*/_react.default.createElement(_core.Input, {
      placeholder: "Document type",
      value: this.state.tempDocType,
      onChange: e => this.changeImport(e, 'doctype'),
      key: "doctype"
    })), /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: e => this.changeImport(e, 'done'),
      variant: "contained",
      className: "col-sm-1 m-2",
      style: _style.btn
    }, "Import"))));
  }
  /** the render method **/


  render() {
    if (this.props.show === 'none') {
      return /*#__PURE__*/_react.default.createElement("div", null);
    }

    const ontologyLoaded = this.state.ontology._id && this.state.ontology._id == '-ontology-';
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "modal",
      style: { ..._style.modal,
        display: this.props.show
      }
    }, /*#__PURE__*/_react.default.createElement(_ModalHelp.default, null), /*#__PURE__*/_react.default.createElement("div", {
      className: "modal-content",
      style: _style.modalContent
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col",
      style: _style.btnStrong
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "row py-3"
    }, /*#__PURE__*/_react.default.createElement("h1", {
      className: "col-sm-8 p-2 px-3"
    }, "Edit questionnaires"), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-1 p-2"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      fullWidth: true,
      onClick: () => this.pressedLoadBtn(),
      variant: "contained",
      style: _style.btn,
      id: "ontologyLoadBtn"
    }, "Load")), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-1 p-2"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      fullWidth: true,
      onClick: () => this.pressedSaveBtn(),
      variant: "contained",
      style: ontologyLoaded ? _style.btnWarning : _style.btnStrongDeactive,
      disabled: !ontologyLoaded
    }, "Save")), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-1 p-2"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      fullWidth: true,
      onClick: () => Actions.showHelp('ontology'),
      variant: "contained",
      id: "helpBtn",
      style: _style.btn
    }, "Help")), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-1 p-2 pr-3"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      fullWidth: true,
      onClick: () => {
        this.setState({
          ontology: {}
        });
        this.props.callback('cancel');
      },
      variant: "contained",
      id: "closeBtn",
      style: _style.btn
    }, "Cancel")))), this.state.error && /*#__PURE__*/_react.default.createElement(_lab.Alert, {
      severity: "error",
      key: "alert"
    }, /*#__PURE__*/_react.default.createElement("strong", null, this.state.error)), !ontologyLoaded && /*#__PURE__*/_react.default.createElement("h4", {
      className: "m-3"
    }, "Start by loading current ontology."), !this.state.docType && /*#__PURE__*/_react.default.createElement("h4", {
      className: "m-3"
    }, "Ontology is incorrect."), ontologyLoaded && this.state.docType && /*#__PURE__*/_react.default.createElement("div", {
      className: "form-popup m-2"
    }, /*#__PURE__*/_react.default.createElement("form", {
      className: "form-container"
    }, this.state.docType.slice(0, 8) != '--addNew' && this.showTypeSelector(), this.state.docType == '--importNew--' && this.showImport(), this.state.docType == '--addNew--' && this.showCreateDoctype('--basetype--'), this.state.docType.slice(0, 11) == '--addNewSub' && this.showCreateDoctype(this.state.docType), this.state.docType.slice(0, 2) != '--' && this.showForm()))));
  }

}

exports.default = ModalOntology;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlcmVyL2NvbXBvbmVudHMvTW9kYWxPbnRvbG9neS5qcyJdLCJuYW1lcyI6WyJNb2RhbE9udG9sb2d5IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcmVzc2VkTG9hZEJ0biIsIm9udG9sb2d5IiwiU3RvcmUiLCJnZXRPbnRvbG9neSIsInNldFN0YXRlIiwiZG9jVHlwZSIsIk9iamVjdCIsImtleXMiLCJmaWx0ZXIiLCJpdGVtIiwiZG9jTGFiZWxzIiwiZ2V0RG9jVHlwZUxhYmVscyIsInByZXNzZWRTYXZlQnRuIiwic3RhdGUiLCJlcnJvciIsImtleSIsInZhbHVlIiwiZW50cmllcyIsIm5hbWUiLCJsZW5ndGgiLCJoZWFkaW5nIiwiYXR0YWNobWVudCIsInJvd05hbWVzIiwibWFwIiwiZG91YmxlcyIsImkiLCJpZHgiLCJpbmRleE9mIiwidHJpbSIsInJlcGxhY2UiLCJmb3JFYWNoIiwibGlzdCIsInNwbGl0IiwiaXRlbURCIiwiaXRlbVNraXAiLCJxdWVyeSIsInVwZGF0ZURvY3VtZW50IiwicHJvcHMiLCJjYWxsYmFjayIsImNoYW5nZVR5cGVTZWxlY3RvciIsImV2ZW50IiwidGFyZ2V0IiwiZG9jVHlwZXMiLCJzb3J0IiwibCIsInRvU3RyaW5nIiwib250b2xvZ3kyIiwiZGVmYXVsdFByb3BlcnRpZXMiLCJyZXBlYXQiLCJzbGljZSIsImNvbnNvbGUiLCJsb2ciLCJjaGFuZ2VJbXBvcnQiLCJzZWxlY3RDb2xsZWN0aW9uIiwidXJsIiwiYXhpb3MiLCJjcmVhdGUiLCJiYXNlVVJMIiwidGhlUGF0aCIsImJhc2VQYXRoIiwiZ2V0IiwidGhlbiIsInJlcyIsInJlbW90ZU9udG9sb2d5IiwiZGF0YSIsImNhdGNoIiwic2VsZWN0U2NoZW1lIiwidGVtcERvY1R5cGUiLCJjaGFuZ2UiLCJyb3ciLCJjb2x1bW4iLCJuZXdTdHJpbmciLCJ0b0xvd2VyQ2FzZSIsInBhcmVudERvY1R5cGUiLCJjb25jYXQiLCJzcGxpY2UiLCJ0eXBlIiwibmV3U3RyaW5nMiIsImNoYXJBdCIsImxpc3RDb2xsZWN0aW9ucyIsImNvbXBvbmVudERpZE1vdW50IiwibGluZXMiLCJsaW5lIiwic3Vic3RyaW5nIiwic2hvd1R5cGVTZWxlY3RvciIsImxpc3RUeXBlcyIsIm9wdGlvbnMiLCJwYXJzZUludCIsIm51bUhpZXJhcmNoeURvY1R5cGVzIiwiYWxsb3dEZWxldGUiLCJlIiwiYnRuIiwic2hvd0Zvcm0iLCJsaXN0Um93cyIsInJlcXVpcmVkIiwidW5pdCIsInNob3dDcmVhdGVEb2N0eXBlIiwiZG9jdHlwZSIsImxpbmVIZWFkZXIiLCJzaG93SW1wb3J0IiwicmVuZGVyIiwic2hvdyIsIm9udG9sb2d5TG9hZGVkIiwiX2lkIiwibW9kYWwiLCJkaXNwbGF5IiwibW9kYWxDb250ZW50IiwiYnRuU3Ryb25nIiwiYnRuV2FybmluZyIsImJ0blN0cm9uZ0RlYWN0aXZlIiwiQWN0aW9ucyIsInNob3dIZWxwIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBWEE7QUFDQTtBQUNrRTtBQUNvQztBQUNwQztBQUNBO0FBSUQ7QUFLbEQsTUFBTUEsYUFBTixTQUE0QkMsZ0JBQTVCLENBQXNDO0FBQ25EQyxFQUFBQSxXQUFXLEdBQUc7QUFDWjs7QUFEWSxTQXNDZEMsY0F0Q2MsR0FzQ0MsTUFBSTtBQUNqQixVQUFJQyxRQUFRLEdBQUdDLGVBQU1DLFdBQU4sRUFBZjs7QUFDQSxXQUFLQyxRQUFMLENBQWM7QUFBQ0gsUUFBQUEsUUFBUSxFQUFFQTtBQUFYLE9BQWQ7QUFDQSxVQUFJSSxPQUFPLEdBQUdDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZTixRQUFaLEVBQXNCTyxNQUF0QixDQUE4QkMsSUFBRCxJQUFRO0FBQUMsZUFBT0EsSUFBSSxDQUFDLENBQUQsQ0FBSixJQUFTLEdBQWhCO0FBQXFCLE9BQTNELEVBQTZELENBQTdELENBQWQ7QUFDQSxVQUFJUixRQUFRLENBQUMsSUFB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QUFwQixJQUFpRCxLQUFLOEYsVUFBTCxFQUZwRCxFQUdHLEtBQUt0RixLQUFMLENBQVdSLE9BQVgsSUFBb0IsWUFBcEIsSUFBaUQsS0FBSzJGLGlCQUFMLENBQXVCLGNBQXZCLENBSHBELEVBSUcsS0FBS25GLEtBQUwsQ0FBV1IsT0FBWCxDQUFtQjRDLEtBQW5CLENBQXlCLENBQXpCLEVBQTJCLEVBQTNCLEtBQWdDLGFBQWhDLElBQWlELEtBQUsrQyxpQkFBTCxDQUF1QixLQUFLbkYsS0FBTCxDQUFXUixPQUFsQyxDQUpwRCxFQUtHLEtBQUtRLEtBQUwsQ0FBV1IsT0FBWCxDQUFtQjRDLEtBQW5CLENBQXlCLENBQXpCLEVBQTJCLENBQTNCLEtBQWdDLElBQWhDLElBQWlELEtBQUsyQyxRQUFMLEVBTHBELENBRHVDLENBdkMzQyxDQUZGLENBREY7QUFzREQ7O0FBdGdCa0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBNb2RhbCB0aGF0IGFsbG93cyB0aGUgdXNlciB0byBhZGQvZWRpdCB0aGUgb250b2xvZ3lcbiovXG5pbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50IH0gZnJvbSAncmVhY3QnOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgeyBCdXR0b24sIEljb25CdXR0b24sIENoZWNrYm94LCBJbnB1dCwgU2VsZWN0LCBNZW51SXRlbSwgRm9ybUNvbnRyb2x9IGZyb20gJ0BtYXRlcmlhbC11aS9jb3JlJzsvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgeyBEZWxldGUsIEFycm93VXB3YXJkLCBBZGQgfSBmcm9tICdAbWF0ZXJpYWwtdWkvaWNvbnMnOyAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgeyBBbGVydCB9IGZyb20gJ0BtYXRlcmlhbC11aS9sYWInOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xuaW1wb3J0IFN0b3JlIGZyb20gJy4uL1N0b3JlJztcbmltcG9ydCAqIGFzIEFjdGlvbnMgZnJvbSAnLi4vQWN0aW9ucyc7XG5pbXBvcnQgTW9kYWxIZWxwIGZyb20gJy4vTW9kYWxIZWxwJzsgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCB7IG1vZGFsLCBtb2RhbENvbnRlbnQsIGJ0biwgYnRuU3Ryb25nLCBidG5TdHJvbmdEZWFjdGl2ZSwgYnRuV2FybmluZyB9IGZyb20gJy4uL3N0eWxlJztcbmltcG9ydCB7IHNhdmVUYWJsZUxhYmVsIH0gZnJvbSAnLi4vbG9jYWxJbnRlcmFjdGlvbic7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kYWxPbnRvbG9neSBleHRlbmRzIENvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG9udG9sb2d5OiB7fSxcbiAgICAgIGRvY1R5cGU6ICctLWFkZE5ldy0tJyxcbiAgICAgIGRvY0xhYmVsczoge30sXG4gICAgICB0ZW1wRG9jVHlwZTogJycsXG4gICAgICBsaXN0Q29sbGVjdGlvbnM6IFsnJ10sIHNlbGVjdENvbGxlY3Rpb246ICcnLFxuICAgICAgcmVtb3RlT250b2xvZ3k6IFtdLCBzZWxlY3RTY2hlbWU6JydcbiAgICB9O1xuICAgIHRoaXMuYmFzZVVSTCAgPSAnaHR0cHM6Ly9qdWdpdC5mei1qdWVsaWNoLmRlJztcbiAgICB0aGlzLmJhc2VQYXRoID0gJ3Bhc3RhL29udG9sb2d5Ly0vcmF3L21hc3Rlci8nO1xuICAgIHRoaXMuZGVmYXVsdFByb3BlcnRpZXMgPSBbe25hbWU6Jy1uYW1lJywgcXVlcnk6J1doYXQgaXMgdGhlIG5hbWUgLyBJRD8nfSxcbiAgICAgIHtuYW1lOidjb21tZW50JywgcXVlcnk6JyN0YWdzIGNvbW1lbnRzIHJlbWFya3MgOmZpZWxkOnZhbHVlOid9XTtcbiAgfVxuICBjb21wb25lbnREaWRNb3VudCgpe1xuICAgIC8qIGFmdGVyIG1vdW50aW5nLCByZWFkIGxpc3Qgb2YgYWxsIHBvc3NpYmxlIGNvbGxlY3Rpb25zIGZyb20gUkVBRE1FLm1kXG4gICAgKi9cbiAgICBjb25zdCB1cmwgPSBheGlvcy5jcmVhdGUoe2Jhc2VVUkw6IHRoaXMuYmFzZVVSTH0pO1xuICAgIGNvbnN0IHRoZVBhdGggPSB0aGlzLmJhc2VQYXRoKydSRUFETUUubWQnO1xuICAgIHVybC5nZXQodGhlUGF0aCkudGhlbigocmVzKSA9PiB7XG4gICAgICB2YXIgbGluZXMgPSByZXMuZGF0YS5zcGxpdCgnXFxuJyk7XG4gICAgICBsaW5lcyA9IGxpbmVzLm1hcCgobGluZSk9PntcbiAgICAgICAgaWYgKGxpbmUuaW5kZXhPZignLmpzb24gOicpPjApXG4gICAgICAgICAgcmV0dXJuIGxpbmUuc3BsaXQoJy5qc29uIDonKVswXS5zdWJzdHJpbmcoMik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0pO1xuICAgICAgbGluZXMgPSBbJyddLmNvbmNhdChsaW5lcy5maWx0ZXIoKGl0ZW0pPT57cmV0dXJuIGl0ZW07fSkpO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7bGlzdENvbGxlY3Rpb25zOmxpbmVzLCBzZWxlY3RDb2xsZWN0aW9uOmxpbmVzWzBdfSk7XG4gICAgICB0aGlzLnByZXNzZWRMb2FkQnRuKCk7XG4gICAgfSkuY2F0Y2goKCk9PntcbiAgICAgIGNvbnNvbGUubG9nKCdFcnJvciBlbmNvdW50ZXJlZCBkdXJpbmcgUkVBRE1FLm1kIHJlYWRpbmcuJyk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKiBGdW5jdGlvbnMgYXMgY2xhc3MgcHJvcGVydGllcyAoaW1tZWRpYXRlbHkgYm91bmQpOiByZWFjdCBvbiB1c2VyIGludGVyYWN0aW9ucyAqKi9cbiAgcHJlc3NlZExvYWRCdG49KCk9PntcbiAgICB2YXIgb250b2xvZ3kgPSBTdG9yZS5nZXRPbnRvbG9neSgpO1xuICAgIHRoaXMuc2V0U3RhdGUoe29udG9sb2d5OiBvbnRvbG9neX0pO1xuICAgIHZhciBkb2NUeXBlID0gT2JqZWN0LmtleXMob250b2xvZ3kpLmZpbHRlcigoaXRlbSk9PntyZXR1cm4gaXRlbVswXSE9J18nO30pWzBdO1xuICAgIGlmIChvbnRvbG9neVsneDAnXSkgIC8vaGF2ZSBhIGZpeGVkIGRlZmF1bHRcbiAgICAgIGRvY1R5cGU9ICd4MCc7XG4gICAgaWYgKGRvY1R5cGUgPT0gbnVsbClcbiAgICAgIGRvY1R5cGU9Jy0tYWRkTmV3LS0nO1xuICAgIHRoaXMuc2V0U3RhdGUoe2RvY1R5cGU6ZG9jVHlwZSwgZG9jTGFiZWxzOiBTdG9yZS5nZXREb2NUeXBlTGFiZWxzKCl9KTtcbiAgfVxuXG4gIHByZXNzZWRTYXZlQnRuPSgpPT57XG4gICAgdmFyIG9udG9sb2d5ID0gdGhpcy5zdGF0ZS5vbnRvbG9neTtcbiAgICAvLyBnZXQgcmlkIG9mIGVtcHR5IGVudHJpZXM6IG5hbWVzIG5vdCBnaXZlbiBvciBlbXB0eVxuICAgIHZhciBlcnJvciA9IG51bGw7XG4gICAgZm9yICh2YXIgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKG9udG9sb2d5KSkge1xuICAgICAgaWYgKGtleVswXSE9Jy0nICYmIGtleVswXSE9J18nKSB7ICAgLy9za2lwIGVudHJpZXMgaW4gb250b2xvZ3kgd2hpY2ggYXJlIG5vdCBmb3IgZG9jdW1lbnRzOiBfaWQsIF9yZXZcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5maWx0ZXIoKGl0ZW0pPT57XG4gICAgICAgICAgcmV0dXJuKCAoaXRlbS5uYW1lICYmIGl0ZW0ubmFtZS5sZW5ndGg+MCl8fChpdGVtLmhlYWRpbmcpfHwoaXRlbS5hdHRhY2htZW50KSApO1xuICAgICAgICB9KTsgIC8vZmlsdGVyIG91dCBsaW5lcyBpbiBkb2NUeXBlXG4gICAgICAgIGNvbnN0IHJvd05hbWVzID0gdmFsdWUubWFwKGl0ZW09PntyZXR1cm4gaXRlbS5uYW1lO30pO1xuICAgICAgICBjb25zdCBkb3VibGVzID0gcm93TmFtZXMuZmlsdGVyKChpLGlkeCk9PntyZXR1cm4gcm93TmFtZXMuaW5kZXhPZihpKSE9aWR4O30pLmZpbHRlcigoaSk9PntyZXR1cm4gaTt9KTtcbiAgICAgICAgaWYgKGRvdWJsZXMubGVuZ3RoPjApXG4gICAgICAgICAgZXJyb3IgPSAnUm93cyB3aXRoIHRoZSBzYW1lIG5hbWUgXCInK2RvdWJsZXNbMF0rJ1wiIGluIGRvY1R5cGUgXCInK2tleSsnXCInO1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLm1hcCgoaXRlbSk9PntcbiAgICAgICAgICAvLyBpZiAoa2V5PT0nbWVhc3VyZW1lbnQnKVxuICAgICAgICAgIC8vICAgY29uc29sZS5sb2coa2V5KycgYmVmb3JlOiAnK0pTT04uc3RyaW5naWZ5KGl0ZW0pKTtcbiAgICAgICAgICBpZiAoaXRlbS5oZWFkaW5nKSB7XG4gICAgICAgICAgICBpdGVtLmhlYWRpbmcgPSBpdGVtLmhlYWRpbmcudHJpbSgpO1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpdGVtLmF0dGFjaG1lbnQpIHtcbiAgICAgICAgICAgIGl0ZW0uYXR0YWNobWVudCA9IGl0ZW0uYXR0YWNobWVudC50cmltKCk7XG4gICAgICAgICAgICBpZiAoIWl0ZW0uZG9jVHlwZSlcbiAgICAgICAgICAgICAgaXRlbS5kb2NUeXBlID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpdGVtLm5hbWUgPSBpdGVtLm5hbWUudHJpbSgpLnJlcGxhY2UoL15bX1xcZF0vZywnJyk7XG4gICAgICAgICAgWydxdWVyeScsJ3VuaXQnXS5mb3JFYWNoKChpKT0+e1xuICAgICAgICAgICAgaWYgKGl0ZW1baV0pIHtcbiAgICAgICAgICAgICAgaXRlbVtpXT0gaXRlbVtpXS50cmltKCkucmVwbGFjZSgnXFxuJywnJyk7XG4gICAgICAgICAgICAgIGlmIChpdGVtW2ldPT0nJylcbiAgICAgICAgICAgICAgICBkZWxldGUgaXRlbVtpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoaXRlbS5saXN0ICYmIHR5cGVvZiBpdGVtLmxpc3Q9PSdzdHJpbmcnKSB7XG4gICAgICAgICAgICBpdGVtLmxpc3QgPSBpdGVtLmxpc3Quc3BsaXQoJywnKS5tYXAoaSA9PiBpLnRyaW0oKSk7XG4gICAgICAgICAgICBpZiAoaXRlbS5saXN0Lmxlbmd0aD09MClcbiAgICAgICAgICAgICAgZGVsZXRlIGl0ZW0ubGlzdDtcbiAgICAgICAgICAgIGlmIChpdGVtLmxpc3QubGVuZ3RoPT0xKVxuICAgICAgICAgICAgICBpdGVtLmxpc3QgPSBpdGVtLmxpc3RbMF07XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChTdG9yZS5pdGVtREIuaW5kZXhPZihpdGVtLm5hbWUpPi0xICYmIFN0b3JlLml0ZW1Ta2lwLmluZGV4T2YoaXRlbS5uYW1lKT4tMSAmJiBpdGVtLnF1ZXJ5KVxuICAgICAgICAgICAgaXRlbS5uYW1lICs9ICdfJztcbiAgICAgICAgICAvLyBpZiAoa2V5PT0nbWVhc3VyZW1lbnQnKVxuICAgICAgICAgIC8vICAgY29uc29sZS5sb2coJ2FmdGVyIDogJytKU09OLnN0cmluZ2lmeShpdGVtKSk7XG4gICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH0pO1xuICAgICAgICBvbnRvbG9neVtrZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChlcnJvcikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7ZXJyb3I6IGVycm9yfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIFN0b3JlLnVwZGF0ZURvY3VtZW50KG9udG9sb2d5LGZhbHNlKTsgIC8vc2F2ZSB0byBkYXRhYmFzZS4uLmRpcmVjdGx5XG4gICAgICBzYXZlVGFibGVMYWJlbCh0aGlzLnN0YXRlLmRvY0xhYmVscyk7ICAvL3NhdmUgZG9jTGFiZWxzIHRvIC5wYXN0YS5qc29uXG4gICAgICAvL2NsZWFuXG4gICAgICB0aGlzLnNldFN0YXRlKHsgb250b2xvZ3k6e30sIGRvY0xhYmVsczp7fSB9KTtcbiAgICAgIHRoaXMucHJvcHMuY2FsbGJhY2soJ3NhdmUnKTtcbiAgICB9XG4gIH1cblxuXG4gIGNoYW5nZVR5cGVTZWxlY3RvciA9IChldmVudCxpdGVtKSA9PntcbiAgICAvKiBjaGFuZ2UgaW4gcm93IG9mIFwiRGF0YSB0eXBlXCI6IGluY2wuIGRlbGV0ZSAqL1xuICAgIHN3aXRjaCAoaXRlbSkge1xuICAgIGNhc2UgJ2RvY3R5cGUnOlxuICAgICAgdGhpcy5zZXRTdGF0ZSh7ZG9jVHlwZTogZXZlbnQudGFyZ2V0LnZhbHVlfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkZWxldGUnOlxuICAgICAgdmFyIG9udG9sb2d5ID0gdGhpcy5zdGF0ZS5vbnRvbG9neTtcbiAgICAgIGRlbGV0ZSBvbnRvbG9neVt0aGlzLnN0YXRlLmRvY1R5cGVdO1xuICAgICAgdmFyIGRvY1R5cGVzID0gT2JqZWN0LmtleXMob250b2xvZ3kpLmZpbHRlcihpPT57cmV0dXJuIGlbMF0hPSdfJzt9KS5zb3J0KCk7XG4gICAgICB0aGlzLnNldFN0YXRlKHtvbnRvbG9neTpvbnRvbG9neSwgZG9jVHlwZTooZG9jVHlwZXMubGVuZ3RoPjApP2RvY1R5cGVzWzBdOictLWFkZE5ldy0tJ30pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYWRkU3ViVHlwZSc6XG4gICAgICB0aGlzLnNldFN0YXRlKHtkb2NUeXBlOictLWFkZE5ld1N1YicrdGhpcy5zdGF0ZS5kb2NUeXBlfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdhZGRTdHJ1Y3R1cmVMZXZlbCc6XG4gICAgICB2YXIgbCA9IE9iamVjdC5rZXlzKHRoaXMuc3RhdGUub250b2xvZ3kpLmZpbHRlcihpPT57cmV0dXJuIGlbMF09PSd4Jzt9KS5sZW5ndGg7XG4gICAgICB2YXIgZG9jVHlwZSA9ICd4JytsLnRvU3RyaW5nKCk7XG4gICAgICB2YXIgb250b2xvZ3kyID0gdGhpcy5zdGF0ZS5vbnRvbG9neTtcbiAgICAgIG9udG9sb2d5Mltkb2NUeXBlXSA9IHRoaXMuZGVmYXVsdFByb3BlcnRpZXM7XG4gICAgICB2YXIgZG9jTGFiZWxzID0gdGhpcy5zdGF0ZS5kb2NMYWJlbHM7XG4gICAgICBkb2NMYWJlbHNbZG9jVHlwZV0gPSAnc3ViJy5yZXBlYXQobC0yKSsndGFza3MnO1xuICAgICAgZG9jTGFiZWxzW2RvY1R5cGVdID0gJ1MnK2RvY0xhYmVsc1tkb2NUeXBlXS5zbGljZSgxKTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2RvY1R5cGU6ZG9jVHlwZSwgb250b2xvZ3k6b250b2xvZ3kyLCBkb2NMYWJlbHM6ZG9jTGFiZWxzfSk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgY29uc29sZS5sb2coJ01vZGFsT250b2xvZ3k6Y2hhbmdlVHlwZVNlbGVjdG9yOiBkZWZhdWx0IGNhc2Ugbm90IHBvc3NpYmxlJyk7XG4gICAgfVxuICB9XG5cbiAgY2hhbmdlSW1wb3J0ID0gKGV2ZW50LGl0ZW0pID0+e1xuICAgIC8qKiBjaGFuZ2UgaW4gaW1wb3J0IGZvcm0gKiovXG4gICAgaWYgKGl0ZW09PT0nY29sbGVjdGlvbicpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdENvbGxlY3Rpb246IGV2ZW50LnRhcmdldC52YWx1ZX0pO1xuICAgICAgY29uc3QgdXJsID0gYXhpb3MuY3JlYXRlKHtiYXNlVVJMOiB0aGlzLmJhc2VVUkx9KTtcbiAgICAgIGNvbnN0IHRoZVBhdGggPSB0aGlzLmJhc2VQYXRoK2V2ZW50LnRhcmdldC52YWx1ZSsnLmpzb24nO1xuICAgICAgdXJsLmdldCh0aGVQYXRoKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cmVtb3RlT250b2xvZ3k6IHJlcy5kYXRhfSk7XG4gICAgICB9KS5jYXRjaCgoKT0+e1xuICAgICAgICBjb25zb2xlLmxvZygnRXJyb3IgZW5jb3VudGVyZWQgZHVyaW5nICcrZXZlbnQudGFyZ2V0LnZhbHVlKycuanNvbiByZWFkaW5nLicpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChpdGVtPT09J3NjaGVtZScpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdFNjaGVtZTogZXZlbnQudGFyZ2V0LnZhbHVlLCB0ZW1wRG9jVHlwZTogZXZlbnQudGFyZ2V0LnZhbHVlfSk7XG4gICAgfSBlbHNlIGlmIChpdGVtPT09J2RvY3R5cGUnKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHt0ZW1wRG9jVHlwZTogZXZlbnQudGFyZ2V0LnZhbHVlfSk7XG4gICAgfSBlbHNlIGlmIChpdGVtPT09J2RvbmUnKSB7XG4gICAgICB2YXIgb250b2xvZ3kgPSB0aGlzLnN0YXRlLm9udG9sb2d5O1xuICAgICAgb250b2xvZ3lbdGhpcy5zdGF0ZS50ZW1wRG9jVHlwZV0gPSB0aGlzLnN0YXRlLnJlbW90ZU9udG9sb2d5W3RoaXMuc3RhdGUuc2VsZWN0U2NoZW1lXTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe29udG9sb2d5Om9udG9sb2d5LCBkb2NUeXBlOnRoaXMuc3RhdGUudGVtcERvY1R5cGV9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ01vZGFsT250b2xvZ3ksY2hhbmdlSW1wb3J0OiBnZXQgYmFkIGl0ZW06IHwnK2l0ZW0rJ3wnKTtcbiAgICB9XG4gIH1cblxuICBjaGFuZ2UgPSAoZXZlbnQscm93LGNvbHVtbikgPT57XG4gICAgLyoqIGNoYW5nZSBpbiBmb3JtIG9mIHRoaXMgc3BlY2lmaWMgIGRvY3R5cGUgKiovXG4gICAgdmFyIG9udG9sb2d5ID0gdGhpcy5zdGF0ZS5vbnRvbG9neTtcbiAgICBpZiAocm93PT0tMikgeyAgICAvL2NoYW5nZSBkb2NUeXBlXG4gICAgICBpZiAoY29sdW1uPT09J2RvY3R5cGUnKSB7ICAvL2NoYW5nZSB0aGUgbmFtZSBvZiB0aGUgZG9jVHlwZVxuICAgICAgICB2YXIgbmV3U3RyaW5nID0gZXZlbnQudGFyZ2V0LnZhbHVlLnJlcGxhY2UoL15bX3hcXGRdfFxcc3xcXFcvZywnJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dGVtcERvY1R5cGU6IG5ld1N0cmluZ30pO1xuICAgICAgfVxuICAgICAgZWxzZSB7ICAgIC8vcHJlc3NlZCBcIkNyZWF0ZVwiIGJ1dHRvbiBhZnRlciBlbnRlcmluZyBkb2N0eXBlIG5hbWVcbiAgICAgICAgdmFyIGRvY1R5cGUgPSB0aGlzLnN0YXRlLnRlbXBEb2NUeXBlO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5kb2NUeXBlPT0nLS1hZGROZXctLScpIHtcbiAgICAgICAgICBvbnRvbG9neVtkb2NUeXBlXSA9IHRoaXMuZGVmYXVsdFByb3BlcnRpZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHBhcmVudERvY1R5cGUgPSB0aGlzLnN0YXRlLmRvY1R5cGUuc2xpY2UoMTEpO1xuICAgICAgICAgIGRvY1R5cGUgPSBwYXJlbnREb2NUeXBlKycvJyt0aGlzLnN0YXRlLnRlbXBEb2NUeXBlO1xuICAgICAgICAgIG9udG9sb2d5W2RvY1R5cGVdID0gWy4uLm9udG9sb2d5W3BhcmVudERvY1R5cGVdXTsgIC8vZGVlcCBhcnJheSBjb3B5XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZG9jVHlwZTpkb2NUeXBlLCB0ZW1wRG9jVHlwZTonJ30pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAocm93PT0tMSkgeyAvL3NlbGVjdCBhZGRSb3cgb3IgYWRkSGVhZGluZ1xuICAgICAgaWYgKGNvbHVtbj09PSdhZGRSb3cnKVxuICAgICAgICBvbnRvbG9neVt0aGlzLnN0YXRlLmRvY1R5cGVdID0gb250b2xvZ3lbdGhpcy5zdGF0ZS5kb2NUeXBlXS5jb25jYXQoe25hbWU6Jyd9KTtcbiAgICAgIGlmIChjb2x1bW49PT0nYWRkSGVhZGluZycpXG4gICAgICAgIG9udG9sb2d5W3RoaXMuc3RhdGUuZG9jVHlwZV0gPSBvbnRvbG9neVt0aGlzLnN0YXRlLmRvY1R5cGVdLmNvbmNhdCh7aGVhZGluZzonICd9KTtcbiAgICAgIGlmIChjb2x1bW49PT0nYWRkQXR0YWNobWVudCcpXG4gICAgICAgIG9udG9sb2d5W3RoaXMuc3RhdGUuZG9jVHlwZV0gPSBvbnRvbG9neVt0aGlzLnN0YXRlLmRvY1R5cGVdLmNvbmNhdCh7YXR0YWNobWVudDonICd9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGNvbHVtbj09J2RlbGV0ZScpIHtcbiAgICAgICAgb250b2xvZ3lbdGhpcy5zdGF0ZS5kb2NUeXBlXS5zcGxpY2Uocm93LDEpOyAvL2RlbGV0ZSByb3cgaW4gYXJyYXlcbiAgICAgIH0gZWxzZSBpZiAoY29sdW1uPT0ndXAnKSB7XG4gICAgICAgIGlmIChyb3c9PTApIC8vZG8gbm90aGluZ1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgb250b2xvZ3lbdGhpcy5zdGF0ZS5kb2NUeXBlXS5zcGxpY2Uocm93LTEsIDAsICBvbnRvbG9neVt0aGlzLnN0YXRlLmRvY1R5cGVdW3Jvd10pO1xuICAgICAgICBvbnRvbG9neVt0aGlzLnN0YXRlLmRvY1R5cGVdLnNwbGljZShyb3crMSwxKTsgIC8vZGVsZXRlIHJvdysxXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LnR5cGU9PT0nY2hlY2tib3gnKVxuICAgICAgICAgIG9udG9sb2d5W3RoaXMuc3RhdGUuZG9jVHlwZV1bcm93XVtjb2x1bW5dID0gIW9udG9sb2d5W3RoaXMuc3RhdGUuZG9jVHlwZV1bcm93XVtjb2x1bW5dO1xuICAgICAgICBlbHNlIGlmIChjb2x1bW49PSduYW1lJykge1xuICAgICAgICAgIHZhciBuZXdTdHJpbmcyID0gZXZlbnQudGFyZ2V0LnZhbHVlLnJlcGxhY2UoL15bX1xcZF18XFxzfFteYS16QS1aMC05Xy9dL2csJycpOyAgLy93aGljaCBuYW1lcyBhcmUgYWxsb3dlZFxuICAgICAgICAgIG5ld1N0cmluZzIgPSBuZXdTdHJpbmcyLmNoYXJBdCgwKS50b0xvd2VyQ2FzZSgpICsgbmV3U3RyaW5nMi5zbGljZSgxKTsgLy9mb3JjZSBmaXJzdCBsZXR0ZXIgdG8gc21hbGxcbiAgICAgICAgICBvbnRvbG9neVt0aGlzLnN0YXRlLmRvY1R5cGVdW3Jvd11bY29sdW1uXSA9IG5ld1N0cmluZzI7XG4gICAgICAgIH0gZWxzZVxuICAgICAgICAgIG9udG9sb2d5W3RoaXMuc3RhdGUuZG9jVHlwZV1bcm93XVtjb2x1bW5dID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtvbnRvbG9neTogb250b2xvZ3l9KTtcbiAgfVxuXG5cbiAgLyoqIGNyZWF0ZSBodG1sLXN0cnVjdHVyZTsgYWxsIHNob3VsZCByZXR1cm4gYXQgbGVhc3QgPGRpdj48L2Rpdj4gKiovXG4gIHNob3dUeXBlU2VsZWN0b3IoKXtcbiAgICAvKiBzaG93IHR5cGUgc2VsZWN0b3IgaW5jbC4gZGVsZXRlIGJ1dHRvbiAqL1xuICAgIHZhciBsaXN0VHlwZXMgPSBPYmplY3Qua2V5cyh0aGlzLnN0YXRlLm9udG9sb2d5KTtcbiAgICBsaXN0VHlwZXMgICAgID0gbGlzdFR5cGVzLmZpbHRlcigoaXRlbSk9PntyZXR1cm4gaXRlbVswXSE9J18nICYmIGl0ZW1bMF0hPSctJzt9KTtcbiAgICBsaXN0VHlwZXMuc29ydCgpO1xuICAgIHZhciBvcHRpb25zID0gbGlzdFR5cGVzLm1hcCgoaXRlbSk9PntcbiAgICAgIGlmIChpdGVtWzBdPT0neCcpXG4gICAgICAgIHJldHVybiAoPE1lbnVJdGVtIHZhbHVlPXtpdGVtfSBrZXk9e2l0ZW19PlN0cnVjdHVyZSBsZXZlbCB7cGFyc2VJbnQoaXRlbVsxXSkrMX08L01lbnVJdGVtPik7XG4gICAgICByZXR1cm4gKDxNZW51SXRlbSB2YWx1ZT17aXRlbX0ga2V5PXtpdGVtfT57aXRlbX08L01lbnVJdGVtPik7XG4gICAgfSk7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMuY29uY2F0KFxuICAgICAgPE1lbnVJdGVtIGtleT0nLS1hZGROZXctLScgdmFsdWU9Jy0tYWRkTmV3LS0nPlxuICAgICAgICB7Jy0tIEFkZCBuZXcgLS0nfVxuICAgICAgPC9NZW51SXRlbT4pO1xuICAgIG9wdGlvbnMgPSBvcHRpb25zLmNvbmNhdChcbiAgICAgIDxNZW51SXRlbSBrZXk9Jy0taW1wb3J0TmV3JyB2YWx1ZT0nLS1pbXBvcnROZXctLSc+XG4gICAgICAgIHsnLS0gSW1wb3J0IGZyb20gc2VydmVyIC0tJ31cbiAgICAgIDwvTWVudUl0ZW0+KTtcbiAgICBjb25zdCBudW1IaWVyYXJjaHlEb2NUeXBlcyA9IGxpc3RUeXBlcy5maWx0ZXIoKGl0ZW0pPT57cmV0dXJuIGl0ZW1bMF09PSd4Jzt9KS5sZW5ndGg7XG4gICAgY29uc3QgYWxsb3dEZWxldGUgPSAhKHRoaXMuc3RhdGUuZG9jVHlwZVsxXSE9bnVtSGllcmFyY2h5RG9jVHlwZXMtMSAmJiB0aGlzLnN0YXRlLmRvY1R5cGVbMF09PSd4Jyk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYga2V5PSd0eXBlU2VsZWN0b3InIGNsYXNzTmFtZT0nY29udGFpbmVyLWZsdWlkJz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J3Jvdyc+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS0yIHRleHQtcmlnaHQgcHQtMic+XG4gICAgICAgICAgICBEYXRhIHR5cGVcbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8Rm9ybUNvbnRyb2wgZnVsbFdpZHRoIGNsYXNzTmFtZT0nY29sLXNtLTQnPlxuICAgICAgICAgICAgPFNlbGVjdCBvbkNoYW5nZT17ZT0+dGhpcy5jaGFuZ2VUeXBlU2VsZWN0b3IoZSwnZG9jdHlwZScpfVxuICAgICAgICAgICAgICB2YWx1ZT17KHRoaXMuc3RhdGUuZG9jVHlwZS5zbGljZSgwLDExKT09PSctLWFkZE5ld1N1YicpID8gJycgOiB0aGlzLnN0YXRlLmRvY1R5cGV9PlxuICAgICAgICAgICAgICB7b3B0aW9uc31cbiAgICAgICAgICAgIDwvU2VsZWN0PlxuICAgICAgICAgIDwvRm9ybUNvbnRyb2w+XG4gICAgICAgICAgPEZvcm1Db250cm9sIGZ1bGxXaWR0aCBjbGFzc05hbWU9J2NvbC1zbS0zIHAtMSc+XG4gICAgICAgICAgICA8SW5wdXQgcGxhY2Vob2xkZXI9J0xhYmVsJyB2YWx1ZT17dGhpcy5zdGF0ZS5kb2NMYWJlbHNbdGhpcy5zdGF0ZS5kb2NUeXBlXX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9e2U9PnRoaXMuY2hhbmdlKGUsbnVsbCwnbGFiZWwnKX0gIGtleT17J2xhYmVsX2RvY190eXBlJ30gLz5cbiAgICAgICAgICA8L0Zvcm1Db250cm9sPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wtc20tMSBwbC0yIHByLTAnPlxuICAgICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoZSkgPT4gdGhpcy5jaGFuZ2VUeXBlU2VsZWN0b3IoZSwnZGVsZXRlJyl9XG4gICAgICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIiBzdHlsZT17YnRufSBmdWxsV2lkdGggZGlzYWJsZWQ9eyFhbGxvd0RlbGV0ZX0+XG4gICAgICAgICAgICAgIERlbGV0ZVxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS0yIHBsLTIgcHItMCc+XG4gICAgICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJjb250YWluZWRcIiBzdHlsZT17YnRufSBmdWxsV2lkdGggZGlzYWJsZWQ9e3RoaXMuc3RhdGUuZG9jVHlwZS5zbGljZSgwLDIpPT0nLS0nfVxuICAgICAgICAgICAgICBvbkNsaWNrPXtlPT50aGlzLmNoYW5nZVR5cGVTZWxlY3RvcihlLCh0aGlzLnN0YXRlLmRvY1R5cGVbMF09PSd4JykgP1xuICAgICAgICAgICAgICAgICdhZGRTdHJ1Y3R1cmVMZXZlbCc6J2FkZFN1YlR5cGUnKX0+XG4gICAgICAgICAgICAgIDxBZGQgLz4mbmJzcDt7KHRoaXMuc3RhdGUuZG9jVHlwZVswXT09J3gnKT8gJ3N0cnVjdHVyZSBsZXZlbCc6ICdzdWJ0eXBlJ31cbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuXG4gIHNob3dGb3JtKCl7XG4gICAgLyogc2hvdyBmb3JtIHRvIGNoYW5nZSBvbnRvbG9neSovXG4gICAgdmFyIGxpc3RSb3dzID0gdGhpcy5zdGF0ZS5vbnRvbG9neVt0aGlzLnN0YXRlLmRvY1R5cGVdO1xuICAgIGlmIChsaXN0Um93cykge1xuICAgICAgbGlzdFJvd3MgPSBsaXN0Um93cy5tYXAoKGl0ZW0saWR4KT0+e1xuICAgICAgICBpZiAoIWl0ZW0ubmFtZSAmJiBpdGVtLmhlYWRpbmcpIHtcbiAgICAgICAgICAvL0lGIEhFQURJTkdcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBrZXk9eydyb3cnK2lkeC50b1N0cmluZygpfSBjbGFzc05hbWU9J3JvdyBwLTMnPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTIgcHQtMiBwbC0xJz48c3Ryb25nPkhlYWRpbmc8L3N0cm9uZz48L2Rpdj5cbiAgICAgICAgICAgICAgPEZvcm1Db250cm9sIGZ1bGxXaWR0aCBjbGFzc05hbWU9J2NvbC1zbS04Jz5cbiAgICAgICAgICAgICAgICA8SW5wdXQgcmVxdWlyZWQgcGxhY2Vob2xkZXI9J0hlYWRpbmcnIHZhbHVlPXtpdGVtLmhlYWRpbmd9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17ZT0+dGhpcy5jaGFuZ2UoZSxpZHgsJ2hlYWRpbmcnKX0gICAgIGtleT17J2hlYWRpbmcnK2lkeC50b1N0cmluZygpfSAvPlxuICAgICAgICAgICAgICA8L0Zvcm1Db250cm9sPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTInPlxuICAgICAgICAgICAgICAgIDxJY29uQnV0dG9uIG9uQ2xpY2s9eyhlKSA9PiB0aGlzLmNoYW5nZShlLGlkeCwndXAnKX1cbiAgICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiIGNsYXNzTmFtZT0nbXItMiBmbG9hdC1yaWdodCc+XG4gICAgICAgICAgICAgICAgICA8QXJyb3dVcHdhcmQvPlxuICAgICAgICAgICAgICAgIDwvSWNvbkJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8SWNvbkJ1dHRvbiBvbkNsaWNrPXsoZSkgPT4gdGhpcy5jaGFuZ2UoZSxpZHgsJ2RlbGV0ZScpfVxuICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCIgY2xhc3NOYW1lPSdmbG9hdC1yaWdodCc+XG4gICAgICAgICAgICAgICAgICA8RGVsZXRlLz5cbiAgICAgICAgICAgICAgICA8L0ljb25CdXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICghaXRlbS5uYW1lICYmIGl0ZW0uYXR0YWNobWVudCkge1xuICAgICAgICAgIC8vSUYgQVRUQUNITUVOVFxuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGtleT17J3JvdycraWR4LnRvU3RyaW5nKCl9IGNsYXNzTmFtZT0ncm93IHAtMyc+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wtc20tMiBwdC0yIHBsLTEnPjxzdHJvbmc+QXR0YWNobWVudDwvc3Ryb25nPjwvZGl2PlxuICAgICAgICAgICAgICA8Rm9ybUNvbnRyb2wgZnVsbFdpZHRoIGNsYXNzTmFtZT0nY29sLXNtLTQgcC0xJz5cbiAgICAgICAgICAgICAgICA8SW5wdXQgcmVxdWlyZWQgcGxhY2Vob2xkZXI9J05hbWUnIHZhbHVlPXtpdGVtLmF0dGFjaG1lbnR9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17ZT0+dGhpcy5jaGFuZ2UoZSxpZHgsJ2F0dGFjaG1lbnQnKX0gICAgIGtleT17J2F0dGFjaG1lbnQnK2lkeC50b1N0cmluZygpfSAvPlxuICAgICAgICAgICAgICA8L0Zvcm1Db250cm9sPlxuICAgICAgICAgICAgICA8Rm9ybUNvbnRyb2wgZnVsbFdpZHRoIGNsYXNzTmFtZT0nY29sLXNtLTQgcC0xJz5cbiAgICAgICAgICAgICAgICA8SW5wdXQgcmVxdWlyZWQgcGxhY2Vob2xkZXI9J2RvYy10eXBlLiBMZWF2ZSBlbXB0eSwgaWYgdGhpcyBpcyBhbiBpc3N1ZS1ib2FyZCdcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtpdGVtLmRvY1R5cGU/aXRlbS5kb2NUeXBlOicnfSBvbkNoYW5nZT17ZT0+dGhpcy5jaGFuZ2UoZSxpZHgsJ2RvY1R5cGUnKX1cbiAgICAgICAgICAgICAgICAgIGtleT17J2RvY1R5cGUnK2lkeC50b1N0cmluZygpfSAvPlxuICAgICAgICAgICAgICA8L0Zvcm1Db250cm9sPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTInPlxuICAgICAgICAgICAgICAgIDxJY29uQnV0dG9uIG9uQ2xpY2s9eyhlKSA9PiB0aGlzLmNoYW5nZShlLGlkeCwndXAnKX1cbiAgICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiIGNsYXNzTmFtZT0nbXItMiBmbG9hdC1yaWdodCcgPlxuICAgICAgICAgICAgICAgICAgPEFycm93VXB3YXJkLz5cbiAgICAgICAgICAgICAgICA8L0ljb25CdXR0b24+XG4gICAgICAgICAgICAgICAgPEljb25CdXR0b24gb25DbGljaz17KGUpID0+IHRoaXMuY2hhbmdlKGUsaWR4LCdkZWxldGUnKX1cbiAgICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiIGNsYXNzTmFtZT0nZmxvYXQtcmlnaHQnPlxuICAgICAgICAgICAgICAgICAgPERlbGV0ZS8+XG4gICAgICAgICAgICAgICAgPC9JY29uQnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy9JRiBOT1QgSEVBRElORywgbm9yIGF0dGFjaG1lbnRcbiAgICAgICAgICByZXR1cm4oXG4gICAgICAgICAgICA8ZGl2IGtleT17J3JvdycraWR4LnRvU3RyaW5nKCl9IGNsYXNzTmFtZT0ncm93IHB4LTMnPlxuICAgICAgICAgICAgICA8Rm9ybUNvbnRyb2wgZnVsbFdpZHRoIGNsYXNzTmFtZT0nY29sLXNtLTIgcC0xJz5cbiAgICAgICAgICAgICAgICA8SW5wdXQgcmVxdWlyZWQgcGxhY2Vob2xkZXI9J05hbWUnIHZhbHVlPXtpdGVtLm5hbWV9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17ZT0+dGhpcy5jaGFuZ2UoZSxpZHgsJ25hbWUnKX0gICAgIGtleT17J25hbWUnK2lkeC50b1N0cmluZygpfSAvPlxuICAgICAgICAgICAgICA8L0Zvcm1Db250cm9sPlxuICAgICAgICAgICAgICA8Rm9ybUNvbnRyb2wgZnVsbFdpZHRoIGNsYXNzTmFtZT0nY29sLXNtLTQgcC0xJz5cbiAgICAgICAgICAgICAgICA8SW5wdXQgcGxhY2Vob2xkZXI9J1F1ZXN0aW9ucyAoa2VlcCBlbXB0eSB0byBjcmVhdGUgYXV0b21hdGljYWxseSknXG4gICAgICAgICAgICAgICAgICB2YWx1ZT17aXRlbS5xdWVyeT9pdGVtLnF1ZXJ5OicnfSBvbkNoYW5nZT17ZT0+dGhpcy5jaGFuZ2UoZSxpZHgsJ3F1ZXJ5Jyl9XG4gICAgICAgICAgICAgICAgICBrZXk9eydxdWVyeScraWR4LnRvU3RyaW5nKCl9IC8+XG4gICAgICAgICAgICAgIDwvRm9ybUNvbnRyb2w+XG4gICAgICAgICAgICAgIDxGb3JtQ29udHJvbCBmdWxsV2lkdGggY2xhc3NOYW1lPSdjb2wtc20tNCBwLTEnPlxuICAgICAgICAgICAgICAgIDxJbnB1dCBwbGFjZWhvbGRlcj0nSXMgdGhpcyBhIGxpc3Q/ICgsIHNlcGFyYXRlZCknIHZhbHVlPXtpdGVtLmxpc3Q/aXRlbS5saXN0OicnfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e2U9PnRoaXMuY2hhbmdlKGUsaWR4LCdsaXN0Jyl9ICAgICBrZXk9eydsaXN0JytpZHgudG9TdHJpbmcoKX0gLz5cbiAgICAgICAgICAgICAgPC9Gb3JtQ29udHJvbD5cbiAgICAgICAgICAgICAgPGRpdiBrZXk9eydzdWJyb3cnK2lkeC50b1N0cmluZygpfSBjbGFzc05hbWU9J2NvbC1zbS0yIHJvdyBwbC0yIHByLTAnPlxuICAgICAgICAgICAgICAgIDxDaGVja2JveCBjbGFzc05hbWU9J2NvbC1zbS0zJ1xuICAgICAgICAgICAgICAgICAgY2hlY2tlZD17aXRlbS5yZXF1aXJlZD9pdGVtLnJlcXVpcmVkOmZhbHNlfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e2U9PnRoaXMuY2hhbmdlKGUsaWR4LCdyZXF1aXJlZCcpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPEZvcm1Db250cm9sIGZ1bGxXaWR0aCBjbGFzc05hbWU9J2NvbC1zbS02IHAtMSc+XG4gICAgICAgICAgICAgICAgICA8SW5wdXQgcGxhY2Vob2xkZXI9J20nIHZhbHVlPXtpdGVtLnVuaXQ/aXRlbS51bml0OicnfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17ZT0+dGhpcy5jaGFuZ2UoZSxpZHgsJ3VuaXQnKX0gICAgIGtleT17J3VuaXQnK2lkeC50b1N0cmluZygpfSAvPlxuICAgICAgICAgICAgICAgIDwvRm9ybUNvbnRyb2w+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS0zIHB4LTAnPlxuICAgICAgICAgICAgICAgICAgPEljb25CdXR0b24gb25DbGljaz17KGUpID0+IHRoaXMuY2hhbmdlKGUsaWR4LCdkZWxldGUnKX1cbiAgICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCI+XG4gICAgICAgICAgICAgICAgICAgIDxEZWxldGUvPlxuICAgICAgICAgICAgICAgICAgPC9JY29uQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPEljb25CdXR0b24gb25DbGljaz17KGUpID0+IHRoaXMuY2hhbmdlKGUsaWR4LCd1cCcpfVxuICAgICAgICAgICAgICAgICAgICBzaXplPVwic21hbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgPEFycm93VXB3YXJkLz5cbiAgICAgICAgICAgICAgICAgIDwvSWNvbkJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj4pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuICg8ZGl2PlxuICAgICAge2xpc3RSb3dzICYmXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdyb3cgbXQtNSBweC0zJz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTIgcGwtMSc+TmFtZTo8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTQgcGwtMSc+UXVlcnk6PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS00IHBsLTEnPkxpc3Q6PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS0yIHJvdyc+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTMgbWwtMCBwbC0wJz5SZXF1aXJlZDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS02IHBsLTEnPlVuaXQ6PC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgfVxuICAgICAge2xpc3RSb3dzfVxuICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoZSkgPT4gdGhpcy5jaGFuZ2UoZSwtMSwnYWRkUm93Jyl9XG4gICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIiBjbGFzc05hbWU9J2NvbC1zbS0xIG10LTQnIHN0eWxlPXtidG59IGlkPSdvbnRvbG9neUFkZFJvdyc+XG4gICAgICAgIDxBZGQgLz4mbmJzcDtyb3dcbiAgICAgIDwvQnV0dG9uPlxuICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoZSkgPT4gdGhpcy5jaGFuZ2UoZSwtMSwnYWRkSGVhZGluZycpfVxuICAgICAgICB2YXJpYW50PVwiY29udGFpbmVkXCIgY2xhc3NOYW1lPSdjb2wtc20tMSBtbC0yIG10LTQnIHN0eWxlPXtidG59IGlkPSdvbnRvbG9neUFkZEhlYWRpbmcnPlxuICAgICAgICA8QWRkIC8+Jm5ic3A7aGVhZGluZ1xuICAgICAgPC9CdXR0b24+XG4gICAgICA8QnV0dG9uIG9uQ2xpY2s9eyhlKSA9PiB0aGlzLmNoYW5nZShlLC0xLCdhZGRBdHRhY2htZW50Jyl9XG4gICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIiBjbGFzc05hbWU9J2NvbC1zbS0xIG1sLTIgbXQtNCcgc3R5bGU9e2J0bn0gIGlkPSdvbnRvbG9neUFkZEF0dGFjaCc+XG4gICAgICAgIDxBZGQgLz4mbmJzcDthdHRhY2htZW50XG4gICAgICA8L0J1dHRvbj5cbiAgICA8L2Rpdj4pO1xuICB9XG5cbiAgc2hvd0NyZWF0ZURvY3R5cGUoZG9jdHlwZSl7XG4gICAgLyogY3JlYXRlIGEgbmV3IGRvY3R5cGUgZm9ybSovXG4gICAgdmFyIGxpbmVIZWFkZXIgPSBudWxsO1xuICAgIGlmIChkb2N0eXBlLnNsaWNlKDAsMTEpPT0nLS1hZGROZXdTdWInKSB7XG4gICAgICBsaW5lSGVhZGVyID0gZG9jdHlwZS5zbGljZSgxMSkrJyAvICc7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93IHB0LTUnPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTIgdGV4dC1yaWdodCBwdC0yIHByLTAnPlxuICAgICAgICAgIE5hbWU6IHtsaW5lSGVhZGVyICYmIDxzdHJvbmc+e2xpbmVIZWFkZXJ9PC9zdHJvbmc+fVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPEZvcm1Db250cm9sIGZ1bGxXaWR0aCBjbGFzc05hbWU9J2NvbC1zbS00IG1sLTMgcC0xJz5cbiAgICAgICAgICA8SW5wdXQgcGxhY2Vob2xkZXI9J0RvY3VtZW50IHR5cGUnIHZhbHVlPXt0aGlzLnN0YXRlLnRlbXBEb2NUeXBlfVxuICAgICAgICAgICAgb25DaGFuZ2U9e2U9PnRoaXMuY2hhbmdlKGUsLTIsJ2RvY3R5cGUnKX0gICAgIGtleT0nZG9jdHlwZScgLz5cbiAgICAgICAgPC9Gb3JtQ29udHJvbD5cbiAgICAgICAgPEFsZXJ0IGNsYXNzTmFtZT0nY29sLXNtLTQnIHNldmVyaXR5PSdpbmZvJz5cbiAgICAgICAgICBTaW5nbGUgY2FzZSBvZiB0eXBlIG5hbWUhXG4gICAgICAgIDwvQWxlcnQ+XG4gICAgICAgIDxCdXR0b24gb25DbGljaz17KGUpID0+IHRoaXMuY2hhbmdlKGUsLTIsJ2RvbmUnKX0gdmFyaWFudD1cImNvbnRhaW5lZFwiXG4gICAgICAgICAgY2xhc3NOYW1lPSdjb2wtc20tMSBtLTInIHN0eWxlPXtidG59PlxuICAgICAgICAgIENyZWF0ZVxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBzaG93SW1wb3J0KCl7XG4gICAgLyogZm9ybSBmb3IgZ2V0dGluZyBvbnRvbG9neSBmcm9tIHJlbW90ZSBzZXJ2ZXIqL1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93IHB5LTUnPlxuICAgICAgICA8ZGl2IGtleT0ndHlwZVNlbGVjdG9yJyBjbGFzc05hbWU9J2NvbnRhaW5lci1mbHVpZCc+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3JvdyBtdC0xJz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wtc20tMyB0ZXh0LXJpZ2h0IHB0LTInPkNvbGxlY3Rpb246PC9kaXY+XG4gICAgICAgICAgICA8Rm9ybUNvbnRyb2wgZnVsbFdpZHRoIGNsYXNzTmFtZT0nY29sLXNtLTgnPlxuICAgICAgICAgICAgICA8U2VsZWN0IG9uQ2hhbmdlPXtlPT50aGlzLmNoYW5nZUltcG9ydChlLCdjb2xsZWN0aW9uJyl9IHZhbHVlPXt0aGlzLnN0YXRlLnNlbGVjdENvbGxlY3Rpb259PlxuICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLmxpc3RDb2xsZWN0aW9ucy5tYXAoKGl0ZW0pPT57XG4gICAgICAgICAgICAgICAgICByZXR1cm4gKDxNZW51SXRlbSBrZXk9e2l0ZW19IHZhbHVlPXtpdGVtfT57aXRlbX08L01lbnVJdGVtPik7XG4gICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgIDwvU2VsZWN0PlxuICAgICAgICAgICAgPC9Gb3JtQ29udHJvbD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wtc20tMyB0ZXh0LXJpZ2h0IG15LTMgcHQtMic+U2NoZW1lOjwvZGl2PlxuICAgICAgICAgICAgPEZvcm1Db250cm9sIGZ1bGxXaWR0aCBjbGFzc05hbWU9J2NvbC1zbS04IG15LTMnPlxuICAgICAgICAgICAgICB7T2JqZWN0LmtleXModGhpcy5zdGF0ZS5yZW1vdGVPbnRvbG9neSkubGVuZ3RoPjAmJlxuICAgICAgICAgICAgICAgIDxTZWxlY3Qgb25DaGFuZ2U9e2U9PnRoaXMuY2hhbmdlSW1wb3J0KGUsJ3NjaGVtZScpfSB2YWx1ZT17dGhpcy5zdGF0ZS5zZWxlY3RTY2hlbWV9PlxuICAgICAgICAgICAgICAgICAge09iamVjdC5rZXlzKHRoaXMuc3RhdGUucmVtb3RlT250b2xvZ3kpLm1hcCgoaXRlbSk9PntcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8TWVudUl0ZW0ga2V5PXtpdGVtfSB2YWx1ZT17aXRlbX0+e2l0ZW19PC9NZW51SXRlbT4pO1xuICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgPC9TZWxlY3Q+XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDwvRm9ybUNvbnRyb2w+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTMgdGV4dC1yaWdodCBwdC0yJz5TYXZlIGFzIHR5cGU6PC9kaXY+XG4gICAgICAgICAgICA8Rm9ybUNvbnRyb2wgZnVsbFdpZHRoIGNsYXNzTmFtZT0nY29sLXNtLTcgcC0xIHByLTMnPlxuICAgICAgICAgICAgICA8SW5wdXQgcGxhY2Vob2xkZXI9J0RvY3VtZW50IHR5cGUnIHZhbHVlPXt0aGlzLnN0YXRlLnRlbXBEb2NUeXBlfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtlPT50aGlzLmNoYW5nZUltcG9ydChlLCdkb2N0eXBlJyl9ICAgICBrZXk9J2RvY3R5cGUnIC8+XG4gICAgICAgICAgICA8L0Zvcm1Db250cm9sPlxuICAgICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoZSkgPT4gdGhpcy5jaGFuZ2VJbXBvcnQoZSwnZG9uZScpfSB2YXJpYW50PVwiY29udGFpbmVkXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPSdjb2wtc20tMSBtLTInIHN0eWxlPXtidG59PlxuICAgICAgICAgICAgICBJbXBvcnRcbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuXG4gIC8qKiB0aGUgcmVuZGVyIG1ldGhvZCAqKi9cbiAgcmVuZGVyKCl7XG4gICAgaWYgKHRoaXMucHJvcHMuc2hvdz09PSdub25lJykge1xuICAgICAgcmV0dXJuKDxkaXY+PC9kaXY+KTtcbiAgICB9XG4gICAgY29uc3Qgb250b2xvZ3lMb2FkZWQgPSAodGhpcy5zdGF0ZS5vbnRvbG9neS5faWQgJiYgdGhpcy5zdGF0ZS5vbnRvbG9neS5faWQ9PSctb250b2xvZ3ktJyk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibW9kYWxcIiBzdHlsZT17ey4uLm1vZGFsLCBkaXNwbGF5OiB0aGlzLnByb3BzLnNob3d9fT5cbiAgICAgICAgPE1vZGFsSGVscCAvPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1vZGFsLWNvbnRlbnRcIiBzdHlsZT17bW9kYWxDb250ZW50fT5cbiAgICAgICAgICB7Lyo9PT09PT09UEFHRSBIRUFESU5HPT09PT09PSovfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29sXCIgc3R5bGU9e2J0blN0cm9uZ30+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvdyBweS0zXCI+XG4gICAgICAgICAgICAgIDxoMSBjbGFzc05hbWU9J2NvbC1zbS04IHAtMiBweC0zJz5FZGl0IHF1ZXN0aW9ubmFpcmVzPC9oMT5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS0xIHAtMicgPlxuICAgICAgICAgICAgICAgIDxCdXR0b24gZnVsbFdpZHRoIG9uQ2xpY2s9eygpID0+IHRoaXMucHJlc3NlZExvYWRCdG4oKX0gdmFyaWFudD1cImNvbnRhaW5lZFwiXG4gICAgICAgICAgICAgICAgICBzdHlsZT17YnRufSBpZD0nb250b2xvZ3lMb2FkQnRuJz5cbiAgICAgICAgICAgICAgICAgIExvYWRcbiAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wtc20tMSBwLTInPlxuICAgICAgICAgICAgICAgIDxCdXR0b24gZnVsbFdpZHRoIG9uQ2xpY2s9eygpID0+IHRoaXMucHJlc3NlZFNhdmVCdG4oKX0gdmFyaWFudD1cImNvbnRhaW5lZFwiXG4gICAgICAgICAgICAgICAgICBzdHlsZT17b250b2xvZ3lMb2FkZWQgPyBidG5XYXJuaW5nIDogYnRuU3Ryb25nRGVhY3RpdmV9IGRpc2FibGVkPXshb250b2xvZ3lMb2FkZWR9PlxuICAgICAgICAgICAgICAgICAgU2F2ZVxuICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS0xIHAtMic+XG4gICAgICAgICAgICAgICAgPEJ1dHRvbiBmdWxsV2lkdGggb25DbGljaz17KCkgPT4gQWN0aW9ucy5zaG93SGVscCgnb250b2xvZ3knKX0gdmFyaWFudD1cImNvbnRhaW5lZFwiXG4gICAgICAgICAgICAgICAgICBpZD0naGVscEJ0bicgc3R5bGU9e2J0bn0+XG4gICAgICAgICAgICAgICAgICBIZWxwXG4gICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTEgcC0yIHByLTMnPlxuICAgICAgICAgICAgICAgIDxCdXR0b24gZnVsbFdpZHRoIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe29udG9sb2d5Ont9fSk7XG4gICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNhbGxiYWNrKCdjYW5jZWwnKTtcbiAgICAgICAgICAgICAgICB9fSB2YXJpYW50PVwiY29udGFpbmVkXCIgaWQ9J2Nsb3NlQnRuJyBzdHlsZT17YnRufT5cbiAgICAgICAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHt0aGlzLnN0YXRlLmVycm9yICYmIDxBbGVydCBzZXZlcml0eT1cImVycm9yXCIga2V5PSdhbGVydCc+XG4gICAgICAgICAgICA8c3Ryb25nPnt0aGlzLnN0YXRlLmVycm9yfTwvc3Ryb25nPlxuICAgICAgICAgIDwvQWxlcnQ+fVxuICAgICAgICAgIHsvKj09PT09PT1DT05URU5UPT09PT09PSovfVxuICAgICAgICAgIHshb250b2xvZ3lMb2FkZWQgJiYgICAgIDxoNCBjbGFzc05hbWU9J20tMyc+U3RhcnQgYnkgbG9hZGluZyBjdXJyZW50IG9udG9sb2d5LjwvaDQ+fVxuICAgICAgICAgIHshdGhpcy5zdGF0ZS5kb2NUeXBlICYmIDxoNCBjbGFzc05hbWU9J20tMyc+T250b2xvZ3kgaXMgaW5jb3JyZWN0LjwvaDQ+fVxuICAgICAgICAgIHtvbnRvbG9neUxvYWRlZCAmJiB0aGlzLnN0YXRlLmRvY1R5cGUgJiYgPGRpdiBjbGFzc05hbWU9XCJmb3JtLXBvcHVwIG0tMlwiID5cbiAgICAgICAgICAgIDxmb3JtIGNsYXNzTmFtZT1cImZvcm0tY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgIHt0aGlzLnN0YXRlLmRvY1R5cGUuc2xpY2UoMCw4KSE9Jy0tYWRkTmV3JyAgICAgJiYgdGhpcy5zaG93VHlwZVNlbGVjdG9yKCl9XG4gICAgICAgICAgICAgIHt0aGlzLnN0YXRlLmRvY1R5cGU9PSctLWltcG9ydE5ldy0tJyAgICAgICAgICAgJiYgdGhpcy5zaG93SW1wb3J0KCl9XG4gICAgICAgICAgICAgIHt0aGlzLnN0YXRlLmRvY1R5cGU9PSctLWFkZE5ldy0tJyAgICAgICAgICAgICAgJiYgdGhpcy5zaG93Q3JlYXRlRG9jdHlwZSgnLS1iYXNldHlwZS0tJyl9XG4gICAgICAgICAgICAgIHt0aGlzLnN0YXRlLmRvY1R5cGUuc2xpY2UoMCwxMSk9PSctLWFkZE5ld1N1YicgJiYgdGhpcy5zaG93Q3JlYXRlRG9jdHlwZSh0aGlzLnN0YXRlLmRvY1R5cGUpfVxuICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5kb2NUeXBlLnNsaWNlKDAsMikgIT0nLS0nICAgICAgICAgICYmIHRoaXMuc2hvd0Zvcm0oKX1cbiAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICA8L2Rpdj59XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuIl0sImZpbGUiOiJyZW5kZXJlci9jb21wb25lbnRzL01vZGFsT250b2xvZ3kuanMifQ==
