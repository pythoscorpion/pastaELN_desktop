/* List of details on the right side
*/
import React, { Component } from 'react';         // eslint-disable-line no-unused-vars
import ReactMarkdown from 'react-markdown';       // eslint-disable-line no-unused-vars
import Collapsible from 'react-collapsible';      // eslint-disable-line no-unused-vars
import { Formik, Form, Field } from 'formik';     // eslint-disable-line no-unused-vars
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
      keysEdit: null,
      initValuesEdit: null
    };
  }
  componentDidMount() {
    Store.on('changeDoc', this.getDoc);
  }
  componentWillUnmount() {
    Store.removeListener('changeDoc', this.getDoc);
  }

  //actions triggered
  toggleEdit() {
    if(this.state.displayEdit==='none') {  //toggle towards edit
      const {keysMain, valuesMain, keysDetail, valuesDetail} = this.state.doc;
      if (!keysMain)
        return;
      var keysEdit = keysMain.concat(keysDetail);
      var valuesEdit=valuesMain.concat(valuesDetail);
      valuesEdit = valuesEdit.filter((item,idx)=>{ return !this.state.skipItems.includes(keysEdit[idx]); });
      valuesEdit = valuesEdit.map(item => {
        if (item==='') {return ' ';}
        return item;
      });
      keysEdit   = keysEdit.filter((item)=>{       return !this.state.skipItems.includes(item); });
      const initValuesEdit = valuesEdit.reduce(function(result, field, index) {
        result[keysEdit[index]] = field;
        return result;
      }, {});
      this.setState({keysEdit:keysEdit, initValuesEdit:initValuesEdit, displayEdit:'block'});
    } else {                              //toggle: close edit
      this.setState({displayEdit: 'none'});
    }
  }
  submit(values) {
    Actions.updateDoc(values);
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
    // if procedure
    if (docType && docType[0]==='procedure') {
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
      return <div className='d-flex justify-content-center'><img src={'data:image/svg+xml;base64,'+base64data} width={width} alt='svg-format'></img></div>;
    } else {
      return <div className='d-flex justify-content-center'><img src={image} width={width} alt='base64-format'></img></div>;
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
    if (!this.state.keysEdit)
      return <div></div>;
    const items = this.state.keysEdit.map( (item,idx) => {
      if (item==='comment') {
        return(
          <div key={idx.toString()} className='container-fluid'>
            <div className='row mt-1'>
              <div className='col-sm-2 px-0' style={{fontSize:14}}>{item}:</div>
              <Field component="textarea" name={item} rows="3" className='col-sm-10'/>
            </div>
          </div>);
      }  //TODO SB P1 warning in input fields as its initial value is unset and the enableReinitialized
      return(
        <div key={idx.toString()} className='container-fluid'>
          <div className='row mt-1'>
            <div className='col-sm-2 px-0' style={{fontSize:14}}>{item}:</div>
            <Field as="input" name={item} className='col-sm-10'/>
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
              <Formik initialValues={this.state.initValuesEdit} onSubmit={this.submit} enableReinitialize>
                <Form>
                  {this.showEditList()}
                  <button type="submit" className="btn btn-secondary my-2"> Submit </button>
                  <button type="button" onClick={() => this.toggleEdit()} className="btn btn-secondary m-2"> Cancel </button>
                </Form>
              </Formik>
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
