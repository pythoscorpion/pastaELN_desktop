/* Project view
*/
import React, { Component } from 'react';                                 // eslint-disable-line no-unused-vars
import { Input, Button, IconButton, Tooltip } from '@material-ui/core';            // eslint-disable-line no-unused-vars
import { Edit, Save, Cancel, FindReplace, ExpandMore, ExpandLess, Delete, AddCircle, Add, ArrowUpward, ArrowBack, ArrowForward } from '@material-ui/icons';
import {getTreeFromFlatData, getFlatDataFromTree} from 'react-sortable-tree';    // eslint-disable-line no-unused-vars
import ModalForm from './ModalForm';           // eslint-disable-line no-unused-vars
import * as Actions from '../Actions';
import Store from '../Store';
import {REACT_VERSION, executeCmd} from '../localInteraction';
import {ontology2FullObjects}      from '../commonTools';

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
        docID:docID,
        name: title,
        delete: false
      });
      expanded[i.toString()] = false;
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
    //close project view
    Actions.restartDocType();
  }
  inputChange=(event)=>{
    //change in input field at bottom
    this.setState({newItem: event.target.value});
  }
  pressedButton=(task)=>{
    //global pressed buttons: sibling for pressedButton in ConfigPage: change both similarly
    Actions.comState('busy');
    this.setState({ready: false});
    var content = null;
    if (task=='btn_proj_be_saveHierarchy') {
      content = this.state.project.name+'||'+this.state.project._id+'\n';
      content += this.treeToOrgMode(this.state.treeData,0);
    }
    executeCmd(task,this.callback,this.state.project._id,content);
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

  expand=(id) => {
    //expand/collapse certain branch
    var expanded = this.state.expanded;
    expanded[id] = ! expanded[id];
    this.setState({expanded: expanded});
  }

  editItem=(item)=>{
    //click edit button for one item in the hierarchy; project-edit handled separately
    var url = Store.getURL();
    url.url.get(url.path+item.docID).then((res) => {
      const doc = res.data;
      var docType = null;
      if (doc.type[0]==='text')
        docType=doc.type[1];
      else
        docType=doc.type[0];
      const ontology    = Store.getOntology()[docType];
      const tableFormat = {'-default-':[1]};
      const tableMeta   = ontology2FullObjects(ontology, tableFormat);
      Actions.showForm('edit',tableMeta,doc);
    }).catch(()=>{
      console.log('Project:editItem: Error encountered: '+url.path+item.docID);
    });
  }

  changeTree=(item,direction) => {
    //most events that change the hierarchy tree: up,promote,demote,delete,add
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
      name: node.name,
      delete: node.delete
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
    } else if (direction==='delete') {
      item.delete = true;
      flatData = flatData.map((node)=>{
        if (node.id==item.id) return item;
        return node;
      });
      changedFlatData=true;
    } else if (direction==='new') {
      var parentID = null;
      var name = this.state.newItem;
      if (item) {
        parentID=item.id;
        name    ='New item';
        var expanded = this.state.expanded;
        expanded[item.id] = true;
        this.setState({expanded: expanded});}
      flatData.push({id: (flatData.length+1).toString(), parent: parentID, docID: "", name:name, delete: false});
      changedFlatData=true;
      this.setState({newItem:''});
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

  /*helper functions */
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
    //recursive function to show this item and all the sub-items
    const tree = branch.map((item)=>{
      return (
        !item.delete &&
        <div key={item.id}>
          <div className='row'>
            <div className='mt-2'>{item.docID+' ||| '+item.name}</div>
            <div className='ml-auto'>
              {item.children && <Tooltip title="Expand/Contract">
                <IconButton onClick={()=>this.expand(item.id)} className='m-1' size='small'>
                  {this.state.expanded[item.id]  && <ExpandLess />}
                  {!this.state.expanded[item.id] && <ExpandMore />}
                </IconButton>
              </Tooltip> }
              {item.parent && <Tooltip title="Promote">
                <IconButton onClick={()=>this.changeTree(item,'promote')} className='m-0' size='small'>
                  <ArrowBack />
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
              <Tooltip title="Edit">
                <IconButton onClick={()=>this.editItem(item)} className='ml-3' size='small'>
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton onClick={()=>this.changeTree(item,'delete')} className='m-0' size='small'>
                  <Delete />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add child">
                <IconButton onClick={()=>this.changeTree(item,'new')} className='m-0' size='small'>
                  <Add />
                </IconButton>
              </Tooltip>
            </div>
          </div>
          {this.state.expanded[item.id] &&
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
                <IconButton onClick={()=>Actions.showForm('edit',null,null)} className='m-1' size='small'>
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
        {/*BODY: Hierarchical tree: show tree*/}
        <div className='ml-3'>
          {this.showTree(this.state.treeData)}
        </div>
        {/*FOOTER: show add item and the ModalForm to edit documents*/}
        <div className='col-sm-4 mt-2 border'>
          <Input value={this.state.newItem} onChange={this.inputChange} className='pl-2'
            onKeyDown={e => (e.key==='Enter') && (this.changeTree(null,'new'))} />
          <Tooltip title="Add new item">
            <IconButton onClick={() => this.changeTree(null,'new')} variant="contained" className='m-2 pt-2'>
              <AddCircle />
            </IconButton>
          </Tooltip>
        </div>
        <ModalForm />
      </div>
    );
  }
}
