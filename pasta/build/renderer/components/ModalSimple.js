"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _core = require("@material-ui/core");

var _style = require("../style");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* Simple modal that allows yes/no questions*/
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
class ModalSimple extends _react.Component {
  constructor() {
    super();

    this.pressedBtn = choice => {
      if (choice == true) this.props.onYes();
      this.props.callback();
    };
  }
  /** Functions as class properties (immediately bound): react on user interactions **/


  /** the render method **/
  render() {
    if (this.props.show === 'none') {
      return /*#__PURE__*/_react.default.createElement("div", null);
    }

    const secondStyle = this.props.color ? {
      backgroundColor: this.props.color,
      color: 'white'
    } : _style.btnStrong;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "modal",
      style: { ..._style.modal,
        display: this.props.show
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "modal-content",
      style: { ..._style.modalContent,
        width: '30%'
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col p-0"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "px-3",
      style: { ..._style.h1,
        ...secondStyle
      }
    }, this.props.title), /*#__PURE__*/_react.default.createElement("div", {
      className: "col"
    }, /*#__PURE__*/_react.default.createElement("div", {
      style: _style.flowText
    }, this.props.text)), /*#__PURE__*/_react.default.createElement("div", {
      className: "col"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "row"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "px-3 py-2"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      fullWidth: true,
      onClick: () => this.pressedBtn(true),
      variant: "contained",
      style: _style.btn
    }, "YES")), /*#__PURE__*/_react.default.createElement("div", {
      className: "py-2"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      fullWidth: true,
      onClick: () => this.pressedBtn(false),
      variant: "contained",
      style: _style.btnStrong
    }, "NO")))))));
  }

}

exports.default = ModalSimple;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlcmVyL2NvbXBvbmVudHMvTW9kYWxTaW1wbGUuanMiXSwibmFtZXMiOlsiTW9kYWxTaW1wbGUiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByZXNzZWRCdG4iLCJjaG9pY2UiLCJwcm9wcyIsIm9uWWVzIiwiY2FsbGJhY2siLCJyZW5kZXIiLCJzaG93Iiwic2Vjb25kU3R5bGUiLCJjb2xvciIsImJhY2tncm91bmRDb2xvciIsImJ0blN0cm9uZyIsIm1vZGFsIiwiZGlzcGxheSIsIm1vZGFsQ29udGVudCIsIndpZHRoIiwiaDEiLCJ0aXRsZSIsImZsb3dUZXh0IiwidGV4dCIsImJ0biJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFIQTtBQUNrRTtBQUN2QjtBQUc1QixNQUFNQSxXQUFOLFNBQTBCQyxnQkFBMUIsQ0FBb0M7QUFDakRDLEVBQUFBLFdBQVcsR0FBRztBQUNaOztBQURZLFNBS2RDLFVBTGMsR0FLRkMsTUFBRCxJQUFVO0FBQ25CLFVBQUlBLE1BQU0sSUFBRSxJQUFaLEVBQ0UsS0FBS0MsS0FBTCxDQUFXQyxLQUFYO0FBQ0YsV0FBS0QsS0FBTCxDQUFXRSxRQUFYO0FBQ0QsS0FUYTtBQUViO0FBRUQ7OztBQU9BO0FBQ0FDLEVBQUFBLE1BQU0sR0FBRTtBQUNOLFFBQUksS0FBS0gsS0FBTCxDQUFXSSxJQUFYLEtBQWtCLE1BQXRCLEVBQThCO0FBQzVCLDBCQUFPLHlDQUFQO0FBQ0Q7O0FBQ0QsVUFBTUMsV0FBVyxHQUFJLEtBQUtMLEtBQUwsQ0FBV00sS0FBWixHQUFxQjtBQUFDQyxNQUFBQSxlQUFlLEVBQUMsS0FBS1AsS0FBTCxDQUFXTSxLQUE1QjtBQUFtQ0EsTUFBQUEsS0FBSyxFQUFDO0FBQXpDLEtBQXJCLEdBQXlFRSxnQkFBN0Y7QUFDQSx3QkFDRTtBQUFLLE1BQUEsU0FBUyxFQUFDLE9BQWY7QUFBdUIsTUFBQSxLQUFLLEVBQUUsRUFBQyxHQUFHQyxZQUFKO0FBQVdDLFFBQUFBLE9BQU8sRUFBRSxLQUFLVixLQUFMLENBQVdJO0FBQS9CO0FBQTlCLG9CQUNFO0FBQUssTUFBQSxTQUFTLEVBQUMsZUFBZjtBQUErQixNQUFBLEtBQUssRUFBRSxFQUFDLEdBQUdPLG1CQUFKO0FBQWtCQyxRQUFBQSxLQUFLLEVBQUM7QUFBeEI7QUFBdEMsb0JBQ0U7QUFBTSxNQUFBLFNBQVMsRUFBQztBQUFoQixvQkFDRTtBQUFLLE1BQUEsU0FBUyxFQUFDLE1BQWY7QUFBc0IsTUFBQSxLQUFLLEVBQUUsRUFBQyxHQUFHQyxTQUFKO0FBQVEsV0FBR1I7QUFBWDtBQUE3QixPQUNHLEtBQUtMLEtBQUwsQ0FBV2MsS0FEZCxDQURGLGVBSUU7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNFO0FBQUssTUFBQSxLQUFLLEVBQUVDO0FBQVosT0FDRyxLQUFLZixLQUFMLENBQVdnQixJQURkLENBREYsQ0FKRixlQVNFO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDRTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0U7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNFLDZCQUFDLFlBQUQ7QUFBUSxNQUFBLFNBQVMsTUFBakI7QUFBa0IsTUFBQSxPQUFPLEVBQUUsTUFBSSxLQUFLbEIsVUFBTCxDQUFnQixJQUFoQixDQUEvQjtBQUFzRCxNQUFBLE9BQU8sRUFBQyxXQUE5RDtBQUEwRSxNQUFBLEtBQUssRUFBRW1CO0FBQWpGLGFBREYsQ0FERixlQU1FO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDRSw2QkFBQyxZQUFEO0FBQVEsTUFBQSxTQUFTLE1BQWpCO0FBQWtCLE1BQUEsT0FBTyxFQUFFLE1BQUksS0FBS25CLFVBQUwsQ0FBZ0IsS0FBaEIsQ0FBL0I7QUFBdUQsTUFBQSxPQUFPLEVBQUMsV0FBL0Q7QUFBMkUsTUFBQSxLQUFLLEVBQUVVO0FBQWxGLFlBREYsQ0FORixDQURGLENBVEYsQ0FERixDQURGLENBREY7QUE4QkQ7O0FBaERnRCIsInNvdXJjZXNDb250ZW50IjpbIi8qIFNpbXBsZSBtb2RhbCB0aGF0IGFsbG93cyB5ZXMvbm8gcXVlc3Rpb25zKi9cbmltcG9ydCBSZWFjdCwgeyBDb21wb25lbnQgfSBmcm9tICdyZWFjdCc7ICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJ0BtYXRlcmlhbC11aS9jb3JlJzsvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgeyBtb2RhbCwgbW9kYWxDb250ZW50LCBidG4sIGJ0blN0cm9uZywgZmxvd1RleHQsIGgxIH0gZnJvbSAnLi4vc3R5bGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RhbFNpbXBsZSBleHRlbmRzIENvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICAvKiogRnVuY3Rpb25zIGFzIGNsYXNzIHByb3BlcnRpZXMgKGltbWVkaWF0ZWx5IGJvdW5kKTogcmVhY3Qgb24gdXNlciBpbnRlcmFjdGlvbnMgKiovXG4gIHByZXNzZWRCdG49KGNob2ljZSk9PntcbiAgICBpZiAoY2hvaWNlPT10cnVlKVxuICAgICAgdGhpcy5wcm9wcy5vblllcygpO1xuICAgIHRoaXMucHJvcHMuY2FsbGJhY2soKTtcbiAgfVxuXG4gIC8qKiB0aGUgcmVuZGVyIG1ldGhvZCAqKi9cbiAgcmVuZGVyKCl7XG4gICAgaWYgKHRoaXMucHJvcHMuc2hvdz09PSdub25lJykge1xuICAgICAgcmV0dXJuKDxkaXY+PC9kaXY+KTtcbiAgICB9XG4gICAgY29uc3Qgc2Vjb25kU3R5bGUgPSAodGhpcy5wcm9wcy5jb2xvcikgPyB7YmFja2dyb3VuZENvbG9yOnRoaXMucHJvcHMuY29sb3IsIGNvbG9yOid3aGl0ZSd9IDogYnRuU3Ryb25nO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1vZGFsXCIgc3R5bGU9e3suLi5tb2RhbCwgZGlzcGxheTogdGhpcy5wcm9wcy5zaG93fX0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibW9kYWwtY29udGVudFwiIHN0eWxlPXt7Li4ubW9kYWxDb250ZW50LCB3aWR0aDonMzAlJ319PlxuICAgICAgICAgIDxkaXYgIGNsYXNzTmFtZT1cImNvbCBwLTBcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHgtM1wiIHN0eWxlPXt7Li4uaDEsIC4uLnNlY29uZFN0eWxlfX0+XG4gICAgICAgICAgICAgIHt0aGlzLnByb3BzLnRpdGxlfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbFwiPlxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtmbG93VGV4dH0+XG4gICAgICAgICAgICAgICAge3RoaXMucHJvcHMudGV4dH1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29sXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm93XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3B4LTMgcHktMic+XG4gICAgICAgICAgICAgICAgICA8QnV0dG9uIGZ1bGxXaWR0aCBvbkNsaWNrPXsoKT0+dGhpcy5wcmVzc2VkQnRuKHRydWUpfSB2YXJpYW50PVwiY29udGFpbmVkXCIgc3R5bGU9e2J0bn0+XG4gICAgICAgICAgICAgICAgICAgIFlFU1xuICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3B5LTInPlxuICAgICAgICAgICAgICAgICAgPEJ1dHRvbiBmdWxsV2lkdGggb25DbGljaz17KCk9PnRoaXMucHJlc3NlZEJ0bihmYWxzZSl9IHZhcmlhbnQ9XCJjb250YWluZWRcIiBzdHlsZT17YnRuU3Ryb25nfT5cbiAgICAgICAgICAgICAgICAgICAgTk9cbiAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cbiJdLCJmaWxlIjoicmVuZGVyZXIvY29tcG9uZW50cy9Nb2RhbFNpbXBsZS5qcyJ9
