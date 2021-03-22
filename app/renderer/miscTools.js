function orgToMd(orgString){
  /** Simple translation of org-mode to md files
   * - only converts the structure *** -> ' -'
   * - if it does not start with some form of '* ', no translation and return original string
   */
  var prefix0 = orgString.match(/^[\*]* /);
  if (prefix0) {
    prefix0     = prefix0[0].length-1;
    const re = new RegExp('^[\*]{'+prefix0.toString()+'}');
    var mdString = orgString.split(/\r\n|\r|\n/);
    var prefix  = 0;            //prefix that evolves across all lines
    var prevLineHasStar = true;
    for (var i=0; i<mdString.length; i++) {
      var newLine = re[Symbol.replace](mdString[i],'').trim();
      var prefix1  = newLine.match(/^[\*]* /);
      if (prefix1) {
        prefix  = prefix1[0].length-2;  //count of * at the beginning
        newLine = '  '.repeat(prefix)+'- '+newLine.substring(prefix+2);
        prevLineHasStar = true;
      } else {
        if (i>0 && prevLineHasStar) {
          prefix++;
          prevLineHasStar = false;
        }
        newLine = '  '.repeat(prefix)+newLine;
      }
      mdString[i] = newLine;
    }
    return mdString.join('\n');
  } else {
    return orgString;
  }
}

exports.orgToMd = orgToMd;
