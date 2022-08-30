"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _core = require("@material-ui/core");

var _Dispatcher = _interopRequireDefault(require("../Dispatcher"));

var _style = require("../style");

var _longStrings = require("./longStrings");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* eslint max-len: 0 */

/* Modal that shows help information for changing the ontology */
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
class ModalHelp extends _react.Component {
  constructor() {
    super();

    this.cancel = () => {
      this.setState({
        show: 'none'
      });
    };

    this.handleActions = action => {
      //Modal show; first function
      if (action.type === 'SHOW_HELP') {
        this.setState({
          show: 'block',
          help: action.help
        });
      }
    };

    this.state = {
      //modal items
      dispatcherToken: null,
      show: 'none',
      help: null
    };
  } //component mounted immediately, even if Modal not shown


  componentDidMount() {
    this.setState({
      dispatcherToken: _Dispatcher.default.register(this.handleActions)
    });
  }

  componentWillUnmount() {
    _Dispatcher.default.unregister(this.state.dispatcherToken);
  }
  /** Functions as class properties (immediately bound): react on user interactions **/


  /** the render method **/
  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "modal",
      style: { ..._style.modal,
        display: this.state.show
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "modal-content",
      style: _style.modalContent
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col p-0"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "px-3 py-4",
      style: { ..._style.h1,
        ..._style.btnStrong
      }
    }, "Help | Ontology and Questionare Structure"), /*#__PURE__*/_react.default.createElement("div", {
      className: "p-3",
      style: _style.flowText
    }, (0, _longStrings.ontologyHelp)()), /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.setState({
        show: 'none'
      }),
      variant: "contained",
      className: "float-right m-3",
      id: "closeBtn",
      style: _style.btnStrong
    }, "Close"))));
  }

}

exports.default = ModalHelp;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlcmVyL2NvbXBvbmVudHMvTW9kYWxIZWxwLmpzIl0sIm5hbWVzIjpbIk1vZGFsSGVscCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwiY2FuY2VsIiwic2V0U3RhdGUiLCJzaG93IiwiaGFuZGxlQWN0aW9ucyIsImFjdGlvbiIsInR5cGUiLCJoZWxwIiwic3RhdGUiLCJkaXNwYXRjaGVyVG9rZW4iLCJjb21wb25lbnREaWRNb3VudCIsImRpc3BhdGNoZXIiLCJyZWdpc3RlciIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwidW5yZWdpc3RlciIsInJlbmRlciIsIm1vZGFsIiwiZGlzcGxheSIsIm1vZGFsQ29udGVudCIsImgxIiwiYnRuU3Ryb25nIiwiZmxvd1RleHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFOQTs7QUFDQTtBQUNrRTtBQUNBO0FBS25ELE1BQU1BLFNBQU4sU0FBd0JDLGdCQUF4QixDQUFrQztBQUMvQ0MsRUFBQUEsV0FBVyxHQUFHO0FBQ1o7O0FBRFksU0FtQmRDLE1BbkJjLEdBbUJMLE1BQU07QUFDYixXQUFLQyxRQUFMLENBQWM7QUFBQ0MsUUFBQUEsSUFBSSxFQUFDO0FBQU4sT0FBZDtBQUNELEtBckJhOztBQUFBLFNBdUJkQyxhQXZCYyxHQXVCQ0MsTUFBRCxJQUFVO0FBQU07QUFDNUIsVUFBSUEsTUFBTSxDQUFDQyxJQUFQLEtBQWMsV0FBbEIsRUFBK0I7QUFDN0IsYUFBS0osUUFBTCxDQUFjO0FBQUNDLFVBQUFBLElBQUksRUFBQyxPQUFOO0FBQWVJLFVBQUFBLElBQUksRUFBQ0YsTUFBTSxDQUFDRTtBQUEzQixTQUFkO0FBQ0Q7QUFDRixLQTNCYTs7QUFFWixTQUFLQyxLQUFMLEdBQWE7QUFDWDtBQUNBQyxNQUFBQSxlQUFlLEVBQUUsSUFGTjtBQUdYTixNQUFBQSxJQUFJLEVBQUUsTUFISztBQUlYSSxNQUFBQSxJQUFJLEVBQUU7QUFKSyxLQUFiO0FBTUQsR0FUOEMsQ0FVL0M7OztBQUNBRyxFQUFBQSxpQkFBaUIsR0FBRztBQUNsQixTQUFLUixRQUFMLENBQWM7QUFBQ08sTUFBQUEsZUFBZSxFQUFFRSxvQkFBV0MsUUFBWCxDQUFvQixLQUFLUixhQUF6QjtBQUFsQixLQUFkO0FBQ0Q7O0FBQ0RTLEVBQUFBLG9CQUFvQixHQUFHO0FBQ3JCRix3QkFBV0csVUFBWCxDQUFzQixLQUFLTixLQUFMLENBQVdDLGVBQWpDO0FBQ0Q7QUFHRDs7O0FBV0E7QUFDQU0sRUFBQUEsTUFBTSxHQUFFO0FBQ04sd0JBQ0U7QUFBSyxNQUFBLFNBQVMsRUFBQyxPQUFmO0FBQXVCLE1BQUEsS0FBSyxFQUFFLEVBQUMsR0FBR0MsWUFBSjtBQUFXQyxRQUFBQSxPQUFPLEVBQUMsS0FBS1QsS0FBTCxDQUFXTDtBQUE5QjtBQUE5QixvQkFDRTtBQUFLLE1BQUEsU0FBUyxFQUFDLGVBQWY7QUFBK0IsTUFBQSxLQUFLLEVBQUVlO0FBQXRDLG9CQUNFO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDRTtBQUFLLE1BQUEsU0FBUyxFQUFDLFdBQWY7QUFBMkIsTUFBQSxLQUFLLEVBQUUsRUFBQyxHQUFHQyxTQUFKO0FBQVEsV0FBR0M7QUFBWDtBQUFsQyxtREFERixlQUlFO0FBQUssTUFBQSxTQUFTLEVBQUMsS0FBZjtBQUFxQixNQUFBLEtBQUssRUFBRUM7QUFBNUIsT0FDRyxnQ0FESCxDQUpGLGVBT0UsNkJBQUMsWUFBRDtBQUFRLE1BQUEsT0FBTyxFQUFFLE1BQUksS0FBS25CLFFBQUwsQ0FBYztBQUFDQyxRQUFBQSxJQUFJLEVBQUM7QUFBTixPQUFkLENBQXJCO0FBQ0UsTUFBQSxPQUFPLEVBQUMsV0FEVjtBQUNzQixNQUFBLFNBQVMsRUFBQyxpQkFEaEM7QUFDa0QsTUFBQSxFQUFFLEVBQUMsVUFEckQ7QUFDZ0UsTUFBQSxLQUFLLEVBQUVpQjtBQUR2RSxlQVBGLENBREYsQ0FERixDQURGO0FBa0JEOztBQWxEOEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQgbWF4LWxlbjogMCAqL1xuLyogTW9kYWwgdGhhdCBzaG93cyBoZWxwIGluZm9ybWF0aW9uIGZvciBjaGFuZ2luZyB0aGUgb250b2xvZ3kgKi9cbmltcG9ydCBSZWFjdCwgeyBDb21wb25lbnQgfSBmcm9tICdyZWFjdCc7ICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCB7IEJ1dHRvbn0gZnJvbSAnQG1hdGVyaWFsLXVpL2NvcmUnOyAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gJy4uL0Rpc3BhdGNoZXInO1xuaW1wb3J0IHsgbW9kYWwsIG1vZGFsQ29udGVudCwgYnRuU3Ryb25nLCBmbG93VGV4dCwgaDEgfSBmcm9tICcuLi9zdHlsZSc7XG5pbXBvcnQgeyBvbnRvbG9neUhlbHAgfSBmcm9tICcuL2xvbmdTdHJpbmdzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kYWxIZWxwIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgLy9tb2RhbCBpdGVtc1xuICAgICAgZGlzcGF0Y2hlclRva2VuOiBudWxsLFxuICAgICAgc2hvdzogJ25vbmUnLFxuICAgICAgaGVscDogbnVsbCxcbiAgICB9O1xuICB9XG4gIC8vY29tcG9uZW50IG1vdW50ZWQgaW1tZWRpYXRlbHksIGV2ZW4gaWYgTW9kYWwgbm90IHNob3duXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe2Rpc3BhdGNoZXJUb2tlbjogZGlzcGF0Y2hlci5yZWdpc3Rlcih0aGlzLmhhbmRsZUFjdGlvbnMpfSk7XG4gIH1cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgZGlzcGF0Y2hlci51bnJlZ2lzdGVyKHRoaXMuc3RhdGUuZGlzcGF0Y2hlclRva2VuKTtcbiAgfVxuXG5cbiAgLyoqIEZ1bmN0aW9ucyBhcyBjbGFzcyBwcm9wZXJ0aWVzIChpbW1lZGlhdGVseSBib3VuZCk6IHJlYWN0IG9uIHVzZXIgaW50ZXJhY3Rpb25zICoqL1xuICBjYW5jZWwgPSAoKSA9PiB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7c2hvdzonbm9uZSd9KTtcbiAgfVxuXG4gIGhhbmRsZUFjdGlvbnM9KGFjdGlvbik9PnsgICAgIC8vTW9kYWwgc2hvdzsgZmlyc3QgZnVuY3Rpb25cbiAgICBpZiAoYWN0aW9uLnR5cGU9PT0nU0hPV19IRUxQJykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2hvdzonYmxvY2snLCBoZWxwOmFjdGlvbi5oZWxwfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIHRoZSByZW5kZXIgbWV0aG9kICoqL1xuICByZW5kZXIoKXtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtb2RhbFwiIHN0eWxlPXt7Li4ubW9kYWwsIGRpc3BsYXk6dGhpcy5zdGF0ZS5zaG93IH19PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1vZGFsLWNvbnRlbnRcIiBzdHlsZT17bW9kYWxDb250ZW50fT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbCBwLTBcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHgtMyBweS00XCIgc3R5bGU9e3suLi5oMSwgLi4uYnRuU3Ryb25nfX0+XG4gICAgICAgICAgICAgIEhlbHAgfCBPbnRvbG9neSBhbmQgUXVlc3Rpb25hcmUgU3RydWN0dXJlXG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdwLTMnIHN0eWxlPXtmbG93VGV4dH0+XG4gICAgICAgICAgICAgIHtvbnRvbG9neUhlbHAoKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoKT0+dGhpcy5zZXRTdGF0ZSh7c2hvdzonbm9uZSd9KX1cbiAgICAgICAgICAgICAgdmFyaWFudD1cImNvbnRhaW5lZFwiIGNsYXNzTmFtZT0nZmxvYXQtcmlnaHQgbS0zJyBpZD0nY2xvc2VCdG4nIHN0eWxlPXtidG5TdHJvbmd9PlxuICAgICAgICAgICAgICBDbG9zZVxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59Il0sImZpbGUiOiJyZW5kZXJlci9jb21wb25lbnRzL01vZGFsSGVscC5qcyJ9
