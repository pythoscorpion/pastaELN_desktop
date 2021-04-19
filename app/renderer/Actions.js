/* all actions that components can execute
   NO axios REST interaction here, store should be the central place
   names according to CURD: Create,Update,Read,Delete
*/
import dispatcher from './Dispatcher';

export function readDoc(id) {
  dispatcher.dispatch({
    type: 'READ_DOC',
    id: id
  });
}

export function updateDoc(doc,oldDoc) {
  dispatcher.dispatch({
    type: 'UPDATE_DOC',
    doc: doc,
    oldDoc: oldDoc
  });
}

export function updateExtractors() {
  dispatcher.dispatch({
    type: 'UPDATE_EXTRACTORS',
  });
}

export function changeTextDoc(doc,oldDoc) {
  dispatcher.dispatch({
    type: 'CHANGE_TEXT_DOC',
    doc: doc,
    oldDoc: oldDoc
  });
}

export function createDoc(doc) {
  dispatcher.dispatch({
    type: 'CREATE_DOC',
    doc: doc
  });
}

export function readTable(docType) {
  dispatcher.dispatch({
    type: 'READ_TABLE',
    docType: docType
  });
}

export function restartDocType() {
  dispatcher.dispatch({
    type: 'RESTART_DOC_TYPE'
  });
}
export function restartDocDetail() {
  dispatcher.dispatch({
    type: 'RESTART_DOCDETAIL'
  });
}

export function comState(text) {
  dispatcher.dispatch({
    type: 'COM_STATE',
    text: text
  });
}

export function showForm(kind, tableMeta, doc) {
  dispatcher.dispatch({
    type: 'SHOW_FORM',
    kind: kind,
    tableMeta: tableMeta,
    doc: doc
  });
}

