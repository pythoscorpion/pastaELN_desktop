/* Header component: tabs at top of desktop
   filled automatically
*/
import React, { Component } from 'react';      // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom';       // eslint-disable-line no-unused-vars
import { FiberManualRecord } from '@material-ui/icons';// eslint-disable-line no-unused-vars
import dispatcher from '../Dispatcher';
import Store from '../Store';

const navStyle = {
  borderBottom:'1px solid #8E8C84'
};

export default class Header extends Component {
  constructor() {
    super();
    this.state = {
      comState: 'black',
      dispatcherToken: null
    };
  }
  componentDidMount() {
    this.setState({dispatcherToken: dispatcher.register(this.handleActions)});
    Store.on('changeCOMState', this.setCOMState);
  }
  componentWillUnmount() {
    dispatcher.unregister(this.state.dispatcherToken);
    Store.removeListener('changeCOMState', this.setCOMState);
  }

  /* Functions are class properties: immediately bound */
  setCOMState=(message)=>{
    if (message==='ok')
      this.setState({comState: 'green'});
    else if (message==='busy')
      this.setState({comState: 'gold'});
    else if (message==='fail')
      this.setState({comState: 'red'});
    else
      this.setState({comState: 'black'});
  }
  handleActions=(action)=>{
    if (action.type==='COM_STATE')
      this.setCOMState(action.text);
  }


  /* process data and create html-structure; all should return at least <div></div> */
  // the render method
  render() {
    const listDocLabels = this.props.targets.map(
      (item,idx)=>
        <li className="nav-item" key={idx} >
          <Link className="nav-link" to={'/'+item}>{item}</Link>
        </li>
    );
    return (
      <div className='row' style={navStyle}>
        <ul className="nav nav-pills ml-3">
          {listDocLabels}
        </ul>
        <ul className="nav nav-pills ml-auto border-left">
          <li className="nav-item" key="98">
            <Link className="nav-link" to='/Configuration'>Configuration</Link>
          </li>
          <li className="nav-item pl-3 pr-4 pt-2" key="100">
            <FiberManualRecord style={{color:this.state.comState}}/>
          </li>
        </ul>
      </div>
    );
  }
}
