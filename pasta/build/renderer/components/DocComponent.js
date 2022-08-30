"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _DocTable = _interopRequireDefault(require("./DocTable"));

var _DocDetail = _interopRequireDefault(require("./DocDetail"));

var _ModalForm = _interopRequireDefault(require("./ModalForm"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* Component that houses the table(left side) and details(right side)
*/
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
class DocComponent extends _react.Component {
  /** the render method **/
  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "container-fluid px-0 pt-1"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "row px-0"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-7 pr-0"
    }, "  ", /*#__PURE__*/_react.default.createElement(_DocTable.default, {
      docType: this.props.docType
    })), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-5 pl-0"
    }, /*#__PURE__*/_react.default.createElement(_DocDetail.default, {
      docType: this.props.docType
    }))), /*#__PURE__*/_react.default.createElement(_ModalForm.default, null));
  }

}

exports.default = DocComponent;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlcmVyL2NvbXBvbmVudHMvRG9jQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbIkRvY0NvbXBvbmVudCIsIkNvbXBvbmVudCIsInJlbmRlciIsInByb3BzIiwiZG9jVHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQUxBO0FBQ0E7QUFDK0M7QUFDQTtBQUNBO0FBQ0E7QUFFaEMsTUFBTUEsWUFBTixTQUEyQkMsZ0JBQTNCLENBQXFDO0FBRWxEO0FBQ0FDLEVBQUFBLE1BQU0sR0FBRztBQUNQLHdCQUNFO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDRTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0U7QUFBTSxNQUFBLFNBQVMsRUFBQztBQUFoQiwwQkFDRSw2QkFBQyxpQkFBRDtBQUFVLE1BQUEsT0FBTyxFQUFFLEtBQUtDLEtBQUwsQ0FBV0M7QUFBOUIsTUFERixDQURGLGVBSUU7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNFLDZCQUFDLGtCQUFEO0FBQVcsTUFBQSxPQUFPLEVBQUUsS0FBS0QsS0FBTCxDQUFXQztBQUEvQixNQURGLENBSkYsQ0FERixlQVNFLDZCQUFDLGtCQUFELE9BVEYsQ0FERjtBQWFEOztBQWpCaUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBDb21wb25lbnQgdGhhdCBob3VzZXMgdGhlIHRhYmxlKGxlZnQgc2lkZSkgYW5kIGRldGFpbHMocmlnaHQgc2lkZSlcbiovXG5pbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50IH0gZnJvbSAncmVhY3QnOyAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCBEb2NUYWJsZSBmcm9tICcuL0RvY1RhYmxlJzsgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IERvY0RldGFpbCBmcm9tICcuL0RvY0RldGFpbCc7ICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgTW9kYWxGb3JtIGZyb20gJy4vTW9kYWxGb3JtJzsgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRG9jQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAvKiogdGhlIHJlbmRlciBtZXRob2QgKiovXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbnRhaW5lci1mbHVpZCBweC0wIHB0LTEnPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93IHB4LTAnPlxuICAgICAgICAgIDxkaXYgIGNsYXNzTmFtZT0nY29sLXNtLTcgcHItMCc+ICB7LyogbmVzdGVkIGRpdiByZXF1aXJlZCB0byBlbmZvcmNlICBjb2wtc20tOCAqL31cbiAgICAgICAgICAgIDxEb2NUYWJsZSBkb2NUeXBlPXt0aGlzLnByb3BzLmRvY1R5cGV9IC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS01IHBsLTAnPlxuICAgICAgICAgICAgPERvY0RldGFpbCBkb2NUeXBlPXt0aGlzLnByb3BzLmRvY1R5cGV9Lz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxNb2RhbEZvcm0gLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxuIl0sImZpbGUiOiJyZW5kZXJlci9jb21wb25lbnRzL0RvY0NvbXBvbmVudC5qcyJ9
