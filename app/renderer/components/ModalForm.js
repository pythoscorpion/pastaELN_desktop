/* Modal shown for new items and edit of existing items
*/
import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { Button, TextField, InputAdornment, Input, Select, MenuItem, FormControl} from '@material-ui/core';// eslint-disable-line no-unused-vars
import { Alert } from '@material-ui/lab';                         // eslint-disable-line no-unused-vars
import Store from '../Store';
import * as Actions from '../Actions';
import dispatcher from '../Dispatcher';


export default class ModalForm extends Component {
  constructor() {
    super();
    this.state = {
      //modal items
      dispatcherToken: null,
      display: 'none',
      kind: null,  //new or edit
      //form items
      skipItems: ['tags','image','curate','type'],
      tableMeta: null,
      values: {},
      disableSubmit: false
    };
  }
  //component mounted immediately, even if Modal not shown
  componentDidMount() {
    this.setState({dispatcherToken: dispatcher.register(this.handleActions)});
    var tableMeta = Store.getTableMeta();
    //same as in handleActions
    tableMeta = tableMeta.filter((item)=>{
      if (item.required)
        this.setState({disableSubmit: true});
      return !this.state.skipItems.includes(item.name);
    });
    var values = {};
    tableMeta.forEach((item)=>{
      values[item.name]='';
    });
    this.setState({tableMeta:tableMeta, values:values});
  }
  componentWillUnmount() {
    dispatcher.unregister(this.state.dispatcherToken);
  }


  /* Functions are class properties: immediately bound: upon changes functions */
  handleActions=(action)=>{     //Modal show
    if (action.type==='SHOW_FORM')
      this.setState({display:'block'});
    if (action.tableMeta) {    //data delivered by action: hierarchy tree items from project
      //same as componentDidMount
      const tableMeta = action.tableMeta.filter((item)=>{
        if (item.required)
          this.setState({disableSubmit: true});
        return !this.state.skipItems.includes(item.name);
      });
      var values = {};
      tableMeta.forEach((item)=>{
        values[item.name]=action.doc[item.name];
      });
      this.setState({tableMeta:tableMeta, values:values, kind:action.kind, doc:action.doc});
    } else {                    //data not delivered by action, get it from Store: default
      this.getValues(action.kind);
    }
  }

  submit=()=>{                 //submit button clicked
    if (this.state.kind==='new')
      Actions.createDoc(this.state.values);
    else
      Actions.updateDoc(this.state.values, this.state.doc);
    this.setState({display:'none'});
  }

  change=(event,key)=>{       //text field changes value
    var values = this.state.values;
    values[key] = event.target.value;
    this.setState({values: values, disableSubmit: false});
    this.state.tableMeta.map((item)=>{
      if (this.state.values[item.name].length==0 && item.required)
        this.setState({disableSubmit: true});
    });
  }

  getValues=(kind)=>{         //fill values after button was pressed
    var values = {};          //new document: empty everything
    if (kind=='edit') {
      values = Store.getDocumentRaw();
    }
    this.state.tableMeta.forEach((item)=>{
      if(!values[item.name])
        values[item.name]='';
    });
    this.setState({values:values, kind:kind});
  }


  /* process data and create html-structure; all should return at least <div></div> */
  showList() {
    const items = this.state.tableMeta.map( (item,idx) => {
      var text = item.name+':';
      if (item.required)
        text += '  *';
      // if selection box: returns <div></div>
      if (item.list) {
        var options = null;
        if (typeof item.list==='string') {//doctype
          var docsList = Store.getDocsList(item.list);
          if (!docsList)
            return (<Alert severity="warning" key={idx.toString()}>Visit the following section: {item.list.toUpperCase()}S</Alert>);
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
                <Select id={item.name} onChange={e=>this.change(e,item.name)} value={this.state.values[item.name]}>
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
      if (item.name==='comment') {
        return(
          <div className='row mt-1 px-4' key={idx.toString()}>
            <div className='col-sm-3 text-right pt-2'>{text}</div>
            <TextField multiline rows={3} fullWidth className='col-sm-9'
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
              endAdornment={<InputAdornment position="end">{item.unit}</InputAdornment>} />
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

  render(){
    if (!this.state.tableMeta)
      return <div></div>;
    return (
      <div className="modal" style={{display: this.state.display}}>
        <div className="modal-content">
          <div  className="col border rounded p-3">
            {this.showImage()}
            <div className="form-popup m-2" >
              <form className="form-container">
                {this.showList()}
                <Button onClick={()=>this.submit()} disabled={this.state.disableSubmit && true}
                  variant="contained" className='float-right m-3' id='submitBtn'>
                    Submit
                </Button>
                <Button onClick={()=>this.setState({display:'none'})}
                  variant="contained" className='float-right m-3' id='closeBtn'>
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
