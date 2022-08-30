"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _core = require("@material-ui/core");

var _lab = require("@material-ui/lab");

var _Flag = _interopRequireDefault(require("@material-ui/icons/Flag"));

var _OutlinedFlag = _interopRequireDefault(require("@material-ui/icons/OutlinedFlag"));

var _Store = _interopRequireDefault(require("../Store"));

var _style = require("../style");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* Modal that allows the user to ... attachment to instrument, measurement or just a remark
*/
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
class ModalAddAttachment extends _react.Component {
  constructor() {
    super();

    this.pressedSaveBtn = () => {
      //find if attachments or issue
      var question = _Store.default.getOntology()[this.props.docType];

      question = question.filter(i => {
        return i.attachment && i.attachment == this.props.name;
      });
      var docType = question[0].docType;
      const choice = docType ? this.state.choice : null; //if issue null; if real attachment: a string
      //save data

      _Store.default.addAttachment(this.state.remark, choice, this.state.flag, this.props.name);

      this.setState({
        remark: '',
        choice: '',
        flag: false
      }); //reinitialize for next run through

      this.props.callback(); //close
    };

    this.state = {
      remark: '',
      choice: '',
      flag: false
    };
  }
  /** Functions as class properties (immediately bound): react on user interactions **/


  /** create html-structure; all should return at least <div></div>    .toUpperCase() **/
  showSelectionBox() {
    var question = _Store.default.getOntology()[this.props.docType];

    question = question.filter(i => {
      return i.attachment && i.attachment == this.props.name;
    });

    if (question.length != 1) {
      return /*#__PURE__*/_react.default.createElement(_lab.Alert, {
        severity: "error"
      }, "Error occurred in ModalAddAttachment: Check ontology");
    }

    var attachDocType = question[0].docType;

    if (!attachDocType) {
      //if no docType: this must be an issue
      return /*#__PURE__*/_react.default.createElement("div", null);
    }

    var docsList = _Store.default.getDocsList(attachDocType);

    if (!docsList) return /*#__PURE__*/_react.default.createElement(_lab.Alert, {
      severity: "warning",
      key: "selectBox",
      className: "mx-3"
    }, "Visit the following section: ", attachDocType);
    docsList = [{
      name: '--detached--',
      id: ''
    }].concat(docsList); //concat --detached-- to list

    var options = docsList.map(i => {
      return /*#__PURE__*/_react.default.createElement(_core.MenuItem, {
        value: i.id,
        key: i.id
      }, i.name);
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "px-3 py-2",
      key: "selectBox"
    }, /*#__PURE__*/_react.default.createElement(_core.FormControl, {
      fullWidth: true
    }, /*#__PURE__*/_react.default.createElement(_core.Select, {
      id: "selectMenu",
      onChange: e => this.setState({
        choice: e.target.value
      }),
      value: this.state.choice
    }, options)));
  }
  /** the render method **/


  render() {
    if (this.props.show === 'none') {
      return /*#__PURE__*/_react.default.createElement("div", null);
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "modal",
      style: { ..._style.modal,
        ...{
          display: this.props.show
        }
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "modal-content",
      style: { ..._style.modalContent,
        width: '30%'
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col p-0"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "p-3 mb-2",
      style: { ..._style.h1,
        ..._style.btnStrong
      }
    }, "Change attachment: ", this.props.name), this.showSelectionBox(), /*#__PURE__*/_react.default.createElement(_core.FormControl, {
      fullWidth: true,
      className: "px-3"
    }, /*#__PURE__*/_react.default.createElement(_core.TextField, {
      multiline: true,
      rows: 4,
      key: "remark",
      placeholder: "remark",
      variant: "outlined",
      value: this.state.remark,
      onChange: e => this.setState({
        remark: e.target.value
      })
    })), /*#__PURE__*/_react.default.createElement("div", {
      className: "col px-3"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-3 px-1 py-2 float-right"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => {
        this.setState({
          ontology: {}
        });
        this.props.callback('cancel');
      },
      variant: "contained",
      id: "closeBtn",
      style: _style.btn,
      fullWidth: true
    }, "Cancel")), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-3 px-1 py-2 float-right"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.pressedSaveBtn(),
      variant: "contained",
      style: _style.btnStrong,
      fullWidth: true
    }, "Save")), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6 float-right p-0"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "row px-3"
    }, /*#__PURE__*/_react.default.createElement("div", {
      style: _style.flowText,
      className: "py-1"
    }, "Flag this entry:"), /*#__PURE__*/_react.default.createElement(_core.Checkbox, {
      checked: this.state.flag,
      onChange: () => {
        this.setState({
          flag: !this.state.flag
        });
      },
      className: "py-1",
      icon: /*#__PURE__*/_react.default.createElement(_OutlinedFlag.default, null),
      checkedIcon: /*#__PURE__*/_react.default.createElement(_Flag.default, {
        style: {
          color: _style.colorWarning
        }
      })
    })))))));
  }

}

exports.default = ModalAddAttachment;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlcmVyL2NvbXBvbmVudHMvTW9kYWxBZGRBdHRhY2htZW50LmpzIl0sIm5hbWVzIjpbIk1vZGFsQWRkQXR0YWNobWVudCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJlc3NlZFNhdmVCdG4iLCJxdWVzdGlvbiIsIlN0b3JlIiwiZ2V0T250b2xvZ3kiLCJwcm9wcyIsImRvY1R5cGUiLCJmaWx0ZXIiLCJpIiwiYXR0YWNobWVudCIsIm5hbWUiLCJjaG9pY2UiLCJzdGF0ZSIsImFkZEF0dGFjaG1lbnQiLCJyZW1hcmsiLCJmbGFnIiwic2V0U3RhdGUiLCJjYWxsYmFjayIsInNob3dTZWxlY3Rpb25Cb3giLCJsZW5ndGgiLCJhdHRhY2hEb2NUeXBlIiwiZG9jc0xpc3QiLCJnZXREb2NzTGlzdCIsImlkIiwiY29uY2F0Iiwib3B0aW9ucyIsIm1hcCIsImUiLCJ0YXJnZXQiLCJ2YWx1ZSIsInJlbmRlciIsInNob3ciLCJtb2RhbCIsImRpc3BsYXkiLCJtb2RhbENvbnRlbnQiLCJ3aWR0aCIsImgxIiwiYnRuU3Ryb25nIiwib250b2xvZ3kiLCJidG4iLCJmbG93VGV4dCIsImNvbG9yIiwiY29sb3JXYXJuaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBUkE7QUFDQTtBQUNrRTtBQUM0QjtBQUM1QjtBQUNBO0FBQ0E7QUFLbkQsTUFBTUEsa0JBQU4sU0FBaUNDLGdCQUFqQyxDQUEyQztBQUN4REMsRUFBQUEsV0FBVyxHQUFHO0FBQ1o7O0FBRFksU0FVZEMsY0FWYyxHQVVDLE1BQUk7QUFDakI7QUFDQSxVQUFJQyxRQUFRLEdBQUdDLGVBQU1DLFdBQU4sR0FBb0IsS0FBS0MsS0FBTCxDQUFXQyxPQUEvQixDQUFmOztBQUNBSixNQUFBQSxRQUFRLEdBQUdBLFFBQVEsQ0FBQ0ssTUFBVCxDQUFnQkMsQ0FBQyxJQUFFO0FBQzVCLGVBQVFBLENBQUMsQ0FBQ0MsVUFBRixJ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LElBQUksRUFBRSxDQUFDLEtBQUtILEtBQUwsQ0FBV0c7QUFBbkIsU0FBZDtBQUF5QyxPQUE1RjtBQUNFLE1BQUEsU0FBUyxFQUFDLE1BRFo7QUFDbUIsTUFBQSxJQUFJLGVBQUUsNkJBQUMscUJBQUQsT0FEekI7QUFFRSxNQUFBLFdBQVcsZUFBRSw2QkFBQyxhQUFEO0FBQU0sUUFBQSxLQUFLLEVBQUU7QUFBQzBCLFVBQUFBLEtBQUssRUFBQ0M7QUFBUDtBQUFiO0FBRmYsTUFGRixDQURGLENBWkYsQ0FiRixDQURGLENBREYsQ0FERjtBQXlDRDs7QUExR3VEIiwic291cmNlc0NvbnRlbnQiOlsiLyogTW9kYWwgdGhhdCBhbGxvd3MgdGhlIHVzZXIgdG8gLi4uIGF0dGFjaG1lbnQgdG8gaW5zdHJ1bWVudCwgbWVhc3VyZW1lbnQgb3IganVzdCBhIHJlbWFya1xuKi9cbmltcG9ydCBSZWFjdCwgeyBDb21wb25lbnQgfSBmcm9tICdyZWFjdCc7ICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCB7IEJ1dHRvbiwgVGV4dEZpZWxkLCBGb3JtQ29udHJvbCwgU2VsZWN0LCBNZW51SXRlbSwgQ2hlY2tib3h9IGZyb20gJ0BtYXRlcmlhbC11aS9jb3JlJzsvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgeyBBbGVydCB9IGZyb20gJ0BtYXRlcmlhbC11aS9sYWInOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgRmxhZyBmcm9tICdAbWF0ZXJpYWwtdWkvaWNvbnMvRmxhZyc7ICAgICAgICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgT3V0bGluZWRGbGFnIGZyb20gJ0BtYXRlcmlhbC11aS9pY29ucy9PdXRsaW5lZEZsYWcnOyAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgU3RvcmUgZnJvbSAnLi4vU3RvcmUnO1xuaW1wb3J0IHsgbW9kYWwsIG1vZGFsQ29udGVudCwgYnRuLCBmbG93VGV4dCwgaDEsIGJ0blN0cm9uZywgY29sb3JXYXJuaW5nIH0gZnJvbSAnLi4vc3R5bGUnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZGFsQWRkQXR0YWNobWVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHJlbWFyazogJycsXG4gICAgICBjaG9pY2U6ICcnLFxuICAgICAgZmxhZzogZmFsc2VcbiAgICB9O1xuICB9XG5cbiAgLyoqIEZ1bmN0aW9ucyBhcyBjbGFzcyBwcm9wZXJ0aWVzIChpbW1lZGlhdGVseSBib3VuZCk6IHJlYWN0IG9uIHVzZXIgaW50ZXJhY3Rpb25zICoqL1xuICBwcmVzc2VkU2F2ZUJ0bj0oKT0+e1xuICAgIC8vZmluZCBpZiBhdHRhY2htZW50cyBvciBpc3N1ZVxuICAgIHZhciBxdWVzdGlvbiA9IFN0b3JlLmdldE9udG9sb2d5KClbdGhpcy5wcm9wcy5kb2NUeXBlXTtcbiAgICBxdWVzdGlvbiA9IHF1ZXN0aW9uLmZpbHRlcihpPT57XG4gICAgICByZXR1cm4gKGkuYXR0YWNobWVudCAmJiBpLmF0dGFjaG1lbnQ9PXRoaXMucHJvcHMubmFtZSk7XG4gICAgfSk7XG4gICAgdmFyIGRvY1R5cGUgPSBxdWVzdGlvblswXS5kb2NUeXBlO1xuICAgIGNvbnN0IGNob2ljZSA9IChkb2NUeXBlKSA/IHRoaXMuc3RhdGUuY2hvaWNlIDogbnVsbDsgIC8vaWYgaXNzdWUgbnVsbDsgaWYgcmVhbCBhdHRhY2htZW50OiBhIHN0cmluZ1xuICAgIC8vc2F2ZSBkYXRhXG4gICAgU3RvcmUuYWRkQXR0YWNobWVudCh0aGlzLnN0YXRlLnJlbWFyaywgY2hvaWNlLCB0aGlzLnN0YXRlLmZsYWcsIHRoaXMucHJvcHMubmFtZSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7cmVtYXJrOiAnJywgY2hvaWNlOiAnJywgZmxhZzpmYWxzZX0pOyAvL3JlaW5pdGlhbGl6ZSBmb3IgbmV4dCBydW4gdGhyb3VnaFxuICAgIHRoaXMucHJvcHMuY2FsbGJhY2soKTsgLy9jbG9zZVxuICB9XG5cblxuICAvKiogY3JlYXRlIGh0bWwtc3RydWN0dXJlOyBhbGwgc2hvdWxkIHJldHVybiBhdCBsZWFzdCA8ZGl2PjwvZGl2PiAgICAudG9VcHBlckNhc2UoKSAqKi9cbiAgc2hvd1NlbGVjdGlvbkJveCgpe1xuICAgIHZhciBxdWVzdGlvbiA9IFN0b3JlLmdldE9udG9sb2d5KClbdGhpcy5wcm9wcy5kb2NUeXBlXTtcbiAgICBxdWVzdGlvbiA9IHF1ZXN0aW9uLmZpbHRlcihpPT57XG4gICAgICByZXR1cm4gKGkuYXR0YWNobWVudCAmJiBpLmF0dGFjaG1lbnQ9PXRoaXMucHJvcHMubmFtZSk7XG4gICAgfSk7XG4gICAgaWYgKHF1ZXN0aW9uLmxlbmd0aCE9MSkge1xuICAgICAgcmV0dXJuIDxBbGVydCBzZXZlcml0eT1cImVycm9yXCI+RXJyb3Igb2NjdXJyZWQgaW4gTW9kYWxBZGRBdHRhY2htZW50OiBDaGVjayBvbnRvbG9neTwvQWxlcnQ+O1xuICAgIH1cbiAgICB2YXIgYXR0YWNoRG9jVHlwZSA9IHF1ZXN0aW9uWzBdLmRvY1R5cGU7XG4gICAgaWYgKCFhdHRhY2hEb2NUeXBlKSB7ICAvL2lmIG5vIGRvY1R5cGU6IHRoaXMgbXVzdCBiZSBhbiBpc3N1ZVxuICAgICAgcmV0dXJuIDxkaXY+PC9kaXY+O1xuICAgIH1cbiAgICB2YXIgZG9jc0xpc3QgPSBTdG9yZS5nZXREb2NzTGlzdChhdHRhY2hEb2NUeXBlKTtcbiAgICBpZiAoIWRvY3NMaXN0KVxuICAgICAgcmV0dXJuIDxBbGVydCBzZXZlcml0eT1cIndhcm5pbmdcIiBrZXk9J3NlbGVjdEJveCcgY2xhc3NOYW1lPSdteC0zJz5cbiAgICAgICAgVmlzaXQgdGhlIGZvbGxvd2luZyBzZWN0aW9uOiB7YXR0YWNoRG9jVHlwZX1cbiAgICAgIDwvQWxlcnQ+O1xuICAgIGRvY3NMaXN0ID0gW3tuYW1lOictLWRldGFjaGVkLS0nLGlkOicnfV0uY29uY2F0KGRvY3NMaXN0KTsgLy9jb25jYXQgLS1kZXRhY2hlZC0tIHRvIGxpc3RcbiAgICB2YXIgb3B0aW9ucyA9IGRvY3NMaXN0Lm1hcCgoaSk9PntcbiAgICAgIHJldHVybiAoPE1lbnVJdGVtIHZhbHVlPXtpLmlkfSBrZXk9e2kuaWR9PntpLm5hbWV9PC9NZW51SXRlbT4pO1xuICAgIH0pO1xuICAgIHJldHVybihcbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdweC0zIHB5LTInIGtleT0nc2VsZWN0Qm94Jz5cbiAgICAgICAgPEZvcm1Db250cm9sIGZ1bGxXaWR0aD5cbiAgICAgICAgICA8U2VsZWN0IGlkPSdzZWxlY3RNZW51JyBvbkNoYW5nZT17ZT0+dGhpcy5zZXRTdGF0ZSh7Y2hvaWNlOiBlLnRhcmdldC52YWx1ZX0pfVxuICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuY2hvaWNlfT5cbiAgICAgICAgICAgIHtvcHRpb25zfVxuICAgICAgICAgIDwvU2VsZWN0PlxuICAgICAgICA8L0Zvcm1Db250cm9sPlxuICAgICAgPC9kaXY+KTtcbiAgfVxuXG5cbiAgLyoqIHRoZSByZW5kZXIgbWV0aG9kICoqL1xuICByZW5kZXIoKXtcbiAgICBpZiAodGhpcy5wcm9wcy5zaG93PT09J25vbmUnKSB7XG4gICAgICByZXR1cm4oPGRpdj48L2Rpdj4pO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtb2RhbFwiIHN0eWxlPXt7Li4ubW9kYWwsIC4uLntkaXNwbGF5OiB0aGlzLnByb3BzLnNob3d9fX0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibW9kYWwtY29udGVudFwiIHN0eWxlPXt7Li4ubW9kYWxDb250ZW50LCB3aWR0aDonMzAlJ319PlxuICAgICAgICAgIDxkaXYgIGNsYXNzTmFtZT1cImNvbCBwLTBcIj5cbiAgICAgICAgICAgIHsvKj09PT09PT1QQUdFIEhFQURJTkc9PT09PT09Ki99XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtMyBtYi0yXCIgc3R5bGU9e3suLi5oMSwgLi4uYnRuU3Ryb25nfX0+XG4gICAgICAgICAgICAgIENoYW5nZSBhdHRhY2htZW50OiB7dGhpcy5wcm9wcy5uYW1lfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB7Lyo9PT09PT09Q09OVEVOVD09PT09PT0qL31cbiAgICAgICAgICAgIHt0aGlzLnNob3dTZWxlY3Rpb25Cb3goKX1cblxuICAgICAgICAgICAgPEZvcm1Db250cm9sIGZ1bGxXaWR0aCBjbGFzc05hbWU9J3B4LTMnPlxuICAgICAgICAgICAgICA8VGV4dEZpZWxkIG11bHRpbGluZSByb3dzPXs0fSBrZXk9J3JlbWFyaycgcGxhY2Vob2xkZXI9J3JlbWFyaycgdmFyaWFudD1cIm91dGxpbmVkXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5yZW1hcmt9IG9uQ2hhbmdlPXtlPT50aGlzLnNldFN0YXRlKHtyZW1hcms6IGUudGFyZ2V0LnZhbHVlfSl9IC8+XG4gICAgICAgICAgICA8L0Zvcm1Db250cm9sPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sIHB4LTMnPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTMgcHgtMSBweS0yIGZsb2F0LXJpZ2h0Jz5cbiAgICAgICAgICAgICAgICA8QnV0dG9uICBvbkNsaWNrPXsoKSA9PiB7dGhpcy5zZXRTdGF0ZSh7IG9udG9sb2d5OiB7fSB9KTsgICAgdGhpcy5wcm9wcy5jYWxsYmFjaygnY2FuY2VsJyk7fX1cbiAgICAgICAgICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIiBpZD0nY2xvc2VCdG4nIHN0eWxlPXtidG59IGZ1bGxXaWR0aD5cbiAgICAgICAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS0zIHB4LTEgcHktMiBmbG9hdC1yaWdodCc+XG4gICAgICAgICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoKT0+dGhpcy5wcmVzc2VkU2F2ZUJ0bigpfSB2YXJpYW50PVwiY29udGFpbmVkXCIgc3R5bGU9e2J0blN0cm9uZ30gZnVsbFdpZHRoPlxuICAgICAgICAgICAgICAgICAgU2F2ZVxuICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS02IGZsb2F0LXJpZ2h0IHAtMCc+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3JvdyBweC0zJz5cbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e2Zsb3dUZXh0fSBjbGFzc05hbWU9J3B5LTEnPkZsYWcgdGhpcyBlbnRyeTo8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxDaGVja2JveCBjaGVja2VkPXt0aGlzLnN0YXRlLmZsYWd9IG9uQ2hhbmdlPXsoKT0+e3RoaXMuc2V0U3RhdGUoe2ZsYWc6ICF0aGlzLnN0YXRlLmZsYWd9KTt9fVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9J3B5LTEnIGljb249ezxPdXRsaW5lZEZsYWcvPn1cbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZEljb249ezxGbGFnIHN0eWxlPXt7Y29sb3I6Y29sb3JXYXJuaW5nfX0gLz59Lz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG4iXSwiZmlsZSI6InJlbmRlcmVyL2NvbXBvbmVudHMvTW9kYWxBZGRBdHRhY2htZW50LmpzIn0=
