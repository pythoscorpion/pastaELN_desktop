/* Edit details on the right side: occurs after double click in ItemComponent.js
*/
import React, { Component } from 'react'
import { Formik, Form, Field } from 'formik';
import * as Actions from "../Actions";
import Store from "../Store";

export default class DocEdit extends Component {
  constructor() {
    super();
    this.submit = this.submit.bind(this);
    this.state = {
      skipItems: ['dirName','date','qrCode','image','md5sum','nextRevision'],
      keys: null,
      initValues: null
    }
  }
  componentDidMount(){
    const doc = Store.getDocument();
    const {keysMain, valuesMain, keysDetail, valuesDetail} = doc;
    var keys = keysMain.concat(keysDetail);
    var values=valuesMain.concat(valuesDetail);
    values = values.filter((item,idx)=>{ return !this.state.skipItems.includes(keys[idx]) });
    values = values.map(item => {
      if (item==='') {return ' ';}
      return item;
    });
    keys   = keys.filter((item)=>{       return !this.state.skipItems.includes(item) });
    this.setState({keys: keys});
    const initValues = values.reduce(function(result, field, index) {
      result[keys[index]] = field;
      return result;
    }, {})
    this.setState({initValues: initValues});
  }

  //actions triggered
  submit(values) {
    console.log("entered values");
    console.log(values);
    Actions.updateDoc(values);
    Actions.toggleShow();
  }


  /**************************************
   * process data and create html-table
   * all should return at least <div></div>
   * no changes of state here: this.setState
   **************************************/
  showList = function(){
    /**
     * List of form fields: similar as in DocNew.js
     */
    const {keys} = this.state;
    const items = keys.map( (item,idx) => {
      if (item==='comment') {
        return <div key={idx.toString()} className='container-fluid'>
                <div className='row mt-1'>
                  <div className='col-sm-4 px-0' style={{fontSize:14}}>{item}:</div>
                  <Field component="textarea" name={item} rows="3" className='col-sm-8'/>
                </div>
              </div>
      }
      return <div key={idx.toString()} className='container-fluid'>
              <div className='row mt-1'>
                <div className='col-sm-4 px-0' style={{fontSize:14}}>{item}:</div>
                <Field as="input" name={item} rows="3" className='col-sm-8'/>
              </div>
            </div>
    });
    return <div>{items}</div>
  }

  //the render method
  render() {
    const {keys, initValues} = this.state;
    if (!keys) { return <div>Empty document</div>; }
    return (
      <div  className="col border rounded p-1 p-1">
        <Formik initialValues={initValues} onSubmit={this.submit}>
          {({ isSubmitting }) => (
            <Form>
              {this.showList()}
              <button type="submit" disabled={isSubmitting} className="btn btn-secondary"> Submit </button>
            </Form>
          )}
        </Formik>
     </div>
    )
  }
}
