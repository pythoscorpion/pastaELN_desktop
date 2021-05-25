/* Tabular overview on the left side
*/
import React, { Component } from 'react';                              // eslint-disable-line no-unused-vars
import { Button, Menu, MenuItem } from '@material-ui/core';            // eslint-disable-line no-unused-vars
import AddCircleIcon from '@material-ui/icons/AddCircle';              // eslint-disable-line no-unused-vars
import ViewArray from '@material-ui/icons/ViewArray';                  // eslint-disable-line no-unused-vars
import { DataGrid, GridToolbarContainer, GridColumnsToolbarButton,
         GridFilterToolbarButton, GridToolbarExport, GridDensitySelector} from '@material-ui/data-grid';         // eslint-disable-line no-unused-vars
import { Done, Clear } from '@material-ui/icons';                      // eslint-disable-line no-unused-vars
import * as Actions from '../Actions';
import Store from '../Store';
import ModalTableFormat from './ModalTableFormat';                     // eslint-disable-line no-unused-vars
import { h1, area } from '../style';

export default class DocTable extends Component {
  //initialize
  constructor() {
    super();
    this.state = {
      colWidth: null,
      data: null,
      columns: null,
      selectID: null,
      docLabel: null,
      displayTableFormat: 'none',
      subtypes: null,
      anchorAddMenu: null
    };
  }
  componentDidMount() {
    Store.on('changeTable', this.getTable);
    Store.on('initStore', this.getTable);
    Actions.readTable(this.props.docType);  //initialize automatic filling when loaded
    const docLabel = Store.getDocTypeLabels().filter(item=>item[0]==this.props.docType)[0][1];
    const subtypes = Store.getSubtypes(this.props.docType);
    this.setState({docLabel: docLabel, subtypes: subtypes});
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
  toggleTableFormat=()=>{
    if (this.state.displayTableFormat=='none')
      this.setState({displayTableFormat:'block'});
    else
      this.setState({displayTableFormat:'none'});
  }
  addBtnClicked=(event)=>{
    if (this.state.subtypes.length>1) {
      this.setState({anchorAddMenu: event.currentTarget});
    } else
      Actions.showForm('new',null,null);
  }
  addMenuClose=(event)=>{
    if (event.target.id!="")
      Actions.showForm('new',event.target.id,null);
    this.setState({anchorAddMenu: null});
  }

  //prepare information for display
  getTable=()=>{
    //get table column information: names, width
    var tableMeta = Store.getTableMeta();
    if (!tableMeta) return;
    tableMeta = tableMeta.filter((key) => {return(key.name);});
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
    var data = Store.getTable(this.props.docType);
    if (!data) return;
    //convert table into array of objects
    data = data.map(item=>{
      const obj = {id:item.id};
      for (var i = 0; i < item.value.length; ++i) {
        if (Array.isArray(item.value[i]))
          obj['v'+i.toString()]  = item.value[i].length==0 ? false : true;
        else
          obj['v'+i.toString()] = item.value[i];
      }
      return obj;
    });
    this.setState({data: data});
    Actions.restartDocDetail();
  }



  /**************************************
   * the render methodssss
   **************************************/
  customToolbar=()=>{
    const addMenuItems = this.state.subtypes.map((i)=>{
      return <MenuItem onClick={this.addMenuClose} key={i} id={i}>  {i}  </MenuItem>
    });
    return (
      <GridToolbarContainer>
        <Button onClick={(event)=>this.addBtnClicked(event)}
          id='addDataBtn' startIcon={<AddCircleIcon />} size='small' color='primary'>
          Add data
        </Button> <div className='mx-4'>|</div>
        <Menu id="addMenu" anchorEl={this.state.anchorAddMenu} keepMounted
          open={Boolean(this.state.anchorAddMenu)}
          onClose={this.addMenuClose} >
          {addMenuItems}
        </Menu>

        <Button onClick={()=>this.toggleTableFormat()}
          id='addDataBtn' startIcon={<ViewArray />} size='small' color='primary'>
          Format
        </Button>
        <GridColumnsToolbarButton/>
        <GridFilterToolbarButton />
        <GridDensitySelector /><div className='mx-4'>|</div>
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  }

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
              <h1 style={h1}>{this.state.docLabel}</h1>
            </div>
            <div className='col-sm-4'>
              <Button onClick={()=>Actions.showForm('new',null,null)}
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
      <div className='col-sm-12' style={ Object.assign({height:window.innerHeight-60},area) }>
        <h1 style={h1}>{this.state.docLabel}</h1>
        <div>
          <DataGrid rows={data} columns={columns} pageSize={20} density='compact'
            components={{Toolbar: this.customToolbar}} autoHeight onRowClick={this.toggleDetails}/>
        </div>
        <ModalTableFormat display={this.state.displayTableFormat} callback={this.toggleTableFormat}/>
      </div>
    );
  }
}