"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _reactMarkdown = _interopRequireDefault(require("react-markdown"));

var _core = require("@material-ui/core");

var _ExpandMore = _interopRequireDefault(require("@material-ui/icons/ExpandMore"));

var _AddCircle = _interopRequireDefault(require("@material-ui/icons/AddCircle"));

var _Edit = _interopRequireDefault(require("@material-ui/icons/Edit"));

var _Delete = _interopRequireDefault(require("@material-ui/icons/Delete"));

var _Flag = _interopRequireDefault(require("@material-ui/icons/Flag"));

var _Store = _interopRequireDefault(require("../Store"));

var Actions = _interopRequireWildcard(require("../Actions"));

var _Dispatcher = _interopRequireDefault(require("../Dispatcher"));

var _ModalAddAttachment = _interopRequireDefault(require("./ModalAddAttachment"));

var _style = require("../style");

var _localInteraction = require("../localInteraction");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* List of details on the right side
*/
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
class DocDetail extends _react.Component {
  //initialize
  constructor() {
    super();

    this.handleActions = action => {
      /* handle actions via Actions->Dispatcher from other pages */
      if (action.type === 'RESTART_DOCDETAIL') {
        this.setState({
          doc: {}
        });
      }
    };

    this.getDoc = () => {
      /* initial function after docID is known */
      const doc = _Store.default.getDocumentRaw();

      const extractors = _Store.default.getExtractors();

      const initialChoice = extractors[doc['-type'].join('/')] ? extractors[doc['-type'].join('/')] : '';

      var url = _Store.default.getURL();

      if ('-attachment' in doc) {
        Object.keys(doc['-attachment']).map(key => {
          doc['-attachment'][key].map(line => {
            if (line.docID && line.docID.length > 1) //start filling local database of items
              url.url.get(url.path + line.docID).then(res => {
                var docID2names = this.state.docID2names;
                docID2names[line.docID] = res.data['-name'];
                this.setState({
                  docID2names: docID2names
                });
              }).catch(() => {
                console.log('DocDetail:getDoc: Error encountered: ' + url.path + line.docID);
              });
          });
        });
      } else {
        this.setState({
          docID2names: {}
        });
      }

      this.setState({
        doc: doc,
        extractors: extractors,
        extractorChoices: Object.values(extractors),
        extractorChoice: initialChoice,
        ontologyNode: _Store.default.getOntologyNode(doc['-type'])
      });
    };

    this.pressedButton = task => {
      /** any button press on this page
       * sibling for pressedButton in Project.js: change both similarly */
      if (task == 'btn_detail_be_redo') {
        Actions.comState('busy');
        (0, _localInteraction.executeCmd)(task, this.callback, this.state.doc._id, this.state.doc['-type'].join('/'));
      } else if (task == 'delete') {
        _Store.default.deleteDoc();

        this.setState({
          doc: {}
        });
      }
    };

    this.callback = content => {
      /* callback for all executeCmd functions */
      const contentArray = content.trim().split('\n');
      const lastLine = contentArray[contentArray.length - 1].split(' ');

      if (lastLine[0] === 'SUCCESS') {
        Actions.comState('ok');
        Actions.readDoc(this.state.doc._id); //read change

        Actions.readTable();
        this.getDoc(); //get from store
      } else {
        Actions.comState('fail');
      }
    };

    this.toggleAddAttachment = name => {
      /** change visibility of configuration modal */
      if (this.state.showAttachment === 'none') {
        this.setState({
          showAttachment: 'block',
          attachmentName: name
        });
      } else {
        this.setState({
          showAttachment: 'none'
        });
      }
    };

    this.followLink = docID => {
      /* follow link to another document possibly of another type */
      Actions.readDoc(docID);
    };

    this.changeSelector = event => {
      /* chose an element from the drop-down menu*/
      this.setState({
        extractorChoice: event.target.value
      });
      var key = Object.values(this.state.extractors).indexOf(event.target.value);
      key = Object.keys(this.state.extractors)[key];
      Actions.updateDoc({
        '-type': key
      }, this.state.doc); //change docType in document

      this.pressedButton('btn_detail_be_redo'); //create new image
    };

    this.state = {
      doc: _Store.default.getDocumentRaw(),
      extractors: [],
      extractorChoices: [],
      extractorChoice: '',
      docID2names: {},
      dispatcherToken: null,
      showAttachment: 'none',
      attachmentName: null,
      imageSize: _Store.default.getGUIConfig('imageSize'),
      ontologyNode: null
    };
  }

  componentDidMount() {
    this.setState({
      doc: {}
    });

    _Store.default.on('changeDoc', this.getDoc);

    this.setState({
      dispatcherToken: _Dispatcher.default.register(this.handleActions)
    });
  }

  componentWillUnmount() {
    _Store.default.removeListener('changeDoc', this.getDoc);

    _Dispatcher.default.unregister(this.state.dispatcherToken);
  }
  /** Functions as class properties (immediately bound): react on user interactions **/


  /** create html-structure; all should return at least <div></div> **/
  showSpecial(key, heading) {
    /* Show content (of procedure), user metadata, vendor metadata, attachment */
    const {
      doc
    } = this.state;

    if (doc[key] && heading == null) {
      //content
      return /*#__PURE__*/_react.default.createElement(_reactMarkdown.default, {
        className: "ml-3",
        source: doc[key]
      });
    } else {
      //attachment and user metadata and vendor metadata
      var docItems = null;
      if (doc[key] && (key == 'metaUser' || key == 'metaVendor')) docItems = Object.keys(doc[key]).map(item => {
        const v = typeof doc[key][item] === 'string' || doc[key][item] instanceof String || typeof doc[key][item] === 'number' ? doc[key][item] : JSON.stringify(doc[key][item]);
        return /*#__PURE__*/_react.default.createElement("div", {
          key: key + '_' + item
        }, item, ": ", /*#__PURE__*/_react.default.createElement("strong", null, v));
      });

      if (key == '-attachment') {
        const attachments = _Store.default.getOntologyNode().filter(i => {
          return i.attachment;
        });

        if (attachments.length > 0) docItems = attachments.map(item => {
          var attachment = item.attachment;
          return /*#__PURE__*/_react.default.createElement("div", {
            key: key + '_' + attachment
          }, /*#__PURE__*/_react.default.createElement("strong", null, attachment, ":"), /*#__PURE__*/_react.default.createElement(_core.IconButton, {
            onClick: () => this.toggleAddAttachment(attachment),
            className: "ml-2",
            size: "small"
          }, /*#__PURE__*/_react.default.createElement(_AddCircle.default, {
            fontSize: "small"
          })), /*#__PURE__*/_react.default.createElement("br", null), doc[key] && doc[key][item.attachment] && this.renderAttachment(doc[key][item.attachment]));
        });
        /* } */
      }

      if (Object.keys(doc).length > 0 && docItems && docItems.length > 0) return /*#__PURE__*/_react.default.createElement(_core.Accordion, {
        TransitionProps: {
          unmountOnExit: true,
          timeout: 0
        },
        defaultExpanded: true
      }, /*#__PURE__*/_react.default.createElement(_core.AccordionSummary, {
        expandIcon: /*#__PURE__*/_react.default.createElement(_ExpandMore.default, null),
        style: _style.btn
      }, heading), /*#__PURE__*/_react.default.createElement(_core.AccordionDetails, null, /*#__PURE__*/_react.default.createElement("div", null, docItems)));else return /*#__PURE__*/_react.default.createElement("div", null);
    }
  }

  renderAttachment(attachment) {
    /* render list of attachment changes into div*/
    const lines = attachment.map(item => {
      return /*#__PURE__*/_react.default.createElement("div", {
        key: 'attachment' + item.date
      }, new Date(item.date).toLocaleString(), ": ", item.remark, " ", item.flag && /*#__PURE__*/_react.default.createElement(_Flag.default, {
        style: {
          color: 'red'
        }
      }), /*#__PURE__*/_react.default.createElement("br", null), " \xA0\xA0", item.docID in this.state.docID2names ? this.state.docID2names[item.docID] : item.docID, item.docID == '' && '-detached-', "\xA0by user: ", item.user);
    });
    return /*#__PURE__*/_react.default.createElement("div", null, lines);
  }

  show(showDB = true) {
    /* show either database details (true) or all other information (the main) (false)
       SAME AS IN Project:showMisc()    */
    const {
      doc
    } = this.state;
    if (!doc._id) return /*#__PURE__*/_react.default.createElement("div", null);
    const docItems = Object.keys(doc).map((item, idx) => {
      if (_Store.default.itemSkip.indexOf(item) > -1) {
        return /*#__PURE__*/_react.default.createElement("div", {
          key: 'B' + idx.toString()
        });
      }

      const label = item.charAt(0).toUpperCase() + item.slice(1);

      if (showDB && _Store.default.itemDB.indexOf(item) > -1) {
        if (typeof doc[item] == 'string') return /*#__PURE__*/_react.default.createElement("div", {
          key: 'B' + idx.toString()
        }, label, ": ", /*#__PURE__*/_react.default.createElement("strong", null, doc[item]));else return /*#__PURE__*/_react.default.createElement("div", {
          key: 'B' + idx.toString()
        }, label, ": ", /*#__PURE__*/_react.default.createElement("strong", null, JSON.stringify(doc[item])));
      }

      if (!showDB && _Store.default.itemDB.indexOf(item) == -1) {
        var desc = null;
        var description = this.state.ontologyNode;
        if (this.state.ontologyNode) description = description.filter(i => {
          return i.name == item;
        });
        if (description && description.length > 0 && item != 'comment') description = description[0];
        if (description && 'query' in description) desc = description['query'];
        if (/^[a-wyz]-[\w\d]{32}$/.test(doc[item])) //if link to other dataset
          return /*#__PURE__*/_react.default.createElement("div", {
            key: 'B' + idx.toString()
          }, " ", label, ":", /*#__PURE__*/_react.default.createElement("strong", {
            onClick: () => this.followLink(doc[item]),
            style: {
              cursor: 'pointer'
            }
          }, " Link"), "\xA0", desc ? '(' + desc + ')' : '');else {
          if (item == '-name') //skip name
            return /*#__PURE__*/_react.default.createElement("div", {
              key: "B_name"
            });
          if (typeof doc[item] == 'string' && doc[item].indexOf('\n') > 0) //if string with /n
            return /*#__PURE__*/_react.default.createElement("div", {
              key: 'B' + idx.toString()
            }, label, ": \xA0", desc ? '(' + desc + ')' : '', /*#__PURE__*/_react.default.createElement(_reactMarkdown.default, {
              source: doc[item]
            })); //TODO_P3 reactMarkdown not rendered correctly

          if (['string', 'number'].indexOf(typeof doc[item]) > -1) //if normal string
            return /*#__PURE__*/_react.default.createElement("div", {
              key: 'B' + idx.toString()
            }, label, ": ", /*#__PURE__*/_react.default.createElement("strong", null, doc[item]), "\xA0", desc ? '(' + desc + ')' : '');
          const value = doc[item].length > 0 ? doc[item].join(', ') : '';
          return /*#__PURE__*/_react.default.createElement("div", {
            key: 'B' + idx.toString()
          }, label, ": ", /*#__PURE__*/_react.default.createElement("strong", null, value), "\xA0", desc ? '(' + desc + ')' : '');
        }
      }

      return /*#__PURE__*/_react.default.createElement("div", {
        key: 'B' + idx.toString()
      });
    });
    var heading = showDB ? 'Database details' : 'Metadata';
    return /*#__PURE__*/_react.default.createElement(_core.Accordion, {
      TransitionProps: {
        unmountOnExit: true,
        timeout: 0
      },
      defaultExpanded: showDB ? false : true
    }, /*#__PURE__*/_react.default.createElement(_core.AccordionSummary, {
      expandIcon: /*#__PURE__*/_react.default.createElement(_ExpandMore.default, null),
      style: _style.btn
    }, heading), /*#__PURE__*/_react.default.createElement(_core.AccordionDetails, null, /*#__PURE__*/_react.default.createElement("div", null, docItems)));
  }

  showImage() {
    /* show image stored in document*/
    const {
      image
    } = this.state.doc;

    if (!image) {
      return /*#__PURE__*/_react.default.createElement("div", null);
    }

    var fullImage = image;
    var alt = 'base64-format';

    if (image.substring(0, 4) === '<?xm') {
      const base64data = btoa(unescape(encodeURIComponent(image)));
      fullImage = 'data:image/svg+xml;base64,' + base64data;
      alt = 'svg-format';
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "d-flex justify-content-center"
    }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("center", null, /*#__PURE__*/_react.default.createElement("img", {
      src: fullImage,
      width: this.state.imageSize,
      alt: alt
    })), /*#__PURE__*/_react.default.createElement(_core.FormControl, {
      fullWidth: true,
      className: "col-sm-12 pl-3 pr-1"
    }, /*#__PURE__*/_react.default.createElement(_core.Select, {
      onChange: e => this.changeSelector(e),
      value: this.state.extractorChoice
    }, this.state.extractorChoices.map(item => {
      return /*#__PURE__*/_react.default.createElement(_core.MenuItem, {
        value: item,
        key: item
      }, item);
    })))));
  }
  /** the render method **/


  render() {
    if (this.state.doc._id === '-ontology-') //if no document is opened, because none is present, skip
      return /*#__PURE__*/_react.default.createElement("div", null);
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "col px-1",
      style: {
        height: window.innerHeight - 38,
        overflowY: 'scroll'
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "row"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "m-3 px-3",
      style: _style.h1
    }, this.state.doc['-name']), /*#__PURE__*/_react.default.createElement("div", {
      className: "ml-auto"
    }, this.state.doc && this.state.doc._id && /*#__PURE__*/_react.default.createElement(_core.IconButton, {
      onClick: () => Actions.showForm('edit', null, null),
      className: "m-0",
      id: "editDataBtn"
    }, /*#__PURE__*/_react.default.createElement(_Edit.default, {
      fontSize: "large",
      style: {
        color: _style.colorStrong
      }
    })), this.state.doc && this.state.doc._id && /*#__PURE__*/_react.default.createElement(_core.IconButton, {
      onClick: () => this.pressedButton('delete'),
      className: "m-0 mr-3",
      id: "DeleteBtn"
    }, /*#__PURE__*/_react.default.createElement(_Delete.default, {
      fontSize: "large"
    })), /*#__PURE__*/_react.default.createElement(_ModalAddAttachment.default, {
      show: this.state.showAttachment,
      callback: this.toggleAddAttachment,
      name: this.state.attachmentName,
      docType: this.state.doc['-type']
    }))), this.showImage(), this.showSpecial('content', null), this.show(false), this.showSpecial('metaUser', 'User metadata'), this.showSpecial('metaVendor', 'Vendor metadata'), this.showSpecial('-attachment', 'Attachments'), this.show());
  }

}

exports.default = DocDetail;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlcmVyL2NvbXBvbmVudHMvRG9jRGV0YWlsLmpzIl0sIm5hbWVzIjpbIkRvY0RldGFpbCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwiaGFuZGxlQWN0aW9ucyIsImFjdGlvbiIsInR5cGUiLCJzZXRTdGF0ZSIsImRvYyIsImdldERvYyIsIlN0b3JlIiwiZ2V0RG9jdW1lbnRSYXciLCJleHRyYWN0b3JzIiwiZ2V0RXh0cmFjdG9ycyIsImluaXRpYWxDaG9pY2UiLCJqb2luIiwidXJsIiwiZ2V0VVJMIiwiT2JqZWN0Iiwia2V5cyIsIm1hcCIsImtleSIsImxpbmUiLCJkb2NJRCIsImxlbmd0aCIsImdldCIsInBhdGgiLCJ0aGVuIiwicmVzIiwiZG9jSUQybmFtZXMiLCJzdGF0ZSIsImRhdGEiLCJjYXRjaCIsImNvbnNvbGUiLCJsb2ciLCJleHRyYWN0b3JDaG9pY2VzIiwidmFsdWVzIiwiZXh0cmFjdG9yQ2hvaWNlIiwib250b2xvZ3lOb2RlIiwiZ2V0T250b2xvZ3lOb2RlIiwicHJlc3NlZEJ1dHRvbiIsInRhc2siLCJBY3Rpb25zIiwiY29tU3RhdGUiLCJjYWxsYmFjayIsIl9pZCIsImRlbGV0ZURvYyIsImNvbnRlbnQiLCJjb250ZW50QXJyYXkiLCJ0cmltIiwic3BsaXQiLCJsYXN0TGluZSIsInJlYWREb2MiLCJyZWFkVGFibGUiLCJ0b2dnbGVBZGRBdHRhY2htZW50IiwibmFtZSIsInNob3dBdHRhY2htZW50IiwiYXR0YWNobWVudE5hbWUiLCJmb2xsb3dMaW5rIiwiY2hhbmdlU2VsZWN0b3IiLCJldmVudCIsInRhcmdldCIsInZhbHVlIiwiaW5kZXhPZiIsInVwZGF0ZURvYyIsImRpc3BhdGNoZXJUb2tlbiIsImltYWdlU2l6ZSIsImdldEdVSUNvbmZpZyIsImNvbXBvbmVudERpZE1vdW50Iiwib24iLCJkaXNwYXRjaGVyIiwicmVnaXN0ZXIiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUxpc3RlbmVyIiwidW5yZWdpc3RlciIsInNob3dTcGVjaWFsIiwiaGVhZGluZyIsImRvY0l0ZW1zIiwiaXRlbSIsInYiLCJTdHJpbmciLCJKU09OIiwic3RyaW5naWZ5IiwiYXR0YWNobWVudHMiLCJmaWx0ZXIiLCJpIiwiYXR0YWNobWVudCIsInJlbmRlckF0dGFjaG1lbnQiLCJ1bm1vdW50T25FeGl0IiwidGltZW91dCIsImJ0biIsImxpbmVzIiwiZGF0ZSIsIkRhdGUiLCJ0b0xvY2FsZVN0cmluZyIsInJlbWFyayIsImZsYWciLCJjb2xvciIsInVzZXIiLCJzaG93Iiwic2hvd0RCIiwiaWR4IiwiaXRlbVNraXAiLCJ0b1N0cmluZyIsImxhYmVsIiwiY2hhckF0IiwidG9VcHBlckNhc2UiLCJzbGljZSIsIml0ZW1EQiIsImRlc2MiLCJkZXNjcmlwdGlvbiIsInRlc3QiLCJjdXJzb3IiLCJzaG93SW1hZ2UiLCJpbWFnZSIsImZ1bGxJbWFnZSIsImFsdCIsInN1YnN0cmluZyIsImJhc2U2NGRhdGEiLCJidG9hIiwidW5lc2NhcGUiLCJlbmNvZGVVUklDb21wb25lbnQiLCJlIiwicmVuZGVyIiwiaGVpZ2h0Iiwid2luZG93IiwiaW5uZXJIZWlnaHQiLCJvdmVyZmxvd1kiLCJoMSIsInNob3dGb3JtIiwiY29sb3JTdHJvbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFFQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFoQkE7QUFDQTtBQUNrRDtBQUNBO0FBRW9CO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDVDtBQUlJO0FBSXZDLE1BQU1BLFNBQU4sU0FBd0JDLGdCQUF4QixDQUFrQztBQUMvQztBQUNBQyxFQUFBQSxXQUFXLEdBQUc7QUFDWjs7QUFEWSxTQTJCZEMsYUEzQmMsR0EyQkNDLE1BQUQsSUFBVTtBQUN0QjtBQUNBLFVBQUlBLE1BQU0sQ0FBQ0MsSUFBUCxLQUFjLG1CQUFsQixFQUF1QztBQUNyQyxhQUFLQyxRQUFMLENBQWM7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TUFBQSxFQUFFLEVBQUM7QUFBaEYsb0JBQ0UsNkJBQUMsZUFBRDtBQUFRLE1BQUEsUUFBUSxFQUFDO0FBQWpCLE1BREYsQ0FYRixlQWNFLDZCQUFDLDJCQUFEO0FBQW9CLE1BQUEsSUFBSSxFQUFFLEtBQUtWLEtBQUwsQ0FBVzBCLGNBQXJDO0FBQXFELE1BQUEsUUFBUSxFQUFFLEtBQUtGLG1CQUFwRTtBQUNFLE1BQUEsSUFBSSxFQUFFLEtBQUt4QixLQUFMLENBQVcyQixjQURuQjtBQUNtQyxNQUFBLE9BQU8sRUFBRSxLQUFLM0IsS0FBTCxDQUFXdEIsR0FBWCxDQUFlLE9BQWY7QUFENUMsTUFkRixDQUZGLENBREYsRUFxQkcsS0FBS3lHLFNBQUwsRUFyQkgsRUFzQkcsS0FBS3RDLFdBQUwsQ0FBaUIsU0FBakIsRUFBK0IsSUFBL0IsQ0F0QkgsRUF1QkcsS0FBS3dCLElBQUwsQ0FBVSxLQUFWLENBdkJILEVBd0JHLEtBQUt4QixXQUFMLENBQWlCLFVBQWpCLEVBQStCLGVBQS9CLENBeEJILEVBeUJHLEtBQUtBLFdBQUwsQ0FBaUIsWUFBakIsRUFBK0IsaUJBQS9CLENBekJILEVBMEJHLEtBQUtBLFdBQUwsQ0FBaUIsYUFBakIsRUFBK0IsYUFBL0IsQ0ExQkgsRUEyQkcsS0FBS3dCLElBQUwsRUEzQkgsQ0FERjtBQStCRDs7QUFoVDhDIiwic291cmNlc0NvbnRlbnQiOlsiLyogTGlzdCBvZiBkZXRhaWxzIG9uIHRoZSByaWdodCBzaWRlXG4qL1xuaW1wb3J0IFJlYWN0LCB7IENvbXBvbmVudCB9IGZyb20gJ3JlYWN0JzsgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgUmVhY3RNYXJrZG93biBmcm9tICdyZWFjdC1tYXJrZG93bic7ICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCB7IEFjY29yZGlvbiwgQWNjb3JkaW9uU3VtbWFyeSwgQWNjb3JkaW9uRGV0YWlscywgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgRm9ybUNvbnRyb2wsIFNlbGVjdCwgTWVudUl0ZW0sIEljb25CdXR0b259IGZyb20gJ0BtYXRlcmlhbC11aS9jb3JlJzsvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgRXhwYW5kTW9yZUljb24gZnJvbSAnQG1hdGVyaWFsLXVpL2ljb25zL0V4cGFuZE1vcmUnOy8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCBBZGRDaXJjbGVJY29uIGZyb20gJ0BtYXRlcmlhbC11aS9pY29ucy9BZGRDaXJjbGUnOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IEVkaXQgZnJvbSAnQG1hdGVyaWFsLXVpL2ljb25zL0VkaXQnOyAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgRGVsZXRlIGZyb20gJ0BtYXRlcmlhbC11aS9pY29ucy9EZWxldGUnOyAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCBGbGFnIGZyb20gJ0BtYXRlcmlhbC11aS9pY29ucy9GbGFnJzsgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IFN0b3JlIGZyb20gJy4uL1N0b3JlJztcbmltcG9ydCAqIGFzIEFjdGlvbnMgZnJvbSAnLi4vQWN0aW9ucyc7XG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuLi9EaXNwYXRjaGVyJztcbmltcG9ydCBNb2RhbEFkZEF0dGFjaG1lbnQgZnJvbSAnLi9Nb2RhbEFkZEF0dGFjaG1lbnQnOy8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCB7IGJ0biwgY29sb3JTdHJvbmcsIGgxIH0gZnJvbSAnLi4vc3R5bGUnO1xuaW1wb3J0IHsgZXhlY3V0ZUNtZCB9IGZyb20gJy4uL2xvY2FsSW50ZXJhY3Rpb24nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEb2NEZXRhaWwgZXh0ZW5kcyBDb21wb25lbnQge1xuICAvL2luaXRpYWxpemVcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgZG9jOiBTdG9yZS5nZXREb2N1bWVudFJhdygpLFxuICAgICAgZXh0cmFjdG9yczogW10sXG4gICAgICBleHRyYWN0b3JDaG9pY2VzOiBbXSxcbiAgICAgIGV4dHJhY3RvckNob2ljZTogJycsXG4gICAgICBkb2NJRDJuYW1lczoge30sXG4gICAgICBkaXNwYXRjaGVyVG9rZW46IG51bGwsXG4gICAgICBzaG93QXR0YWNobWVudDogJ25vbmUnLFxuICAgICAgYXR0YWNobWVudE5hbWU6IG51bGwsXG4gICAgICBpbWFnZVNpemU6IFN0b3JlLmdldEdVSUNvbmZpZygnaW1hZ2VTaXplJyksXG4gICAgICBvbnRvbG9neU5vZGU6IG51bGxcbiAgICB9O1xuICB9XG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe2RvYzp7fSB9KTtcbiAgICBTdG9yZS5vbignY2hhbmdlRG9jJywgdGhpcy5nZXREb2MpO1xuICAgIHRoaXMuc2V0U3RhdGUoe2Rpc3BhdGNoZXJUb2tlbjogZGlzcGF0Y2hlci5yZWdpc3Rlcih0aGlzLmhhbmRsZUFjdGlvbnMpfSk7XG4gIH1cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgU3RvcmUucmVtb3ZlTGlzdGVuZXIoJ2NoYW5nZURvYycsIHRoaXMuZ2V0RG9jKTtcbiAgICBkaXNwYXRjaGVyLnVucmVnaXN0ZXIodGhpcy5zdGF0ZS5kaXNwYXRjaGVyVG9rZW4pO1xuICB9XG5cblxuICAvKiogRnVuY3Rpb25zIGFzIGNsYXNzIHByb3BlcnRpZXMgKGltbWVkaWF0ZWx5IGJvdW5kKTogcmVhY3Qgb24gdXNlciBpbnRlcmFjdGlvbnMgKiovXG4gIGhhbmRsZUFjdGlvbnM9KGFjdGlvbik9PntcbiAgICAvKiBoYW5kbGUgYWN0aW9ucyB2aWEgQWN0aW9ucy0+RGlzcGF0Y2hlciBmcm9tIG90aGVyIHBhZ2VzICovXG4gICAgaWYgKGFjdGlvbi50eXBlPT09J1JFU1RBUlRfRE9DREVUQUlMJykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7ZG9jOnt9IH0pO1xuICAgIH1cbiAgfVxuXG4gIGdldERvYz0oKT0+e1xuICAgIC8qIGluaXRpYWwgZnVuY3Rpb24gYWZ0ZXIgZG9jSUQgaXMga25vd24gKi9cbiAgICBjb25zdCBkb2MgPSBTdG9yZS5nZXREb2N1bWVudFJhdygpO1xuICAgIGNvbnN0IGV4dHJhY3RvcnMgPSBTdG9yZS5nZXRFeHRyYWN0b3JzKCk7XG4gICAgY29uc3QgaW5pdGlhbENob2ljZSA9IGV4dHJhY3RvcnNbZG9jWyctdHlwZSddLmpvaW4oJy8nKV0gPyBleHRyYWN0b3JzW2RvY1snLXR5cGUnXS5qb2luKCcvJyldIDogJyc7XG4gICAgdmFyIHVybCA9IFN0b3JlLmdldFVSTCgpO1xuICAgIGlmICgnLWF0dGFjaG1lbnQnIGluIGRvYykge1xuICAgICAgT2JqZWN0LmtleXMoZG9jWyctYXR0YWNobWVudCddKS5tYXAoa2V5PT57XG4gICAgICAgIGRvY1snLWF0dGFjaG1lbnQnXVtrZXldLm1hcChsaW5lPT57XG4gICAgICAgICAgaWYgKGxpbmUuZG9jSUQgJiYgbGluZS5kb2NJRC5sZW5ndGggPjEpXG4gICAgICAgICAgICAvL3N0YXJ0IGZpbGxpbmcgbG9jYWwgZGF0YWJhc2Ugb2YgaXRlbXNcbiAgICAgICAgICAgIHVybC51cmwuZ2V0KHVybC5wYXRoK2xpbmUuZG9jSUQpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICB2YXIgZG9jSUQybmFtZXMgPSB0aGlzLnN0YXRlLmRvY0lEMm5hbWVzO1xuICAgICAgICAgICAgICBkb2NJRDJuYW1lc1tsaW5lLmRvY0lEXT1yZXMuZGF0YVsnLW5hbWUnXTtcbiAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZG9jSUQybmFtZXM6IGRvY0lEMm5hbWVzfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoKT0+e1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRG9jRGV0YWlsOmdldERvYzogRXJyb3IgZW5jb3VudGVyZWQ6ICcrdXJsLnBhdGgrbGluZS5kb2NJRCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7ZG9jSUQybmFtZXM6IHt9fSk7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe2RvYzogZG9jLFxuICAgICAgZXh0cmFjdG9yczogZXh0cmFjdG9ycyxcbiAgICAgIGV4dHJhY3RvckNob2ljZXM6IE9iamVjdC52YWx1ZXMoZXh0cmFjdG9ycyksXG4gICAgICBleHRyYWN0b3JDaG9pY2U6ICBpbml0aWFsQ2hvaWNlLFxuICAgICAgb250b2xvZ3lOb2RlOiBTdG9yZS5nZXRPbnRvbG9neU5vZGUoZG9jWyctdHlwZSddKSB9KTtcbiAgfVxuXG5cbiAgcHJlc3NlZEJ1dHRvbj0odGFzayk9PntcbiAgICAvKiogYW55IGJ1dHRvbiBwcmVzcyBvbiB0aGlzIHBhZ2VcbiAgICAgKiBzaWJsaW5nIGZvciBwcmVzc2VkQnV0dG9uIGluIFByb2plY3QuanM6IGNoYW5nZSBib3RoIHNpbWlsYXJseSAqL1xuICAgIGlmICh0YXNrPT0nYnRuX2RldGFpbF9iZV9yZWRvJykge1xuICAgICAgQWN0aW9ucy5jb21TdGF0ZSgnYnVzeScpO1xuICAgICAgZXhlY3V0ZUNtZCh0YXNrLCB0aGlzLmNhbGxiYWNrLCB0aGlzLnN0YXRlLmRvYy5faWQsIHRoaXMuc3RhdGUuZG9jWyctdHlwZSddLmpvaW4oJy8nKSApO1xuICAgIH0gZWxzZSBpZiAodGFzaz09J2RlbGV0ZScpIHtcbiAgICAgIFN0b3JlLmRlbGV0ZURvYygpO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7ZG9jOnt9IH0pO1xuICAgIH1cbiAgfVxuICBjYWxsYmFjaz0oY29udGVudCk9PntcbiAgICAvKiBjYWxsYmFjayBmb3IgYWxsIGV4ZWN1dGVDbWQgZnVuY3Rpb25zICovXG4gICAgY29uc3QgY29udGVudEFycmF5ID0gY29udGVudC50cmltKCkuc3BsaXQoJ1xcbicpO1xuICAgIGNvbnN0IGxhc3RMaW5lID0gY29udGVudEFycmF5W2NvbnRlbnRBcnJheS5sZW5ndGgtMV0uc3BsaXQoJyAnKTtcbiAgICBpZiggbGFzdExpbmVbMF09PT0nU1VDQ0VTUycgKXtcbiAgICAgIEFjdGlvbnMuY29tU3RhdGUoJ29rJyk7XG4gICAgICBBY3Rpb25zLnJlYWREb2ModGhpcy5zdGF0ZS5kb2MuX2lkKTsgICAgICAgICAgICAvL3JlYWQgY2hhbmdlXG4gICAgICBBY3Rpb25zLnJlYWRUYWJsZSgpO1xuICAgICAgdGhpcy5nZXREb2MoKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgZnJvbSBzdG9yZVxuICAgIH0gZWxzZSB7XG4gICAgICBBY3Rpb25zLmNvbVN0YXRlKCdmYWlsJyk7XG4gICAgfVxuICB9XG5cbiAgdG9nZ2xlQWRkQXR0YWNobWVudD0obmFtZSk9PntcbiAgICAvKiogY2hhbmdlIHZpc2liaWxpdHkgb2YgY29uZmlndXJhdGlvbiBtb2RhbCAqL1xuICAgIGlmKHRoaXMuc3RhdGUuc2hvd0F0dGFjaG1lbnQ9PT0nbm9uZScpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dBdHRhY2htZW50OiAnYmxvY2snLCBhdHRhY2htZW50TmFtZTpuYW1lfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dBdHRhY2htZW50OiAnbm9uZSd9KTtcbiAgICB9XG4gIH1cblxuXG4gIGZvbGxvd0xpbms9KGRvY0lEKT0+e1xuICAgIC8qIGZvbGxvdyBsaW5rIHRvIGFub3RoZXIgZG9jdW1lbnQgcG9zc2libHkgb2YgYW5vdGhlciB0eXBlICovXG4gICAgQWN0aW9ucy5yZWFkRG9jKGRvY0lEKTtcbiAgfVxuXG4gIGNoYW5nZVNlbGVjdG9yPShldmVudCk9PntcbiAgICAvKiBjaG9zZSBhbiBlbGVtZW50IGZyb20gdGhlIGRyb3AtZG93biBtZW51Ki9cbiAgICB0aGlzLnNldFN0YXRlKHtleHRyYWN0b3JDaG9pY2U6IGV2ZW50LnRhcmdldC52YWx1ZX0pO1xuICAgIHZhciBrZXkgPSBPYmplY3QudmFsdWVzKHRoaXMuc3RhdGUuZXh0cmFjdG9ycykuaW5kZXhPZihldmVudC50YXJnZXQudmFsdWUpO1xuICAgIGtleSA9IE9iamVjdC5rZXlzKHRoaXMuc3RhdGUuZXh0cmFjdG9ycylba2V5XTtcbiAgICBBY3Rpb25zLnVwZGF0ZURvYyh7Jy10eXBlJzprZXl9LCB0aGlzLnN0YXRlLmRvYyk7ICAvL2NoYW5nZSBkb2NUeXBlIGluIGRvY3VtZW50XG4gICAgdGhpcy5wcmVzc2VkQnV0dG9uKCdidG5fZGV0YWlsX2JlX3JlZG8nKTsgICAgICAgLy9jcmVhdGUgbmV3IGltYWdlXG4gIH1cblxuICAvKiogY3JlYXRlIGh0bWwtc3RydWN0dXJlOyBhbGwgc2hvdWxkIHJldHVybiBhdCBsZWFzdCA8ZGl2PjwvZGl2PiAqKi9cbiAgc2hvd1NwZWNpYWwoa2V5LGhlYWRpbmcpIHtcbiAgICAvKiBTaG93IGNvbnRlbnQgKG9mIHByb2NlZHVyZSksIHVzZXIgbWV0YWRhdGEsIHZlbmRvciBtZXRhZGF0YSwgYXR0YWNobWVudCAqL1xuICAgIGNvbnN0IHtkb2N9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAoZG9jW2tleV0gJiYgaGVhZGluZz09bnVsbCkgeyAgICAgICAgICAgICAgICAvL2NvbnRlbnRcbiAgICAgIHJldHVybiA8UmVhY3RNYXJrZG93biBjbGFzc05hbWU9J21sLTMnIHNvdXJjZT17ZG9jW2tleV19IC8+O1xuICAgIH0gZWxzZSB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vYXR0YWNobWVudCBhbmQgdXNlciBtZXRhZGF0YSBhbmQgdmVuZG9yIG1ldGFkYXRhXG4gICAgICB2YXIgZG9jSXRlbXMgPSBudWxsO1xuICAgICAgaWYgKGRvY1trZXldICYmIChrZXk9PSdtZXRhVXNlcicgfHwga2V5PT0nbWV0YVZlbmRvcicpKVxuICAgICAgICBkb2NJdGVtcyA9IE9iamVjdC5rZXlzKGRvY1trZXldKS5tYXAoIGl0ZW0gPT57XG4gICAgICAgICAgY29uc3QgdiA9ICh0eXBlb2YgZG9jW2tleV1baXRlbV0gPT09ICdzdHJpbmcnIHx8IGRvY1trZXldW2l0ZW1dIGluc3RhbmNlb2YgU3RyaW5nIHx8XG4gICAgICAgICAgICAgICAgICAgICB0eXBlb2YgZG9jW2tleV1baXRlbV0gPT09ICdudW1iZXInICkgPyBkb2Nba2V5XVtpdGVtXSA6IEpTT04uc3RyaW5naWZ5KGRvY1trZXldW2l0ZW1dKTtcbiAgICAgICAgICByZXR1cm4gPGRpdiBrZXk9e2tleSsnXycraXRlbX0+e2l0ZW19OiA8c3Ryb25nPnt2fTwvc3Ryb25nPjwvZGl2PjtcbiAgICAgICAgfSk7XG4gICAgICBpZiAoa2V5PT0nLWF0dGFjaG1lbnQnKSB7XG4gICAgICAgIGNvbnN0IGF0dGFjaG1lbnRzID0gU3RvcmUuZ2V0T250b2xvZ3lOb2RlKCkuZmlsdGVyKGk9PntyZXR1cm4gaS5hdHRhY2htZW50O30pO1xuICAgICAgICBpZiAoYXR0YWNobWVudHMubGVuZ3RoPjApXG4gICAgICAgICAgZG9jSXRlbXMgPSBhdHRhY2htZW50cy5tYXAoaXRlbSA9PntcbiAgICAgICAgICAgIHZhciBhdHRhY2htZW50ID0gaXRlbS5hdHRhY2htZW50O1xuICAgICAgICAgICAgcmV0dXJuIDxkaXYga2V5PXtrZXkrJ18nK2F0dGFjaG1lbnR9PlxuICAgICAgICAgICAgICA8c3Ryb25nPnthdHRhY2htZW50fTo8L3N0cm9uZz5cbiAgICAgICAgICAgICAgPEljb25CdXR0b24gb25DbGljaz17KCkgPT4gdGhpcy50b2dnbGVBZGRBdHRhY2htZW50KGF0dGFjaG1lbnQpfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0nbWwtMicgc2l6ZT0nc21hbGwnPlxuICAgICAgICAgICAgICAgIDxBZGRDaXJjbGVJY29uIGZvbnRTaXplPSdzbWFsbCcvPlxuICAgICAgICAgICAgICA8L0ljb25CdXR0b24+XG4gICAgICAgICAgICAgIDxici8+XG4gICAgICAgICAgICAgIHtkb2Nba2V5XSAmJiBkb2Nba2V5XVtpdGVtLmF0dGFjaG1lbnRdICYmIHRoaXMucmVuZGVyQXR0YWNobWVudChkb2Nba2V5XVtpdGVtLmF0dGFjaG1lbnRdKX1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICB9KTtcbiAgICAgICAgLyogfSAqL1xuICAgICAgfVxuICAgICAgaWYgKE9iamVjdC5rZXlzKGRvYykubGVuZ3RoPjAgJiYgZG9jSXRlbXMgJiYgZG9jSXRlbXMubGVuZ3RoPjApXG4gICAgICAgIHJldHVybiAoPEFjY29yZGlvbiBUcmFuc2l0aW9uUHJvcHM9e3t1bm1vdW50T25FeGl0OiB0cnVlLCB0aW1lb3V0OjB9fSBkZWZhdWx0RXhwYW5kZWQ+XG4gICAgICAgICAgPEFjY29yZGlvblN1bW1hcnkgZXhwYW5kSWNvbj17PEV4cGFuZE1vcmVJY29uLz59IHN0eWxlPXtidG59PlxuICAgICAgICAgICAge2hlYWRpbmd9XG4gICAgICAgICAgPC9BY2NvcmRpb25TdW1tYXJ5PlxuICAgICAgICAgIDxBY2NvcmRpb25EZXRhaWxzPjxkaXY+e2RvY0l0ZW1zfTwvZGl2PjwvQWNjb3JkaW9uRGV0YWlscz5cbiAgICAgICAgPC9BY2NvcmRpb24+KTtcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIDxkaXY+PC9kaXY+O1xuICAgIH1cbiAgfVxuXG5cblxuICByZW5kZXJBdHRhY2htZW50KGF0dGFjaG1lbnQpIHtcbiAgICAvKiByZW5kZXIgbGlzdCBvZiBhdHRhY2htZW50IGNoYW5nZXMgaW50byBkaXYqL1xuICAgIGNvbnN0IGxpbmVzID0gYXR0YWNobWVudC5tYXAoIGl0ZW09PntcbiAgICAgIHJldHVybiA8ZGl2IGtleT17J2F0dGFjaG1lbnQnK2l0ZW0uZGF0ZX0gPlxuICAgICAgICB7bmV3IERhdGUoaXRlbS5kYXRlKS50b0xvY2FsZVN0cmluZygpfToge2l0ZW0ucmVtYXJrfSB7aXRlbS5mbGFnICYmIDxGbGFnIHN0eWxlPXt7Y29sb3I6J3JlZCd9fS8+fVxuICAgICAgICA8YnIvPiAmbmJzcDsmbmJzcDtcbiAgICAgICAgeyhpdGVtLmRvY0lEIGluIHRoaXMuc3RhdGUuZG9jSUQybmFtZXMpID8gdGhpcy5zdGF0ZS5kb2NJRDJuYW1lc1tpdGVtLmRvY0lEXSA6IGl0ZW0uZG9jSUR9XG4gICAgICAgIHtpdGVtLmRvY0lEPT0nJyAmJiAnLWRldGFjaGVkLSd9XG4gICAgICAgICZuYnNwO2J5IHVzZXI6IHtpdGVtLnVzZXJ9XG4gICAgICA8L2Rpdj47XG4gICAgfSk7XG4gICAgcmV0dXJuIDxkaXY+e2xpbmVzfTwvZGl2PjtcbiAgfVxuXG5cbiAgc2hvdyhzaG93REI9dHJ1ZSkge1xuICAgIC8qIHNob3cgZWl0aGVyIGRhdGFiYXNlIGRldGFpbHMgKHRydWUpIG9yIGFsbCBvdGhlciBpbmZvcm1hdGlvbiAodGhlIG1haW4pIChmYWxzZSlcbiAgICAgICBTQU1FIEFTIElOIFByb2plY3Q6c2hvd01pc2MoKSAgICAqL1xuICAgIGNvbnN0IHsgZG9jIH0gPSB0aGlzLnN0YXRlO1xuICAgIGlmICghZG9jLl9pZClcbiAgICAgIHJldHVybig8ZGl2PjwvZGl2Pik7XG4gICAgY29uc3QgZG9jSXRlbXMgPSBPYmplY3Qua2V5cyhkb2MpLm1hcCggKGl0ZW0saWR4KSA9PiB7XG4gICAgICBpZiAoU3RvcmUuaXRlbVNraXAuaW5kZXhPZihpdGVtKT4tMSkge1xuICAgICAgICByZXR1cm4gPGRpdiBrZXk9eydCJytpZHgudG9TdHJpbmcoKX0+PC9kaXY+O1xuICAgICAgfVxuICAgICAgY29uc3QgbGFiZWw9aXRlbS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGl0ZW0uc2xpY2UoMSk7XG4gICAgICBpZiAoc2hvd0RCICYmIFN0b3JlLml0ZW1EQi5pbmRleE9mKGl0ZW0pPi0xKSB7XG4gICAgICAgIGlmKHR5cGVvZiBkb2NbaXRlbV09PSdzdHJpbmcnKVxuICAgICAgICAgIHJldHVybiA8ZGl2IGtleT17J0InK2lkeC50b1N0cmluZygpfT57bGFiZWx9OiA8c3Ryb25nPntkb2NbaXRlbV19PC9zdHJvbmc+PC9kaXY+O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIDxkaXYga2V5PXsnQicraWR4LnRvU3RyaW5nKCl9PlxuICAgICAgICAgICAge2xhYmVsfTogPHN0cm9uZz57SlNPTi5zdHJpbmdpZnkoZG9jW2l0ZW1dKX08L3N0cm9uZz5cbiAgICAgICAgICA8L2Rpdj47XG4gICAgICB9XG4gICAgICBpZiAoIXNob3dEQiAmJiBTdG9yZS5pdGVtREIuaW5kZXhPZihpdGVtKT09LTEpIHtcbiAgICAgICAgdmFyIGRlc2MgPSBudWxsO1xuICAgICAgICB2YXIgZGVzY3JpcHRpb24gPSB0aGlzLnN0YXRlLm9udG9sb2d5Tm9kZTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUub250b2xvZ3lOb2RlKVxuICAgICAgICAgIGRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb24uZmlsdGVyKGk9PntyZXR1cm4oaS5uYW1lPT1pdGVtKTt9KTtcbiAgICAgICAgaWYgKGRlc2NyaXB0aW9uICYmIGRlc2NyaXB0aW9uLmxlbmd0aD4wICYmIGl0ZW0hPSdjb21tZW50JylcbiAgICAgICAgICBkZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uWzBdO1xuICAgICAgICBpZiAoZGVzY3JpcHRpb24gJiYgJ3F1ZXJ5JyBpbiBkZXNjcmlwdGlvbilcbiAgICAgICAgICBkZXNjID0gZGVzY3JpcHRpb25bJ3F1ZXJ5J107XG4gICAgICAgIGlmICgvXlthLXd5el0tW1xcd1xcZF17MzJ9JC8udGVzdChkb2NbaXRlbV0pKSAgLy9pZiBsaW5rIHRvIG90aGVyIGRhdGFzZXRcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBrZXk9eydCJytpZHgudG9TdHJpbmcoKX0+IHtsYWJlbH06XG4gICAgICAgICAgICAgIDxzdHJvbmcgb25DbGljaz17KCk9PnRoaXMuZm9sbG93TGluayhkb2NbaXRlbV0pfSBzdHlsZT17e2N1cnNvcjogJ3BvaW50ZXInfX0+IExpbms8L3N0cm9uZz5cbiAgICAgICAgICAgICAgJm5ic3A7e2Rlc2M/JygnK2Rlc2MrJyknOicnfVxuICAgICAgICAgICAgPC9kaXY+KTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaWYgKGl0ZW09PSctbmFtZScpICAgLy9za2lwIG5hbWVcbiAgICAgICAgICAgIHJldHVybiA8ZGl2IGtleT0nQl9uYW1lJz48L2Rpdj47XG4gICAgICAgICAgaWYgKHR5cGVvZiBkb2NbaXRlbV09PSdzdHJpbmcnICYmIGRvY1tpdGVtXS5pbmRleE9mKCdcXG4nKT4wKSAgIC8vaWYgc3RyaW5nIHdpdGggL25cbiAgICAgICAgICAgIHJldHVybiA8ZGl2IGtleT17J0InK2lkeC50b1N0cmluZygpfT57bGFiZWx9OiAmbmJzcDt7ZGVzYz8nKCcrZGVzYysnKSc6Jyd9XG4gICAgICAgICAgICAgIDxSZWFjdE1hcmtkb3duIHNvdXJjZT17ZG9jW2l0ZW1dfSAvPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgIC8vVE9ET19QMyByZWFjdE1hcmtkb3duIG5vdCByZW5kZXJlZCBjb3JyZWN0bHlcbiAgICAgICAgICBpZiAoWydzdHJpbmcnLCdudW1iZXInXS5pbmRleE9mKHR5cGVvZiBkb2NbaXRlbV0pPi0xKSAgICAgICAgICAgICAgICAgICAvL2lmIG5vcm1hbCBzdHJpbmdcbiAgICAgICAgICAgIHJldHVybiA8ZGl2IGtleT17J0InK2lkeC50b1N0cmluZygpfT57bGFiZWx9OiA8c3Ryb25nPntkb2NbaXRlbV19PC9zdHJvbmc+XG4gICAgICAgICAgICAgICZuYnNwO3tkZXNjPycoJytkZXNjKycpJzonJ31cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IGRvY1tpdGVtXS5sZW5ndGg+MCA/IGRvY1tpdGVtXS5qb2luKCcsICcpIDogJyc7XG4gICAgICAgICAgcmV0dXJuIDxkaXYga2V5PXsnQicraWR4LnRvU3RyaW5nKCl9PntsYWJlbH06IDxzdHJvbmc+e3ZhbHVlfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAmbmJzcDt7ZGVzYz8nKCcrZGVzYysnKSc6Jyd9XG4gICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gPGRpdiBrZXk9eydCJytpZHgudG9TdHJpbmcoKX0+PC9kaXY+O1xuICAgIH0pO1xuICAgIHZhciBoZWFkaW5nID0gc2hvd0RCID8gJ0RhdGFiYXNlIGRldGFpbHMnIDogJ01ldGFkYXRhJztcbiAgICByZXR1cm4gKDxBY2NvcmRpb24gVHJhbnNpdGlvblByb3BzPXt7IHVubW91bnRPbkV4aXQ6IHRydWUsIHRpbWVvdXQ6MCB9fVxuICAgICAgZGVmYXVsdEV4cGFuZGVkPXtzaG93REIgPyBmYWxzZSA6IHRydWV9PlxuICAgICAgPEFjY29yZGlvblN1bW1hcnkgZXhwYW5kSWNvbj17PEV4cGFuZE1vcmVJY29uLz59IHN0eWxlPXtidG59PlxuICAgICAgICB7aGVhZGluZ31cbiAgICAgIDwvQWNjb3JkaW9uU3VtbWFyeT5cbiAgICAgIDxBY2NvcmRpb25EZXRhaWxzPjxkaXY+e2RvY0l0ZW1zfTwvZGl2PjwvQWNjb3JkaW9uRGV0YWlscz5cbiAgICA8L0FjY29yZGlvbj4pO1xuICB9XG5cbiAgc2hvd0ltYWdlKCkge1xuICAgIC8qIHNob3cgaW1hZ2Ugc3RvcmVkIGluIGRvY3VtZW50Ki9cbiAgICBjb25zdCB7aW1hZ2V9ID0gdGhpcy5zdGF0ZS5kb2M7XG4gICAgaWYgKCFpbWFnZSkgeyByZXR1cm4gPGRpdj48L2Rpdj47IH1cbiAgICB2YXIgZnVsbEltYWdlID0gaW1hZ2U7XG4gICAgdmFyIGFsdCAgICAgICA9ICdiYXNlNjQtZm9ybWF0JztcbiAgICBpZiAoaW1hZ2Uuc3Vic3RyaW5nKDAsNCk9PT0nPD94bScpIHtcbiAgICAgIGNvbnN0IGJhc2U2NGRhdGEgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChpbWFnZSkpKTtcbiAgICAgIGZ1bGxJbWFnZSAgPSAnZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCwnK2Jhc2U2NGRhdGE7XG4gICAgICBhbHQgICAgICAgID0gJ3N2Zy1mb3JtYXQnO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9J2QtZmxleCBqdXN0aWZ5LWNvbnRlbnQtY2VudGVyJz5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8Y2VudGVyPlxuICAgICAgICAgICAgPGltZyBzcmM9e2Z1bGxJbWFnZX0gd2lkdGg9e3RoaXMuc3RhdGUuaW1hZ2VTaXplfSBhbHQ9e2FsdH0+PC9pbWc+XG4gICAgICAgICAgPC9jZW50ZXI+XG4gICAgICAgICAgPEZvcm1Db250cm9sIGZ1bGxXaWR0aCBjbGFzc05hbWU9J2NvbC1zbS0xMiBwbC0zIHByLTEnPlxuICAgICAgICAgICAgPFNlbGVjdCBvbkNoYW5nZT17ZT0+dGhpcy5jaGFuZ2VTZWxlY3RvcihlKX0gdmFsdWU9e3RoaXMuc3RhdGUuZXh0cmFjdG9yQ2hvaWNlfT5cbiAgICAgICAgICAgICAge3RoaXMuc3RhdGUuZXh0cmFjdG9yQ2hvaWNlcy5tYXAoKGl0ZW0pPT57XG4gICAgICAgICAgICAgICAgcmV0dXJuICg8TWVudUl0ZW0gdmFsdWU9e2l0ZW19IGtleT17aXRlbX0+e2l0ZW19PC9NZW51SXRlbT4pO1xuICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgIDwvU2VsZWN0PlxuICAgICAgICAgIDwvRm9ybUNvbnRyb2w+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+KTtcbiAgfVxuXG5cbiAgLyoqIHRoZSByZW5kZXIgbWV0aG9kICoqL1xuICByZW5kZXIoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuZG9jLl9pZD09PSctb250b2xvZ3ktJykgIC8vaWYgbm8gZG9jdW1lbnQgaXMgb3BlbmVkLCBiZWNhdXNlIG5vbmUgaXMgcHJlc2VudCwgc2tpcFxuICAgICAgcmV0dXJuKDxkaXY+PC9kaXY+KTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbCBweC0xJyBzdHlsZT17e2hlaWdodDp3aW5kb3cuaW5uZXJIZWlnaHQtMzgsIG92ZXJmbG93WTonc2Nyb2xsJ319PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93Jz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbS0zIHB4LTMnIHN0eWxlPXtoMX0+e3RoaXMuc3RhdGUuZG9jWyctbmFtZSddfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdtbC1hdXRvJz5cbiAgICAgICAgICAgIHt0aGlzLnN0YXRlLmRvYyAmJiB0aGlzLnN0YXRlLmRvYy5faWQgJiZcbiAgICAgICAgICAgIDxJY29uQnV0dG9uIG9uQ2xpY2s9eygpPT5BY3Rpb25zLnNob3dGb3JtKCdlZGl0JyxudWxsLG51bGwpfSBjbGFzc05hbWU9J20tMCcgaWQ9J2VkaXREYXRhQnRuJz5cbiAgICAgICAgICAgICAgPEVkaXQgZm9udFNpemU9J2xhcmdlJyBzdHlsZT17e2NvbG9yOmNvbG9yU3Ryb25nfX0gLz5cbiAgICAgICAgICAgIDwvSWNvbkJ1dHRvbj59XG4gICAgICAgICAgICB7Lyp0aGlzLnN0YXRlLmRvYyAmJiB0aGlzLnN0YXRlLmRvYy5pbWFnZSAmJiBFTEVDVFJPTiAmJlxuICAgICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoKT0+dGhpcy5wcmVzc2VkQnV0dG9uKCdidG5fZGV0YWlsX2JlX3JlZG8nKX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT0nbXQtMiBtbC0yJyBpZD0nUmVkb0J0bicgdmFyaWFudD1cImNvbnRhaW5lZFwiIHN0eWxlPXtidG59PlxuICAgICAgICAgICAgUmVkbyBpbWFnZVxuICAgICAgICAgIDwvQnV0dG9uPiovfVxuICAgICAgICAgICAge3RoaXMuc3RhdGUuZG9jICYmIHRoaXMuc3RhdGUuZG9jLl9pZCAmJlxuICAgICAgICAgICAgPEljb25CdXR0b24gb25DbGljaz17KCk9PnRoaXMucHJlc3NlZEJ1dHRvbignZGVsZXRlJyl9ICBjbGFzc05hbWU9J20tMCBtci0zJyBpZD0nRGVsZXRlQnRuJz5cbiAgICAgICAgICAgICAgPERlbGV0ZSBmb250U2l6ZT0nbGFyZ2UnLz5cbiAgICAgICAgICAgIDwvSWNvbkJ1dHRvbj59XG4gICAgICAgICAgICA8TW9kYWxBZGRBdHRhY2htZW50IHNob3c9e3RoaXMuc3RhdGUuc2hvd0F0dGFjaG1lbnR9IGNhbGxiYWNrPXt0aGlzLnRvZ2dsZUFkZEF0dGFjaG1lbnR9XG4gICAgICAgICAgICAgIG5hbWU9e3RoaXMuc3RhdGUuYXR0YWNobWVudE5hbWV9IGRvY1R5cGU9e3RoaXMuc3RhdGUuZG9jWyctdHlwZSddfSAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge3RoaXMuc2hvd0ltYWdlKCl9XG4gICAgICAgIHt0aGlzLnNob3dTcGVjaWFsKCdjb250ZW50JyAgICAsbnVsbCl9XG4gICAgICAgIHt0aGlzLnNob3coZmFsc2UpfVxuICAgICAgICB7dGhpcy5zaG93U3BlY2lhbCgnbWV0YVVzZXInICAgLCdVc2VyIG1ldGFkYXRhJyl9XG4gICAgICAgIHt0aGlzLnNob3dTcGVjaWFsKCdtZXRhVmVuZG9yJyAsJ1ZlbmRvciBtZXRhZGF0YScpfVxuICAgICAgICB7dGhpcy5zaG93U3BlY2lhbCgnLWF0dGFjaG1lbnQnLCdBdHRhY2htZW50cycpfVxuICAgICAgICB7dGhpcy5zaG93KCl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG4iXSwiZmlsZSI6InJlbmRlcmVyL2NvbXBvbmVudHMvRG9jRGV0YWlsLmpzIn0=
