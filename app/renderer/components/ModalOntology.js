import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { Button, IconButton, Checkbox, Input, Select, MenuItem, FormControl} from '@material-ui/core';// eslint-disable-line no-unused-vars
import { Delete, ArrowUpward, GetApp, Save, Cancel, Done, Add } from '@material-ui/icons';// eslint-disable-line no-unused-vars
import axios from 'axios';
import Store from '../Store';

export default class ModalOntology extends Component {
  constructor() {
    super();
    this.state = {
      ontology: {},
      docType: '--addNew--',
      tempDocType: '',
      listCollections: [''], selectCollection: '',
      remoteOntology: [], selectScheme:''
    };
    this.baseURL  = 'https://jugit.fz-juelich.de';
    this.basePath = 'pasta/ontology/-/raw/master/';
  }
  componentDidMount(){
    /* after mounting, read list of all possible collections from README.md
    */
    const url = axios.create({baseURL: this.baseURL});
    const thePath = this.basePath+'README.md';
    url.get(thePath).then((res) => {
      var lines = res.data.split('\n');
      lines = lines.map((line)=>{
        if (line.indexOf('.json :')>0)
          return line.split('.json :')[0].substring(2);
        else
          return null;
      });
      lines = [''].concat(lines.filter((item)=>{return item;}));
      this.setState({listCollections:lines, selectCollection:lines[0]});
    }).catch(()=>{
      console.log('Error encountered during README.md reading.');
    });
  }

  /*PRESSED BUTTONS*/
  pressedLoadBtn=()=>{
    var ontology = Store.getOntology();
    this.setState({ontology: ontology});
    if (ontology['project'])
      this.setState({docType: 'project'});
  }
  pressedSaveBtn=()=>{
    // get rid of empty entries: names not given or empty
    for (var [key, value] of Object.entries(this.state.ontology)) {
      if (key[0]!='-' && key[0]!='_')
        value = value.filter((item)=>{ return( (item.name && item.name.length>0)||(item.heading) ); });
      this.state.ontology[key] = value;
    }
    Store.updateDocument(this.state.ontology,false);
    this.props.callback('save');
  }


  /*CHANGE IN THE FORMS: incl. change of selection boxes*/
  changeTypeSelector = (event,item) =>{
    if (item==='doctype')
      this.setState({docType: event.target.value});
    else {                     //delete doctype
      var ontology = this.state.ontology;
      delete ontology[this.state.docType];
      this.setState({ontology:ontology});
      this.setState({docType:'--addNew--'});
    }
  }

  changeImport = (event,item) =>{
    //change in import form
    if (item==='collection') {
      this.setState({selectCollection: event.target.value});
      const url = axios.create({baseURL: this.baseURL});
      const thePath = this.basePath+event.target.value+'.json';
      url.get(thePath).then((res) => {
        this.setState({remoteOntology: res.data});
      }).catch(()=>{
        console.log('Error encountered during '+event.target.value+'.json reading.');
      });
    } else if (item==='scheme') {
      this.setState({selectScheme: event.target.value, tempDocType: event.target.value});
    } else if (item==='doctype') {
      this.setState({tempDocType: event.target.value});
    } else if (item==='done') {
      var ontology = this.state.ontology;
      ontology[this.state.tempDocType] = this.state.remoteOntology[this.state.selectScheme];
      this.setState({ontology:ontology, docType:this.state.tempDocType});
    } else {
      console.log('ModalOntology,changeImport: get bad item: |'+item+'|');
    }
  }

  change = (event,row,column) =>{
    //change in form of this specific  doctype
    var ontology = this.state.ontology;
    if (row==-2) {    //change docType
      if (column==='doctype') {
        this.setState({tempDocType: event.target.value.replace(/[\W\d_]+/g,'').toLowerCase() });
      }
      else {
        ontology[this.state.tempDocType] = [{name:''}];
        this.setState({docType:this.state.tempDocType});
        this.setState({tempDocType:''});
      }
    } else if (row==-1) { //select addRow or addHeading
      if (column==='addRow')
        ontology[this.state.docType] = ontology[this.state.docType].concat({name:''});
      if (column==='addHeading')
        ontology[this.state.docType] = ontology[this.state.docType].concat({heading:' '});
    } else {
      if (column=='delete') {
        delete ontology[this.state.docType][row];
      } else if (column=='up') {
        if (row==0) //do nothing
          return;
        ontology[this.state.docType].splice(row-1, 0,  ontology[this.state.docType][row]);
        delete ontology[this.state.docType][row+1];
      } else {
        if (event.target.type==='checkbox')
          ontology[this.state.docType][row][column] = !ontology[this.state.docType][row][column];
        else if (column=='name')
          ontology[this.state.docType][row][column] = event.target.value.replace(/[\W\d_]+/g,'').toLowerCase();
        else
          ontology[this.state.docType][row][column] = event.target.value;
      }
    }
    this.setState({ontology: ontology});
  }



  /* process data and create html-structure; all should return at least <div></div> */
  showTypeSelector(){
    //show type selector incl. delete button
    var listTypes = Object.keys(this.state.ontology);
    listTypes     = listTypes.filter((item)=>{return item[0]!='_' && item[0]!='-';});
    var options = listTypes.map((item)=>{
      return (<MenuItem value={item} key={item}>{(item+'s').toUpperCase()}</MenuItem>);
    });
    options = options.concat(<MenuItem key='--addNew--' value='--addNew--'>{'-- Add new --'}</MenuItem>);
    options = options.concat(<MenuItem key='--importNew' value='--importNew--'>{'-- Import from server --'}</MenuItem>);
    return (
      <div key='typeSelector' className='container-fluid'>
        <div className='row mt-1'>
          <div className='col-sm-2 text-right pt-2'>Data type</div>
          <FormControl fullWidth className='col-sm-7'>
            <Select onChange={e=>this.changeTypeSelector(e,'doctype')} value={this.state.docType}>
              {options}
            </Select>
          </FormControl>
          <Button onClick={(e) => this.changeTypeSelector(e,'delete')}
            variant="contained" className='col-sm-2 ml-3' startIcon={<Delete/>}>
            Delete
          </Button>
        </div>
      </div>
    );
  }

  showForm(){
    var listRows = this.state.ontology[this.state.docType];
    if (listRows) {
      listRows = listRows.map((item,idx)=>{
        if (item.heading) {
          //IF HEADING
          return (
            <div key={'row'+idx.toString()} className='row p-3'>
              <div className='col-sm-2 pt-2'><strong>Heading</strong></div>
              <FormControl fullWidth className='col-sm-9'>
                <Input required placeholder='Heading' value={item.heading}
                  onChange={e=>this.change(e,idx,'heading')}     key={'heading'+idx.toString()} />
              </FormControl>
              <div className='col-sm-1'>
                <IconButton onClick={(e) => this.change(e,idx,'delete')}
                  size="small">
                  <Delete/>
                </IconButton>
                <IconButton onClick={(e) => this.change(e,idx,'up')}
                  size="small">
                  <ArrowUpward/>
                </IconButton>
              </div>
            </div>
          );
        }
        //IF NOT HEADING
        return(
          <div key={'row'+idx.toString()} className='row'>
            <FormControl fullWidth className='col-sm-2 p-1'>
              <Input required placeholder='Name' value={item.name}
                onChange={e=>this.change(e,idx,'name')}     key={'name'+idx.toString()} />
            </FormControl>
            <FormControl fullWidth className='col-sm-4 p-1'>
              <Input placeholder='Questions' value={item.query?item.query:''}
                onChange={e=>this.change(e,idx,'query')}    key={'query'+idx.toString()} />
            </FormControl>
            <Checkbox className='col-sm-1'
              checked={item.required?item.required:false}
              onChange={e=>this.change(e,idx,'required')}
            />
            <FormControl fullWidth className='col-sm-3 p-1'>
              <Input placeholder='Is this a list?' value={item.list?item.list:''}
                onChange={e=>this.change(e,idx,'list')}     key={'list'+idx.toString()} />
            </FormControl>
            <FormControl fullWidth className='col-sm-1 p-1'>
              <Input placeholder='m' value={item.unit?item.unit:''}
                onChange={e=>this.change(e,idx,'unit')}     key={'unit'+idx.toString()} />
            </FormControl>
            <div className='col-sm-1'>
              <IconButton onClick={(e) => this.change(e,idx,'delete')}
                size="small">
                <Delete/>
              </IconButton>
              <IconButton onClick={(e) => this.change(e,idx,'up')}
                size="small">
                <ArrowUpward/>
              </IconButton>
            </div>
          </div>);
      });
    }
    return (<div>
      {listRows &&
        <div className='row mt-5'>
          <div className='col-sm-2 pl-1'>Name:</div>
          <div className='col-sm-4 pl-1'>Query:</div>
          <div className='col-sm-1'>Required:</div>
          <div className='col-sm-3 pl-1'>List:</div>
          <div className='col-sm-1 pl-1'>Unit:</div>
        </div>
      }
      {listRows}
      <Button onClick={(e) => this.change(e,-1,'addRow')}
        variant="contained" className='col-sm-2 mt-4' startIcon={<Add/>}>
        Add row
      </Button>
      <Button onClick={(e) => this.change(e,-1,'addHeading')}
        variant="contained" className='col-sm-2 ml-2 mt-4' startIcon={<Add/>}>
        Add heading
      </Button>
    </div>);
  }

  showCreateDoctype(){
    return (
      <div className='row pt-5'>
        <FormControl fullWidth className='col-sm-4 ml-3 p-1'>
          <Input placeholder='Document type' value={this.state.tempDocType}
            onChange={e=>this.change(e,-2,'doctype')}     key='doctype' />
        </FormControl>
        <Button onClick={(e) => this.change(e,-2,'done')} variant="contained" size="large"
          className='col-sm-1 m-2' startIcon={<Done/>}>
          Done
        </Button>
      </div>
    );
  }

  showImport(){
    return (
      <div className='row py-5'>
        <div key='typeSelector' className='container-fluid'>
          <div className='row mt-1'>
            <div className='col-sm-3 text-right pt-2'>Collection:</div>
            <FormControl fullWidth className='col-sm-8'>
              <Select onChange={e=>this.changeImport(e,'collection')} value={this.state.selectCollection}>
                {this.state.listCollections.map((item)=>{
                  return (<MenuItem key={item} value={item}>{item}</MenuItem>);
                })}
              </Select>
            </FormControl>
            <div className='col-sm-3 text-right my-3 pt-2'>Scheme:</div>
            <FormControl fullWidth className='col-sm-8 my-3'>
              {Object.keys(this.state.remoteOntology).length>0&&
                <Select onChange={e=>this.changeImport(e,'scheme')} value={this.state.selectScheme}>
                  {Object.keys(this.state.remoteOntology).map((item)=>{
                    return (<MenuItem key={item} value={item}>{item}</MenuItem>);
                  })}
                </Select>
              }
            </FormControl>
            <div className='col-sm-3 text-right pt-2'>Save as type:</div>
            <FormControl fullWidth className='col-sm-7 p-1 pr-3'>
              <Input placeholder='Document type' value={this.state.tempDocType}
                onChange={e=>this.changeImport(e,'doctype')}     key='doctype' />
            </FormControl>
            <Button onClick={(e) => this.changeImport(e,'done')}
              variant="contained" size="large"
              className='col-sm-1 m-2'>
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }



  render(){
    if (this.props.display==='none') {
      return(<div></div>);
    }
    const ontologyLoaded = (this.state.ontology._id && this.state.ontology._id=='-ontology-');
    return (
      <div className="modal" style={{display: this.props.display}}>
        <div className="modal-content">
          <div  className="col border rounded p-3">
            {/*=======PAGE HEADING=======*/}
            <div className="col">
              <div className="row">
                <h1 className='col-sm-4 p-3'>Edit ontology</h1>
                <Button onClick={() => this.pressedLoadBtn()} variant="contained"
                  className='col-sm-2 m-3' startIcon={<GetApp/>}>
                    Load
                </Button>
                {ontologyLoaded && <Button onClick={() => this.pressedSaveBtn()} variant="contained"
                  className='col-sm-2 m-3' startIcon={<Save/>}>
                    Save
                </Button>}
                <Button onClick={() => this.props.callback('cancel')} variant="contained"
                  className='col-sm-2 float-right m-3' id='closeBtn' startIcon={<Cancel/>}>
                    Cancel
                </Button>
              </div>
            </div>
            {/*=======CONTENT=======*/}
            {!ontologyLoaded && <h4 className='m-3'>Start by loading current ontology.</h4>}
            {ontologyLoaded && <div className="form-popup m-2" >
              <form className="form-container">
                {this.showTypeSelector()}
                {this.state.docType==='--importNew--'&& this.showImport()}
                {this.state.docType==='--addNew--'&& this.showCreateDoctype()}
                {this.state.docType!='--importNew--' && this.state.docType!='--addNew--' && this.showForm()}
              </form>
            </div>}
          </div>
        </div>
      </div>
    );
  }
}
