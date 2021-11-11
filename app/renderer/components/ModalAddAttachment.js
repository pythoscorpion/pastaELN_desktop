/* Modal that allows the user to add/edit the ontology
*/
import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { Button, Input, FormControl, Select, MenuItem} from '@material-ui/core';// eslint-disable-line no-unused-vars
import { Alert } from '@material-ui/lab';                         // eslint-disable-line no-unused-vars
import Store from '../Store';
import { modal, modalContent, btn } from '../style';


export default class ModalAddAttachment extends Component {
  constructor() {
    super();
    this.state = {
      comment: '',
      choice: ''
    };
  }

  /** Functions as class properties (immediately bound): react on user interactions **/
  pressedSaveBtn=()=>{
    Store.addAttachment(this.state.comment, this.state.choice, this.props.name);
    this.props.callback(); //close
  }


  /** create html-structure; all should return at least <div></div>    .toUpperCase() **/
  showSelectionBox(){
    var question = Store.getOntology()[this.props.docType];
    question = question.filter(i=>{
      return (i.attachment && i.attachment==this.props.name);
    });
    var docType = question[0].docType;
    var docsList = Store.getDocsList(docType);
    if (!docsList)
      return <Alert severity="warning" key='selectBox'>
        Visit the following section: {this.props.docType}S
      </Alert>;
    docsList = [{name:'--detached--',id:''}].concat(docsList); //concat --detached-- to list
    var options = docsList.map((i)=>{
      return (<MenuItem value={i.id} key={i.id}>{i.name}</MenuItem>);
    });
    return(
      <div key='selectBox' className='container-fluid'>
        <div className='row mt-1'>
          <FormControl fullWidth className='col-sm-9'>
            <Select id='selectMenu' onChange={e=>this.setState({choice: e.target.value})}
              value={this.state.choice}>
              {options}
            </Select>
          </FormControl>
        </div>
      </div>);
  }


  /** the render method **/
  render(){
    if (this.props.display==='none') {
      return(<div></div>);
    }
    return (
      <div className="modal" style={Object.assign({display: this.props.display},modal)}>
        <div className="modal-content" style={modalContent}>
          <div  className="col border rounded p-3">
            {/*=======PAGE HEADING=======*/}
            <div className="col">
              <div className="row">
                <h1 className='col-sm-8 p-2'>Change attachment: {this.props.name}</h1>
                <div className='col-sm-1 p-1'>
                  <Button fullWidth onClick={() => this.pressedSaveBtn()} variant="contained"
                    style={btn}>
                      Save
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
            {this.showSelectionBox()}
            <FormControl fullWidth className='col-sm-9 mt-3'>
              <Input placeholder='comment' value={this.state.comment} key='comment'
                onChange={e=>this.setState({comment: e.target.value})} id='comment'/>
            </FormControl>

          </div>
        </div>
      </div>
    );
  }
}