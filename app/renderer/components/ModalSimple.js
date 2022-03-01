/* Simple modal that allows yes/no questions*/
import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { Button } from '@material-ui/core';// eslint-disable-line no-unused-vars
import { modal, modalContent, btn, flowText, h1 } from '../style';

export default class ModalSimple extends Component {
  constructor() {
    super();
  }

  /** Functions as class properties (immediately bound): react on user interactions **/
  pressedBtn=(choice)=>{
    if (choice==true)
      this.props.onYes();
    this.props.callback();
  }

  /** the render method **/
  render(){
    if (this.props.show==='none') {
      return(<div></div>);
    }
    return (
      <div className="modal" style={Object.assign({display: this.props.show},modal)}>
        <div className="modal-content" style={modalContent}>
          <div  className="col border rounded p-3">
            <div style={h1}>{this.props.title}</div>
            <div className="col">
              <div style={flowText}>
                {this.props.text}
              </div>
            </div>
            {/*=======PAGE HEADING=======*/}
            <div className="col">
              <div className="row">
                <div className='col-sm-1 p-1'>
                  <Button fullWidth onClick={()=>this.pressedBtn(true)} variant="contained" style={btn}>
                    YES
                  </Button>
                </div>
                <div className='col-sm-1 p-1'>
                  <Button fullWidth onClick={()=>this.pressedBtn(false)} variant="contained" style={btn}>
                    NO
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
