/* MAIN Component of React-Framework
   Routes for different pages are defined here
*/
import React, { Component } from 'react';                                       // eslint-disable-line no-unused-vars
import { HashRouter as Router, Route, Switch } from 'react-router-dom';         // eslint-disable-line no-unused-vars
import axios from 'axios';
import DocComponent from './components/DocComponent';                           // eslint-disable-line no-unused-vars
import ProjectComponent from './components/ProjectComponent';                     // eslint-disable-line no-unused-vars
import Header from './components/Header';                                       // eslint-disable-line no-unused-vars
import AboutPage from './components/AboutPage';                                 // eslint-disable-line no-unused-vars
import {dataDictionary2DataLabels} from './commonTools';
import {getCredentials} from './credentials';

export default class App extends Component {
  constructor(){
    super();
    this.state = {
      targets: []
    };
  }
  componentDidMount(){
    //get database information to get targets (Measurement,Samples,...)
    var config = getCredentials();
    if (config===null) {
      const json = localStorage.getItem('credentials');
      config = JSON.parse(json);
    }
    if (config===null) return;
    const url = axios.create({
      baseURL: config.url,
      auth: {username: config.user, password: config.password}
    });
    const thePath = '/'+config.database+'/-dataDictionary-';
    url.get(thePath).then((res) => {
      const objLabel = dataDictionary2DataLabels(res.data);
      const listLabels = objLabel.hierarchyList.concat(objLabel.dataList);
      const targets = listLabels.map((docType,index)=>
                          {return listLabels[index][1];});
      this.setState({targets: targets });
    });
  }

  /**************************************
   * the render method
   **************************************/
  render() {
    const routeItems = this.state.targets.map((item,idx)=>  {
      if (item==='Projects') {
        return (
          <Route exact path={'/'+item} key={idx}>
            <ProjectComponent/>
          </Route>
        );
      } else {
        return (
          <Route exact path={'/'+item} key={idx}>
            <DocComponent docType={item} />
          </Route>
        );
      }
    });
    return (
      <Router>
        <Header targets={this.state.targets}/>
        <Switch>
            <Route exact path='/'>      <AboutPage /> </Route>
            <Route exact path='/About'> <AboutPage /> </Route>
            {routeItems}
        </Switch>
      </Router>
    );
  }
}
