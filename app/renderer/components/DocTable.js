/* Tabular overview on the left side
*/
import React, { Component } from 'react';                              // eslint-disable-line no-unused-vars
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';      // eslint-disable-line no-unused-vars
import { faCheck, faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';
import DataTable from 'react-data-table-component';                    // eslint-disable-line no-unused-vars
import { Formik, Form, Field } from 'formik';                          // eslint-disable-line no-unused-vars
import * as Actions from '../Actions';
import Store from '../Store';

export default class DocTable extends Component {
  //initialize
  constructor() {
    super();
    this.getTable     = this.getTable.bind(this);
    this.toggleDetails= this.toggleDetails.bind(this);
    this.submitNew       = this.submitNew.bind(this);
    this.state = {
      colWidth: null,
      data: null,
      columns: null,
      selectID: null,
      //for new form
      skipItems: ['tags','image'],
      displayNew: 'none',
      keysNew: null,
      initValuesNew: null,
      placeHolder: null
    };
  }
  componentDidMount() {
    Store.on('changeTable', this.getTable);
    Store.on('initStore', this.getTable);
    Actions.readTable(this.props.docLabel);  //initialize automatic filling when loaded
  }
  componentWillUnmount() {
    Store.removeListener('initStore',   this.getTable);
    Store.removeListener('changeTable', this.getTable);
  }

  //actions triggered by button
  toggleNew() {
    if(this.state.displayNew==='none') {  //toggle towards new
      var {names, longNames} = Store.getTableMeta();
      longNames = longNames.filter((item,idx)=>{
        return !this.state.skipItems.includes(names[idx]);
      });
      const keysNew = names.filter((item)=>{
        return !this.state.skipItems.includes(item);
      });
      const initValuesNew = {};
      for (var i = 0; i < names.length; ++i)
        initValuesNew[names[i]] = '';
      this.setState({keysNew:keysNew, initValuesNew:initValuesNew, displayNew:'block', placeHolder:longNames});
    } else {                              //toggle: close new
      this.setState({displayNew: 'none'});
    }
  }

  toggleDetails(doc) {
    /* Trigger the doc with the id to be shown*/
    this.setState({selectID: doc.id});
    Actions.readDoc(doc.id);
  }

  submitNew(values) {
    this.setState({displayNew: 'none'});
    if (Object.values(values).join('').length>2) {
      Actions.createDoc(values);
    }
  }  //TODO SB P1 trigger table reread after new addition


  getTable() {
    //get information from store and process it into format that table can plot
    var data = Store.getTable(this.props.docLabel);
    if (!data) return;
    //convert table into array of objects
    data = data.map(item=>{
      const obj = {id:item.id};
      for (var i = 0; i < item.value.length; ++i) {
        obj['v'+i.toString()] = item.value[i];
      }
      return obj;
    });
    this.setState({data: data});
    //get table column information: names, width
    const columns = Store.getTableMeta();
    if (!columns) return;
    this.setState({colWidth:  columns['lengths']});
    //improve display: add symbols, don't display if zero-width column
    var names = columns['names'];
    names = names.map((item,idx)=>{
      if (this.state.colWidth[idx]===0) { return null; }
      var maxWidth = (Math.abs(this.state.colWidth[idx])*7).toString()+'px';  //TODO SB P3 improve width, use interpolation
      if (item==='status') maxWidth='77px';
      var obj = {name:item.toUpperCase(), selector:'v'+idx.toString(), sortable: true, width:maxWidth};  //create new object
      if (this.state.colWidth[idx]<0) {  //change to symbol if width <0
        obj['cell'] = (row) => {
          if (item==='curate') {
            return <FontAwesomeIcon icon={String(row['v'+idx.toString()])==='false'? faExclamationTriangle : faCheck} />;
          } else {
            return <FontAwesomeIcon icon={row['v'+idx.toString()]==='true' ? faCheck : faExclamationTriangle} />;
          }
        };
      }
      return obj;
    });
    names = names.filter(function(value){return value!=null;});
    this.setState({columns: names});
  }

  showNewList() {
    // List of form fields: similar to one in docTable.js
    if (!this.state.keysNew)
      return <div></div>;
    const items = this.state.keysNew.map( (item,idx) => {
      if (item==='comment') {
        return(
          <div key={idx.toString()} className='container-fluid'>
            <div className='row mt-1'>
              <div className='col-sm-2 px-0' style={{fontSize:14}}>{item}:</div>
              <Field component="textarea" name={item} placeholder={this.state.placeHolder[idx]} rows="3" className='col-sm-10'/>
            </div>
          </div>);
      }  //TODO SB P1 warning in input fields as its initial value is unset and the enableReinitialized
      return(
        <div key={idx.toString()} className='container-fluid'>
          <div className='row mt-1'>
            <div className='col-sm-2 px-0' style={{fontSize:14}}>{item}:</div>
            <Field as="input" name={item} placeholder={this.state.placeHolder[idx]} className='col-sm-10'/>
          </div>
        </div>);
    });
    return <div>{items}</div>;
  }
  showNew(){
    return (
      <div className="modal" style={{display: this.state.displayNew}}>
        <div className="modal-content">
          <div  className="col border rounded p-1 p-1">
            <Formik initialValues={this.state.initValuesNew} onSubmit={this.submitNew} enableReinitialize>
              <Form>
                {this.showNewList()}
                <button type="submit" className="btn btn-secondary my-2"> Submit </button>
                <button type="button" onClick={() => this.toggleNew()} className="btn btn-secondary m-2"> Cancel </button>
              </Form>
            </Formik>
          </div>
        </div>
      </div>
    );
  }


  /**************************************
   * the render method
   **************************************/
  render() {
    const { data, columns } = this.state;
    const h2Style = {textAlign: 'center'};
    const conditionalRowStyles = [{
      when: row => row.id === this.state.selectID,
      style: { backgroundColor: '#8e8c84', color: 'white' }
    }];
    if (!data || !columns) {                //if still loading: wait... dont' show anything
      return (
        <div style={{textAlign:'center'}}>
          <h2 style={h2Style}>Loading data</h2>
        </div>);
    }
    if (data.length === 0) {                   //if empty data: nothing added, show add data button
      return (
        <div style={{textAlign:'center'}}>
          <h2 style={h2Style}>{this.props.docType}</h2>
          <p>Empty database</p>
          {this.showNew()}
          <button onClick={this.toggleNew.bind(this)} className='btn btn-secondary'>Add data</button>
        </div>);
    }
    return (                                    //default case: data present, show add data button
      <div className='col'>
        <DataTable
          title={this.props.docLabel} dense highlightOnHover pagination
          columns={columns}
          data={data}
          onRowClicked={this.toggleDetails}
          conditionalRowStyles={conditionalRowStyles}
        />
        {this.showNew()}
        <button onClick={this.toggleNew.bind(this)} className='btn btn-secondary m-2'>Add data</button>
      </div>
    );
  }
}
