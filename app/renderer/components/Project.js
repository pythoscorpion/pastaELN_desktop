/* List of details on the right side
*/
import React, { Component } from 'react';                                 // eslint-disable-line no-unused-vars
import SortableTree, {getTreeFromFlatData} from 'react-sortable-tree';    // eslint-disable-line no-unused-vars
import FileExplorerTheme from 'react-sortable-tree-theme-minimal';
import Collapsible from 'react-collapsible';                              // eslint-disable-line no-unused-vars
import Store from '../Store';

export default class Project extends Component {
  //initialize
  constructor() {
    super();
    this.getDoc       = this.getDoc.bind(this);
    this.getHierarchy = this.getHierarchy.bind(this);
    this.state = {
      doc: Store.getDocument(),
      projectTitle: '',
      treeData: [],
      hierarchy: null,
      procedureContent: ''
    };
  }
  componentDidMount() {
    Store.on('changeDoc', this.getDoc);
    Store.on('changeDoc', this.getHierarchy);
  }
  componentWillUnmount() {
    Store.removeListener('changeDoc', this.getDoc);
    Store.removeListener('changeDoc', this.getHierarchy);
  }

  //get information from store and push information to actions
  getDoc() {
    var doc = Store.getDocument();
    this.setState({doc: doc});
  }

  getHierarchy(){
    const orgModeArray = Store.getHierarchy().split('\n');
    var initialData      = [];
    var parents = [null];
    var currentIndent = 2;
    for (var i =0; i<orgModeArray.length; i++){
      var idxSpace = orgModeArray[i].indexOf(' ');
      var idxBar   = orgModeArray[i].indexOf('||');
      if (idxSpace<1)
        break;
      var title = orgModeArray[i].substr(idxSpace,idxBar-idxSpace);
      if (i===0) {
        this.setState({projectTitle: title});
        continue;
      }
      if (idxSpace>currentIndent)
        parents.push(i-1);
      if (idxSpace<currentIndent)
        parents.pop();
      currentIndent = idxSpace;
      initialData.push({id:i.toString(), name:title, parent:parents[parents.length-1]});
    }
    var flatTree = getTreeFromFlatData({
      flatData: initialData.map(node => ({ ...node, title: node.name })),
      getKey: node => node.id, // resolve a node's key
      getParentKey: node => node.parent, // resolve a node's parent's key
      rootKey: null, // The value of the parent key when there is no parent (i.e., at root level)
    });
    this.setState({treeData: flatTree });
  }

  /**************************************
   * process data and create html-structure
   * all should return at least <div></div>
   **************************************/
  showMain() {
    const {keysMain, valuesMain} = this.state.doc;
    if (!keysMain) { return <div>Nothing selected</div>; }
    const docItems = keysMain.map( (item,idx) => {
      if (!valuesMain[idx]) {
        return <div key={'M'+idx.toString()}></div>;
      }
      return <div key={'M'+idx.toString()}>{item}: <strong>{valuesMain[idx]}</strong></div>;
    });
    return <Collapsible trigger='Data'>{docItems}</Collapsible>;
  }

  showDB() {
    const {keysDB, valuesDB} = this.state.doc;
    if (keysDB.length===1) { return <div></div>;}
    const docItems = keysDB.map( (item,idx) => {
      if (!valuesDB[idx]) {
        return <div key={'B'+idx.toString()}></div>;
      }
      return <div key={'B'+idx.toString()}>{item}: <strong>{valuesDB[idx]}</strong></div>;
    });
    return <Collapsible trigger='Database details'>{docItems}</Collapsible>;
  }


  //the render method
  // also see
  //   https://github.com/frontend-collective/react-sortable-tree/blob/master/stories/add-remove.js
  //   https://github.com/frontend-collective/react-sortable-tree/blob/master/stories/modify-nodes.js
  //   https://github.com/frontend-collective/react-sortable-tree/blob/master/stories/generate-node-props.js
  render() {
    return (
        <div className='col p-4'>
          <h2>{this.state.projectTitle}</h2>
          <div style={{ height: 500 }}>
            <SortableTree
              theme={FileExplorerTheme}
              treeData={this.state.treeData}
              onChange={treeData => this.setState({ treeData })}
            />
          </div>
          {this.showMain()}
          {this.showDB()}
        </div>
    );
  }
}
