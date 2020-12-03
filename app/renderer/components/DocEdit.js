/* Edit details on the right side: occurs after double click in ItemComponent.js
*/
import React, { Component } from 'react';          // eslint-disable-line no-unused-vars
import { Formik, Form, Field } from 'formik';      // eslint-disable-line no-unused-vars
import * as Actions from '../Actions';
import Store from '../Store';

export default class DocEdit extends Component {
  constructor() {
    super();
    this.submit = this.submit.bind(this);
    this.state = {
      skipItems: ['dirName','date','qrCode','image','shasum','nextRevision'],
      image: null,  //if exists
      keys: null,
      initValues: null
    };
  }
  componentDidMount(){
    const doc = Store.getDocument();
    this.setState({image: doc.image});
    const {keysMain, valuesMain, keysDetail, valuesDetail} = doc;
    var keys = keysMain.concat(keysDetail);
    var values=valuesMain.concat(valuesDetail);
    values = values.filter((item,idx)=>{ return !this.state.skipItems.includes(keys[idx]); });
    values = values.map(item => {
      if (item==='') {return ' ';}
      return item;
    });
    keys   = keys.filter((item)=>{       return !this.state.skipItems.includes(item); });
    this.setState({keys: keys});
    const initValues = values.reduce(function(result, field, index) {
      result[keys[index]] = field;
      return result;
    }, {});
    this.setState({initValues: initValues});
  }

  //actions triggered
  submit(values) {
    Actions.updateDoc(values);
    Actions.toggleRightPane('show');
  }
  toggleShow() {
    Actions.toggleRightPane('show');
  }


  /**************************************
   * process data and create html-table
   * all should return at least <div></div>
   * no changes of state here: this.setState
   **************************************/
  showList() {
    /**
     * List of form fields: similar as in DocNew.js
     */
    const {keys} = this.state;
    const items = keys.map( (item,idx) => {
      if (item==='comment') {
        return(
          <div key={idx.toString()} className='container-fluid'>
            <div className='row mt-1'>
              <div className='col-sm-2 px-0' style={{fontSize:14}}>{item}:</div>
              <Field component="textarea" name={item} rows="3" className='col-sm-10'/>
            </div>
          </div>);
      }
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

  showImage() {  //same as in DocDetail
    const {image} = this.state;
    if (!image) { return <div></div>; }
    if (image.substring(0,4)==='<?xm') {
      const base64data = btoa(unescape(encodeURIComponent(image)));
      return <div><img src={'data:image/svg+xml;base64,'+base64data} width='100%' alt="svg-format"></img></div>;
    } else {
      return <div><img src={image} width='100%' alt='base64-format'></img></div>;
    }
  }


  //the render method
  render() {
    const {keys, initValues} = this.state;
    if (!keys) { return <div>Empty document</div>; }
    return (
      <div  className="col border rounded p-1 p-1">
        {this.showImage()}
        <Formik initialValues={initValues} onSubmit={this.submit}>
          {({ isSubmitting }) => (
            <Form>
              {this.showList()}
              <button type="submit" disabled={isSubmitting} className="btn btn-secondary my-2"> Submit </button>
              <button onClick={this.toggleShow.bind(this)} disabled={isSubmitting} className="btn btn-secondary m-2"> Cancel </button>
            </Form>
          )}
        </Formik>
      </div>
    );
  }
}
