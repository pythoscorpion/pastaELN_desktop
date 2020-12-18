/* Header component: tabs at top of desktop
   filled automatically
*/
import React, { Component } from 'react';      // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom';       // eslint-disable-line no-unused-vars
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // eslint-disable-line no-unused-vars
import * as Actions from '../Actions';
import dispatcher from '../Dispatcher';
import Store from '../Store';

const navStyle = {
  borderBottom:'1px solid #8E8C84'
};


export default class Header extends Component {
  //initialize
  constructor() {
    super();
    this.getCOMState = this.getCOMState.bind(this);
    this.state = {
      comState: 'black'
    };
    var dispatcherToken;                      // eslint-disable-line no-unused-vars
  }
  componentDidMount() {
    this.dispatcherToken = dispatcher.register(this.handleActions.bind(this));
    Store.on('changeCOMState', this.getCOMState);
  }
  componentWillUnmount() {
    dispatcher.unregister(this.dispatcherToken);
    Store.removeListener('changeCOMState', this.getCOMState);
  }

  //functions
  clickBtn(){
    Actions.restartDocType();
  }
  getCOMState(message){
    if (message==='ok')
      this.setState({comState: 'green'});
    else if (message==='busy')
      this.setState({comState: 'yellow'});
    else if (message==='fail')
      this.setState({comState: 'red'});
    else
      this.setState({comState: 'black'});
  }

  /**************************************
   * the render method
   **************************************/
  render() {
    const listDocLabels = this.props.targets.map(
      (item,idx)=>
        <li className="nav-item" key={idx} >
          <Link onClick={this.clickBtn.bind(this)} className="nav-link" to={'/'+item}>{item}</Link>
        </li>
    );
    //TODO SB P2 Make syncronize button connect
    return (
      <div className='row' style={navStyle}>
        <ul className="nav nav-pills ml-3">{listDocLabels}</ul>
        <ul className="nav nav-pills ml-auto mr-3 border-left">
          <li className="nav-item" key="98">
            <Link className="nav-link" to='/Configuration'>Configuration</Link>
          </li>
          <li className="nav-item" key="99">
            <Link className="nav-link" to='/Projects'>     Synchronize</Link>
          </li>
          <li className="nav-item pr-3 pt-2" key="100">
            <FontAwesomeIcon icon={faCircle} style={{color:this.state.comState}}/>
          </li>
        </ul>
      </div>
    );
  }

  handleActions(action) {
    if (action.type==='COM_STATE')
      this.getCOMState(action.text);
  }
}
