/* MAIN Component of React-Framework
   Routes for different pages are defined here
*/
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import axios from 'axios';
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
    const thePath = myURL+'/agile_science/-dataDictionary-';
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
                      <h2>Component docType={item}</h2>
                    </Route>
    )
    return (
      <Router>
        <h1>Header targets</h1>
        <Switch>
          {routeItems}
        </Switch>
      </Router>
    );
  }
}
