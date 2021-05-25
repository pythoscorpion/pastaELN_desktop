import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { Button, IconButton, Checkbox, Input, Select, MenuItem, FormControl} from '@material-ui/core';// eslint-disable-line no-unused-vars
import { Delete, ArrowUpward, GetApp, Save, Cancel, Done, Add } from '@material-ui/icons';// eslint-disable-line no-unused-vars
import axios from 'axios';
import Store from '../Store';
import { modal, modalContent, btn } from '../style';

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
      this.pressedLoadBtn();
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
    var ontology = this.state.ontology;
    // get rid of empty entries: names not given or empty
    for (var [key, value] of Object.entries(ontology)) {
      if (key[0]!='-' && key[0]!='_') {   //skip entries in ontology which are not for documents: _id, _rev
        value = value.filter((item)=>{ return( (item.name && item.name.length>0)||(item.heading) ); });  //filter out lines in docType
        value = value.map((item)=>{
          //console.log('before: '+JSON.stringify(item));
          if (item.heading) {
            item.heading = item.heading.trim();
            return item;
          }
          item.name = item.name.trim().replace(/^[_\d]/g,'');
          ['query','unit'].forEach((i)=>{
            if (item[i]) {
              item[i]= item[i].trim().replace('\n','');
              if (item[i]=='')
                delete item[i];
            }
          });
          if (item.list && typeof item.list=='string') {
            item.list = item.list.split(',').map(i => i.trim());
            if (item.list.length==0)
              delete item.list;
            if (item.list.length==1)
              item.list = item.list[0];
          }
          //temporary things to clean MO ontology
          if (item.colWidth)
            delete item.colWidth;
          if (typeof item.list !== 'undefined' && item.list===null)
            delete item.list;
          if (typeof item.required !== 'undefined' && item.required==false)
            delete item.required;
          //end of temporary things to clean MO ontology
          if (Store.itemDB.indexOf(item.name)>-1 && Store.itemSkip.indexOf(item.name)>-1 && item.query)
            item.name += '_';
          //console.log('after : '+JSON.stringify(item));
          return item;
        });
        ontology[key] = value;
      }
    }
    this.setState({ontology:ontology});
    Store.updateDocument(this.state.ontology,false);
    this.props.callback('save');
    this.pressedLoadBtn();
  }


  /*CHANGE IN THE FORMS: incl. change of selection boxes*/
  changeTypeSelector = (event,item) =>{
    //change in row of "Data type": incl. delete
    switch (item) {
    case 'doctype':
      this.setState({docType: event.target.value});
      break;
    case 'delete':
      var ontology = this.state.ontology;
      delete ontology[this.state.docType];
      this.setState({ontology:ontology});
      this.setState({docType:'--addNew--'});
      break;
    case 'addSubType':
      this.setState({docType:'--addNewSub'+this.state.docType});
      break;
    default:
      console.log('ModalOntology:changeTypeSelector: default case not possible');
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
      if (column==='doctype') {  //change the name of the docType
        var newString = event.target.value.replace(/^[_x\d]|\s|\W/g,'').toLowerCase();
        this.setState({tempDocType: newString});
      }
      else {    //pressed Done button after entering doctype name
        var docType = this.state.tempDocType;
        if (this.state.docType=='--addNew--') {
          ontology[docType] = [{name:'name'},{name:'comment'}];
        } else {
          var parentDocType = this.state.docType.slice(11);
          docType = parentDocType+'/'+this.state.tempDocType;
          ontology[docType] = ontology[parentDocType];
        }
        this.setState({docType:docType, tempDocType:''});
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
        else if (column=='name') {
          var newString2 = event.target.value.replace(/^[_\d]|\s|\W/g,'');
          newString2 = newString2.charAt(0).toLowerCase() + newString2.slice(1);
          ontology[this.state.docType][row][column] = newString2;
        } else
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
      return (<MenuItem value={item} key={item}>{item}</MenuItem>);
    });
    options = options.concat(<MenuItem key='--addNew--' value='--addNew--'>{'-- Add new --'}</MenuItem>);
    options = options.concat(
      <MenuItem key='--importNew' value='--importNew--'>
        {'-- Import from server --'}
      </MenuItem>);
    return (
      <div key='typeSelector' className='container-fluid'>
        <div className='row'>
          <div className='col-sm-2 text-right pt-2'>
            Data type
          </div>
          <FormControl fullWidth className='col-sm-8'>
            <Select onChange={e=>this.changeTypeSelector(e,'doctype')}
              value={(this.state.docType.slice(0,11)==='--addNewSub') ? '' : this.state.docType}>
              {options}
            </Select>
          </FormControl>
          <div className='col-sm-1 pl-2 pr-0'>
            <Button onClick={(e) => this.changeTypeSelector(e,'delete')}
              variant="contained" style={btn} fullWidth>
              Delete
            </Button>
          </div>
          <div className='col-sm-1 pl-2 pr-0'>
            <Button onClick={(e) => this.changeTypeSelector(e,'addSubType')} variant="contained"
              style={btn} fullWidth disabled={this.state.docType.slice(0,2)=='--'}>
              Add subtype
            </Button>
          </div>
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
          <div key={'row'+idx.toString()} className='row px-3'>
            <FormControl fullWidth className='col-sm-2 p-1'>
              <Input required placeholder='Name' value={item.name}
                onChange={e=>this.change(e,idx,'name')}     key={'name'+idx.toString()} />
            </FormControl>
            <FormControl fullWidth className='col-sm-4 p-1'>
              <Input placeholder='Questions, keep empty to create automatic' value={item.query?item.query:''}
                onChange={e=>this.change(e,idx,'query')}    key={'query'+idx.toString()} />
            </FormControl>
            <FormControl fullWidth className='col-sm-4 p-1'>
              <Input placeholder='Is this a list? (, separated)' value={item.list?item.list:''}
                onChange={e=>this.change(e,idx,'list')}     key={'list'+idx.toString()} />
            </FormControl>
            <div key={'subrow'+idx.toString()} className='col-sm-2 row pl-2 pr-0'>
              <Checkbox className='col-sm-3'
                checked={item.required?item.required:false}
                onChange={e=>this.change(e,idx,'required')}
              />
              <FormControl fullWidth className='col-sm-6 p-1'>
                <Input placeholder='m' value={item.unit?item.unit:''}
                  onChange={e=>this.change(e,idx,'unit')}     key={'unit'+idx.toString()} />
              </FormControl>
              <div className='col-sm-3 px-0'>
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
          </div>);
      });
    }
    return (<div>
      {listRows &&
        <div className='row mt-5 px-3'>
          <div className='col-sm-2 pl-1'>Name:</div>
          <div className='col-sm-4 pl-1'>Query:</div>
          <div className='col-sm-4 pl-1'>List:</div>
          <div className='col-sm-2 row'>
            <div className='col-sm-3 ml-0 pl-0'>Required</div>
            <div className='col-sm-6 pl-1'>Unit:</div>
          </div>
        </div>
      }
      {listRows}
      <Button onClick={(e) => this.change(e,-1,'addRow')}
        variant="contained" className='col-sm-2 mt-4' style={btn}>
        Add row
      </Button>
      <Button onClick={(e) => this.change(e,-1,'addHeading')}
        variant="contained" className='col-sm-2 ml-2 mt-4' style={btn}>
        Add heading
      </Button>
    </div>);
  }

  showCreateDoctype(doctype){
    var lineHeader = null;
    if (doctype.slice(0,11)=='--addNewSub') {
      lineHeader = doctype.slice(11)+' / ';
    }
    return (
      <div className='row pt-5'>
        <div className='col-sm-2 text-right pt-2 pr-0'>
          Name: {lineHeader && <strong>{lineHeader}</strong>}
        </div>
        <FormControl fullWidth className='col-sm-4 ml-3 p-1'>
          <Input placeholder='Document type' value={this.state.tempDocType}
            onChange={e=>this.change(e,-2,'doctype')}     key='doctype' />
        </FormControl>
        <Button onClick={(e) => this.change(e,-2,'done')} variant="contained"
          className='col-sm-1 m-2' style={btn}>
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
            <Button onClick={(e) => this.changeImport(e,'done')} variant="contained"
              className='col-sm-1 m-2' style={btn}>
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
      <div className="modal" style={Object.assign({display: this.props.display},modal)}>
        <div className="modal-content" style={modalContent}>
          <div  className="col border rounded p-3">
            {/*=======PAGE HEADING=======*/}
            <div className="col">
              <div className="row">
                <h1 className='col-sm-6 p-2'>Edit ontology</h1>
                <div className='col-sm-2 p-1' >
                  <Button fullWidth onClick={() => this.pressedLoadBtn()} variant="contained"
                    style={btn}>
                    Load
                  </Button>
                </div>
                {ontologyLoaded &&
                  <div className='col-sm-2 p-1'>
                    <Button fullWidth onClick={() => this.pressedSaveBtn()} variant="contained"
                      style={btn}>
                      Save
                    </Button>
                  </div>}
                <div className='col-sm-2 p-1'>
                  <Button fullWidth onClick={() => this.props.callback('cancel')} variant="contained"
                    id='closeBtn' style={btn}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
            {/*=======CONTENT=======*/}
            {!ontologyLoaded && <h4 className='m-3'>Start by loading current ontology.</h4>}
            {ontologyLoaded && <div className="form-popup m-2" >
              <form className="form-container">
                {this.showTypeSelector()}
                {this.state.docType=='--importNew--'           && this.showImport()}
                {this.state.docType=='--addNew--'              && this.showCreateDoctype('--basetype--')}
                {this.state.docType.slice(0,11)=='--addNewSub' && this.showCreateDoctype(this.state.docType)}
                {this.state.docType.slice(0,2) !='--'          && this.showForm()}
              </form>
            </div>}
          </div>
        </div>
      </div>
    );
  }
}
