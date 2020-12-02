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

export function updateDoc(doc) {
  dispatcher.dispatch({
    type: 'UPDATE_DOC',
    doc: doc
  });
}

export function createDoc(doc) {
  dispatcher.dispatch({
    type: 'CREATE_DOC',
    doc: doc
  });
}

export function readTable() {
  dispatcher.dispatch({
    type: 'READ_TABLE'
  });
}

export function toggleRightPane(nextPane) {
  dispatcher.dispatch({
    type: 'TOGGLE_RIGHT_PANE',
    pane: nextPane
  });
}

export function restartDocType() {
  dispatcher.dispatch({
    type: 'RESTART_DOC_TYPE'
  });
}

