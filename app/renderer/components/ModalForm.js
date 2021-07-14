/* Modal shown for new items and edit of existing items
*/
import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { Button, TextField, InputAdornment, Input, Select, MenuItem, FormControl} from '@material-ui/core';// eslint-disable-line no-unused-vars
import { Alert } from '@material-ui/lab';                         // eslint-disable-line no-unused-vars
import Store from '../Store';
import * as Actions from '../Actions';
import dispatcher from '../Dispatcher';
import { modal, modalContent, btn } from '../style';

export default class ModalForm extends Component {
  constructor() {
    super();
    this.state = {
      //modal items
      dispatcherToken: null,
      display: 'none',
      kind: null,  //new or edit
      doc: null,
      //form items
      skipItems: ['tags','image','curated','type'],
      ontologyNode: null,
      values: {},
      disableSubmit: false
    };
  }
  //component mounted immediately, even if Modal not shown
  componentDidMount() {
    this.setState({dispatcherToken: dispatcher.register(this.handleActions)});
  }
  componentWillUnmount() {
    dispatcher.unregister(this.state.dispatcherToken);
  }


  /** Functions as class properties (immediately bound): react on user interactions **/
  handleActions=(action)=>{     //Modal show; first function
    if (action.type==='SHOW_FORM') {
      //create & use ontologyNode: which rows exist, are they required, are they a list
      var ontologyNode = null;
      if (typeof action.ontologyNode =='string') //know docType/subDocType
        ontologyNode = Store.getOntologyNode(action.ontologyNode);
      else if (action.ontologyNode)              //data delivered by action: hierarchy tree items from project
        ontologyNode = action.ontologyNode;
      else
        ontologyNode = Store.getOntologyNode();    //default case
      ontologyNode = ontologyNode.filter((item)=>{
        if (item.required)
          this.setState({disableSubmit: true});
        return !this.state.skipItems.includes(item.name);
      });
      //create values
      var values = {};
      var originalDoc = {};
      if (action.kind=='new') {
        if (!action.doc)
          ontologyNode = [{name:'_project', query:'Which project does it belong to?', list:'project'}]
            .concat(ontologyNode);
        ontologyNode.forEach((item)=>{
          if(item.name && !values[item.name])
            values[item.name]='';
        });
        if (action.doc) {
          values['type'] = action.doc.type;
          originalDoc = action.doc;
        } else if (typeof action.ontologyNode =='string') {
          originalDoc['type'] = action.ontologyNode.split('/');
        }
      } else {
        if (action.doc)
          values = action.doc;
        else
          values = Store.getDocumentRaw();
        originalDoc = values;
        Object.keys(values).map((item)=>{
          const inOntologyNode = ontologyNode.map(i=>{return i.name;}).indexOf(item)>-1;
          if (!inOntologyNode && Store.itemSkip.indexOf(item)==-1 && Store.itemDB.indexOf(item)==-1 ) {
            ontologyNode.push({name:item, unit:'', required:false, list:null});
          }
        });
      }
      this.setState({values:values, kind:action.kind, ontologyNode:ontologyNode,
        doc:originalDoc, display:'block'});
    }
  }

  submit=()=>{
    /* submit button clicked */
    var values = this.state.values;
    if (this.state.doc && this.state.doc.type)
      values['type'] = this.state.doc.type;
    if (this.state.kind==='new')  //case new document
      if (values.type && values.type[0]==='text' && values.type[1]!='project')
        Actions.changeTextDoc(values, this.state.doc);   //create/change information in Project.js only
      else
        Actions.createDoc(values);                       //create/change in database
    else                          //case update document with existing docID, change in database
      Actions.updateDoc(values, this.state.doc);
    this.setState({display:'none'});
  }

  change=(event,key)=>{
    /* text field changes value */
    var values = this.state.values;
    values[key] = event.target.value;
    var disableSubmit = false;
    this.state.ontologyNode.map((item)=>{
      if ((!this.state.values[item.name]||this.state.values[item.name].length==0) && item.required)
        disableSubmit=true;
      if (item.list && typeof item.list==='string' && !Store.getDocsList(item.list))
        disableSubmit=true;
    });
    this.setState({values: values, disableSubmit: disableSubmit});
  }


  /** create html-structure; all should return at least <div></div> **/
  showList() {
    const items = this.state.ontologyNode.map( (item,idx) => {
      var text = item.name && item.name[0]=='_' ? item.name.slice(1)+':' : item.name+':';
      if (item.required)
        text += '  *';
      // if selection box: returns <div></div>
      if (item.list) {
        var options = null;
        if (typeof item.list==='string') {//doctype
          var docsList = Store.getDocsList(item.list);
          if (!docsList)
            return <Alert severity="warning" key={idx.toString()}>
              Visit the following section: {item.list.toUpperCase()}S
            </Alert>;
          docsList = [{name:'---',id:''}].concat(docsList); //concat --- to list
          options = docsList.map((item)=>{
            return (<MenuItem value={item.id} key={item.id}>{item.name}</MenuItem>);
          });
        } else {  //lists defined by ontology
          options = item.list.map((item)=>{
            return (<MenuItem value={item} key={item}>{item}</MenuItem>);
          });
        }
        return(
          <div key={idx.toString()} className='container-fluid'>
            <div className='row mt-1'>
              <div className='col-sm-3 text-right pt-2'>{text}</div>
              <FormControl fullWidth className='col-sm-9'>
                <Select id={item.name} onChange={e=>this.change(e,item.name)}
                  value={this.state.values[item.name] ? this.state.values[item.name] :''}>
                  {options}
                </Select>
              </FormControl>
            </div>
          </div>);
      }
      // if heading: return <div></div>
      if (item.heading){
        return(
          <div className='row mt-4 px-4 pt-2' key={idx.toString()}>
            <h1 className='col-sm-2 text-right'> </h1>
            <h1 className='col-sm-10'>{item.heading}     </h1>
          </div>);
      }
      // if text area: returns <div></div>
      if (item.name==='comment' || item.name==='content') {
        return(
          <div className='row mt-1 px-4' key={idx.toString()}>
            <div className='col-sm-3 text-right pt-2'>{text}</div>
            <TextField multiline rows={10} fullWidth className='col-sm-9'
              key={item.name} value={this.state.values[item.name]}
              required={item.required} placeholder={item.query} onChange={e=>this.change(e,item.name)} />
          </div>);
      }
      // if normal input: returns <div></div>
      return(
        <div className='row mt-1 px-4' key={idx.toString()} >
          <div className='col-sm-3 text-right pt-2'>{text}</div>
          <FormControl fullWidth className='col-sm-9'>
            <Input required={item.required} placeholder={item.query}
              value={this.state.values[item.name]}
              onChange={e=>this.change(e,item.name)} key={item.name} id={item.name}
              endAdornment={<InputAdornment position="end">{item.unit ? item.unit : ''}
              </InputAdornment>} />
          </FormControl>
        </div>);
    });
    //return the as-created list of items
    return <div>{items}</div>;
  }

  showImage() {
    const {image} = this.state.values;
    if (!image)
      return <div key='image'></div>;
    if (image.substring(0,4)==='<?xm') {
      const base64data = btoa(unescape(encodeURIComponent(image)));
      return (
        <div className='d-flex justify-content-center' key='image'>
          <img src={'data:image/svg+xml;base64,'+base64data} width='40%' alt='svg-format'></img>
        </div>);
    } else {
      return (
        <div className='d-flex justify-content-center'  key='image'>
          <img src={image} width='40%' alt='base64-format'></img>
        </div>);
    }
  }


  /** the render method **/
  render(){
    if (!this.state.ontologyNode)
      return <div></div>;
    return (
      <div className="modal" style={Object.assign({display: this.state.display},modal)}>
        <div className="modal-content" style={modalContent}>
          <div  className="col border rounded p-3">
            {this.showImage()}
            <div className="form-popup m-2" >
              <form className="form-container">
                {this.showList()}
                <Button onClick={()=>this.submit()} disabled={this.state.disableSubmit && true}
                  variant="contained" className='float-right m-3' id='submitBtn' style={btn}>
                    Submit
                </Button>
                <Button onClick={()=>this.setState({display:'none'})}
                  variant="contained" className='float-right m-3' id='closeBtn' style={btn}>
                    Cancel
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
