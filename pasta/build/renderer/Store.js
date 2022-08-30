"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = require("events");

var _axios = _interopRequireDefault(require("axios"));

var _Dispatcher = _interopRequireDefault(require("./Dispatcher"));

var _commonTools = require("./commonTools");

var _localInteraction = require("./localInteraction");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* Central storage class for documents and tables
 - all REST request are handled here
 - all data cleaning is handled here
 - none of the variables are directly accessed from other components
 - this is a normal js-code (not React-Component): no this.setState, etc.

 - Note: axios('localhost:8888') does not work, since different port
   in package.json add proxy and then just specify the end of the requesting string here
   https://create-react-app.dev/docs/proxying-api-requests-in-development/
*/
class StateStore extends _events.EventEmitter {
  //Initialize
  constructor() {
    super();
    this.callback = this.callback.bind(this); // configuration

    this.url = null;
    this.credentials = null;
    this.ontology = null;
    this.dictLabels = {};
    this.config = null; // document and table items

    this.docType = null; //straight doctype: e.g. project
    // document items

    this.docRaw = {};
    this.hierarchy = null; //hierarchy of this document
    // table items

    this.table = null; //table data

    this.ontologyNode = null; //ontology node: column information, long description, unit,...

    this.docsLists = {}; //items show in docDetails under database; remainder in details

    this.itemDB = ['_id', '_rev', '-user', '-type', 'shasum', 'nextRevision', '-client', '-curated', '-branch', '-date']; //items not shown because they are no strings, or long (content)

    this.itemSkip = ['metaUser', 'metaVendor', 'image', 'content', '_attachments', '-attachment'];
  }

  initStore() {
    /**
     * Function that is called first from App.js
     * get configuration and ontology
     * use ontology to create list of docTypes
     */
    const res = (0, _localInteraction.getCredentials)();
    if (!res || !res['configuration']) return;
    this.credentials = res['credentials'];
    this.config = res['configuration'];
    if (this.credentials === null || this.credentials.database === '' || this.credentials.user === '' || this.credentials.password === '') //if credentials not set
      return;
    this.url = _axios.default.create({
      baseURL: this.credentials.url,
      auth: {
        username: this.credentials.user.trim(),
        password: this.credentials.password.trim()
      }
    }); //get table header from ontology, which is stored in database

    var thePath = '/' + this.credentials.database + '/-ontology-';
    this.url.get(thePath).then(res => {
      this.ontology = res.data;
      const objLabel = (0, _commonTools.ontology2Labels)(this.ontology, this.config['tableFormat']);
      this.dictLabels = Object.assign({}, objLabel.hierarchyDict, objLabel.dataDict);
      Object.keys(this.dictLabels).map(item => {
        //prefill tables of projects, samples, ...
        if (item[0] != 'x' || item == 'x0') // prefill all including sub-doctypes but excluding tasks
          this.readTable(item, false);
      });
      this.emit('initStore');
      this.emit('changeCOMState', 'ok');
      console.log('success reading first entry (ontology) from database.');
    }).catch(error => {
      //if ontology error remains: no ontology, then create empty ontology in database here
      console.log('Error encountered during ontology reading. ' + thePath);
      this.emit('changeCOMState', 'fail');
      throw error;
    });
  }

  getURL() {
    /**
      send http client object (axios) to other classes
     */
    if (!this.credentials) return {};
    return {
      url: this.url,
      path: '/' + this.credentials.database + '/'
    };
  } // ** Retrieve data from document server: internal functions ** //
  // ** names according to CURD: Create,Update,Read,Delete ** //


  readTable(docType, setThis = true, resetDoc = false) {
    /**
     * get table content for this doctype
     * initialize ontologyNode (labeling of columns, ...)
     *
     * Args:
     *   docType: document type: i.e. 'x0' = project
     *   setThis: store this docType as this.property
     *   resetDoc: reset document to null
     */
    if (!docType) docType = this.docType;
    if (setThis) this.docType = docType;
    if (resetDoc) this.docRaw = {};
    if (this.ontology === null) return;
    this.emit('changeCOMState', 'busy');
    this.ontologyNode = this.ontology[docType];
    const viewName = docType.substring(0, 2) == 'x/' ? docType.substring(2).replace('/', '__') : docType.replace('/', '__');
    const thePath = '/' + this.credentials.database + '/_design/viewDocType/_view/' + viewName;
    this.url.get(thePath).then(res => {
      this.table = res.data.rows;
      const idxName = this.ontology[docType].map(i => {
        return i.name == '-name';
      }).indexOf(true);

      if (idxName > -1) {
        this.docsLists[docType] = this.table.map(i => {
          return {
            name: i.value[idxName],
            id: i.id
          };
        });
      } else {
        console.log('Error: "-name" not in ontology of doctype |' + docType + '| likely data not ready');
      }

      if (setThis) {
        this.emit('changeTable');
        this.emit('changeCOMState', 'ok');
      }
    }).catch(() => {
      console.log('Error: view does not exist or error in processing. ' + thePath + '\n Repaired during health test');
      this.table = [{
        valid: false
      }];
      this.emit('changeTable');
      this.emit('changeCOMState', 'fail'); // don't key "throw(error);" as it would not stop the error
    });
    return;
  }

  readDocument(id) {
    /**
     * Get document from database
     *
     * Args:
     *   id: document id
     */
    if (!id) {
      this.emit('changeCOMState', 'ok');
      return;
    }

    this.emit('changeCOMState', 'busy');
    const thePath = '/' + this.credentials.database + '/' + id;
    this.url.get(thePath).then(res => {
      this.docRaw = JSON.parse(JSON.stringify(res.data));
      this.emit('changeDoc');
      this.emit('changeCOMState', 'ok');
    }).catch(error => {
      console.log('readDocument - Error 1: ' + thePath);
      this.emit('changeCOMState', 'fail');
      throw error;
    }); // if project: also get hierarchy for plotting

    if (this.docType === 'x0') {
      this.emit('changeCOMState', 'busy');
      const thePath = '/' + this.credentials.database + '/_design/viewHierarchy/_view/viewHierarchy?startkey="' + id + '"&endkey="' + id + 'zzz"';
      this.url.get(thePath).then(res => {
        var nativeView = {};
        res.data.rows.map(item => {
          nativeView[item.id] = [item.key].concat(item.value);
        });
        const outString = (0, _commonTools.hierarchy2String)(nativeView, true, null, 'none', null);
        this.hierarchy = outString.trim();
        this.emit('changeDoc');
        this.emit('changeCOMState', 'ok');
      }).catch(error => {
        console.log('readDocument: Error encountered 2: ' + thePath);
        this.emit('changeCOMState', 'fail');
        throw error;
      });
    }

    return;
  }

  updateDocument(newDoc, normalDoc = true, oldDoc = null) {
    /**
     * Update document on database
     *
     * Args:
     *   newDoc: new document
     *   normalDoc: all documents are normal with the exception of ontology
     */
    this.emit('changeCOMState', 'busy');
    var docRaw = Object.assign({}, this.docRaw);
    if (oldDoc) //edit came from project: e.g. edit step
      docRaw = oldDoc;

    if (normalDoc) {
      //everything but ontology
      Object.assign(docRaw, newDoc);
      docRaw = (0, _commonTools.fillDocBeforeCreate)(docRaw, this.docType);
      docRaw['-curated'] = true;
      docRaw['-user'] = this.config['-userID'];
      docRaw['-client'] = 'js updateDocument';
    } else {
      //ontology
      docRaw = Object.assign({}, newDoc);
    }

    const thePath = '/' + this.credentials.database + '/' + docRaw._id + '/';
    this.url.put(thePath, docRaw).then(res => {
      //res = response
      console.log('Update successful with ...');

      if (normalDoc) {
        this.docRaw['_rev'] = res.data.rev;
        this.readTable(this.docType);
      } else {
        this.initStore(this.docType);
      }

      this.emit('changeDoc');
      this.emit('changeCOMState', 'ok');
    }).catch(error => {
      const text = 'updateDocument- Error: ' + thePath + '  rev:' + docRaw['_rev'] + ' | Reload to fix most likely';
      console.log(text);
      throw error;
    });
    return;
  }

  addAttachment(comment, choice, flag, attachmentName) {
    /** Add attachment to document */
    var listAttachments = [];

    if ('-attachment' in this.docRaw) {
      if (attachmentName in this.docRaw['-attachment']) listAttachments = this.docRaw['-attachment'][attachmentName];
    } else {
      this.docRaw['-attachment'] = {};
    }

    var now = new Date().toJSON();
    now = now.slice(0, now.length - 1);
    listAttachments.push({
      date: now,
      remark: comment,
      docID: choice,
      flag: flag,
      user: this.config['userID']
    });
    this.docRaw['-attachment'][attachmentName] = listAttachments;
    const thePath = '/' + this.credentials.database + '/' + this.docRaw._id + '/';
    this.url.put(thePath, this.docRaw).then(res => {
      //res = response
      console.log('Add attachment successful');
      this.docRaw['_rev'] = res.data.rev;
      this.emit('changeCOMState', 'ok');
    }).catch(error => {
      console.log('addAttachment: Error encountered: ' + thePath);
      throw error;
    });
    return;
  }

  createDocument(doc) {
    /** Create document on database directly or call external command pastaDB.py */
    this.emit('changeCOMState', 'busy');
    doc = Object.fromEntries(Object.entries(doc).filter(([, value]) => {
      return value != '';
    })); //filter entries which are filled

    if (!doc.comment) doc['comment'] = '';

    if (doc._project) {
      doc['-branch'] = [{
        child: 9999,
        path: null,
        stack: [doc._project]
      }];
      delete doc['_project'];
    }

    if ((this.docType == 'x0' || doc['-name'].indexOf('/') > 0) && !doc['-type']) {
      //create via backend
      //  this is the safe path that should always work but is slower
      //  use this for projects and everything that has a '/' in the name, indicating it is a path
      console.log('create doc via backend', doc);
      const projDoc = {
        id: 'none'
      };
      (0, _localInteraction.executeCmd)('_store_be_createDoc', this.callback, projDoc.id, Object.assign(doc, {
        docType: this.docType
      }));
    } else {
      //create directly
      console.log('create doc directly', doc);
      doc['-user'] = this.config['-userID'];
      doc['-client'] = 'js createDocument ' + JSON.stringify(doc);
      this.ontologyNode.map(i => {
        return i.name;
      }).filter(i => {
        return i && i.indexOf('/') > 0;
      }).map(i => {
        doc[i.split('/')[0]] = {};
      });
      var docType = doc['-type'] ? doc['-type'][0] : this.docType;
      doc = (0, _commonTools.fillDocBeforeCreate)(doc, docType);
      const thePath = '/' + this.credentials.database + '/';
      this.url.post(thePath, doc).then(() => {
        console.log('Creation successful with ...');
        console.log(doc);
        this.readTable(this.docType);
      }).catch(error => {
        console.log('createDocument: Error encountered 2: ' + thePath);
        throw error;
      });
      this.emit('changeCOMState', 'ok');
    }

    return;
  }

  deleteDoc(docID, docRev) {
    /** Temporary function to allow test-usage: remove documents */
    if (!docID) {
      docID = this.docRaw._id;
      docRev = this.docRaw._rev;
    }

    const thePath = '/' + this.credentials.database + '/' + docID + '/?rev=' + docRev;
    this.url.delete(thePath).then(() => {
      console.log('Delete success!');
      this.readTable(this.docType);
    }).catch(error => {
      console.log(error);
    });
  }

  callback(content) {
    /** Callback function for backend pastaDB.py: re-read new data from database */
    if (content.indexOf('SUCCESS') > -1) {
      this.readTable(this.docType);
    }
  } //===================================================================
  //send information to other components


  getTable(docType) {
    /** Table of documents */
    if (!this.table || docType != this.docType) this.readTable(docType, true);
    return this.table;
  }

  getDocumentRaw() {
    /** One document */
    return this.docRaw;
  }

  getHierarchy() {
    /** Hierarchy in project, if doc is a project */
    return this.hierarchy;
  }

  getCredentials() {
    /** User credentials, server, database on server */
    return this.credentials;
  }

  getConfiguration() {
    /** Configuration: table format */
    return this.config;
  }

  getOntology() {
    /** Entire ontology */
    if (this.ontology === null || !('_id' in this.ontology)) return {};else return Object.assign({}, this.ontology); //return copy, not original
  }

  getOntologyNode(docType = null) {
    /** get ontology of doctype: long description, required,... */
    if (docType) {
      var ontNode = null;
      if (typeof docType === 'string' || docType instanceof String) docType = docType.split('/');

      for (var i = 0; i < docType.length; i++) {
        if (docType.slice(0, i + 1).join('/') in this.ontology) ontNode = docType.slice(0, i + 1).join('/');
      }

      if (ontNode) return this.ontology[ontNode];
      return this.ontology[docType];
    }

    if (this.docRaw['-type'] && this.docRaw['-type'].join('/') in this.ontology) return this.ontology[this.docRaw['-type'].join('/')];
    return this.ontologyNode;
  }

  getDocTypeLabels() {
    /** Pairs of docType,docLabel*/
    return this.dictLabels;
  }

  getDocType() {
    /** Get doctype */
    if (this.docRaw['-type'] && this.docRaw['-type'].join('/') in this.ontology) return this.docRaw['-type'].join('/');
    return this.docType;
  }

  getDocsList(docType) {
    /** docIDs of docType: e.g. all the docIds of projects, .. */
    if (this.docsLists[docType]) return this.docsLists[docType];
    return null;
  }

  getSubtypes(docType) {
    /** given a doctype... return all those that are children */
    if (!this.ontology) return null;
    const filtered = Object.keys(this.ontology).filter(i => {
      return i.indexOf(docType) == 0;
    });
    return filtered;
  }

  getExtractors() {
    /** return list of all extractors for measurements */
    if (!this.config['extractors']) return [];
    const docTypeString = this.docRaw['-type'].slice(0, 3).join('/'); //first three items determine docType

    const filtered = Object.keys(this.config['extractors']).filter(key => key.indexOf(docTypeString) == 0).reduce((obj, key) => {
      obj[key] = this.config['extractors'][key];
      return obj;
    }, {});
    return filtered;
  }

  getGUIConfig(key) {
    /** return image size */
    if (this.config && this.config['GUI'] && this.config['GUI'][key]) return this.config['GUI'][key]; //defaults

    if (key == 'imageSize') return '100%';
    if (key == 'maxTabColumns') return 20;
    if (key == 'verbose') return 1; //0: no output/never used; 1: default; 2: more
  } //===================================================================
  //connect actions to retrieve functions
  //names according to CURD: Create,Update,Read,Delete


  handleActions(action) {
    switch (action.type) {
      case 'READ_TABLE':
        {
          this.readTable(action.docType, action.setThis, action.resetDoc);
          break;
        }

      case 'READ_DOC':
        {
          this.readDocument(action.id);
          break;
        }

      case 'UPDATE_DOC':
        {
          this.updateDocument(action.doc, true, action.oldDoc);
          break;
        }

      case 'CREATE_DOC':
        {
          this.createDocument(action.doc);
          break;
        }

      case 'UPDATE_EXTRACTORS':
        {
          const res = (0, _localInteraction.getCredentials)();
          this.config['extractors'] = res['configuration'] ? res['configuration']['extractors'] : [];
          break;
        }

      default:
        {
          break;
        }
    }
  }

}

const store = new StateStore();

_Dispatcher.default.register(store.handleActions.bind(store));

var _default = store;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlcmVyL1N0b3JlLmpzIl0sIm5hbWVzIjpbIlN0YXRlU3RvcmUiLCJFdmVudEVtaXR0ZXIiLCJjb25zdHJ1Y3RvciIsImNhbGxiYWNrIiwiYmluZCIsInVybCIsImNyZWRlbnRpYWxzIiwib250b2xvZ3kiLCJkaWN0TGFiZWxzIiwiY29uZmlnIiwiZG9jVHlwZSIsImRvY1JhdyIsImhpZXJhcmNoeSIsInRhYmxlIiwib250b2xvZ3lOb2RlIiwiZG9jc0xpc3RzIiwiaXRlbURCIiwiaXRlbVNraXAiLCJpbml0U3RvcmUiLCJyZXMiLCJkYXRhYmFzZSIsInVzZXIiLCJwYXNzd29yZCIsImF4aW9zIiwiY3JlYXRlIiwiYmFzZVVSTCIsImF1dGgiLCJ1c2VybmFtZSIsInRyaW0iLCJ0aGVQYXRoIiwiZ2V0IiwidGhlbiIsImRhdGEiLCJvYmpMYWJlbCIsIk9iamVjdCIsImFzc2lnbiIsImhpZXJhcmNoeURpY3QiLCJkYXRhRGljdCIsImtleXMiLCJtYXAiLCJpdGVtIiwicmVhZFRhYmxlIiwiZW1pdCIsImNvbnNvbGUiLCJsb2ciLCJjYXRjaCIsImVycm9yIiwiZ2V0VVJMIiwicGF0aCIsInNldFRoaXMiLCJyZXNldERvYyIsInZpZXdOYW1lIiwic3Vic3RyaW5nIiwicmVwbGFjZSIsInJvd3MiLCJpZHhOYW1lIiwiaSIsIm5hbWUiLCJpbmRleE9mIiwidmFsdWUiLCJpZCIsInZhbGlkIiwicmVhZERvY3VtZW50IiwiSlNPTiIsInBhcnNlIiwic3RyaW5naWZ5IiwibmF0aXZlVmlldyIsImtleSIsImNvbmNhdCIsIm91dFN0cmluZyIsInVwZGF0ZURvY3VtZW50IiwibmV3RG9jIiwibm9ybWFsRG9jIiwib2xkRG9jIiwiX2lkIiwicHV0IiwicmV2IiwidGV4dCIsImFkZEF0dGFjaG1lbnQiLCJjb21tZW50IiwiY2hvaWNlIiwiZmxhZyIsImF0dGFjaG1lbnROYW1lIiwibGlzdEF0dGFjaG1lbnRzIiwibm93IiwiRGF0ZSIsInRvSlNPTiIsInNsaWNlIiwibGVuZ3RoIiwicHVzaCIsImRhdGUiLCJyZW1hcmsiLCJkb2NJRCIsImNyZWF0ZURvY3VtZW50IiwiZG9jIiwiZnJvbUVudHJpZXMiLCJlbnRyaWVzIiwiZmlsdGVyIiwiX3Byb2plY3QiLCJjaGlsZCIsInN0YWNrIiwicHJvakRvYyIsInNwbGl0IiwicG9zdCIsImRlbGV0ZURvYyIsImRvY1JldiIsIl9yZXYiLCJkZWxldGUiLCJjb250ZW50IiwiZ2V0VGFibGUiLCJnZXREb2N1bWVudFJhdyIsImdldEhpZXJhcmNoeSIsImdldENyZWRlbnRpYWxzIiwiZ2V0Q29uZmlndXJhdGlvbiIsImdldE9udG9sb2d5IiwiZ2V0T250b2xvZ3lOb2RlIiwib250Tm9kZSIsIlN0cmluZyIsImpvaW4iLCJnZXREb2NUeXBlTGFiZWxzIiwiZ2V0RG9jVHlwZSIsImdldERvY3NMaXN0IiwiZ2V0U3VidHlwZXMiLCJmaWx0ZXJlZCIsImdldEV4dHJhY3RvcnMiLCJkb2NUeXBlU3RyaW5nIiwicmVkdWNlIiwib2JqIiwiZ2V0R1VJQ29uZmlnIiwiaGFuZGxlQWN0aW9ucyIsImFjdGlvbiIsInR5cGUiLCJzdG9yZSIsImRpc3BhdGNoZXIiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQVVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFPQSxNQUFNQSxVQUFOLFNBQXlCQyxvQkFBekIsQ0FBc0M7QUFDcEM7QUFDQUMsRUFBQUEsV0FBVyxHQUFHO0FBQ1o7QUFDQSxTQUFLQyxRQUFMLEdBQW9CLEtBQUtBLFFBQUwsQ0FBY0MsSUFBZCxDQUFtQixJQUFuQixDQUFwQixDQUZZLENBR1o7O0FBQ0EsU0FBS0MsR0FBTCxHQUFpQixJQUFqQjtBQUNBLFNBQUtDLFdBQUwsR0FBbUIsSUFBbkI7QUFDQSxTQUFLQyxRQUFMLEdBQWdCLElBQWhCO0FBQ0EsU0FBS0MsVUFBTCxHQUFrQixFQUFsQjtBQUNBLFNBQUtDLE1BQUws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ZDs7QUFDQXFJLG9CQUFXQyxRQUFYLENBQW9CRixLQUFLLENBQUNILGFBQU4sQ0FBb0I3SCxJQUFwQixDQUF5QmdJLEtBQXpCLENBQXBCOztlQUNlQSxLIiwic291cmNlc0NvbnRlbnQiOlsiLyogQ2VudHJhbCBzdG9yYWdlIGNsYXNzIGZvciBkb2N1bWVudHMgYW5kIHRhYmxlc1xuIC0gYWxsIFJFU1QgcmVxdWVzdCBhcmUgaGFuZGxlZCBoZXJlXG4gLSBhbGwgZGF0YSBjbGVhbmluZyBpcyBoYW5kbGVkIGhlcmVcbiAtIG5vbmUgb2YgdGhlIHZhcmlhYmxlcyBhcmUgZGlyZWN0bHkgYWNjZXNzZWQgZnJvbSBvdGhlciBjb21wb25lbnRzXG4gLSB0aGlzIGlzIGEgbm9ybWFsIGpzLWNvZGUgKG5vdCBSZWFjdC1Db21wb25lbnQpOiBubyB0aGlzLnNldFN0YXRlLCBldGMuXG5cbiAtIE5vdGU6IGF4aW9zKCdsb2NhbGhvc3Q6ODg4OCcpIGRvZXMgbm90IHdvcmssIHNpbmNlIGRpZmZlcmVudCBwb3J0XG4gICBpbiBwYWNrYWdlLmpzb24gYWRkIHByb3h5IGFuZCB0aGVuIGp1c3Qgc3BlY2lmeSB0aGUgZW5kIG9mIHRoZSByZXF1ZXN0aW5nIHN0cmluZyBoZXJlXG4gICBodHRwczovL2NyZWF0ZS1yZWFjdC1hcHAuZGV2L2RvY3MvcHJveHlpbmctYXBpLXJlcXVlc3RzLWluLWRldmVsb3BtZW50L1xuKi9cbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi9EaXNwYXRjaGVyJztcbmltcG9ydCB7ZmlsbERvY0JlZm9yZUNyZWF0ZSwgb250b2xvZ3kyTGFiZWxzLCBoaWVyYXJjaHkyU3RyaW5nfSBmcm9tICcuL2NvbW1vblRvb2xzJztcbmltcG9ydCB7Z2V0Q3JlZGVudGlhbHMsIGV4ZWN1dGVDbWR9IGZyb20gJy4vbG9jYWxJbnRlcmFjdGlvbic7XG5cbmNsYXNzIFN0YXRlU3RvcmUgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICAvL0luaXRpYWxpemVcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmNhbGxiYWNrICAgICA9IHRoaXMuY2FsbGJhY2suYmluZCh0aGlzKTtcbiAgICAvLyBjb25maWd1cmF0aW9uXG4gICAgdGhpcy51cmwgICAgICAgPSBudWxsO1xuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBudWxsO1xuICAgIHRoaXMub250b2xvZ3kgPSBudWxsO1xuICAgIHRoaXMuZGljdExhYmVscyA9IHt9O1xuICAgIHRoaXMuY29uZmlnID0gbnVsbDtcbiAgICAvLyBkb2N1bWVudCBhbmQgdGFibGUgaXRlbXNcbiAgICB0aGlzLmRvY1R5cGUgPSBudWxsOyAgICAvL3N0cmFpZ2h0IGRvY3R5cGU6IGUuZy4gcHJvamVjdFxuICAgIC8vIGRvY3VtZW50IGl0ZW1zXG4gICAgdGhpcy5kb2NSYXcgID0ge307XG4gICAgdGhpcy5oaWVyYXJjaHkgPSBudWxsOyAgLy9oaWVyYXJjaHkgb2YgdGhpcyBkb2N1bWVudFxuICAgIC8vIHRhYmxlIGl0ZW1zXG4gICAgdGhpcy50YWJsZSA9IG51bGw7ICAgICAgLy90YWJsZSBkYXRhXG4gICAgdGhpcy5vbnRvbG9neU5vZGUgPSBudWxsOyAgLy9vbnRvbG9neSBub2RlOiBjb2x1bW4gaW5mb3JtYXRpb24sIGxvbmcgZGVzY3JpcHRpb24sIHVuaXQsLi4uXG4gICAgdGhpcy5kb2NzTGlzdHMgPSB7fTtcbiAgICAvL2l0ZW1zIHNob3cgaW4gZG9jRGV0YWlscyB1bmRlciBkYXRhYmFzZTsgcmVtYWluZGVyIGluIGRldGFpbHNcbiAgICB0aGlzLml0ZW1EQiA9IFsnX2lkJywnX3JldicsJy11c2VyJywnLXR5cGUnLCdzaGFzdW0nLCduZXh0UmV2aXNpb24nLCctY2xpZW50JywnLWN1cmF0ZWQnLFxuICAgICAgJy1icmFuY2gnLCctZGF0ZSddO1xuICAgIC8vaXRlbXMgbm90IHNob3duIGJlY2F1c2UgdGhleSBhcmUgbm8gc3RyaW5ncywgb3IgbG9uZyAoY29udGVudClcbiAgICB0aGlzLml0ZW1Ta2lwID0gWydtZXRhVXNlcicsJ21ldGFWZW5kb3InLCdpbWFnZScsJ2NvbnRlbnQnLCdfYXR0YWNobWVudHMnLCctYXR0YWNobWVudCddO1xuICB9XG5cbiAgaW5pdFN0b3JlKCkge1xuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIGZpcnN0IGZyb20gQXBwLmpzXG4gICAgICogZ2V0IGNvbmZpZ3VyYXRpb24gYW5kIG9udG9sb2d5XG4gICAgICogdXNlIG9udG9sb2d5IHRvIGNyZWF0ZSBsaXN0IG9mIGRvY1R5cGVzXG4gICAgICovXG4gICAgY29uc3QgcmVzID0gZ2V0Q3JlZGVudGlhbHMoKTtcbiAgICBpZiAoIXJlcyB8fCAhcmVzWydjb25maWd1cmF0aW9uJ10pXG4gICAgICByZXR1cm47XG4gICAgdGhpcy5jcmVkZW50aWFscyAgICAgPSByZXNbJ2NyZWRlbnRpYWxzJ107XG4gICAgdGhpcy5jb25maWcgPSByZXNbJ2NvbmZpZ3VyYXRpb24nXTtcbiAgICBpZiAodGhpcy5jcmVkZW50aWFscz09PW51bGwgfHwgdGhpcy5jcmVkZW50aWFscy5kYXRhYmFzZT09PScnIHx8XG4gICAgICAgIHRoaXMuY3JlZGVudGlhbHMudXNlcj09PScnfHwgdGhpcy5jcmVkZW50aWFscy5wYXNzd29yZD09PScnKSAvL2lmIGNyZWRlbnRpYWxzIG5vdCBzZXRcbiAgICAgIHJldHVybjtcbiAgICB0aGlzLnVybCA9IGF4aW9zLmNyZWF0ZSh7XG4gICAgICBiYXNlVVJMOiB0aGlzLmNyZWRlbnRpYWxzLnVybCxcbiAgICAgIGF1dGg6IHt1c2VybmFtZTogdGhpcy5jcmVkZW50aWFscy51c2VyLnRyaW0oKSwgcGFzc3dvcmQ6IHRoaXMuY3JlZGVudGlhbHMucGFzc3dvcmQudHJpbSgpfVxuICAgIH0pO1xuICAgIC8vZ2V0IHRhYmxlIGhlYWRlciBmcm9tIG9udG9sb2d5LCB3aGljaCBpcyBzdG9yZWQgaW4gZGF0YWJhc2VcbiAgICB2YXIgdGhlUGF0aCA9ICcvJyt0aGlzLmNyZWRlbnRpYWxzLmRhdGFiYXNlKycvLW9udG9sb2d5LSc7XG4gICAgdGhpcy51cmwuZ2V0KHRoZVBhdGgpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgdGhpcy5vbnRvbG9neSA9IHJlcy5kYXRhO1xuICAgICAgY29uc3Qgb2JqTGFiZWwgPSBvbnRvbG9neTJMYWJlbHModGhpcy5vbnRvbG9neSwgdGhpcy5jb25maWdbJ3RhYmxlRm9ybWF0J10pO1xuICAgICAgdGhpcy5kaWN0TGFiZWxzID0gT2JqZWN0LmFzc2lnbih7fSwgb2JqTGFiZWwuaGllcmFyY2h5RGljdCwgb2JqTGFiZWwuZGF0YURpY3QpO1xuICAgICAgT2JqZWN0LmtleXModGhpcy5kaWN0TGFiZWxzKS5tYXAoaXRlbT0+eyAgLy9wcmVmaWxsIHRhYmxlcyBvZiBwcm9qZWN0cywgc2FtcGxlcywgLi4uXG4gICAgICAgIGlmIChpdGVtWzBdIT0neCcgfHwgaXRlbT09J3gwJykgIC8vIHByZWZpbGwgYWxsIGluY2x1ZGluZyBzdWItZG9jdHlwZXMgYnV0IGV4Y2x1ZGluZyB0YXNrc1xuICAgICAgICAgIHRoaXMucmVhZFRhYmxlKGl0ZW0sIGZhbHNlKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5lbWl0KCdpbml0U3RvcmUnKTtcbiAgICAgIHRoaXMuZW1pdCgnY2hhbmdlQ09NU3RhdGUnLCdvaycpO1xuICAgICAgY29uc29sZS5sb2coJ3N1Y2Nlc3MgcmVhZGluZyBmaXJzdCBlbnRyeSAob250b2xvZ3kpIGZyb20gZGF0YWJhc2UuJyk7XG4gICAgfSkuY2F0Y2goKGVycm9yKT0+e1xuICAgICAgLy9pZiBvbnRvbG9neSBlcnJvciByZW1haW5zOiBubyBvbnRvbG9neSwgdGhlbiBjcmVhdGUgZW1wdHkgb250b2xvZ3kgaW4gZGF0YWJhc2UgaGVyZVxuICAgICAgY29uc29sZS5sb2coJ0Vycm9yIGVuY291bnRlcmVkIGR1cmluZyBvbnRvbG9neSByZWFkaW5nLiAnK3RoZVBhdGgpO1xuICAgICAgdGhpcy5lbWl0KCdjaGFuZ2VDT01TdGF0ZScsJ2ZhaWwnKTtcbiAgICAgIHRocm93KGVycm9yKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldFVSTCgpe1xuICAgIC8qKlxuICAgICAgc2VuZCBodHRwIGNsaWVudCBvYmplY3QgKGF4aW9zKSB0byBvdGhlciBjbGFzc2VzXG4gICAgICovXG4gICAgaWYgKCF0aGlzLmNyZWRlbnRpYWxzKVxuICAgICAgcmV0dXJuIHt9O1xuICAgIHJldHVybiB7dXJsOnRoaXMudXJsLCBwYXRoOicvJyt0aGlzLmNyZWRlbnRpYWxzLmRhdGFiYXNlKycvJ307XG4gIH1cblxuXG4gIC8vICoqIFJldHJpZXZlIGRhdGEgZnJvbSBkb2N1bWVudCBzZXJ2ZXI6IGludGVybmFsIGZ1bmN0aW9ucyAqKiAvL1xuICAvLyAqKiBuYW1lcyBhY2NvcmRpbmcgdG8gQ1VSRDogQ3JlYXRlLFVwZGF0ZSxSZWFkLERlbGV0ZSAqKiAvL1xuICByZWFkVGFibGUoZG9jVHlwZSwgc2V0VGhpcz10cnVlLCByZXNldERvYz1mYWxzZSl7XG4gICAgLyoqXG4gICAgICogZ2V0IHRhYmxlIGNvbnRlbnQgZm9yIHRoaXMgZG9jdHlwZVxuICAgICAqIGluaXRpYWxpemUgb250b2xvZ3lOb2RlIChsYWJlbGluZyBvZiBjb2x1bW5zLCAuLi4pXG4gICAgICpcbiAgICAgKiBBcmdzOlxuICAgICAqICAgZG9jVHlwZTogZG9jdW1lbnQgdHlwZTogaS5lLiAneDAnID0gcHJvamVjdFxuICAgICAqICAgc2V0VGhpczogc3RvcmUgdGhpcyBkb2NUeXBlIGFzIHRoaXMucHJvcGVydHlcbiAgICAgKiAgIHJlc2V0RG9jOiByZXNldCBkb2N1bWVudCB0byBudWxsXG4gICAgICovXG4gICAgaWYgKCFkb2NUeXBlKVxuICAgICAgZG9jVHlwZT10aGlzLmRvY1R5cGU7XG4gICAgaWYgKHNldFRoaXMpXG4gICAgICB0aGlzLmRvY1R5cGUgPSBkb2NUeXBlO1xuICAgIGlmIChyZXNldERvYylcbiAgICAgIHRoaXMuZG9jUmF3ID0ge307XG4gICAgaWYgKHRoaXMub250b2xvZ3k9PT1udWxsKVxuICAgICAgcmV0dXJuO1xuICAgIHRoaXMuZW1pdCgnY2hhbmdlQ09NU3RhdGUnLCdidXN5Jyk7XG4gICAgdGhpcy5vbnRvbG9neU5vZGUgPSB0aGlzLm9udG9sb2d5W2RvY1R5cGVdO1xuICAgIGNvbnN0IHZpZXdOYW1lPSAoZG9jVHlwZS5zdWJzdHJpbmcoMCwyKT09J3gvJykgP1xuICAgICAgZG9jVHlwZS5zdWJzdHJpbmcoMikucmVwbGFjZSgnLycsJ19fJykgOlxuICAgICAgZG9jVHlwZS5yZXBsYWNlKCcvJywnX18nKTtcbiAgICBjb25zdCB0aGVQYXRoID0gJy8nK3RoaXMuY3JlZGVudGlhbHMuZGF0YWJhc2UrJy9fZGVzaWduL3ZpZXdEb2NUeXBlL192aWV3Lycrdmlld05hbWU7XG4gICAgdGhpcy51cmwuZ2V0KHRoZVBhdGgpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgdGhpcy50YWJsZSA9IHJlcy5kYXRhLnJvd3M7XG4gICAgICBjb25zdCBpZHhOYW1lID0gdGhpcy5vbnRvbG9neVtkb2NUeXBlXS5tYXAoaT0+e3JldHVybiBpLm5hbWU9PSctbmFtZSc7fSkuaW5kZXhPZih0cnVlKTtcbiAgICAgIGlmIChpZHhOYW1lPi0xKSB7XG4gICAgICAgIHRoaXMuZG9jc0xpc3RzW2RvY1R5cGVdID0gdGhpcy50YWJsZS5tYXAoaT0+e1xuICAgICAgICAgIHJldHVybiB7bmFtZTppLnZhbHVlW2lkeE5hbWVdLGlkOmkuaWR9O1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdFcnJvcjogXCItbmFtZVwiIG5vdCBpbiBvbnRvbG9neSBvZiBkb2N0eXBlIHwnKyBkb2NUeXBlKyd8IGxpa2VseSBkYXRhIG5vdCByZWFkeScpO1xuICAgICAgfVxuICAgICAgaWYgKHNldFRoaXMpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdjaGFuZ2VUYWJsZScpO1xuICAgICAgICB0aGlzLmVtaXQoJ2NoYW5nZUNPTVN0YXRlJywnb2snKTtcbiAgICAgIH1cbiAgICB9KS5jYXRjaCgoKT0+e1xuICAgICAgY29uc29sZS5sb2coJ0Vycm9yOiB2aWV3IGRvZXMgbm90IGV4aXN0IG9yIGVycm9yIGluIHByb2Nlc3NpbmcuICcrdGhlUGF0aCtcbiAgICAgICAgICAgICAgICAgICdcXG4gUmVwYWlyZWQgZHVyaW5nIGhlYWx0aCB0ZXN0Jyk7XG4gICAgICB0aGlzLnRhYmxlID0gW3t2YWxpZDpmYWxzZX1dO1xuICAgICAgdGhpcy5lbWl0KCdjaGFuZ2VUYWJsZScpO1xuICAgICAgdGhpcy5lbWl0KCdjaGFuZ2VDT01TdGF0ZScsJ2ZhaWwnKTtcbiAgICAgIC8vIGRvbid0IGtleSBcInRocm93KGVycm9yKTtcIiBhcyBpdCB3b3VsZCBub3Qgc3RvcCB0aGUgZXJyb3JcbiAgICB9KTtcbiAgICByZXR1cm47XG4gIH1cblxuICByZWFkRG9jdW1lbnQoaWQpIHtcbiAgICAvKipcbiAgICAgKiBHZXQgZG9jdW1lbnQgZnJvbSBkYXRhYmFzZVxuICAgICAqXG4gICAgICogQXJnczpcbiAgICAgKiAgIGlkOiBkb2N1bWVudCBpZFxuICAgICAqL1xuICAgIGlmICghaWQpIHtcbiAgICAgIHRoaXMuZW1pdCgnY2hhbmdlQ09NU3RhdGUnLCdvaycpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmVtaXQoJ2NoYW5nZUNPTVN0YXRlJywnYnVzeScpO1xuICAgIGNvbnN0IHRoZVBhdGggPSAnLycrdGhpcy5jcmVkZW50aWFscy5kYXRhYmFzZSsnLycraWQ7XG4gICAgdGhpcy51cmwuZ2V0KHRoZVBhdGgpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgdGhpcy5kb2NSYXcgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHJlcy5kYXRhKSk7XG4gICAgICB0aGlzLmVtaXQoJ2NoYW5nZURvYycpO1xuICAgICAgdGhpcy5lbWl0KCdjaGFuZ2VDT01TdGF0ZScsJ29rJyk7XG4gICAgfSkuY2F0Y2goKGVycm9yKT0+e1xuICAgICAgY29uc29sZS5sb2coJ3JlYWREb2N1bWVudCAtIEVycm9yIDE6ICcrdGhlUGF0aCk7XG4gICAgICB0aGlzLmVtaXQoJ2NoYW5nZUNPTVN0YXRlJywnZmFpbCcpO1xuICAgICAgdGhyb3coZXJyb3IpO1xuICAgIH0pO1xuICAgIC8vIGlmIHByb2plY3Q6IGFsc28gZ2V0IGhpZXJhcmNoeSBmb3IgcGxvdHRpbmdcbiAgICBpZiAodGhpcy5kb2NUeXBlPT09J3gwJykge1xuICAgICAgdGhpcy5lbWl0KCdjaGFuZ2VDT01TdGF0ZScsJ2J1c3knKTtcbiAgICAgIGNvbnN0IHRoZVBhdGggPSAnLycrdGhpcy5jcmVkZW50aWFscy5kYXRhYmFzZSsnL19kZXNpZ24vdmlld0hpZXJhcmNoeS9fdmlldy92aWV3SGllcmFyY2h5P3N0YXJ0a2V5PVwiJ1xuICAgICAgICAgICAgICAgICAgICAgICtpZCsnXCImZW5ka2V5PVwiJytpZCsnenp6XCInO1xuICAgICAgdGhpcy51cmwuZ2V0KHRoZVBhdGgpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICB2YXIgbmF0aXZlVmlldyA9IHt9O1xuICAgICAgICByZXMuZGF0YS5yb3dzLm1hcCgoaXRlbSk9PntcbiAgICAgICAgICBuYXRpdmVWaWV3W2l0ZW0uaWRdID0gW2l0ZW0ua2V5XS5jb25jYXQoIGl0ZW0udmFsdWUgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IG91dFN0cmluZyA9IGhpZXJhcmNoeTJTdHJpbmcobmF0aXZlVmlldywgdHJ1ZSwgbnVsbCwgJ25vbmUnLCBudWxsKTtcbiAgICAgICAgdGhpcy5oaWVyYXJjaHkgPSBvdXRTdHJpbmcudHJpbSgpO1xuICAgICAgICB0aGlzLmVtaXQoJ2NoYW5nZURvYycpO1xuICAgICAgICB0aGlzLmVtaXQoJ2NoYW5nZUNPTVN0YXRlJywnb2snKTtcbiAgICAgIH0pLmNhdGNoKChlcnJvcik9PntcbiAgICAgICAgY29uc29sZS5sb2coJ3JlYWREb2N1bWVudDogRXJyb3IgZW5jb3VudGVyZWQgMjogJyt0aGVQYXRoKTtcbiAgICAgICAgdGhpcy5lbWl0KCdjaGFuZ2VDT01TdGF0ZScsJ2ZhaWwnKTtcbiAgICAgICAgdGhyb3coZXJyb3IpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIHVwZGF0ZURvY3VtZW50KG5ld0RvYywgbm9ybWFsRG9jPXRydWUsIG9sZERvYz1udWxsKSB7XG4gICAgLyoqXG4gICAgICogVXBkYXRlIGRvY3VtZW50IG9uIGRhdGFiYXNlXG4gICAgICpcbiAgICAgKiBBcmdzOlxuICAgICAqICAgbmV3RG9jOiBuZXcgZG9jdW1lbnRcbiAgICAgKiAgIG5vcm1hbERvYzogYWxsIGRvY3VtZW50cyBhcmUgbm9ybWFsIHdpdGggdGhlIGV4Y2VwdGlvbiBvZiBvbnRvbG9neVxuICAgICAqL1xuICAgIHRoaXMuZW1pdCgnY2hhbmdlQ09NU3RhdGUnLCdidXN5Jyk7XG4gICAgdmFyIGRvY1JhdyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZG9jUmF3KTtcbiAgICBpZiAob2xkRG9jKSAgICAgICAgICAgICAgICAgICAgICAgLy9lZGl0IGNhbWUgZnJvbSBwcm9qZWN0OiBlLmcuIGVkaXQgc3RlcFxuICAgICAgZG9jUmF3ID0gb2xkRG9jO1xuICAgIGlmIChub3JtYWxEb2MpIHsgICAgICAgICAgICAgICAgICAvL2V2ZXJ5dGhpbmcgYnV0IG9udG9sb2d5XG4gICAgICBPYmplY3QuYXNzaWduKGRvY1JhdywgbmV3RG9jKTtcbiAgICAgIGRvY1JhdyA9IGZpbGxEb2NCZWZvcmVDcmVhdGUoZG9jUmF3LCB0aGlzLmRvY1R5cGUpO1xuICAgICAgZG9jUmF3WyctY3VyYXRlZCddID0gdHJ1ZTtcbiAgICAgIGRvY1Jhd1snLXVzZXInXSAgPSB0aGlzLmNvbmZpZ1snLXVzZXJJRCddO1xuICAgICAgZG9jUmF3WyctY2xpZW50J10gID0gJ2pzIHVwZGF0ZURvY3VtZW50JztcbiAgICB9IGVsc2UgeyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vb250b2xvZ3lcbiAgICAgIGRvY1JhdyA9IE9iamVjdC5hc3NpZ24oe30sIG5ld0RvYyk7XG4gICAgfVxuICAgIGNvbnN0IHRoZVBhdGggPSAnLycrdGhpcy5jcmVkZW50aWFscy5kYXRhYmFzZSsnLycrZG9jUmF3Ll9pZCsnLyc7XG4gICAgdGhpcy51cmwucHV0KHRoZVBhdGgsZG9jUmF3KS50aGVuKChyZXMpID0+IHsgLy9yZXMgPSByZXNwb25zZVxuICAgICAgY29uc29sZS5sb2coJ1VwZGF0ZSBzdWNjZXNzZnVsIHdpdGggLi4uJyk7XG4gICAgICBpZiAobm9ybWFsRG9jKSB7XG4gICAgICAgIHRoaXMuZG9jUmF3WydfcmV2J109cmVzLmRhdGEucmV2O1xuICAgICAgICB0aGlzLnJlYWRUYWJsZSh0aGlzLmRvY1R5cGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5pbml0U3RvcmUodGhpcy5kb2NUeXBlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZW1pdCgnY2hhbmdlRG9jJyk7XG4gICAgICB0aGlzLmVtaXQoJ2NoYW5nZUNPTVN0YXRlJywnb2snKTtcbiAgICB9KS5jYXRjaCgoZXJyb3IpPT57XG4gICAgICBjb25zdCB0ZXh0ID0gJ3VwZGF0ZURvY3VtZW50LSBFcnJvcjogJyt0aGVQYXRoKycgIHJldjonK2RvY1Jhd1snX3JldiddXG4gICAgICAgICAgICAgICAgICArJyB8IFJlbG9hZCB0byBmaXggbW9zdCBsaWtlbHknO1xuICAgICAgY29uc29sZS5sb2codGV4dCk7XG4gICAgICB0aHJvdyhlcnJvcik7XG4gICAgfSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgYWRkQXR0YWNobWVudChjb21tZW50LCBjaG9pY2UsIGZsYWcsIGF0dGFjaG1lbnROYW1lKXtcbiAgICAvKiogQWRkIGF0dGFjaG1lbnQgdG8gZG9jdW1lbnQgKi9cbiAgICB2YXIgbGlzdEF0dGFjaG1lbnRzID0gW107XG4gICAgaWYgKCctYXR0YWNobWVudCcgaW4gdGhpcy5kb2NSYXcpIHtcbiAgICAgIGlmIChhdHRhY2htZW50TmFtZSBpbiB0aGlzLmRvY1Jhd1snLWF0dGFjaG1lbnQnXSlcbiAgICAgICAgbGlzdEF0dGFjaG1lbnRzID0gdGhpcy5kb2NSYXdbJy1hdHRhY2htZW50J11bYXR0YWNobWVudE5hbWVdO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRvY1Jhd1snLWF0dGFjaG1lbnQnXSA9IHt9O1xuICAgIH1cbiAgICB2YXIgbm93ID0gbmV3IERhdGUoKS50b0pTT04oKTtcbiAgICBub3cgPSBub3cuc2xpY2UoMCxub3cubGVuZ3RoLTEpO1xuICAgIGxpc3RBdHRhY2htZW50cy5wdXNoKHtkYXRlOm5vdywgcmVtYXJrOmNvbW1lbnQsIGRvY0lEOmNob2ljZSwgZmxhZzpmbGFnLCB1c2VyOnRoaXMuY29uZmlnWyd1c2VySUQnXX0pO1xuICAgIHRoaXMuZG9jUmF3WyctYXR0YWNobWVudCddW2F0dGFjaG1lbnROYW1lXSA9IGxpc3RBdHRhY2htZW50cztcbiAgICBjb25zdCB0aGVQYXRoID0gJy8nK3RoaXMuY3JlZGVudGlhbHMuZGF0YWJhc2UrJy8nK3RoaXMuZG9jUmF3Ll9pZCsnLyc7XG4gICAgdGhpcy51cmwucHV0KHRoZVBhdGgsdGhpcy5kb2NSYXcpLnRoZW4oKHJlcykgPT4geyAvL3JlcyA9IHJlc3BvbnNlXG4gICAgICBjb25zb2xlLmxvZygnQWRkIGF0dGFjaG1lbnQgc3VjY2Vzc2Z1bCcpO1xuICAgICAgdGhpcy5kb2NSYXdbJ19yZXYnXT1yZXMuZGF0YS5yZXY7XG4gICAgICB0aGlzLmVtaXQoJ2NoYW5nZUNPTVN0YXRlJywnb2snKTtcbiAgICB9KS5jYXRjaCgoZXJyb3IpPT57XG4gICAgICBjb25zb2xlLmxvZygnYWRkQXR0YWNobWVudDogRXJyb3IgZW5jb3VudGVyZWQ6ICcrdGhlUGF0aCk7XG4gICAgICB0aHJvdyhlcnJvcik7XG4gICAgfSk7XG4gICAgcmV0dXJuO1xuICB9XG5cblxuICBjcmVhdGVEb2N1bWVudChkb2MpIHtcbiAgICAvKiogQ3JlYXRlIGRvY3VtZW50IG9uIGRhdGFiYXNlIGRpcmVjdGx5IG9yIGNhbGwgZXh0ZXJuYWwgY29tbWFuZCBwYXN0YURCLnB5ICovXG4gICAgdGhpcy5lbWl0KCdjaGFuZ2VDT01TdGF0ZScsJ2J1c3knKTtcbiAgICBkb2MgPSBPYmplY3QuZnJvbUVudHJpZXMoT2JqZWN0LmVudHJpZXMoZG9jKS5maWx0ZXIoIChbLHZhbHVlXSkgPT4ge3JldHVybiB2YWx1ZSE9Jyc7fSApKTsgIC8vZmlsdGVyIGVudHJpZXMgd2hpY2ggYXJlIGZpbGxlZFxuICAgIGlmICghKGRvYy5jb21tZW50KSlcbiAgICAgIGRvY1snY29tbWVudCddPScnO1xuICAgIGlmIChkb2MuX3Byb2plY3QpIHtcbiAgICAgIGRvY1snLWJyYW5jaCddID0gW3tjaGlsZDo5OTk5LCBwYXRoOm51bGwsIHN0YWNrOltkb2MuX3Byb2plY3RdfV07XG4gICAgICBkZWxldGUgZG9jWydfcHJvamVjdCddO1xuICAgIH1cbiAgICBpZiAoKHRoaXMuZG9jVHlwZT09J3gwJ3x8ZG9jWyctbmFtZSddLmluZGV4T2YoJy8nKT4wKSYmKCFkb2NbJy10eXBlJ10pKSB7XG4gICAgICAvL2NyZWF0ZSB2aWEgYmFja2VuZFxuICAgICAgLy8gIHRoaXMgaXMgdGhlIHNhZmUgcGF0aCB0aGF0IHNob3VsZCBhbHdheXMgd29yayBidXQgaXMgc2xvd2VyXG4gICAgICAvLyAgdXNlIHRoaXMgZm9yIHByb2plY3RzIGFuZCBldmVyeXRoaW5nIHRoYXQgaGFzIGEgJy8nIGluIHRoZSBuYW1lLCBpbmRpY2F0aW5nIGl0IGlzIGEgcGF0aFxuICAgICAgY29uc29sZS5sb2coJ2NyZWF0ZSBkb2MgdmlhIGJhY2tlbmQnLGRvYyk7XG4gICAgICBjb25zdCBwcm9qRG9jPXtpZDonbm9uZSd9O1xuICAgICAgZXhlY3V0ZUNtZCgnX3N0b3JlX2JlX2NyZWF0ZURvYycsdGhpcy5jYWxsYmFjayxwcm9qRG9jLmlkLE9iamVjdC5hc3NpZ24oZG9jLHtkb2NUeXBlOnRoaXMuZG9jVHlwZX0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy9jcmVhdGUgZGlyZWN0bHlcbiAgICAgIGNvbnNvbGUubG9nKCdjcmVhdGUgZG9jIGRpcmVjdGx5Jyxkb2MpO1xuICAgICAgZG9jWyctdXNlciddICA9IHRoaXMuY29uZmlnWyctdXNlcklEJ107XG4gICAgICBkb2NbJy1jbGllbnQnXSAgPSAnanMgY3JlYXRlRG9jdW1lbnQgJytKU09OLnN0cmluZ2lmeShkb2MpO1xuICAgICAgdGhpcy5vbnRvbG9neU5vZGUubWFwKGk9PntyZXR1cm4gaS5uYW1lO30pLmZpbHRlcihpPT57cmV0dXJuIGkgJiYgaS5pbmRleE9mKCcvJyk+MDt9KS5tYXAoaT0+e1xuICAgICAgICBkb2NbIGkuc3BsaXQoJy8nKVswXSBdID0ge307XG4gICAgICB9KTtcbiAgICAgIHZhciBkb2NUeXBlID0gZG9jWyctdHlwZSddID8gZG9jWyctdHlwZSddWzBdIDogdGhpcy5kb2NUeXBlO1xuICAgICAgZG9jID0gZmlsbERvY0JlZm9yZUNyZWF0ZShkb2MsIGRvY1R5cGUpO1xuICAgICAgY29uc3QgdGhlUGF0aCA9ICcvJyt0aGlzLmNyZWRlbnRpYWxzLmRhdGFiYXNlKycvJztcbiAgICAgIHRoaXMudXJsLnBvc3QodGhlUGF0aCxkb2MpLnRoZW4oKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnQ3JlYXRpb24gc3VjY2Vzc2Z1bCB3aXRoIC4uLicpO1xuICAgICAgICBjb25zb2xlLmxvZyhkb2MpO1xuICAgICAgICB0aGlzLnJlYWRUYWJsZSh0aGlzLmRvY1R5cGUpO1xuICAgICAgfSkuY2F0Y2goKGVycm9yKT0+e1xuICAgICAgICBjb25zb2xlLmxvZygnY3JlYXRlRG9jdW1lbnQ6IEVycm9yIGVuY291bnRlcmVkIDI6ICcrdGhlUGF0aCk7XG4gICAgICAgIHRocm93KGVycm9yKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5lbWl0KCdjaGFuZ2VDT01TdGF0ZScsJ29rJyk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIGRlbGV0ZURvYyhkb2NJRCwgZG9jUmV2KXtcbiAgICAvKiogVGVtcG9yYXJ5IGZ1bmN0aW9uIHRvIGFsbG93IHRlc3QtdXNhZ2U6IHJlbW92ZSBkb2N1bWVudHMgKi9cbiAgICBpZiAoIWRvY0lEKSB7XG4gICAgICBkb2NJRCA9IHRoaXMuZG9jUmF3Ll9pZDtcbiAgICAgIGRvY1Jldj0gdGhpcy5kb2NSYXcuX3JldjtcbiAgICB9XG4gICAgY29uc3QgdGhlUGF0aCA9ICcvJyt0aGlzLmNyZWRlbnRpYWxzLmRhdGFiYXNlKycvJytkb2NJRCsnLz9yZXY9Jytkb2NSZXY7XG4gICAgdGhpcy51cmwuZGVsZXRlKHRoZVBhdGgpLnRoZW4oKCk9PntcbiAgICAgIGNvbnNvbGUubG9nKCdEZWxldGUgc3VjY2VzcyEnKTtcbiAgICAgIHRoaXMucmVhZFRhYmxlKHRoaXMuZG9jVHlwZSk7XG4gICAgfSkuY2F0Y2goKGVycm9yKT0+e1xuICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIH0pO1xuICB9XG5cbiAgY2FsbGJhY2soY29udGVudCl7XG4gICAgLyoqIENhbGxiYWNrIGZ1bmN0aW9uIGZvciBiYWNrZW5kIHBhc3RhREIucHk6IHJlLXJlYWQgbmV3IGRhdGEgZnJvbSBkYXRhYmFzZSAqL1xuICAgIGlmIChjb250ZW50LmluZGV4T2YoJ1NVQ0NFU1MnKT4tMSkge1xuICAgICAgdGhpcy5yZWFkVGFibGUodGhpcy5kb2NUeXBlKTtcbiAgICB9XG4gIH1cblxuXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvL3NlbmQgaW5mb3JtYXRpb24gdG8gb3RoZXIgY29tcG9uZW50c1xuICBnZXRUYWJsZShkb2NUeXBlKXtcbiAgICAvKiogVGFibGUgb2YgZG9jdW1lbnRzICovXG4gICAgaWYgKCF0aGlzLnRhYmxlIHx8IGRvY1R5cGUhPXRoaXMuZG9jVHlwZSlcbiAgICAgIHRoaXMucmVhZFRhYmxlKGRvY1R5cGUsIHRydWUpO1xuICAgIHJldHVybiB0aGlzLnRhYmxlO1xuICB9XG4gIGdldERvY3VtZW50UmF3KCl7XG4gICAgLyoqIE9uZSBkb2N1bWVudCAqL1xuICAgIHJldHVybiB0aGlzLmRvY1JhdztcbiAgfVxuICBnZXRIaWVyYXJjaHkoKXtcbiAgICAvKiogSGllcmFyY2h5IGluIHByb2plY3QsIGlmIGRvYyBpcyBhIHByb2plY3QgKi9cbiAgICByZXR1cm4gdGhpcy5oaWVyYXJjaHk7XG4gIH1cblxuICBnZXRDcmVkZW50aWFscygpe1xuICAgIC8qKiBVc2VyIGNyZWRlbnRpYWxzLCBzZXJ2ZXIsIGRhdGFiYXNlIG9uIHNlcnZlciAqL1xuICAgIHJldHVybiB0aGlzLmNyZWRlbnRpYWxzO1xuICB9XG4gIGdldENvbmZpZ3VyYXRpb24oKXtcbiAgICAvKiogQ29uZmlndXJhdGlvbjogdGFibGUgZm9ybWF0ICovXG4gICAgcmV0dXJuIHRoaXMuY29uZmlnO1xuICB9XG4gIGdldE9udG9sb2d5KCl7XG4gICAgLyoqIEVudGlyZSBvbnRvbG9neSAqL1xuICAgIGlmICh0aGlzLm9udG9sb2d5PT09bnVsbCB8fCAhKCdfaWQnIGluIHRoaXMub250b2xvZ3kpKVxuICAgICAgcmV0dXJuIHt9O1xuICAgIGVsc2VcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LHRoaXMub250b2xvZ3kpOyAgLy9yZXR1cm4gY29weSwgbm90IG9yaWdpbmFsXG4gIH1cbiAgZ2V0T250b2xvZ3lOb2RlKGRvY1R5cGU9bnVsbCl7XG4gICAgLyoqIGdldCBvbnRvbG9neSBvZiBkb2N0eXBlOiBsb25nIGRlc2NyaXB0aW9uLCByZXF1aXJlZCwuLi4gKi9cbiAgICBpZiAoZG9jVHlwZSkge1xuICAgICAgdmFyIG9udE5vZGUgPSBudWxsO1xuICAgICAgaWYgKHR5cGVvZiBkb2NUeXBlID09PSAnc3RyaW5nJyB8fCBkb2NUeXBlIGluc3RhbmNlb2YgU3RyaW5nKVxuICAgICAgICBkb2NUeXBlID0gZG9jVHlwZS5zcGxpdCgnLycpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkb2NUeXBlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChkb2NUeXBlLnNsaWNlKDAsaSsxKS5qb2luKCcvJykgaW4gdGhpcy5vbnRvbG9neSlcbiAgICAgICAgICBvbnROb2RlID0gZG9jVHlwZS5zbGljZSgwLGkrMSkuam9pbignLycpO1xuICAgICAgfVxuICAgICAgaWYgKG9udE5vZGUpXG4gICAgICAgIHJldHVybiB0aGlzLm9udG9sb2d5W29udE5vZGVdO1xuICAgICAgcmV0dXJuIHRoaXMub250b2xvZ3lbZG9jVHlwZV07XG4gICAgfVxuICAgIGlmICh0aGlzLmRvY1Jhd1snLXR5cGUnXSAmJiB0aGlzLmRvY1Jhd1snLXR5cGUnXS5qb2luKCcvJykgaW4gdGhpcy5vbnRvbG9neSlcbiAgICAgIHJldHVybiB0aGlzLm9udG9sb2d5W3RoaXMuZG9jUmF3WyctdHlwZSddLmpvaW4oJy8nKV07XG4gICAgcmV0dXJuIHRoaXMub250b2xvZ3lOb2RlO1xuICB9XG5cbiAgZ2V0RG9jVHlwZUxhYmVscygpe1xuICAgIC8qKiBQYWlycyBvZiBkb2NUeXBlLGRvY0xhYmVsKi9cbiAgICByZXR1cm4gdGhpcy5kaWN0TGFiZWxzO1xuICB9XG4gIGdldERvY1R5cGUoKXtcbiAgICAvKiogR2V0IGRvY3R5cGUgKi9cbiAgICBpZiAodGhpcy5kb2NSYXdbJy10eXBlJ10gJiYgdGhpcy5kb2NSYXdbJy10eXBlJ10uam9pbignLycpIGluIHRoaXMub250b2xvZ3kpXG4gICAgICByZXR1cm4gdGhpcy5kb2NSYXdbJy10eXBlJ10uam9pbignLycpO1xuICAgIHJldHVybiB0aGlzLmRvY1R5cGU7XG4gIH1cbiAgZ2V0RG9jc0xpc3QoZG9jVHlwZSl7XG4gICAgLyoqIGRvY0lEcyBvZiBkb2NUeXBlOiBlLmcuIGFsbCB0aGUgZG9jSWRzIG9mIHByb2plY3RzLCAuLiAqL1xuICAgIGlmICh0aGlzLmRvY3NMaXN0c1tkb2NUeXBlXSlcbiAgICAgIHJldHVybiB0aGlzLmRvY3NMaXN0c1tkb2NUeXBlXTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBnZXRTdWJ0eXBlcyhkb2NUeXBlKXtcbiAgICAvKiogZ2l2ZW4gYSBkb2N0eXBlLi4uIHJldHVybiBhbGwgdGhvc2UgdGhhdCBhcmUgY2hpbGRyZW4gKi9cbiAgICBpZiAoIXRoaXMub250b2xvZ3kpXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBmaWx0ZXJlZCA9IE9iamVjdC5rZXlzKHRoaXMub250b2xvZ3kpLmZpbHRlcihpPT57cmV0dXJuIGkuaW5kZXhPZihkb2NUeXBlKT09MDt9KTtcbiAgICByZXR1cm4gZmlsdGVyZWQ7XG4gIH1cblxuICBnZXRFeHRyYWN0b3JzKCl7XG4gICAgLyoqIHJldHVybiBsaXN0IG9mIGFsbCBleHRyYWN0b3JzIGZvciBtZWFzdXJlbWVudHMgKi9cbiAgICBpZiAoIXRoaXMuY29uZmlnWydleHRyYWN0b3JzJ10pXG4gICAgICByZXR1cm4gW107XG4gICAgY29uc3QgZG9jVHlwZVN0cmluZyA9IHRoaXMuZG9jUmF3WyctdHlwZSddLnNsaWNlKDAsMykuam9pbignLycpOyAgLy9maXJzdCB0aHJlZSBpdGVtcyBkZXRlcm1pbmUgZG9jVHlwZVxuICAgIGNvbnN0IGZpbHRlcmVkID0gT2JqZWN0LmtleXModGhpcy5jb25maWdbJ2V4dHJhY3RvcnMnXSlcbiAgICAgIC5maWx0ZXIoa2V5ID0+IGtleS5pbmRleE9mKGRvY1R5cGVTdHJpbmcpPT0wKVxuICAgICAgLnJlZHVjZSgob2JqLCBrZXkpID0+IHtcbiAgICAgICAgb2JqW2tleV0gPSB0aGlzLmNvbmZpZ1snZXh0cmFjdG9ycyddW2tleV07XG4gICAgICAgIHJldHVybiBvYmo7fSwge30pO1xuICAgIHJldHVybiBmaWx0ZXJlZDtcbiAgfVxuXG4gIGdldEdVSUNvbmZpZyhrZXkpe1xuICAgIC8qKiByZXR1cm4gaW1hZ2Ugc2l6ZSAqL1xuICAgIGlmICh0aGlzLmNvbmZpZyAmJiB0aGlzLmNvbmZpZ1snR1VJJ10gJiYgdGhpcy5jb25maWdbJ0dVSSddW2tleV0pXG4gICAgICByZXR1cm4gdGhpcy5jb25maWdbJ0dVSSddW2tleV07XG4gICAgLy9kZWZhdWx0c1xuICAgIGlmIChrZXk9PSdpbWFnZVNpemUnKVxuICAgICAgcmV0dXJuICcxMDAlJztcbiAgICBpZiAoa2V5PT0nbWF4VGFiQ29sdW1ucycpXG4gICAgICByZXR1cm4gMjA7XG4gICAgaWYgKGtleT09J3ZlcmJvc2UnKVxuICAgICAgcmV0dXJuIDE7ICAvLzA6IG5vIG91dHB1dC9uZXZlciB1c2VkOyAxOiBkZWZhdWx0OyAyOiBtb3JlXG4gIH1cblxuXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvL2Nvbm5lY3QgYWN0aW9ucyB0byByZXRyaWV2ZSBmdW5jdGlvbnNcbiAgLy9uYW1lcyBhY2NvcmRpbmcgdG8gQ1VSRDogQ3JlYXRlLFVwZGF0ZSxSZWFkLERlbGV0ZVxuICBoYW5kbGVBY3Rpb25zKGFjdGlvbikge1xuICAgIHN3aXRjaChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgJ1JFQURfVEFCTEUnOiB7XG4gICAgICB0aGlzLnJlYWRUYWJsZShhY3Rpb24uZG9jVHlwZSwgYWN0aW9uLnNldFRoaXMsIGFjdGlvbi5yZXNldERvYyk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSAnUkVBRF9ET0MnOiB7XG4gICAgICB0aGlzLnJlYWREb2N1bWVudChhY3Rpb24uaWQpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNhc2UgJ1VQREFURV9ET0MnOiB7XG4gICAgICB0aGlzLnVwZGF0ZURvY3VtZW50KGFjdGlvbi5kb2MsIHRydWUsIGFjdGlvbi5vbGREb2MpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNhc2UgJ0NSRUFURV9ET0MnOiB7XG4gICAgICB0aGlzLmNyZWF0ZURvY3VtZW50KGFjdGlvbi5kb2MpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNhc2UgJ1VQREFURV9FWFRSQUNUT1JTJzoge1xuICAgICAgY29uc3QgcmVzID0gZ2V0Q3JlZGVudGlhbHMoKTtcbiAgICAgIHRoaXMuY29uZmlnWydleHRyYWN0b3JzJ10gPSByZXNbJ2NvbmZpZ3VyYXRpb24nXSA/IHJlc1snY29uZmlndXJhdGlvbiddWydleHRyYWN0b3JzJ10gOiBbXTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBkZWZhdWx0OiB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgfVxuICB9XG59XG5cbmNvbnN0IHN0b3JlID0gbmV3IFN0YXRlU3RvcmUoKTtcbmRpc3BhdGNoZXIucmVnaXN0ZXIoc3RvcmUuaGFuZGxlQWN0aW9ucy5iaW5kKHN0b3JlKSk7XG5leHBvcnQgZGVmYXVsdCBzdG9yZTtcbiJdLCJmaWxlIjoicmVuZGVyZXIvU3RvcmUuanMifQ==
