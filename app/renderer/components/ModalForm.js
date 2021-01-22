import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { Button, TextField, InputAdornment, Input, FormControl} from '@material-ui/core';
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
      //form items
      skipItems: ['tags','image','curate','type'],
      tableMeta: null,
      values: null,
      disableSubmit: false
    };
  }
  //component mounted immediately, even if Modal not shown
  componentDidMount() {
    this.setState({dispatcherToken: dispatcher.register(this.handleActions)});
    var tableMeta = Store.getTableMeta();
    tableMeta = tableMeta.filter((item)=>{
      if (item.required)
        this.setState({disableSubmit: true});
      return !this.state.skipItems.includes(item.name);
    });
    this.setState({tableMeta:tableMeta});
  }
  componentWillUnmount() {
    dispatcher.unregister(this.state.dispatcherToken);
  }


  /* Functions are class properties: immediately bound: upon changes functions */
  handleActions=(action)=>{     //Modal show
    if (action.type==='SHOW_FORM')
      this.setState({display:'block'});
      this.getValues(action.kind);
  }

  submit=()=>{                 //submit button clicked
    if (Object.values(this.state.values).join('').length>2) {
      var doc = {};
      this.state.tableMeta.map((item,idx)=>{doc[item.name]=this.state.values[idx];});
      Actions.createDoc(doc);
    }
  }

  change=(event,idx)=>{       //text field changes value
    var values = this.state.values;
    values[idx] = event.target.value;
    this.setState({values: values});
    this.setState({disableSubmit: false});
    this.state.tableMeta.map((item,idx)=>{
      if (this.state.values[idx].length==0 && item.required)
        this.setState({disableSubmit: true});
    });
  }

  getValues=(kind)=>{         //fill values
    if (kind=='new') {
      console.log('get new values ',kind);
      const values = Array(this.state.tableMeta.length).fill('');
      this.setState({values:values});
    } else {
      console.log('get existing values ',kind);
      var doc = Store.getDocument();
    }
  }


  /* process data and create html-structure; all should return at least <div></div> */
  showList() {
    const items = this.state.tableMeta.map( (item,idx) => {
      var text = item.name+':';
      if (item.required)
        text += '  *';
      // if selection box: returns <div></div>
      if (item.list) {
        if (typeof item.list==='string') {//doctypes
          var docsList = Store.getDocsList(item.list);
          if (docsList)
            docsList = [{name:'---',id:''}].concat(docsList); //concat --- to list
          else
            docsList = [{name:'visit page first: '+item.list,id:'000'}];
          var options = "";
          if (docsList) {
            options = docsList.map((item)=>{return <option value={item.id} key={item.id}>{item.name}</option>});
          }
        } else {  //lists defined by ontology
          const options = item.list.map((item)=>{return <option value={item} key={item}>{item}</option>});
        }
        return(
          <div key={idx.toString()} className='container-fluid'>
          <div className='row mt-1'>
            <div className='col-sm-2 px-0' style={{fontSize:14}}>{item.name}</div>
            <select onChange={e=>this.newChange(e,idx)} key={item.name}>{options}</select>&nbsp;{item.unit}
          </div>
        </div>);
      }
      // if text area: returns <div></div>
      if (item.name==='comment') {
        return(
          <div className='row mt-1 px-4' key={idx.toString()}>
            <div className='col-sm-3 text-right'>{text}</div>
            <TextField multiline rows={3} fullWidth className='col-sm-9'
              required={item.required} placeholder={item.query} onChange={e=>this.change(e,idx)} />
          </div>);
      }
      // if normal input: returns <div></div>
      return(
        <div className='row mt-1 px-4' key={idx.toString()} >
          <div className='col-sm-3 text-right'>{text}</div>
          <FormControl fullWidth className='col-sm-9'>
            <Input required={item.required} placeholder={item.query} onChange={e=>this.change(e,idx)}
              endAdornment={<InputAdornment position="end">{item.unit}</InputAdornment>} />
          </FormControl>
        </div>);
    });
    //return the as-created list of items
    return <div>{items}</div>;
  }


  render(){
    if (!this.state.tableMeta)
      return <div></div>;
    return (
      <div className="modal" style={{display: this.state.display}}>
        <div className="modal-content">
          <div  className="col border rounded p-1 p-1">
            <div className="form-popup m-2" >
              <form className="form-container">
                {this.showList()}
                <Button onClick={()=>this.submit()}
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
