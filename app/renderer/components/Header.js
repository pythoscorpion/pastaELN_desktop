/* Header component: tabs at top of desktop
   filled automatically
*/
import React, { Component } from 'react';      // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom';       // eslint-disable-line no-unused-vars
import MenuIcon from '@material-ui/icons/Menu';// eslint-disable-line no-unused-vars
import dispatcher from '../Dispatcher';
import Store from '../Store';
import { navStyle } from '../style';

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

  /** Functions as class properties (immediately bound): react on user interactions **/
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


  /** the render method **/
  render() {
    var targetDict = this.props.targets;
    if (targetDict.length==0)
      return <div></div>
    //clean all x items and other subdoctypes
    var targets = Object.keys(targetDict).map(item=>{
      if (item[0]=='x' || item.indexOf('/')>0)
        return [null,null];
      return [item, targetDict[item]];
    });
    targets = targets.filter(item=>{return item[0]!=null;});
    if ('x0' in targetDict)
      targets = [['x0',targetDict['x0']]].concat(targets);
    else
      console.log('**ERROR: Header.js no Projects in targets');
    targets = [['Configuration','Configuration']].concat(targets);
    const listDocTypes = targets.map((item,idx)=>{
      if (item[0]=='Configuration')
        return (
          <li className="nav-item" key={idx} >
            <Link className="nav-link" to={'/'+item[0]} style={{paddingTop:'3px',paddingBottom:'3px'}}>
              <MenuIcon style={{color:this.state.comState}}/>
            </Link>
          </li>
        );
      if (item[0]=='x0')
        return (
          <li className="nav-item" key={idx} >
            <Link className="nav-link" to={'/'+item[0]} style={{paddingTop:'3px',paddingBottom:'3px'}}>
              <strong style={{"fontSize":"13px"}}>{item[1]}</strong>
            </Link>
          </li>
        );
      return (
        <li className="nav-item" key={idx}>
          <Link className="nav-link" to={'/'+item[0]} style={{paddingTop:'4px',paddingBottom:'4px'}}>
            {item[1]}
          </Link>
        </li>
      );
    });
    return (
      <div className='row' style={navStyle}>
        <ul className="nav nav-pills ml-3">
          {listDocTypes}
        </ul>
      </div>
    );
  }
}
