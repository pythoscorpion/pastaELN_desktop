/* Project view
*/
import React, { Component } from 'react';                                 // eslint-disable-line no-unused-vars
import { IconButton, Tooltip } from '@material-ui/core';            // eslint-disable-line no-unused-vars
import { Edit, Save, Cancel, FindReplace, ExpandMore, ExpandLess, Delete, Add, ArrowUpward, ArrowBack, ArrowForward } from '@material-ui/icons';
import {getTreeFromFlatData, getFlatDataFromTree} from 'react-sortable-tree';    // eslint-disable-line no-unused-vars
import ModalForm from './ModalForm';           // eslint-disable-line no-unused-vars
import * as Actions from '../Actions';
import Store from '../Store';
import {REACT_VERSION, executeCmd} from '../localInteraction';

export default class Project extends Component {
  //initialize
  constructor() {
    super();
    this.state = {
      //data
      project: Store.getDocumentRaw(), //project
      treeData: [],
      //for visualization
      expanded: {},
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
  getDoc=()=>{
    //get information from store and push information to actions
    this.setState({project: Store.getDocumentRaw()});
  }
  getHierarchy=()=>{
    //get orgMode hierarchy from store
    //  create flatData-structure from that orgMode structure
    //  create tree-like data for SortableTree from flatData
    const orgModeArray = Store.getHierarchy().split('\n');
    var initialData      = [];
    var expanded         = {};
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
        continue;
      }
      if (idxSpace>currentIndent)
        parents.push(i-1);
      if (idxSpace<currentIndent)
        parents.pop();
      currentIndent = idxSpace;
      initialData.push({
        id:i.toString(),
        parent:parents[parents.length-1],
        docID:docID
      });
      expanded[docID] = false;
    }
    const tree = getTreeFromFlatData({
      flatData: initialData.map(node => ({ ...node})),
      getKey: node => node.id, // resolve a node's key
      getParentKey: node => node.parent, // resolve a node's parent's key
      rootKey: null, // The value of the parent key when there is no parent (i.e., at root level)
    });
    this.setState({treeData: tree, expanded: expanded});
  }
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


  /* Functions are class properties: immediately bound; button and others trigger this*/
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
        content = this.state.project.name+'||'+this.state.project._id+'\n';
        content += this.treeToOrgMode(this.state.treeData,0);
      }
      executeCmd(task,this.callback,this.state.project._id,content);
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
  // var url = Store.getURL();
  // url.url.get(url.path+docID).then((res) => {
  //   var subtitle = res.data.name;
  // });
  // let result = await subtitle;
  expand=(docID) => {
    //expand/collapse certain branch
    var expanded = this.state.expanded;
    expanded[docID] = ! expanded[docID];
    this.setState({expanded: expanded});
  }

  changeTree=(item,direction) => {
    var treeData = this.state.treeData;
    var changedFlatData = false;
    var flatData = getFlatDataFromTree({
      treeData: this.state.treeData,
      getNodeKey: ({ node }) => node.id, // This ensures your "id" properties are exported in the path
      ignoreCollapsed: false, // Makes sure you traverse every node in the tree, not just the visible ones
    }).map(({ node, path }) => ({
      id: node.id,
      docID: node.docID,
      parent: path.length > 1 ? path[path.length - 2] : null,
      path: path,
    }));

    if (direction==='up') {
      if (item.parent) {
        const row = flatData.filter((node)=>{return (node.id==item.id);})[0];
        const idx = flatData.indexOf(row);
        flatData.splice(idx-1, 0,  row);
        delete flatData[idx+1];
        changedFlatData = true;
      } else {
        const idx = treeData.indexOf(item);
        treeData.splice(idx-1, 0,  item);
        delete treeData[idx+1];
        treeData = treeData.filter((item)=>{return item;})
      }
    } else if (direction==='promote') {
      item.parent = flatData.filter((node)=>{return (node.id==item.parent);})[0]['parent'];  //set as grandparent
      flatData = flatData.map((node)=>{
        if (node.id==item.id) return item;
        return node;
      });
      changedFlatData=true;
    } else if (direction==='demote') {
      item.parent = this.previousSibling(treeData, item.id);
      flatData = flatData.map((node)=>{
        if (node.id==item.id) return item;
        return node;
      });
      changedFlatData=true;
    } else {
      console.log("ERROR direction unknown",direction)
    }

    if (changedFlatData) {
      treeData = getTreeFromFlatData({
        flatData: flatData.map(node => ({ ...node})),
        getKey: node => node.id, // resolve a node's key
        getParentKey: node => node.parent, // resolve a node's parent's key
        rootKey: null, // The value of the parent key when there is no parent (i.e., at root level)
      });
    }
    this.setState({treeData:treeData});
  }


  firstChild=(branch,id)=>{
    var result = branch.map((item,idx)=>{
      if (item.id==id && idx==0) return true;
      if (item.id==id && idx>0)  return false;
      if (item.children)         return this.firstChild(item.children,id);
      return null;
    });
    result = result.filter((item)=>{return (item!=null);})[0];
    return(result);
  }
  previousSibling=(branch,id)=>{
    var result = branch.map((item,idx)=>{
      if (item.id==id && idx==0) return null;
      if (item.id==id && idx>0)  return idx-1;
      if (item.children)         return this.previousSibling(item.children,id);
      return null;
    });
    result = result.filter((item)=>{return (item!=null);})[0];
    if (result)
      result = branch[result]['id'];
    return(result);
  }



  /* Render functions */
  showTree(branch){
    //recursive function
    const tree = branch.map((item)=>{
      return (
        <div>
          <div className='row'>
            <div className='mt-2'>{item.docID}</div>
            <div className='ml-auto'>
              {item.children && <Tooltip title="Expand/Contract">
                <IconButton onClick={()=>this.expand(item.docID)} className='m-1' size='small'>
                  {this.state.expanded[item.docID]  && <ExpandLess />}
                  {!this.state.expanded[item.docID] && <ExpandMore />}
                </IconButton>
              </Tooltip> }
              {!this.firstChild(this.state.treeData,item.id) && <Tooltip title="Move up">
                <IconButton onClick={()=>this.changeTree(item,'up')} className='m-0' size='small'>
                  <ArrowUpward />
                </IconButton>
              </Tooltip>}
              {!this.firstChild(this.state.treeData,item.id) && <Tooltip title="Demote">
                <IconButton onClick={()=>this.changeTree(item,'demote')} className='m-0' size='small'>
                  <ArrowForward />
                </IconButton>
              </Tooltip>
              }
              {item.parent && <Tooltip title="Promote">
                <IconButton onClick={()=>this.changeTree(item,'promote')} className='m-0' size='small'>
                  <ArrowBack />
                </IconButton>
              </Tooltip> }
              <Tooltip title="Edit">
                <IconButton className='ml-3' size='small'>
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton className='m-0' size='small'>
                  <Delete />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add child">
                <IconButton className='m-0' size='small'>
                  <Add />
                </IconButton>
              </Tooltip>
            </div>
          </div>
          {this.state.expanded[item.docID] &&
            <div className='ml-4 mt-0 mb-4'>
              {item.children && this.showTree(item.children)}
            </div>
          }
        </div>
        );
    });
    return tree;
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
        {/*HEADER: Project description and buttons on right*/}
        <div className='mb-2'>
          <div className='row'>
            <div className='ml-3'>
              <span style={{fontSize:24}}>{this.state.project.name}</span>&nbsp;&nbsp;&nbsp;
              Status: <strong>{this.state.project.status}</strong>
            </div>
            <div className='row ml-auto'>
              <Tooltip title="Edit Project Details">
                <IconButton onClick={()=>Actions.showForm('edit')} className='m-1' size='small'>
                  <Edit />
                </IconButton>
              </Tooltip>
              { REACT_VERSION==='Electron' && <Tooltip title="Save Project Hierarchy">
                <IconButton onClick={() => this.pressedButton('btn_proj_be_saveHierarchy')} className='m-0' size='small' style={{width:'20px'}}>
                  <Save />
                </IconButton>
              </Tooltip>}
              { REACT_VERSION==='Electron' && <Tooltip title="Scan for new measurements, etc.">
                <IconButton onClick={() => this.pressedButton('btn_proj_be_scanHierarchy')} className='m-1' size='small'>
                  <FindReplace />
                </IconButton>
              </Tooltip>}
              <Tooltip title="Cancel">
                <IconButton onClick={() => this.toggleTable()} className='m-0' size='small'>
                  <Cancel />
                </IconButton>
              </Tooltip>
            </div>
          </div>
          <div>
              Objective: <strong>{this.state.project.objective}</strong>&nbsp;&nbsp;&nbsp;
              Tags: <strong>{this.state.project.tags}</strong>
          </div>
          {this.state.project.comment && this.state.project.comment.length>0 && this.state.project.comment}
        </div>
        {/*BODY: Hierarchical tree*/}
        <div className='ml-3'>
          {this.showTree(this.state.treeData)}
        </div>
        {/*<div style={{ height: 650 }}>
          <SortableTree theme={FileExplorerTheme} treeData={this.state.treeData}
            onChange={treeData => this.setState({ treeData })} />
        </div>
        <div className='d-flex mt-2'>
          <Input value={this.state.newItem} onChange={this.inputChange}
            onKeyDown={e => (e.key==='Enter') && (this.pressedButton('addNew'))} />
          <Button onClick={() => this.pressedButton('addNew')} variant="contained" className='m-2'>
            Add new item
          </Button>
        </div>
        */}
        {/*FOOTER*/}
        <ModalForm />
      </div>
    );
  }
}
