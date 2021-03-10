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

export function createDoc(doc) {
  dispatcher.dispatch({
    type: 'CREATE_DOC',
    doc: doc
  });
}

export function readTable(docLabel) {
  dispatcher.dispatch({
    type: 'READ_TABLE',
    docLabel: docLabel
  });
}

export function restartDocType() {
  dispatcher.dispatch({
    type: 'RESTART_DOC_TYPE'
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

