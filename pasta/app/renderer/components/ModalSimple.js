/* Simple modal that allows yes/no questions*/
import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { Button } from '@material-ui/core';// eslint-disable-line no-unused-vars
import { modal, modalContent, btn, btnStrong, flowText, h1 } from '../style';

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
    const secondStyle = (this.props.color) ? {backgroundColor:this.props.color, color:'white'} : btnStrong;
    return (
      <div className="modal" style={{...modal, display: this.props.show}}>
        <div className="modal-content" style={{...modalContent, width:'30%'}}>
          <div  className="col p-0">
            <div className="px-3" style={{...h1, ...secondStyle}}>
              {this.props.title}
            </div>
            <div className="col">
              <div style={flowText}>
                {this.props.text}
              </div>
            </div>
            <div className="col">
              <div className="row">
                <div className='px-3 py-2'>
                  <Button fullWidth onClick={()=>this.pressedBtn(true)} variant="contained" style={btn}>
                    YES
                  </Button>
                </div>
                <div className='py-2'>
                  <Button fullWidth onClick={()=>this.pressedBtn(false)} variant="contained" style={btnStrong}>
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
