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
  clickBtn(){
    Actions.restartDocType();
  }

  render() {
    const targets = this.props.targets.concat(['Config']);
    const listItems = targets.map(
      (item,idx)=>
        <li className="nav-item" key={idx} >
          <Link onClick={this.clickBtn.bind(this)} className="nav-link" to={'/'+item}>{item}</Link>
        </li>
    );
    return (
      <ul className="nav nav-pills" style={navStyle}>{listItems}</ul>
    );
  }
}
