/* List of details on the right side
*/
import React, { Component } from 'react';         // eslint-disable-line no-unused-vars
import ReactMarkdown from 'react-markdown';       // eslint-disable-line no-unused-vars
import Collapsible from 'react-collapsible';      // eslint-disable-line no-unused-vars
import Store from '../Store';
import * as Actions from '../Actions';

export default class DocDetail extends Component {
  //initialize
  constructor() {
    super();
    this.getDoc = this.getDoc.bind(this);
    this.submit = this.submit.bind(this);
    this.state = {
      doc: Store.getDocument(),
      procedureContent: '',
      //for edit
      displayEdit: 'none',
      skipItems: ['dirName','date','qrCode','image','shasum','nextRevision','curate'],
      tableMeta: null,
      values: null,
      keys: null,
      disableSubmit: false
    };
  }
  componentDidMount() {
    Store.on('changeDoc', this.getDoc);
  }
  componentWillUnmount() {
    Store.removeListener('changeDoc', this.getDoc);
  }

  //Changing state for edit modal
  toggleEdit() {
    if(this.state.displayEdit==='none') {  //toggle towards edit and initialize everything
      const {keysMain, valuesMain, keysDetail, valuesDetail} = this.state.doc;
      if (!keysMain)
      return;
      var tableMeta = Store.getTableMeta();
      var keys = keysMain.concat(keysDetail);
      var values=valuesMain.concat(valuesDetail);
      values = values.filter((item,idx)=>{ return !this.state.skipItems.includes(keys[idx]); });
      values = values.map(item => {
        if (item==='') {return ' ';}  //ensure that all values have at least a space
        return item;
      });
      keys   = keys.filter((item)=>{       return !this.state.skipItems.includes(item); });
      values = values.reduce(function(result, field, index) {
        result[keys[index]] = field;
        return result;
      }, {});
      this.setState({keys:keys, values:values, tableMeta:tableMeta, displayEdit:'block'});
    } else {                              //toggle: close edit
      this.setState({displayEdit: 'none'});
    }
  }
  editChange(event,item){
    var values = this.state.values;
    values[item] = event.target.value;
    this.setState({values: values, disableSubmit: false});
    this.state.tableMeta.map((item)=>{
      if (this.state.values[item.name].length==0 && item.required)
        this.setState({disableSubmit: true});
    });
  }
  submit() {
    Actions.updateDoc(this.state.valuesEdit);
    this.setState({displayEdit: 'none'});
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
    if (docType && docType[0]==='procedure') {  // if procedure
      var idx = doc.keysMain.indexOf('content');
      this.setState({procedureContent: doc.valuesMain[idx]});
      doc.valuesMain[idx] = '(shown above)';
    }
    this.setState({doc: doc});
  }

  /**************************************
   * process data and create html-structure
   * all should return at least <div></div>
   **************************************/
  showSpecial() {
    var docType = null;
    const idxType = this.state.doc.keysDB.indexOf('type');
    if (idxType>-1) {
      docType = this.state.doc.valuesDB[idxType];
    }
    if (docType && docType[0]==='procedure') {
      return <ReactMarkdown source={this.state.procedureContent} />;
    }
    else {
      return <div></div>;
    }
  }

  showMain() {
    const {keysMain, valuesMain} = this.state.doc;
    if (!keysMain) { return <div>Nothing selected</div>; }
    const docItems = keysMain.map( (item,idx) => {
      if (!valuesMain[idx]) {
        return <div key={'M'+idx.toString()}></div>;
      }
      return <div key={'M'+idx.toString()}>{item}: <strong>{valuesMain[idx]}</strong></div>;
    });
    return <Collapsible trigger='Data'>{docItems}</Collapsible>;
  }

  showDetails() {
    const {keysDetail, valuesDetail} = this.state.doc;
    if (!keysDetail) { return <div></div>; }
    const docItems = keysDetail.map( (item,idx) => {
      if (!valuesDetail[idx]) {
        return <div key={'D'+idx.toString()}></div>;
      }
      return <div key={'D'+idx.toString()}>{item}: <strong>{valuesDetail[idx]}</strong></div>;
    });
    return <Collapsible trigger='Details'>{docItems}</Collapsible>;
  }

  showDB() {
    const {keysDB, valuesDB} = this.state.doc;
    if (keysDB.length===1) { return <div></div>;}
    const docItems = keysDB.map( (item,idx) => {
      if (!valuesDB[idx]) {
        return <div key={'B'+idx.toString()}></div>;
      }
      return <div key={'B'+idx.toString()}>{item}: <strong>{valuesDB[idx]}</strong></div>;
    });
    return <Collapsible trigger='Database details'>{docItems}</Collapsible>;
  }

  showImage() { //same as in DocEdit
    const {image} = this.state.doc;
    var width='100%';
    if (this.state.displayEdit=='block')
      width='50%';
    if (!image) { return <div></div>; }
    if (image.substring(0,4)==='<?xm') {
      const base64data = btoa(unescape(encodeURIComponent(image)));
      return (
        <div className='d-flex justify-content-center'>
          <img src={'data:image/svg+xml;base64,'+base64data} width={width} alt='svg-format'></img>
        </div>);
    } else {
      return (
        <div className='d-flex justify-content-center'>
          <img src={image} width={width} alt='base64-format'></img>
        </div>);
    }
  }

  showMetaVendor() {
    const {metaVendor} = this.state.doc;
    if (!metaVendor) { return <div></div>; }
    const docItems = Object.keys(metaVendor).map( item =>{
      return <div key={'metaVendor'+item}>{item}: <strong>{metaVendor[item]}</strong></div>;
    });
    if (this.state.doc.metaVendor) {
      return <Collapsible trigger='Vendor meta data'>{docItems}</Collapsible>;
    }
  }

  showMetaUser() {
    const {metaUser} = this.state.doc;
    if (!metaUser) { return <div></div>; }
    const docItems = Object.keys(metaUser).map( item =>{
      return <div key={'metaUser'+item}>{item}: <strong>{metaUser[item]}</strong></div>;
    });
    if (this.state.doc.metaUser) {
      return <Collapsible trigger='User meta data'>{docItems}</Collapsible>;
    }
  }

  showEditList() {
    // List of form fields: similar to one in docTable.js
    const {keys, values} = this.state;
    if (!keys)
      return <div></div>;
    const names = this.state.tableMeta.map((item)=>{return item.name;});
    const units = this.state.tableMeta.map((item)=>{return item.unit;});
    const required = this.state.tableMeta.map((item)=>{return item.required;});
    const items = keys.map( (item,idx) => {
      const idxTableMeta = names.indexOf(item);
      var text = item+':';
      if (idxTableMeta>-1 && required[idxTableMeta])
        text += '  *';
      var unit = '';
      if (idxTableMeta>-1)
        unit = units[idxTableMeta];
      if (item==='comment') {
        return(
          <div key={idx.toString()} className='container-fluid'>
            <div className='row mt-1'>
              <div className='col-sm-2 px-0' style={{fontSize:14}}>{text}</div>
              <textarea value={values[item]} onChange={e=>this.editChange(e,item)} rows="3" cols="60"/>&nbsp;{unit}
            </div>
          </div>);
      }
      return(
        <div key={idx.toString()} className='container-fluid'>
          <div className='row mt-1'>
            <div className='col-sm-2 px-0' style={{fontSize:14}}>{text}</div>
            <input value={values[item]} onChange={e=>this.editChange(e,item)} size="60"/>&nbsp;{unit}<br/>
          </div>
        </div>);
    });
    return <div>{items}</div>;
  }

  //the render method
  render() {
    return (
      <div>
        <div className="modal" style={{display: this.state.displayEdit}}>
          <div className="modal-content">
            <div  className="col border rounded p-1 p-1">
              {this.showImage()}
              <div className="form-popup m-2" >
                <form className="form-container">
                  {this.showEditList()}
                  <button type='submit' className='btn btn-secondary ml-2' onClick={()=>this.submit()} disabled={this.state.disableSubmit} id='submitBtn'>Submit</button>
                  <button type="button" onClick={() => this.toggleEdit()} className="btn btn-secondary m-2"> Cancel </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div onDoubleClick={() => this.toggleEdit()} className='col border rounded p-1'>
          {this.showSpecial()}
          {this.showImage()}
          {this.showMain()}
          {this.showDetails()}
          {this.showMetaVendor()}
          {this.showMetaUser()}
          {this.showDB()}
        </div>
      </div>
    );
  }
}
