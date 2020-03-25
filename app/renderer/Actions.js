/* all actions that components can execute
   NO axios REST interaction here, store should be the central place
   names according to CURD: Create,Update,Read,Delete
*/
import dispatcher from "./Dispatcher";

export function readDoc(id) {
  dispatcher.dispatch({
    type: "READ_DOC",
    id: id
  });
}

export function updateDoc(doc) {
  dispatcher.dispatch({
    type: "UPDATE_DOC",
    doc: doc
  });  
}

export function createDoc(doc) {
  dispatcher.dispatch({
    type: "CREATE_DOC",
    doc: doc
  });  
}

export function readTable(docLabel) { 
  dispatcher.dispatch({
    type: "READ_TABLE",
    docLabel: docLabel
  });
}

export function toggleEdit() { 
  dispatcher.dispatch({
    type: "TOGGLE_EDIT"
  });
}
export function toggleNew() { 
  dispatcher.dispatch({
    type: "TOGGLE_NEW"
  });
}
export function toggleShow() { 
  dispatcher.dispatch({
    type: "TOGGLE_SHOW"
  });
}

