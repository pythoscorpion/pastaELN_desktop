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
import {REACT_VERSION, executeCmd} from '../localInteraction';

const navStyle = {
  borderBottom:'1px solid #8E8C84'
};


export default class Header extends Component {
  //initialize
  constructor() {
    super();
    this.setCOMState = this.setCOMState.bind(this);
    this.sync        = this.sync.bind(this);
    this.callback    = this.callback.bind(this);
    this.state = {
      comState: 'black'
    };
    var dispatcherToken;                      // eslint-disable-line no-unused-vars
  }
  componentDidMount() {
    this.dispatcherToken = dispatcher.register(this.handleActions.bind(this));
    Store.on('changeCOMState', this.setCOMState);
  }
  componentWillUnmount() {
    dispatcher.unregister(this.dispatcherToken);
    Store.removeListener('changeCOMState', this.setCOMState);
  }

  //functions
  clickBtn(){
    Actions.restartDocType();
  }
  setCOMState(message){
    if (message==='ok')
      this.setState({comState: 'green'});
    else if (message==='busy')
      this.setState({comState: 'gold'});
    else if (message==='fail')
      this.setState({comState: 'red'});
    else
      this.setState({comState: 'black'});
  }
  sync(){
    this.setCOMState('busy');
    executeCmd('sync','',this.callback);
  }
  callback(content) {
    var contentArray = content.trim().split('\n');
    if( contentArray[contentArray.length-1].indexOf('SUCCESS sync')>-1 ){
      this.setCOMState('ok');
    } else {
      this.setCOMState('fail');
    }
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
    var syncButton = null;
    if (REACT_VERSION==='Electron') {
      syncButton = (
        <button onClick={()=>this.sync()} className="nav-link" style={{backgroundColor: 'white'}}>
          Synchronize
        </button>
      );
    } else {
      syncButton = (<div></div>);
    }
    return (
      <div className='row' style={navStyle}>
        <ul className="nav nav-pills ml-3">{listDocLabels}</ul>
        <ul className="nav nav-pills ml-auto mr-3 border-left">
          <li className="nav-item" key="98">
            <Link className="nav-link" to='/Configuration'>Configuration</Link>
          </li>
          <li className="nav-item" key="99">
            {syncButton}
          </li>
          <li className="nav-item px-3 pt-2" key="100">
            <FontAwesomeIcon icon={faCircle} style={{color:this.state.comState}}/>
          </li>
        </ul>
      </div>
    );
  }

  handleActions(action) {
    if (action.type==='COM_STATE')
      this.setCOMState(action.text);
  }
}
