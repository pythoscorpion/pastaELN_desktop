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
  hierarchy2String} from './commonTools';
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
    this.extractors = null;
    // document and table items
    this.docType = null;    //straight doctype: e.g. project
    // document items
    this.docRaw  = {};
    this.hierarchy = null;
    // table items
    this.table = null;      //table data
    this.tableMeta = null;  //table meta-data: column information
    this.docsLists = {};
  }


  initStore() {
    /**Function that is called first from App.js
     * get configuration and ontology
     * use ontology to create list of docTypes
    */
    const res = getCredentials();
    this.config     = res['credentials'];
    this.tableFormat= res['configuration']['-tableFormat-'];
    this.extractors = res['configuration']['-extractors-'];
    if (this.config===null || this.config.database==='' || this.config.user===''|| this.config.password==='') //if credentials not set
      return;
    this.url = axios.create({
      baseURL: this.config.url,
      auth: {username: this.config.user.trim(), password: this.config.password.trim()}
    });
    //get table header from ontology, which is stored in database
    var thePath = '/'+this.config.database+'/-ontology-';
    this.url.get(thePath).then((res) => {
      this.ontology = res.data;
      const objLabel = ontology2Labels(this.ontology,this.tableFormat);
      this.listLabels = objLabel.hierarchyList.concat(objLabel.dataList);
      this.emit('initStore');
      this.emit('changeCOMState','ok');
      console.log('success reading first entry (ontology) from database.');
    }).catch((error)=>{
      console.log('Error encountered during ontology reading.');
      //if ontology error remains: no ontology, then create empty ontology in database here
      console.log(thePath);
      this.emit('changeCOMState','fail');
      throw(error);
    });
  }


  /**Retrieve data from document server: internal functions
   * names according to CURD: Create,Update,Read,Delete
   */
  readTable(docType){
    /** get table content
     * initialize tableMeta
     */
    if (!docType)
      docType=this.docType;
    this.docType = docType;
    if (this.ontology===null) return;
    this.emit('changeCOMState','busy');
    this.tableMeta = ontology2FullObjects(this.ontology[this.docType], this.tableFormat[this.docType]);
    const thePath = '/'+this.config.database+'/_design/viewDocType/_view/'+this.docType;
    this.url.get(thePath).then((res) => {
      this.table = res.data.rows;
      this.docsLists[this.docType] = this.table.map((item)=>{return {name:item.value[0],id:item.id};});
      this.emit('changeTable');
      this.emit('changeCOMState','ok');
    }).catch((error)=>{
      console.log('Error encountered: view does not exist. '+thePath);
      //Views could be created here but the partly complicated js-code-creation code is in the python backend
      //if views are created here, then the js-code-creation has to move to commonTools
      // const thePath = '/'+this.config.database+'/_design/viewDocType';
      // const doc = '{"views":{'+this.docType+'":{"map":"function(doc) {if(doc.date && doc.title){emit(doc.date, doc.title);}}"}}}';//todo this line has to change
      // this.url.put(thePath,doc).then((res) => { //res = response
      //   console.log('Creation of design document successful');
      // }).catch(()=>{
      //   console.log('**ERROR** Creation of design document failure');
      // });
      this.table = [];
      this.emit('changeTable');
      this.emit('changeCOMState','fail');
      throw(error);
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
      this.emit('changeDoc');
      this.emit('changeCOMState','ok');
    }).catch((error)=>{
      console.log('readDocument: Error encountered 1: '+thePath);
      this.emit('changeCOMState','fail');
      throw(error);
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
      }).catch((error)=>{
        console.log('readDocument: Error encountered 2: '+thePath);
        this.emit('changeCOMState','fail');
        throw(error);
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
      docRaw = fillDocBeforeCreate(docRaw, this.docType);
      docRaw['curated'] = true;
    } else {                           //ontology
      docRaw = Object.assign({}, newDoc);
    }
    const thePath = '/'+this.config.database+'/'+docRaw._id+'/';
    this.url.put(thePath,docRaw).then((res) => { //res = response
      console.log('Update successful with ...');
      if (!oldDoc) {
        if (normalDoc) {
          this.docRaw.rev=res.data.rev;
          this.readTable(this.docType);
        } else {
          this.initStore(this.docType);
        }
      }
      this.emit('changeDoc');
      this.emit('changeCOMState','ok');
    }).catch((error)=>{
      console.log('updateDocument: Error encountered: '+thePath);
      throw(error);
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
      const thePath = '/'+this.config.database+'/_design/viewDocType/_view/project';
      this.url.get(thePath).then((res) => {
        var projDoc = res.data.rows[0];
        if (!projDoc || this.docType==='project')
          projDoc={id:'none'};
        executeCmd('_store_be_createDoc',this.callback,projDoc.id, Object.assign(doc,{docType:this.docType}));
      }).catch((error)=>{
        console.log('createDocument: Error encountered 1: '+thePath);
        throw(error);
      });
    } else {
      //create directly
      var docType = doc.type ? doc.type[0] : this.docType;
      doc = fillDocBeforeCreate(doc, docType);
      const thePath = '/'+this.config.database+'/';
      this.url.post(thePath,doc).then(() => {
        console.log('Creation successful with ...');
        console.log(doc);
        this.readTable(this.docType);
      }).catch((error)=>{
        console.log('createDocument: Error encountered 2: '+thePath);
        throw(error);
      });
      this.emit('changeCOMState','ok');
    }
    return;
  }
  callback(content){
    if (content.indexOf('SUCCESS')>-1) {
      this.readTable(this.docType);
    }
  }


  //get information from here to components
  getTable(docType){
    if (!this.table) this.readTable(docType);
    return this.table;
  }
  getDocumentRaw(){
    return this.docRaw;
  }
  getHierarchy(){
    return this.hierarchy;
  }
  getTableMeta(docType=null){
    if (docType)
      return ontology2FullObjects(this.ontology[docType], this.tableFormat[docType]);
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
  getDocTypeLabels(){  //pairs of docType,docLabel
    if (!this.listLabels)
      return [];
    return this.listLabels;
  }
  getDocsList(docType){   //docIDs of different types: needed for links,
    if (this.docsLists[docType])
      return this.docsLists[docType];
    return null;
  }
  getSubtypes(docType){  //given a doctype... return all those that are children
    const filtered = Object.keys(this.ontology).filter(i=>{return i.indexOf(docType)==0});
    return filtered;
  }

  getExtractors(){
    if (!this.extractors)
      return [];
    const docTypeString = this.docRaw.type.slice(0,3).join('/');  //first three items determine docType
    const filtered = Object.keys(this.extractors)
      .filter(key => key.indexOf(docTypeString)==0)
      .reduce((obj, key) => {
        obj[key] = this.extractors[key];
        return obj;}, {});
    return filtered;
  }

  //connect actions to retrieve functions
  //names according to CURD: Create,Update,Read,Delete
  handleActions(action) {
    switch(action.type) {
    case 'READ_TABLE': {
      this.readTable(action.docType);
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
    case 'UPDATE_EXTRACTORS': {
      const res = getCredentials();
      this.extractors = res['configuration']['-extractors-'];
      break;
    }
    default: {
      break;
    }
    }
  }

  itemDB = ['_id','_rev','user','type','shasum','nextRevision','client','qrCode','curated','date'];
  itemSkip = ['metaUser','metaVendor','image','content','branch','_attachments'];
}

const stateStore = new StateStore();
dispatcher.register(stateStore.handleActions.bind(stateStore));
export default stateStore;
