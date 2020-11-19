/* List of details on the right side
*/
import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown'
import Collapsible from 'react-collapsible';
import * as Actions from "../Actions";
import Store from "../Store";

export default class DocDetail extends Component {
  //initialize
  constructor() {
    super();
    this.getDoc       = this.getDoc.bind(this);
    this.getHierarchy = this.getHierarchy.bind(this);
    this.state = {
      doc: Store.getDocument(),
      hierarchy: null,
      procedureContent: ''
    };
  }
  componentDidMount() {
    Store.on("changeDoc", this.getDoc);
    Store.on("changeDoc", this.getHierarchy);
  }
  componentWillUnmount() {
    Store.removeListener("changeDoc", this.getDoc);
    Store.removeListener("changeDoc", this.getHierarchy);
  }


  //actions triggered
  toggleEdit() {
    Actions.toggleEdit();
  }


  //get information from store and push information to actions
  getDoc() {
    var doc = Store.getDocument();
    //if procedure, start converting to md and store in state
    var docType = [null];
    const idxType = doc.keysDB.indexOf('type');
    if (idxType>-1) {
      docType = doc.valuesDB[idxType];
    }
    if (docType && docType[0]==='procedure') {
      var idx = doc.keysMain.indexOf('content');
      this.setState({procedureContent: doc.valuesMain[idx]});
      doc.valuesMain[idx] = "(shown above)";
      idx = doc.keysMain.indexOf('name');
      const fileName = doc.valuesMain[idx];
      if (fileName.endsWith('.org')) {
        const unified = require("unified");
        const parse = require("orga-unified");
        const orgaToRemark = require("orga-remark");
        const stringify = require("mdx-stringify");
        (async () => {
          const md = await unified()
          .use(parse)
          .use(orgaToRemark)
          .use(stringify)
          .process(this.state.procedureContent);
          this.setState({procedureContent: md.contents});
        })();
      }
    }
    this.setState({doc: doc});
  }
  getHierarchy(){
    this.setState({hierarchy: Store.getHierarchy()});
  }

  /**************************************
   * process data and create html-structure
   * all should return at least <div></div>
   **************************************/
  showSpecial = function(){
    var docType = null;
    const idxType = this.state.doc.keysDB.indexOf('type');
    if (idxType>-1) {
      docType = this.state.doc.valuesDB[idxType];
    }
    if (docType[1]==='project' && this.state.hierarchy) {
      return <Collapsible trigger="Hierarchy"><pre>{this.state.hierarchy}</pre></Collapsible>
    }
    if (docType && docType[0]==='procedure') {
      return <ReactMarkdown source={this.state.procedureContent} />
    }
    else {
      return <div></div>
    }
  }

  showMain = function(){
    const {keysMain, valuesMain} = this.state.doc;
    if (!keysMain) { return <div>Nothing selected</div>; }
    const docItems = keysMain.map( (item,idx) => {
      if (!valuesMain[idx]) {
        return <div key={'M'+idx.toString()}></div>
      }
      return <div key={'M'+idx.toString()}>{item}: <strong>{valuesMain[idx]}</strong></div>
    });
    return <Collapsible trigger="Data">{docItems}</Collapsible>
  }

  showDetails = function(){
    const {keysDetail, valuesDetail} = this.state.doc;
    if (!keysDetail) { return <div></div>; }
    const docItems = keysDetail.map( (item,idx) => {
      if (!valuesDetail[idx]) {
        return <div key={'D'+idx.toString()}></div>
      }
      return <div key={'D'+idx.toString()}>{item}: <strong>{valuesDetail[idx]}</strong></div>
    });
    return <Collapsible trigger="Details">{docItems}</Collapsible>
  }

  showDB = function(){
    const {keysDB, valuesDB} = this.state.doc;
    if (keysDB.length===1) { return <div></div>;}
    const docItems = keysDB.map( (item,idx) => {
      if (!valuesDB[idx]) {
        return <div key={'B'+idx.toString()}></div>
      }
      return <div key={'B'+idx.toString()}>{item}: <strong>{valuesDB[idx]}</strong></div>
    });
    return <Collapsible trigger="Database details">{docItems}</Collapsible>
  }

  showImage = function (){ //same as in DocEdit
    const {image} = this.state.doc;
    if (!image) { return <div></div>; }
    if (image.substring(0,4)==="<?xm") {
      const base64data = btoa(unescape(encodeURIComponent(image)));
      return <div><img src={'data:image/svg+xml;base64,'+base64data} width='100%' alt="svg-format"></img></div>
    } else {
      return <div><img src={image} width='100%' alt='base64-format'></img></div>
    }
  };

  showMetaVendor = function (){
    const {metaVendor} = this.state.doc;
    if (!metaVendor) { return <div></div>; }
    const docItems = Object.keys(metaVendor).map( item =>{
      return <div key={'metaVendor'+item}>{item}: <strong>{metaVendor[item]}</strong></div>
    });
    if (this.state.doc.metaVendor) {
      return <Collapsible trigger="Vendor meta data">{docItems}</Collapsible>
    }
  };

  showMetaUser = function (){
    const {metaUser} = this.state.doc;
    if (!metaUser) { return <div></div>; }
    const docItems = Object.keys(metaUser).map( item =>{
      return <div key={'metaUser'+item}>{item}: <strong>{metaUser[item]}</strong></div>
    });
    if (this.state.doc.metaUser) {
      return <Collapsible trigger="User meta data">{docItems}</Collapsible>
    }
  };


  //the render method
  render() {
    return (
        <div onDoubleClick={this.toggleEdit.bind(this)} className="col border rounded p-1">
          {this.showSpecial()}
          {this.showImage()}
          {this.showMain()}
          {this.showDetails()}
          {this.showMetaVendor()}
          {this.showMetaUser()}
          {this.showDB()}
        </div>
    )
  }
}
