/* Tabular overview on the left side
*/
import React, { Component } from 'react';                              // eslint-disable-line no-unused-vars
import { Button, Menu, MenuItem, Slider, FormControl, InputLabel, Select } from '@material-ui/core';    // eslint-disable-line no-unused-vars
import AddCircleIcon from '@material-ui/icons/AddCircle';              // eslint-disable-line no-unused-vars
import ViewArray from '@material-ui/icons/ViewArray';                  // eslint-disable-line no-unused-vars
import { DataGrid, GridToolbarContainer, GridFilterToolbarButton,      // eslint-disable-line no-unused-vars
  GridToolbarExport, GridDensitySelector} from '@material-ui/data-grid'; // eslint-disable-line no-unused-vars
import { Done, Clear } from '@material-ui/icons';                      // eslint-disable-line no-unused-vars
import { makeStyles } from '@material-ui/core/styles';
import * as Actions from '../Actions';
import Store from '../Store';
import { saveTableFormat } from '../localInteraction';
import { h1, area, tblColFmt, tblColFactor } from '../style';

export default class DocTable extends Component {
  constructor() {
    super();
    this.state = {
      ontologyNode: null,
      colWidth: null,
      data: null,
      columns: null,
      selectID: null,
      docLabel: null,
      displayTableFormat: 'none',
      subtypes: null,
      selectedSubtype: '',
      anchorAddMenu: null,
      anchorFormatMenu: null
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

  /** Functions as class properties (immediately bound): react on user interactions **/
  toggleDetails = (doc) => {
    /* Trigger the doc with the id to be shown */
    this.setState({selectID: doc.row.id});
    Actions.readDoc(doc.row.id);
  }

  headerBtnOpen=(event)=>{
    /**press button in the table header and open a menu*/
    this.setState({anchorFormatMenu: event.currentTarget});
  }
  headerMenuClose=(event)=>{
    /**close the menu in the table header */
    this.setState({anchorFormatMenu: null});
  }
  valueLabelFormat=(value)=>{
    /**From index/value create label read by human*/
    return tblColFmt[value].label;
  }

  changeSlider=(idx,value)=>{
    /**After slider changed, save new state in this state */
    var colWidth = this.state.colWidth;
    colWidth[idx]=tblColFmt[value].width;
    this.setState({colWidth:colWidth});
    this.prepareTable();
  }

  saveFmtBtn=()=>{
    /**Press save button in format menu in table header */
    saveTableFormat(this.props.docType,this.state.colWidth);
  }

  changeSubtype=(e)=>{
    this.setState({selectedSubtype:e.target.value});
    this.getTable(this.props.docType+'/'+e.target.value);
  }

  getTable=( docType=null )=>{
    /* get table column information: names, width*/
    if (!docType)
      docType = this.props.docType+'/'+this.state.selectedSubtype;
    if (docType.endsWith('/'))
      docType = docType.slice(0,docType.length-1);
    var colWidth = Store.getConfiguration()['-tableFormat-'][docType];
    colWidth = (colWidth) ? colWidth['-default-'] : [20,20,20,20];
    this.setState({colWidth: colWidth});
    const ontologyNode = Store.getOntologyNode(docType);
    //improve display: add symbols, don't display if zero-width column
    var columns = ontologyNode.map((item)=>{return item.name;});  //list of names
    columns = columns.filter(item=>{return (item);});  //filter out headings
    columns = columns.map((item,idx)=>{
      if (!colWidth[idx] || colWidth[idx]==0)
        return null;
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
          width:Math.abs(colWidth[idx])*tblColFactor,
          disableColumnMenu:true
        };
    });
    columns = columns.filter(function(value){return value!=null;});
    //get information from store and process it into format that table can plot
    var data = Store.getTable(docType);
    if (!data) return;
    //convert table into array of objects
    data = data.map(item=>{
      const obj = {id:item.id};
      item.value.map((subitem,i)=>{
        if (Array.isArray(subitem))
          obj['v'+i.toString()]  = subitem.length==0 ? false : true;
        else
          obj['v'+i.toString()] = subitem;
      });
      return obj;
    });
    this.setState({columns:columns, data:data});
    Actions.restartDocDetail();
  }


  /** create html-structure; all should return at least <div></div> **/
  customToolbar=()=>{
    //menu for table column format
    var formatMenuItems = Store.getOntology()[this.props.docType];
    const maxItem = tblColFmt.length-1;
    formatMenuItems     = formatMenuItems.map((i,idx)=>{
      if (!i.name)    //filter out heading
        return null;
      const iColWidth = this.state.colWidth[idx];
      var iValue    = tblColFmt.filter((i)=>{return i.width==iColWidth;})[0];
      iValue = (iValue) ? iValue.value : 0;
      return (<MenuItem key={i.name} id={i.name} className={makeStyles({root:{width:300}})().root}>
        <div className='container row mx-0 px-0 pt-4 pb-0'>
          <div className='col-md-auto pl-0'>{i.name}</div>
          <Slider defaultValue={iValue} step={1} max={maxItem} marks valueLabelDisplay="auto"
            valueLabelFormat={this.valueLabelFormat} className='col' key={`sldr${iValue}`}
            onChangeCommitted={(_,value)=>this.changeSlider(idx,value)}/>
        </div>
      </MenuItem>);
    });
    formatMenuItems = formatMenuItems.filter((value)=>{return value!=null;});
    formatMenuItems = formatMenuItems.concat([
      <MenuItem key='save' className={makeStyles({root:{width:300}})().root} style={{display:'flex'}}>
        <Button onClick={()=>this.saveFmtBtn()} style={{marginLeft:'auto'}} id='saveFormat'
          size='small' color='primary'>
          Save
        </Button>
      </MenuItem>
    ]);
    //main return function
    return (
      <GridToolbarContainer>
        {/*Add data button and menu */}
        <Button onClick={(event)=>Actions.showForm('new',null,null)}
          id='addDataBtn' startIcon={<AddCircleIcon />} size='small' color='primary'>
          Add data
        </Button>
        <div className='mx-4'>|</div>

        {/*Format columns button and menu */}
        <Button onClick={(event)=>this.headerBtnOpen(event)}
          id='formatColsBtn' startIcon={<ViewArray />} size='small' color='primary'>
          Format
        </Button>
        <Menu id="formatMenu" anchorEl={this.state.anchorFormatMenu} keepMounted
          open={Boolean(this.state.anchorFormatMenu)}
          onClose={this.headerMenuClose} >
          {formatMenuItems}
        </Menu>

         {/*<GridFilterToolbarButton />*/}
        <div className='mx-4'>|</div>
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  }


  /** the render method **/
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
    const menuItems = this.state.subtypes.map((i)=>{
      var value = i.split('/');
      value = value.slice(1,value.length).join('/');
      var label = value;
      if (value=='')
        label = 'default';
      return <MenuItem value={value} key={value}>{label}</MenuItem>;
    });
    return (                                    //default case: data present, show add data button
      <div className='col-sm-12' style={ Object.assign({height:window.innerHeight-60},area) }>
        <span style={h1} className='mr-5'>{this.state.docLabel}</span> SUBTYPE:
          <Select id="selectSubtype" value={this.state.selectedSubtype} onChange={e=>this.changeSubtype(e)} fullWidth className='col-sm-5'>
            {menuItems}
          </Select>
        <div>
          <DataGrid rows={data} columns={columns} pageSize={25} density='compact'
            components={{Toolbar: this.customToolbar}} autoHeight onRowClick={this.toggleDetails}/>
        </div>
      </div>
    );
  }
}