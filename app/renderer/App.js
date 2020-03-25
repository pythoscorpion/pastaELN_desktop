/* MAIN Component of React-Framework
   Routes for different pages are defined here
*/
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import axios from 'axios';
import DocComponent from './components/DocComponent';
import Header from './components/Header';
import AboutPage from './components/AboutPage';
import {dataDictionary2DataLabels} from "./commonTools";
import {myURL} from "./definitions";

export default class App extends Component {
  constructor(){
    super();
    this.state = {
      targets: []
    }
  }

  componentDidMount(){
    const thePath = myURL+'-dataDictionary-';
    axios(thePath).then((res) => {
      const objLabel = dataDictionary2DataLabels(res.data);
      const listLabels = objLabel.hierarchyList.concat(objLabel.dataList);
      const targets = listLabels.map((docType,index)=> 
                          {return listLabels[index][1];});
      this.setState({targets: targets });
    });
  }
  
  render() {
    const routeItems = this.state.targets.map(
      (item,idx)=>  <Route exact path={'/'+item} key={idx}>
                      <DocComponent docType={item} />
                    </Route>
    )
    return (
      <Router>
        <Header targets={this.state.targets}/>
        <Switch>
            <Route exact path="/">      <AboutPage /> </Route> 
            <Route exact path="/About"> <AboutPage /> </Route>
            {routeItems}
        </Switch>
      </Router>
    );
  }
}
