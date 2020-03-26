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


function fillDocBeforeCreate(data, docType,project) {
  /* Fill the data before submission to database with common data
  - type, project, childs 
  - separate comment into tags, fields
  - create id
  */
  data['name'] = data['name'].trim();
  if (data['objective']) {
    data['objective'] = data['objective'].trim();
  }
  data['type'] = docType;
  var prefix = '';
  if (docType==='project' || docType==='step' || docType==='task') {
    prefix = 't-'
  } else {
    prefix = docType[0]+'-';
  }
  if (!data['_id']) {       //if new (if not update): create new id
    data['_id'] = prefix+uuidv4();
  }
  if (typeof project === 'string') {
    data['projectID']=project;
  } else if (docType==='project') { 
    data['projectID']=data['_id'];
  } else {
    data['projectID']='';
    console.log("***WARNING DO NOT SUBMIT with empty parent");
  }
  data['childs'] = [];
  const now      = new Date();
  data['date']   = now.toISOString();
  //separate comment into tags and fields
  //these tags are lost: '#d': too short; '#3tag': starts with number
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
  data['comment'] = data['comment'].replace(/:[\S]+:[\S]+:/g,'');
  data['comment'] = data['comment'].replace("  "," ").trim();
  //individual verification of documents
  if (data['type']==='sample') {
    if (!data.qr_code) {data['qr_code']=[''];}
    if (typeof data.qr_code === 'string' || data.qr_code instanceof String) {
      data.qr_code=data.qr_code.split(' ');
    }
  }
  if (data['type']==='measurement') {
    if (!data.image) {data['image']='';}
    if (!data.md5sum) {data['md5sum']='';}
    if (!data.measurementType) {data['measurementType']='';}
  }
  return data;
}


function dataDictionary2DataLabels(inJson){
  /* Extract labels as first items in data dictionary
  return object([dataType,dataLabel],[dataType,dataLabel])
  */
 var outList = Object.keys(inJson).map( function(key,idx){
    if (key[0]==='-' || key[0]==='_') return [null,null];
    else                              return [key,Object.keys(inJson[key][0])[0]];
  });
  outList = outList.filter(function(value){return value[0]!=null});
  const dataList = outList.filter(function(value){return inJson['-hierarchy-'].indexOf(value[0])<0});
  const hierarchyList = outList.filter(function(value){return inJson['-hierarchy-'].indexOf(value[0])>=0 &&
                                                        value[1].length>1});
  return {'dataList':dataList, 'hierarchyList':hierarchyList};
}


function dataDictionary2ObjectOfLists(inJson){
  /*
  convert dataDictionary into an object that contains the list of properties
  */
  const tempObj = inJson.map(function(row, index){
    const length = row.length;       delete row.length;
    const list   = row.list;         delete row.list;
    const generate = row.generate;   delete row.generate;
    const name   = Object.keys(row)[0];
    const longName= row[name];
    return [name,length,list,generate,longName];
  });
  return {names: tempObj.map(    function(row){return row[0];}),
          lengths: tempObj.map(  function(row){return row[1];}),
          lists: tempObj.map(    function(row){return row[2];}),
          generate: tempObj.map( function(row){return row[3];}),
          longNames: tempObj.map(function(row){return row[4];})};
}


function projectDocs2String(data, branch, level) {
  /*
  Recursively called function to create string representation of hierarchy tree
  */
  if (!(branch in data)) {       //if child is a measurement
    return "";
  }
  for (var prefix = "";prefix.length<(level*2); prefix+="  ");   //str.repeat(int) does not work for some reason
  var output = prefix+data[branch][0]+': '+data[branch][1]+'\n';
  for (var i=0; i<data[branch][2].length; i++) {
    output += projectDocs2String(data,data[branch][2][i],level+1);
  }
  return output;
}


function doc2SortedDoc(doc, tableMeta) {
  /**
   * key, values lists are stored; both of them have the same order
   * lists of main-data, 
   * stored without lists: image and meta data
   */
  // console.log("Common tools got this document");
  // console.log(doc);
  //1. image
  const valuesImage = doc['image'];
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
  delete doc['image'];  //delete if it was not already in valuesMain
  //A) meta data
  const valuesMeta = doc['meta'];
  delete doc['meta'];
  //B) database data: user cannot use this information
  const keysDB   = ['type','_id','projectID','childs','_rev',];
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
          meta:  valuesMeta };
}


function camelCase(str) {
  /* Produce camelCase from normal string
  */
  var outString = str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
  outString.replace(":","");
  return outString;
}


exports.fillDocBeforeCreate = fillDocBeforeCreate;
exports.dataDictionary2DataLabels = dataDictionary2DataLabels;
exports.dataDictionary2ObjectOfLists = dataDictionary2ObjectOfLists;
exports.projectDocs2String = projectDocs2String;
exports.doc2SortedDoc = doc2SortedDoc;
exports.camelCase = camelCase;