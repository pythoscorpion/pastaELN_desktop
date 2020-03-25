/* List of details on the right side
*/
import React, { Component } from 'react';
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
      hierarchy: null
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
    this.setState({doc: Store.getDocument()}); 
  }
  getHierarchy(){
    this.setState({hierarchy: Store.getHierarchy()});
  }

  /**************************************
   * process data and create html-table
   * all should return at least <div></div>
   **************************************/
  showHierarchy = function(){
    var docType = null;
    const idxType = this.state.doc.keysDB.indexOf('type');
    if (idxType>-1) {
      docType = this.state.doc.valuesDB[idxType];
    }
    if (docType==='project' && this.state.hierarchy) {
      return <Collapsible trigger="Hierarchy"><pre>{this.state.hierarchy}</pre></Collapsible>
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

  showImage = function (){
    const {image} = this.state.doc;
    if (!image) { return <div></div>; }
    if (image.substring(0,4)==="<?xm") {
      const base64data = btoa(unescape(encodeURIComponent(image)));          
      return <div><img src={'data:image/svg+xml;base64,'+base64data} width='100%' alt="svg-format"></img></div>
    } else {
      return <div><img src={image} width='100%' alt='base64-format'></img></div>
    }
  };
    
  showMeta = function (){
    const {meta} = this.state.doc;
    if (!meta) { return <div></div>; }
    const docItems = Object.keys(meta).map( item =>{
      return <div key={'meta'+item}>{item}: <strong>{meta[item]}</strong></div>
    });
    if (this.state.doc.meta) {
      return <Collapsible trigger="Meta data">{docItems}</Collapsible>
    }
  };


  //the render method
  render() {
    return (
        <div onDoubleClick={this.toggleEdit.bind(this)} className="col border rounded p-1">
          {this.showMain()}
          {this.showHierarchy()}
          {this.showImage()}
          {this.showDetails()}
          {this.showMeta()}
          {this.showDB()}
        </div>
    )
  }
}
