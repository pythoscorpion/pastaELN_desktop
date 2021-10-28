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
import {fillDocBeforeCreate, ontology2Labels, hierarchy2String} from './commonTools';
import {getCredentials, executeCmd} from './localInteraction';

class StateStore extends EventEmitter {
  //Initialize
  constructor() {
    super();
    this.callback     = this.callback.bind(this);
    this.logging      = '';
    // configuration
    this.url       = null;
    this.credentials = null;
    this.ontology = null;
    this.listLabels = null;
    this.config = null;
    this.hierarchyOrder = null;  //order of hierarchy: project,steps,...
    // document and table items
    this.docType = null;    //straight doctype: e.g. project
    // document items
    this.docRaw  = {};
    this.hierarchy = null;  //hierarchy of this document
    // table items
    this.table = null;      //table data
    this.ontologyNode = null;  //ontology node: column information, long description, unit,...
    this.docsLists = {};
    //items show in docDetails under database; remainder in details
    this.itemDB = ['_id','_rev','-user','-type','shasum','nextRevision','-client','curated','-date'];
    //items not shown because they are no strings, or long (content)
    this.itemSkip = ['metaUser','metaVendor','image','content','-branch','_attachments'];
  }

  initStore() {
    /**
     * Function that is called first from App.js
     * get configuration and ontology
     * use ontology to create list of docTypes
     */
    const res = getCredentials();
    if (!res || !res['configuration'])
      return;
    this.credentials     = res['credentials'];
    this.config = res['configuration'];
    // this.usedID     = res['configuration']['-userID'];
    if (this.credentials===null || this.credentials.database==='' ||
        this.credentials.user===''|| this.credentials.password==='') //if credentials not set
      return;
    this.url = axios.create({
      baseURL: this.credentials.url,
      auth: {username: this.credentials.user.trim(), password: this.credentials.password.trim()}
    });
    //get table header from ontology, which is stored in database
    var thePath = '/'+this.credentials.database+'/-ontology-';
    this.url.get(thePath).then((res) => {
      this.ontology = res.data;
      const objLabel = ontology2Labels(this.ontology);
      this.listLabels = objLabel.hierarchyList.concat(objLabel.dataList);
      this.listLabels.map(item=>{
        this.readTable(item[0], false);
      });
      this.hierarchyOrder = objLabel['hierarchyOrder'];
      this.emit('initStore');
      this.emit('changeCOMState','ok');
      console.log('success reading first entry (ontology) from database.');
    }).catch((error)=>{
      //if ontology error remains: no ontology, then create empty ontology in database here
      console.log('Error encountered during ontology reading. '+thePath);
      this.logging += 'Error encountered during ontology reading. '+thePath+'\n';
      this.emit('changeCOMState','fail');
      throw(error);
    });
  }

  getURL(){
    /**
      send http client object (axios) to other classes
     */
    if (!this.credentials)
      return {};
    return {url:this.url, path:'/'+this.credentials.database+'/'};
  }


  // ** Retrieve data from document server: internal functions ** //
  // ** names according to CURD: Create,Update,Read,Delete ** //
  readTable(docType, setThis=true){
    /**
     * get table content for this doctype
     * initialize ontologyNode (labeling of columns, ...)
     *
     * Args:
     *   docType: document type: i.e. 'x/project'
     *   setThis: store this docType as this.property
     */
    if (!docType)
      docType=this.docType;
    if (setThis)
      this.docType = docType;
    if (this.ontology===null)
      return;
    this.emit('changeCOMState','busy');
    this.ontologyNode = this.ontology[docType];
    const viewName= (docType.substring(0,2)=='x/') ?
                    docType.substring(2).replace('/','__') :
                    docType.replace('/','__');
    const thePath = '/'+this.credentials.database+'/_design/viewDocType/_view/'+viewName;
    this.url.get(thePath).then((res) => {
      this.table = res.data.rows;
      this.docsLists[docType] = this.table.map((item)=>{return {name:item.value[0],id:item.id};});
      if (setThis) {
        this.emit('changeTable');
        this.emit('changeCOMState','ok');
      }
    }).catch((error)=>{
      console.log('Error '+error.response.status+' encountered: view does not exist. '+thePath);
      this.logging += 'Error encountered: view does not exist.';
      this.logging += thePath+'\n  =>Click "Test Backend / Create View" ';
      //Views could be created here but the partly complicated js-code-creation code is in the python backend
      //if views are created here, then the js-code-creation has to move to commonTools
      // const thePath = '/'+this.credentials.database+'/_design/viewDocType';
      // const doc = '{"views":{'+this.docType+'":{"map":"function(doc)
      //   {if(doc['-date'] && doc.title){emit(doc['-date'], doc.title);}}"}}}';//todo this line has to change
      // this.url.put(thePath,doc).then((res) => { //res = response
      //   console.log('Creation of design document successful');
      // }).catch(()=>{
      //   console.log('**ERROR** Creation of design document failure');
      // });
      this.table = [];
      this.emit('changeTable');
      this.emit('changeCOMState','fail');
      // don't keey "throw(error);" as it would not stop the error
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
      this.emit('changeCOMState','ok');
      return;
    }
    this.emit('changeCOMState','busy');
    const thePath = '/'+this.credentials.database+'/'+id;
    this.url.get(thePath).then((res) => {
      this.docRaw = JSON.parse(JSON.stringify(res.data));
      this.emit('changeDoc');
      this.emit('changeCOMState','ok');
    }).catch((error)=>{
      console.log('readDocument - Error 1: '+thePath);
      this.logging += 'readDocument - Error 1: '+thePath+'\n';
      this.emit('changeCOMState','fail');
      throw(error);
    });
    // if project: also get hierarchy for plotting
    if (this.docType==='x/project') {
      this.emit('changeCOMState','busy');
      const thePath = '/'+this.credentials.database+'/_design/viewHierarchy/_view/viewHierarchy?startkey="'
                      +id+'"&endkey="'+id+'zzz"';
      this.url.get(thePath).then((res) => {
        var nativeView = {};
        res.data.rows.map((item)=>{
          nativeView[item.id] = [item.key].concat( item.value );
        });
        const outString = hierarchy2String(nativeView, true, null, 'none', null);
        this.hierarchy = outString.trim();
        this.emit('changeDoc');
        this.emit('changeCOMState','ok');
      }).catch((error)=>{
        console.log('readDocument: Error encountered 2: '+thePath);
        this.logging += 'readDocument: Error encountered 2: '+thePath+'\n';
        this.emit('changeCOMState','fail');
        throw(error);
      });
    }
    return;
  }

  updateDocument(newDoc, normalDoc=true, oldDoc=null) {
    /**
     * Update document on database
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
      docRaw['user']  = this.config['-userID'];
      docRaw['client']  = 'js updateDocument ';
    } else {                           //ontology
      docRaw = Object.assign({}, newDoc);
    }
    const thePath = '/'+this.credentials.database+'/'+docRaw._id+'/';
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
      this.logging += 'updateDocument: Error encountered: '+thePath+'\n';
      throw(error);
    });
    return;
  }

  createDocument(doc) {
    /** Create document on database directly or call external command pastaDB.py */
    this.emit('changeCOMState','busy');
    doc = Object.fromEntries(Object.entries(doc).filter( ([,value]) => {return value!='';} ));  //filter entries which are filled
    if (!(doc.comment))
      doc['comment']='';
    if (doc._project) {
      doc['branch'] = [{child:9999, path:null, stack:[doc._project]}];
      delete doc['_project'];
    }

    if ((this.docType==='x/project'||this.name.indexOf('/')>0)&&(!doc['-type'])) {
      //create via backend
      // this is the safe path that should always work but is slower
      console.log('create doc via backend',doc);
      const projDoc={id:'none'};
      executeCmd('_store_be_createDoc',this.callback,projDoc.id,Object.assign(doc,{docType:this.docType}));
    } else {
      //create directly
      console.log('create doc directly',doc);
      doc['user']  = this.config['-userID'];
      doc['client']  = 'js createDocument '+JSON.stringify(doc);
      var docType = doc['-type'] ? doc['-type'][0] : this.docType;
      doc = fillDocBeforeCreate(doc, docType);
      const thePath = '/'+this.credentials.database+'/';
      this.url.post(thePath,doc).then(() => {
        console.log('Creation successful with ...');
        console.log(doc);
        this.readTable(this.docType);
      }).catch((error)=>{
        console.log('createDocument: Error encountered 2: '+thePath);
        this.logging += 'createDocument: Error encountered 2: '+thePath+'\n';
        throw(error);
      });
      this.emit('changeCOMState','ok');
    }
    return;
  }

  deleteDoc(){
    /** Temporary function to allow test-usage: remove documents */
    const thePath = '/'+this.credentials.database+'/'+this.docRaw._id+'/?rev='+this.docRaw._rev;
    this.url.delete(thePath).then(()=>{
      console.log('Delete success!');
      this.readTable(this.docType);
    }).catch((error)=>{
      console.log(error);
    });
  }

  callback(content){
    /** Callback function for backend pastaDB.py: re-read new data from database */
    if (content.indexOf('SUCCESS')>-1) {
      this.readTable(this.docType);
    }
  }


  //===================================================================
  //send information to other components
  getTable(docType){
    /** Table of documents */
    if (!this.table || docType!=this.docType)
      this.readTable(docType, true);
    return this.table;
  }
  getDocumentRaw(){
    /** One document */
    return this.docRaw;
  }
  getHierarchy(){
    /** Hierarchy in project, if doc is a project */
    return this.hierarchy;
  }

  getCredentials(){
    /** User credentials, server, database on server */
    return this.credentials;
  }
  getConfiguration(){
    /** Configuration: table format */
    return this.config;
  }
  getOntology(){
    /** Entire ontology */
    if (this.ontology===null || !('_id' in this.ontology))
      return {};
    else
      return Object.assign({},this.ontology);  //return copy, not original
  }
  getOntologyNode(docType=null){
    /** get ontology of doctype: long description, required,... */
    if (docType)
      return this.ontology[docType];
    if (this.docRaw['-type'] && this.docRaw['-type'].join('/') in this.ontology)
      return this.ontology[this.docRaw['-type'].join('/')];
    return this.ontologyNode;
  }
  getHierarchyOrder(){
    /** get hierarchy order: project,step,task */
    return this.hierarchyOrder;
  }

  getDocTypeLabels(){
    /** Pairs of docType,docLabel*/
    if (!this.listLabels)
      return [];
    return this.listLabels;
  }
  getDocType(){
    /** Get doctype */
    if (this.docRaw['-type'] && this.docRaw['-type'].join('/') in this.ontology)
      return this.docRaw['-type'].join('/');
    return this.docType;
  }
  getDocsList(docType){
    /** docIDs of docType: e.g. all the docIds of projects, .. */
    if (this.docsLists[docType])
      return this.docsLists[docType];
    return null;
  }
  getSubtypes(docType){
    /** given a doctype... return all those that are children */
    const filtered = Object.keys(this.ontology).filter(i=>{return i.indexOf(docType)==0;});
    return filtered;
  }

  getExtractors(){
    /** return list of all extractors for measurements */
    if (!this.config['-extractors-'])
      return [];
    const docTypeString = this.docRaw['-type'].slice(0,3).join('/');  //first three items determine docType
    const filtered = Object.keys(this.config['-extractors-'])
      .filter(key => key.indexOf(docTypeString)==0)
      .reduce((obj, key) => {
        obj[key] = this.config['-extractors-'][key];
        return obj;}, {});
    return filtered;
  }

  getLog(){
    /** return collected logging messages */
    return this.logging;
  }


  //===================================================================
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
      this.config['-extractors-'] = res['configuration'] ? res['configuration']['-extractors-'] : [];
      break;
    }
    case 'EMPTY_LOGGING': {
      this.logging = '';
      break;
    }
    case 'APPEND_LOGGING': {
      this.logging += action.logging+'\n';
      break;
    }
    default: {
      break;
    }
    }
  }
}

const store = new StateStore();
dispatcher.register(store.handleActions.bind(store));
export default store;
