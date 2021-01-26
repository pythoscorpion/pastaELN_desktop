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
    this.state = {
      colWidth: null,
      data: null,
      columns: null,
      selectID: null,
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
  //   Trigger the doc with the id to be shown
  toggleDetails=(doc)=>{
    this.setState({selectID: doc.id});
    Actions.readDoc(doc.id);
  }

  //prepare information for display
  getTable=()=>{
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
          var cell = row['v'+idx.toString()];
          if (item==='curate' && cell==null)
            cell = true;
          if (typeof cell ==='string')
            cell = cell==='false'||cell==='' ? false : true;
          return <FontAwesomeIcon icon={cell==true ? faCheck : faExclamationTriangle} />;
        };
      }
      return obj;
    });
    names = names.filter(function(value){return value!=null;});
    this.setState({columns: names});
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
          <Button onClick={()=>Actions.showForm('new')} variant='contained' className='m-2'>Add data</Button>
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
        <Button onClick={()=>Actions.showForm('new')} variant='contained' className='m-2'>Add data</Button>
      </div>
    );
  }
}
