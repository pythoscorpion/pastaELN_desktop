"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _reactRouterDom = require("react-router-dom");

var _Menu = _interopRequireDefault(require("@material-ui/icons/Menu"));

var _Dispatcher = _interopRequireDefault(require("../Dispatcher"));

var _Store = _interopRequireDefault(require("../Store"));

var _style = require("../style");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* Header component: tabs at top of desktop
   filled automatically
*/
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
class Header extends _react.Component {
  constructor() {
    super();

    this.setCOMState = message => {
      if (message === 'ok') this.setState({
        comState: 'white'
      });else if (message === 'busy') this.setState({
        comState: 'gold'
      });else if (message === 'fail') this.setState({
        comState: 'red'
      });else this.setState({
        comState: 'white'
      });
    };

    this.handleActions = action => {
      if (action.type === 'COM_STATE') this.setCOMState(action.text);
    };

    this.state = {
      comState: 'black',
      dispatcherToken: null
    };
  }

  componentDidMount() {
    this.setState({
      dispatcherToken: _Dispatcher.default.register(this.handleActions)
    });

    _Store.default.on('changeCOMState', this.setCOMState);
  }

  componentWillUnmount() {
    _Dispatcher.default.unregister(this.state.dispatcherToken);

    _Store.default.removeListener('changeCOMState', this.setCOMState);
  }
  /** Functions as class properties (immediately bound): react on user interactions **/


  /** the render method **/
  render() {
    var targetDict = this.props.targets;
    if (targetDict.length == 0) return /*#__PURE__*/_react.default.createElement("div", null); //clean all x items and other subdoctypes

    var targets = Object.keys(targetDict).map(item => {
      if (item[0] == 'x' || item.indexOf('/') > 0) return [null, null];
      return [item, targetDict[item]];
    });
    targets = targets.filter(item => {
      return item[0] != null;
    });
    if ('x0' in targetDict) targets = [['x0', targetDict['x0']]].concat(targets);else console.log('**ERROR: Header.js no Projects in targets');
    targets = [['Configuration', 'Configuration']].concat(targets);
    const listDocTypes = targets.map((item, idx) => {
      if (item[0] == 'Configuration') //Configuration three horizontal bars
        return /*#__PURE__*/_react.default.createElement("li", {
          className: "nav-item",
          key: idx
        }, /*#__PURE__*/_react.default.createElement(_reactRouterDom.Link, {
          className: "nav-link",
          to: '/' + item[0],
          style: _style.linkStyle
        }, /*#__PURE__*/_react.default.createElement(_Menu.default, {
          style: {
            color: this.state.comState
          }
        })));
      if (item[0] == 'x0') //project
        return /*#__PURE__*/_react.default.createElement("li", {
          className: "nav-item",
          key: idx
        }, /*#__PURE__*/_react.default.createElement(_reactRouterDom.Link, {
          className: "nav-link",
          to: '/' + item[0],
          style: { ..._style.linkStyle
          }
        }, /*#__PURE__*/_react.default.createElement("strong", {
          style: {
            'fontSize': '13px'
          }
        }, item[1])));
      return /*#__PURE__*/_react.default.createElement("li", {
        className: "nav-item",
        key: idx
      }, /*#__PURE__*/_react.default.createElement(_reactRouterDom.Link, {
        className: "nav-link",
        to: '/' + item[0],
        style: { ..._style.linkStyle,
          padding: '4px 4px'
        }
      }, item[1]));
    }); //non-project

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "row",
      style: _style.navStyle
    }, /*#__PURE__*/_react.default.createElement("ul", {
      className: "nav nav-pills ml-3"
    }, listDocTypes));
  }

}

exports.default = Header;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlcmVyL2NvbXBvbmVudHMvSGVhZGVyLmpzIl0sIm5hbWVzIjpbIkhlYWRlciIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwic2V0Q09NU3RhdGUiLCJtZXNzYWdlIiwic2V0U3RhdGUiLCJjb21TdGF0ZSIsImhhbmRsZUFjdGlvbnMiLCJhY3Rpb24iLCJ0eXBlIiwidGV4dCIsInN0YXRlIiwiZGlzcGF0Y2hlclRva2VuIiwiY29tcG9uZW50RGlkTW91bnQiLCJkaXNwYXRjaGVyIiwicmVnaXN0ZXIiLCJTdG9yZSIsIm9uIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1bnJlZ2lzdGVyIiwicmVtb3ZlTGlzdGVuZXIiLCJyZW5kZXIiLCJ0YXJnZXREaWN0IiwicHJvcHMiLCJ0YXJnZXRzIiwibGVuZ3RoIiwiT2JqZWN0Iiwia2V5cyIsIm1hcCIsIml0ZW0iLCJpbmRleE9mIiwiZmlsdGVyIiwiY29uY2F0IiwiY29uc29sZSIsImxvZyIsImxpc3REb2NUeXBlcyIsImlkeCIsImxpbmtTdHlsZSIsImNvbG9yIiwicGFkZGluZyIsIm5hdlN0eWxlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBUkE7QUFDQTtBQUNBO0FBQytDO0FBQ0E7QUFDQTtBQUtoQyxNQUFNQSxNQUFOLFNBQXFCQyxnQkFBckIsQ0FBK0I7QUFDNUNDLEVBQUFBLFdBQVcsR0FBRztBQUNaOztBQURZLFNBaUJkQyxXQWpCYyxHQWlCREMsT0FBRCxJQUFXO0FBQ3JCLFVBQUlBLE9BQU8sS0FBRyxJQUFkLEVBQ0UsS0FBS0MsUUFBTCxDQUFjO0FBQUNDLFFBQUFBLFFBQVEsRUFBRTtBQUFYLE9BQWQsRUFERixLQUVLLElBQUlGLE9BQU8sS0FBRyxNQUFkLEVBQ0gsS0FBS0MsUUFBTCxDQUFjO0FBQUNDLFFBQUFBLFFBQVEsRUFBRTtBQUFYLE9BQWQsRUFERyxLQUVBLElBQUlGLE9BQU8sS0FBRyxNQUFkLEVBQ0gs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T0YsVUFBSXVCLElBQUksQ0FBQyxDQUFELENBQUosSUFBUyxJQUFiLEVBQW9CO0FBQ2xCLDRCQUNFO0FBQUksVUFBQSxTQUFTLEVBQUMsVUFBZDtBQUF5QixVQUFBLEdBQUcsRUFBRU87QUFBOUIsd0JBQ0UsNkJBQUMsb0JBQUQ7QUFBTSxVQUFBLFNBQVMsRUFBQyxVQUFoQjtBQUEyQixVQUFBLEVBQUUsRUFBRSxNQUFJUCxJQUFJLENBQUMsQ0FBRCxDQUF2QztBQUE0QyxVQUFBLEtBQUssRUFBRSxFQUFDLEdBQUdRO0FBQUo7QUFBbkQsd0JBQ0U7QUFBUSxVQUFBLEtBQUssRUFBRTtBQUFDLHdCQUFXO0FBQVo7QUFBZixXQUFxQ1IsSUFBSSxDQUFDLENBQUQsQ0FBekMsQ0FERixDQURGLENBREY7QUFPRiwwQkFDRTtBQUFJLFFBQUEsU0FBUyxFQUFDLFVBQWQ7QUFBeUIsUUFBQSxHQUFHLEVBQUVPO0FBQTlCLHNCQUNFLDZCQUFDLG9CQUFEO0FBQU0sUUFBQSxTQUFTLEVBQUMsVUFBaEI7QUFBMkIsUUFBQSxFQUFFLEVBQUUsTUFBSVAsSUFBSSxDQUFDLENBQUQsQ0FBdkM7QUFBNEMsUUFBQSxLQUFLLEVBQUUsRUFBQyxHQUFHUSxnQkFBSjtBQUFlRSxVQUFBQSxPQUFPLEVBQUM7QUFBdkI7QUFBbkQsU0FDR1YsSUFBSSxDQUFDLENBQUQsQ0FEUCxDQURGLENBREY7QUFPRCxLQXhCb0IsQ0FBckIsQ0FoQk8sQ0F5Q1A7O0FBQ0Esd0JBQ0U7QUFBSyxNQUFBLFNBQVMsRUFBQyxLQUFmO0FBQXFCLE1BQUEsS0FBSyxFQUFFVztBQUE1QixvQkFDRTtBQUFJLE1BQUEsU0FBUyxFQUFDO0FBQWQsT0FDR0wsWUFESCxDQURGLENBREY7QUFPRDs7QUFwRjJDIiwic291cmNlc0NvbnRlbnQiOlsiLyogSGVhZGVyIGNvbXBvbmVudDogdGFicyBhdCB0b3Agb2YgZGVza3RvcFxuICAgZmlsbGVkIGF1dG9tYXRpY2FsbHlcbiovXG5pbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50IH0gZnJvbSAncmVhY3QnOyAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCB7IExpbmsgfSBmcm9tICdyZWFjdC1yb3V0ZXItZG9tJzsgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IE1lbnVJY29uIGZyb20gJ0BtYXRlcmlhbC11aS9pY29ucy9NZW51JzsvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuLi9EaXNwYXRjaGVyJztcbmltcG9ydCBTdG9yZSBmcm9tICcuLi9TdG9yZSc7XG5pbXBvcnQgeyBuYXZTdHlsZSwgbGlua1N0eWxlIH0gZnJvbSAnLi4vc3R5bGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIZWFkZXIgZXh0ZW5kcyBDb21wb25lbnQge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBjb21TdGF0ZTogJ2JsYWNrJyxcbiAgICAgIGRpc3BhdGNoZXJUb2tlbjogbnVsbFxuICAgIH07XG4gIH1cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7ZGlzcGF0Y2hlclRva2VuOiBkaXNwYXRjaGVyLnJlZ2lzdGVyKHRoaXMuaGFuZGxlQWN0aW9ucyl9KTtcbiAgICBTdG9yZS5vbignY2hhbmdlQ09NU3RhdGUnLCB0aGlzLnNldENPTVN0YXRlKTtcbiAgfVxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBkaXNwYXRjaGVyLnVucmVnaXN0ZXIodGhpcy5zdGF0ZS5kaXNwYXRjaGVyVG9rZW4pO1xuICAgIFN0b3JlLnJlbW92ZUxpc3RlbmVyKCdjaGFuZ2VDT01TdGF0ZScsIHRoaXMuc2V0Q09NU3RhdGUpO1xuICB9XG5cbiAgLyoqIEZ1bmN0aW9ucyBhcyBjbGFzcyBwcm9wZXJ0aWVzIChpbW1lZGlhdGVseSBib3VuZCk6IHJlYWN0IG9uIHVzZXIgaW50ZXJhY3Rpb25zICoqL1xuICBzZXRDT01TdGF0ZT0obWVzc2FnZSk9PntcbiAgICBpZiAobWVzc2FnZT09PSdvaycpXG4gICAgICB0aGlzLnNldFN0YXRlKHtjb21TdGF0ZTogJ3doaXRlJ30pO1xuICAgIGVsc2UgaWYgKG1lc3NhZ2U9PT0nYnVzeScpXG4gICAgICB0aGlzLnNldFN0YXRlKHtjb21TdGF0ZTogJ2dvbGQnfSk7XG4gICAgZWxzZSBpZiAobWVzc2FnZT09PSdmYWlsJylcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2NvbVN0YXRlOiAncmVkJ30pO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2NvbVN0YXRlOiAnd2hpdGUnfSk7XG4gIH1cbiAgaGFuZGxlQWN0aW9ucz0oYWN0aW9uKT0+e1xuICAgIGlmIChhY3Rpb24udHlwZT09PSdDT01fU1RBVEUnKVxuICAgICAgdGhpcy5zZXRDT01TdGF0ZShhY3Rpb24udGV4dCk7XG4gIH1cblxuXG4gIC8qKiB0aGUgcmVuZGVyIG1ldGhvZCAqKi9cbiAgcmVuZGVyKCkge1xuICAgIHZhciB0YXJnZXREaWN0ID0gdGhpcy5wcm9wcy50YXJnZXRzO1xuICAgIGlmICh0YXJnZXREaWN0Lmxlbmd0aD09MClcbiAgICAgIHJldHVybiA8ZGl2PjwvZGl2PjtcbiAgICAvL2NsZWFuIGFsbCB4IGl0ZW1zIGFuZCBvdGhlciBzdWJkb2N0eXBlc1xuICAgIHZhciB0YXJnZXRzID0gT2JqZWN0LmtleXModGFyZ2V0RGljdCkubWFwKGl0ZW09PntcbiAgICAgIGlmIChpdGVtWzBdPT0neCcgfHwgaXRlbS5pbmRleE9mKCcvJyk+MClcbiAgICAgICAgcmV0dXJuIFtudWxsLG51bGxdO1xuICAgICAgcmV0dXJuIFtpdGVtLCB0YXJnZXREaWN0W2l0ZW1dXTtcbiAgICB9KTtcbiAgICB0YXJnZXRzID0gdGFyZ2V0cy5maWx0ZXIoaXRlbT0+e3JldHVybiBpdGVtWzBdIT1udWxsO30pO1xuICAgIGlmICgneDAnIGluIHRhcmdldERpY3QpXG4gICAgICB0YXJnZXRzID0gW1sneDAnLHRhcmdldERpY3RbJ3gwJ11dXS5jb25jYXQodGFyZ2V0cyk7XG4gICAgZWxzZVxuICAgICAgY29uc29sZS5sb2coJyoqRVJST1I6IEhlYWRlci5qcyBubyBQcm9qZWN0cyBpbiB0YXJnZXRzJyk7XG4gICAgdGFyZ2V0cyA9IFtbJ0NvbmZpZ3VyYXRpb24nLCdDb25maWd1cmF0aW9uJ11dLmNvbmNhdCh0YXJnZXRzKTtcbiAgICBjb25zdCBsaXN0RG9jVHlwZXMgPSB0YXJnZXRzLm1hcCgoaXRlbSxpZHgpPT57XG4gICAgICBpZiAoaXRlbVswXT09J0NvbmZpZ3VyYXRpb24nKSAgLy9Db25maWd1cmF0aW9uIHRocmVlIGhvcml6b250YWwgYmFyc1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxsaSBjbGFzc05hbWU9XCJuYXYtaXRlbVwiIGtleT17aWR4fSA+XG4gICAgICAgICAgICA8TGluayBjbGFzc05hbWU9XCJuYXYtbGlua1wiIHRvPXsnLycraXRlbVswXX0gc3R5bGU9e2xpbmtTdHlsZX0+XG4gICAgICAgICAgICAgIDxNZW51SWNvbiBzdHlsZT17e2NvbG9yOnRoaXMuc3RhdGUuY29tU3RhdGV9fS8+XG4gICAgICAgICAgICA8L0xpbms+XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgKTtcbiAgICAgIGlmIChpdGVtWzBdPT0neDAnKSAgLy9wcm9qZWN0XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGxpIGNsYXNzTmFtZT1cIm5hdi1pdGVtXCIga2V5PXtpZHh9ID5cbiAgICAgICAgICAgIDxMaW5rIGNsYXNzTmFtZT1cIm5hdi1saW5rXCIgdG89eycvJytpdGVtWzBdfSBzdHlsZT17ey4uLmxpbmtTdHlsZX19PlxuICAgICAgICAgICAgICA8c3Ryb25nIHN0eWxlPXt7J2ZvbnRTaXplJzonMTNweCd9fT57aXRlbVsxXX08L3N0cm9uZz5cbiAgICAgICAgICAgIDwvTGluaz5cbiAgICAgICAgICA8L2xpPlxuICAgICAgICApO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGxpIGNsYXNzTmFtZT1cIm5hdi1pdGVtXCIga2V5PXtpZHh9PlxuICAgICAgICAgIDxMaW5rIGNsYXNzTmFtZT1cIm5hdi1saW5rXCIgdG89eycvJytpdGVtWzBdfSBzdHlsZT17ey4uLmxpbmtTdHlsZSwgcGFkZGluZzonNHB4IDRweCd9fT5cbiAgICAgICAgICAgIHtpdGVtWzFdfVxuICAgICAgICAgIDwvTGluaz5cbiAgICAgICAgPC9saT5cbiAgICAgICk7XG4gICAgfSk7XG4gICAgLy9ub24tcHJvamVjdFxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93JyBzdHlsZT17bmF2U3R5bGV9PlxuICAgICAgICA8dWwgY2xhc3NOYW1lPVwibmF2IG5hdi1waWxscyBtbC0zXCI+XG4gICAgICAgICAge2xpc3REb2NUeXBlc31cbiAgICAgICAgPC91bD5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cbiJdLCJmaWxlIjoicmVuZGVyZXIvY29tcG9uZW50cy9IZWFkZXIuanMifQ==
