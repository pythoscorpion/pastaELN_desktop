/* Tabular overview on the left side
*/
import React, { Component } from 'react';                              // eslint-disable-line no-unused-vars
import { Button, Menu, MenuItem, Slider } from '@material-ui/core';    // eslint-disable-line no-unused-vars
import AddCircleIcon from '@material-ui/icons/AddCircle';              // eslint-disable-line no-unused-vars
import ViewArray from '@material-ui/icons/ViewArray';                  // eslint-disable-line no-unused-vars
import { DataGrid, GridToolbarContainer, GridFilterToolbarButton,      // eslint-disable-line no-unused-vars
  GridToolbarExport, GridDensitySelector} from '@material-ui/data-grid'; // eslint-disable-line no-unused-vars
import { Done, Clear } from '@material-ui/icons';                      // eslint-disable-line no-unused-vars
import { makeStyles } from '@material-ui/core/styles';
import * as Actions from '../Actions';
import Store from '../Store';
import { getCredentials, saveTableFormat } from '../localInteraction';
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
    if (event.currentTarget.id=='addDataBtn') {
      if (this.state.subtypes.length>1) {
        this.setState({anchorAddMenu: event.currentTarget});
      } else
        Actions.showForm('new',null,null);
    } else if (event.currentTarget.id=='formatColsBtn') {
      this.setState({anchorFormatMenu: event.currentTarget});
    }
  }

  headerMenuClose=(event)=>{
    /**close the menu in the table header */
    if (this.state.anchorAddMenu) {
      if (event.target.id!='')
        Actions.showForm('new',event.target.id,null);
      this.setState({anchorAddMenu: null});
    } else if (this.state.anchorFormatMenu) {
      this.setState({anchorFormatMenu: null});
    }
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

  getTable=()=>{
    /* get table column information: names, width*/
    this.setState({ontologyNode: Store.getOntologyNode()});
    var colWidth = getCredentials().configuration['-tableFormat-'][this.props.docType];
    colWidth = (colWidth) ? colWidth['-default-'] : [20,20,20,20];
    this.setState({colWidth: colWidth});
    this.prepareTable();
  }

  prepareTable=()=>{
    /* called upon change in table data or format */
    const {ontologyNode, colWidth} = this.state;
    if (!ontologyNode) return;
    //filter out items that do not have names, everything should have a name
    // ontologyNode = ontologyNode.filter((key) => {return key.name;});
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
    var data = Store.getTable(this.props.docType);
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
    /* menu for add data */
    const addMenuItems = this.state.subtypes.map((i)=>{
      return <MenuItem onClick={this.headerMenuClose} key={i} id={i}>  {i}  </MenuItem>;
    });
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
        <Button onClick={(event)=>this.headerBtnOpen(event)}
          id='addDataBtn' startIcon={<AddCircleIcon />} size='small' color='primary'>
          Add data
        </Button>
        <Menu id="addMenu" anchorEl={this.state.anchorAddMenu} keepMounted
          open={Boolean(this.state.anchorAddMenu)}
          onClose={this.headerMenuClose} >
          {addMenuItems}
        </Menu>
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

        <GridFilterToolbarButton />
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
    return (                                    //default case: data present, show add data button
      <div className='col-sm-12' style={ Object.assign({height:window.innerHeight-60},area) }>
        <h1 style={h1}>{this.state.docLabel}</h1>
        <div>
          <DataGrid rows={data} columns={columns} pageSize={20} density='compact'
            components={{Toolbar: this.customToolbar}} autoHeight onRowClick={this.toggleDetails}/>
        </div>
      </div>
    );
  }
}