/* Tabular overview on the left side
*/
import React, { Component } from 'react';                              // eslint-disable-line no-unused-vars
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';      // eslint-disable-line no-unused-vars
import { faCheck, faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';
import DataTable from 'react-data-table-component';                    // eslint-disable-line no-unused-vars
import { Button } from '@material-ui/core';
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
      displayNew: 'none',
      skipItems: ['tags','image','curate','type'],
      tableMeta: null,
      values: null,
      disableSubmit: false
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
  toggleDetails(doc) {
    /* Trigger the doc with the id to be shown*/
    this.setState({selectID: doc.id});
    Actions.readDoc(doc.id);
  }

  toggleNew() {
    if(this.state.displayNew==='none') {  //toggle towards new
      var tableMeta = Store.getTableMeta();
      tableMeta = tableMeta.filter((item)=>{
        if (item.required)
          this.setState({disableSubmit: true});
        return !this.state.skipItems.includes(item.name);
      });
      const values = Array(tableMeta.length).fill('');
      this.setState({tableMeta:tableMeta, values:values, displayNew:'block'});
    } else {                              //toggle: close new
      this.setState({displayNew: 'none'});
    }
  }
  newChange(event,idx){
    var values = this.state.values;
    values[idx] = event.target.value;
    this.setState({values: values});
    this.setState({disableSubmit: false});
    this.state.tableMeta.map((item,idx)=>{
      if (this.state.values[idx].length==0 && item.required)
        this.setState({disableSubmit: true});
    });
  }
  submitNew() {
    this.setState({displayNew: 'none'});
    if (Object.values(this.state.values).join('').length>2) {
      var doc = {};
      this.state.tableMeta.map((item,idx)=>{doc[item.name]=this.state.values[idx];});
      Actions.createDoc(doc);
    }
  }


  //prepare information for display
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
    const tableMeta = Store.getTableMeta();
    if (!tableMeta) return;
    const colWidth = tableMeta.map((item)=>{return item.colWidth});
    this.setState({colWidth: colWidth});
    //improve display: add symbols, don't display if zero-width column
    var names = tableMeta.map((item)=>{return item.name});
    names = names.map((item,idx)=>{
      if (colWidth[idx]===0) { return null; }
      var maxWidth = (Math.abs(colWidth[idx])*9.2).toString()+'px';
      if (item==='status') maxWidth='77px';
      var obj = {name:item.toUpperCase(), selector:'v'+idx.toString(), sortable: true, width:maxWidth};  //create new object
      if (colWidth[idx]<0) {  //change to symbol if width <0
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
    if (!this.state.tableMeta)
      return <div></div>;
    const items = this.state.tableMeta.map( (item,idx) => {
      var text = item.name+':';
      if (item.required)
        text += '  *';
      if (item.list) {
        if (typeof item.list==='string') {//doctypes
          var docsList = Store.getDocsList(item.list);
          if (docsList)
            docsList = [{name:'---',id:''}].concat(docsList); //concat --- to list
          else
            docsList = [{name:'visit page first: '+item.list,id:'000'}];
          var options = "";
          if (docsList) {
            options = docsList.map((item)=>{return <option value={item.id} key={item.id}>{item.name}</option>});
          }
        } else {  //lists defined by ontology
          const options = item.list.map((item)=>{return <option value={item} key={item}>{item}</option>});
        }
        return(
          <div key={idx.toString()} className='container-fluid'>
          <div className='row mt-1'>
            <div className='col-sm-2 px-0' style={{fontSize:14}}>{item.name}</div>
            <select onChange={e=>this.newChange(e,idx)} key={item.name}>{options}</select>&nbsp;{item.unit}
          </div>
        </div>);
      }
      if (item.name==='comment') {
        return(
          <div key={idx.toString()} className='container-fluid'>
            <div className='row mt-1'>
              <div className='col-sm-2 px-0' style={{fontSize:14}}>{item.name}</div>
              <textarea placeholder={item.query} onChange={e=>this.newChange(e,idx)} rows="3" cols="60"/> &nbsp;{item.unit}
            </div>
          </div>);
      }
      return(
        <div key={idx.toString()} className='container-fluid'>
          <div className='row mt-1'>
            <div className='col-sm-2 px-0' style={{fontSize:14}}>{text}</div>
            <input placeholder={item.query} onChange={e=>this.newChange(e,idx)} size="60"/> &nbsp;{item.unit}
          </div>
        </div>);
    });
    return <div>{items}</div>;
  }
  showNew(){
    // component with buttons containing the above list
    return (
      <div className="modal" style={{display: this.state.displayNew}}>
        <div className="modal-content">
          <div  className="col border rounded p-1 p-1">
            <div className="form-popup m-2" >
              <form className="form-container">
                {this.showNewList()}
                [* required]
                <button type="submit" onClick={()=>this.submitNew()} disabled={this.state.disableSubmit} className="btn btn-secondary my-2 ml-5"> Submit </button>
                <button type="button" onClick={() => this.toggleNew()} className="btn btn-secondary m-2"> Cancel </button>
              </form>
            </div>
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
          <Button onClick={this.toggleNew.bind(this)} variant='contained' className='m-3'>Add data</Button>
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
        <Button onClick={this.toggleNew.bind(this)} variant='contained' className='m-3'>Add data</Button>
      </div>
    );
  }
}
