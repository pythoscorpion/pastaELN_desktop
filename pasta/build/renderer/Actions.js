"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readDoc = readDoc;
exports.updateDoc = updateDoc;
exports.changeTextDoc = changeTextDoc;
exports.createDoc = createDoc;
exports.readTable = readTable;
exports.showForm = showForm;
exports.comState = comState;
exports.restartDocType = restartDocType;
exports.restartDocDetail = restartDocDetail;
exports.updateExtractors = updateExtractors;
exports.showHelp = showHelp;

var _Dispatcher = _interopRequireDefault(require("./Dispatcher"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* all actions that components can execute
   NO axios REST interaction here, store should be the central place
   names according to CURD: Create,Update,Read,Delete
*/
// ** CRUD FUNCTIONS ** //
function readDoc(id) {
  /** Read document */
  _Dispatcher.default.dispatch({
    type: 'READ_DOC',
    id: id
  });
}

function updateDoc(doc, oldDoc) {
  /** Update document */
  _Dispatcher.default.dispatch({
    type: 'UPDATE_DOC',
    doc: doc,
    oldDoc: oldDoc
  });
}

function changeTextDoc(doc, oldDoc) {
  /** Update a text document (step,task) in project.js without server interaction */
  _Dispatcher.default.dispatch({
    type: 'CHANGE_TEXT_DOC',
    doc: doc,
    oldDoc: oldDoc
  });
}

function createDoc(doc) {
  /** Create a document: doc=dict */
  _Dispatcher.default.dispatch({
    type: 'CREATE_DOC',
    doc: doc
  });
}

function readTable(docType, setThis, resetDoc) {
  /** Read table of documents of type docType */
  _Dispatcher.default.dispatch({
    type: 'READ_TABLE',
    docType: docType,
    setThis: setThis,
    resetDoc: resetDoc
  });
} // ** USER ELEMENT FUNCTIONS ** //


function showForm(kind, ontologyNode, doc) {
  /** show form to create new or edit existing dataset */
  _Dispatcher.default.dispatch({
    type: 'SHOW_FORM',
    kind: kind,
    ontologyNode: ontologyNode,
    doc: doc
  });
}

function comState(text) {
  /** set state of communication logo: menu-item top-left */
  _Dispatcher.default.dispatch({
    type: 'COM_STATE',
    text: text
  });
}

function restartDocType() {
  /** Restart this docType by rereading table:
   * can only be called by Project */
  _Dispatcher.default.dispatch({
    type: 'RESTART_DOC_TYPE'
  });
}

function restartDocDetail() {
  /** Reread document detail */
  _Dispatcher.default.dispatch({
    type: 'RESTART_DOCDETAIL'
  });
} // ** MISC ** //


function updateExtractors() {
  /** Update extractors by using backend */
  _Dispatcher.default.dispatch({
    type: 'UPDATE_EXTRACTORS'
  });
}

function showHelp(help) {
  /** show help information */
  _Dispatcher.default.dispatch({
    type: 'SHOW_HELP',
    help: help
  });
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlcmVyL0FjdGlvbnMuanMiXSwibmFtZXMiOlsicmVhZERvYyIsImlkIiwiZGlzcGF0Y2hlciIsImRpc3BhdGNoIiwidHlwZSIsInVwZGF0ZURvYyIsImRvYyIsIm9sZERvYyIsImNoYW5nZVRleHREb2MiLCJjcmVhdGVEb2MiLCJyZWFkVGFibGUiLCJkb2NUeXBlIiwic2V0VGhpcyIsInJlc2V0RG9jIiwic2hvd0Zvcm0iLCJraW5kIiwib250b2xvZ3lOb2RlIiwiY29tU3RhdGUiLCJ0ZXh0IiwicmVzdGFydERvY1R5cGUiLCJyZXN0YXJ0RG9jRGV0YWlsIiwidXBkYXRlRXh0cmFjdG9ycyIsInNob3dIZWxwIiwiaGVscCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJQTs7OztBQUpBO0FBQ0E7QUFDQTtBQUNBO0FBR0E7QUFDTyxTQUFTQSxPQUFULENBQWlCQyxFQUFqQixFQUFxQjtBQUMxQjtBQUNBQyxzQkFBV0MsUUFBWCxDQUFvQjtBQUNsQkMsSUFBQUEsSUFBSSxFQUFFLFVBRFk7QUFFbEJILElBQUFBLEVBQUUsRUFBRUE7QUFGYyxHQUFwQjtBQUlEOztBQUNNLFNBQVNJLFNBQVQsQ0FBbUJDLEdBQW5CLEVBQXVCQyxNQUF2QixFQUErQjtBQUNwQztBQUNBTCxzQkFBV0MsUUFBWCxDQUFvQjtBQUNsQkMsSUFBQUEsSUFBSSxFQUFFLFlBRFk7QUFFbEJFLElBQUFBLEdBQUcsRUFBRUEsR0FGYTtBQUdsQkMsSUFBQUEsTUFBTSxFQUFFQTtBQUhVLEdBQXBCO0FBS0Q7O0FBQ00sU0FBU0MsYUFBVCxDQUF1QkYsR0FBdkIsRUFBMkJDLE1BQTNCLEVBQW1DO0FBQ3hDO0FBQ0FMLHNCQUFXQyxRQUFYLENBQW9CO0FBQ2xCQyxJQUFBQSxJQUFJLEVBQUUsaUJBRFk7QUFFbEJFLElBQUFBLEdBQUcsRUFBRUEsR0FGYTtBQUdsQkMsSUFBQUEsTUFBTSxFQUFFQTtBQUhVLEdBQXBCO0FBS0Q7O0FBQ00sU0FBU0UsU0FBVCxDQUFtQkgsR0FBbkIsRUFBd0I7QUFDN0I7QUFDQUosc0JBQVdDLFFBQVgsQ0FBb0I7QUFDbEJDLElBQUFBLElBQUksRUFBRSxZQURZO0FBRWxCRSxJQUFBQSxHQUFHLEVBQUVBO0FBRmEsR0FBcEI7QUFJRDs7QUFDTSxTQUFTSSxTQUFULENBQW1CQyxPQUFuQixFQUE0QkMsT0FBNUIsRUFBcUNDLFFBQXJDLEVBQStDO0FBQ3BEO0FBQ0FYLHNCQUFXQyxRQUFYLENBQW9CO0FBQ2xCQyxJQUFBQSxJQUFJLEVBQUUsWUFEWTtBQUVsQk8sSUFBQUEsT0FBTyxFQUFFQSxPQUZTO0FBR2xCQyxJQUFBQSxPQUFPLEVBQUVBLE9BSFM7QUFJbEJDLElBQUFBLFFBQVEsRUFBRUE7QUFKUSxHQUFwQjtBQU1ELEMsQ0FHRDs7O0FBQ08sU0FBU0MsUUFBVCxDQUFrQkMsSUFBbEIsRUFBd0JDLFlBQXhCLEVBQXNDVixHQUF0QyxFQUEyQztBQUNoRDtBQUNBSixzQkFBV0MsUUFBWCxDQUFvQjtBQUNsQkMsSUFBQUEsSUFBSSxFQUFFLFdBRFk7QUFFbEJXLElBQUFBLElBQUksRUFBRUEsSUFGWTtBQUdsQkMsSUFBQUEsWUFBWSxFQUFFQSxZQUhJO0FBSWxCVixJQUFBQSxHQUFHLEVBQUVBO0FBSmEsR0FBcEI7QUFNRDs7QUFDTSxTQUFTVyxRQUFULENBQWtCQyxJQUFsQixFQUF3QjtBQUM3QjtBQUNBaEIsc0JBQVdDLFFBQVgsQ0FBb0I7QUFDbEJDLElBQUFBLElBQUksRUFBRSxXQURZO0FBRWxCYyxJQUFBQSxJQUFJLEVBQUVBO0FBRlksR0FBcEI7QUFJRDs7QUFDTSxTQUFTQyxjQUFULEdBQTBCO0FBQy9CO0FBQ0Y7QUFDRWpCLHNCQUFXQyxRQUFYLENBQW9CO0FBQ2xCQyxJQUFBQSxJQUFJLEVBQUU7QUFEWSxHQUFwQjtBQUdEOztBQUNNLFNBQVNnQixnQkFBVCxHQUE0QjtBQUNqQztBQUNBbEIsc0JBQVdDLFFBQVgsQ0FBb0I7QUFDbEJDLElBQUFBLElBQUksRUFBRTtBQURZLEdBQXBCO0FBR0QsQyxDQUVEOzs7QUFDTyxTQUFTaUIsZ0JBQVQsR0FBNEI7QUFDakM7QUFDQW5CLHNCQUFXQyxRQUFYLENBQW9CO0FBQ2xCQyxJQUFBQSxJQUFJLEVBQUU7QUFEWSxHQUFwQjtBQUdEOztBQUVNLFNBQVNrQixRQUFULENBQWtCQyxJQUFsQixFQUF3QjtBQUM3QjtBQUNBckIsc0JBQVdDLFFBQVgsQ0FBb0I7QUFDbEJDLElBQUFBLElBQUksRUFBRSxXQURZO0FBRWxCbUIsSUFBQUEsSUFBSSxFQUFFQTtBQUZZLEdBQXBCO0FBSUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBhbGwgYWN0aW9ucyB0aGF0IGNvbXBvbmVudHMgY2FuIGV4ZWN1dGVcbiAgIE5PIGF4aW9zIFJFU1QgaW50ZXJhY3Rpb24gaGVyZSwgc3RvcmUgc2hvdWxkIGJlIHRoZSBjZW50cmFsIHBsYWNlXG4gICBuYW1lcyBhY2NvcmRpbmcgdG8gQ1VSRDogQ3JlYXRlLFVwZGF0ZSxSZWFkLERlbGV0ZVxuKi9cbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gJy4vRGlzcGF0Y2hlcic7XG5cbi8vICoqIENSVUQgRlVOQ1RJT05TICoqIC8vXG5leHBvcnQgZnVuY3Rpb24gcmVhZERvYyhpZCkge1xuICAvKiogUmVhZCBkb2N1bWVudCAqL1xuICBkaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICB0eXBlOiAnUkVBRF9ET0MnLFxuICAgIGlkOiBpZFxuICB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVEb2MoZG9jLG9sZERvYykge1xuICAvKiogVXBkYXRlIGRvY3VtZW50ICovXG4gIGRpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgIHR5cGU6ICdVUERBVEVfRE9DJyxcbiAgICBkb2M6IGRvYyxcbiAgICBvbGREb2M6IG9sZERvY1xuICB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjaGFuZ2VUZXh0RG9jKGRvYyxvbGREb2MpIHtcbiAgLyoqIFVwZGF0ZSBhIHRleHQgZG9jdW1lbnQgKHN0ZXAsdGFzaykgaW4gcHJvamVjdC5qcyB3aXRob3V0IHNlcnZlciBpbnRlcmFjdGlvbiAqL1xuICBkaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICB0eXBlOiAnQ0hBTkdFX1RFWFRfRE9DJyxcbiAgICBkb2M6IGRvYyxcbiAgICBvbGREb2M6IG9sZERvY1xuICB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEb2MoZG9jKSB7XG4gIC8qKiBDcmVhdGUgYSBkb2N1bWVudDogZG9jPWRpY3QgKi9cbiAgZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgdHlwZTogJ0NSRUFURV9ET0MnLFxuICAgIGRvYzogZG9jXG4gIH0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRUYWJsZShkb2NUeXBlLCBzZXRUaGlzLCByZXNldERvYykge1xuICAvKiogUmVhZCB0YWJsZSBvZiBkb2N1bWVudHMgb2YgdHlwZSBkb2NUeXBlICovXG4gIGRpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgIHR5cGU6ICdSRUFEX1RBQkxFJyxcbiAgICBkb2NUeXBlOiBkb2NUeXBlLFxuICAgIHNldFRoaXM6IHNldFRoaXMsXG4gICAgcmVzZXREb2M6IHJlc2V0RG9jXG4gIH0pO1xufVxuXG5cbi8vICoqIFVTRVIgRUxFTUVOVCBGVU5DVElPTlMgKiogLy9cbmV4cG9ydCBmdW5jdGlvbiBzaG93Rm9ybShraW5kLCBvbnRvbG9neU5vZGUsIGRvYykge1xuICAvKiogc2hvdyBmb3JtIHRvIGNyZWF0ZSBuZXcgb3IgZWRpdCBleGlzdGluZyBkYXRhc2V0ICovXG4gIGRpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgIHR5cGU6ICdTSE9XX0ZPUk0nLFxuICAgIGtpbmQ6IGtpbmQsXG4gICAgb250b2xvZ3lOb2RlOiBvbnRvbG9neU5vZGUsXG4gICAgZG9jOiBkb2NcbiAgfSk7XG59XG5leHBvcnQgZnVuY3Rpb24gY29tU3RhdGUodGV4dCkge1xuICAvKiogc2V0IHN0YXRlIG9mIGNvbW11bmljYXRpb24gbG9nbzogbWVudS1pdGVtIHRvcC1sZWZ0ICovXG4gIGRpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgIHR5cGU6ICdDT01fU1RBVEUnLFxuICAgIHRleHQ6IHRleHRcbiAgfSk7XG59XG5leHBvcnQgZnVuY3Rpb24gcmVzdGFydERvY1R5cGUoKSB7XG4gIC8qKiBSZXN0YXJ0IHRoaXMgZG9jVHlwZSBieSByZXJlYWRpbmcgdGFibGU6XG4gICAqIGNhbiBvbmx5IGJlIGNhbGxlZCBieSBQcm9qZWN0ICovXG4gIGRpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgIHR5cGU6ICdSRVNUQVJUX0RPQ19UWVBFJ1xuICB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiByZXN0YXJ0RG9jRGV0YWlsKCkge1xuICAvKiogUmVyZWFkIGRvY3VtZW50IGRldGFpbCAqL1xuICBkaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICB0eXBlOiAnUkVTVEFSVF9ET0NERVRBSUwnXG4gIH0pO1xufVxuXG4vLyAqKiBNSVNDICoqIC8vXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlRXh0cmFjdG9ycygpIHtcbiAgLyoqIFVwZGF0ZSBleHRyYWN0b3JzIGJ5IHVzaW5nIGJhY2tlbmQgKi9cbiAgZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgdHlwZTogJ1VQREFURV9FWFRSQUNUT1JTJ1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dIZWxwKGhlbHApIHtcbiAgLyoqIHNob3cgaGVscCBpbmZvcm1hdGlvbiAqL1xuICBkaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICB0eXBlOiAnU0hPV19IRUxQJyxcbiAgICBoZWxwOiBoZWxwXG4gIH0pO1xufVxuXG4iXSwiZmlsZSI6InJlbmRlcmVyL0FjdGlvbnMuanMifQ==
