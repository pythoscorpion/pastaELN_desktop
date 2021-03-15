/* Project view
*/
import React, { Component } from 'react';                                  // eslint-disable-line no-unused-vars
import { Input, IconButton, Tooltip } from '@material-ui/core';            // eslint-disable-line no-unused-vars
import { Edit, Save, Cancel, FindReplace, ExpandMore, ExpandLess, Delete, AddCircle, Add, ArrowUpward, ArrowBack, ArrowForward } from '@material-ui/icons';// eslint-disable-line no-unused-vars
import {getTreeFromFlatData, getFlatDataFromTree} from 'react-sortable-tree';    // eslint-disable-line no-unused-vars
import ReactMarkdown from 'react-markdown';       // eslint-disable-line no-unused-vars
import ModalForm from './ModalForm';           // eslint-disable-line no-unused-vars
import * as Actions from '../Actions';
import dispatcher from '../Dispatcher';
import Store from '../Store';
import {ELECTRON, executeCmd} from '../localInteraction';
import {ontology2FullObjects}      from '../commonTools';

export default class Project extends Component {
  //initialize
  constructor() {
    super();
    this.state = {
      //data
      project: Store.getDocumentRaw(), //project
      treeData: [],
      database: {},
      //for visualization
      expanded: {},
      ready: true,
      newItem: '',
      //misc
      dispatcherToken: null
    };
  }
  componentDidMount() {
    this.setState({dispatcherToken: dispatcher.register(this.handleActions)});
    Store.on('changeDoc', this.getDoc);
    Store.on('changeDoc', this.getHierarchy);
  }
  componentWillUnmount() {
    dispatcher.unregister(this.state.dispatcherToken);
    Store.removeListener('changeDoc', this.getDoc);
    Store.removeListener('changeDoc', this.getHierarchy);
  }
  handleActions=(action)=>{
    if (action.type==='CHANGE_TEXT_DOC') {
      Object.assign(action.oldDoc, action.doc);
      action.oldDoc['docID']='temp_'+action.oldDoc.id;
      var newDoc = Object.assign({}, action.oldDoc);
      ['id','parent','path','delete','docID'].forEach(e=> delete newDoc[e]);
      this.setState({['temp_'+action.oldDoc.id]: newDoc});
      var flatData = this.flatData(this.state.treeData);
      flatData = flatData.map((item)=>{
          if (item.id===action.oldDoc.id)
            return action.oldDoc;
          return item;
        });
      this.setState({treeData: this.treeData(flatData)});
    }
  }

  flatData=(treeData)=>{
    //create flat data from tree data and return it
    var flatData = getFlatDataFromTree({
      treeData: treeData,
      getNodeKey: ({ node }) => node.id, // This ensures your "id" properties are exported in the path
      ignoreCollapsed: false, // Makes sure you traverse every node in the tree, not just the visible ones
    }).map(({ node, path }) => ({
      id: node.id,
      docID: node.docID,
      parent: path.length > 1 ? path[path.length - 2] : null,
      name: node.name,
      delete: node.delete,
      path: path
    }));
    return flatData;
  }
  treeData=(flatData)=>{
    //create tree data from flat data and return it
    var treeData = getTreeFromFlatData({
      flatData: flatData.map(node => ({ ...node})),
      getKey: node => node.id, // resolve a node's key
      getParentKey: node => node.parent, // resolve a node's parent's key
      rootKey: null, // The value of the parent key when there is no parent (i.e., at root level)
    });
    return treeData;
  }


  getDoc=()=>{
    //Initialization of header: project
    //get information from store and push information to actions
    this.setState({project: Store.getDocumentRaw()});
  }
  getHierarchy=()=>{
    //Initialization of tree:
    //  get orgMode hierarchy from store
    //  create flatData-structure from that orgMode structure
    //  create tree-like data for SortableTree from flatData
    const orgModeArray = Store.getHierarchy().split('\n');
    var initialData      = [];
    var expanded         = {};
    var parents = [null];
    var currentIndent = 2;
    var url = Store.getURL();
    for (var i =0; i<orgModeArray.length; i++){  //TODO for-loop into map: get rid of for-loops everywhere
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
      //start filling local database of items
      url.url.get(url.path+docID).then((res) => {
        this.setState({[docID]: res.data});
      }).catch(()=>{
        this.setState({[docID]: null});
        console.log('Project:getHierarchy: Error encountered: '+url.path+docID);
      });
    }
    var tree = this.treeData(initialData);
    //convert back/forth to flat-data to include path (hierarchyStack)
    const flatData = this.flatData(tree);
    tree = this.treeData(flatData);
    this.setState({treeData: tree, expanded: expanded});
  }

  treeToOrgMode(children,prefixStars,delItem) {
    //recursive function to finalize
    //  tree-like data from SortableTree to orgMode, which is communicated to backend
    prefixStars += 1;
    var orgMode = children.map(( item )=>{
      var delSubtree = Boolean(delItem);
      if (item.delete)  delSubtree = true;
      var childrenString = '';
      if ('children' in item) {
        childrenString = '\n'+this.treeToOrgMode(item.children,prefixStars, delSubtree);
      }
      var docIDString = '';
      var name        = item.name;
      if (item.docID && item.docID.substring(0,5)!='temp_')
        docIDString = '||'+item.docID;
      if (delSubtree)
        name        = '';
      return '*'.repeat(prefixStars)+' '+name+docIDString+childrenString;
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
      content += this.treeToOrgMode(this.state.treeData, 0, false);
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
    if (item.docID==='') {
      delete item['docID'];
      item['type'] = ['text','step'];
      const ontology    = Store.getOntology()['step'];
      const tableFormat = {'-default-':[1]};
      const tableMeta   = ontology2FullObjects(ontology, tableFormat);
      Actions.showForm('new',tableMeta,item);
    } else {
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
  }

  changeTree=(item,direction) => {
    //most events that change the hierarchy tree: up,promote,demote,delete,add
    var treeData = this.state.treeData;
    var changedFlatData = false;
    var flatData = this.flatData(treeData);
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
        treeData = treeData.filter((item)=>{return item;});
      }
    } else if (direction==='promote') {
      item.parent = flatData.filter((node)=>{return (node.id==item.parent);})[0]['parent'];  //set as grandparent
      item.path   = item.path.slice(1);
      flatData = flatData.map((node)=>{
        if (node.id==item.id) return item;
        return node;
      });
      changedFlatData=true;
    } else if (direction==='demote') {
      item.parent = this.previousSibling(treeData, item.id);
      const parentPath = flatData.filter((node)=>{return (node.id===item.parent) ? node : false})[0]['path'];
      item.path   = parentPath.concat([item.id])
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
      var path = [];
      if (item) {
        parentID=item.id;
        name    ='New item';
        path    = item.path;
        var expanded = this.state.expanded;
        expanded[item.id] = true;
        this.setState({expanded: expanded});}
      const newID = (flatData.length+1).toString();
      path = path.concat([newID]);
      flatData.push({id: newID, parent: parentID, docID: '', path:path, name:name, delete: false});
      changedFlatData=true;
      this.setState({newItem:''});
    } else {
      console.log('ERROR direction unknown',direction);
    }
    //finish by updating treeData
    if (changedFlatData)
      treeData = this.treeData(flatData);
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
    if (typeof result==='number')
      result = branch[result]['id'];
    return(result);
  }

  /* Render functions */
  showWithImage(docID) {    //ITEM IF IMAGE PRESENT
    const {image} = this.state[docID];
    const base64data = (image.substring(0,4)==='<?xm') ?
      btoa(unescape(encodeURIComponent(image))) :
      null;
    const imageTag = (image.substring(0,4)==='<?xm') ?
      <img src={'data:image/svg+xml;base64,'+base64data} width='100%' alt='svg-format'></img> :
      <img src={image} width='100%' alt='base64-format'></img>;
    return (
      <div className='row'>
        <div className='col-sm-7'>
          {this.showMisc(docID)}
        </div>
        <div className='col-sm-5'>
          {imageTag}
        </div>
      </div>
    );
  }
  showWithContent(docID) {    //ITEM IF CONTENT PRESENT
    return (
      <div className='row'>
        <div className='col-sm-6'>
          {this.showMisc(docID)}
        </div>
        <div className='col-sm-6 border pt-2'>
          <ReactMarkdown source={this.state[docID].content} />
        </div>
      </div>
    );
  }
  showWithout(docID) {    //ITEM IF DEFAULT
    return (
      <div className='row'>
        <div className='col-sm-12'>
          {this.showMisc(docID)}
        </div>
      </div>
    );
  }
  showMisc(docID) {       //SAME AS IN DocDetail:show()
    return (
      Object.keys(this.state[docID]).map( (item,idx) => {
        if (Store.itemSkip.indexOf(item)>-1 || Store.itemDB.indexOf(item)>-1 || item==='name') {
          return <div key={'B'+idx.toString()}></div>;
        }
        const label=item.charAt(0).toUpperCase() + item.slice(1);
        return <div key={'B'+idx.toString()}>{label}: <strong>{this.state[docID][item]}</strong></div>;
      })
    );
  }


  showTree(branch){
    //recursive function to show this item and all the sub-items
    const tree = branch.map((item)=>{
      // const previousSiblingID     = this.previousSibling(branch, item.id);
      // const previousSibling       = branch.filter((node)=>{return (node.id===previousSiblingID) ? node : false});
      // const previousSiblingText   = (previousSibling.length==1) ? previousSibling[0]['docID'].substring(0,2)=='t-' : false;
      const thisText              = item.docID.substring(0,2)=='t-';
      return (
        !item.delete &&
        <div key={item.id}>
          <div className='container border pl-2 pt-2'>
            <div className='row ml-0'>
              {/*HEAD OF DATA */}
              <div><strong>{item.name}</strong></div>
              {/*BUTTONS*/}
              <div className='ml-auto'>
                {item.children && <Tooltip title="Expand/Contract">
                  <IconButton onClick={()=>this.expand(item.id)} className='mr-5' size='small'>
                    {this.state.expanded[item.id]  && <ExpandLess />}
                    {!this.state.expanded[item.id] && <ExpandMore />}
                  </IconButton>
                </Tooltip> }
                { ELECTRON && item.parent && thisText && <Tooltip title="Promote">
                  <IconButton onClick={()=>this.changeTree(item,'promote')} className='m-0' size='small'>
                    <ArrowBack />
                  </IconButton>
                </Tooltip> }
                { ELECTRON && !this.firstChild(this.state.treeData,item.id) && <Tooltip title="Move up">
                  <IconButton onClick={()=>this.changeTree(item,'up')} className='m-0' size='small'>
                    <ArrowUpward />
                  </IconButton>
                </Tooltip>}
                { ELECTRON && !this.firstChild(this.state.treeData,item.id) && item.path.length<2 && thisText &&
                  <Tooltip title="Demote">
                    <IconButton onClick={()=>this.changeTree(item,'demote')} className='m-0' size='small'>
                      <ArrowForward />
                    </IconButton>
                  </Tooltip>
                }
                <Tooltip title="Edit">
                  <IconButton onClick={()=>this.editItem(item)} className='ml-5' size='small'>
                    <Edit />
                  </IconButton>
                </Tooltip>
                { ELECTRON && <Tooltip title="Delete">
                  <IconButton onClick={()=>this.changeTree(item,'delete')} className='m-0' size='small'>
                    <Delete />
                  </IconButton>
                </Tooltip> }
                { ELECTRON && item.path.length<2 && thisText && <Tooltip title="Add child">
                  <IconButton onClick={()=>this.changeTree(item,'new')} className='m-0' size='small'>
                    <Add />
                  </IconButton>
                </Tooltip> }
              </div>
            </div>
            {/*BODY OF THIS BRANCH: depending if image/content is present*/}
            {this.state[item.docID] && this.state[item.docID].content          && this.showWithContent(item.docID)}
            {this.state[item.docID] && this.state[item.docID].image            && this.showWithImage(item.docID)}
            {this.state[item.docID] && !this.state[item.docID].content && !this.state[item.docID].image && this.showWithout(item.docID)}
          </div>
          {/*SUB-BRANCHES*/}
          {this.state.expanded[item.id] && item.children &&
            <div className='ml-5 mt-0 mb-5'>
              {this.showTree(item.children)}
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
          <div className='row mx-0'>
            <div>
              <span style={{fontSize:24}}>{this.state.project.name}</span>&nbsp;&nbsp;&nbsp;
              Status: <strong>{this.state.project.status}</strong>
            </div>
            <div className='row ml-auto mr-0'>
              <Tooltip title="Edit Project Details">
                <IconButton onClick={()=>Actions.showForm('edit',null,null)} className='mx-2' size='small'>
                  <Edit fontSize='large'/>
                </IconButton>
              </Tooltip>
              { ELECTRON && <Tooltip title="Save Project Hierarchy">
                <IconButton onClick={() => this.pressedButton('btn_proj_be_saveHierarchy')} className='m-0' size='small' style={{width:'20px'}}>
                  <Save fontSize='large'/>
                </IconButton>
              </Tooltip>}
              { ELECTRON && <Tooltip title="Scan for new measurements, etc.">
                <IconButton onClick={() => this.pressedButton('btn_proj_be_scanHierarchy')} className='mx-2' size='small'>
                  <FindReplace fontSize='large'/>
                </IconButton>
              </Tooltip>}
              <Tooltip title="Cancel">
                <IconButton onClick={() => this.toggleTable()} className='m-0' size='small'>
                  <Cancel fontSize='large'/>
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
        {this.showTree(this.state.treeData)}
        {/*FOOTER: show add item and the ModalForm to edit documents*/}
        <div>
          <Input value={this.state.newItem} onChange={this.inputChange} className='pl-2'
            onKeyDown={e => (e.key==='Enter') && (this.changeTree(null,'new'))} />
          <Tooltip title="Add new item">
            <IconButton onClick={() => this.changeTree(null,'new')} variant="contained" className='m-2 pt-2'>
              <AddCircle fontSize='large'/>
            </IconButton>
          </Tooltip>
        </div>
        <ModalForm />
      </div>
    );
  }
}
