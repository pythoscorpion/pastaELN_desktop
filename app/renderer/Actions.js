/* all actions that components can execute
   NO axios REST interaction here, store should be the central place
   names according to CURD: Create,Update,Read,Delete
*/
import dispatcher from './Dispatcher';

// ** CRUD FUNCTIONS ** //
export function readDoc(id) {
  /** Read document */
  dispatcher.dispatch({
    type: 'READ_DOC',
    id: id
  });
}
export function updateDoc(doc,oldDoc) {
  /** Update document */
  dispatcher.dispatch({
    type: 'UPDATE_DOC',
    doc: doc,
    oldDoc: oldDoc
  });
}
export function changeTextDoc(doc,oldDoc) {
  /** Update a text document (step,task) in project.js without server interaction */
  dispatcher.dispatch({
    type: 'CHANGE_TEXT_DOC',
    doc: doc,
    oldDoc: oldDoc
  });
}
export function createDoc(doc) {
  /** Create a document: doc=dict */
  dispatcher.dispatch({
    type: 'CREATE_DOC',
    doc: doc
  });
}
export function readTable(docType) {
  /** Read table of documents of type docType */
  dispatcher.dispatch({
    type: 'READ_TABLE',
    docType: docType
  });
}


// ** USER ELEMENT FUNCTIONS ** //
export function showForm(kind, tableMeta, doc) {
  /** show form to create new or edit existing dataset */
  dispatcher.dispatch({
    type: 'SHOW_FORM',
    kind: kind,
    tableMeta: tableMeta,
    doc: doc
  });
}
export function comState(text) {
  /** set state of communication logo: menu-item top-left */
  dispatcher.dispatch({
    type: 'COM_STATE',
    text: text
  });
}
export function restartDocType() {
  /** Restart this docType by rereading table:
   * can only be called by Project */
  dispatcher.dispatch({
    type: 'RESTART_DOC_TYPE'
  });
}
export function restartDocDetail() {
  /** Reread document detail */
  dispatcher.dispatch({
    type: 'RESTART_DOCDETAIL'
  });
}

// ** MISC ** //
export function updateExtractors() {
  /** Update extractors by using backend */
  dispatcher.dispatch({
    type: 'UPDATE_EXTRACTORS'
  });
}

export function emptyLogging() {
  /** Empty logging everywhere */
  dispatcher.dispatch({
    type: 'EMPTY_LOGGING'
  });
}
