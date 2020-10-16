/* Common functions for js- and python code
  ONLY Written here in js. python functions are obtained by automatic translation
  PythonFolder: execute "asTools.py"
*/

function uuidv4() {
  // since py and js could use same document creation: they have to create similar shaped uuids
  // from: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & (0x3 | 0x8));
    return v.toString(16);
  });
}


function fillDocBeforeCreate(data,docType,prefix) {
  /**
   *  Fill the data before submission to database with common data
   * - type, project, childs
   * - separate comment into tags, fields
   * - create id
   *
   * Args:
   *    data: document to save
   *    docType: type of document, e.g. project
   *    prefix: prefix for ID, can be null to generate here
   *
   * Returns:
   *    document
  */
  const keys = Object.keys(data)
  keys.map(function(key){
    if (typeof data[key] === 'string' || data[key] instanceof String) {
      data[key] = data[key].trim();
    }
    return data[key];
  });
  if (!data['type']) {
    data['type'] = [docType];
  }
  if (!prefix) {
    prefix = docType[0][0];
  }
  if (!data['_id']) {       //if new (if not update): create new id
    data['_id'] = prefix+'-'+uuidv4();
  }
  data['nextRevision'] = 0;
  const now      = new Date();
  data['date']   = now.toISOString();
  //separate comment into tags and fields
  //these tags are lost: '#d': too short; '#3tag': starts with number
  if (!data['comment']) {
    data['comment'] ='';
  }
  if (!data['tags']) {
    var rating = data.comment.match(/#\d/);  //one character following #
    if (rating===null) { rating=[]; }
    var otherTags= data['comment'].match(/#\D[\S]+/g);
    if (otherTags===null) { otherTags=[]; }
    data['tags'] = rating.concat(otherTags);
    data['comment'] = data['comment'].replace(/#[\S]+/g,'');
    const fields = data['comment'].match(/:[\S]+:[\S]+:/g);
    if (fields!=null) {
      fields.map(function(item) {
        const aList = item.split(':');
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
      for (var prefixJ = "";prefixJ.length<Math.round(initSpaces/2)*2; prefixJ+=" ");//str.repeat(int) does not work for some reason
      data['comment'] += prefixJ+line.trim()+'\n';  //do not replace spaces inside the line
    }
    data['comment'] = data['comment'].substring(0, data['comment'].length-1);
  }
  if (typeof data['tags'] === 'string' || data['tags'] instanceof String) {
    data['tags'] = data['tags'].split(' ');
  }
  //remove items that should not exist
  if (data.path) {
    console.log("cT got path");
    console.log(data);
    delete data.path;
  }
  //individual verification of documents
  if (data['type'][0]==='sample') {
    if (!data.qrCode) {data['qrCode']=[];}
    if (typeof data.qrCode === 'string' || data.qrCode instanceof String) {
      data.qrCode=data.qrCode.split(' ');
    }
  }
  if (data['type'][0]==='measurement') {
    if (!data.image) {data['image']='';}
    if (!data.md5sum) {data['md5sum']='';}
  }
  return data;
}


function dataDictionary2DataLabels(inJson){
  /** Extract labels as first items in config
  *
  * Args:
  *    inJson: data-dictionary
  *
  * Returns:
  *    dictionary: dataList, hierarchyList
  */
 var outList = Object.keys(inJson).map( function(key,idx){
    if (key[0]==='-' || key[0]==='_' || inJson[key].config.length===0)
        return [null,null];
    else
        return [key,inJson[key].config[0]];
  });
  outList = outList.filter(function(value){return value[0]!=null});
  const dataList      = outList.filter(function(value){return inJson['-hierarchy-'].indexOf(value[0])<0});
  const hierarchyList = outList.filter(function(value){return inJson['-hierarchy-'].indexOf(value[0])>=0});
  return {'dataList':dataList, 'hierarchyList':hierarchyList};
}


function dataDictionary2ObjectOfLists(inJson){
  /** convert dataDictionary into an object that contains the list of properties
  *
  * Args:
  *    inJson: data-dictionary
  *
  * Returns:
  *    dictionary: names, length, lists, generate, longNames
  */
  const tempObj = inJson.map(function(row, index){
    return [row.name,row.length,row.list,row.generate,row.long];
  });
  return {names: tempObj.map(    function(row){return row[0];}),
          lengths: tempObj.map(  function(row){return row[1];}),
          lists: tempObj.map(    function(row){return row[2];}),
          generate: tempObj.map( function(row){return row[3];}),
          longNames: tempObj.map(function(row){return row[4];})};
}


function hierarchy2String(data, addID, callback, detail, magicTags) {
  /** Convert dictionary for hierarchical tree into a string
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
        if (childNum>999) console.log("**ERROR** ChildNUM>999 **ERROR** ");
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
  // use sorted data list and create string
  var outString = dataList.map(function(item){
    const hierarchyArray = item.hierarchy.split(' ');
    const spaces = hierarchyArray.length/2-0.5;
    for (var prefix = "";prefix.length<=spaces; prefix+="*");//str.repeat(int) does not work for some reason
    if (addID===true) {
      var partString = item.label[1];
      var docID = hierarchyArray[hierarchyArray.length-1];
      partString += "||"+docID;
      if (typeof callback === 'function'){
        var doc = callback(docID);
        if (detail==='all'){
          for (var i=0; i<doc.branch.length; i++) {
            partString += "\nPath: "+doc.branch[i].path;
          }
          partString += "\nInheritance: "
          for (var i1=0; i1<doc.branch.length; i1++) {
            partString += doc.branch[i1].stack+" ";
          }
        }
        if (doc.type==='project') {
          partString += "\nObjective: "+doc.objective;
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
        partString += "\nTags: "+doc.tags.join(' ')+"\n"+doc.comment;
      }
      partString = prefix+" "+ partString;
    } else {
      partString = prefix+" "+item.label[0]+": "+item.label[1];
    }
    return partString;
  });
  // end of mapping
  return outString.join('\n');
}



function editString2Docs(text, magicTags) {
  /** Org-Mode string into list of documents
   * Args:
   *    text: org-mode string incl. docIDs
   *    magicTags: tags to be moved to the front; order important..last are added to front
   *
   * Returns:
   *    list of documents, document = list of "-new-",title,objective,tags,comment,docID,docType
   */

  var docs = [];
  var objective='', tags='', comment='', title='', docID='', docType='';
  text = text.split('\n');
  for (var i=0; i<text.length; i++) {
    const line = text[i];
    if (line.substring(0,2)==='* '||line.substring(0,3)==='** '||line.substring(0,4)==='*** '){
      // finish this enty
      if (title!==''){
        comment = comment.trim(); //remove trailing /n
        if (docID==='')
          docs.push({edit:"-new-",name:title,objective:objective,tags:tags,comment:comment,_id:docID,type:docType});
        else
          docs.push({edit:"-edit-",name:title,objective:objective,tags:tags,comment:comment,_id:docID,type:docType});
      }
      // reset variables
      objective=''; tags=''; comment=''; title=''; docID=''; docType='';
      // fill new set
      const parts = line.split("||");
      title = parts[0].split(" ").slice(1).join(" ");
      for (var j=magicTags.length-1; j>=0; j--){
        if (title.substring(0,4)===magicTags[j]){
          title = title.slice(magicTags[j].length+1);
          tags += '#'+magicTags[j]+' ';
        }
      }
      tags = tags.trim();
      if (parts.length >1) docID = parts[parts.length-1];
      docType = line.split(" ")[0].length-1;
    }
    else if (line.substring(0,10)==='Objective:') objective = line.substring(10,line.length);
    else if (line.substring(0,5) ==='Tags:')      tags += line.substring(5,line.length).trim();
    else                                          comment += line+'\n';
  }
  // after all done, process last document
  comment = comment.trim();
  if (docID==='')
    docs.push({edit:"-new-",name:title,objective:objective,tags:tags,comment:comment,_id:docID,type:docType});
  else
    docs.push({edit:"-edit-",name:title,objective:objective,tags:tags,comment:comment,_id:docID,type:docType});
  return docs;
}


function getChildren(data,docID){
  /** Get direct children of document
   *
   * Args:
   *    data: hierarchical tree in org-mode format
   *    docID: id for parent
   *
   * Returns:
   *    dictionary of names and ids of direct first-order children
   */
  var names = []
  var ids   = []
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
      if (items[0][0]==="*")
      numStarsParent = items[0].split(' ').length;
      else
      numStarsParent = 0
      saveLine = true;
    }
  }
  return {names: names, ids:ids};
}


function doc2SortedDoc(doc, tableMeta) {
  /** key, values lists are stored; both of them have the same order
   * lists of main-data,
   * stored without lists: image and meta data
   *
   * Args:
   *    doc: document to sort
   *    tableMeta: used for sorting (not meta-data TODO Rename)
   *
   * Results:
   *    dictionary of items
   */
  //1. image
  const valuesImage = doc['image'];
  delete doc['image'];  //delete if it was not already in valuesMain
  //2. most important data: that is in the table, in that order
  const keysMain   = tableMeta.names;
  const valuesMain = keysMain.map(function(key,idx){
    var value = doc[key];
    if (!(typeof value === 'string' || value instanceof String)) {
      if (!value) {
        value = '';
      }
      else {
        value = value.toString();
      }
    }
    delete doc[key];
    return value;
  });
  delete doc['branch'];
  //A) meta data
  const metaVendor = doc['metaVendor'];
  const metaUser = doc['metaUser'];
  delete doc['metaVendor'];
  delete doc['metaUser'];
  //B) database data: user cannot use this information
  const keysDB   = ['type','_id','_rev','client','user'];
  const valuesDB = keysDB.map(function(key,idx){
    var value = doc[key];
    if (key==='childs') {
      value = doc[key].length.toString();
    }
    delete doc[key];
    return value;
  });
  //3. details (that are not already saved)
  const keysDetail  = Object.keys(doc);
  const valuesDetail= keysDetail.map(function(key,idx){
    return doc[key];
  });
  return {keysMain:   keysMain,   valuesMain: valuesMain,
          keysDetail: keysDetail, valuesDetail: valuesDetail,
          keysDB:     keysDB,     valuesDB: valuesDB,
          image: valuesImage,
          metaVendor:  metaVendor, metaUser:  metaUser };
}


function camelCase(str) {
  /** Produce camelCase from normal string
  */
  var outString = str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (/\s+/.test(match)) return ""; // for white spaces
    return match.toUpperCase();       // else, incl. numbers
  });
  outString = outString.replace(/\W/g,"");
  return outString;
}


exports.fillDocBeforeCreate = fillDocBeforeCreate;
exports.dataDictionary2DataLabels = dataDictionary2DataLabels;
exports.dataDictionary2ObjectOfLists = dataDictionary2ObjectOfLists;
exports.hierarchy2String = hierarchy2String;
exports.editString2Docs = editString2Docs;
exports.getChildren = getChildren;
exports.doc2SortedDoc = doc2SortedDoc;
exports.camelCase = camelCase;