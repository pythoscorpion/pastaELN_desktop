/* Central storage class
 - all REST request are handled here
 - all data cleaning is handled here
 - none of the variables are directly accessed
 - this is a normal js-code (not React-Component): no this.setstate, etc.

 - Note: axios('localhost:8888') does not work, since different port
   in package.json add proxy and then just specify the end of the requesting string here
   https://create-react-app.dev/docs/proxying-api-requests-in-development/
*/
import { EventEmitter } from 'events';
import axios from 'axios';
import dispatcher from './Dispatcher';
import {fillDocBeforeCreate, dataDictionary2DataLabels, dataDictionary2ObjectOfLists,
  hierarchy2String, doc2SortedDoc} from './commonTools';
import {getCredentials} from './localInteraction';

class StateStore extends EventEmitter {
  //Initialize
  constructor() {
    super();
    this.state = 0;         //on right side of display: [0]: show details; 1: edit details; 2: new details
    this.docType = null;    //straight doctype: e.g. project
    this.docLabel= null;
    this.table = null;      //table data
    this.tableMeta = null;  //table meta-data: column information
    this.docOld=null;
    this.doc = {
      keysMain:  null,     valuesMain:  null,
      keysDB:    ['type'], valuesDB:    ['null'],
      keysDetail:null,     valuesDetail:null,
      image:     null,
      meta:      null
    };
    this.hierarchy = null;
    this.url       = null;
    this.config    = null;
  }

  /**Retrieve data from document server: internal functions
   * also clean data here, before this.emit
   * names according to CURD: Create,Update,Read,Delete
   */
  readTable(docLabel) {
    /**Function that is called first: table is always read first.
     * Used to initialize: docLabel, docType, tableMeta
    */
    if (docLabel===null) return;
    this.docLabel = docLabel;
    this.config = getCredentials();
    if (this.config===null) {
      const json = localStorage.getItem('credentials');
      this.config = JSON.parse(json);
    }
    if (this.config===null) return;
    this.url = axios.create({
      baseURL: this.config.url,
      auth: {username: this.config.user, password: this.config.password}
    });
    //get table header from dataDictionary, which is stored in database
    var thePath = '/'+this.config.database+'/-dataDictionary-';
    this.url.get(thePath).then((res) => {
      const objLabel = dataDictionary2DataLabels(res.data);
      const listLabels = objLabel.hierarchyList.concat(objLabel.dataList);
      const row = listLabels.filter(function(item){
        return item[1]===docLabel;
      });
      this.docType = row[0][0];
      this.tableMeta = dataDictionary2ObjectOfLists(res.data[this.docType].default);
      this.emit('changeTable');
    });
    //table content
    thePath = '/'+this.config.database+'/_design/view'+this.docLabel+'/_view/view'+this.docLabel;
    this.url.get(thePath).then((res) => {
      this.table = res.data.rows;
      this.emit('changeTable');});
    return;
  }


  readDocument(id) {
    /**Get document from database
     */
    const thePath = '/'+this.config.database+'/'+id;
    this.url.get(thePath).then((res) => {
      this.docOld = JSON.parse(JSON.stringify(res.data));
      this.doc = doc2SortedDoc(res.data, this.tableMeta);
      this.emit('changeDoc');
    });
    // if project: also get hierarchy for plotting
    if (this.docType==='project') {
      const thePath = '/'+this.config.database+'/_design/viewHierarchy/_view/viewHierarchy?startkey="'+id+'"&endkey="'+id+'zzz"';
      this.url.get(thePath).then((res) => {
        var nativeView = {};
        for (const item of res.data.rows) {
          nativeView[item.id] = [item.key].concat( item.value );
          // if (item.id.startsWith('t-')) {
          // }
        }
        const outString = hierarchy2String(nativeView, true, null, 'none', null);
        this.hierarchy = outString.trim();
        this.emit('changeDoc');
      });
    }
    return;
  }


  updateDocument(newDoc) {
    /**Update document on database
     */
    Object.assign(this.docOld, newDoc);
    this.docOld = fillDocBeforeCreate(this.docOld, this.docType, this.docOld.projectID);
    const thePath = '/'+this.database+'/'+this.docOld._id+'/';
    this.url.put(thePath,this.docOld).then(() => {
      console.log('Update successful with ...');   //TODO: update local table upon change, or reread from server
      console.log(this.docOld);
    });
    return;
  }


  createDocument(doc) {
    /**Create document on database
     */
    if (!(doc.comment)) {doc['comment']='';}
    doc = fillDocBeforeCreate(doc, this.docType, doc.projectID);
    const thePath = '/'+this.config.database+'/';
    this.url.post(thePath,doc).then(() => {
      console.log('Creation successful with ...'); //TODO: update local table upon change, or reread from server
    });
    return;
  }


  //get information from here to components
  getTable(){
    return this.table;
  }
  getDocument(){
    return this.doc;
  }
  getHierarchy(){
    return this.hierarchy;
  }
  getTableMeta(){
    return this.tableMeta;
  }
  getState(){
    return this.state;
  }
  getCredentials(){
    return this.config;
  }

  //connect actions to retrieve functions
  //names according to CURD: Create,Update,Read,Delete
  handleActions(action) {
    switch(action.type) {
    case 'READ_TABLE': {
      this.readTable(action.docLabel);
      //this.emit('change');
      break;
    }
    case 'READ_DOC': {
      this.readDocument(action.id);
      break;
    }
    case 'UPDATE_DOC': {
      this.updateDocument(action.doc);
      break;
    }
    case 'CREATE_DOC': {
      this.createDocument(action.doc);
      break;
    }
    case 'TOGGLE_EDIT': {
      this.state = 1;
      this.emit('toggleState');
      break;
    }
    case 'TOGGLE_NEW': {
      this.state = 2;
      this.emit('toggleState');
      break;
    }
    case 'TOGGLE_SHOW': {
      this.state = 0;
      this.emit('toggleState');
      break;
    }
    default: {
      break;
    }
    }
  }
}


const stateStore = new StateStore();
dispatcher.register(stateStore.handleActions.bind(stateStore));
export default stateStore;
