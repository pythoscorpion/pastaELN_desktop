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
import {fillDocBeforeCreate, ontology2Labels, ontology2FullObjects,
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
    this.ontology = null;
    this.tableFormat= null;
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
    this.docsLists = {};
  }


  initStore() {
    /**Function that is called first from App.js
     * get configuration and ontology
     * use ontology to create list of docTypes:docLabels
    */
    const res = getCredentials();
    this.config     = res['credentials'];
    this.tableFormat= res['tableFormat'];
    if (this.config===null || this.config.database==='' || this.config.user===''|| this.config.password==='') //if credentials not set
      return;
    this.url = axios.create({
      baseURL: this.config.url,
      auth: {username: this.config.user, password: this.config.password}
    });
    //get table header from ontology, which is stored in database
    var thePath = '/'+this.config.database+'/-ontology-';
    this.url.get(thePath).then((res) => {
      this.ontology = res.data;
      const objLabel = ontology2Labels(this.ontology,this.tableFormat);
      this.listLabels = objLabel.hierarchyList.concat(objLabel.dataList);
      this.emit('initStore');
    }).catch(()=>{
      console.log('Error encountered during ontology reading.');
      console.log(thePath);
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
    if (this.ontology===null) return;
    this.emit('changeCOMState','busy');
    this.docLabel = docLabel;
    const row = this.listLabels.filter(function(item){
      return item[1]===docLabel;
    });
    this.docType = row[0][0];
    this.tableMeta = ontology2FullObjects(this.ontology[this.docType], this.tableFormat[this.docType]);
    const thePath = '/'+this.config.database+'/_design/viewDocType/_view/view'+this.docLabel;
    this.url.get(thePath).then((res) => {
      this.table = res.data.rows;
      this.docsLists[this.docType] = this.table.map((item)=>{return {name:item.value[0],id:item.id};});
      this.emit('changeTable');
      this.emit('changeCOMState','ok');
    }).catch(()=>{
      console.log('Error encountered: view does not exist.');
      this.table = [];
      this.emit('changeTable');
      this.emit('changeCOMState','fail');
    });
    return;
  }

  getURL(){
    /**
     */
    return {url:this.url, path:'/'+this.config.database+'/'};
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
    }).catch(()=>{
      console.log('readDocument: Error encountered 1: '+thePath);
      this.emit('changeCOMState','fail');
    });
    // if project: also get hierarchy for plotting
    if (this.docType==='project') {
      this.emit('changeCOMState','busy');
      const thePath = '/'+this.config.database+'/_design/viewHierarchy/_view/viewHierarchy?startkey="'+id+'"&endkey="'+id+'zzz"';
      this.url.get(thePath).then((res) => {
        var nativeView = {};
        for (const item of res.data.rows)
          nativeView[item.id] = [item.key].concat( item.value );
        const outString = hierarchy2String(nativeView, true, null, 'none', null);
        this.hierarchy = outString.trim();
        this.emit('changeDoc');
        this.emit('changeCOMState','ok');
      }).catch(()=>{
        console.log('readDocument: Error encountered 2: '+thePath);
        this.emit('changeCOMState','fail');
      });
    }
    return;
  }


  updateDocument(newDoc, normalDoc=true, oldDoc=null) {
    /**Update document on database
     *
     * Args:
     *   newDoc: new document
     *   normalDoc: all documents are normal with the exception of ontology
     */
    this.emit('changeCOMState','busy');
    var docRaw = Object.assign({}, this.docRaw);
    if (oldDoc)                       //edit came from project: e.g. edit step
      docRaw = oldDoc;
    if (normalDoc) {                  //everything but ontology
      Object.assign(docRaw, newDoc);
      docRaw = fillDocBeforeCreate(docRaw, this.docType, docRaw.projectID);
      if ('curate' in docRaw)
        delete docRaw.curate;
    } else {                           //ontology
      docRaw = Object.assign({}, newDoc);
    }
    console.log(docRaw);
    const thePath = '/'+this.config.database+'/'+docRaw._id+'/';
    this.url.put(thePath,docRaw).then((res) => { //res = response
      console.log('Update successful with ...');
      if (!oldDoc) {
        if (normalDoc) {
          this.docRaw.rev=res.data.rev;
          this.docProcessed = doc2SortedDoc( Object.assign({}, this.docRaw), this.tableMeta);
          this.readTable(this.docLabel);
        } else {
          this.initStore(this.docLabel);
        }
      }
      this.emit('changeDoc');
      this.emit('changeCOMState','ok');
    }).catch(()=>{
      console.log('updateDocument: Error encountered: '+thePath);
    });
    return;
  }


  createDocument(doc) {
    /** Create document on database directly or call external command
     */
    this.emit('changeCOMState','busy');
    doc = Object.fromEntries(Object.entries(doc).filter( ([,value]) => {return value!='';} ));  //filter entries which are filled
    if (!(doc.comment)) {doc['comment']='';}
    if ((this.docType==='project' || this.docType==='measurement' || this.docType==='procedure' )&&(!doc.type)) {
      //create via backend
      const thePath = '/'+this.config.database+'/_design/viewDocType/_view/viewProjects';
      this.url.get(thePath).then((res) => {
        var projDoc = res.data.rows[0];
        if (!projDoc || this.docType==='project')
          projDoc={id:'none'};
        executeCmd('_store_be_createDoc',this.callback,projDoc.id, Object.assign(doc,{docType:this.docType}));
      }).catch(()=>{
        console.log('createDocument: Error encountered 1: '+thePath);
      });
    } else {
      //create directly
      var docType = doc.type ? doc.type[0] : this.docType;
      doc = fillDocBeforeCreate(doc, docType, doc.projectID);
      const thePath = '/'+this.config.database+'/';
      this.url.post(thePath,doc).then(() => {
        console.log('Creation successful with ...');
        console.log(doc);
        this.readTable(this.docLabel);
      }).catch(()=>{
        console.log('createDocument: Error encountered 2: '+thePath);
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
  getDocumentRaw(){
    return this.docRaw;
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
  getOntology(){
    if (this.ontology===null || !('_id' in this.ontology))
      return {};
    else
      return Object.assign({},this.ontology);  //return copy, not original
  }
  getDocLabels(){
    if (!this.listLabels)
      return [];
    return this.listLabels.map((item)=> {return item[1];});
  }
  getDocsList(docType){
    if (this.docsLists[docType])
      return this.docsLists[docType];
    return null;
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
      this.updateDocument(action.doc, true, action.oldDoc);
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

  itemDB = ['_id','_rev','user','type','shasum','nextRevision','client','qrCode','curate','date'];
  itemSkip = ['metaUser','metaVendor','image','content','branch','_attachments'];
}

const stateStore = new StateStore();
dispatcher.register(stateStore.handleActions.bind(stateStore));
export default stateStore;
