/* Input new details on the right side: occurs click on 'New' button
*/
import React, { Component } from 'react';      // eslint-disable-line no-unused-vars
import { Formik, Form, Field } from 'formik';  // eslint-disable-line no-unused-vars
import * as Actions from '../Actions';
import Store from '../Store';

export default class DocNew extends Component {
  constructor() {
    super();
    this.submit = this.submit.bind(this);
    this.state = {
      skipItems: ['tags','image'],
      keys: null,
      initValues: null,
      placeHolder: null
    };
  }
  componentDidMount() {
    var {names, longNames} = Store.getTableMeta();
    longNames = longNames.filter((item,idx)=>{
      return !this.state.skipItems.includes(names[idx]);
    });
    this.setState({placeHolder: longNames});
    names = names.filter((item)=>{
      return !this.state.skipItems.includes(item);
    });
    this.setState({keys: names});
    const initValues = {};
    for (var i = 0; i < names.length; ++i)
      initValues[names[i]] = '';
    this.setState({initValues: initValues});
  }

  //actions triggered
  submit(values) {
    Actions.createDoc(values);
    Actions.toggleRightPane('show');
  }

  /**************************************
   * process data and create html-table
   * all should return at least <div></div>
   * no changes of state here: this.setState
   **************************************/
  showList() {
    /**
     * List of form fields: same as in DocEdit.js
     */
    const {keys, placeHolder} = this.state;
    const items = keys.map( (item,idx) => {
      if (item==='comment') {
        return(
          <div key={idx.toString()} className='container-fluid'>
            <div className='row mt-1'>
              <div className='col-sm-4 px-0' style={{fontSize:14}}>{item}:</div>
              <Field component='textarea' name={item} rows='3' className='col-sm-8' placeholder={placeHolder[idx]}/>
            </div>
          </div>);
      }
      return(
        <div key={idx.toString()} className='container-fluid'>
          <div className='row mt-1'>
            <div className='col-sm-4 px-0' style={{fontSize:14}}>{item}:</div>
            <Field as='input' name={item} rows='3' className='col-sm-8' placeholder={placeHolder[idx]}/>
          </div>
        </div>);
    });
    return <div>{items}</div>;
  }


  //the render method
  render() {
    const {keys, initValues} = this.state;
    if (!keys) { return <div>Empty document</div>; }
    return (
      <div  className='col border rounded'>
        <Formik initialValues={initValues} onSubmit={this.submit}>
          {({ isSubmitting }) => (
            <Form>
              {this.showList()}
              <button type='submit' disabled={isSubmitting} className='btn btn-secondary'> Submit </button>
            </Form>
          )}
        </Formik>
      </div>
    );
  }
}
