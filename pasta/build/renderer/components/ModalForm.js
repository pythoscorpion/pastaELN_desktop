"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _core = require("@material-ui/core");

var _lab = require("@material-ui/lab");

var _reactMarkdownEditorLite = _interopRequireDefault(require("react-markdown-editor-lite"));

var _reactMarkdown = _interopRequireDefault(require("react-markdown"));

var _Store = _interopRequireDefault(require("../Store"));

var Actions = _interopRequireWildcard(require("../Actions"));

var _Dispatcher = _interopRequireDefault(require("../Dispatcher"));

var _style = require("../style");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* Modal shown for new items and edit of existing items
*/
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
class ModalForm extends _react.Component {
  constructor() {
    super();

    this.handleActions = action => {
      //Modal show; first function
      if (action.type === 'SHOW_FORM') {
        //CREATE AND USE ONTOLOGY-NODE: which rows exist, are they required, are they a list
        var ontologyNode = null;
        if (typeof action.ontologyNode == 'string') //know docType/subDocType
          ontologyNode = _Store.default.getOntologyNode(action.ontologyNode);else if (action.ontologyNode) //data delivered by action: hierarchy tree items from project
          ontologyNode = action.ontologyNode;else ontologyNode = _Store.default.getOntologyNode(); //default case

        ontologyNode.map(item => {
          if (item.required && item && item.name && (!action.doc || !action.doc[item.name])) //if required and not already filled
            this.setState({
              disableSubmit: true
            });
        }); //create values

        var values = {};
        var originalDoc = {};

        var docType = _Store.default.getDocType();

        if (action.kind == 'new') {
          if (!action.doc && docType != 'x0') ontologyNode = [{
            name: '_project',
            query: 'Which project does it belong to?',
            list: 'x0'
          }].concat(ontologyNode);
          ontologyNode.forEach(item => {
            if (item.name && !values[item.name]) values[item.name] = '';
          });

          if (action.doc) {
            values['type'] = action.doc['-type'];
            originalDoc = action.doc;
          } else if (typeof action.ontologyNode == 'string') {
            originalDoc['type'] = action.ontologyNode.split('/');
          }
        } else {
          if (action.doc) {
            values = action.doc;
            originalDoc = { ...values
            };
            ['id', 'parent', 'delete', 'path', 'docID'].map(item => {
              delete values[item];
            });
          } else {
            values = _Store.default.getDocumentRaw();
            originalDoc = values;
          } //add items that are in document but not in ontologyNode


          Object.keys(values).map(item => {
            const inOntologyNode = ontologyNode.map(i => {
              return i.name;
            }).indexOf(item) > -1;

            if (!inOntologyNode && _Store.default.itemSkip.indexOf(item) == -1 && _Store.default.itemDB.indexOf(item) == -1) {
              ontologyNode.push({
                name: item,
                unit: '',
                required: false,
                list: null
              });
            }
          });
        }

        ontologyNode = ontologyNode.filter(i => {
          return _Store.default.itemSkip.indexOf(i.name) == -1 || i.name == 'content';
        }); //filter-out things like image

        this.setState({
          values: values,
          kind: action.kind,
          ontologyNode: ontologyNode,
          doc: originalDoc,
          show: 'block',
          docType: docType
        });
      }
    };

    this.submit = type => {
      /* submit button clicked */
      var values = this.state.values;
      if (this.state.doc && this.state.doc['-type']) values['-type'] = this.state.doc['-type'];

      if (values['-type'] && values['-type'][0][0] == 'x' && values['-type'][0] != 'x0' && !/^\w-\w{32}$/.test(values._id)) {
        Actions.changeTextDoc(values, this.state.doc); //create/change information in Project.js only
      } else {
        if (this.state.kind === 'new') {
          //case new document
          Actions.createDoc(values); //create/change in database
        } else {
          //case update document with existing docID, change in database
          Actions.updateDoc(values, this.state.doc);
        }
      }

      if (type == 'close') this.setState({
        show: 'none'
      });
    };

    this.change = (value, key) => {
      /* text field changes value */
      var values = this.state.values;
      if (typeof value === 'string' || value instanceof String) values[key] = value;else if ('text' in value) values[key] = value.text;else values[key] = value.target.value;
      var disableSubmit = false;
      this.state.ontologyNode.map(item => {
        if ((!this.state.values[item.name] || this.state.values[item.name].length == 0) && item.required) disableSubmit = true;
        if (item.list && typeof item.list === 'string' && !_Store.default.getDocsList(item.list)) disableSubmit = true;
      });
      this.setState({
        values: values,
        disableSubmit: disableSubmit
      });
    };

    this.setAdvanced = name => {
      /* change display ofr comment box */
      var advanced = this.state.advanced;
      advanced[name] = !advanced[name];
      this.setState({
        advanced: advanced
      });
    };

    this.compareDocs = (a, b) => {
      /* compare to docs (ids, names) by comparing names */
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    };

    this.state = {
      advanced: [false, false],
      //modal items
      dispatcherToken: null,
      show: 'none',
      kind: null,
      //new or edit
      doc: null,
      docType: null,
      //form items
      ontologyNode: null,
      values: {},
      disableSubmit: false
    };
  } //component mounted immediately, even if Modal not shown


  componentDidMount() {
    this.setState({
      dispatcherToken: _Dispatcher.default.register(this.handleActions)
    });
  }

  componentWillUnmount() {
    _Dispatcher.default.unregister(this.state.dispatcherToken);
  }
  /** Functions as class properties (immediately bound): react on user interactions **/


  /** create html-structure; all should return at least <div></div> **/
  showList() {
    /* list of html documents that make up the form */
    const items = this.state.ontologyNode.map((item, idx) => {
      if (item.attachment || item.name && item.name[0] == '-' && item.name != '-name') return /*#__PURE__*/_react.default.createElement("div", {
        key: idx.toString()
      });
      var text = item.name && ['_', '-'].includes(item.name[0]) ? item.name.slice(1) + ':' : item.name + ':';
      if (item.required) text += '  *'; // if selection box: returns <div></div>

      if (item.list) {
        var options = null;

        if (typeof item.list === 'string') {
          //doctype
          var docsList = _Store.default.getDocsList(item.list);

          if (!docsList) return /*#__PURE__*/_react.default.createElement(_lab.Alert, {
            severity: "warning",
            key: idx.toString()
          }, "Visit the following section: ", item.list.toUpperCase(), "S");
          docsList = docsList.sort(this.compareDocs);
          docsList = [{
            name: '- leave blank if no link created -',
            id: ''
          }].concat(docsList); //concat --- to list

          options = docsList.map(item => {
            return /*#__PURE__*/_react.default.createElement(_core.MenuItem, {
              value: item.id,
              key: item.id
            }, item.name);
          });
        } else {
          //lists defined by ontology
          options = item.list.map(item => {
            return /*#__PURE__*/_react.default.createElement(_core.MenuItem, {
              value: item,
              key: item
            }, item);
          });
        }

        return /*#__PURE__*/_react.default.createElement("div", {
          key: idx.toString(),
          className: "container-fluid"
        }, /*#__PURE__*/_react.default.createElement("div", {
          className: "row mt-1"
        }, /*#__PURE__*/_react.default.createElement("div", {
          className: "col-sm-3 text-right pt-2"
        }, text), /*#__PURE__*/_react.default.createElement(_core.FormControl, {
          fullWidth: true,
          className: "col-sm-9"
        }, /*#__PURE__*/_react.default.createElement(_core.Select, {
          id: item.name,
          onChange: e => this.change(e, item.name),
          value: this.state.values[item.name] ? this.state.values[item.name] : ''
        }, options))));
      } // if heading: return <div></div>


      if (item.heading) {
        return /*#__PURE__*/_react.default.createElement("div", {
          className: "row mt-4 px-4 pt-2",
          key: idx.toString()
        }, /*#__PURE__*/_react.default.createElement("h1", {
          className: "col-sm-2 text-right"
        }, " "), /*#__PURE__*/_react.default.createElement("h1", {
          className: "col-sm-10"
        }, item.heading, "     "));
      } // if text area: returns <div></div>


      if (item.name === 'comment' || item.name === 'content') {
        return /*#__PURE__*/_react.default.createElement("div", {
          className: "row mt-1 px-4",
          key: idx.toString()
        }, /*#__PURE__*/_react.default.createElement("div", {
          className: "col-sm-3 text-right pt-2"
        }, text, /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement(_core.Tooltip, {
          title: "Use Markdown editor"
        }, /*#__PURE__*/_react.default.createElement(_core.Button, {
          onClick: () => this.setAdvanced(item.name),
          style: {
            color: _style.colorStrong
          },
          variant: "text",
          size: "small",
          className: "float-right mt-2",
          id: "mdBtn"
        }, "advanced"))), /*#__PURE__*/_react.default.createElement("div", {
          className: "col-sm-9 p-0"
        }, !this.state.advanced[item.name] && /*#__PURE__*/_react.default.createElement(_core.TextField, {
          multiline: true,
          rows: 7,
          fullWidth: true,
          key: item.name,
          required: item.required,
          placeholder: item.query,
          onChange: e => this.change(e, item.name),
          value: this.state.values[item.name] ? this.state.values[item.name] : ''
        }), this.state.advanced[item.name] && /*#__PURE__*/_react.default.createElement(_reactMarkdownEditorLite.default, {
          style: {
            height: '500px'
          },
          onChange: v => this.change(v, item.name),
          renderHTML: text => Promise.resolve( /*#__PURE__*/_react.default.createElement(_reactMarkdown.default, {
            source: text
          })),
          value: this.state.values[item.name] ? this.state.values[item.name] : '',
          plugins: ['header', 'font-bold', 'font-italic', 'list-unordered', 'list-ordered', 'block-quote', 'block-wrap', 'logger', 'mode-toggle', 'full-screen']
          /*table is taken out of the plugins since it is not rendered anyhow 'font-underline'*/

        })));
      } // if normal input: returns <div></div>

      /*Value is '' to prevent 'Warning: A component is changing an uncontrolled input of type text to
      be controlled. Input elements should not switch from uncontrolled to controlled (or vice versa)..*/


      return /*#__PURE__*/_react.default.createElement("div", {
        className: "row mt-1 px-4",
        key: idx.toString()
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "col-sm-3 text-right pt-2"
      }, text), /*#__PURE__*/_react.default.createElement(_core.FormControl, {
        fullWidth: true,
        className: "col-sm-9"
      }, /*#__PURE__*/_react.default.createElement(_core.Input, {
        required: item.required,
        placeholder: item.query,
        value: this.state.values[item.name] || '',
        onChange: e => this.change(e, item.name),
        key: item.name,
        id: item.name,
        endAdornment: /*#__PURE__*/_react.default.createElement(_core.InputAdornment, {
          position: "end"
        }, item.unit ? item.unit : '')
      })));
    }); //return the as-created list of items

    return /*#__PURE__*/_react.default.createElement("div", null, items);
  }

  showImage() {
    /* show image at the top of the form */
    const {
      image
    } = this.state.values;
    if (!image) return /*#__PURE__*/_react.default.createElement("div", {
      key: "image"
    });

    if (image.substring(0, 4) === '<?xm') {
      const base64data = btoa(unescape(encodeURIComponent(image)));
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "d-flex justify-content-center",
        key: "image"
      }, /*#__PURE__*/_react.default.createElement("img", {
        src: 'data:image/svg+xml;base64,' + base64data,
        width: "40%",
        alt: "svg-format"
      }));
    } else {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "d-flex justify-content-center",
        key: "image"
      }, /*#__PURE__*/_react.default.createElement("img", {
        src: image,
        width: "40%",
        alt: "base64-format"
      }));
    }
  }
  /** the render method **/


  render() {
    if (!this.state.ontologyNode) return /*#__PURE__*/_react.default.createElement("div", null);
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "modal",
      style: { ..._style.modal,
        display: this.state.show
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "modal-content",
      style: { ..._style.modalContent,
        width: '60%'
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col"
    }, this.showImage(), /*#__PURE__*/_react.default.createElement("div", {
      className: "form-popup m-2"
    }, /*#__PURE__*/_react.default.createElement("form", {
      className: "form-container"
    }, this.showList(), /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.setState({
        show: 'none'
      }),
      variant: "contained",
      className: "float-right my-2 ml-2 mr-0",
      id: "closeBtn",
      style: _style.btn
    }, "Cancel"), /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.submit('close'),
      disabled: this.state.disableSubmit && true,
      variant: "contained",
      className: "float-right m-2",
      id: "submitBtn",
      style: this.state.disableSubmit ? _style.btnStrongDeactive : _style.btnStrong
    }, "Submit & close"), this.state.kind == 'new' && this.state.docType != 'x0' && /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.submit('open'),
      disabled: this.state.disableSubmit,
      variant: "contained",
      className: "float-right m-2",
      id: "submitBtn",
      style: this.state.disableSubmit ? _style.btnStrongDeactive : _style.btnStrong
    }, "Submit"))))));
  }

}

exports.default = ModalForm;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlcmVyL2NvbXBvbmVudHMvTW9kYWxGb3JtLmpzIl0sIm5hbWVzIjpbIk1vZGFsRm9ybSIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwiaGFuZGxlQWN0aW9ucyIsImFjdGlvbiIsInR5cGUiLCJvbnRvbG9neU5vZGUiLCJTdG9yZSIsImdldE9udG9sb2d5Tm9kZSIsIm1hcCIsIml0ZW0iLCJyZXF1aXJlZCIsIm5hbWUiLCJkb2MiLCJzZXRTdGF0ZSIsImRpc2FibGVTdWJtaXQiLCJ2YWx1ZXMiLCJvcmlnaW5hbERvYyIsImRvY1R5cGUiLCJnZXREb2NUeXBlIiwia2luZCIsInF1ZXJ5IiwibGlzdCIsImNvbmNhdCIsImZvckVhY2giLCJzcGxpdCIsImdldERvY3VtZW50UmF3IiwiT2JqZWN0Iiwia2V5cyIsImluT250b2xvZ3lOb2RlIiwiaSIsImluZGV4T2YiLCJpdGVtU2tpcCIsIml0ZW1EQiIsInB1c2giLCJ1bml0IiwiZmlsdGVyIiwic2hvdyIsInN1Ym1pdCIsInN0YXRlIiwidGVzdCIsIl9pZCIsIkFjdGlvbnMiLCJjaGFuZ2VUZXh0RG9jIiwiY3JlYXRlRG9jIiwidXBkYXRlRG9jIiwiY2hhbmdlIiwidmFsdWUiLCJrZXkiLCJTdHJpbmciLCJ0ZXh0IiwidGFyZ2V0IiwibGVuZ3RoIiwiZ2V0RG9jc0xpc3QiLCJzZXRBZHZhbmNlZCIsImFkdmFuY2VkIiwiY29tcGFyZURvY3MiLCJhIiwiYiIsImRpc3BhdGNoZXJUb2tlbiIsImNvbXBvbmVudERpZE1vdW50IiwiZGlzcGF0Y2hlciIsInJlZ2lzdGVyIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1bnJlZ2lzdGVyIiwic2hvd0xpc3QiLCJpdGVtcyIsImlkeCIsImF0dGFjaG1lbnQiLCJ0b1N0cmluZyIsImluY2x1ZGVzIiwic2xpY2UiLCJvcHRpb25zIiwiZG9jc0xpc3QiLCJ0b1VwcGVyQ2FzZSIsInNvcnQiLCJpZCIsImUiLCJoZWFkaW5nIiwiY29sb3IiLCJjb2xvclN0cm9uZyIsImhlaWdodCIsInYiLCJQcm9taXNlIiwicmVzb2x2ZSIsInNob3dJbWFnZSIsImltYWdlIiwic3Vic3RyaW5nIiwiYmFzZTY0ZGF0YSIsImJ0b2EiLCJ1bmVzY2FwZSIsImVuY29kZVVSSUNvbXBvbmVudCIsInJlbmRlciIsIm1vZGFsIiwiZGlzcGxheSIsIm1vZGFsQ29udGVudCIsIndpZHRoIiwiYnRuIiwiYnRuU3Ryb25nRGVhY3RpdmUiLCJidG5TdHJvbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFFQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFYQTtBQUNBO0FBQ2tFO0FBRVA7QUFDTztBQUNBO0FBQ0E7QUFNbkQsTUFBTUEsU0FBTixTQUF3QkMsZ0JBQXhCLENBQWtDO0FBQy9DQyxFQUFBQSxXQUFXLEdBQUc7QUFDWjs7QUFEWSxTQTBCZEMsYUExQmMsR0EwQkNDLE1BQUQsSUFBVTtBQUFNO0FBQzVCLFVBQUlBLE1BQU0sQ0FBQ0MsSUFBUCxLQUFjLFdBQWxCLEVBQStCO0FBQzdCO0FBQ0EsWUFBSUMsWUFBWSxHQUFHLElBQW5CO0FBQ0EsWUFBSSxPQUFPRixNQUFNLENBQUNFLFlBQWQsSUFBNkIsUUFBakMsRUFBMkM7QUFDekNBLFVBQUFBLFlBQVksR0FBR0MsZUFBTUMsZUFBTixDQUFzQkosTUFBTSxDQUFDRSxZQUE3QixDQUFmLENBREYsS0FFSyxJQUFJRixNQUFNLENBQUNFLFlBQVgsRUFBc0M7QUFDekNBLFVBQUFBLFlBQVksR0FBR0YsTUFBTSxDQUFDRSxZQUF0QixDQURHLEtBR0hBLFlBQVksR0FBR0MsZUFBTUMsZUFBTixFQUFmLENBUjJCLENBUWdCOztBQUM3Q0YsUUFBQUEsWUFBWSxDQUFDRyxHQUFiLENBQWtCQyxJQUFELElBQVE7QUFDdkIsY0FBSUEsSUFBSSxDQUFDQyxRQUFMLElBQWlCRCxJQUFqQixJQUF5QkEsSUFBSSxDQUFDRSxJQUE5QixLQUF1QyxDQUFDUixNQUFNLENBQUNTLEdBQVIsSUFBZSxDQUFDVCxN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QyxXQURyRDtBQUVFLE1BQUEsS0FBSyxFQUFFLEtBQUt3QixLQUFMLENBQVd4QixhQUFYLEdBQTJCbUYsd0JBQTNCLEdBQStDQztBQUZ4RCxnQkFaSixDQURGLENBRkYsQ0FERixDQURGLENBREY7QUE2QkQ7O0FBeFM4QyIsInNvdXJjZXNDb250ZW50IjpbIi8qIE1vZGFsIHNob3duIGZvciBuZXcgaXRlbXMgYW5kIGVkaXQgb2YgZXhpc3RpbmcgaXRlbXNcbiovXG5pbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50IH0gZnJvbSAncmVhY3QnOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgeyBCdXR0b24sIFRleHRGaWVsZCwgSW5wdXQsIElucHV0QWRvcm5tZW50LCBTZWxlY3QsICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIE1lbnVJdGVtLCBGb3JtQ29udHJvbCwgVG9vbHRpcH0gZnJvbSAnQG1hdGVyaWFsLXVpL2NvcmUnOy8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCB7IEFsZXJ0IH0gZnJvbSAnQG1hdGVyaWFsLXVpL2xhYic7ICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCBNZEVkaXRvciBmcm9tICdyZWFjdC1tYXJrZG93bi1lZGl0b3ItbGl0ZSc7ICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCBSZWFjdE1hcmtkb3duIGZyb20gJ3JlYWN0LW1hcmtkb3duJzsgICAgICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCBTdG9yZSBmcm9tICcuLi9TdG9yZSc7XG5pbXBvcnQgKiBhcyBBY3Rpb25zIGZyb20gJy4uL0FjdGlvbnMnO1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi4vRGlzcGF0Y2hlcic7XG5pbXBvcnQgeyBtb2RhbCwgbW9kYWxDb250ZW50LCBidG4sIGJ0blN0cm9uZywgY29sb3JTdHJvbmcsIGJ0blN0cm9uZ0RlYWN0aXZlIH0gZnJvbSAnLi4vc3R5bGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RhbEZvcm0gZXh0ZW5kcyBDb21wb25lbnQge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBhZHZhbmNlZDogW2ZhbHNlLGZhbHNlXSxcbiAgICAgIC8vbW9kYWwgaXRlbXNcbiAgICAgIGRpc3BhdGNoZXJUb2tlbjogbnVsbCxcbiAgICAgIHNob3c6ICdub25lJyxcbiAgICAgIGtpbmQ6IG51bGwsICAvL25ldyBvciBlZGl0XG4gICAgICBkb2M6IG51bGwsXG4gICAgICBkb2NUeXBlOiBudWxsLFxuICAgICAgLy9mb3JtIGl0ZW1zXG4gICAgICBvbnRvbG9neU5vZGU6IG51bGwsXG4gICAgICB2YWx1ZXM6IHt9LFxuICAgICAgZGlzYWJsZVN1Ym1pdDogZmFsc2VcbiAgICB9O1xuICB9XG4gIC8vY29tcG9uZW50IG1vdW50ZWQgaW1tZWRpYXRlbHksIGV2ZW4gaWYgTW9kYWwgbm90IHNob3duXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe2Rpc3BhdGNoZXJUb2tlbjogZGlzcGF0Y2hlci5yZWdpc3Rlcih0aGlzLmhhbmRsZUFjdGlvbnMpfSk7XG4gIH1cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgZGlzcGF0Y2hlci51bnJlZ2lzdGVyKHRoaXMuc3RhdGUuZGlzcGF0Y2hlclRva2VuKTtcbiAgfVxuXG5cbiAgLyoqIEZ1bmN0aW9ucyBhcyBjbGFzcyBwcm9wZXJ0aWVzIChpbW1lZGlhdGVseSBib3VuZCk6IHJlYWN0IG9uIHVzZXIgaW50ZXJhY3Rpb25zICoqL1xuICBoYW5kbGVBY3Rpb25zPShhY3Rpb24pPT57ICAgICAvL01vZGFsIHNob3c7IGZpcnN0IGZ1bmN0aW9uXG4gICAgaWYgKGFjdGlvbi50eXBlPT09J1NIT1dfRk9STScpIHtcbiAgICAgIC8vQ1JFQVRFIEFORCBVU0UgT05UT0xPR1ktTk9ERTogd2hpY2ggcm93cyBleGlzdCwgYXJlIHRoZXkgcmVxdWlyZWQsIGFyZSB0aGV5IGEgbGlzdFxuICAgICAgdmFyIG9udG9sb2d5Tm9kZSA9IG51bGw7XG4gICAgICBpZiAodHlwZW9mIGFjdGlvbi5vbnRvbG9neU5vZGUgPT0nc3RyaW5nJykgLy9rbm93IGRvY1R5cGUvc3ViRG9jVHlwZVxuICAgICAgICBvbnRvbG9neU5vZGUgPSBTdG9yZS5nZXRPbnRvbG9neU5vZGUoYWN0aW9uLm9udG9sb2d5Tm9kZSk7XG4gICAgICBlbHNlIGlmIChhY3Rpb24ub250b2xvZ3lOb2RlKSAgICAgICAgICAgICAgLy9kYXRhIGRlbGl2ZXJlZCBieSBhY3Rpb246IGhpZXJhcmNoeSB0cmVlIGl0ZW1zIGZyb20gcHJvamVjdFxuICAgICAgICBvbnRvbG9neU5vZGUgPSBhY3Rpb24ub250b2xvZ3lOb2RlO1xuICAgICAgZWxzZVxuICAgICAgICBvbnRvbG9neU5vZGUgPSBTdG9yZS5nZXRPbnRvbG9neU5vZGUoKTsgICAgLy9kZWZhdWx0IGNhc2VcbiAgICAgIG9udG9sb2d5Tm9kZS5tYXAoKGl0ZW0pPT57XG4gICAgICAgIGlmIChpdGVtLnJlcXVpcmVkICYmIGl0ZW0gJiYgaXRlbS5uYW1lICYmICghYWN0aW9uLmRvYyB8fCAhYWN0aW9uLmRvY1tpdGVtLm5hbWVdKSApIC8vaWYgcmVxdWlyZWQgYW5kIG5vdCBhbHJlYWR5IGZpbGxlZFxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2Rpc2FibGVTdWJtaXQ6IHRydWV9KTtcbiAgICAgIH0pO1xuICAgICAgLy9jcmVhdGUgdmFsdWVzXG4gICAgICB2YXIgdmFsdWVzID0ge307XG4gICAgICB2YXIgb3JpZ2luYWxEb2MgPSB7fTtcbiAgICAgIHZhciBkb2NUeXBlID0gU3RvcmUuZ2V0RG9jVHlwZSgpO1xuICAgICAgaWYgKGFjdGlvbi5raW5kPT0nbmV3Jykge1xuICAgICAgICBpZiAoIWFjdGlvbi5kb2MgJiYgZG9jVHlwZSE9J3gwJylcbiAgICAgICAgICBvbnRvbG9neU5vZGUgPSBbe25hbWU6J19wcm9qZWN0JywgcXVlcnk6J1doaWNoIHByb2plY3QgZG9lcyBpdCBiZWxvbmcgdG8/JywgbGlzdDoneDAnfV1cbiAgICAgICAgICAgIC5jb25jYXQob250b2xvZ3lOb2RlKTtcbiAgICAgICAgb250b2xvZ3lOb2RlLmZvckVhY2goKGl0ZW0pPT57XG4gICAgICAgICAgaWYoaXRlbS5uYW1lICYmICF2YWx1ZXNbaXRlbS5uYW1lXSlcbiAgICAgICAgICAgIHZhbHVlc1tpdGVtLm5hbWVdPScnO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGFjdGlvbi5kb2MpIHtcbiAgICAgICAgICB2YWx1ZXNbJ3R5cGUnXSA9IGFjdGlvbi5kb2NbJy10eXBlJ107XG4gICAgICAgICAgb3JpZ2luYWxEb2MgPSBhY3Rpb24uZG9jO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhY3Rpb24ub250b2xvZ3lOb2RlID09J3N0cmluZycpIHtcbiAgICAgICAgICBvcmlnaW5hbERvY1sndHlwZSddID0gYWN0aW9uLm9udG9sb2d5Tm9kZS5zcGxpdCgnLycpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoYWN0aW9uLmRvYykge1xuICAgICAgICAgIHZhbHVlcyA9IGFjdGlvbi5kb2M7XG4gICAgICAgICAgb3JpZ2luYWxEb2MgPSB7Li4udmFsdWVzfTtcbiAgICAgICAgICBbJ2lkJywncGFyZW50JywnZGVsZXRlJywncGF0aCcsJ2RvY0lEJ10ubWFwKChpdGVtKT0+e1xuICAgICAgICAgICAgZGVsZXRlIHZhbHVlc1tpdGVtXTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWx1ZXMgPSBTdG9yZS5nZXREb2N1bWVudFJhdygpO1xuICAgICAgICAgIG9yaWdpbmFsRG9jID0gdmFsdWVzO1xuICAgICAgICB9XG4gICAgICAgIC8vYWRkIGl0ZW1zIHRoYXQgYXJlIGluIGRvY3VtZW50IGJ1dCBub3QgaW4gb250b2xvZ3lOb2RlXG4gICAgICAgIE9iamVjdC5rZXlzKHZhbHVlcykubWFwKChpdGVtKT0+e1xuICAgICAgICAgIGNvbnN0IGluT250b2xvZ3lOb2RlID0gb250b2xvZ3lOb2RlLm1hcChpPT57cmV0dXJuIGkubmFtZTt9KS5pbmRleE9mKGl0ZW0pPi0xO1xuICAgICAgICAgIGlmICghaW5PbnRvbG9neU5vZGUgJiYgU3RvcmUuaXRlbVNraXAuaW5kZXhPZihpdGVtKT09LTEgJiYgU3RvcmUuaXRlbURCLmluZGV4T2YoaXRlbSk9PS0xICkge1xuICAgICAgICAgICAgb250b2xvZ3lOb2RlLnB1c2goe25hbWU6aXRlbSwgdW5pdDonJywgcmVxdWlyZWQ6ZmFsc2UsIGxpc3Q6bnVsbH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBvbnRvbG9neU5vZGUgPSBvbnRvbG9neU5vZGUuZmlsdGVyKGk9PntyZXR1cm4gKFN0b3JlLml0ZW1Ta2lwLmluZGV4T2YoaS5uYW1lKT09LTEgfHwgaS5uYW1lPT0nY29udGVudCcpO30pOyAgLy9maWx0ZXItb3V0IHRoaW5ncyBsaWtlIGltYWdlXG4gICAgICB0aGlzLnNldFN0YXRlKHt2YWx1ZXM6dmFsdWVzLCBraW5kOmFjdGlvbi5raW5kLCBvbnRvbG9neU5vZGU6b250b2xvZ3lOb2RlLFxuICAgICAgICBkb2M6b3JpZ2luYWxEb2MsIHNob3c6J2Jsb2NrJywgZG9jVHlwZTpkb2NUeXBlfSk7XG4gICAgfVxuICB9XG5cblxuICBzdWJtaXQ9KHR5cGUpPT57XG4gICAgLyogc3VibWl0IGJ1dHRvbiBjbGlja2VkICovXG4gICAgdmFyIHZhbHVlcyA9IHRoaXMuc3RhdGUudmFsdWVzO1xuICAgIGlmICh0aGlzLnN0YXRlLmRvYyAmJiB0aGlzLnN0YXRlLmRvY1snLXR5cGUnXSlcbiAgICAgIHZhbHVlc1snLXR5cGUnXSA9IHRoaXMuc3RhdGUuZG9jWyctdHlwZSddO1xuICAgIGlmICh2YWx1ZXNbJy10eXBlJ10gJiYgdmFsdWVzWyctdHlwZSddWzBdWzBdPT0neCcgJiYgdmFsdWVzWyctdHlwZSddWzBdIT0neDAnICYmXG4gICAgICAgICEvXlxcdy1cXHd7MzJ9JC8udGVzdCh2YWx1ZXMuX2lkKSkge1xuICAgICAgQWN0aW9ucy5jaGFuZ2VUZXh0RG9jKHZhbHVlcywgdGhpcy5zdGF0ZS5kb2MpOyAgIC8vY3JlYXRlL2NoYW5nZSBpbmZvcm1hdGlvbiBpbiBQcm9qZWN0LmpzIG9ubHlcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuc3RhdGUua2luZD09PSduZXcnKSB7IC8vY2FzZSBuZXcgZG9jdW1lbnRcbiAgICAgICAgQWN0aW9ucy5jcmVhdGVEb2ModmFsdWVzKTsgICAgICAgICAgICAgICAgICAgICAgIC8vY3JlYXRlL2NoYW5nZSBpbiBkYXRhYmFzZVxuICAgICAgfSBlbHNlIHsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY2FzZSB1cGRhdGUgZG9jdW1lbnQgd2l0aCBleGlzdGluZyBkb2NJRCwgY2hhbmdlIGluIGRhdGFiYXNlXG4gICAgICAgIEFjdGlvbnMudXBkYXRlRG9jKHZhbHVlcywgdGhpcy5zdGF0ZS5kb2MpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHlwZT09J2Nsb3NlJylcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3c6J25vbmUnfSk7XG4gIH1cblxuXG4gIGNoYW5nZT0odmFsdWUsIGtleSk9PntcbiAgICAvKiB0ZXh0IGZpZWxkIGNoYW5nZXMgdmFsdWUgKi9cbiAgICB2YXIgdmFsdWVzID0gdGhpcy5zdGF0ZS52YWx1ZXM7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdmFsdWUgaW5zdGFuY2VvZiBTdHJpbmcpXG4gICAgICB2YWx1ZXNba2V5XSA9IHZhbHVlO1xuICAgIGVsc2VcbiAgICBpZiAoJ3RleHQnIGluIHZhbHVlKVxuICAgICAgdmFsdWVzW2tleV0gPSB2YWx1ZS50ZXh0O1xuICAgIGVsc2VcbiAgICAgIHZhbHVlc1trZXldID0gdmFsdWUudGFyZ2V0LnZhbHVlO1xuICAgIHZhciBkaXNhYmxlU3VibWl0ID0gZmFsc2U7XG4gICAgdGhpcy5zdGF0ZS5vbnRvbG9neU5vZGUubWFwKChpdGVtKT0+e1xuICAgICAgaWYgKCghdGhpcy5zdGF0ZS52YWx1ZXNbaXRlbS5uYW1lXXx8dGhpcy5zdGF0ZS52YWx1ZXNbaXRlbS5uYW1lXS5sZW5ndGg9PTApICYmIGl0ZW0ucmVxdWlyZWQpXG4gICAgICAgIGRpc2FibGVTdWJtaXQ9dHJ1ZTtcbiAgICAgIGlmIChpdGVtLmxpc3QgJiYgdHlwZW9mIGl0ZW0ubGlzdD09PSdzdHJpbmcnICYmICFTdG9yZS5nZXREb2NzTGlzdChpdGVtLmxpc3QpKVxuICAgICAgICBkaXNhYmxlU3VibWl0PXRydWU7XG4gICAgfSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7dmFsdWVzOiB2YWx1ZXMsIGRpc2FibGVTdWJtaXQ6IGRpc2FibGVTdWJtaXR9KTtcbiAgfVxuXG5cbiAgc2V0QWR2YW5jZWQ9KG5hbWUpPT57XG4gICAgLyogY2hhbmdlIGRpc3BsYXkgb2ZyIGNvbW1lbnQgYm94ICovXG4gICAgdmFyIGFkdmFuY2VkID0gdGhpcy5zdGF0ZS5hZHZhbmNlZDtcbiAgICBhZHZhbmNlZFtuYW1lXSA9ICEgYWR2YW5jZWRbbmFtZV07XG4gICAgdGhpcy5zZXRTdGF0ZSh7YWR2YW5jZWQ6YWR2YW5jZWR9KTtcbiAgfVxuXG5cbiAgY29tcGFyZURvY3M9KGEsYik9PntcbiAgICAvKiBjb21wYXJlIHRvIGRvY3MgKGlkcywgbmFtZXMpIGJ5IGNvbXBhcmluZyBuYW1lcyAqL1xuICAgIGlmICggYS5uYW1lIDwgYi5uYW1lIClcbiAgICAgIHJldHVybiAtMTtcbiAgICBpZiAoIGEubmFtZSA+IGIubmFtZSApXG4gICAgICByZXR1cm4gMTtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG5cbiAgLyoqIGNyZWF0ZSBodG1sLXN0cnVjdHVyZTsgYWxsIHNob3VsZCByZXR1cm4gYXQgbGVhc3QgPGRpdj48L2Rpdj4gKiovXG4gIHNob3dMaXN0KCkge1xuICAgIC8qIGxpc3Qgb2YgaHRtbCBkb2N1bWVudHMgdGhhdCBtYWtlIHVwIHRoZSBmb3JtICovXG4gICAgY29uc3QgaXRlbXMgPSB0aGlzLnN0YXRlLm9udG9sb2d5Tm9kZS5tYXAoIChpdGVtLGlkeCkgPT4ge1xuICAgICAgaWYgKGl0ZW0uYXR0YWNobWVudCB8fCAoaXRlbS5uYW1lICYmIGl0ZW0ubmFtZVswXT09Jy0nICYmIGl0ZW0ubmFtZSE9Jy1uYW1lJykpXG4gICAgICAgIHJldHVybiA8ZGl2IGtleT17aWR4LnRvU3RyaW5nKCl9PjwvZGl2PjtcbiAgICAgIHZhciB0ZXh0ID0gaXRlbS5uYW1lICYmIFsnXycsJy0nXS5pbmNsdWRlcyhpdGVtLm5hbWVbMF0pID8gaXRlbS5uYW1lLnNsaWNlKDEpKyc6JyA6IGl0ZW0ubmFtZSsnOic7XG4gICAgICBpZiAoaXRlbS5yZXF1aXJlZClcbiAgICAgICAgdGV4dCArPSAnICAqJztcbiAgICAgIC8vIGlmIHNlbGVjdGlvbiBib3g6IHJldHVybnMgPGRpdj48L2Rpdj5cbiAgICAgIGlmIChpdGVtLmxpc3QpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSBudWxsO1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW0ubGlzdD09PSdzdHJpbmcnKSB7Ly9kb2N0eXBlXG4gICAgICAgICAgdmFyIGRvY3NMaXN0ID0gU3RvcmUuZ2V0RG9jc0xpc3QoaXRlbS5saXN0KTtcbiAgICAgICAgICBpZiAoIWRvY3NMaXN0KVxuICAgICAgICAgICAgcmV0dXJuIDxBbGVydCBzZXZlcml0eT1cIndhcm5pbmdcIiBrZXk9e2lkeC50b1N0cmluZygpfT5cbiAgICAgICAgICAgICAgVmlzaXQgdGhlIGZvbGxvd2luZyBzZWN0aW9uOiB7aXRlbS5saXN0LnRvVXBwZXJDYXNlKCl9U1xuICAgICAgICAgICAgPC9BbGVydD47XG4gICAgICAgICAgZG9jc0xpc3QgPSBkb2NzTGlzdC5zb3J0KHRoaXMuY29tcGFyZURvY3MpO1xuICAgICAgICAgIGRvY3NMaXN0ID0gW3tuYW1lOictIGxlYXZlIGJsYW5rIGlmIG5vIGxpbmsgY3JlYXRlZCAtJyxpZDonJ31dLmNvbmNhdChkb2NzTGlzdCk7IC8vY29uY2F0IC0tLSB0byBsaXN0XG4gICAgICAgICAgb3B0aW9ucyA9IGRvY3NMaXN0Lm1hcCgoaXRlbSk9PntcbiAgICAgICAgICAgIHJldHVybiAoPE1lbnVJdGVtIHZhbHVlPXtpdGVtLmlkfSBrZXk9e2l0ZW0uaWR9PntpdGVtLm5hbWV9PC9NZW51SXRlbT4pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgeyAgLy9saXN0cyBkZWZpbmVkIGJ5IG9udG9sb2d5XG4gICAgICAgICAgb3B0aW9ucyA9IGl0ZW0ubGlzdC5tYXAoKGl0ZW0pPT57XG4gICAgICAgICAgICByZXR1cm4gKDxNZW51SXRlbSB2YWx1ZT17aXRlbX0ga2V5PXtpdGVtfT57aXRlbX08L01lbnVJdGVtPik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuKFxuICAgICAgICAgIDxkaXYga2V5PXtpZHgudG9TdHJpbmcoKX0gY2xhc3NOYW1lPSdjb250YWluZXItZmx1aWQnPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3JvdyBtdC0xJz5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS0zIHRleHQtcmlnaHQgcHQtMic+e3RleHR9PC9kaXY+XG4gICAgICAgICAgICAgIDxGb3JtQ29udHJvbCBmdWxsV2lkdGggY2xhc3NOYW1lPSdjb2wtc20tOSc+XG4gICAgICAgICAgICAgICAgPFNlbGVjdCBpZD17aXRlbS5uYW1lfSBvbkNoYW5nZT17ZT0+dGhpcy5jaGFuZ2UoZSxpdGVtLm5hbWUpfVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUudmFsdWVzW2l0ZW0ubmFtZV0gPyB0aGlzLnN0YXRlLnZhbHVlc1tpdGVtLm5hbWVdIDonJ30+XG4gICAgICAgICAgICAgICAgICB7b3B0aW9uc31cbiAgICAgICAgICAgICAgICA8L1NlbGVjdD5cbiAgICAgICAgICAgICAgPC9Gb3JtQ29udHJvbD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2Pik7XG4gICAgICB9XG4gICAgICAvLyBpZiBoZWFkaW5nOiByZXR1cm4gPGRpdj48L2Rpdj5cbiAgICAgIGlmIChpdGVtLmhlYWRpbmcpe1xuICAgICAgICByZXR1cm4oXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3JvdyBtdC00IHB4LTQgcHQtMicga2V5PXtpZHgudG9TdHJpbmcoKX0+XG4gICAgICAgICAgICA8aDEgY2xhc3NOYW1lPSdjb2wtc20tMiB0ZXh0LXJpZ2h0Jz4gPC9oMT5cbiAgICAgICAgICAgIDxoMSBjbGFzc05hbWU9J2NvbC1zbS0xMCc+e2l0ZW0uaGVhZGluZ30gICAgIDwvaDE+XG4gICAgICAgICAgPC9kaXY+KTtcbiAgICAgIH1cbiAgICAgIC8vIGlmIHRleHQgYXJlYTogcmV0dXJucyA8ZGl2PjwvZGl2PlxuICAgICAgaWYgKGl0ZW0ubmFtZT09PSdjb21tZW50JyB8fCBpdGVtLm5hbWU9PT0nY29udGVudCcpIHtcbiAgICAgICAgcmV0dXJuKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdyb3cgbXQtMSBweC00JyBrZXk9e2lkeC50b1N0cmluZygpfT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wtc20tMyB0ZXh0LXJpZ2h0IHB0LTInPnt0ZXh0fTxici8+XG4gICAgICAgICAgICAgIDxUb29sdGlwIHRpdGxlPSdVc2UgTWFya2Rvd24gZWRpdG9yJz5cbiAgICAgICAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9eygpPT50aGlzLnNldEFkdmFuY2VkKGl0ZW0ubmFtZSl9IHN0eWxlPXt7Y29sb3I6Y29sb3JTdHJvbmd9fVxuICAgICAgICAgICAgICAgICAgdmFyaWFudD1cInRleHRcIiBzaXplPVwic21hbGxcIiBjbGFzc05hbWU9J2Zsb2F0LXJpZ2h0IG10LTInIGlkPSdtZEJ0bic+XG4gICAgICAgICAgICAgICAgICAgICAgYWR2YW5jZWRcbiAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPC9Ub29sdGlwPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTkgcC0wJz5cbiAgICAgICAgICAgICAgeyF0aGlzLnN0YXRlLmFkdmFuY2VkW2l0ZW0ubmFtZV0gJiZcbiAgICAgICAgICAgICAgICA8VGV4dEZpZWxkIG11bHRpbGluZSByb3dzPXs3fSBmdWxsV2lkdGgga2V5PXtpdGVtLm5hbWV9IHJlcXVpcmVkPXtpdGVtLnJlcXVpcmVkfVxuICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e2l0ZW0ucXVlcnl9IG9uQ2hhbmdlPXtlPT50aGlzLmNoYW5nZShlLGl0ZW0ubmFtZSl9XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17KHRoaXMuc3RhdGUudmFsdWVzW2l0ZW0ubmFtZV0pID8gdGhpcy5zdGF0ZS52YWx1ZXNbaXRlbS5uYW1lXSA6ICcnfSAvPlxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHt0aGlzLnN0YXRlLmFkdmFuY2VkW2l0ZW0ubmFtZV0gJiZcbiAgICAgICAgICAgICAgPE1kRWRpdG9yIHN0eWxlPXt7IGhlaWdodDogJzUwMHB4JyB9fSBvbkNoYW5nZT17diA9PiB0aGlzLmNoYW5nZSh2LGl0ZW0ubmFtZSl9XG4gICAgICAgICAgICAgICAgcmVuZGVySFRNTD17dGV4dD0+UHJvbWlzZS5yZXNvbHZlKDxSZWFjdE1hcmtkb3duIHNvdXJjZT17dGV4dH0vPil9XG4gICAgICAgICAgICAgICAgdmFsdWU9eyh0aGlzLnN0YXRlLnZhbHVlc1tpdGVtLm5hbWVdKSA/IHRoaXMuc3RhdGUudmFsdWVzW2l0ZW0ubmFtZV0gOiAnJ31cbiAgICAgICAgICAgICAgICBwbHVnaW5zPXtbJ2hlYWRlcicsICdmb250LWJvbGQnLCAnZm9udC1pdGFsaWMnLCAnbGlzdC11bm9yZGVyZWQnLFxuICAgICAgICAgICAgICAgICAgJ2xpc3Qtb3JkZXJlZCcsICdibG9jay1xdW90ZScsICdibG9jay13cmFwJywgJ2xvZ2dlcicsICdtb2RlLXRvZ2dsZScsICdmdWxsLXNjcmVlbiddXG4gICAgICAgICAgICAgICAgICAvKnRhYmxlIGlzIHRha2VuIG91dCBvZiB0aGUgcGx1Z2lucyBzaW5jZSBpdCBpcyBub3QgcmVuZGVyZWQgYW55aG93ICdmb250LXVuZGVybGluZScqL31cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+KTtcbiAgICAgIH1cbiAgICAgIC8vIGlmIG5vcm1hbCBpbnB1dDogcmV0dXJucyA8ZGl2PjwvZGl2PlxuICAgICAgLypWYWx1ZSBpcyAnJyB0byBwcmV2ZW50ICdXYXJuaW5nOiBBIGNvbXBvbmVudCBpcyBjaGFuZ2luZyBhbiB1bmNvbnRyb2xsZWQgaW5wdXQgb2YgdHlwZSB0ZXh0IHRvXG4gICAgICBiZSBjb250cm9sbGVkLiBJbnB1dCBlbGVtZW50cyBzaG91bGQgbm90IHN3aXRjaCBmcm9tIHVuY29udHJvbGxlZCB0byBjb250cm9sbGVkIChvciB2aWNlIHZlcnNhKS4uKi9cbiAgICAgIHJldHVybihcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J3JvdyBtdC0xIHB4LTQnIGtleT17aWR4LnRvU3RyaW5nKCl9ID5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTMgdGV4dC1yaWdodCBwdC0yJz57dGV4dH08L2Rpdj5cbiAgICAgICAgICA8Rm9ybUNvbnRyb2wgZnVsbFdpZHRoIGNsYXNzTmFtZT0nY29sLXNtLTknPlxuICAgICAgICAgICAgPElucHV0IHJlcXVpcmVkPXtpdGVtLnJlcXVpcmVkfSBwbGFjZWhvbGRlcj17aXRlbS5xdWVyeX1cbiAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUudmFsdWVzW2l0ZW0ubmFtZV0gfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXtlPT50aGlzLmNoYW5nZShlLGl0ZW0ubmFtZSl9IGtleT17aXRlbS5uYW1lfSBpZD17aXRlbS5uYW1lfVxuICAgICAgICAgICAgICBlbmRBZG9ybm1lbnQ9ezxJbnB1dEFkb3JubWVudCBwb3NpdGlvbj1cImVuZFwiPntpdGVtLnVuaXQgPyBpdGVtLnVuaXQgOiAnJ31cbiAgICAgICAgICAgICAgPC9JbnB1dEFkb3JubWVudD59IC8+XG4gICAgICAgICAgPC9Gb3JtQ29udHJvbD5cbiAgICAgICAgPC9kaXY+KTtcbiAgICB9KTtcbiAgICAvL3JldHVybiB0aGUgYXMtY3JlYXRlZCBsaXN0IG9mIGl0ZW1zXG4gICAgcmV0dXJuIDxkaXY+e2l0ZW1zfTwvZGl2PjtcbiAgfVxuXG5cbiAgc2hvd0ltYWdlKCkge1xuICAgIC8qIHNob3cgaW1hZ2UgYXQgdGhlIHRvcCBvZiB0aGUgZm9ybSAqL1xuICAgIGNvbnN0IHtpbWFnZX0gPSB0aGlzLnN0YXRlLnZhbHVlcztcbiAgICBpZiAoIWltYWdlKVxuICAgICAgcmV0dXJuIDxkaXYga2V5PSdpbWFnZSc+PC9kaXY+O1xuICAgIGlmIChpbWFnZS5zdWJzdHJpbmcoMCw0KT09PSc8P3htJykge1xuICAgICAgY29uc3QgYmFzZTY0ZGF0YSA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGltYWdlKSkpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J2QtZmxleCBqdXN0aWZ5LWNvbnRlbnQtY2VudGVyJyBrZXk9J2ltYWdlJz5cbiAgICAgICAgICA8aW1nIHNyYz17J2RhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsJytiYXNlNjRkYXRhfSB3aWR0aD0nNDAlJyBhbHQ9J3N2Zy1mb3JtYXQnPjwvaW1nPlxuICAgICAgICA8L2Rpdj4pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nZC1mbGV4IGp1c3RpZnktY29udGVudC1jZW50ZXInICBrZXk9J2ltYWdlJz5cbiAgICAgICAgICA8aW1nIHNyYz17aW1hZ2V9IHdpZHRoPSc0MCUnIGFsdD0nYmFzZTY0LWZvcm1hdCc+PC9pbWc+XG4gICAgICAgIDwvZGl2Pik7XG4gICAgfVxuICB9XG5cblxuICAvKiogdGhlIHJlbmRlciBtZXRob2QgKiovXG4gIHJlbmRlcigpe1xuICAgIGlmICghdGhpcy5zdGF0ZS5vbnRvbG9neU5vZGUpXG4gICAgICByZXR1cm4gPGRpdj48L2Rpdj47XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibW9kYWxcIiBzdHlsZT17ey4uLm1vZGFsLCBkaXNwbGF5OiB0aGlzLnN0YXRlLnNob3d9fT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtb2RhbC1jb250ZW50XCIgc3R5bGU9e3suLi5tb2RhbENvbnRlbnQsIHdpZHRoOic2MCUnfX0+XG4gICAgICAgICAgPGRpdiAgY2xhc3NOYW1lPVwiY29sXCI+XG4gICAgICAgICAgICB7dGhpcy5zaG93SW1hZ2UoKX1cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1wb3B1cCBtLTJcIiA+XG4gICAgICAgICAgICAgIDxmb3JtIGNsYXNzTmFtZT1cImZvcm0tY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAge3RoaXMuc2hvd0xpc3QoKX1cbiAgICAgICAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9eygpPT50aGlzLnNldFN0YXRlKHtzaG93Oidub25lJ30pfVxuICAgICAgICAgICAgICAgICAgdmFyaWFudD1cImNvbnRhaW5lZFwiIGNsYXNzTmFtZT0nZmxvYXQtcmlnaHQgbXktMiBtbC0yIG1yLTAnIGlkPSdjbG9zZUJ0bicgc3R5bGU9e2J0bn0+XG4gICAgICAgICAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgIDxCdXR0b24gb25DbGljaz17KCk9PnRoaXMuc3VibWl0KCdjbG9zZScpfSBkaXNhYmxlZD17dGhpcy5zdGF0ZS5kaXNhYmxlU3VibWl0ICYmIHRydWV9XG4gICAgICAgICAgICAgICAgICB2YXJpYW50PVwiY29udGFpbmVkXCIgY2xhc3NOYW1lPSdmbG9hdC1yaWdodCBtLTInIGlkPSdzdWJtaXRCdG4nXG4gICAgICAgICAgICAgICAgICBzdHlsZT17dGhpcy5zdGF0ZS5kaXNhYmxlU3VibWl0ID8gYnRuU3Ryb25nRGVhY3RpdmUgOiBidG5TdHJvbmd9PlxuICAgICAgICAgICAgICAgICAgICBTdWJtaXQgJmFtcDsgY2xvc2VcbiAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgICB7KHRoaXMuc3RhdGUua2luZD09J25ldycgJiYgdGhpcy5zdGF0ZS5kb2NUeXBlIT0neDAnKSAmJlxuICAgICAgICAgICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoKT0+dGhpcy5zdWJtaXQoJ29wZW4nKX0gZGlzYWJsZWQ9e3RoaXMuc3RhdGUuZGlzYWJsZVN1Ym1pdH1cbiAgICAgICAgICAgICAgICAgICAgdmFyaWFudD1cImNvbnRhaW5lZFwiIGNsYXNzTmFtZT0nZmxvYXQtcmlnaHQgbS0yJyBpZD0nc3VibWl0QnRuJ1xuICAgICAgICAgICAgICAgICAgICBzdHlsZT17dGhpcy5zdGF0ZS5kaXNhYmxlU3VibWl0ID8gYnRuU3Ryb25nRGVhY3RpdmUgOiBidG5TdHJvbmd9PlxuICAgICAgICAgICAgICAgICAgICBTdWJtaXRcbiAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPn1cbiAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuIl0sImZpbGUiOiJyZW5kZXJlci9jb21wb25lbnRzL01vZGFsRm9ybS5qcyJ9
