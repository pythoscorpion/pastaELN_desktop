/* MAIN Component of React-Framework
   Routes for different pages are defined here
   Initiation of Store
*/
import React, { Component } from 'react';                                       // eslint-disable-line no-unused-vars
import { HashRouter as Router, Route, Switch } from 'react-router-dom';         // eslint-disable-line no-unused-vars
import { Paper } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';// eslint-disable-line no-unused-vars
import DocComponent from './components/DocComponent';                           // eslint-disable-line no-unused-vars
import ProjectComponent from './components/ProjectComponent';                   // eslint-disable-line no-unused-vars
import Header from './components/Header';                                       // eslint-disable-line no-unused-vars
import ConfigPage from './components/ConfigPage';                               // eslint-disable-line no-unused-vars
import Store from './Store';                                                    // eslint-disable-line no-unused-vars
import { pastaTheme } from './style';

const theme = createMuiTheme(pastaTheme);

export default class App extends Component {
  constructor(){
    super();
    this.getTargets    = this.getTargets.bind(this);
    this.state = {
      targets: []
    };
  }
  componentDidMount(){
    Store.on('initStore', this.getTargets);
    Store.initStore();

  }
  componentWillUnmount(){
    Store.removeListener('initStore', this.getTargets);
  }
  getTargets(){
    //get database information (Measurement,Samples,...)
    this.setState({targets: Store.getDocTypeLabels() });
  }

  /**************************************
   * the render method
   **************************************/
  render() {
    const docTypes = this.state.targets.map(item=>item[0]);
    const routeItems = docTypes.map((item,idx)=>  {
      if (item==='project') {
        return (
          <Route exact path={'/'+item} key={idx}>
            <ProjectComponent/>
          </Route>
        );
      } else {
        return (
          <Route exact path={'/'+item} key={idx}>
            <DocComponent docType={item}/>
          </Route>
        );
      }
    });
    return (
      <ThemeProvider theme={theme}>
        <Paper>
          <Router>
            <Header targets={this.state.targets}/>
            <Switch>
              <Route exact path='/'>              <ConfigPage /> </Route>
              <Route exact path='/Configuration'> <ConfigPage /> </Route>
              {routeItems}
            </Switch>
          </Router>
        </Paper>
      </ThemeProvider>
    );
  }
}
