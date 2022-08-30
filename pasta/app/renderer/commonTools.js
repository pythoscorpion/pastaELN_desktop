/* Common functions for js- and python code
  ONLY Written here in js. python functions are obtained by automatic translation
  PythonFolder: execute 'asTools.py'
*/

function uuidv4() {
  // since py and js could use same document creation: they have to create similar shaped uuids
  // from: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  // - used internal in this file
  return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & (0x3 | 0x8));
    return v.toString(16);
  });
}


function fillDocBeforeCreate(data,docType) {
  /**
   *  Fill the data before submission to database with common data
   * - type, project, childs
   * - separate comment into tags, fields
   * - create id if needed
   *
   * used in backend.py and Store.js
   *
   * Args:
   *    data: document to save
   *    docType: type of document, e.g. project
   *
   * Returns:
   *    document
   */
  const protectedKeys = ['comment','tags','image'];
  //Handle the important entries: -type, _id, -date, -branch
  if (!data['-type']) {
    data['-type'] = [docType];
  }
  if (typeof data['-type'] === 'string' || data['-type'] instanceof String) {
    data['-type'] = data['-type'].split('/');
  }
  if (!data['_id']) {       //if new (if not update): create new id
    var prefix = (docType[0]=='x')? 'x' : docType[0][0];
    data['_id'] = prefix+'-'+uuidv4();
  }
  const now      = new Date();
  data['-date']   = now.toISOString();
  if (!data['-branch']) {
    data['-branch'] = [{'stack':[], 'path':null}];
  }
  //separate comment into tags and fields
  //these tags are lost: '#d': too short; '#3tag': starts with number
  //  Note: should distinguish between comment==null vs. comment==undefined: but not possible with js2py
  if (!data['comment'])
    data['comment'] ='';
  if (!data['tags'])
    data['tags'] = [];
  var rating = data.comment.match(/#\d/);  //one character following #
  if (rating===null) { rating=[]; }
  var otherTags= data['comment'].match(/(^|\s)#{1}[a-zA-Z][\w]+/g);
  if (otherTags===null) { otherTags=[]; }
  data['tags'] = rating.concat(data['tags']).concat(otherTags);
  data['comment'] = data['comment'].replace(/(^|\s)#{1}[\w]+/g,' ');
  const fields = data['comment'].match(/:[\S]+:[\S]+:/g);
  if (fields!=null) {
    fields.map(function(item) {
      const aList = item.split(':');
      if (data[aList[1]]) //do not add if item already exists
        return;
      if (isNaN(aList[2])) {
        return data[aList[1]] = aList[2];
      } else {
        return data[aList[1]] = +aList[2];
      }
    });
  }
  // clean the comments
  data['comment'] = data['comment'].replace(/:[\S]+:[\S]+:/g,''); //remove :field:data: information
  var text = data['comment'].split('\n');
  data['comment'] = '';
  for (var i=0; i<text.length; i++) {
    const line = text[i];
    var initSpaces = line.search(/\S|$/);
    for (var prefixJ = '';prefixJ.length<Math.round(initSpaces/2)*2; prefixJ+=' ');//str.repeat(int) does not work for some reason
    data['comment'] += prefixJ+line.trim()+'\n';  //do not replace spaces inside the line
  }
  data['comment'] = data['comment'].substring(0, data['comment'].length-1);
  if (typeof data['tags'] === 'string' || data['tags'] instanceof String) {
    data['tags'] = data['tags'].split(' ');
  }
  data['tags']=data['tags'].map(function(v){
    return v.trim();
  });
  //individual verification of documents
  if (data['-type'][0]==='sample') {
    if (!data.qrCode) {data['qrCode']=[];}
    if (typeof data.qrCode === 'string' || data.qrCode instanceof String) {
      data.qrCode=data.qrCode.split(' ');
    }
  }
  if (data['-type'][0]==='measurement') {
    if (!data.image) {data['image']='';}
    if (!data.shasum) {data['shasum']='';}
  }
  //cleaning at end of all changes
  const keys = Object.keys(data);
  keys.map(function(key){
    if (typeof data[key] === 'string' || data[key] instanceof String) {
      if (data[key]=='' && protectedKeys.indexOf(key)==-1) {
        delete data[key];
      } else {
        data[key] = data[key].trim();
      }
    }
  });
  return data;
}


function ontology2Labels(ontology, tableFormat){
  /**
   * Extract labels and create lists of docType,docLabel pair
   * - used in Store.js and database.py
   * - docLabel is the plural human-readable form of the docType
   * - docType is the single-case noun
   *
   * Args:
   *    ontology: ontology
   *    tableFormat: tableFormat branch from .pastaELN.json
   *
   * Returns:
   *    dictionary: dataDict, hierarchyDict
   */
  var dataDict = {};
  var hierarchyDict = {};
  Object.keys(ontology).map( function(key){
    if (key=='_id' || key=='_rev')
      return;
    var label = null;
    if (key in tableFormat && '-label-' in tableFormat[key]) {  //use from tableFormat
      label = tableFormat[key]['-label-'];
    } else if (key[0]=='x') {                                   //use default structural elements
      label = ['Projects','Tasks','Subtasks','Subsubtasks'][key[1]];
    } else {                                                    //default system  sample->Samples
      label = key[0].toUpperCase()+key.slice(1)+'s';
    }
    if (key[0]=='x')
      hierarchyDict[key] = label;
    else
      dataDict[key] = label;
    return;
  });
  return {'dataDict':dataDict, 'hierarchyDict':hierarchyDict};
}


function hierarchy2String(data, addID, callback, detail, magicTags) {
  /**
   * Convert dictionary for hierarchical tree into a string
   * - used in Store.js and backend.js
   *
   * Args:
   *    data: dictionary of entries for this project
   *    addID: add doc-Id to output
   *    callBack: callback function to get documents from database
   *    detail: amount of detail to be given
   *    magicTags: tags to be moved to the front; order important..last are added to front
   *
   * Returns:
   *    org-mode string of hierarchy
   */
  var dataList = [];
  // arrange value items (hierarchy) into order that can be used for sorting
  const keys = Object.keys(data);
  var hierString = null;
  for (var i=0; i<keys.length; i++) {
    const key = keys[i];
    const value = data[key];
    if (value[0]===key) { //project: simple hierarchy
      hierString = key;
    } else {             //else: complicated re-structuring
      var hierarchyIDs = value[0].split(' ');
      hierString = hierarchyIDs[0];  // initialize string
      for (var j=1; j<hierarchyIDs.length; j++) {
        const id = hierarchyIDs[j];
        var childNum = 0;
        if (id in data) childNum = data[id][1];
        if (childNum>9999) {
          console.log('**ERROR** commonTools:ChildNUM>9999 **ERROR** '+key);
        }
        hierString += ' '+('00'+childNum).substr(-3)+' '+id; //childNum-ID(padded with 0) ID
      }
      //hierarchy = hierString; //+' '+value[1].toString();
    }
    // add to data list
    dataList.push({hierarchy:hierString, label:value.slice(2)});
  }
  // sorting
  function compare(a,b){
    if (a.hierarchy>b.hierarchy) return 1;
    else                         return -1;
  }
  dataList.sort(compare);

  //console.log(dataList);
  //nativeView, addID=False, callback=None, detail='none', magicTags=None

  // use sorted data list and create string
  var outString = dataList.map(function(item){
    const hierarchyArray = item.hierarchy.split(' ');
    const spaces = hierarchyArray.length/2-0.5;
    for (var prefix = '';prefix.length<=spaces; prefix+='*');//str.repeat(int) does not work for some reason
    if (addID===true) {
      var partString = item.label[1];
      var docID = hierarchyArray[hierarchyArray.length-1];
      partString += '||'+docID;
      if (typeof callback === 'function'){
        var doc = callback(docID);
        if (detail==='all'){
          for (var i=0; i<doc['-branch'].length; i++) {
            partString += '\nPath: '+doc['-branch'][i].path;
          }
          partString += '\nInheritance: ';
          for (var i1=0; i1<doc['-branch'].length; i1++) {
            partString += doc['-branch'][i1].stack+' ';
          }
        }
        if (doc['-type']==['x','project']) {
          partString += '\nObjective: '+doc.objective;
        }
        for (var i2=0; i2<magicTags.length; i2++){
          if (doc.tags.indexOf('#'+magicTags[i2])>-1){
            prefix = prefix + ' '+magicTags[i2];
            for( var i3 = 0; i3 < doc.tags.length; i3++){
              if ( doc.tags[i3]==='#'+magicTags[i2]) {
                doc.tags.splice(i, 1);
                i--;
              }
            }
          }
        }
        partString += '\nTags: '+doc.tags.join(' ')+'\n'+doc.comment;
      }
      partString = prefix+' '+ partString;
    } else {
      partString = prefix+' '+item.label[0]+': '+item.label[1];
    }
    return partString;
  });
  // end of mapping
  return outString.join('\n');
}

function editString2Docs(text, magicTags) {
  /**
   * Org-Mode string into list of documents
   * - used in backend.py
   *
   * Args:
   *    text: org-mode string incl. docIDs
   *    magicTags: tags to be moved to the front; order important..last are added to front
   *
   * Returns:
   *    list of documents, document = list of '-new-',title,objective,tags,comment,docID,docType
   */
  var docs = [];
  var objective=null, tags=null, comment=null, title='', docID='', docType='';
  text = text.split('\n');
  for (var i=0; i<text.length; i++) {
    const line = text[i];
    if (line.substring(0,2)==='* '   ||line.substring(0,3)==='** '   ||line.substring(0,4)==='*** '||
        line.substring(0,5)==='**** '||line.substring(0,6)==='***** '||line.substring(0,7)==='****** '){
      // finish this entry
      if (comment)
        comment = comment.trim(); //remove trailing /n
      var docI = {'-name':title,tags:tags,comment:comment,_id:docID,'-type':docType};
      if (objective)
        docI['objective'] = objective;
      if (title=='-delete-' && docID!='') {
        docI['edit'] = '-delete-';
      } else {
        if (docID=='')
          docI['edit'] = '-new-';
        else
          docI['edit'] = '-edit-';
      }
      if (docID!='' || title!='')
        docs.push(docI);
      // reset variables
      objective=null; tags=null; comment=null; title=''; docID=''; docType='';
      // fill new set
      const parts = line.split('||');
      title = parts[0].split(' ').slice(1).join(' ').trim();
      for (var j=magicTags.length-1; j>=0; j--){
        if (title.substring(0,4)===magicTags[j]){
          title = title.slice(magicTags[j].length+1);
          tags += '#'+magicTags[j]+' ';
        }
      }
      if (tags)
        tags = tags.trim();
      if (parts.length >1) docID = parts[parts.length-1];
      docType = line.split(' ')[0].length-1;              //number of * at the beginning of line
    }
    else if (line.substring(0,10)==='Objective:')
      objective = line.substring(10,line.length).trim();
    else if (line.substring(0,5) ==='Tags:')
      tags      = (tags===null)    ? line.substring(5,line.length).trim() :
        tags+line.substring(5,line.length).trim();
    else
    if ( !(/\|\|\w-/.test(line)))
      comment   = (comment===null) ? line+'\n' : comment+line+'\n';
  }
  // after all done, process last document
  if (comment)
    comment = comment.trim();
  docI = {'-name':title,tags:tags,comment:comment,_id:docID,'-type':docType};
  if (objective)
    docI['objective'] = objective;
  if (title=='-delete-' && docID!='') {
    docI['edit'] = '-delete-';
  } else {
    if (docID=='')
      docI['edit'] = '-new-';
    else
      docI['edit'] = '-edit-';
  }
  docs.push(docI);
  return docs;
}


function getChildren(data,docID){
  /**
   * Get direct children of document
   * - used in backend.py
   *
   * Args:
   *    data: hierarchical tree in org-mode format
   *    docID: id for parent
   *
   * Returns:
   *    dictionary of names and ids of direct first-order children
   */
  var names = [];
  var ids   = [];
  var saveLine = false;
  var numStarsParent = -1;
  const lines = data.split('\n');
  for (var i=0; i<lines.length; i++){
    const items = lines[i].split('||');
    if (saveLine) {
      const nStars = items[0].split(' ')[0].length;
      if (nStars === numStarsParent) break;
      if (nStars === numStarsParent+1) {
        ids.push(items[1]);
        names.push(items[0].substring(numStarsParent+2));
      }
    }
    if (items[1]===docID) {
      if (items[0][0]==='*') {
        numStarsParent = items[0].split(' ').length;
      } else {
        numStarsParent = 0;
      }
      saveLine = true;
    }
  }
  return {names: names, ids:ids};
}


function camelCase(str) {
  /**
   * Produce camelCase from normal string
   *  used in backend.py
   */
  var outString = str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match) {
    if (/\s+/.test(match)) return ''; // for white spaces
    return match.toUpperCase();       // else, incl. numbers
  });
  outString = outString.replace(/\W/g,'');
  return outString;
}


exports.fillDocBeforeCreate = fillDocBeforeCreate;
exports.ontology2Labels = ontology2Labels;
exports.hierarchy2String = hierarchy2String;
exports.editString2Docs = editString2Docs;
exports.getChildren = getChildren;
exports.camelCase = camelCase;