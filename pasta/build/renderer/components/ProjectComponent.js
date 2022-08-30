"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _Dispatcher = _interopRequireDefault(require("../Dispatcher"));

var _Project = _interopRequireDefault(require("./Project"));

var _DocTable = _interopRequireDefault(require("./DocTable"));

var _Store = _interopRequireDefault(require("../Store"));

var _ModalForm = _interopRequireDefault(require("./ModalForm"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* Component that houses the table OR the tree view of project
*/
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
class ProjectComponent extends _react.Component {
  constructor() {
    super();

    this.handleActions = action => {
      if (action.type === 'RESTART_DOC_TYPE') {
        this.setState({
          showTable: true
        });
      }
    };

    this.toggleTableOff = () => {
      /**Toggle table from on->off */
      this.setState({
        showTable: false
      });
    };

    this.toggleTableOn = () => {
      /**Toggle table from off->on */
      this.setState({
        showTable: true
      });
    };

    this.state = {
      showTable: true,
      dispatcherToken: null
    };
  }

  componentDidMount() {
    _Store.default.on('changeDoc', this.toggleTableOff);

    this.setState({
      showTable: true,
      dispatcherToken: _Dispatcher.default.register(this.handleActions)
    });
  }

  componentWillUnmount() {
    _Dispatcher.default.unregister(this.state.dispatcherToken);

    _Store.default.removeListener('changeDoc', this.toggleTableOff);
  }
  /** Functions as class properties (immediately bound): react on user interactions **/


  /** the render method **/
  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "container px-2 pt-1"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "row px-0"
    }, this.state.showTable ? /*#__PURE__*/_react.default.createElement(_DocTable.default, {
      docType: "x0"
    }) : /*#__PURE__*/_react.default.createElement(_Project.default, {
      callback: this.toggleTableOn
    })), this.state.showTable && /*#__PURE__*/_react.default.createElement(_ModalForm.default, null));
  }

}

exports.default = ProjectComponent;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlcmVyL2NvbXBvbmVudHMvUHJvamVjdENvbXBvbmVudC5qcyJdLCJuYW1lcyI6WyJQcm9qZWN0Q29tcG9uZW50IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJoYW5kbGVBY3Rpb25zIiwiYWN0aW9uIiwidHlwZSIsInNldFN0YXRlIiwic2hvd1RhYmxlIiwidG9nZ2xlVGFibGVPZmYiLCJ0b2dnbGVUYWJsZU9uIiwic3RhdGUiLCJkaXNwYXRjaGVyVG9rZW4iLCJjb21wb25lbnREaWRNb3VudCIsIlN0b3JlIiwib24iLCJkaXNwYXRjaGVyIiwicmVnaXN0ZXIiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInVucmVnaXN0ZXIiLCJyZW1vdmVMaXN0ZW5lciIsInJlbmRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQVBBO0FBQ0E7QUFDK0M7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVoQyxNQUFNQSxnQkFBTixTQUErQkMsZ0JBQS9CLENBQXlDO0FBQ3REQyxFQUFBQSxXQUFXLEdBQUc7QUFDWjs7QUFEWSxTQW1CZEMsYUFuQmMsR0FtQkNDLE1BQUQsSUFBVTtBQUN0QixVQUFJQSxNQUFNLENBQUNDLElBQVAsS0FBYyxrQkFBbEIsRUFBcUM7QUFDbkMsYUFBS0MsUUFBTCxDQUFjO0FBQUNDLFVBQUFBLFNBQVMsRUFBRTtBQUFaLFNBQWQ7QUFDRDtBQUNGLEtBdkJhOztBQUFBLFNBeUJkQyxjQXpCYyxHQXlCQyxNQUFJO0FBQ2pCO0FBQ0EsV0FBS0YsUUFBTCxDQUFjO0FBQUNDLFFBQUFBLFNBQVMsRUFBRTtBQUFaLE9BQWQ7QUFDRCxLQTVCYTs7QUFBQSxTQTZCZEUsYUE3QmMsR0E2QkEsTUFBSTtBQUNoQjtBQUNBLFdBQUtILFFBQUwsQ0FBYztBQUFDQyxRQUFBQSxTQUFTLEVBQUU7QUFBWixPQUFkO0FBQ0QsS0FoQ2E7O0FBRVosU0FBS0csS0FBTCxHQUFhO0FBQ1hILE1BQUFBLFNBQVMsRUFBRSxJQURBO0FBRVhJLE1BQUFBLGVBQWUsRUFBRTtBQUZOLEtBQWI7QUFJRDs7QUFDREMsRUFBQUEsaUJBQWlCLEdBQUc7QUFDbEJDLG1CQUFNQyxFQUFOLENBQVMsV0FBVCxFQUF3QixLQUFLTixjQUE3Qjs7QUFDQSxTQUFLRixRQUFMLENBQWM7QUFBQ0MsTUFBQUEsU0FBUyxFQUFFLElBQVo7QUFDWkksTUFBQUEsZUFBZSxFQUFFSSxvQkFBV0MsUUFBWCxDQUFvQixLQUFLYixhQUF6QjtBQURMLEtBQWQ7QUFFRDs7QUFDRGMsRUFBQUEsb0JBQW9CLEdBQUc7QUFDckJGLHdCQUFXRyxVQUFYLENBQXNCLEtBQUtSLEtBQUwsQ0FBV0MsZUFBakM7O0FBQ0FFLG1CQUFNTSxjQUFOLENBQXFCLFdBQXJCLEVBQW9DLEtBQUtYLGNBQXpDO0FBQ0Q7QUFHRDs7O0FBaUJBO0FBQ0FZLEVBQUFBLE1BQU0sR0FBRztBQUNQLHdCQUNFO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDRTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDRyxLQUFLVixLQUFMLENBQVdILFNBQVgsZ0JBQXVCLDZCQUFDLGlCQUFEO0FBQVUsTUFBQSxPQUFPLEVBQUM7QUFBbEIsTUFBdkIsZ0JBQW1ELDZCQUFDLGdCQUFEO0FBQVMsTUFBQSxRQUFRLEVBQUUsS0FBS0U7QUFBeEIsTUFEdEQsQ0FERixFQUlHLEtBQUtDLEtBQUwsQ0FBV0gsU0FBWCxpQkFBd0IsNkJBQUMsa0JBQUQsT0FKM0IsQ0FERjtBQVFEOztBQTlDcUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBDb21wb25lbnQgdGhhdCBob3VzZXMgdGhlIHRhYmxlIE9SIHRoZSB0cmVlIHZpZXcgb2YgcHJvamVjdFxuKi9cbmltcG9ydCBSZWFjdCwgeyBDb21wb25lbnQgfSBmcm9tICdyZWFjdCc7ICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi4vRGlzcGF0Y2hlcic7XG5pbXBvcnQgUHJvamVjdCBmcm9tICcuL1Byb2plY3QnOyAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCBEb2NUYWJsZSBmcm9tICcuL0RvY1RhYmxlJzsgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IFN0b3JlIGZyb20gJy4uL1N0b3JlJzsgICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgTW9kYWxGb3JtIGZyb20gJy4vTW9kYWxGb3JtJzsgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvamVjdENvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHNob3dUYWJsZTogdHJ1ZSxcbiAgICAgIGRpc3BhdGNoZXJUb2tlbjogbnVsbFxuICAgIH07XG4gIH1cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgU3RvcmUub24oJ2NoYW5nZURvYycsICAgdGhpcy50b2dnbGVUYWJsZU9mZik7XG4gICAgdGhpcy5zZXRTdGF0ZSh7c2hvd1RhYmxlOiB0cnVlLFxuICAgICAgZGlzcGF0Y2hlclRva2VuOiBkaXNwYXRjaGVyLnJlZ2lzdGVyKHRoaXMuaGFuZGxlQWN0aW9ucyl9KTtcbiAgfVxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBkaXNwYXRjaGVyLnVucmVnaXN0ZXIodGhpcy5zdGF0ZS5kaXNwYXRjaGVyVG9rZW4pO1xuICAgIFN0b3JlLnJlbW92ZUxpc3RlbmVyKCdjaGFuZ2VEb2MnLCAgIHRoaXMudG9nZ2xlVGFibGVPZmYpO1xuICB9XG5cblxuICAvKiogRnVuY3Rpb25zIGFzIGNsYXNzIHByb3BlcnRpZXMgKGltbWVkaWF0ZWx5IGJvdW5kKTogcmVhY3Qgb24gdXNlciBpbnRlcmFjdGlvbnMgKiovXG4gIGhhbmRsZUFjdGlvbnM9KGFjdGlvbik9PntcbiAgICBpZiAoYWN0aW9uLnR5cGU9PT0nUkVTVEFSVF9ET0NfVFlQRScpe1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2hvd1RhYmxlOiB0cnVlfSk7XG4gICAgfVxuICB9XG5cbiAgdG9nZ2xlVGFibGVPZmY9KCk9PntcbiAgICAvKipUb2dnbGUgdGFibGUgZnJvbSBvbi0+b2ZmICovXG4gICAgdGhpcy5zZXRTdGF0ZSh7c2hvd1RhYmxlOiBmYWxzZX0pO1xuICB9XG4gIHRvZ2dsZVRhYmxlT249KCk9PntcbiAgICAvKipUb2dnbGUgdGFibGUgZnJvbSBvZmYtPm9uICovXG4gICAgdGhpcy5zZXRTdGF0ZSh7c2hvd1RhYmxlOiB0cnVlfSk7XG4gIH1cblxuXG4gIC8qKiB0aGUgcmVuZGVyIG1ldGhvZCAqKi9cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT0nY29udGFpbmVyIHB4LTIgcHQtMSc+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdyb3cgcHgtMCc+XG4gICAgICAgICAge3RoaXMuc3RhdGUuc2hvd1RhYmxlID8gPERvY1RhYmxlIGRvY1R5cGU9J3gwJyAvPiA6IDxQcm9qZWN0IGNhbGxiYWNrPXt0aGlzLnRvZ2dsZVRhYmxlT259Lz59XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7dGhpcy5zdGF0ZS5zaG93VGFibGUgJiYgPE1vZGFsRm9ybSAvPn1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cbiJdLCJmaWxlIjoicmVuZGVyZXIvY29tcG9uZW50cy9Qcm9qZWN0Q29tcG9uZW50LmpzIn0=
