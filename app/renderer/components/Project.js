/* Project view
*/
import React, { Component } from 'react';                                 // eslint-disable-line no-unused-vars
import { Button, Input } from '@material-ui/core';                        // eslint-disable-line no-unused-vars
import EditIcon from '@material-ui/icons/Edit';
import SortableTree, {getTreeFromFlatData} from 'react-sortable-tree';    // eslint-disable-line no-unused-vars
import FileExplorerTheme from 'react-sortable-tree-theme-minimal';
import ModalForm from './ModalForm';           // eslint-disable-line no-unused-vars
import * as Actions from '../Actions';
import Store from '../Store';
import {REACT_VERSION, executeCmd} from '../localInteraction';

export default class Project extends Component {
  //initialize
  constructor() {
    super();
    this.state = {
      doc: Store.getDocumentRaw(),
      projectTitle: '',
      projectDocID: '',
      treeData: [],
      hierarchy: null,
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


  /* Functions are class properties: immediately bound */
  toggleTable=()=>{
    Actions.restartDocType();
  }
  inputChange=(event)=>{
    this.setState({newItem: event.target.value});
  }
  pressedButton=(task)=>{  //sibling for pressedButton in ConfigPage: change both similarly
    if (task=='addNew') {   //add to SortableTree view here
      this.setState({treeData: this.state.treeData.concat({title: this.state.newItem}) });
      this.setState({newItem: ''});
    } else {
      Actions.comState('busy');
      this.setState({ready: false});
      var content = null;
      if (task=='btn_proj_be_saveHierarchy') {
        content = this.state.projectTitle+'||'+this.state.projectDocID+'\n';
        content += this.treeToOrgMode(this.state.treeData,0);
      }
      executeCmd(task,this.callback,this.state.projectDocID,content);
    }
  }
  callback=(content)=>{
    if (content.indexOf('SUCCESS')>-1) {
      Actions.comState('ok');
    } else {
      Actions.comState('fail');
      console.log('callback',content);
    }
    this.setState({ready: true});
  }

  getDoc=()=>{
    //get information from store and push information to actions
    var doc = Store.getDocumentRaw();
    this.setState({doc: doc});
  }

  getHierarchy=()=>{
    //get orgMode hierarchy from store
    //  create flatData-structure from that orgMode structure
    //  create tree-like data for SortableTree from flatData
    const orgModeArray = Store.getHierarchy().split('\n');
    var initialData      = [];
    var parents = [null];
    var currentIndent = 2;
    var url = Store.getURL();
    for (var i =0; i<orgModeArray.length; i++){
      var idxSpace = orgModeArray[i].indexOf(' ');
      var idxBar   = orgModeArray[i].indexOf('||');
      if (idxSpace<1)
        break;
      const title = orgModeArray[i].substr(idxSpace,idxBar-idxSpace);
      const docID = orgModeArray[i].substr(idxBar+2);

      // url.url.get(url.path+docID).then((res) => {
      //   var subtitle = res.data.name;
      // });
      // let result = await subtitle;

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
      initialData.push({
        id:i.toString(),
        name:title,
        parent:parents[parents.length-1],
        docID:docID
        //subtitle: subtitle
      });
    }
    const tree = getTreeFromFlatData({
      flatData: initialData.map(node => ({ ...node, title: node.name })),
      getKey: node => node.id, // resolve a node's key
      getParentKey: node => node.parent, // resolve a node's parent's key
      rootKey: null, // The value of the parent key when there is no parent (i.e., at root level)
    });
    this.setState({treeData: tree });
  }


  /* normal functions that need no binding */
  treeToOrgMode(children,prefixStars) {
    //tree-like data from SortableTree to orgMode, which is communicated to backend
    prefixStars += 1;
    var orgMode = children.map(( item )=>{
      var childrenString = '';
      if ('children' in item) {
        childrenString = '\n'+this.treeToOrgMode(item.children,prefixStars);
      }
      var docIDString = '';
      if (item.docID) docIDString = '||'+item.docID;
      return '*'.repeat(prefixStars)+' '+item.title+docIDString+childrenString;
    });
    return orgMode.join('\n');
  }


  /* process data and create html-structure; all should return at least <div></div> */
  showBtnBar(){
    if (REACT_VERSION==='Electron'){   // *** React-Electron version: three buttons
      return (
        <div className='ml-auto'>
          <Button onClick={() => this.pressedButton('btn_proj_be_saveHierarchy')}
            variant="contained" className='m-2'>
            Save
          </Button>
          <Button onClick={() => this.pressedButton('btn_proj_be_scanHierarchy')}
            variant="contained" className='m-2'>
            Scan disk
          </Button>
          <Button onClick={() => this.toggleTable()} variant="contained" className='m-2'>
            Cancel
          </Button>
        </div>
      );
    } else {                           // *** React-DOM version: only cancel button
      return (
        <div className='ml-auto'>
          <Button onClick={() => this.toggleTable()} variant="contained" className='m-2'>
            Cancel
          </Button>
        </div>
      );
    }
  }

  //the render method
  //   https://frontend-collective.github.io/react-sortable-tree/
  // Advanced:
  //   - Playing with generateNodeProps
  //   - Drag out to remove
  // Code ist unter...
  //   https://github.com/frontend-collective/react-sortable-tree/blob/master/stories/
  // Bootstrap cards might be a good element for each branch
  render() {
    return (
      <div className='col px-2'>
        <div className='mb-2'>
          <span style={{fontSize:24}}>{this.state.projectTitle}</span>&nbsp;&nbsp;&nbsp;
            Status: <strong>{this.state.doc.status}</strong>&nbsp;&nbsp;&nbsp;
            Tags: <strong>{this.state.doc.tags}</strong>
          <div className='row'>
            <div className='col-sm-10'>
              Objective: <strong>{this.state.doc.objective}</strong>
            </div>
            <div className='col-sm-1'>
              <Button variant="contained" size='small' onClick={()=>Actions.showForm('edit')}>
                <EditIcon />
              </Button>
            </div>
          </div>
          {this.state.doc.comment && this.state.doc.comment.length>0 && this.state.doc.comment}
        </div>
        <div style={{ height: 650 }}>
          <SortableTree theme={FileExplorerTheme} treeData={this.state.treeData}
            onChange={treeData => this.setState({ treeData })} />
        </div>
        <div className='d-flex mt-2'>
          <Input value={this.state.newItem} onChange={this.inputChange}
            onKeyDown={e => (e.key==='Enter') && (this.pressedButton('addNew'))} />
          <Button onClick={() => this.pressedButton('addNew')} variant="contained" className='m-2'>
            Add new item
          </Button>
          {this.showBtnBar()}
        </div>
        <ModalForm />
      </div>
    );
  }
}
