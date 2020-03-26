/* Header component: tabs at top of desktop
   filled automatically
*/
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

const navStyle = {
  borderBottom:'1px solid #8E8C84'
}

export default class Header extends Component {
  render() {
    const targets = this.props.targets.concat(['About']);
    const listItems = targets.map(
      (item,idx)=> <li className="nav-item" key={idx} >
                   <Link className="nav-link" to={'/'+item}>{item}</Link>
                   </li>
    );
    return (
      <ul className="nav nav-pills" style={navStyle}>{listItems}</ul>
    );
  }
}
