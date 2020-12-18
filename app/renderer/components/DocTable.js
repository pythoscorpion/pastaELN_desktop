/* Tabular overview on the left side
*/
import React, { Component } from 'react';                              // eslint-disable-line no-unused-vars
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';      // eslint-disable-line no-unused-vars
import { faCheck, faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';
import DataTable from 'react-data-table-component';                    // eslint-disable-line no-unused-vars
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
      keysNew: null,
      valuesNew: null,
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
  toggleDetails(doc) {
    /* Trigger the doc with the id to be shown*/
    this.setState({selectID: doc.id});
    Actions.readDoc(doc.id);
  }

  toggleNew() {
    if(this.state.displayNew==='none') {  //toggle towards new
      var {names, longNames} = Store.getTableMeta();
      longNames = longNames.filter((item,idx)=>{
        return !this.state.skipItems.includes(names[idx]);
      });
      const keysNew = names.filter((item)=>{
        return !this.state.skipItems.includes(item);
      });
      const valuesNew = {};
      for (var i = 0; i < names.length; ++i)
        valuesNew[names[i]] = '';
      this.setState({keysNew:keysNew, valuesNew:valuesNew, placeHolder:longNames, displayNew:'block'});
    } else {                              //toggle: close new
      this.setState({displayNew: 'none'});
    }
  }
  newChange(event,item){
    this.setState({
      valuesNew: Object.assign(this.state.valuesNew, {[item]:event.target.value})
    });
  }
  submitNew() {
    this.setState({displayNew: 'none'});
    if (Object.values(this.state.valuesNew).join('').length>2) {
      Actions.createDoc(this.state.valuesNew);
    }
  }  //TODO SB P1 trigger table reread after new addition


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
    const columns = Store.getTableMeta();
    if (!columns) return;
    this.setState({colWidth:  columns['lengths']});
    //improve display: add symbols, don't display if zero-width column
    var names = columns['names'];
    names = names.map((item,idx)=>{
      if (columns['lengths'][idx]===0) { return null; }
      var maxWidth = (Math.abs(columns['lengths'][idx])*7).toString()+'px';  //TODO SB P3 improve width, use interpolation
      if (item==='status') maxWidth='77px';
      var obj = {name:item.toUpperCase(), selector:'v'+idx.toString(), sortable: true, width:maxWidth};  //create new object
      if (columns['lengths'][idx]<0) {  //change to symbol if width <0
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
              <textarea placeholder={this.state.placeHolder[idx]} onChange={e=>this.newChange(e,item)} rows="3" cols="60"/>
            </div>
          </div>);
      }  //TODO SB P1 warning in input fields as its initial value is unset and the enableReinitialized
      return(
        <div key={idx.toString()} className='container-fluid'>
          <div className='row mt-1'>
            <div className='col-sm-2 px-0' style={{fontSize:14}}>{item}:</div>
            <input placeholder={this.state.placeHolder[idx]} onChange={e=>this.newChange(e,item)} size="60"/>
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
            <div className="form-popup m-2" >
              <form className="form-container">
                {this.showNewList()}
                <button type="submit" onClick={()=>this.submitNew()} className="btn btn-secondary my-2"> Submit </button>
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
