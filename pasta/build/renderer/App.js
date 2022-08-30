"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _reactRouterDom = require("react-router-dom");

var _styles = require("@material-ui/core/styles");

var _DocComponent = _interopRequireDefault(require("./components/DocComponent"));

var _ProjectComponent = _interopRequireDefault(require("./components/ProjectComponent"));

var _Header = _interopRequireDefault(require("./components/Header"));

var _ConfigPage = _interopRequireDefault(require("./components/ConfigPage"));

var _Store = _interopRequireDefault(require("./Store"));

var _style = require("./style");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* MAIN Component of React-Framework
   Routes for different pages are defined here
   Initiation of Store
*/
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
const theme = (0, _styles.createTheme)(_style.pastaTheme);

class App extends _react.Component {
  constructor() {
    super();

    this.getTargets = () => {
      //get database information (Measurement,Samples,...)
      this.setState({
        targets: _Store.default.getDocTypeLabels()
      });
    };

    this.state = {
      targets: []
    };
  }

  componentDidMount() {
    _Store.default.on('initStore', this.getTargets);

    _Store.default.initStore();
  }

  componentWillUnmount() {
    _Store.default.removeListener('initStore', this.getTargets);
  }

  /**************************************
   * the render method
   **************************************/
  render() {
    const docTypes = Object.keys(this.state.targets);
    const routeItems = docTypes.map((item, idx) => {
      if (item == 'x0') {
        return /*#__PURE__*/_react.default.createElement(_reactRouterDom.Route, {
          exact: true,
          path: '/' + item,
          key: idx
        }, /*#__PURE__*/_react.default.createElement(_ProjectComponent.default, null));
      } else {
        return /*#__PURE__*/_react.default.createElement(_reactRouterDom.Route, {
          exact: true,
          path: '/' + item,
          key: idx
        }, /*#__PURE__*/_react.default.createElement(_DocComponent.default, {
          docType: item
        }));
      }
    });
    return /*#__PURE__*/_react.default.createElement(_styles.ThemeProvider, {
      theme: theme
    }, /*#__PURE__*/_react.default.createElement("div", {
      style: _style.paper
    }, /*#__PURE__*/_react.default.createElement(_reactRouterDom.HashRouter, null, /*#__PURE__*/_react.default.createElement(_Header.default, {
      targets: this.state.targets
    }), /*#__PURE__*/_react.default.createElement(_reactRouterDom.Switch, null, /*#__PURE__*/_react.default.createElement(_reactRouterDom.Route, {
      exact: true,
      path: "/"
    }, "              ", /*#__PURE__*/_react.default.createElement(_ProjectComponent.default, null), " "), /*#__PURE__*/_react.default.createElement(_reactRouterDom.Route, {
      exact: true,
      path: "/Configuration"
    }, " ", /*#__PURE__*/_react.default.createElement(_ConfigPage.default, null), " "), routeItems))));
  }

}

exports.default = App;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlcmVyL0FwcC5qcyJdLCJuYW1lcyI6WyJ0aGVtZSIsInBhc3RhVGhlbWUiLCJBcHAiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsImdldFRhcmdldHMiLCJzZXRTdGF0ZSIsInRhcmdldHMiLCJTdG9yZSIsImdldERvY1R5cGVMYWJlbHMiLCJzdGF0ZSIsImNvbXBvbmVudERpZE1vdW50Iiwib24iLCJpbml0U3RvcmUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUxpc3RlbmVyIiwicmVuZGVyIiwiZG9jVHlwZXMiLCJPYmplY3QiLCJrZXlzIiwicm91dGVJdGVtcyIsIm1hcCIsIml0ZW0iLCJpZHgiLCJwYXBlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUlBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQVpBO0FBQ0E7QUFDQTtBQUNBO0FBQ2dGO0FBQ0E7QUFDVjtBQUNVO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFHaEYsTUFBTUEsS0FBSyxHQUFHLHlCQUFZQyxpQkFBWixDQUFkOztBQUVlLE1BQU1DLEdBQU4sU0FBa0JDLGdCQUFsQixDQUE0QjtBQUN6Q0MsRUFBQUEsV0FBVyxHQUFFO0FBQ1g7O0FBRFcsU0FjYkMsVUFkYSxHQWNGLE1BQUk7QUFDYjtBQUNBLFdBQUtDLFFBQUwsQ0FBYztBQUFDQyxRQUFBQSxPQUFPLEVBQUVDLGVBQU1DLGdCQUFOO0FBQVYsT0FBZDtBQUNELEtBakJZOztBQUVYLFNBQUtDLEtBQUwsR0FBYTtBQUNYSCxNQUFBQSxPQUFPLEVBQUU7QUFERSxLQUFiO0FBR0Q7O0FBQ0RJLEVBQUFBLGlCQUFpQixHQUFFO0FBQ2pCSCxtQkFBTUksRUFBTixDQUFTLFdBQVQsRUFBc0IsS0FBS1AsVUFBM0I7O0FBQ0FHLG1CQUFNSyxTQUFOO0FBRUQ7O0FBQ0RDLEVBQUFBLG9CQUFvQixHQUFFO0FBQ3BCTixtQkFBTU8sY0FBTixDQUFxQixXQUFyQixFQUFrQyxLQUFLVixVQUF2QztBQUNEOztBQU1EO0FBQ0Y7QUFDQTtBQUNFVyxFQUFBQSxNQUFNLEdBQUc7QUFDUCxVQUFNQyxRQUFRLEdBQUdDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLEtBQUtULEtBQUwsQ0FBV0gsT0FBdkIsQ0FBakI7QUFDQSxVQUFNYSxVQUFVLEdBQUdILFFBQVEsQ0FBQ0ksR0FBVCxDQUFhLENBQUNDLElBQUQsRUFBTUMsR0FBTixLQUFjO0FBQzVDLFVBQUlELElBQUksSUFBRSxJQUFWLEVBQWdCO0FBQ2QsNEJBQ0UsNkJBQUMscUJBQUQ7QUFBTyxVQUFBLEtBQUssTUFBWjtBQUFhLFVBQUEsSUFBSSxFQUFFLE1BQUlBLElBQXZCO0FBQTZCLFVBQUEsR0FBRyxFQUFFQztBQUFsQyx3QkFDRSw2QkFBQyx5QkFBRCxPQURGLENBREY7QUFLRCxPQU5ELE1BTU87QUFDTCw0QkFDRSw2QkFBQyxxQkFBRDtBQUFPLFVBQUEsS0FBSyxNQUFaO0FBQWEsVUFBQSxJQUFJLEVBQUUsTUFBSUQsSUFBdkI7QUFBNkIsVUFBQSxHQUFHLEVBQUVDO0FBQWxDLHdCQUNFLDZCQUFDLHFCQUFEO0FBQWMsVUFBQSxPQUFPLEVBQUVEO0FBQXZCLFVBREYsQ0FERjtBQUtEO0FBQ0YsS0Fka0IsQ0FBbkI7QUFlQSx3QkFDRSw2QkFBQyxxQkFBRDtBQUFlLE1BQUEsS0FBSyxFQUFFdEI7QUFBdEIsb0JBQ0U7QUFBSyxNQUFBLEtBQUssRUFBRXdCO0FBQVosb0JBQ0UsNkJBQUMsMEJBQUQscUJBQ0UsNkJBQUMsZUFBRDtBQUFRLE1BQUEsT0FBTyxFQUFFLEtBQUtkLEtBQUwsQ0FBV0g7QUFBNUIsTUFERixlQUVFLDZCQUFDLHNCQUFELHFCQUNFLDZCQUFDLHFCQUFEO0FBQU8sTUFBQSxLQUFLLE1BQVo7QUFBYSxNQUFBLElBQUksRUFBQztBQUFsQixzQ0FBb0MsNkJBQUMseUJBQUQsT0FBcEMsTUFERixlQUVFLDZCQUFDLHFCQUFEO0FBQU8sTUFBQSxLQUFLLE1BQVo7QUFBYSxNQUFBLElBQUksRUFBQztBQUFsQix5QkFBb0MsNkJBQUMsbUJBQUQsT0FBcEMsTUFGRixFQUdHYSxVQUhILENBRkYsQ0FERixDQURGLENBREY7QUFjRDs7QUF0RHdDIiwic291cmNlc0NvbnRlbnQiOlsiLyogTUFJTiBDb21wb25lbnQgb2YgUmVhY3QtRnJhbWV3b3JrXG4gICBSb3V0ZXMgZm9yIGRpZmZlcmVudCBwYWdlcyBhcmUgZGVmaW5lZCBoZXJlXG4gICBJbml0aWF0aW9uIG9mIFN0b3JlXG4qL1xuaW1wb3J0IFJlYWN0LCB7IENvbXBvbmVudCB9IGZyb20gJ3JlYWN0JzsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgeyBIYXNoUm91dGVyIGFzIFJvdXRlciwgUm91dGUsIFN3aXRjaCB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nOyAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCB7IGNyZWF0ZVRoZW1lLCBUaGVtZVByb3ZpZGVyIH0gZnJvbSAnQG1hdGVyaWFsLXVpL2NvcmUvc3R5bGVzJzsvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgRG9jQ29tcG9uZW50IGZyb20gJy4vY29tcG9uZW50cy9Eb2NDb21wb25lbnQnOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCBQcm9qZWN0Q29tcG9uZW50IGZyb20gJy4vY29tcG9uZW50cy9Qcm9qZWN0Q29tcG9uZW50JzsgICAgICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IEhlYWRlciBmcm9tICcuL2NvbXBvbmVudHMvSGVhZGVyJzsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgQ29uZmlnUGFnZSBmcm9tICcuL2NvbXBvbmVudHMvQ29uZmlnUGFnZSc7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCBTdG9yZSBmcm9tICcuL1N0b3JlJzsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IHsgcGFzdGFUaGVtZSwgcGFwZXIgfSBmcm9tICcuL3N0eWxlJztcblxuY29uc3QgdGhlbWUgPSBjcmVhdGVUaGVtZShwYXN0YVRoZW1lKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IoKXtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB0YXJnZXRzOiBbXVxuICAgIH07XG4gIH1cbiAgY29tcG9uZW50RGlkTW91bnQoKXtcbiAgICBTdG9yZS5vbignaW5pdFN0b3JlJywgdGhpcy5nZXRUYXJnZXRzKTtcbiAgICBTdG9yZS5pbml0U3RvcmUoKTtcblxuICB9XG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCl7XG4gICAgU3RvcmUucmVtb3ZlTGlzdGVuZXIoJ2luaXRTdG9yZScsIHRoaXMuZ2V0VGFyZ2V0cyk7XG4gIH1cbiAgZ2V0VGFyZ2V0cz0oKT0+e1xuICAgIC8vZ2V0IGRhdGFiYXNlIGluZm9ybWF0aW9uIChNZWFzdXJlbWVudCxTYW1wbGVzLC4uLilcbiAgICB0aGlzLnNldFN0YXRlKHt0YXJnZXRzOiBTdG9yZS5nZXREb2NUeXBlTGFiZWxzKCkgfSk7XG4gIH1cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogdGhlIHJlbmRlciBtZXRob2RcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICByZW5kZXIoKSB7XG4gICAgY29uc3QgZG9jVHlwZXMgPSBPYmplY3Qua2V5cyh0aGlzLnN0YXRlLnRhcmdldHMpO1xuICAgIGNvbnN0IHJvdXRlSXRlbXMgPSBkb2NUeXBlcy5tYXAoKGl0ZW0saWR4KT0+ICB7XG4gICAgICBpZiAoaXRlbT09J3gwJykge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxSb3V0ZSBleGFjdCBwYXRoPXsnLycraXRlbX0ga2V5PXtpZHh9PlxuICAgICAgICAgICAgPFByb2plY3RDb21wb25lbnQvPlxuICAgICAgICAgIDwvUm91dGU+XG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxSb3V0ZSBleGFjdCBwYXRoPXsnLycraXRlbX0ga2V5PXtpZHh9PlxuICAgICAgICAgICAgPERvY0NvbXBvbmVudCBkb2NUeXBlPXtpdGVtfS8+XG4gICAgICAgICAgPC9Sb3V0ZT5cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPFRoZW1lUHJvdmlkZXIgdGhlbWU9e3RoZW1lfT5cbiAgICAgICAgPGRpdiBzdHlsZT17cGFwZXJ9PlxuICAgICAgICAgIDxSb3V0ZXI+XG4gICAgICAgICAgICA8SGVhZGVyIHRhcmdldHM9e3RoaXMuc3RhdGUudGFyZ2V0c30vPlxuICAgICAgICAgICAgPFN3aXRjaD5cbiAgICAgICAgICAgICAgPFJvdXRlIGV4YWN0IHBhdGg9Jy8nPiAgICAgICAgICAgICAgPFByb2plY3RDb21wb25lbnQgLz4gPC9Sb3V0ZT5cbiAgICAgICAgICAgICAgPFJvdXRlIGV4YWN0IHBhdGg9Jy9Db25maWd1cmF0aW9uJz4gPENvbmZpZ1BhZ2UgLz4gPC9Sb3V0ZT5cbiAgICAgICAgICAgICAge3JvdXRlSXRlbXN9XG4gICAgICAgICAgICA8L1N3aXRjaD5cbiAgICAgICAgICA8L1JvdXRlcj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L1RoZW1lUHJvdmlkZXI+XG4gICAgKTtcbiAgfVxufVxuIl0sImZpbGUiOiJyZW5kZXJlci9BcHAuanMifQ==
