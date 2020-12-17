/* Header component: tabs at top of desktop
   filled automatically
*/
import React, { Component } from 'react';      // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom';       // eslint-disable-line no-unused-vars
import * as Actions from '../Actions';

const navStyle = {
  borderBottom:'1px solid #8E8C84'
};


export default class Header extends Component {
  //functions
  clickBtn(){
    Actions.restartDocType();
  }

  /**************************************
   * the render method
   **************************************/
  render() {
    var listItems = this.props.targets.map(
      (item,idx)=>
        <li className="nav-item" key={idx} >
          <Link onClick={this.clickBtn.bind(this)} className="nav-link" to={'/'+item}>{item}</Link>
        </li>
    );
    listItems = listItems.concat([
      <li className="nav-item" key="98">
        <Link className="nav-link" to='/Configuration' style={{borderLeft:'1px solid #8E8C84'}}>Configuration</Link>
      </li>
    ]);
    listItems = listItems.concat([
      <li className="nav-item" key="99">
        <Link className="nav-link" to='/Projects'>Synchronize</Link>
      </li>
    ]); //TODO SB P2 Make syncronize button connect

    return (
      <ul className="nav nav-pills" style={navStyle}>{listItems}</ul>
    );
  }
}
