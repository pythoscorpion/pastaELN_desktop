/* Modal that allows the user to ... attachment to instrument, measurement or just a remark
*/
import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { Button, TextField, FormControl, Select, MenuItem, Checkbox} from '@material-ui/core';// eslint-disable-line no-unused-vars
import { Alert } from '@material-ui/lab';                         // eslint-disable-line no-unused-vars
import Flag from '@material-ui/icons/Flag';                       // eslint-disable-line no-unused-vars
import OutlinedFlag from '@material-ui/icons/OutlinedFlag';       // eslint-disable-line no-unused-vars
import Store from '../Store';
import { modal, modalContent, btn, flowText, h1, btnStrong, colorWarning } from '../style';


export default class ModalAddAttachment extends Component {
  constructor() {
    super();
    this.state = {
      remark: '',
      choice: '',
      flag: false
    };
  }

  /** Functions as class properties (immediately bound): react on user interactions **/
  pressedSaveBtn=()=>{
    //find if attachments or issue
    var question = Store.getOntology()[this.props.docType];
    question = question.filter(i=>{
      return (i.attachment && i.attachment==this.props.name);
    });
    var docType = question[0].docType;
    const choice = (docType) ? this.state.choice : null;  //if issue null; if real attachment: a string
    //save data
    Store.addAttachment(this.state.remark, choice, this.state.flag, this.props.name);
    this.setState({remark: '', choice: '', flag:false}); //reinitialize for next run through
    this.props.callback(); //close
  }


  /** create html-structure; all should return at least <div></div>    .toUpperCase() **/
  showSelectionBox(){
    var question = Store.getOntology()[this.props.docType];
    question = question.filter(i=>{
      return (i.attachment && i.attachment==this.props.name);
    });
    if (question.length!=1) {
      return <Alert severity="error">Error occurred in ModalAddAttachment: Check ontology</Alert>;
    }
    var attachDocType = question[0].docType;
    if (!attachDocType) {  //if no docType: this must be an issue
      return <div></div>;
    }
    var docsList = Store.getDocsList(attachDocType);
    if (!docsList)
      return <Alert severity="warning" key='selectBox' className='mx-3'>
        Visit the following section: {attachDocType}
      </Alert>;
    docsList = [{name:'--detached--',id:''}].concat(docsList); //concat --detached-- to list
    var options = docsList.map((i)=>{
      return (<MenuItem value={i.id} key={i.id}>{i.name}</MenuItem>);
    });
    return(
      <div className='p-3' key='selectBox'>
        <FormControl fullWidth>
          <Select id='selectMenu' onChange={e=>this.setState({choice: e.target.value})}
            value={this.state.choice}>
            {options}
          </Select>
        </FormControl>
      </div>);
  }


  /** the render method **/
  render(){
    if (this.props.show==='none') {
      return(<div></div>);
    }
    return (
      <div className="modal" style={{...modal, ...{display: this.props.show}}}>
        <div className="modal-content" style={{...modalContent, width:'30%'}}>
          <div  className="col p-0">
            {/*=======PAGE HEADING=======*/}
            <div className="p-3 mb-2" style={{...h1, ...btnStrong}}>
              Change attachment: {this.props.name}
            </div>
            {/*=======CONTENT=======*/}
            {this.showSelectionBox()}

            <FormControl fullWidth className='px-3'>
              <TextField multiline rows={4} key='remark' placeholder='remark' variant="outlined"
                value={this.state.remark} onChange={e=>this.setState({remark: e.target.value})} />
            </FormControl>

            <div className='col px-3'>
              <div className='row'>
                <div style={flowText} className='px-3 py-1'>Flag this entry:</div>
                <Checkbox checked={this.state.flag} onChange={()=>{this.setState({flag: !this.state.flag});}}
                  className='py-1' icon={<OutlinedFlag/>}
                  checkedIcon={<Flag style={{color:colorWarning}} />}/>
              </div>
            </div>

            <div className='col px-3'>
              <div className='row'>
                <div className='col-sm-3 px-3 py-2'>
                  <Button fullWidth onClick={() => this.pressedSaveBtn()} variant="contained"
                    style={btnStrong}>
                    Save
                  </Button>
                </div>
                <div className='col-sm-3 py-2'>
                  <Button fullWidth onClick={() => {
                    this.setState({ ontology: {} });
                    this.props.callback('cancel');
                  }} variant="contained" id='closeBtn' style={btn}>
                  Cancel
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
}
