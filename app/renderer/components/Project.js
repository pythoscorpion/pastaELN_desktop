/* List of details on the right side
*/
import React, { Component } from 'react';                                 // eslint-disable-line no-unused-vars
import SortableTree, {getTreeFromFlatData, getFlatDataFromTree} from 'react-sortable-tree';    // eslint-disable-line no-unused-vars
import FileExplorerTheme from 'react-sortable-tree-theme-minimal';
import Store from '../Store';
import {REACT_VERSION, executeCmd} from '../localInteraction';

export default class Project extends Component {
  //initialize
  constructor() {
    super();
    this.getDoc       = this.getDoc.bind(this);
    this.getHierarchy = this.getHierarchy.bind(this);
    this.pressedButton= this.pressedButton.bind(this);
    this.callback     = this.callback.bind(this);
    this.inputChange  = this.inputChange.bind(this);
    this.state = {
      doc: Store.getDocument(),
      projectTitle: '',
      projectDocID: '',
      treeData: [],
      hierarchy: null,
      procedureContent: '',
      ready: true,
      newItem: ''
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

  inputChange(event) {
    this.setState({newItem: event.target.value});
  }
  pressedButton(task) {  //sibling for pressedButton in ConfigPage: change both similarly
    this.setState({ready: false});
    if (task=='saveToDB') {
      console.log(this.state.treeData);
      console.log(getFlatDataFromTree(this.state.treeData));
      executeCmd(task,[this.state.projectDocID,Store.getHierarchy()],this.callback);  //TODO Watch out, orgMode style hierarchy from store used
    }
    if (task=='scanHarddrive') {
      executeCmd(task,this.state.projectDocID,this.callback);
    }
    if (task=='addNew') {
      this.setState({treeData: this.state.treeData.concat({title: this.state.newItem}) });
    }
  }
  callback() {
    this.setState({ready: true});
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
      const title = orgModeArray[i].substr(idxSpace,idxBar-idxSpace);
      const docID = orgModeArray[i].substr(idxBar+2);
      if (i===0) {
        this.setState({projectTitle: title});
        this.setState({projectDocID: docID});
        continue;
      }
      if (idxSpace>currentIndent)
        parents.push(i-1);
      if (idxSpace<currentIndent)
        parents.pop();
      currentIndent = idxSpace;
      initialData.push({id:i.toString(), name:title, parent:parents[parents.length-1]});
      //TODO one has to store docID here and getit also into tree, or write tree directly; or create a i -> docID dictionary lookup table
    }
    const tree = getTreeFromFlatData({
      flatData: initialData.map(node => ({ ...node, title: node.name })),
      getKey: node => node.id, // resolve a node's key
      getParentKey: node => node.parent, // resolve a node's parent's key
      rootKey: null, // The value of the parent key when there is no parent (i.e., at root level)
    });
    this.setState({treeData: tree });
  }

  /**************************************
   * process data and create html-structure
   * all should return at least <div></div>
   **************************************/
  showButton(){
    if (REACT_VERSION==='Electron'){   // *** React-Electron version
      //TODO
      /**
       * den naechste Teil ist noch nicht fertig. die Buttons sollten als inactive ausgegraut sein, wenn das button dedrückt wurde aber das Ergebnis noch nicht da ist
       */
      return (
        <div className='d-flex mt-2'>
          <input type='text' value={this.state.newItem} onChange={this.inputChange} size="25" />
          <button onClick={() => this.pressedButton('addNew')}        className='btn btn-secondary ml-3' > Add new item </button>
          <button onClick={() => this.pressedButton('saveToDB')}      className='btn btn-secondary ml-auto' active={this.state.ready.toString()}>Save</button>
          <button onClick={() => this.pressedButton('scanHarddrive')} className='btn btn-secondary ml-3' active={this.state.ready.toString()}>Scan disk</button>
        </div>
      );
    } else {                           // *** React-DOM version:
      return <div></div>;
    }
  }

  //the render method
  //TODO also see Stories
  //   https://frontend-collective.github.io/react-sortable-tree/
  //   Steffen findet gut:
  // Advanced:
  //   - Playing with generateNodeProps
  //   - Drag out to remove
  // Code ist unter...
  //   https://github.com/frontend-collective/react-sortable-tree/blob/master/stories/
  // Bootstrap cards might be a good element for each branch
  render() {
    return (
      <div className='col p-4'>
        <h2>{this.state.projectTitle}</h2>
        <div style={{ height: 650 }}>
          <SortableTree
            theme={FileExplorerTheme}
            treeData={this.state.treeData}
            onChange={treeData => this.setState({ treeData })}
          />
        </div>
        {this.showButton()}
      </div>
    );
  }
}
