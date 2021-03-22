/* Tabular overview on the left side
*/
import React, { Component } from 'react';                              // eslint-disable-line no-unused-vars
import { Button } from '@material-ui/core';                            // eslint-disable-line no-unused-vars
import AddCircleIcon from '@material-ui/icons/AddCircle';              // eslint-disable-line no-unused-vars
import { DataGrid} from '@material-ui/data-grid';                      // eslint-disable-line no-unused-vars
import { Done, Clear } from '@material-ui/icons';                      // eslint-disable-line no-unused-vars
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
    this.setState({selectID: doc.row.id});
    Actions.readDoc(doc.row.id);
  }

  //prepare information for display
  getTable=()=>{
    //get table column information: names, width
    const tableMeta = Store.getTableMeta();
    if (!tableMeta) return;
    const colWidth = tableMeta.map((item)=>{return item.colWidth;});
    this.setState({colWidth: colWidth});
    //improve display: add symbols, don't display if zero-width column
    var columns = tableMeta.map((item)=>{return item.name;});
    columns = columns.map((item,idx)=>{
      if (colWidth[idx]===0 || !item) { return null; }
      var maxWidth = Math.abs(colWidth[idx])*9;
      if (item==='status') maxWidth=77;
      if (colWidth[idx]<0)
        return {headerName:item.toUpperCase(),
          field:'v'+idx.toString(),
          width:90,
          disableColumnMenu:true,
          renderCell: (params)=>(params.value?<Done />:<Clear />)
        };
      else
        return {headerName:item.toUpperCase(),
          field:'v'+idx.toString(),
          width:maxWidth,
          disableColumnMenu:true
        };
    });
    columns = columns.filter(function(value){return value!=null;});
    this.setState({columns: columns});
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
  }


  /**************************************
   * the render method
   **************************************/
  render() {
    const { data, columns } = this.state;
    if (!data || !columns) {                //if still loading: wait... dont' show anything
      return (<div></div>);
    }
    if (data.length === 0) {                   //if empty data: nothing added, show add data button
      return (
        <div className='col-sm-12'>
        <div className='row'>
          <div className='col-sm-8 pt-2'>
            <h1>{this.props.docLabel}</h1>
          </div>
          <div className='col-sm-4'>
            <Button onClick={()=>Actions.showForm('new',null,null)} variant='contained'
              className='m-2 float-right' id='addDataBtn' startIcon={<AddCircleIcon />}>
                Add data
            </Button>
          </div>
        </div>
        <div>
          Empty database!
        </div>
      </div>
);
    }
    return (                                    //default case: data present, show add data button
      <div className='col-sm-12'>
        <div className='row'>
          <div className='col-sm-8 pt-2'>
            <h1>{this.props.docLabel}</h1>
          </div>
          <div className='col-sm-4'>
            <Button onClick={()=>Actions.showForm('new',null,null)} variant='contained'
              className='m-2 float-right' id='addDataBtn' startIcon={<AddCircleIcon />}>
                Add data
            </Button>
          </div>
        </div>
        <div>
          <DataGrid rows={data} columns={columns} pageSize={20} density='compact' showToolbar autoHeight
            onRowClick={this.toggleDetails} />
        </div>
      </div>
    );
  }
}