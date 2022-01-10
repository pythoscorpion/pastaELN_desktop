/* Modal that allows the user to add/edit the ontology
*/
import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { Button, IconButton, Checkbox, Input, Select, MenuItem, FormControl} from '@material-ui/core';// eslint-disable-line no-unused-vars
import { Delete, ArrowUpward } from '@material-ui/icons';        // eslint-disable-line no-unused-vars
import { Alert } from '@material-ui/lab';                         // eslint-disable-line no-unused-vars
import axios from 'axios';
import Store from '../Store';
import * as Actions from '../Actions';
import ModalHelp from './ModalHelp';                             // eslint-disable-line no-unused-vars
import { modal, modalContent, btn } from '../style';
import { saveTableLabel } from '../localInteraction';

//TODO add description of doctype and link to terminology to ontology
//     {description:'laaeauouaoeu',-link:http} can be anywhere in the list
//     add link to terminology to each property in docType: easy -link
export default class ModalOntology extends Component {
  constructor() {
    super();
    this.state = {
      ontology: {},
      docType: '--addNew--',
      docLabels: {},
      tempDocType: '',
      listCollections: [''], selectCollection: '',
      remoteOntology: [], selectScheme:''
    };
    this.baseURL  = 'https://jugit.fz-juelich.de';
    this.basePath = 'pasta/ontology/-/raw/master/';
    this.defaultProperties = [{name:'name', query:'What is the name / ID?'},
      {name:'comment', query:'#tags comments remarks :field:value:'}];
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


  /** Functions as class properties (immediately bound): react on user interactions **/
  pressedLoadBtn=()=>{
    var ontology = Store.getOntology();
    this.setState({ontology: ontology});
    var docType = Object.keys(ontology).filter((item)=>{return item[0]!='_';})[0];
    if (ontology['x0'])  //have a fixed default
      docType= 'x0';
    if (docType == null)
      docType='--addNew--';
    this.setState({docType:docType, docLabels: Store.getDocTypeLabels()});
  }

  pressedSaveBtn=()=>{
    var ontology = this.state.ontology;
    // get rid of empty entries: names not given or empty
    for (var [key, value] of Object.entries(ontology)) {
      if (key[0]!='-' && key[0]!='_') {   //skip entries in ontology which are not for documents: _id, _rev
        value = value.filter((item)=>{
          return( (item.name && item.name.length>0)||(item.heading)||(item.attachment) );
        });  //filter out lines in docType
        value = value.map((item)=>{
          //console.log('before: '+JSON.stringify(item));
          if (item.heading) {
            item.heading = item.heading.trim();
            return item;
          }
          if (item.attachment) {
            item.attachment = item.attachment.trim();
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
          if (Store.itemDB.indexOf(item.name)>-1 && Store.itemSkip.indexOf(item.name)>-1 && item.query)
            item.name += '_';
          //console.log('after : '+JSON.stringify(item));
          return item;
        });
        ontology[key] = value;
      }
    }
    Store.updateDocument(ontology,false);  //save to database...directly
    saveTableLabel(this.state.docLabels);  //save docLabels to .pasta.json
    //clean
    this.setState({ ontology:{}, docLabels:{} });
    this.props.callback('save');
  }


  changeTypeSelector = (event,item) =>{
    /* change in row of "Data type": incl. delete */
    switch (item) {
    case 'doctype':
      this.setState({docType: event.target.value});
      break;
    case 'delete':
      var ontology = this.state.ontology;
      delete ontology[this.state.docType];
      var docTypes = Object.keys(ontology).filter(i=>{return i[0]!='_';}).sort();
      this.setState({ontology:ontology, docType:(docTypes.length>0)?docTypes[0]:'--addNew--'});
      break;
    case 'addSubType':
      this.setState({docType:'--addNewSub'+this.state.docType});
      break;
    case 'addLayer':
      var l = Object.keys(this.state.ontology).filter(i=>{return i[0]=='x';}).length;
      var docType = 'x'+l.toString();
      var ontology2 = this.state.ontology;
      ontology2[docType] = this.defaultProperties;
      var docLabels = this.state.docLabels;
      docLabels[docType] = 'sub'.repeat(l-2)+'tasks';
      docLabels[docType] = 'S'+docLabels[docType].slice(1);
      this.setState({docType:docType, ontology:ontology2, docLabels:docLabels});
      break;
    default:
      console.log('ModalOntology:changeTypeSelector: default case not possible');
    }
  }

  changeImport = (event,item) =>{
    /** change in import form **/
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
    /** change in form of this specific  doctype **/
    var ontology = this.state.ontology;
    if (row==-2) {    //change docType
      if (column==='doctype') {  //change the name of the docType
        var newString = event.target.value.replace(/^[_x\d]|\s|\W/g,'').toLowerCase();
        this.setState({tempDocType: newString});
      }
      else {    //pressed "Create" button after entering doctype name
        var docType = this.state.tempDocType;
        if (this.state.docType=='--addNew--') {
          ontology[docType] = this.defaultProperties;
        } else {
          var parentDocType = this.state.docType.slice(11);
          docType = parentDocType+'/'+this.state.tempDocType;
          ontology[docType] = [...ontology[parentDocType]];  //deep array copy
        }
        this.setState({docType:docType, tempDocType:''});
      }
    } else if (row==-1) { //select addRow or addHeading
      if (column==='addRow')
        ontology[this.state.docType] = ontology[this.state.docType].concat({name:''});
      if (column==='addHeading')
        ontology[this.state.docType] = ontology[this.state.docType].concat({heading:' '});
      if (column==='addAttachment')
        ontology[this.state.docType] = ontology[this.state.docType].concat({attachment:' '});
    } else {
      if (column=='delete') {
        ontology[this.state.docType].splice(row,1); //delete row in array
      } else if (column=='up') {
        if (row==0) //do nothing
          return;
        ontology[this.state.docType].splice(row-1, 0,  ontology[this.state.docType][row]);
        ontology[this.state.docType].splice(row+1,1);  //delete row+1
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


  /** create html-structure; all should return at least <div></div> **/
  showTypeSelector(){
    /* show type selector incl. delete button */
    var listTypes = Object.keys(this.state.ontology);
    listTypes     = listTypes.filter((item)=>{return item[0]!='_' && item[0]!='-';});
    listTypes.sort();
    var options = listTypes.map((item)=>{
      if (item[0]=='x')
        return (<MenuItem value={item} key={item}>Folder depth {parseInt(item[1])+1}</MenuItem>);
      return (<MenuItem value={item} key={item}>{item}</MenuItem>);
    });
    options = options.concat(
      <MenuItem key='--addNew--' value='--addNew--'>
        {'-- Add new --'}
      </MenuItem>);
    options = options.concat(
      <MenuItem key='--importNew' value='--importNew--'>
        {'-- Import from server --'}
      </MenuItem>);
    const numHierarchyDocTypes = listTypes.filter((item)=>{return item[0]=='x';}).length;
    const allowDelete = !(this.state.docType[1]!=numHierarchyDocTypes-1 && this.state.docType[0]=='x');
    return (
      <div key='typeSelector' className='container-fluid'>
        <div className='row'>
          <div className='col-sm-2 text-right pt-2'>
            Data type
          </div>
          <FormControl fullWidth className='col-sm-4'>
            <Select onChange={e=>this.changeTypeSelector(e,'doctype')}
              value={(this.state.docType.slice(0,11)==='--addNewSub') ? '' : this.state.docType}>
              {options}
            </Select>
          </FormControl>
          <FormControl fullWidth className='col-sm-4 p-1'>
            <Input placeholder='Label' value={this.state.docLabels[this.state.docType]}
              onChange={e=>this.change(e,null,'label')}  key={'label_doc_type'} />
          </FormControl>
          <div className='col-sm-1 pl-2 pr-0'>
            <Button onClick={(e) => this.changeTypeSelector(e,'delete')}
              variant="contained" style={btn} fullWidth disabled={!allowDelete}>
              Delete
            </Button>
          </div>
          <div className='col-sm-1 pl-2 pr-0'>
            <Button variant="contained" style={btn} fullWidth disabled={this.state.docType.slice(0,2)=='--'}
              onClick={e=>this.changeTypeSelector(e,(this.state.docType[0]=='x')?'addLayer':'addSubType')}>
              {(this.state.docType[0]=='x')? 'Add layer': 'Add subtype'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  showForm(){
    /* show form to change ontology*/
    var listRows = this.state.ontology[this.state.docType];
    if (listRows) {
      listRows = listRows.map((item,idx)=>{
        // if (item.attachment) {
        //   return <div></div>;
        // }
        if (!item.name && item.heading) {
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
        } else if (!item.name && item.attachment) {
          //IF ATTACHMENT
          return (
            <div key={'row'+idx.toString()} className='row p-3'>
              <div className='col-sm-2 pt-2'><strong>Attachment</strong></div>
              <FormControl fullWidth className='col-sm-4 p-1'>
                <Input required placeholder='Name' value={item.attachment}
                  onChange={e=>this.change(e,idx,'attachment')}     key={'attachment'+idx.toString()} />
              </FormControl>
              <FormControl fullWidth className='col-sm-4 p-1'>
                <Input required placeholder='doc-type' value={item.docType?item.docType:''}
                  onChange={e=>this.change(e,idx,'docType')} key={'docType'+idx.toString()} />
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
        } else {
          //IF NOT HEADING, nor attachment
          return(
            <div key={'row'+idx.toString()} className='row px-3'>
              <FormControl fullWidth className='col-sm-2 p-1'>
                <Input required placeholder='Name' value={item.name}
                  onChange={e=>this.change(e,idx,'name')}     key={'name'+idx.toString()} />
              </FormControl>
              <FormControl fullWidth className='col-sm-4 p-1'>
                <Input placeholder='Questions (keep empty to create automatically)'
                  value={item.query?item.query:''} onChange={e=>this.change(e,idx,'query')}
                  key={'query'+idx.toString()} />
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
        }
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
        variant="contained" className='col-sm-2 mt-4' style={btn} id='ontologyAddRow'>
        Add row
      </Button>
      <Button onClick={(e) => this.change(e,-1,'addHeading')}
        variant="contained" className='col-sm-2 ml-2 mt-4' style={btn} id='ontologyAddHeading'>
        Add heading
      </Button>
      <Button onClick={(e) => this.change(e,-1,'addAttachment')}
        variant="contained" className='col-sm-2 ml-2 mt-4' style={btn}  id='ontologyAddAttach'>
        Add attachment
      </Button>
    </div>);
  }

  showCreateDoctype(doctype){
    /* create a new doctype form*/
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
        <Alert className='col-sm-4' severity='info'>
          Single case of type name!
        </Alert>
        <Button onClick={(e) => this.change(e,-2,'done')} variant="contained"
          className='col-sm-1 m-2' style={btn}>
          Create
        </Button>
      </div>
    );
  }

  showImport(){
    /* form for getting ontology from remote server*/
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
              Import
            </Button>
          </div>
        </div>
      </div>
    );
  }


  /** the render method **/
  render(){
    if (this.props.display==='none') {
      return(<div></div>);
    }
    const ontologyLoaded = (this.state.ontology._id && this.state.ontology._id=='-ontology-');
    return (
      <div className="modal" style={Object.assign({display: this.props.display},modal)}>
        <ModalHelp />
        <div className="modal-content" style={modalContent}>
          <div  className="col border rounded p-3">
            {/*=======PAGE HEADING=======*/}
            <div className="col">
              <div className="row">
                <h1 className='col-sm-8 p-2'>Edit questionnaires</h1>
                <div className='col-sm-1 p-1' >
                  <Button fullWidth onClick={() => this.pressedLoadBtn()} variant="contained"
                    style={btn} id='ontologyLoadBtn'>
                    Load
                  </Button>
                </div>
                {ontologyLoaded &&
                  <div className='col-sm-1 p-1'>
                    <Button fullWidth onClick={() => this.pressedSaveBtn()} variant="contained"
                      style={btn}>
                      Save
                    </Button>
                  </div>}
                <div className='col-sm-1 p-1'>
                  <Button fullWidth onClick={() => Actions.showHelp('ontology')} variant="contained"
                    id='helpBtn' style={btn}>
                    Help
                  </Button>
                </div>
                <div className='col-sm-1 p-1'>
                  <Button fullWidth onClick={() => {
                    this.setState({ontology:{}});
                    this.props.callback('cancel');
                  }} variant="contained" id='closeBtn' style={btn}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
            {/*=======CONTENT=======*/}
            {!ontologyLoaded &&     <h4 className='m-3'>Start by loading current ontology.</h4>}
            {!this.state.docType && <h4 className='m-3'>Ontology is incorrect.</h4>}
            {ontologyLoaded && this.state.docType && <div className="form-popup m-2" >
              <form className="form-container">
                {this.state.docType.slice(0,8)!='--addNew'     && this.showTypeSelector()}
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
