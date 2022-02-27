/* Project view
*/
import React, { Component } from 'react';                                  // eslint-disable-line no-unused-vars
import { Input, IconButton, Tooltip } from '@material-ui/core';            // eslint-disable-line no-unused-vars
import { Edit, Save, Cancel, FindReplace, ExpandMore, ExpandLess, Delete,  // eslint-disable-line no-unused-vars
  AddCircle, Add, ArrowUpward, ArrowBack, ArrowForward } from '@material-ui/icons';// eslint-disable-line no-unused-vars
import {getTreeFromFlatData, getFlatDataFromTree} from 'react-sortable-tree';    // eslint-disable-line no-unused-vars
import ReactMarkdown from 'react-markdown';                               // eslint-disable-line no-unused-vars
import ModalForm from './ModalForm';                                      // eslint-disable-line no-unused-vars
import ModalSimple from './ModalSimple';                                      // eslint-disable-line no-unused-vars
import * as Actions from '../Actions';
import dispatcher from '../Dispatcher';
import Store from '../Store';
import {ELECTRON, executeCmd} from '../localInteraction';
import { orgToMd } from '../miscTools';
import { h1, areaScrollY } from '../style';

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
      expandedComment: {},
      newItem: '',
      saveHierarchy: false,
      //misc
      dispatcherToken: null,
      showDeleteModal: 'none'
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


  /** Functions as class properties (immediately bound): react on user interactions **/
  handleActions=(action)=>{
    /* handle actions that comes from other GUI elements*/
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
    /* create flat data from tree data and return it */
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
    /* create tree data from flat data and return it */
    var treeData = getTreeFromFlatData({
      flatData: flatData.map(node => ({ ...node})),
      getKey: node => node.id, // resolve a node's key
      getParentKey: node => node.parent, // resolve a node's parent's key
      rootKey: null, // The value of the parent key when there is no parent (i.e., at root level)
    });
    return treeData;
  }

  getDoc=()=>{
    /* Initialization of header: project
       get information from store and push information to actions */
    this.setState({project: Store.getDocumentRaw()});
  }

  getHierarchy=()=>{
    /* Initialization of tree:
         get orgMode hierarchy from store
         create flatData-structure from that orgMode structure
         create tree-like data for SortableTree from flatData */
    const orgModeArray = Store.getHierarchy().split('\n');
    var initialData    = [];
    var expanded       = {};
    var expandedComment= {};
    var parents = [null];
    var currentIndent = 2;
    var url = Store.getURL();
    for (var i =1; i<orgModeArray.length; i++){ //for-loop cannot be map because consecutive lines depend on each other
      var idxSpace = orgModeArray[i].indexOf(' ');
      var idxBar   = orgModeArray[i].indexOf('||');
      if (idxSpace<1)
        break;
      const title = orgModeArray[i].substr(idxSpace,idxBar-idxSpace);
      const docID = orgModeArray[i].substr(idxBar+2);
      if (idxSpace>currentIndent) {
        parents.push(i-1);
      }
      for (var j=0; j<(currentIndent-idxSpace); j++) {
        parents.pop();
      }
      currentIndent = idxSpace;
      initialData.push({
        id:i.toString(),
        parent:parents[parents.length-1],
        docID:docID,
        name: title,
        delete: false
      });
      expanded[i.toString()]        = false;
      expandedComment[docID] = true;
      //start filling local database of items
      url.url.get(url.path+docID).then((res) => {
        this.setState({[docID]: res.data});
        //download subitems into local database
        Object.keys(res.data).map(i=>{
          if (/^[a-wyz]-[\w\d]{32}$/.test(res.data[i]) && i!='_id') { //if link to other dataset
            url.url.get(url.path+res.data[i]).then((resI) => {
              this.setState({[res.data[i]]: resI.data});
            }).catch(()=>{
              this.setState({[res.data[i]]: null});
              console.log('Project:getHierarchy level 2: Error encountered: '+url.path+res.data[i]);
            });
          }
        });
      }).catch(()=>{
        this.setState({[docID]: null});
        console.log('Project:getHierarchy: Error encountered: '+url.path+docID);
      });
    }
    var tree = this.treeData(initialData);
    //convert back/forth to flat-data to include path (hierarchyStack)
    const flatData = this.flatData(tree);
    tree = this.treeData(flatData);
    this.setState({treeData: tree, expanded: expanded, expandedComment: expandedComment});
  }

  treeToOrgMode(children,prefixStars,delItem) {
    /* recursive function to finalize
       tree-like data from SortableTree to orgMode, which is communicated to backend */
    prefixStars += 1;
    var orgMode = children.map(( item )=>{
      const delSubtree     = (item.delete) ? true : Boolean(delItem);
      const childrenString = 'children' in item ?
        '\n'+this.treeToOrgMode(item.children,prefixStars, delSubtree) : '';
      const name        = (delSubtree) ? '-delete-' : item.name;
      const docIDString = (item.docID && item.docID.substring(0,5)!='temp_') ?
        '||'+item.docID : '';
      var comment     = '\n';
      if (item.docID && this.state[item.docID]) {
        if (this.state[item.docID].tags) //tags are in document
          comment += this.state[item.docID].tags.join(' ');
        comment += ' '+this.state[item.docID].comment;
      }
      return '*'.repeat(prefixStars)+' '+name+docIDString+comment+childrenString;
    });
    return orgMode.join('\n');
  }

  toggleTable=()=>{
    /* close project view */
    Actions.restartDocType();
  }
  toggleDeleteModal=()=>{
    /** change visibility of modal */
    if(this.state.showDeleteModal==='none') {
      this.setState({showDeleteModal: 'block'});
    } else {
      this.setState({showDeleteModal: 'none'});
    }
  }


  inputChange=(event)=>{
    /* change in input field at bottom */
    this.setState({newItem: event.target.value});
  }

  pressedButton=(task)=>{
    /** global pressed buttons: sibling for pressedButton in ConfigPage: change both similarly */
    if (task=='btn_proj_fe_deleteHierarchy') {
      //loop through all valid sub-hierarchy elements and delete them
      Object.keys(this.state).map(item=>{
        if (item.substr(0,2)=='x-' && item.length==34)
          Store.deleteDoc(item, this.state[item]._rev);
      });
      Store.deleteDoc();  //remove project
      this.toggleTable();  //cancel
    } else {
      //all other functions
      Actions.comState('busy');
      var content = null;
      if (task=='btn_proj_be_saveHierarchy') {
        content = this.state.project.name+'||'+this.state.project._id+'\n';
        content += this.treeToOrgMode(this.state.treeData, 0, false);
      }
      executeCmd(task,this.callback,this.state.project._id,content);
    }
  }
  callback=(content)=>{
    if (content.indexOf('SUCCESS')>-1) {
      Actions.comState('ok');
      this.props.callback();
    } else {
      Actions.comState('fail');
      console.log('callback',content);
    }
  }

  expand=(id, comment=false) => {
    /* expand/collapse certain branch */
    if (comment) {
      var expanded = this.state.expandedComment;
      expanded[id] = ! expanded[id];
      this.setState({expandedComment: expanded});
    } else {
      var expanded2 = this.state.expanded;
      expanded2[id] = ! expanded2[id];
      this.setState({expanded: expanded2});
    }
  }

  editItem=(item)=>{
    /* click edit button for one item in the hierarchy; project-edit handled separately */
    if (item.docID=='' || item.docID.slice(0,5)=='temp_') {
      var tempDoc = Object.assign({}, item);
      tempDoc['-type'] = ['x1'];
      const ontologyNode = [{name:'name', query:'What is the name?', unit:'', required:true},
        {name: 'comment', query: '#tags comments remarks :field:value:', unit: '', required: false}];
      const mode = (item.name.length==0) ? 'new' : 'edit';
      Actions.showForm(mode,ontologyNode,tempDoc);
    } else {
      var url = Store.getURL();
      url.url.get(url.path+item.docID).then((res) => {
        const doc = res.data;
        const docType=doc['-type'][0];
        const ontologyNode = Store.getOntology()[docType];
        Actions.showForm('edit', ontologyNode, doc);
      }).catch((err)=>{
        console.log('Project:editItem: Error encountered: '+url.path+item.docID);
        console.log('Error:',err.toString());
      });
    }
  }

  editProject=()=>{
    /* click edit button for project-edit */
    const ontologyNode = Store.getOntology()['x0'];
    Actions.showForm('edit', ontologyNode, this.state.project);
  };

  changeTree=(item,direction) => {
    /* most events that change the hierarchy tree: up,promote,demote,delete,add*/
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
      const parentPath = flatData.filter((node)=>{
        return (node.id===item.parent) ? node : false;
      })[0]['path'];
      item.path   = parentPath.concat([item.id]);
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
      var name = (this.state.newItem=='') ? '--New item--' : this.state.newItem;
      var path = [];
      if (item) {
        parentID=item.id;
        name    ='--New item--';
        path    = item.path;
        var expanded = this.state.expanded;
        expanded[item.id] = true;
        this.setState({expanded: expanded});}
      const newID = (flatData.length+1).toString();
      path = path.concat([newID]);
      flatData.push({id: newID, parent: parentID, docID: '', path:path, name:name, delete: false});
      changedFlatData=true;
      this.setState({newItem:'', saveHierarchy:true });
    } else {
      console.log('ERROR direction unknown',direction);
    }
    //finish by updating treeData
    if (changedFlatData)
      treeData = this.treeData(flatData);
    this.setState({treeData:treeData});
  }

  /** helper functions **/
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


  /** create html-structure; all should return at least <div></div> **/
  showWithImage(docID) {
    /* item if image is present */
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

  showWithContent(docID) {
    /* item if content is present */
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

  showWithout(docID) {
    /* default case */
    return (
      <div className='row'>
        <div className='col-sm-12'>
          {this.showMisc(docID)}
        </div>
      </div>
    );
  }

  showMisc(docID) {
    /* left-side of information:
       SAME AS IN DocDetail:show() */
    var listItems = Object.keys(this.state[docID]).map( (item,idx) => {
      if (Store.itemSkip.indexOf(item)>-1 || Store.itemDB.indexOf(item)>-1 || item==='name') {
        return <div key={'B'+idx.toString()}></div>;
      }
      const label=item.charAt(0).toUpperCase() + item.slice(1);
      var value=this.state[docID][item];
      if (/^[a-wyz]-[\w\d]{32}$/.test(value))
        value = this.state[value] ? this.state[value].name : '** Undefined: document-type';
      if ( (value=='') || (item==='comment' && this.state[docID].comment.indexOf('\n')>0) ) //if comment and \n in comment
        return <div key={'B'+idx.toString()}></div>;
      return <div key={'B'+idx.toString()}>{label}: <strong>{value}</strong></div>;
    });
    const value=this.state[docID].comment;
    if (value && value!='' && value.indexOf('\n')>0 )
      listItems.push(
        <div key={'B_comment'}>Comment:
          <Tooltip title="Expand/Contract">
            <IconButton onClick={()=>this.expand(docID, true)} className='mr-5' size='small'>
              { this.state.expandedComment[docID] && <ExpandLess />}
              {!this.state.expandedComment[docID] && <ExpandMore />}
            </IconButton>
          </Tooltip> <br />
          {this.state.expandedComment[docID] && <ReactMarkdown source={orgToMd(value)} />}
        </div>);
    return listItems;
  }


  showTree(branch){
    /* recursive function to show this item and all the sub-items */
    const tree = branch.map((item, idx)=>{
      //this item text-document
      const thisText=item.docID.substring(0,2)=='x-' || item.docID=='' || item.docID.substring(0,5)=='temp_';
      //previous item is text-document
      const prevText=  idx==0? false  :
        branch[idx-1].docID.substring(0,2)=='x-'|| branch[idx-1].docID=='' ||
        branch[idx-1].docID.substring(0,5)=='temp_';
      var docType   = this.state[item.docID] ?  this.state[item.docID]['-type'].join('/') :
        'x'+item.path.length.toString();
      if (docType[0][0]=='x') {
        var docLabel = Store.getDocTypeLabels()[docType];
        docType = docLabel.slice(0,docLabel.length-1).toLowerCase();
      }
      var date      =(this.state[item.docID] && this.state[item.docID]['-date']) ?
        new Date(this.state[item.docID]['-date']) :
        new Date(Date.now());
      const maxHierarchyDepth = Object.keys(Store.getDocTypeLabels()).filter(i=>{return i[0][0]=='x';}).length;
      var color = 'black';
      if (this.state[item.docID] && this.state[item.docID].tags) {
        if (this.state[item.docID].tags.indexOf('#DONE')>-1) color='green';
        if (this.state[item.docID].tags.indexOf('#TODO')>-1) color='red';
      }
      return (
        !item.delete &&
        <div key={item.id}>
          <div className='container border pl-2 pt-2'>
            <div className='row ml-0'>
              {/*HEAD OF DATA */}
              <div><strong><span style={{color:color}}>{item.name}</span></strong>&nbsp;&nbsp;&nbsp;
                          type:{docType}&nbsp;&nbsp;&nbsp;
                {/*{item.docID}&nbsp;&nbsp;&nbsp;  */}
                <strong>{date.toLocaleString()}</strong></div>
              {/*BUTTONS*/}
              <div className='ml-auto'>
                {item.children && <Tooltip title="Expand/Contract">
                  <IconButton onClick={()=>this.expand(item.id)} className='mr-5' size='small'>
                    {this.state.expanded[item.id]  && <ExpandLess />}
                    {!this.state.expanded[item.id] && <ExpandMore />}
                  </IconButton>
                </Tooltip> }
                <Tooltip title="Promote"><span>
                  <IconButton onClick={()=>this.changeTree(item,'promote')} className='m-0' size='small'
                    disabled={!(ELECTRON && item.parent && (prevText || idx==0) )}>
                    <ArrowBack />
                  </IconButton>
                </span></Tooltip>
                <Tooltip title="Move up"><span>
                  <IconButton onClick={()=>this.changeTree(item,'up')}      className='m-0' size='small'
                    disabled={!(ELECTRON && !this.firstChild(this.state.treeData,item.id))}>
                    <ArrowUpward />
                  </IconButton>
                </span></Tooltip>
                <Tooltip title="Demote"><span>
                  <IconButton onClick={()=>this.changeTree(item,'demote')}    className='m-0' size='small'
                    disabled={!(ELECTRON && !this.firstChild(this.state.treeData,item.id) &&
                                item.path.length<(maxHierarchyDepth-1) && prevText)}>
                    <ArrowForward />
                  </IconButton>
                </span></Tooltip>
                <Tooltip title="Edit"><span>
                  <IconButton onClick={()=>this.editItem(item)}             className='ml-5' size='small'>
                    <Edit />
                  </IconButton>
                </span></Tooltip>
                <Tooltip title="Delete"><span>
                  <IconButton onClick={()=>this.changeTree(item,'delete')}  className='m-0' size='small'
                    disabled={!ELECTRON}>
                    <Delete />
                  </IconButton>
                </span></Tooltip>
                <Tooltip title="Add child"><span>
                  <IconButton onClick={()=>this.changeTree(item,'new')}     className='m-0' size='small'
                    disabled={!(ELECTRON && item.path.length<(maxHierarchyDepth-1) && thisText)}>
                    <Add />
                  </IconButton>
                </span></Tooltip>
              </div>
            </div>
            {/*BODY OF THIS BRANCH: depending if image/content is present*/}
            {this.state[item.docID] && this.state[item.docID].content  && this.showWithContent(item.docID)}
            {this.state[item.docID] && this.state[item.docID].image    && this.showWithImage(item.docID)}
            {this.state[item.docID] && !this.state[item.docID].content && !this.state[item.docID].image &&
              this.showWithout(item.docID)}
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


  /** the render method **/
  render() {
    return (
      <div className='col px-2' style={ Object.assign({height:window.innerHeight-60},areaScrollY) }>
        {/*HEADER: Project description and buttons on right*/}
        <div className='mb-2'>
          <div className='row mx-0'>
            <div>
              <span style={h1}>{this.state.project.name}</span>&nbsp;&nbsp;&nbsp;
              Status: <strong>{this.state.project.status}</strong>
            </div>
            <div className='row ml-auto mr-0'>
              { ELECTRON && <div>
                <Tooltip title="DELETE Project Hierarchy">
                  <IconButton onClick={() => this.toggleDeleteModal()}
                    className='m-0' size='small'>
                    <Delete fontSize='large'/>*&nbsp;&nbsp;&nbsp;
                  </IconButton>
                </Tooltip>
                <ModalSimple title='Warning'
                  text='Really remove entire project hierarchy in database? Remove on harddisk manually.'
                  onYes={()=>{this.pressedButton('btn_proj_fe_deleteHierarchy');}}
                  display={this.state.showDeleteModal} callback={this.toggleDeleteModal}
                />
              </div> }
              <Tooltip title="Edit Project Details">
                <IconButton onClick={()=>this.editProject()} className='mx-2' size='small'>
                  <Edit fontSize='large'/>
                </IconButton>
              </Tooltip>
              { ELECTRON && <Tooltip title="Save Project Hierarchy">
                <IconButton onClick={() => this.pressedButton('btn_proj_be_saveHierarchy')}
                  className='m-0' size='small' disabled={!this.state.saveHierarchy}>
                  <Save fontSize='large'/>
                </IconButton>
              </Tooltip>}
              { ELECTRON && <Tooltip title="Scan for new measurements, etc.">
                <IconButton onClick={() => this.pressedButton('btn_proj_be_scanHierarchy')}
                  className='mx-2' size='small'>
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
          {this.state.project.comment && this.state.project.comment.length>0 &&
            this.state.project.comment.indexOf('\n')==-1 && this.state.project.comment}
          {this.state.project.comment && this.state.project.comment.length>0 &&
            this.state.project.comment.indexOf('\n')>0 &&
            <ReactMarkdown source={this.state.project.comment}/>}
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
