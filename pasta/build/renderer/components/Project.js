"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _core = require("@material-ui/core");

var _icons = require("@material-ui/icons");

var _reactSortableTree = require("react-sortable-tree");

var _reactMarkdown = _interopRequireDefault(require("react-markdown"));

var _ModalForm = _interopRequireDefault(require("./ModalForm"));

var _ModalSimple = _interopRequireDefault(require("./ModalSimple"));

var Actions = _interopRequireWildcard(require("../Actions"));

var _Dispatcher = _interopRequireDefault(require("../Dispatcher"));

var _Store = _interopRequireDefault(require("../Store"));

var _localInteraction = require("../localInteraction");

var _style = require("../style");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* Project view
*/
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
class Project extends _react.Component {
  //initialize
  constructor() {
    super();

    this.handleActions = action => {
      /* handle actions that comes from other GUI elements*/
      if (action.type === 'CHANGE_TEXT_DOC') {
        Object.assign(action.oldDoc, action.doc);
        action.oldDoc['docID'] = 'temp_' + action.oldDoc.id;
        var newDoc = { ...action.oldDoc
        };
        ['id', 'parent', 'path', 'delete', 'docID'].forEach(e => delete newDoc[e]);
        this.setState({
          ['temp_' + action.oldDoc.id]: newDoc
        });
        var flatData = this.flatData(this.state.treeData);
        flatData = flatData.map(item => {
          if (item.id === action.oldDoc.id) return action.oldDoc;
          return item;
        });
        this.setState({
          treeData: this.treeData(flatData)
        });
      }
    };

    this.flatData = treeData => {
      /* create flat data from tree data and return it */
      var flatData = (0, _reactSortableTree.getFlatDataFromTree)({
        treeData: treeData,
        getNodeKey: ({
          node
        }) => node.id,
        // This ensures your "id" properties are exported in the path
        ignoreCollapsed: false // Makes sure you traverse every node in the tree, not just the visible ones

      }).map(({
        node,
        path
      }) => ({
        id: node.id,
        docID: node.docID,
        parent: path.length > 1 ? path[path.length - 2] : null,
        name: node.name,
        delete: node.delete,
        path: path
      }));
      return flatData;
    };

    this.treeData = flatData => {
      /* create tree data from flat data and return it */
      var treeData = (0, _reactSortableTree.getTreeFromFlatData)({
        flatData: flatData.map(node => ({ ...node
        })),
        getKey: node => node.id,
        // resolve a node's key
        getParentKey: node => node.parent,
        // resolve a node's parent's key
        rootKey: null // The value of the parent key when there is no parent (i.e., at root level)

      });
      return treeData;
    };

    this.getDoc = () => {
      /* Initialization of header: project
         get information from store and push information to actions */
      this.setState({
        project: _Store.default.getDocumentRaw(),
        verbose: _Store.default.getGUIConfig('verbose')
      });
    };

    this.getHierarchy = () => {
      /* Initialization of tree:
           get orgMode hierarchy from store
           create flatData-structure from that orgMode structure
           create tree-like data for SortableTree from flatData */
      const orgModeArray = _Store.default.getHierarchy().split('\n');

      var initialData = [];
      var expanded = this.state.expanded;
      var expandedComment = {};
      var parents = [null];
      var currentIndent = 2;

      var url = _Store.default.getURL();

      for (var i = 1; i < orgModeArray.length; i++) {
        //for-loop cannot be map because consecutive lines depend on each other
        var idxSpace = orgModeArray[i].indexOf(' ');
        var idxBar = orgModeArray[i].indexOf('||');
        if (idxSpace < 1) break;
        const title = orgModeArray[i].substr(idxSpace, idxBar - idxSpace);
        const docID = orgModeArray[i].substr(idxBar + 2);

        if (idxSpace > currentIndent) {
          parents.push(i - 1);
        }

        for (var j = 0; j < currentIndent - idxSpace; j++) {
          parents.pop();
        }

        currentIndent = idxSpace;
        initialData.push({
          id: i.toString(),
          parent: parents[parents.length - 1],
          docID: docID,
          name: title,
          delete: false
        });
        if (!(i.toString() in expanded)) //if not in state, default is closed
          expanded[i.toString()] = false;
        expandedComment[docID] = true; //start filling local database of items
        // if reload because only one data has changed, only reload that (use state to identify if that)

        url.url.get(url.path + docID).then(res => {
          if (docID in this.state && this.state[docID].name != res.data.name) {
            //name change: directory structure has to change accordingly
            var flatData = this.flatData(this.state.treeData);
            flatData = flatData.map(i => {
              return i.docID == docID ? Object.assign(i, {
                name: res.data.name
              }) : i;
            });
            this.setState({
              saveHierarchy: true,
              treeData: this.treeData(flatData)
            });
          }

          this.setState({
            [docID]: res.data
          }); //download subitems into local database

          Object.keys(res.data).map(i => {
            if (/^[a-wyz]-[\w\d]{32}$/.test(res.data[i]) && i != '_id') {
              //if link to other dataset
              url.url.get(url.path + res.data[i]).then(resI => {
                this.setState({
                  [res.data[i]]: resI.data
                });
              }).catch(() => {
                this.setState({
                  [res.data[i]]: null
                });
                console.log('Project:getHierarchy level 2: Error encountered: ' + url.path + res.data[i]);
              });
            }
          });
        }).catch(() => {
          this.setState({
            [docID]: null
          });
          console.log('Project:getHierarchy: Error encountered: ' + url.path + docID);
        });
      }

      var tree = this.treeData(initialData); //convert back/forth to flat-data to include path (hierarchyStack)

      const flatData = this.flatData(tree);
      tree = this.treeData(flatData);
      this.setState({
        treeData: tree,
        expanded: expanded,
        expandedComment: expandedComment
      });
    };

    this.toggleTable = () => {
      /* close project view */
      Actions.restartDocType();
    };

    this.toggleDeleteModal = () => {
      /** change visibility of modal */
      if (this.state.showDeleteModal === 'none') {
        this.setState({
          showDeleteModal: 'block'
        });
      } else {
        this.setState({
          showDeleteModal: 'none'
        });
      }
    };

    this.inputChange = event => {
      /* change in input field at bottom */
      this.setState({
        newItem: event.target.value
      });
    };

    this.pressedButton = task => {
      /** global pressed buttons: sibling for pressedButton in ConfigPage: change both similarly */
      if (task == 'btn_proj_fe_deleteHierarchy') {
        //loop through all sub-elements and delete them
        // (all hierarchy elements and all other elements with one branch)
        Object.keys(this.state).map(item => {
          if (item.length == 34 && item[1] == '-') {
            if (item[0] == 'x' || this.state[item]['-branch'].length == 1) {
              _Store.default.deleteDoc(item, this.state[item]._rev);
            }
          }
        });

        _Store.default.deleteDoc(); //remove project


        this.toggleTable(); //cancel
      } else {
        //all other functions
        Actions.comState('busy');
        var content = null;

        if (task == 'btn_proj_be_saveHierarchy') {
          content = this.state.project['-name'] + '||' + this.state.project._id + '\n';
          content += this.treeToOrgMode(this.state.treeData, 0, false);
        }

        (0, _localInteraction.executeCmd)(task, this.callback, this.state.project._id, content);
      }
    };

    this.callback = content => {
      if (content.indexOf('SUCCESS') > -1) {
        Actions.comState('ok'); //Save, etc. does not lead to reversion to project-table, but to re-initialization of this project
        // - users mainly work in project and save is used for intermediate safety
        // this.props.callback();
        //TODO_P2: after save of tree: save of project document is then impossible because _rev not updated

        _Store.default.readDocument(this.state.project._id);

        this.setState({
          saveHierarchy: false
        });
        this.getHierarchy();
      } else {
        Actions.comState('fail');
        console.log('callback', content);
      }
    };

    this.expand = (id, comment = false) => {
      /* expand/collapse certain branch */
      if (comment) {
        var expanded = this.state.expandedComment;
        expanded[id] = !expanded[id];
        this.setState({
          expandedComment: expanded
        });
      } else {
        var expanded2 = this.state.expanded;
        expanded2[id] = !expanded2[id];
        this.setState({
          expanded: expanded2
        });
      }
    };

    this.editItem = item => {
      /* click edit button for one item in the hierarchy; project-edit handled separately */
      if (item.docID == '' || item.docID.slice(0, 5) == 'temp_') {
        var tempDoc = { ...item
        };
        tempDoc['-type'] = ['x1'];
        const ontologyNode = [{
          name: 'name',
          query: 'What is the name?',
          unit: '',
          required: true
        }, {
          name: 'comment',
          query: '#tags comments remarks :field:value:',
          unit: '',
          required: false
        }];
        const mode = item.name.length == 0 ? 'new' : 'edit';
        Actions.showForm(mode, ontologyNode, tempDoc);
      } else {
        var url = _Store.default.getURL();

        url.url.get(url.path + item.docID).then(res => {
          const doc = res.data;
          const docType = doc['-type'][0];

          const ontologyNode = _Store.default.getOntology()[docType];

          Actions.showForm('edit', ontologyNode, doc);
        }).catch(err => {
          console.log('Project:editItem: Error encountered: ' + url.path + item.docID);
          console.log('Error:', err.toString());
        });
      }
    };

    this.editProject = () => {
      /* click edit button for project-edit */
      const ontologyNode = _Store.default.getOntology()['x0'];

      Actions.showForm('edit', ontologyNode, this.state.project);
    };

    this.changeTree = (item, direction) => {
      /* most events that change the hierarchy tree: up,promote,demote,delete,add*/
      var treeData = this.state.treeData;
      var changedFlatData = false;
      var flatData = this.flatData(treeData);

      if (direction === 'up') {
        if (item.parent) {
          const row = flatData.filter(node => {
            return node.id == item.id;
          })[0];
          const idx = flatData.indexOf(row);
          flatData.splice(idx - 1, 0, row);
          delete flatData[idx + 1];
          changedFlatData = true;
        } else {
          const idx = treeData.indexOf(item);
          treeData.splice(idx - 1, 0, item);
          delete treeData[idx + 1];
          treeData = treeData.filter(item => {
            return item;
          });
        }
      } else if (direction === 'promote') {
        item.parent = flatData.filter(node => {
          return node.id == item.parent;
        })[0]['parent']; //set as grandparent

        item.path = item.path.slice(1);
        flatData = flatData.map(node => {
          if (node.id == item.id) return item;
          return node;
        });
        changedFlatData = true;
      } else if (direction === 'demote') {
        item.parent = this.previousSibling(treeData, item.id);
        const parentPath = flatData.filter(node => {
          return node.id === item.parent ? node : false;
        })[0]['path'];
        item.path = parentPath.concat([item.id]);
        flatData = flatData.map(node => {
          if (node.id == item.id) return item;
          return node;
        });
        changedFlatData = true;
      } else if (direction === 'delete') {
        item.delete = true;
        flatData = flatData.map(node => {
          if (node.id == item.id) return item;
          return node;
        });
        changedFlatData = true;
      } else if (direction === 'new') {
        var parentID = null;
        var name = this.state.newItem == '' ? '--New item--' : this.state.newItem;
        var path = [];

        if (item) {
          parentID = item.id;
          name = '--New item--';
          path = item.path;
          var expanded = this.state.expanded;
          expanded[item.id] = true;
          this.setState({
            expanded: expanded
          });
        }

        const newID = (flatData.length + 1).toString();
        path = path.concat([newID]);
        flatData.push({
          id: newID,
          parent: parentID,
          docID: '',
          path: path,
          name: name,
          delete: false
        });
        changedFlatData = true;
        this.setState({
          newItem: ''
        });
      } else {
        console.log('ERROR direction unknown', direction);
      } //finish by updating treeData


      if (changedFlatData) treeData = this.treeData(flatData);
      this.setState({
        treeData: treeData,
        saveHierarchy: true
      });
    };

    this.firstChild = (branch, id) => {
      var result = branch.map((item, idx) => {
        if (item.id == id && idx == 0) return true;
        if (item.id == id && idx > 0) return false;
        if (item.children) return this.firstChild(item.children, id);
        return null;
      });
      result = result.filter(item => {
        return item != null;
      })[0];
      return result;
    };

    this.previousSibling = (branch, id) => {
      var result = branch.map((item, idx) => {
        if (item.id == id && idx == 0) return null;
        if (item.id == id && idx > 0) return idx - 1;
        if (item.children) return this.previousSibling(item.children, id);
        return null;
      });
      result = result.filter(item => {
        return item != null;
      })[0];
      if (typeof result === 'number') result = branch[result]['id'];
      return result;
    };

    this.state = {
      //data
      project: _Store.default.getDocumentRaw(),
      //project
      treeData: [],
      //for visualization
      expanded: {},
      expandedComment: {},
      //long comments
      newItem: '',
      saveHierarchy: false,
      //misc
      dispatcherToken: null,
      showDeleteModal: 'none'
    };
  }

  componentDidMount() {
    this.setState({
      dispatcherToken: _Dispatcher.default.register(this.handleActions)
    });

    _Store.default.on('changeDoc', this.getDoc);

    _Store.default.on('changeDoc', this.getHierarchy);
  }

  componentWillUnmount() {
    _Dispatcher.default.unregister(this.state.dispatcherToken);

    _Store.default.removeListener('changeDoc', this.getDoc);

    _Store.default.removeListener('changeDoc', this.getHierarchy);
  }
  /** Functions as class properties (immediately bound): react on user interactions **/


  treeToOrgMode(children, prefixStars, delItem) {
    /* recursive function to finalize
       tree-like data from SortableTree to orgMode, which is communicated to backend */
    prefixStars += 1;
    var orgMode = children.map(item => {
      const delSubtree = item.delete ? true : Boolean(delItem);
      const childrenString = 'children' in item ? '\n' + this.treeToOrgMode(item.children, prefixStars, delSubtree) : '';
      const name = delSubtree ? '-delete-' : item.name;
      const docIDString = item.docID && item.docID.substring(0, 5) != 'temp_' ? '||' + item.docID : '';
      var comment = '';

      if (item.docID && item.docID.substring(0, 5) == 'temp_' && this.state[item.docID]) {
        if (this.state[item.docID].tags) //tags are in document
          comment += this.state[item.docID].tags.join(' ');
        if (this.state[item.docID].comment) //comment is in document
          comment += ' ' + this.state[item.docID].comment;
        if (comment.length > 1) comment = '\n' + comment;
      }

      return '*'.repeat(prefixStars) + ' ' + name + docIDString + comment + childrenString;
    });
    return orgMode.join('\n');
  }

  /** create html-structure; all should return at least <div></div> **/
  showWithImage(docID) {
    /* item if image is present */
    const {
      image
    } = this.state[docID];
    const base64data = image.substring(0, 4) === '<?xm' ? btoa(unescape(encodeURIComponent(image))) : null;
    const imageTag = image.substring(0, 4) === '<?xm' ? /*#__PURE__*/_react.default.createElement("img", {
      src: 'data:image/svg+xml;base64,' + base64data,
      width: "100%",
      alt: "svg-format"
    }) : /*#__PURE__*/_react.default.createElement("img", {
      src: image,
      width: "100%",
      alt: "base64-format"
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "row"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-7"
    }, this.showMisc(docID)), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-5"
    }, imageTag));
  }

  showWithContent(docID) {
    /* item if content is present */
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "row"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, this.showMisc(docID)), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6 border pt-2"
    }, /*#__PURE__*/_react.default.createElement(_reactMarkdown.default, {
      source: this.state[docID].content
    })));
  }

  showWithout(docID) {
    /* default case */
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "row"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-12"
    }, this.showMisc(docID)));
  }

  showMisc(docID) {
    /* left-side of information:
       SAME AS IN DocDetail:show() */
    const doc = this.state[docID];
    var listItems = Object.keys(doc).map((item, idx) => {
      if (_Store.default.itemSkip.indexOf(item) > -1 || _Store.default.itemDB.indexOf(item) > -1 || item === '-name') {
        return /*#__PURE__*/_react.default.createElement("div", {
          key: 'B' + idx.toString()
        });
      }

      const label = item.charAt(0).toUpperCase() + item.slice(1);
      var value = doc[item];
      if (/^[a-wyz]-[\w\d]{32}$/.test(value)) value = this.state[value] ? this.state[value].name : '** Undefined: document-type';
      if (value == '' || item === 'comment' && doc.comment.indexOf('\n') > 0) //if comment and \n in comment
        return /*#__PURE__*/_react.default.createElement("div", {
          key: 'B' + idx.toString()
        });
      if (Array.isArray(value)) value = value.join(' ');
      return /*#__PURE__*/_react.default.createElement("div", {
        key: 'B' + idx.toString()
      }, label, ": ", /*#__PURE__*/_react.default.createElement("strong", null, value));
    });
    if (doc['-type'][0] == 'measurement' && !doc['-curated']) listItems.push( /*#__PURE__*/_react.default.createElement("div", {
      key: "curate_",
      style: {
        color: _style.colorWarning
      }
    }, /*#__PURE__*/_react.default.createElement("strong", null, "CURATE !")));
    if (doc.comment && doc.comment != '' && doc.comment.indexOf('\n') > 0) listItems.push( /*#__PURE__*/_react.default.createElement("div", {
      key: 'B_comment'
    }, "Comment:", /*#__PURE__*/_react.default.createElement(_core.Tooltip, {
      title: "Expand/Contract"
    }, /*#__PURE__*/_react.default.createElement(_core.IconButton, {
      onClick: () => this.expand(docID, true),
      className: "mr-5",
      size: "small"
    }, this.state.expandedComment[docID] && /*#__PURE__*/_react.default.createElement(_icons.ExpandLess, null), !this.state.expandedComment[docID] && /*#__PURE__*/_react.default.createElement(_icons.ExpandMore, null))), " ", /*#__PURE__*/_react.default.createElement("br", null), this.state.expandedComment[docID] && /*#__PURE__*/_react.default.createElement(_reactMarkdown.default, {
      source: doc.comment
    })));
    return listItems;
  }

  showTree(branch) {
    /* recursive function to show this item and all the sub-items */
    const tree = branch.map((item, idx) => {
      //this item text-document
      const thisText = item.docID.substring(0, 2) == 'x-' || item.docID == '' || item.docID.substring(0, 5) == 'temp_'; //previous item is text-document

      const prevText = idx == 0 ? false : branch[idx - 1].docID.substring(0, 2) == 'x-' || branch[idx - 1].docID == '' || branch[idx - 1].docID.substring(0, 5) == 'temp_';
      var docType = this.state[item.docID] ? this.state[item.docID]['-type'].join('/') : 'x' + item.path.length.toString();

      if (docType[0][0] == 'x') {
        var docLabel = _Store.default.getDocTypeLabels()[docType];

        docType = docLabel ? docLabel.slice(0, docLabel.length - 1).toLowerCase() : 'undefined';
      }

      var date = this.state[item.docID] && this.state[item.docID]['-date'] ? new Date(this.state[item.docID]['-date']) : new Date(Date.now());
      const maxHierarchyDepth = Object.keys(_Store.default.getDocTypeLabels()).filter(i => {
        return i[0][0] == 'x';
      }).length;
      var color = 'black';

      if (this.state[item.docID] && this.state[item.docID].tags) {
        if (this.state[item.docID].tags.indexOf('#DONE') > -1) color = 'green';
        if (this.state[item.docID].tags.indexOf('#TODO') > -1) color = 'red';
      }

      return !item.delete && /*#__PURE__*/_react.default.createElement("div", {
        key: item.id
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "container border pl-2 pt-2"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "row ml-0"
      }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("strong", null, /*#__PURE__*/_react.default.createElement("span", {
        style: {
          color: color
        }
      }, item.name)), "\xA0\xA0\xA0", docType, "\xA0\xA0\xA0", this.state.verbose > 1 && /*#__PURE__*/_react.default.createElement("span", null, item.docID, "\xA0\xA0\xA0"), /*#__PURE__*/_react.default.createElement("strong", null, date.toLocaleString())), /*#__PURE__*/_react.default.createElement("div", {
        className: "ml-auto"
      }, item.children && /*#__PURE__*/_react.default.createElement(_core.Tooltip, {
        title: "Expand/Contract"
      }, /*#__PURE__*/_react.default.createElement(_core.IconButton, {
        onClick: () => this.expand(item.id),
        className: "mr-5",
        size: "small"
      }, this.state.expanded[item.id] && /*#__PURE__*/_react.default.createElement(_icons.ExpandLess, null), !this.state.expanded[item.id] && /*#__PURE__*/_react.default.createElement(_icons.ExpandMore, null))), /*#__PURE__*/_react.default.createElement(_core.Tooltip, {
        title: "Promote"
      }, /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement(_core.IconButton, {
        onClick: () => this.changeTree(item, 'promote'),
        className: "m-0",
        size: "small",
        disabled: !(_localInteraction.ELECTRON && item.parent && (prevText || idx == 0))
      }, /*#__PURE__*/_react.default.createElement(_icons.ArrowBack, null)))), /*#__PURE__*/_react.default.createElement(_core.Tooltip, {
        title: "Move up"
      }, /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement(_core.IconButton, {
        onClick: () => this.changeTree(item, 'up'),
        className: "m-0",
        size: "small",
        disabled: !(_localInteraction.ELECTRON && !this.firstChild(this.state.treeData, item.id))
      }, /*#__PURE__*/_react.default.createElement(_icons.ArrowUpward, null)))), /*#__PURE__*/_react.default.createElement(_core.Tooltip, {
        title: "Demote"
      }, /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement(_core.IconButton, {
        onClick: () => this.changeTree(item, 'demote'),
        className: "m-0",
        size: "small",
        disabled: !(_localInteraction.ELECTRON && !this.firstChild(this.state.treeData, item.id) && item.path.length < maxHierarchyDepth - 1 && prevText)
      }, /*#__PURE__*/_react.default.createElement(_icons.ArrowForward, null)))), /*#__PURE__*/_react.default.createElement(_core.Tooltip, {
        title: "Edit"
      }, /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement(_core.IconButton, {
        onClick: () => this.editItem(item),
        className: "ml-5",
        size: "small"
      }, /*#__PURE__*/_react.default.createElement(_icons.Edit, null)))), /*#__PURE__*/_react.default.createElement(_core.Tooltip, {
        title: "Delete"
      }, /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement(_core.IconButton, {
        onClick: () => this.changeTree(item, 'delete'),
        className: "m-0",
        size: "small",
        disabled: !_localInteraction.ELECTRON
      }, /*#__PURE__*/_react.default.createElement(_icons.Delete, null)))), /*#__PURE__*/_react.default.createElement(_core.Tooltip, {
        title: "Add child"
      }, /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement(_core.IconButton, {
        onClick: () => this.changeTree(item, 'new'),
        className: "m-0",
        size: "small",
        disabled: !(_localInteraction.ELECTRON && item.path.length < maxHierarchyDepth - 1 && thisText)
      }, /*#__PURE__*/_react.default.createElement(_icons.Add, null)))))), this.state[item.docID] && this.state[item.docID].content && this.showWithContent(item.docID), this.state[item.docID] && this.state[item.docID].image && this.showWithImage(item.docID), this.state[item.docID] && !this.state[item.docID].content && !this.state[item.docID].image && this.showWithout(item.docID)), this.state.expanded[item.id] && item.children && /*#__PURE__*/_react.default.createElement("div", {
        className: "ml-5 mt-0 mb-5"
      }, this.showTree(item.children)));
    });
    return tree;
  }
  /** the render method **/


  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "col px-0",
      style: { ..._style.areaScrollY,
        height: window.innerHeight - 38
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "row mx-0 py-3",
      style: {
        background: _style.colorBG
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "px-2",
      style: { ..._style.h1,
        color: _style.colorStrong
      }
    }, this.state.project['-name']), /*#__PURE__*/_react.default.createElement("div", {
      className: "row ml-auto mr-0"
    }, _localInteraction.ELECTRON && /*#__PURE__*/_react.default.createElement(_core.Tooltip, {
      title: "Save Project Hierarchy"
    }, /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.pressedButton('btn_proj_be_saveHierarchy'),
      className: "m-0",
      disabled: !this.state.saveHierarchy,
      variant: "contained",
      style: this.state.saveHierarchy ? _style.btnStrong : _style.btnStrongDeactive
    }, "Save"))), _localInteraction.ELECTRON && /*#__PURE__*/_react.default.createElement(_core.Tooltip, {
      title: "Scan for new measurements, etc."
    }, /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.pressedButton('btn_proj_be_scanHierarchy'),
      variant: "contained",
      style: !this.state.saveHierarchy ? _style.btnStrong : _style.btnStrongDeactive,
      disabled: this.state.saveHierarchy,
      className: "mx-2"
    }, "Scan"))), /*#__PURE__*/_react.default.createElement(_core.Tooltip, {
      title: "Cancel"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.toggleTable(),
      className: "m-0",
      variant: "contained",
      style: _style.btn
    }, "Cancel")))), /*#__PURE__*/_react.default.createElement("div", {
      className: "px-2 pt-2"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mb-2"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "row mx-0"
    }, this.state.project.objective && /*#__PURE__*/_react.default.createElement("div", null, " Objective: ", /*#__PURE__*/_react.default.createElement("strong", null, this.state.project.objective), " "), /*#__PURE__*/_react.default.createElement("div", {
      className: "row ml-auto mr-0"
    }, /*#__PURE__*/_react.default.createElement(_core.Tooltip, {
      title: "Edit Project Details"
    }, /*#__PURE__*/_react.default.createElement(_core.IconButton, {
      onClick: () => this.editProject(),
      className: "mx-2",
      size: "small"
    }, /*#__PURE__*/_react.default.createElement(_icons.Edit, null))), _localInteraction.ELECTRON && /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_core.Tooltip, {
      title: "DELETE Project Hierarchy"
    }, /*#__PURE__*/_react.default.createElement(_core.IconButton, {
      onClick: () => this.toggleDeleteModal(),
      className: "m-0",
      size: "small"
    }, /*#__PURE__*/_react.default.createElement(_icons.Delete, null))), /*#__PURE__*/_react.default.createElement(_ModalSimple.default, {
      title: "Warning",
      color: "#FF0000",
      text: "Really remove entire project hierarchy in database? Remove on harddisk manually.",
      onYes: () => {
        this.pressedButton('btn_proj_fe_deleteHierarchy');
      },
      show: this.state.showDeleteModal,
      callback: this.toggleDeleteModal
    })))), /*#__PURE__*/_react.default.createElement("div", null, this.state.project.status && /*#__PURE__*/_react.default.createElement("span", null, "Status: ", /*#__PURE__*/_react.default.createElement("strong", null, this.state.project.status), "\xA0\xA0\xA0"), this.state.project.tags.length > 0 && /*#__PURE__*/_react.default.createElement("span", null, "Tags: ", /*#__PURE__*/_react.default.createElement("strong", null, this.state.project.tags))), this.state.project.comment && this.state.project.comment.length > 0 && this.state.project.comment.indexOf('\n') == -1 && this.state.project.comment, this.state.project.comment && this.state.project.comment.length > 0 && this.state.project.comment.indexOf('\n') > 0 && /*#__PURE__*/_react.default.createElement(_reactMarkdown.default, {
      source: this.state.project.comment
    })), this.state.treeData.length > 0 && /*#__PURE__*/_react.default.createElement("div", {
      className: "row"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "ml-auto",
      style: {
        marginRight: 140
      }
    }, "move in hierarchy")), this.showTree(this.state.treeData), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_core.Input, {
      value: this.state.newItem,
      onChange: this.inputChange,
      className: "pl-2",
      onKeyDown: e => e.key === 'Enter' && this.changeTree(null, 'new')
    }), /*#__PURE__*/_react.default.createElement(_core.Tooltip, {
      title: "Add new item"
    }, /*#__PURE__*/_react.default.createElement(_core.IconButton, {
      onClick: () => this.changeTree(null, 'new'),
      variant: "contained",
      className: "m-2 pt-2"
    }, /*#__PURE__*/_react.default.createElement(_icons.AddCircle, {
      fontSize: "large"
    }))))), /*#__PURE__*/_react.default.createElement(_ModalForm.default, null));
  }

}

exports.default = Project;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlcmVyL2NvbXBvbmVudHMvUHJvamVjdC5qcyJdLCJuYW1lcyI6WyJQcm9qZWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJoYW5kbGVBY3Rpb25zIiwiYWN0aW9uIiwidHlwZSIsIk9iamVjdCIsImFzc2lnbiIsIm9sZERvYyIsImRvYyIsImlkIiwibmV3RG9jIiwiZm9yRWFjaCIsImUiLCJzZXRTdGF0ZSIsImZsYXREYXRhIiwic3RhdGUiLCJ0cmVlRGF0YSIsIm1hcCIsIml0ZW0iLCJnZXROb2RlS2V5Iiwibm9kZSIsImlnbm9yZUNvbGxhcHNlZCIsInBhdGgiLCJkb2NJRCIsInBhcmVudCIsImxlbmd0aCIsIm5hbWUiLCJkZWxldGUiLCJnZXRLZXkiLCJnZXRQYXJlbnRLZXkiLCJyb290S2V5IiwiZ2V0RG9jIiwicHJvamVjdCIsIlN0b3JlIiwiZ2V0RG9jdW1lbnRSYXciLCJ2ZXJib3NlIiwiZ2V0R1VJQ29uZmlnIiwiZ2V0SGllcmFyY2h5Iiwib3JnTW9kZUFycmF5Iiwic3BsaXQiLCJpbml0aWFsRGF0YSIsImV4cGFuZGVkIiwiZXhwYW5kZWRDb21tZW50IiwicGFyZW50cyIsImN1cnJlbnRJbmRlbnQiLCJ1cmwiLCJnZXRVUkwiLCJpIiwiaWR4U3BhY2UiLCJpbmRleE9mIiwiaWR4QmFyIiwidGl0bGUiLCJzdWJzdHIiLCJwdXNoIiwiaiIsInBvcCIsInRvU3RyaW5nIiwiZ2V0IiwidGhlbiIsInJlcyIsImRhdGEiLCJzYXZlSGllcmFyY2h5Iiwia2V5cyIsInRlc3QiLCJyZXNJIiwiY2F0Y2giLCJjb25zb2xlIiwibG9nIiwidHJlZSIsInRvZ2dsZVRhYmxlIiwiQWN0aW9ucyIsInJlc3RhcnREb2NUeXBlIiwidG9nZ2xlRGVsZXRlTW9kYWwiLCJzaG93RGVsZXRlTW9kYWwiLCJpbnB1dENoYW5nZSIsImV2ZW50IiwibmV3SXRlbSIsInRhcmdldCIsInZhbHVlIiwicHJlc3NlZEJ1dHRvbiIsInRhc2siLCJkZWxldGVEb2MiLCJfcmV2IiwiY29tU3RhdGUiLCJjb250ZW50IiwiX2lkIiwidHJlZVRvT3JnTW9kZSIsImNhbGxiYWNrIiwicmVhZERvY3VtZW50IiwiZXhwYW5kIiwiY29tbWVudCIsImV4cGFuZGVkMiIsImVkaXRJdGVtIiwic2xpY2UiLCJ0ZW1wRG9jIiwib250b2xvZ3lOb2RlIiwicXVlcnkiLCJ1bml0IiwicmVxdWlyZWQiLCJtb2RlIiwic2hvd0Zvcm0iLCJkb2NUeXBlIiwiZ2V0T250b2xvZ3kiLCJlcnIiLCJlZGl0UHJvamVjdCIsImNoYW5nZVRyZWUiLCJkaXJlY3Rpb24iLCJjaGFuZ2VkRmxhdERhdGEiLCJyb3ciLCJmaWx0ZXIiLCJpZHgiLCJzcGxpY2UiLCJwcmV2aW91c1NpYmxpbmciLCJwYXJlbnRQYXRoIiwiY29uY2F0IiwicGFyZW50SUQiLCJuZXdJRCIsImZpcnN0Q2hpbGQiLCJicmFuY2giLCJyZXN1bHQiLCJjaGlsZHJlbiIsImRpc3BhdGNoZXJUb2tlbiIsImNvbXBvbmVudERpZE1vdW50IiwiZGlzcGF0Y2hlciIsInJlZ2lzdGVyIiwib24iLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInVucmVnaXN0ZXIiLCJyZW1vdmVMaXN0ZW5lciIsInByZWZpeFN0YXJzIiwiZGVsSXRlbSIsIm9yZ01vZGUiLCJkZWxTdWJ0cmVlIiwiQm9vbGVhbiIsImNoaWxkcmVuU3RyaW5nIiwiZG9jSURTdHJpbmciLCJzdWJzdHJpbmciLCJ0YWdzIiwiam9pbiIsInJlcGVhdCIsInNob3dXaXRoSW1hZ2UiLCJpbWFnZSIsImJhc2U2NGRhdGEiLCJidG9hIiwidW5lc2NhcGUiLCJlbmNvZGVVUklDb21wb25lbnQiLCJpbWFnZVRhZyIsInNob3dNaXNjIiwic2hvd1dpdGhDb250ZW50Iiwic2hvd1dpdGhvdXQiLCJsaXN0SXRlbXMiLCJpdGVtU2tpcCIsIml0ZW1EQiIsImxhYmVsIiwiY2hhckF0IiwidG9VcHBlckNhc2UiLCJBcnJheSIsImlzQXJyYXkiLCJjb2xvciIsImNvbG9yV2FybmluZyIsInNob3dUcmVlIiwidGhpc1RleHQiLCJwcmV2VGV4dCIsImRvY0xhYmVsIiwiZ2V0RG9jVHlwZUxhYmVscyIsInRvTG93ZXJDYXNlIiwiZGF0ZSIsIkRhdGUiLCJub3ciLCJtYXhIaWVyYXJjaHlEZXB0aCIsInRvTG9jYWxlU3RyaW5nIiwiRUxFQ1RST04iLCJyZW5kZXIiLCJhcmVhU2Nyb2xsWSIsImhlaWdodCIsIndpbmRvdyIsImlubmVySGVpZ2h0IiwiYmFja2dyb3VuZCIsImNvbG9yQkciLCJoMSIsImNvbG9yU3Ryb25nIiwiYnRuU3Ryb25nIiwiYnRuU3Ryb25nRGVhY3RpdmUiLCJidG4iLCJvYmplY3RpdmUiLCJzdGF0dXMiLCJtYXJnaW5SaWdodCIsImtleSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQWRBO0FBQ0E7QUFDMkU7QUFDQTtBQUVyQjtBQUMyQjtBQUNQO0FBQ0E7QUFDSTtBQVEvRCxNQUFNQSxPQUFOLFNBQXNCQyxnQkFBdEIsQ0FBZ0M7QUFDN0M7QUFDQUMsRUFBQUEsV0FBVyxHQUFHO0FBQ1o7O0FBRFksU0E2QmRDLGFBN0JjLEdBNkJDQyxNQUFELElBQVU7QUFDdEI7QUFDQSxVQUFJQSxNQUFNLENBQUNDLElBQVAsS0FBYyxpQkFBbEIsRUFBcUM7QUFDbkNDLFFBQUFBLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjSCxNQUFNLENBQUNJLE1BQXJCLEVBQTZCSixNQUFNLENBQUNLLEdBQXBDO0FBQ0FMLFFBQUFBLE1BQU0sQ0FBQ0ksTUFBUCxDQUFjLE9BQWQsSUFBdUIsVUFBUUosTUFBTSxDQUFDSSxNQUFQLENBQWNFLEVBQTdDO0FBQ0EsWUFBSUMsTUFBTSxHQUFHLEVBQUMsR0FBR1AsTUFBTSxDQUFDSTtBQUFYLFNBQWI7QUFDQSxTQUFDLElBQUQsRUFBTSxRQUFOLEVBQWUsTUFBZixFQUFzQixRQUF0QixFQUErQixPQUEvQixFQUF3Q0ksT0FBeEMsQ0FBZ0RDLENB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QUFLLEVBQUUsS0FBS0QsS0FBTCxDQUFXNkQsT0FBekI7QUFBa0MsTUFBQSxRQUFRLEVBQUUsS0FBS0YsV0FBakQ7QUFBOEQsTUFBQSxTQUFTLEVBQUMsTUFBeEU7QUFDRSxNQUFBLFNBQVMsRUFBRTlELENBQUMsSUFBS0EsQ0FBQyxDQUFDK0ssR0FBRixLQUFRLE9BQVQsSUFBc0IsS0FBS2xGLFVBQUwsQ0FBZ0IsSUFBaEIsRUFBcUIsS0FBckI7QUFEeEMsTUFERixlQUdFLDZCQUFDLGFBQUQ7QUFBUyxNQUFBLEtBQUssRUFBQztBQUFmLG9CQUNFLDZCQUFDLGdCQUFEO0FBQVksTUFBQSxPQUFPLEVBQUUsTUFBTSxLQUFLQSxVQUFMLENBQWdCLElBQWhCLEVBQXFCLEtBQXJCLENBQTNCO0FBQXdELE1BQUEsT0FBTyxFQUFDLFdBQWhFO0FBQTRFLE1BQUEsU0FBUyxFQUFDO0FBQXRGLG9CQUNFLDZCQUFDLGdCQUFEO0FBQVcsTUFBQSxRQUFRLEVBQUM7QUFBcEIsTUFERixDQURGLENBSEYsQ0FqREYsQ0FsQ0YsZUE2RkUsNkJBQUMsa0JBQUQsT0E3RkYsQ0FERjtBQWlHRDs7QUE5b0I0QyIsInNvdXJjZXNDb250ZW50IjpbIi8qIFByb2plY3Qgdmlld1xuKi9cbmltcG9ydCBSZWFjdCwgeyBDb21wb25lbnQgfSBmcm9tICdyZWFjdCc7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCB7IElucHV0LCBJY29uQnV0dG9uLCBCdXR0b24sIFRvb2x0aXAgfSBmcm9tICdAbWF0ZXJpYWwtdWkvY29yZSc7ICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCB7IEVkaXQsIEV4cGFuZE1vcmUsIEV4cGFuZExlc3MsIERlbGV0ZSwgQWRkQ2lyY2xlLCBBZGQsIEFycm93VXB3YXJkLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIEFycm93QmFjaywgQXJyb3dGb3J3YXJkIH0gZnJvbSAnQG1hdGVyaWFsLXVpL2ljb25zJzsvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQge2dldFRyZWVGcm9tRmxhdERhdGEsIGdldEZsYXREYXRhRnJvbVRyZWV9IGZyb20gJ3JlYWN0LXNvcnRhYmxlLXRyZWUnOyAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgUmVhY3RNYXJrZG93biBmcm9tICdyZWFjdC1tYXJrZG93bic7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCBNb2RhbEZvcm0gZnJvbSAnLi9Nb2RhbEZvcm0nOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IE1vZGFsU2ltcGxlIGZyb20gJy4vTW9kYWxTaW1wbGUnOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0ICogYXMgQWN0aW9ucyBmcm9tICcuLi9BY3Rpb25zJztcbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gJy4uL0Rpc3BhdGNoZXInO1xuaW1wb3J0IFN0b3JlIGZyb20gJy4uL1N0b3JlJztcbmltcG9ydCB7RUxFQ1RST04sIGV4ZWN1dGVDbWR9IGZyb20gJy4uL2xvY2FsSW50ZXJhY3Rpb24nO1xuaW1wb3J0IHsgaDEsIGFyZWFTY3JvbGxZLCBjb2xvckJHLCBidG5TdHJvbmcsIGJ0biwgY29sb3JTdHJvbmcsIGNvbG9yV2FybmluZyxcbiAgYnRuU3Ryb25nRGVhY3RpdmUgfSBmcm9tICcuLi9zdHlsZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByb2plY3QgZXh0ZW5kcyBDb21wb25lbnQge1xuICAvL2luaXRpYWxpemVcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgLy9kYXRhXG4gICAgICBwcm9qZWN0OiBTdG9yZS5nZXREb2N1bWVudFJhdygpLCAvL3Byb2plY3RcbiAgICAgIHRyZWVEYXRhOiBbXSxcbiAgICAgIC8vZm9yIHZpc3VhbGl6YXRpb25cbiAgICAgIGV4cGFuZGVkOiB7fSxcbiAgICAgIGV4cGFuZGVkQ29tbWVudDoge30sICAvL2xvbmcgY29tbWVudHNcbiAgICAgIG5ld0l0ZW06ICcnLFxuICAgICAgc2F2ZUhpZXJhcmNoeTogZmFsc2UsXG4gICAgICAvL21pc2NcbiAgICAgIGRpc3BhdGNoZXJUb2tlbjogbnVsbCxcbiAgICAgIHNob3dEZWxldGVNb2RhbDogJ25vbmUnXG4gICAgfTtcbiAgfVxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtkaXNwYXRjaGVyVG9rZW46IGRpc3BhdGNoZXIucmVnaXN0ZXIodGhpcy5oYW5kbGVBY3Rpb25zKX0pO1xuICAgIFN0b3JlLm9uKCdjaGFuZ2VEb2MnLCB0aGlzLmdldERvYyk7XG4gICAgU3RvcmUub24oJ2NoYW5nZURvYycsIHRoaXMuZ2V0SGllcmFyY2h5KTtcbiAgfVxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBkaXNwYXRjaGVyLnVucmVnaXN0ZXIodGhpcy5zdGF0ZS5kaXNwYXRjaGVyVG9rZW4pO1xuICAgIFN0b3JlLnJlbW92ZUxpc3RlbmVyKCdjaGFuZ2VEb2MnLCB0aGlzLmdldERvYyk7XG4gICAgU3RvcmUucmVtb3ZlTGlzdGVuZXIoJ2NoYW5nZURvYycsIHRoaXMuZ2V0SGllcmFyY2h5KTtcbiAgfVxuXG5cbiAgLyoqIEZ1bmN0aW9ucyBhcyBjbGFzcyBwcm9wZXJ0aWVzIChpbW1lZGlhdGVseSBib3VuZCk6IHJlYWN0IG9uIHVzZXIgaW50ZXJhY3Rpb25zICoqL1xuICBoYW5kbGVBY3Rpb25zPShhY3Rpb24pPT57XG4gICAgLyogaGFuZGxlIGFjdGlvbnMgdGhhdCBjb21lcyBmcm9tIG90aGVyIEdVSSBlbGVtZW50cyovXG4gICAgaWYgKGFjdGlvbi50eXBlPT09J0NIQU5HRV9URVhUX0RPQycpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24oYWN0aW9uLm9sZERvYywgYWN0aW9uLmRvYyk7XG4gICAgICBhY3Rpb24ub2xkRG9jWydkb2NJRCddPSd0ZW1wXycrYWN0aW9uLm9sZERvYy5pZDtcbiAgICAgIHZhciBuZXdEb2MgPSB7Li4uYWN0aW9uLm9sZERvY307XG4gICAgICBbJ2lkJywncGFyZW50JywncGF0aCcsJ2RlbGV0ZScsJ2RvY0lEJ10uZm9yRWFjaChlPT4gZGVsZXRlIG5ld0RvY1tlXSk7XG4gICAgICB0aGlzLnNldFN0YXRlKHtbJ3RlbXBfJythY3Rpb24ub2xkRG9jLmlkXTogbmV3RG9jfSk7XG4gICAgICB2YXIgZmxhdERhdGEgPSB0aGlzLmZsYXREYXRhKHRoaXMuc3RhdGUudHJlZURhdGEpO1xuICAgICAgZmxhdERhdGEgPSBmbGF0RGF0YS5tYXAoKGl0ZW0pPT57XG4gICAgICAgIGlmIChpdGVtLmlkPT09YWN0aW9uLm9sZERvYy5pZClcbiAgICAgICAgICByZXR1cm4gYWN0aW9uLm9sZERvYztcbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3RyZWVEYXRhOiB0aGlzLnRyZWVEYXRhKGZsYXREYXRhKX0pO1xuICAgIH1cbiAgfVxuXG4gIGZsYXREYXRhPSh0cmVlRGF0YSk9PntcbiAgICAvKiBjcmVhdGUgZmxhdCBkYXRhIGZyb20gdHJlZSBkYXRhIGFuZCByZXR1cm4gaXQgKi9cbiAgICB2YXIgZmxhdERhdGEgPSBnZXRGbGF0RGF0YUZyb21UcmVlKHtcbiAgICAgIHRyZWVEYXRhOiB0cmVlRGF0YSxcbiAgICAgIGdldE5vZGVLZXk6ICh7IG5vZGUgfSkgPT4gbm9kZS5pZCwgLy8gVGhpcyBlbnN1cmVzIHlvdXIgXCJpZFwiIHByb3BlcnRpZXMgYXJlIGV4cG9ydGVkIGluIHRoZSBwYXRoXG4gICAgICBpZ25vcmVDb2xsYXBzZWQ6IGZhbHNlLCAvLyBNYWtlcyBzdXJlIHlvdSB0cmF2ZXJzZSBldmVyeSBub2RlIGluIHRoZSB0cmVlLCBub3QganVzdCB0aGUgdmlzaWJsZSBvbmVzXG4gICAgfSkubWFwKCh7IG5vZGUsIHBhdGggfSkgPT4gKHtcbiAgICAgIGlkOiBub2RlLmlkLFxuICAgICAgZG9jSUQ6IG5vZGUuZG9jSUQsXG4gICAgICBwYXJlbnQ6IHBhdGgubGVuZ3RoID4gMSA/IHBhdGhbcGF0aC5sZW5ndGggLSAyXSA6IG51bGwsXG4gICAgICBuYW1lOiBub2RlLm5hbWUsXG4gICAgICBkZWxldGU6IG5vZGUuZGVsZXRlLFxuICAgICAgcGF0aDogcGF0aFxuICAgIH0pKTtcbiAgICByZXR1cm4gZmxhdERhdGE7XG4gIH1cblxuICB0cmVlRGF0YT0oZmxhdERhdGEpPT57XG4gICAgLyogY3JlYXRlIHRyZWUgZGF0YSBmcm9tIGZsYXQgZGF0YSBhbmQgcmV0dXJuIGl0ICovXG4gICAgdmFyIHRyZWVEYXRhID0gZ2V0VHJlZUZyb21GbGF0RGF0YSh7XG4gICAgICBmbGF0RGF0YTogZmxhdERhdGEubWFwKG5vZGUgPT4gKHsgLi4ubm9kZX0pKSxcbiAgICAgIGdldEtleTogbm9kZSA9PiBub2RlLmlkLCAvLyByZXNvbHZlIGEgbm9kZSdzIGtleVxuICAgICAgZ2V0UGFyZW50S2V5OiBub2RlID0+IG5vZGUucGFyZW50LCAvLyByZXNvbHZlIGEgbm9kZSdzIHBhcmVudCdzIGtleVxuICAgICAgcm9vdEtleTogbnVsbCwgLy8gVGhlIHZhbHVlIG9mIHRoZSBwYXJlbnQga2V5IHdoZW4gdGhlcmUgaXMgbm8gcGFyZW50IChpLmUuLCBhdCByb290IGxldmVsKVxuICAgIH0pO1xuICAgIHJldHVybiB0cmVlRGF0YTtcbiAgfVxuXG4gIGdldERvYz0oKT0+e1xuICAgIC8qIEluaXRpYWxpemF0aW9uIG9mIGhlYWRlcjogcHJvamVjdFxuICAgICAgIGdldCBpbmZvcm1hdGlvbiBmcm9tIHN0b3JlIGFuZCBwdXNoIGluZm9ybWF0aW9uIHRvIGFjdGlvbnMgKi9cbiAgICB0aGlzLnNldFN0YXRlKHtwcm9qZWN0OiBTdG9yZS5nZXREb2N1bWVudFJhdygpLCB2ZXJib3NlOiBTdG9yZS5nZXRHVUlDb25maWcoJ3ZlcmJvc2UnKX0pO1xuICB9XG5cbiAgZ2V0SGllcmFyY2h5PSgpPT57XG4gICAgLyogSW5pdGlhbGl6YXRpb24gb2YgdHJlZTpcbiAgICAgICAgIGdldCBvcmdNb2RlIGhpZXJhcmNoeSBmcm9tIHN0b3JlXG4gICAgICAgICBjcmVhdGUgZmxhdERhdGEtc3RydWN0dXJlIGZyb20gdGhhdCBvcmdNb2RlIHN0cnVjdHVyZVxuICAgICAgICAgY3JlYXRlIHRyZWUtbGlrZSBkYXRhIGZvciBTb3J0YWJsZVRyZWUgZnJvbSBmbGF0RGF0YSAqL1xuICAgIGNvbnN0IG9yZ01vZGVBcnJheSA9IFN0b3JlLmdldEhpZXJhcmNoeSgpLnNwbGl0KCdcXG4nKTtcbiAgICB2YXIgaW5pdGlhbERhdGEgICAgPSBbXTtcbiAgICB2YXIgZXhwYW5kZWQgICAgICAgPSB0aGlzLnN0YXRlLmV4cGFuZGVkO1xuICAgIHZhciBleHBhbmRlZENvbW1lbnQ9IHt9O1xuICAgIHZhciBwYXJlbnRzID0gW251bGxdO1xuICAgIHZhciBjdXJyZW50SW5kZW50ID0gMjtcbiAgICB2YXIgdXJsID0gU3RvcmUuZ2V0VVJMKCk7XG4gICAgZm9yICh2YXIgaSA9MTsgaTxvcmdNb2RlQXJyYXkubGVuZ3RoOyBpKyspeyAvL2Zvci1sb29wIGNhbm5vdCBiZSBtYXAgYmVjYXVzZSBjb25zZWN1dGl2ZSBsaW5lcyBkZXBlbmQgb24gZWFjaCBvdGhlclxuICAgICAgdmFyIGlkeFNwYWNlID0gb3JnTW9kZUFycmF5W2ldLmluZGV4T2YoJyAnKTtcbiAgICAgIHZhciBpZHhCYXIgICA9IG9yZ01vZGVBcnJheVtpXS5pbmRleE9mKCd8fCcpO1xuICAgICAgaWYgKGlkeFNwYWNlPDEpXG4gICAgICAgIGJyZWFrO1xuICAgICAgY29uc3QgdGl0bGUgPSBvcmdNb2RlQXJyYXlbaV0uc3Vic3RyKGlkeFNwYWNlLGlkeEJhci1pZHhTcGFjZSk7XG4gICAgICBjb25zdCBkb2NJRCA9IG9yZ01vZGVBcnJheVtpXS5zdWJzdHIoaWR4QmFyKzIpO1xuICAgICAgaWYgKGlkeFNwYWNlPmN1cnJlbnRJbmRlbnQpIHtcbiAgICAgICAgcGFyZW50cy5wdXNoKGktMSk7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBqPTA7IGo8KGN1cnJlbnRJbmRlbnQtaWR4U3BhY2UpOyBqKyspIHtcbiAgICAgICAgcGFyZW50cy5wb3AoKTtcbiAgICAgIH1cbiAgICAgIGN1cnJlbnRJbmRlbnQgPSBpZHhTcGFjZTtcbiAgICAgIGluaXRpYWxEYXRhLnB1c2goe1xuICAgICAgICBpZDppLnRvU3RyaW5nKCksXG4gICAgICAgIHBhcmVudDpwYXJlbnRzW3BhcmVudHMubGVuZ3RoLTFdLFxuICAgICAgICBkb2NJRDpkb2NJRCxcbiAgICAgICAgbmFtZTogdGl0bGUsXG4gICAgICAgIGRlbGV0ZTogZmFsc2VcbiAgICAgIH0pO1xuICAgICAgaWYgKCEoaS50b1N0cmluZygpIGluIGV4cGFuZGVkKSkgIC8vaWYgbm90IGluIHN0YXRlLCBkZWZhdWx0IGlzIGNsb3NlZFxuICAgICAgICBleHBhbmRlZFtpLnRvU3RyaW5nKCldICAgICAgICA9IGZhbHNlO1xuICAgICAgZXhwYW5kZWRDb21tZW50W2RvY0lEXSA9IHRydWU7XG4gICAgICAvL3N0YXJ0IGZpbGxpbmcgbG9jYWwgZGF0YWJhc2Ugb2YgaXRlbXNcbiAgICAgIC8vIGlmIHJlbG9hZCBiZWNhdXNlIG9ubHkgb25lIGRhdGEgaGFzIGNoYW5nZWQsIG9ubHkgcmVsb2FkIHRoYXQgKHVzZSBzdGF0ZSB0byBpZGVudGlmeSBpZiB0aGF0KVxuICAgICAgdXJsLnVybC5nZXQodXJsLnBhdGgrZG9jSUQpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICBpZiAoZG9jSUQgaW4gdGhpcy5zdGF0ZSAmJiB0aGlzLnN0YXRlW2RvY0lEXS5uYW1lIT1yZXMuZGF0YS5uYW1lKSB7XG4gICAgICAgICAgLy9uYW1lIGNoYW5nZTogZGlyZWN0b3J5IHN0cnVjdHVyZSBoYXMgdG8gY2hhbmdlIGFjY29yZGluZ2x5XG4gICAgICAgICAgdmFyIGZsYXREYXRhID0gdGhpcy5mbGF0RGF0YSh0aGlzLnN0YXRlLnRyZWVEYXRhKTtcbiAgICAgICAgICBmbGF0RGF0YSA9IGZsYXREYXRhLm1hcChpPT57cmV0dXJuIGkuZG9jSUQ9PWRvY0lEID8gT2JqZWN0LmFzc2lnbihpLHtuYW1lOnJlcy5kYXRhLm5hbWV9KSA6IGk7fSk7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c2F2ZUhpZXJhcmNoeTp0cnVlLCB0cmVlRGF0YTp0aGlzLnRyZWVEYXRhKGZsYXREYXRhKSB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtbZG9jSURdOiByZXMuZGF0YX0pO1xuICAgICAgICAvL2Rvd25sb2FkIHN1Yml0ZW1zIGludG8gbG9jYWwgZGF0YWJhc2VcbiAgICAgICAgT2JqZWN0LmtleXMocmVzLmRhdGEpLm1hcChpPT57XG4gICAgICAgICAgaWYgKC9eW2Etd3l6XS1bXFx3XFxkXXszMn0kLy50ZXN0KHJlcy5kYXRhW2ldKSAmJiBpIT0nX2lkJykgeyAvL2lmIGxpbmsgdG8gb3RoZXIgZGF0YXNldFxuICAgICAgICAgICAgdXJsLnVybC5nZXQodXJsLnBhdGgrcmVzLmRhdGFbaV0pLnRoZW4oKHJlc0kpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7W3Jlcy5kYXRhW2ldXTogcmVzSS5kYXRhfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoKT0+e1xuICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtbcmVzLmRhdGFbaV1dOiBudWxsfSk7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQcm9qZWN0OmdldEhpZXJhcmNoeSBsZXZlbCAyOiBFcnJvciBlbmNvdW50ZXJlZDogJyt1cmwucGF0aCtyZXMuZGF0YVtpXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSkuY2F0Y2goKCk9PntcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7W2RvY0lEXTogbnVsbH0pO1xuICAgICAgICBjb25zb2xlLmxvZygnUHJvamVjdDpnZXRIaWVyYXJjaHk6IEVycm9yIGVuY291bnRlcmVkOiAnK3VybC5wYXRoK2RvY0lEKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB2YXIgdHJlZSA9IHRoaXMudHJlZURhdGEoaW5pdGlhbERhdGEpO1xuICAgIC8vY29udmVydCBiYWNrL2ZvcnRoIHRvIGZsYXQtZGF0YSB0byBpbmNsdWRlIHBhdGggKGhpZXJhcmNoeVN0YWNrKVxuICAgIGNvbnN0IGZsYXREYXRhID0gdGhpcy5mbGF0RGF0YSh0cmVlKTtcbiAgICB0cmVlID0gdGhpcy50cmVlRGF0YShmbGF0RGF0YSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7dHJlZURhdGE6IHRyZWUsIGV4cGFuZGVkOiBleHBhbmRlZCwgZXhwYW5kZWRDb21tZW50OiBleHBhbmRlZENvbW1lbnR9KTtcbiAgfVxuXG4gIHRyZWVUb09yZ01vZGUoY2hpbGRyZW4scHJlZml4U3RhcnMsZGVsSXRlbSkge1xuICAgIC8qIHJlY3Vyc2l2ZSBmdW5jdGlvbiB0byBmaW5hbGl6ZVxuICAgICAgIHRyZWUtbGlrZSBkYXRhIGZyb20gU29ydGFibGVUcmVlIHRvIG9yZ01vZGUsIHdoaWNoIGlzIGNvbW11bmljYXRlZCB0byBiYWNrZW5kICovXG4gICAgcHJlZml4U3RhcnMgKz0gMTtcbiAgICB2YXIgb3JnTW9kZSA9IGNoaWxkcmVuLm1hcCgoIGl0ZW0gKT0+e1xuICAgICAgY29uc3QgZGVsU3VidHJlZSAgICAgPSAoaXRlbS5kZWxldGUpID8gdHJ1ZSA6IEJvb2xlYW4oZGVsSXRlbSk7XG4gICAgICBjb25zdCBjaGlsZHJlblN0cmluZyA9ICdjaGlsZHJlbicgaW4gaXRlbSA/XG4gICAgICAgICdcXG4nK3RoaXMudHJlZVRvT3JnTW9kZShpdGVtLmNoaWxkcmVuLHByZWZpeFN0YXJzLCBkZWxTdWJ0cmVlKSA6ICcnO1xuICAgICAgY29uc3QgbmFtZSAgICAgICAgPSAoZGVsU3VidHJlZSkgPyAnLWRlbGV0ZS0nIDogaXRlbS5uYW1lO1xuICAgICAgY29uc3QgZG9jSURTdHJpbmcgPSAoaXRlbS5kb2NJRCAmJiBpdGVtLmRvY0lELnN1YnN0cmluZygwLDUpIT0ndGVtcF8nKSA/XG4gICAgICAgICd8fCcraXRlbS5kb2NJRCA6ICcnO1xuICAgICAgdmFyIGNvbW1lbnQgICAgID0gJyc7XG4gICAgICBpZiAoaXRlbS5kb2NJRCAmJiBpdGVtLmRvY0lELnN1YnN0cmluZygwLDUpPT0ndGVtcF8nICYmIHRoaXMuc3RhdGVbaXRlbS5kb2NJRF0pIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGVbaXRlbS5kb2NJRF0udGFncykgLy90YWdzIGFyZSBpbiBkb2N1bWVudFxuICAgICAgICAgIGNvbW1lbnQgKz0gdGhpcy5zdGF0ZVtpdGVtLmRvY0lEXS50YWdzLmpvaW4oJyAnKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGVbaXRlbS5kb2NJRF0uY29tbWVudCkgLy9jb21tZW50IGlzIGluIGRvY3VtZW50XG4gICAgICAgICAgY29tbWVudCArPSAnICcrdGhpcy5zdGF0ZVtpdGVtLmRvY0lEXS5jb21tZW50O1xuICAgICAgICBpZiAoY29tbWVudC5sZW5ndGg+MSlcbiAgICAgICAgICBjb21tZW50ID0gJ1xcbicrY29tbWVudDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAnKicucmVwZWF0KHByZWZpeFN0YXJzKSsnICcrbmFtZStkb2NJRFN0cmluZytjb21tZW50K2NoaWxkcmVuU3RyaW5nO1xuICAgIH0pO1xuICAgIHJldHVybiBvcmdNb2RlLmpvaW4oJ1xcbicpO1xuICB9XG5cbiAgdG9nZ2xlVGFibGU9KCk9PntcbiAgICAvKiBjbG9zZSBwcm9qZWN0IHZpZXcgKi9cbiAgICBBY3Rpb25zLnJlc3RhcnREb2NUeXBlKCk7XG4gIH1cbiAgdG9nZ2xlRGVsZXRlTW9kYWw9KCk9PntcbiAgICAvKiogY2hhbmdlIHZpc2liaWxpdHkgb2YgbW9kYWwgKi9cbiAgICBpZih0aGlzLnN0YXRlLnNob3dEZWxldGVNb2RhbD09PSdub25lJykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2hvd0RlbGV0ZU1vZGFsOiAnYmxvY2snfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dEZWxldGVNb2RhbDogJ25vbmUnfSk7XG4gICAgfVxuICB9XG5cblxuICBpbnB1dENoYW5nZT0oZXZlbnQpPT57XG4gICAgLyogY2hhbmdlIGluIGlucHV0IGZpZWxkIGF0IGJvdHRvbSAqL1xuICAgIHRoaXMuc2V0U3RhdGUoe25ld0l0ZW06IGV2ZW50LnRhcmdldC52YWx1ZX0pO1xuICB9XG5cbiAgcHJlc3NlZEJ1dHRvbj0odGFzayk9PntcbiAgICAvKiogZ2xvYmFsIHByZXNzZWQgYnV0dG9uczogc2libGluZyBmb3IgcHJlc3NlZEJ1dHRvbiBpbiBDb25maWdQYWdlOiBjaGFuZ2UgYm90aCBzaW1pbGFybHkgKi9cbiAgICBpZiAodGFzaz09J2J0bl9wcm9qX2ZlX2RlbGV0ZUhpZXJhcmNoeScpIHtcbiAgICAgIC8vbG9vcCB0aHJvdWdoIGFsbCBzdWItZWxlbWVudHMgYW5kIGRlbGV0ZSB0aGVtXG4gICAgICAvLyAoYWxsIGhpZXJhcmNoeSBlbGVtZW50cyBhbmQgYWxsIG90aGVyIGVsZW1lbnRzIHdpdGggb25lIGJyYW5jaClcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuc3RhdGUpLm1hcChpdGVtPT57XG4gICAgICAgIGlmIChpdGVtLmxlbmd0aD09MzQgJiYgaXRlbVsxXT09Jy0nKXtcbiAgICAgICAgICBpZiAoaXRlbVswXT09J3gnIHx8IHRoaXMuc3RhdGVbaXRlbV1bJy1icmFuY2gnXS5sZW5ndGg9PTEpIHtcbiAgICAgICAgICAgIFN0b3JlLmRlbGV0ZURvYyhpdGVtLCB0aGlzLnN0YXRlW2l0ZW1dLl9yZXYpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBTdG9yZS5kZWxldGVEb2MoKTsgIC8vcmVtb3ZlIHByb2plY3RcbiAgICAgIHRoaXMudG9nZ2xlVGFibGUoKTsgIC8vY2FuY2VsXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vYWxsIG90aGVyIGZ1bmN0aW9uc1xuICAgICAgQWN0aW9ucy5jb21TdGF0ZSgnYnVzeScpO1xuICAgICAgdmFyIGNvbnRlbnQgPSBudWxsO1xuICAgICAgaWYgKHRhc2s9PSdidG5fcHJval9iZV9zYXZlSGllcmFyY2h5Jykge1xuICAgICAgICBjb250ZW50ID0gdGhpcy5zdGF0ZS5wcm9qZWN0WyctbmFtZSddKyd8fCcrdGhpcy5zdGF0ZS5wcm9qZWN0Ll9pZCsnXFxuJztcbiAgICAgICAgY29udGVudCArPSB0aGlzLnRyZWVUb09yZ01vZGUodGhpcy5zdGF0ZS50cmVlRGF0YSwgMCwgZmFsc2UpO1xuICAgICAgfVxuICAgICAgZXhlY3V0ZUNtZCh0YXNrLHRoaXMuY2FsbGJhY2ssdGhpcy5zdGF0ZS5wcm9qZWN0Ll9pZCxjb250ZW50KTtcbiAgICB9XG4gIH1cbiAgY2FsbGJhY2s9KGNvbnRlbnQpPT57XG4gICAgaWYgKGNvbnRlbnQuaW5kZXhPZignU1VDQ0VTUycpPi0xKSB7XG4gICAgICBBY3Rpb25zLmNvbVN0YXRlKCdvaycpO1xuICAgICAgLy9TYXZlLCBldGMuIGRvZXMgbm90IGxlYWQgdG8gcmV2ZXJzaW9uIHRvIHByb2plY3QtdGFibGUsIGJ1dCB0byByZS1pbml0aWFsaXphdGlvbiBvZiB0aGlzIHByb2plY3RcbiAgICAgIC8vIC0gdXNlcnMgbWFpbmx5IHdvcmsgaW4gcHJvamVjdCBhbmQgc2F2ZSBpcyB1c2VkIGZvciBpbnRlcm1lZGlhdGUgc2FmZXR5XG4gICAgICAvLyB0aGlzLnByb3BzLmNhbGxiYWNrKCk7XG4gICAgICAvL1RPRE9fUDI6IGFmdGVyIHNhdmUgb2YgdHJlZTogc2F2ZSBvZiBwcm9qZWN0IGRvY3VtZW50IGlzIHRoZW4gaW1wb3NzaWJsZSBiZWNhdXNlIF9yZXYgbm90IHVwZGF0ZWRcbiAgICAgIFN0b3JlLnJlYWREb2N1bWVudCh0aGlzLnN0YXRlLnByb2plY3QuX2lkKTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NhdmVIaWVyYXJjaHk6IGZhbHNlfSk7XG4gICAgICB0aGlzLmdldEhpZXJhcmNoeSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBBY3Rpb25zLmNvbVN0YXRlKCdmYWlsJyk7XG4gICAgICBjb25zb2xlLmxvZygnY2FsbGJhY2snLGNvbnRlbnQpO1xuICAgIH1cbiAgfVxuXG5cbiAgZXhwYW5kPShpZCwgY29tbWVudD1mYWxzZSkgPT4ge1xuICAgIC8qIGV4cGFuZC9jb2xsYXBzZSBjZXJ0YWluIGJyYW5jaCAqL1xuICAgIGlmIChjb21tZW50KSB7XG4gICAgICB2YXIgZXhwYW5kZWQgPSB0aGlzLnN0YXRlLmV4cGFuZGVkQ29tbWVudDtcbiAgICAgIGV4cGFuZGVkW2lkXSA9ICEgZXhwYW5kZWRbaWRdO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7ZXhwYW5kZWRDb21tZW50OiBleHBhbmRlZH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZXhwYW5kZWQyID0gdGhpcy5zdGF0ZS5leHBhbmRlZDtcbiAgICAgIGV4cGFuZGVkMltpZF0gPSAhIGV4cGFuZGVkMltpZF07XG4gICAgICB0aGlzLnNldFN0YXRlKHtleHBhbmRlZDogZXhwYW5kZWQyfSk7XG4gICAgfVxuICB9XG5cbiAgZWRpdEl0ZW09KGl0ZW0pPT57XG4gICAgLyogY2xpY2sgZWRpdCBidXR0b24gZm9yIG9uZSBpdGVtIGluIHRoZSBoaWVyYXJjaHk7IHByb2plY3QtZWRpdCBoYW5kbGVkIHNlcGFyYXRlbHkgKi9cbiAgICBpZiAoaXRlbS5kb2NJRD09JycgfHwgaXRlbS5kb2NJRC5zbGljZSgwLDUpPT0ndGVtcF8nKSB7XG4gICAgICB2YXIgdGVtcERvYyA9IHsuLi5pdGVtfTtcbiAgICAgIHRlbXBEb2NbJy10eXBlJ10gPSBbJ3gxJ107XG4gICAgICBjb25zdCBvbnRvbG9neU5vZGUgPSBbe25hbWU6J25hbWUnLCBxdWVyeTonV2hhdCBpcyB0aGUgbmFtZT8nLCB1bml0OicnLCByZXF1aXJlZDp0cnVlfSxcbiAgICAgICAge25hbWU6ICdjb21tZW50JywgcXVlcnk6ICcjdGFncyBjb21tZW50cyByZW1hcmtzIDpmaWVsZDp2YWx1ZTonLCB1bml0OiAnJywgcmVxdWlyZWQ6IGZhbHNlfV07XG4gICAgICBjb25zdCBtb2RlID0gKGl0ZW0ubmFtZS5sZW5ndGg9PTApID8gJ25ldycgOiAnZWRpdCc7XG4gICAgICBBY3Rpb25zLnNob3dGb3JtKG1vZGUsb250b2xvZ3lOb2RlLHRlbXBEb2MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdXJsID0gU3RvcmUuZ2V0VVJMKCk7XG4gICAgICB1cmwudXJsLmdldCh1cmwucGF0aCtpdGVtLmRvY0lEKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgY29uc3QgZG9jID0gcmVzLmRhdGE7XG4gICAgICAgIGNvbnN0IGRvY1R5cGU9ZG9jWyctdHlwZSddWzBdO1xuICAgICAgICBjb25zdCBvbnRvbG9neU5vZGUgPSBTdG9yZS5nZXRPbnRvbG9neSgpW2RvY1R5cGVdO1xuICAgICAgICBBY3Rpb25zLnNob3dGb3JtKCdlZGl0Jywgb250b2xvZ3lOb2RlLCBkb2MpO1xuICAgICAgfSkuY2F0Y2goKGVycik9PntcbiAgICAgICAgY29uc29sZS5sb2coJ1Byb2plY3Q6ZWRpdEl0ZW06IEVycm9yIGVuY291bnRlcmVkOiAnK3VybC5wYXRoK2l0ZW0uZG9jSUQpO1xuICAgICAgICBjb25zb2xlLmxvZygnRXJyb3I6JyxlcnIudG9TdHJpbmcoKSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBlZGl0UHJvamVjdD0oKT0+e1xuICAgIC8qIGNsaWNrIGVkaXQgYnV0dG9uIGZvciBwcm9qZWN0LWVkaXQgKi9cbiAgICBjb25zdCBvbnRvbG9neU5vZGUgPSBTdG9yZS5nZXRPbnRvbG9neSgpWyd4MCddO1xuICAgIEFjdGlvbnMuc2hvd0Zvcm0oJ2VkaXQnLCBvbnRvbG9neU5vZGUsIHRoaXMuc3RhdGUucHJvamVjdCk7XG4gIH07XG5cbiAgY2hhbmdlVHJlZT0oaXRlbSxkaXJlY3Rpb24pID0+IHtcbiAgICAvKiBtb3N0IGV2ZW50cyB0aGF0IGNoYW5nZSB0aGUgaGllcmFyY2h5IHRyZWU6IHVwLHByb21vdGUsZGVtb3RlLGRlbGV0ZSxhZGQqL1xuICAgIHZhciB0cmVlRGF0YSA9IHRoaXMuc3RhdGUudHJlZURhdGE7XG4gICAgdmFyIGNoYW5nZWRGbGF0RGF0YSA9IGZhbHNlO1xuICAgIHZhciBmbGF0RGF0YSA9IHRoaXMuZmxhdERhdGEodHJlZURhdGEpO1xuICAgIGlmIChkaXJlY3Rpb249PT0ndXAnKSB7XG4gICAgICBpZiAoaXRlbS5wYXJlbnQpIHtcbiAgICAgICAgY29uc3Qgcm93ID0gZmxhdERhdGEuZmlsdGVyKChub2RlKT0+e3JldHVybiAobm9kZS5pZD09aXRlbS5pZCk7fSlbMF07XG4gICAgICAgIGNvbnN0IGlkeCA9IGZsYXREYXRhLmluZGV4T2Yocm93KTtcbiAgICAgICAgZmxhdERhdGEuc3BsaWNlKGlkeC0xLCAwLCAgcm93KTtcbiAgICAgICAgZGVsZXRlIGZsYXREYXRhW2lkeCsxXTtcbiAgICAgICAgY2hhbmdlZEZsYXREYXRhID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGlkeCA9IHRyZWVEYXRhLmluZGV4T2YoaXRlbSk7XG4gICAgICAgIHRyZWVEYXRhLnNwbGljZShpZHgtMSwgMCwgIGl0ZW0pO1xuICAgICAgICBkZWxldGUgdHJlZURhdGFbaWR4KzFdO1xuICAgICAgICB0cmVlRGF0YSA9IHRyZWVEYXRhLmZpbHRlcigoaXRlbSk9PntyZXR1cm4gaXRlbTt9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGRpcmVjdGlvbj09PSdwcm9tb3RlJykge1xuICAgICAgaXRlbS5wYXJlbnQgPSBmbGF0RGF0YS5maWx0ZXIoKG5vZGUpPT57cmV0dXJuIChub2RlLmlkPT1pdGVtLnBhcmVudCk7fSlbMF1bJ3BhcmVudCddOyAgLy9zZXQgYXMgZ3JhbmRwYXJlbnRcbiAgICAgIGl0ZW0ucGF0aCAgID0gaXRlbS5wYXRoLnNsaWNlKDEpO1xuICAgICAgZmxhdERhdGEgPSBmbGF0RGF0YS5tYXAoKG5vZGUpPT57XG4gICAgICAgIGlmIChub2RlLmlkPT1pdGVtLmlkKSByZXR1cm4gaXRlbTtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICB9KTtcbiAgICAgIGNoYW5nZWRGbGF0RGF0YT10cnVlO1xuICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uPT09J2RlbW90ZScpIHtcbiAgICAgIGl0ZW0ucGFyZW50ID0gdGhpcy5wcmV2aW91c1NpYmxpbmcodHJlZURhdGEsIGl0ZW0uaWQpO1xuICAgICAgY29uc3QgcGFyZW50UGF0aCA9IGZsYXREYXRhLmZpbHRlcigobm9kZSk9PntcbiAgICAgICAgcmV0dXJuIChub2RlLmlkPT09aXRlbS5wYXJlbnQpID8gbm9kZSA6IGZhbHNlO1xuICAgICAgfSlbMF1bJ3BhdGgnXTtcbiAgICAgIGl0ZW0ucGF0aCAgID0gcGFyZW50UGF0aC5jb25jYXQoW2l0ZW0uaWRdKTtcbiAgICAgIGZsYXREYXRhID0gZmxhdERhdGEubWFwKChub2RlKT0+e1xuICAgICAgICBpZiAobm9kZS5pZD09aXRlbS5pZCkgcmV0dXJuIGl0ZW07XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgICAgfSk7XG4gICAgICBjaGFuZ2VkRmxhdERhdGE9dHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGRpcmVjdGlvbj09PSdkZWxldGUnKSB7XG4gICAgICBpdGVtLmRlbGV0ZSA9IHRydWU7XG4gICAgICBmbGF0RGF0YSA9IGZsYXREYXRhLm1hcCgobm9kZSk9PntcbiAgICAgICAgaWYgKG5vZGUuaWQ9PWl0ZW0uaWQpIHJldHVybiBpdGVtO1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgIH0pO1xuICAgICAgY2hhbmdlZEZsYXREYXRhPXRydWU7XG4gICAgfSBlbHNlIGlmIChkaXJlY3Rpb249PT0nbmV3Jykge1xuICAgICAgdmFyIHBhcmVudElEID0gbnVsbDtcbiAgICAgIHZhciBuYW1lID0gKHRoaXMuc3RhdGUubmV3SXRlbT09JycpID8gJy0tTmV3IGl0ZW0tLScgOiB0aGlzLnN0YXRlLm5ld0l0ZW07XG4gICAgICB2YXIgcGF0aCA9IFtdO1xuICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgcGFyZW50SUQ9aXRlbS5pZDtcbiAgICAgICAgbmFtZSAgICA9Jy0tTmV3IGl0ZW0tLSc7XG4gICAgICAgIHBhdGggICAgPSBpdGVtLnBhdGg7XG4gICAgICAgIHZhciBleHBhbmRlZCA9IHRoaXMuc3RhdGUuZXhwYW5kZWQ7XG4gICAgICAgIGV4cGFuZGVkW2l0ZW0uaWRdID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZXhwYW5kZWQ6IGV4cGFuZGVkfSk7fVxuICAgICAgY29uc3QgbmV3SUQgPSAoZmxhdERhdGEubGVuZ3RoKzEpLnRvU3RyaW5nKCk7XG4gICAgICBwYXRoID0gcGF0aC5jb25jYXQoW25ld0lEXSk7XG4gICAgICBmbGF0RGF0YS5wdXNoKHtpZDogbmV3SUQsIHBhcmVudDogcGFyZW50SUQsIGRvY0lEOiAnJywgcGF0aDpwYXRoLCBuYW1lOm5hbWUsIGRlbGV0ZTogZmFsc2V9KTtcbiAgICAgIGNoYW5nZWRGbGF0RGF0YT10cnVlO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7bmV3SXRlbTonJ30pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnRVJST1IgZGlyZWN0aW9uIHVua25vd24nLGRpcmVjdGlvbik7XG4gICAgfVxuICAgIC8vZmluaXNoIGJ5IHVwZGF0aW5nIHRyZWVEYXRhXG4gICAgaWYgKGNoYW5nZWRGbGF0RGF0YSlcbiAgICAgIHRyZWVEYXRhID0gdGhpcy50cmVlRGF0YShmbGF0RGF0YSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7dHJlZURhdGE6dHJlZURhdGEsIHNhdmVIaWVyYXJjaHk6dHJ1ZSB9KTtcbiAgfVxuXG4gIC8qKiBoZWxwZXIgZnVuY3Rpb25zICoqL1xuICBmaXJzdENoaWxkPShicmFuY2gsaWQpPT57XG4gICAgdmFyIHJlc3VsdCA9IGJyYW5jaC5tYXAoKGl0ZW0saWR4KT0+e1xuICAgICAgaWYgKGl0ZW0uaWQ9PWlkICYmIGlkeD09MCkgcmV0dXJuIHRydWU7XG4gICAgICBpZiAoaXRlbS5pZD09aWQgJiYgaWR4PjApICByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAoaXRlbS5jaGlsZHJlbikgICAgICAgICByZXR1cm4gdGhpcy5maXJzdENoaWxkKGl0ZW0uY2hpbGRyZW4saWQpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSk7XG4gICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoaXRlbSk9PntyZXR1cm4gKGl0ZW0hPW51bGwpO30pWzBdO1xuICAgIHJldHVybihyZXN1bHQpO1xuICB9XG4gIHByZXZpb3VzU2libGluZz0oYnJhbmNoLGlkKT0+e1xuICAgIHZhciByZXN1bHQgPSBicmFuY2gubWFwKChpdGVtLGlkeCk9PntcbiAgICAgIGlmIChpdGVtLmlkPT1pZCAmJiBpZHg9PTApIHJldHVybiBudWxsO1xuICAgICAgaWYgKGl0ZW0uaWQ9PWlkICYmIGlkeD4wKSAgcmV0dXJuIGlkeC0xO1xuICAgICAgaWYgKGl0ZW0uY2hpbGRyZW4pICAgICAgICAgcmV0dXJuIHRoaXMucHJldmlvdXNTaWJsaW5nKGl0ZW0uY2hpbGRyZW4saWQpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSk7XG4gICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoaXRlbSk9PntyZXR1cm4gKGl0ZW0hPW51bGwpO30pWzBdO1xuICAgIGlmICh0eXBlb2YgcmVzdWx0PT09J251bWJlcicpXG4gICAgICByZXN1bHQgPSBicmFuY2hbcmVzdWx0XVsnaWQnXTtcbiAgICByZXR1cm4ocmVzdWx0KTtcbiAgfVxuXG5cbiAgLyoqIGNyZWF0ZSBodG1sLXN0cnVjdHVyZTsgYWxsIHNob3VsZCByZXR1cm4gYXQgbGVhc3QgPGRpdj48L2Rpdj4gKiovXG4gIHNob3dXaXRoSW1hZ2UoZG9jSUQpIHtcbiAgICAvKiBpdGVtIGlmIGltYWdlIGlzIHByZXNlbnQgKi9cbiAgICBjb25zdCB7aW1hZ2V9ID0gdGhpcy5zdGF0ZVtkb2NJRF07XG4gICAgY29uc3QgYmFzZTY0ZGF0YSA9IChpbWFnZS5zdWJzdHJpbmcoMCw0KT09PSc8P3htJykgP1xuICAgICAgYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoaW1hZ2UpKSkgOlxuICAgICAgbnVsbDtcbiAgICBjb25zdCBpbWFnZVRhZyA9IChpbWFnZS5zdWJzdHJpbmcoMCw0KT09PSc8P3htJykgP1xuICAgICAgPGltZyBzcmM9eydkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LCcrYmFzZTY0ZGF0YX0gd2lkdGg9JzEwMCUnIGFsdD0nc3ZnLWZvcm1hdCc+PC9pbWc+IDpcbiAgICAgIDxpbWcgc3JjPXtpbWFnZX0gd2lkdGg9JzEwMCUnIGFsdD0nYmFzZTY0LWZvcm1hdCc+PC9pbWc+O1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93Jz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS03Jz5cbiAgICAgICAgICB7dGhpcy5zaG93TWlzYyhkb2NJRCl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTUnPlxuICAgICAgICAgIHtpbWFnZVRhZ31cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgc2hvd1dpdGhDb250ZW50KGRvY0lEKSB7XG4gICAgLyogaXRlbSBpZiBjb250ZW50IGlzIHByZXNlbnQgKi9cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9J3Jvdyc+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wtc20tNic+XG4gICAgICAgICAge3RoaXMuc2hvd01pc2MoZG9jSUQpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS02IGJvcmRlciBwdC0yJz5cbiAgICAgICAgICA8UmVhY3RNYXJrZG93biBzb3VyY2U9e3RoaXMuc3RhdGVbZG9jSURdLmNvbnRlbnR9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIHNob3dXaXRob3V0KGRvY0lEKSB7XG4gICAgLyogZGVmYXVsdCBjYXNlICovXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdyb3cnPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTEyJz5cbiAgICAgICAgICB7dGhpcy5zaG93TWlzYyhkb2NJRCl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIHNob3dNaXNjKGRvY0lEKSB7XG4gICAgLyogbGVmdC1zaWRlIG9mIGluZm9ybWF0aW9uOlxuICAgICAgIFNBTUUgQVMgSU4gRG9jRGV0YWlsOnNob3coKSAqL1xuICAgIGNvbnN0IGRvYyA9IHRoaXMuc3RhdGVbZG9jSURdO1xuICAgIHZhciBsaXN0SXRlbXMgPSBPYmplY3Qua2V5cyhkb2MpLm1hcCggKGl0ZW0saWR4KSA9PiB7XG4gICAgICBpZiAoU3RvcmUuaXRlbVNraXAuaW5kZXhPZihpdGVtKT4tMSB8fCBTdG9yZS5pdGVtREIuaW5kZXhPZihpdGVtKT4tMSB8fCBpdGVtPT09Jy1uYW1lJykge1xuICAgICAgICByZXR1cm4gPGRpdiBrZXk9eydCJytpZHgudG9TdHJpbmcoKX0+PC9kaXY+O1xuICAgICAgfVxuICAgICAgY29uc3QgbGFiZWw9aXRlbS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGl0ZW0uc2xpY2UoMSk7XG4gICAgICB2YXIgdmFsdWU9ZG9jW2l0ZW1dO1xuICAgICAgaWYgKC9eW2Etd3l6XS1bXFx3XFxkXXszMn0kLy50ZXN0KHZhbHVlKSlcbiAgICAgICAgdmFsdWUgPSB0aGlzLnN0YXRlW3ZhbHVlXSA/IHRoaXMuc3RhdGVbdmFsdWVdLm5hbWUgOiAnKiogVW5kZWZpbmVkOiBkb2N1bWVudC10eXBlJztcbiAgICAgIGlmICggKHZhbHVlPT0nJykgfHwgKGl0ZW09PT0nY29tbWVudCcgJiYgZG9jLmNvbW1lbnQuaW5kZXhPZignXFxuJyk+MCkgKSAvL2lmIGNvbW1lbnQgYW5kIFxcbiBpbiBjb21tZW50XG4gICAgICAgIHJldHVybiA8ZGl2IGtleT17J0InK2lkeC50b1N0cmluZygpfT48L2Rpdj47XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpXG4gICAgICAgIHZhbHVlID0gdmFsdWUuam9pbignICcpO1xuICAgICAgcmV0dXJuIDxkaXYga2V5PXsnQicraWR4LnRvU3RyaW5nKCl9PntsYWJlbH06IDxzdHJvbmc+e3ZhbHVlfTwvc3Ryb25nPjwvZGl2PjtcbiAgICB9KTtcbiAgICBpZiggZG9jWyctdHlwZSddWzBdPT0nbWVhc3VyZW1lbnQnICYmICFkb2NbJy1jdXJhdGVkJ10gKVxuICAgICAgbGlzdEl0ZW1zLnB1c2goPGRpdiBrZXk9J2N1cmF0ZV8nIHN0eWxlPXt7Y29sb3I6Y29sb3JXYXJuaW5nfX0+PHN0cm9uZz5DVVJBVEUgITwvc3Ryb25nPjwvZGl2Pik7XG4gICAgaWYgKGRvYy5jb21tZW50ICYmIGRvYy5jb21tZW50IT0nJyAmJiBkb2MuY29tbWVudC5pbmRleE9mKCdcXG4nKT4wIClcbiAgICAgIGxpc3RJdGVtcy5wdXNoKFxuICAgICAgICA8ZGl2IGtleT17J0JfY29tbWVudCd9PkNvbW1lbnQ6XG4gICAgICAgICAgPFRvb2x0aXAgdGl0bGU9XCJFeHBhbmQvQ29udHJhY3RcIj5cbiAgICAgICAgICAgIDxJY29uQnV0dG9uIG9uQ2xpY2s9eygpPT50aGlzLmV4cGFuZChkb2NJRCwgdHJ1ZSl9IGNsYXNzTmFtZT0nbXItNScgc2l6ZT0nc21hbGwnPlxuICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUuZXhwYW5kZWRDb21tZW50W2RvY0lEXSAmJiA8RXhwYW5kTGVzcyAvPn1cbiAgICAgICAgICAgICAgeyF0aGlzLnN0YXRlLmV4cGFuZGVkQ29tbWVudFtkb2NJRF0gJiYgPEV4cGFuZE1vcmUgLz59XG4gICAgICAgICAgICA8L0ljb25CdXR0b24+XG4gICAgICAgICAgPC9Ub29sdGlwPiA8YnIgLz5cbiAgICAgICAgICB7dGhpcy5zdGF0ZS5leHBhbmRlZENvbW1lbnRbZG9jSURdICYmIDxSZWFjdE1hcmtkb3duIHNvdXJjZT17ZG9jLmNvbW1lbnR9IC8+fVxuICAgICAgICA8L2Rpdj4pO1xuICAgIHJldHVybiBsaXN0SXRlbXM7XG4gIH1cblxuXG4gIHNob3dUcmVlKGJyYW5jaCl7XG4gICAgLyogcmVjdXJzaXZlIGZ1bmN0aW9uIHRvIHNob3cgdGhpcyBpdGVtIGFuZCBhbGwgdGhlIHN1Yi1pdGVtcyAqL1xuICAgIGNvbnN0IHRyZWUgPSBicmFuY2gubWFwKChpdGVtLCBpZHgpPT57XG4gICAgICAvL3RoaXMgaXRlbSB0ZXh0LWRvY3VtZW50XG4gICAgICBjb25zdCB0aGlzVGV4dD1pdGVtLmRvY0lELnN1YnN0cmluZygwLDIpPT0neC0nIHx8IGl0ZW0uZG9jSUQ9PScnIHx8IGl0ZW0uZG9jSUQuc3Vic3RyaW5nKDAsNSk9PSd0ZW1wXyc7XG4gICAgICAvL3ByZXZpb3VzIGl0ZW0gaXMgdGV4dC1kb2N1bWVudFxuICAgICAgY29uc3QgcHJldlRleHQ9ICBpZHg9PTA/IGZhbHNlICA6XG4gICAgICAgIGJyYW5jaFtpZHgtMV0uZG9jSUQuc3Vic3RyaW5nKDAsMik9PSd4LSd8fCBicmFuY2hbaWR4LTFdLmRvY0lEPT0nJyB8fFxuICAgICAgICBicmFuY2hbaWR4LTFdLmRvY0lELnN1YnN0cmluZygwLDUpPT0ndGVtcF8nO1xuICAgICAgdmFyIGRvY1R5cGUgICA9IHRoaXMuc3RhdGVbaXRlbS5kb2NJRF0gPyAgdGhpcy5zdGF0ZVtpdGVtLmRvY0lEXVsnLXR5cGUnXS5qb2luKCcvJykgOlxuICAgICAgICAneCcraXRlbS5wYXRoLmxlbmd0aC50b1N0cmluZygpO1xuICAgICAgaWYgKGRvY1R5cGVbMF1bMF09PSd4Jykge1xuICAgICAgICB2YXIgZG9jTGFiZWwgPSBTdG9yZS5nZXREb2NUeXBlTGFiZWxzKClbZG9jVHlwZV07XG4gICAgICAgIGRvY1R5cGUgPSBkb2NMYWJlbCA/IGRvY0xhYmVsLnNsaWNlKDAsZG9jTGFiZWwubGVuZ3RoLTEpLnRvTG93ZXJDYXNlKCkgOiAndW5kZWZpbmVkJztcbiAgICAgIH1cbiAgICAgIHZhciBkYXRlICAgICAgPSh0aGlzLnN0YXRlW2l0ZW0uZG9jSURdICYmIHRoaXMuc3RhdGVbaXRlbS5kb2NJRF1bJy1kYXRlJ10pID9cbiAgICAgICAgbmV3IERhdGUodGhpcy5zdGF0ZVtpdGVtLmRvY0lEXVsnLWRhdGUnXSkgOlxuICAgICAgICBuZXcgRGF0ZShEYXRlLm5vdygpKTtcbiAgICAgIGNvbnN0IG1heEhpZXJhcmNoeURlcHRoID0gT2JqZWN0LmtleXMoU3RvcmUuZ2V0RG9jVHlwZUxhYmVscygpKS5maWx0ZXIoaT0+e3JldHVybiBpWzBdWzBdPT0neCc7fSkubGVuZ3RoO1xuICAgICAgdmFyIGNvbG9yID0gJ2JsYWNrJztcbiAgICAgIGlmICh0aGlzLnN0YXRlW2l0ZW0uZG9jSURdICYmIHRoaXMuc3RhdGVbaXRlbS5kb2NJRF0udGFncykge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZVtpdGVtLmRvY0lEXS50YWdzLmluZGV4T2YoJyNET05FJyk+LTEpIGNvbG9yPSdncmVlbic7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlW2l0ZW0uZG9jSURdLnRhZ3MuaW5kZXhPZignI1RPRE8nKT4tMSkgY29sb3I9J3JlZCc7XG4gICAgICB9XG4gICAgICByZXR1cm4gKFxuICAgICAgICAhaXRlbS5kZWxldGUgJiZcbiAgICAgICAgPGRpdiBrZXk9e2l0ZW0uaWR9PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb250YWluZXIgYm9yZGVyIHBsLTIgcHQtMic+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93IG1sLTAnPlxuICAgICAgICAgICAgICB7LypIRUFEIE9GIERBVEEgKi99XG4gICAgICAgICAgICAgIDxkaXY+PHN0cm9uZz48c3BhbiBzdHlsZT17e2NvbG9yOmNvbG9yfX0+e2l0ZW0ubmFtZX08L3NwYW4+PC9zdHJvbmc+Jm5ic3A7Jm5ic3A7Jm5ic3A7XG4gICAgICAgICAgICAgICAge2RvY1R5cGV9Jm5ic3A7Jm5ic3A7Jm5ic3A7XG4gICAgICAgICAgICAgICAge3RoaXMuc3RhdGUudmVyYm9zZT4xICYmIDxzcGFuPntpdGVtLmRvY0lEfSZuYnNwOyZuYnNwOyZuYnNwOzwvc3Bhbj59XG4gICAgICAgICAgICAgICAgPHN0cm9uZz57ZGF0ZS50b0xvY2FsZVN0cmluZygpfTwvc3Ryb25nPjwvZGl2PlxuICAgICAgICAgICAgICB7LypCVVRUT05TKi99XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdtbC1hdXRvJz5cbiAgICAgICAgICAgICAgICB7aXRlbS5jaGlsZHJlbiAmJiA8VG9vbHRpcCB0aXRsZT1cIkV4cGFuZC9Db250cmFjdFwiPlxuICAgICAgICAgICAgICAgICAgPEljb25CdXR0b24gb25DbGljaz17KCk9PnRoaXMuZXhwYW5kKGl0ZW0uaWQpfSBjbGFzc05hbWU9J21yLTUnIHNpemU9J3NtYWxsJz5cbiAgICAgICAgICAgICAgICAgICAge3RoaXMuc3RhdGUuZXhwYW5kZWRbaXRlbS5pZF0gICYmIDxFeHBhbmRMZXNzIC8+fVxuICAgICAgICAgICAgICAgICAgICB7IXRoaXMuc3RhdGUuZXhwYW5kZWRbaXRlbS5pZF0gJiYgPEV4cGFuZE1vcmUgLz59XG4gICAgICAgICAgICAgICAgICA8L0ljb25CdXR0b24+XG4gICAgICAgICAgICAgICAgPC9Ub29sdGlwPiB9XG4gICAgICAgICAgICAgICAgPFRvb2x0aXAgdGl0bGU9XCJQcm9tb3RlXCI+PHNwYW4+XG4gICAgICAgICAgICAgICAgICA8SWNvbkJ1dHRvbiBvbkNsaWNrPXsoKT0+dGhpcy5jaGFuZ2VUcmVlKGl0ZW0sJ3Byb21vdGUnKX0gY2xhc3NOYW1lPSdtLTAnIHNpemU9J3NtYWxsJ1xuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IShFTEVDVFJPTiAmJiBpdGVtLnBhcmVudCAmJiAocHJldlRleHQgfHwgaWR4PT0wKSApfT5cbiAgICAgICAgICAgICAgICAgICAgPEFycm93QmFjayAvPlxuICAgICAgICAgICAgICAgICAgPC9JY29uQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvc3Bhbj48L1Rvb2x0aXA+XG4gICAgICAgICAgICAgICAgPFRvb2x0aXAgdGl0bGU9XCJNb3ZlIHVwXCI+PHNwYW4+XG4gICAgICAgICAgICAgICAgICA8SWNvbkJ1dHRvbiBvbkNsaWNrPXsoKT0+dGhpcy5jaGFuZ2VUcmVlKGl0ZW0sJ3VwJyl9ICAgICAgY2xhc3NOYW1lPSdtLTAnIHNpemU9J3NtYWxsJ1xuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IShFTEVDVFJPTiAmJiAhdGhpcy5maXJzdENoaWxkKHRoaXMuc3RhdGUudHJlZURhdGEsaXRlbS5pZCkpfT5cbiAgICAgICAgICAgICAgICAgICAgPEFycm93VXB3YXJkIC8+XG4gICAgICAgICAgICAgICAgICA8L0ljb25CdXR0b24+XG4gICAgICAgICAgICAgICAgPC9zcGFuPjwvVG9vbHRpcD5cbiAgICAgICAgICAgICAgICA8VG9vbHRpcCB0aXRsZT1cIkRlbW90ZVwiPjxzcGFuPlxuICAgICAgICAgICAgICAgICAgPEljb25CdXR0b24gb25DbGljaz17KCk9PnRoaXMuY2hhbmdlVHJlZShpdGVtLCdkZW1vdGUnKX0gICAgY2xhc3NOYW1lPSdtLTAnIHNpemU9J3NtYWxsJ1xuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IShFTEVDVFJPTiAmJiAhdGhpcy5maXJzdENoaWxkKHRoaXMuc3RhdGUudHJlZURhdGEsaXRlbS5pZCkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXRoLmxlbmd0aDwobWF4SGllcmFyY2h5RGVwdGgtMSkgJiYgcHJldlRleHQpfT5cbiAgICAgICAgICAgICAgICAgICAgPEFycm93Rm9yd2FyZCAvPlxuICAgICAgICAgICAgICAgICAgPC9JY29uQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvc3Bhbj48L1Rvb2x0aXA+XG4gICAgICAgICAgICAgICAgPFRvb2x0aXAgdGl0bGU9XCJFZGl0XCI+PHNwYW4+XG4gICAgICAgICAgICAgICAgICA8SWNvbkJ1dHRvbiBvbkNsaWNrPXsoKT0+dGhpcy5lZGl0SXRlbShpdGVtKX0gICAgICAgICAgICAgY2xhc3NOYW1lPSdtbC01JyBzaXplPSdzbWFsbCc+XG4gICAgICAgICAgICAgICAgICAgIDxFZGl0IC8+XG4gICAgICAgICAgICAgICAgICA8L0ljb25CdXR0b24+XG4gICAgICAgICAgICAgICAgPC9zcGFuPjwvVG9vbHRpcD5cbiAgICAgICAgICAgICAgICA8VG9vbHRpcCB0aXRsZT1cIkRlbGV0ZVwiPjxzcGFuPlxuICAgICAgICAgICAgICAgICAgPEljb25CdXR0b24gb25DbGljaz17KCk9PnRoaXMuY2hhbmdlVHJlZShpdGVtLCdkZWxldGUnKX0gIGNsYXNzTmFtZT0nbS0wJyBzaXplPSdzbWFsbCdcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFFTEVDVFJPTn0+XG4gICAgICAgICAgICAgICAgICAgIDxEZWxldGUgLz5cbiAgICAgICAgICAgICAgICAgIDwvSWNvbkJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L3NwYW4+PC9Ub29sdGlwPlxuICAgICAgICAgICAgICAgIDxUb29sdGlwIHRpdGxlPVwiQWRkIGNoaWxkXCI+PHNwYW4+XG4gICAgICAgICAgICAgICAgICA8SWNvbkJ1dHRvbiBvbkNsaWNrPXsoKT0+dGhpcy5jaGFuZ2VUcmVlKGl0ZW0sJ25ldycpfSAgICAgY2xhc3NOYW1lPSdtLTAnIHNpemU9J3NtYWxsJ1xuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IShFTEVDVFJPTiAmJiBpdGVtLnBhdGgubGVuZ3RoPChtYXhIaWVyYXJjaHlEZXB0aC0xKSAmJiB0aGlzVGV4dCl9PlxuICAgICAgICAgICAgICAgICAgICA8QWRkIC8+XG4gICAgICAgICAgICAgICAgICA8L0ljb25CdXR0b24+XG4gICAgICAgICAgICAgICAgPC9zcGFuPjwvVG9vbHRpcD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHsvKkJPRFkgT0YgVEhJUyBCUkFOQ0g6IGRlcGVuZGluZyBpZiBpbWFnZS9jb250ZW50IGlzIHByZXNlbnQqL31cbiAgICAgICAgICAgIHt0aGlzLnN0YXRlW2l0ZW0uZG9jSURdICYmIHRoaXMuc3RhdGVbaXRlbS5kb2NJRF0uY29udGVudCAgJiYgdGhpcy5zaG93V2l0aENvbnRlbnQoaXRlbS5kb2NJRCl9XG4gICAgICAgICAgICB7dGhpcy5zdGF0ZVtpdGVtLmRvY0lEXSAmJiB0aGlzLnN0YXRlW2l0ZW0uZG9jSURdLmltYWdlICAgICYmIHRoaXMuc2hvd1dpdGhJbWFnZShpdGVtLmRvY0lEKX1cbiAgICAgICAgICAgIHt0aGlzLnN0YXRlW2l0ZW0uZG9jSURdICYmICF0aGlzLnN0YXRlW2l0ZW0uZG9jSURdLmNvbnRlbnQgJiYgIXRoaXMuc3RhdGVbaXRlbS5kb2NJRF0uaW1hZ2UgJiZcbiAgICAgICAgICAgICAgdGhpcy5zaG93V2l0aG91dChpdGVtLmRvY0lEKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7LypTVUItQlJBTkNIRVMqL31cbiAgICAgICAgICB7dGhpcy5zdGF0ZS5leHBhbmRlZFtpdGVtLmlkXSAmJiBpdGVtLmNoaWxkcmVuICYmXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbWwtNSBtdC0wIG1iLTUnPlxuICAgICAgICAgICAgICB7dGhpcy5zaG93VHJlZShpdGVtLmNoaWxkcmVuKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIH1cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0pO1xuICAgIHJldHVybiB0cmVlO1xuICB9XG5cblxuICAvKiogdGhlIHJlbmRlciBtZXRob2QgKiovXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbCBweC0wJyBzdHlsZT17ey4uLmFyZWFTY3JvbGxZLCBoZWlnaHQ6d2luZG93LmlubmVySGVpZ2h0LTM4fX0+XG4gICAgICAgIHsvKlNVUEVSLUhFQURFUjogZm9yIHByb2plY3QgaGllcmFyY2h5ICAqL31cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J3JvdyBteC0wIHB5LTMnIHN0eWxlPXt7YmFja2dyb3VuZDogY29sb3JCR319PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdweC0yJyBzdHlsZT17ey4uLmgxLCBjb2xvcjpjb2xvclN0cm9uZ319PlxuICAgICAgICAgICAge3RoaXMuc3RhdGUucHJvamVjdFsnLW5hbWUnXX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93IG1sLWF1dG8gbXItMCc+XG4gICAgICAgICAgICB7IEVMRUNUUk9OICYmIDxUb29sdGlwIHRpdGxlPVwiU2F2ZSBQcm9qZWN0IEhpZXJhcmNoeVwiPlxuICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9eygpID0+IHRoaXMucHJlc3NlZEJ1dHRvbignYnRuX3Byb2pfYmVfc2F2ZUhpZXJhcmNoeScpfSBjbGFzc05hbWU9J20tMCdcbiAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshdGhpcy5zdGF0ZS5zYXZlSGllcmFyY2h5fSB2YXJpYW50PVwiY29udGFpbmVkXCJcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt0aGlzLnN0YXRlLnNhdmVIaWVyYXJjaHkgPyBidG5TdHJvbmcgOiBidG5TdHJvbmdEZWFjdGl2ZX0+XG4gICAgICAgICAgICAgICAgICBTYXZlXG4gICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvVG9vbHRpcD59XG4gICAgICAgICAgICB7IEVMRUNUUk9OICYmIDxUb29sdGlwIHRpdGxlPVwiU2NhbiBmb3IgbmV3IG1lYXN1cmVtZW50cywgZXRjLlwiPlxuICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9eygpID0+IHRoaXMucHJlc3NlZEJ1dHRvbignYnRuX3Byb2pfYmVfc2NhbkhpZXJhcmNoeScpfSB2YXJpYW50PVwiY29udGFpbmVkXCJcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXshdGhpcy5zdGF0ZS5zYXZlSGllcmFyY2h5ID8gYnRuU3Ryb25nIDogYnRuU3Ryb25nRGVhY3RpdmV9XG4gICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5zYXZlSGllcmFyY2h5fSBjbGFzc05hbWU9J214LTInID5cbiAgICAgICAgICAgICAgICAgIFNjYW5cbiAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC9Ub29sdGlwPn1cbiAgICAgICAgICAgIDxUb29sdGlwIHRpdGxlPVwiQ2FuY2VsXCI+XG4gICAgICAgICAgICAgIDxCdXR0b24gb25DbGljaz17KCkgPT4gdGhpcy50b2dnbGVUYWJsZSgpfSBjbGFzc05hbWU9J20tMCcgdmFyaWFudD1cImNvbnRhaW5lZFwiIHN0eWxlPXtidG59PlxuICAgICAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgIDwvVG9vbHRpcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgey8qSEVBREVSOiBQcm9qZWN0IGRlc2NyaXB0aW9uIGFuZCBidXR0b25zIG9uIHJpZ2h0Ki99XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdweC0yIHB0LTInPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdtYi0yJz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdyb3cgbXgtMCc+XG4gICAgICAgICAgICAgIHt0aGlzLnN0YXRlLnByb2plY3Qub2JqZWN0aXZlICYmXG4gICAgICAgICAgICAgIDxkaXY+IE9iamVjdGl2ZTogPHN0cm9uZz57dGhpcy5zdGF0ZS5wcm9qZWN0Lm9iamVjdGl2ZX08L3N0cm9uZz4gPC9kaXY+IH1cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3JvdyBtbC1hdXRvIG1yLTAnPlxuICAgICAgICAgICAgICAgIDxUb29sdGlwIHRpdGxlPVwiRWRpdCBQcm9qZWN0IERldGFpbHNcIj5cbiAgICAgICAgICAgICAgICAgIDxJY29uQnV0dG9uIG9uQ2xpY2s9eygpPT50aGlzLmVkaXRQcm9qZWN0KCl9IGNsYXNzTmFtZT0nbXgtMicgc2l6ZT0nc21hbGwnPlxuICAgICAgICAgICAgICAgICAgICA8RWRpdCAvPlxuICAgICAgICAgICAgICAgICAgPC9JY29uQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvVG9vbHRpcD5cbiAgICAgICAgICAgICAgICB7IEVMRUNUUk9OICYmIDxkaXY+XG4gICAgICAgICAgICAgICAgICA8VG9vbHRpcCB0aXRsZT1cIkRFTEVURSBQcm9qZWN0IEhpZXJhcmNoeVwiPlxuICAgICAgICAgICAgICAgICAgICA8SWNvbkJ1dHRvbiBvbkNsaWNrPXsoKSA9PiB0aGlzLnRvZ2dsZURlbGV0ZU1vZGFsKCl9XG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdtLTAnIHNpemU9J3NtYWxsJz5cbiAgICAgICAgICAgICAgICAgICAgICA8RGVsZXRlLz5cbiAgICAgICAgICAgICAgICAgICAgPC9JY29uQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPC9Ub29sdGlwPlxuICAgICAgICAgICAgICAgICAgPE1vZGFsU2ltcGxlIHRpdGxlPSdXYXJuaW5nJyBjb2xvcj0nI0ZGMDAwMCdcbiAgICAgICAgICAgICAgICAgICAgdGV4dD0nUmVhbGx5IHJlbW92ZSBlbnRpcmUgcHJvamVjdCBoaWVyYXJjaHkgaW4gZGF0YWJhc2U/IFJlbW92ZSBvbiBoYXJkZGlzayBtYW51YWxseS4nXG4gICAgICAgICAgICAgICAgICAgIG9uWWVzPXsoKT0+e3RoaXMucHJlc3NlZEJ1dHRvbignYnRuX3Byb2pfZmVfZGVsZXRlSGllcmFyY2h5Jyk7fX1cbiAgICAgICAgICAgICAgICAgICAgc2hvdz17dGhpcy5zdGF0ZS5zaG93RGVsZXRlTW9kYWx9IGNhbGxiYWNrPXt0aGlzLnRvZ2dsZURlbGV0ZU1vZGFsfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj4gfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIHt0aGlzLnN0YXRlLnByb2plY3Quc3RhdHVzICYmXG4gICAgICAgICAgICAgICAgICA8c3Bhbj5TdGF0dXM6IDxzdHJvbmc+e3RoaXMuc3RhdGUucHJvamVjdC5zdGF0dXN9PC9zdHJvbmc+Jm5ic3A7Jm5ic3A7Jm5ic3A7PC9zcGFuPn1cbiAgICAgICAgICAgICAge3RoaXMuc3RhdGUucHJvamVjdC50YWdzLmxlbmd0aD4wICYmXG4gICAgICAgICAgICAgICAgICA8c3Bhbj5UYWdzOiA8c3Ryb25nPnt0aGlzLnN0YXRlLnByb2plY3QudGFnc308L3N0cm9uZz48L3NwYW4+fVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB7dGhpcy5zdGF0ZS5wcm9qZWN0LmNvbW1lbnQgJiYgdGhpcy5zdGF0ZS5wcm9qZWN0LmNvbW1lbnQubGVuZ3RoPjAgJiZcbiAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5wcm9qZWN0LmNvbW1lbnQuaW5kZXhPZignXFxuJyk9PS0xICYmIHRoaXMuc3RhdGUucHJvamVjdC5jb21tZW50fVxuICAgICAgICAgICAge3RoaXMuc3RhdGUucHJvamVjdC5jb21tZW50ICYmIHRoaXMuc3RhdGUucHJvamVjdC5jb21tZW50Lmxlbmd0aD4wICYmXG4gICAgICAgICAgICAgIHRoaXMuc3RhdGUucHJvamVjdC5jb21tZW50LmluZGV4T2YoJ1xcbicpPjAgJiZcbiAgICAgICAgICAgICAgPFJlYWN0TWFya2Rvd24gc291cmNlPXt0aGlzLnN0YXRlLnByb2plY3QuY29tbWVudH0vPn1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7LypCT0RZOiBIaWVyYXJjaGljYWwgdHJlZTogc2hvdyB0cmVlKi99XG4gICAgICAgICAge3RoaXMuc3RhdGUudHJlZURhdGEubGVuZ3RoPjAgJiZcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93Jz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdtbC1hdXRvJyBzdHlsZT17e21hcmdpblJpZ2h0OjE0MH19PlxuICAgICAgICAgICAgICBtb3ZlIGluIGhpZXJhcmNoeVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+fVxuICAgICAgICAgIHt0aGlzLnNob3dUcmVlKHRoaXMuc3RhdGUudHJlZURhdGEpfVxuICAgICAgICAgIHsvKkZPT1RFUjogc2hvdyBhZGQgaXRlbSBhbmQgdGhlIE1vZGFsRm9ybSB0byBlZGl0IGRvY3VtZW50cyovfVxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8SW5wdXQgdmFsdWU9e3RoaXMuc3RhdGUubmV3SXRlbX0gb25DaGFuZ2U9e3RoaXMuaW5wdXRDaGFuZ2V9IGNsYXNzTmFtZT0ncGwtMidcbiAgICAgICAgICAgICAgb25LZXlEb3duPXtlID0+IChlLmtleT09PSdFbnRlcicpICYmICh0aGlzLmNoYW5nZVRyZWUobnVsbCwnbmV3JykpfSAvPlxuICAgICAgICAgICAgPFRvb2x0aXAgdGl0bGU9XCJBZGQgbmV3IGl0ZW1cIj5cbiAgICAgICAgICAgICAgPEljb25CdXR0b24gb25DbGljaz17KCkgPT4gdGhpcy5jaGFuZ2VUcmVlKG51bGwsJ25ldycpfSB2YXJpYW50PVwiY29udGFpbmVkXCIgY2xhc3NOYW1lPSdtLTIgcHQtMic+XG4gICAgICAgICAgICAgICAgPEFkZENpcmNsZSBmb250U2l6ZT0nbGFyZ2UnLz5cbiAgICAgICAgICAgICAgPC9JY29uQnV0dG9uPlxuICAgICAgICAgICAgPC9Ub29sdGlwPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPE1vZGFsRm9ybSAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuIl0sImZpbGUiOiJyZW5kZXJlci9jb21wb25lbnRzL1Byb2plY3QuanMifQ==
