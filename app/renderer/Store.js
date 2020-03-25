/* Central storage class
 - during usage of new Route in App.js:
   a new store, etc is created/deleted for each doc-type: measurements,...
 - all REST request are handled here
 - all data cleaning is handled here
 - none of the variables are directly accessed
 - this is a normal js-code (not React-Component): no this.setstate, etc.

 - Note: axios("localhost:8888") does not work, since different port
   in package.json add proxy and then just specify the end of the requesting string here
   https://create-react-app.dev/docs/proxying-api-requests-in-development/
*/
import { EventEmitter } from "events";
import axios from 'axios';
import dispatcher from "./dispatcher";
import {fillDocBeforeCreate, dataDictionary2DataLabels, dataDictionary2ObjectOfLists,
        projectDocs2String, doc2SortedDoc} from "./commonTools";
import {myURL} from "./definitions";

class StateStore extends EventEmitter {
  //Initialize
  constructor() {
    super()
    this.state = 0;         //on right side of display: [0]: show details; 1: edit details; 2: new details
    this.docType = null;
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
    }
    this.hierarchy = null;
  }

  /**Retrieve data from document server: internal functions
   * also clean data here, before this.emit
   * names according to CURD: Create,Update,Read,Delete
   */
  readTable(docLabel) {  
    /**Function that is called first: table is always read first.
     * Used to initialize: docLabel, docType, tableMeta
    */
    this.docLabel = docLabel; 
    if (this.docType===null) {
      this.initStore(docLabel);
    }
    var thePath = myURL+'/agile_science/_design/view'+this.docLabel+'/_view/view'+this.docLabel;
    axios(thePath).then((res) => {
      this.table = res.data.rows;
      // console.log("End table");
      // console.log(this.table);
      this.emit("changeTable");});
    return;
  }

  initStore(docLabel) {
    const thePath = myURL+'/agile_science/-dataDictionary-';
    axios(thePath).then((res) => {
      const objLabel = dataDictionary2DataLabels(res.data);
      const listLabels = objLabel.hierarchyList.concat(objLabel.dataList);
      const row = listLabels.filter(function(item){return item[1]===docLabel});
      this.docType = row[0][0];
      this.tableMeta = dataDictionary2ObjectOfLists(res.data[this.docType][0][docLabel]);
      // console.log("End initStore: "+this.docType+" "+this.docLabel);
      // console.log(this.tableMeta);
      this.emit("changeTable");
    });
    return;
  }

  readDocument(id) {
    const thePath = myURL+'/agile_science/'+id;
    axios(thePath).then((res) => {
      this.docOld = JSON.parse(JSON.stringify(res.data));
      this.doc = doc2SortedDoc(res.data, this.tableMeta);
      // console.log("After sorting document");
      // console.log(this.doc);
      this.emit("changeDoc");
    });
    // if project: also get hierarchy for plotting
    if (this.docType==='project') {
      const thePath = myURL+'/agile_science/_design/viewHierarchy/_view/viewHierarchy?key="'+id+'"';
      axios(thePath).then((res) => {
        var nativeView = {};
        for (const key of res.data.rows) {
          nativeView[key.id] = key.value;
        }
        this.hierarchy = projectDocs2String(nativeView, id,0);
        this.emit("changeDoc");
      });
    }
    return;
  }

  updateDocument(newDoc) {
    Object.assign(this.docOld, newDoc);
    this.docOld = fillDocBeforeCreate(this.docOld, this.docType, this.docOld.projectID);
    const thePath = myURL+'/agile_science/'+this.docOld._id+"/";
    axios.put(thePath,this.docOld).then((res) => {
      console.log("Update successful with ...");   //TODO: update local table upon change, or reread from server
      console.log(this.docOld);
    });
    return;
  }

  createDocument(doc) {
    if (!(doc.comment)) {doc['comment']='';}
    doc = fillDocBeforeCreate(doc, this.docType, doc.projectID);
    const thePath = myURL+'/agile_science/';
    axios.post(thePath,doc).then((res) => {
      console.log("Creation successful with ..."); //TODO: update local table upon change, or reread from server
    });
    return;
  }


  //get information to components
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

  //connect actions to retrieve functions
  //names according to CURD: Create,Update,Read,Delete
  handleActions(action) {
    switch(action.type) {
      case "READ_TABLE": {
        this.readTable(action.docLabel);
        //this.emit("change");
        break;
      }
      case "READ_DOC": {
        this.readDocument(action.id);
        break;
      }
      case "UPDATE_DOC": {
        this.updateDocument(action.doc);
        break;
      }
      case "CREATE_DOC": {
        this.createDocument(action.doc);
        break;
      }
      case "TOGGLE_EDIT": {
        this.state = 1;
        this.emit("toggleState");
        break;
      }
      case "TOGGLE_NEW": {
        this.state = 2;
        this.emit("toggleState");
        break;
      }
      case "TOGGLE_SHOW": {
        this.state = 0;
        this.emit("toggleState");
        break;
      }
      default:
        break;
    }
  }
}


const stateStore = new StateStore();
dispatcher.register(stateStore.handleActions.bind(stateStore));
export default stateStore;
