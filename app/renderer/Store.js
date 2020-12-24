/* Central storage class for documents and tables
 - all REST request are handled here
 - all data cleaning is handled here
 - none of the variables are directly accessed from other components
 - this is a normal js-code (not React-Component): no this.setState, etc.

 - Note: axios('localhost:8888') does not work, since different port
   in package.json add proxy and then just specify the end of the requesting string here
   https://create-react-app.dev/docs/proxying-api-requests-in-development/
*/
import { EventEmitter } from 'events';
import axios from 'axios';
import dispatcher from './Dispatcher';
import {fillDocBeforeCreate, dataDictionary2DataLabels, dataDictionary2ObjectOfLists,
  hierarchy2String, doc2SortedDoc} from './commonTools';
import {getCredentials, executeCmd} from './localInteraction';

class StateStore extends EventEmitter {
  //Initialize
  constructor() {
    super();
    this.callback     = this.callback.bind(this);
    // configuration
    this.url       = null;
    this.config    = null;
    this.dataDictionary = null;
    this.listLabels = null;
    // document and table items
    this.docType = null;    //straight doctype: e.g. project
    this.docLabel= null;
    // document items
    this.docRaw  = {};
    this.docProcessed = {  //same as in initStore
      keysMain:  null,     valuesMain:  null,
      keysDB:    ['type'], valuesDB:    ['null'],
      keysDetail:null,     valuesDetail:null,
      image:     null,
      meta:      null
    };
    this.hierarchy = null;
    // table items
    this.table = null;      //table data
    this.tableMeta = null;  //table meta-data: column information
  }


  initStore() {
    /**Function that is called first from App.js
     * get configuration and dataDictionary
     * use dataDictionary to create list of docTypes:docLabels
    */
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
      this.dataDictionary = res.data;
      const objLabel = dataDictionary2DataLabels(res.data);
      this.listLabels = objLabel.hierarchyList.concat(objLabel.dataList);
      this.emit('initStore');
    }).catch(()=>{
      console.log('Error encountered during dataDictionary reading');
    });
    this.emit('changeCOMState','ok');
  }


  /**Retrieve data from document server: internal functions
   * names according to CURD: Create,Update,Read,Delete
   */
  readTable(docLabel){
    /** get table content
     * initialize tableMeta
     */
    if (!docLabel)
      docLabel=this.docLabel;
    if (this.dataDictionary===null) return;
    this.emit('changeCOMState','busy');
    this.docLabel = docLabel;
    const row = this.listLabels.filter(function(item){
      return item[1]===docLabel;
    });
    this.docType = row[0][0];
    this.tableMeta = dataDictionary2ObjectOfLists(this.dataDictionary[this.docType].default);
    const thePath = '/'+this.config.database+'/_design/viewDocType/_view/view'+this.docLabel;
    this.url.get(thePath).then((res) => {
      this.table = res.data.rows;
      this.emit('changeTable');
      this.emit('changeCOMState','ok');
    }).catch(()=>{
      console.log('Error encountered');
      this.table = [];
      this.emit('changeTable');
      this.emit('changeCOMState','fail');
    });
    return;
  }


  readDocument(id) {
    /**Get document from database
     */
    this.emit('changeCOMState','busy');
    const thePath = '/'+this.config.database+'/'+id;
    this.url.get(thePath).then((res) => {
      this.docRaw = JSON.parse(JSON.stringify(res.data));
      this.docProcessed = doc2SortedDoc(res.data, this.tableMeta);  //don't use this.docRaw as input here since it get destroyed
      this.emit('changeDoc');
      this.emit('changeCOMState','ok');
    });
    // if project: also get hierarchy for plotting
    if (this.docType==='project') {
      this.emit('changeCOMState','busy');
      const thePath = '/'+this.config.database+'/_design/viewHierarchy/_view/viewHierarchy?startkey="'+id+'"&endkey="'+id+'zzz"';
      this.url.get(thePath).then((res) => {
        var nativeView = {};
        for (const item of res.data.rows) {
          // if (item.id.startsWith('t-')) {  //All subitems of project are shown
          nativeView[item.id] = [item.key].concat( item.value );
          // }
        }
        const outString = hierarchy2String(nativeView, true, null, 'none', null);
        this.hierarchy = outString.trim();
        this.emit('changeDoc');
        this.emit('changeCOMState','ok');
      }).catch(()=>{
        console.log('readDocument: Error encountered');
        this.emit('changeCOMState','fail');
      });
    }
    return;
  }


  updateDocument(newDoc,normalDoc=true) {
    /**Update document on database
     *
     * Args:
     *   newDoc: new document
     *   normalDoc: all documents are normal with the exception of dataDictionary
     */
    this.emit('changeCOMState','busy');
    if (normalDoc) {
      Object.assign(this.docRaw, newDoc);
      this.docRaw = fillDocBeforeCreate(this.docRaw, this.docType, this.docRaw.projectID);
      if ('curate' in this.docRaw)
        delete this.docRaw.curate;
    } else {
      this.docRaw = Object.assign({}, newDoc);
    }
    const thePath = '/'+this.config.database+'/'+this.docRaw._id+'/';
    this.url.put(thePath,this.docRaw).then((res) => { //res = response
      this.docRaw.rev=res.data.rev;
      this.docProcessed = doc2SortedDoc( Object.assign({}, this.docRaw), this.tableMeta);
      console.log('Update successful with ...');
      if (normalDoc) {
        this.readTable(this.docLabel);
      } else {
        this.initStore(this.docLabel);
      }
      this.emit('changeDoc');
      this.emit('changeCOMState','ok');
    });
    return;
  }


  createDocument(doc) {
    /** Create document on database directly or call external command
     */
    this.emit('changeCOMState','busy');
    if (!(doc.comment)) {doc['comment']='';}
    if (this.docType==='project' || this.docType==='measurement' || this.docType==='procedure' ) {
      //create via backend
      const thePath = '/'+this.config.database+'/_design/viewDocType/_view/viewProjects';
      this.url.get(thePath).then((res) => {
        var projDoc = res.data.rows[0];  //TODO SB P2 Let people choose project
        if (!projDoc)
          projDoc={id:'none'};
        executeCmd('createDoc', [Object.assign(doc,{docType:this.docType}), projDoc.id], this.callback);
      });
    } else {
      //create directly
      doc = fillDocBeforeCreate(doc, this.docType, doc.projectID);
      const thePath = '/'+this.config.database+'/';
      this.url.post(thePath,doc).then(() => {
        console.log('Creation successful with ...');
        console.log(doc);
      });
      this.emit('changeCOMState','ok');
    }
    return;
  }
  callback(content){
    if (content.indexOf('SUCCESS')>-1) {
      this.readTable(this.docLabel);
    }
  }


  //get information from here to components
  getTable(docLabel){
    if (!this.table) this.readTable(docLabel);
    return this.table;
  }
  getDocument(){
    return this.docProcessed;
  }
  getHierarchy(){
    return this.hierarchy;
  }
  getTableMeta(){
    return this.tableMeta;
  }
  getCredentials(){
    return this.config;
  }
  getDataDictionary(){
    if (this.dataDictionary===null || !('_id' in this.dataDictionary))
      return {};
    else
      return this.dataDictionary;
  }
  getDocLabels(){
    if (!this.listLabels)
      return [];
    return this.listLabels.map((item)=> {return item[1];});
  }

  //connect actions to retrieve functions
  //names according to CURD: Create,Update,Read,Delete
  handleActions(action) {
    switch(action.type) {
    case 'READ_TABLE': {
      this.readTable(action.docLabel);
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
    default: {
      break;
    }
    }
  }
}

const stateStore = new StateStore();
dispatcher.register(stateStore.handleActions.bind(stateStore));
export default stateStore;
