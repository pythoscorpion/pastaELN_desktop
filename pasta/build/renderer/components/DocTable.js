"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _core = require("@material-ui/core");

var _AddCircle = _interopRequireDefault(require("@material-ui/icons/AddCircle"));

var _ViewArray = _interopRequireDefault(require("@material-ui/icons/ViewArray"));

var _FilterList = _interopRequireDefault(require("@material-ui/icons/FilterList"));

var _dataGrid = require("@material-ui/data-grid");

var _icons = require("@material-ui/icons");

var _lab = require("@material-ui/lab");

var _styles = require("@material-ui/core/styles");

var Actions = _interopRequireWildcard(require("../Actions"));

var _Store = _interopRequireDefault(require("../Store"));

var _localInteraction = require("../localInteraction");

var _style = require("../style");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* Tabular overview on the left side
*/
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
class DocTable extends _react.Component {
  constructor() {
    super();

    this.toggleDetails = doc => {
      /* Trigger the doc with the id to be shown */
      this.setState({
        selectID: doc.row.id
      });
      Actions.readDoc(doc.row.id);
    };

    this.headerBtnOpen = event => {
      /**press button in the table header and open a menu*/
      if (event.currentTarget.innerText == 'COLUMN WIDTH') this.setState({
        anchorFormatMenu: event.currentTarget
      });else if (event.currentTarget.innerText == 'FILTER') this.setState({
        anchorFilterMenu: event.currentTarget
      });else console.log('headerBtnOpen: event does not have a case');
    };

    this.headerMenuClose = () => {
      /**close the menu in the table header */
      this.setState({
        anchorFormatMenu: null
      });
    };

    this.valueLabelFormat = value => {
      /**From index/value create label read by human*/
      return _style.tblColFmt[value].label;
    };

    this.changeSlider = (idx, value) => {
      /**After slider changed, save new state in this state */
      var colWidth = this.state.colWidth;
      colWidth[idx] = _style.tblColFmt[value].width;
      this.setState({
        colWidth: colWidth
      });
      this.getTable();
    };

    this.saveFmtBtn = () => {
      /**Press save button in format menu in table header */
      (0, _localInteraction.saveTableFormat)(this.props.docType, this.state.colWidth);
    };

    this.filterBtn = filter => {
      /**Change the filter: filter active,passive projects */
      this.setState({
        anchorFilterMenu: null
      });
      this.getTable(this.props.docType, filter);
    };

    this.changeSubtype = e => {
      this.setState({
        selectedSubtype: e.target.value
      });
      this.getTable(this.props.docType + '/' + e.target.value);
    };

    this.getTable = (docType = null, filterStatus = null) => {
      //TODO_P2 simplify: ontologyNode should only be gotten once and then stored, etc
      // initialize
      const docLabel = _Store.default.getDocTypeLabels()[this.props.docType];

      const subtypes = _Store.default.getSubtypes(this.props.docType);

      this.setState({
        docLabel: docLabel,
        subtypes: subtypes
      });
      /* get table column information: names, width*/

      const restartDocDetail = docType ? true : false;
      if (!docType) docType = this.props.docType + '/' + this.state.selectedSubtype;
      if (docType.endsWith('/')) docType = docType.slice(0, docType.length - 1);

      var colWidth = _Store.default.getConfiguration()['tableFormat'][docType];

      if (colWidth && '-default-' in colWidth) colWidth = colWidth['-default-'];else if (this.state.colWidth) colWidth = this.state.colWidth;else colWidth = [20, 20, 20, 20];
      this.setState({
        colWidth: colWidth
      });

      const ontologyNode = _Store.default.getOntologyNode(docType); //improve display: add symbols, don't display if zero-width column


      var columns = ontologyNode.map(item => {
        return item.name;
      }); //list of names

      columns = columns.filter(item => {
        return item;
      }); //filter out headings

      columns = columns.slice(0, this.state.maxTableColumns);
      columns = columns.map((item, idx) => {
        if (!colWidth[idx] || colWidth[idx] == 0) return null;
        if (colWidth[idx] < 0) //icons
          return {
            headerName: item[0] == '-' ? item.substring(1).toUpperCase() : item.toUpperCase(),
            field: 'v' + idx.toString(),
            width: 90,
            disableColumnMenu: true,
            renderCell: params => params.value ? /*#__PURE__*/_react.default.createElement(_icons.Done, null) : /*#__PURE__*/_react.default.createElement(_icons.Clear, null)
          };else //text, i.e. non-icons
          return {
            headerName: item[0] == '-' ? item.substring(1).toUpperCase() : item.toUpperCase(),
            field: 'v' + idx.toString(),
            width: Math.abs(colWidth[idx]) * _style.tblColFactor,
            disableColumnMenu: true
          };
      });
      columns = columns.filter(function (value) {
        return value != null;
      }); //get information from store and process it into format that table can plot

      var data = _Store.default.getTable(docType);

      if (!data) return;

      if (JSON.stringify(data[0]) == JSON.stringify({
        valid: false
      })) {
        //if data is not-full, flag data such that no table is shown and user is directed to 'Health check'
        this.setState({
          validData: false
        });
        return;
      } //if project filter for status


      if (this.props.docType == 'x0') {
        const pos = ontologyNode.map(function (e) {
          return e['name'];
        }).indexOf('status');
        const statusList = ontologyNode.filter(i => {
          return i['name'] == 'status';
        })[0]['list'];
        data = data.filter(i => {
          return !filterStatus || statusList.indexOf(i.value[pos]) <= statusList.indexOf(filterStatus);
        });
      } //convert table into array of objects


      data = data.map(item => {
        const obj = {
          id: item.id
        };
        item.value.map((subitem, i) => {
          if (Array.isArray(subitem)) obj['v' + i.toString()] = subitem.length == 0 ? false : true;else obj['v' + i.toString()] = subitem ? subitem : '';
        });
        return obj;
      });
      this.setState({
        columns: columns,
        data: data
      });
      if (restartDocDetail) Actions.restartDocDetail();
      if (!this.state.formatMenuItems) this.entriesFormatToolbar();
    };

    this.entriesFormatToolbar = () => {
      //menu to format table columns: change width
      var ontologyNode = _Store.default.getOntology()[this.props.docType];

      var formatMenuItems = ontologyNode.filter(i => {
        return i.name;
      }); //filter out heading first, such that idx corresponds to visible items

      formatMenuItems = formatMenuItems.slice(0, this.state.maxTableColumns);
      this.setState({
        formatMenuItems: formatMenuItems,
        ontologyNode: ontologyNode
      });
    };

    this.customToolbar = () => {
      var {
        formatMenuItems,
        ontologyNode
      } = this.state;
      if (formatMenuItems == null || ontologyNode == null) return /*#__PURE__*/_react.default.createElement("div", null);
      const maxItem = _style.tblColFmt.length - 1;
      formatMenuItems = formatMenuItems.map((i, idx) => {
        const iColWidth = this.state.colWidth[idx];

        var iValue = _style.tblColFmt.filter(i => {
          return i.width == iColWidth;
        })[0];

        iValue = iValue ? iValue.value : 0;
        return /*#__PURE__*/_react.default.createElement(_core.MenuItem, {
          key: i.name,
          id: i.name,
          className: (0, _styles.makeStyles)({
            root: {
              width: 300
            }
          })().root
        }, /*#__PURE__*/_react.default.createElement("div", {
          className: "container row mx-0 px-0 pt-4 pb-0"
        }, /*#__PURE__*/_react.default.createElement("div", {
          className: "col-md-auto pl-0"
        }, i.name[0] == '-' ? i.name.substring(1) : i.name), /*#__PURE__*/_react.default.createElement(_core.Slider, {
          defaultValue: iValue,
          step: 1,
          max: maxItem,
          marks: true,
          valueLabelDisplay: "auto",
          valueLabelFormat: this.valueLabelFormat,
          className: "col",
          key: `sldr${iValue}`,
          onChangeCommitted: (_, value) => this.changeSlider(idx, value)
        })));
      });
      formatMenuItems = formatMenuItems.concat([/*#__PURE__*/_react.default.createElement(_core.MenuItem, {
        key: "save",
        className: (0, _styles.makeStyles)({
          root: {
            width: 300
          }
        })().root,
        style: {
          display: 'flex'
        }
      }, /*#__PURE__*/_react.default.createElement(_core.Button, {
        onClick: () => this.saveFmtBtn(),
        style: {
          marginLeft: 'auto'
        },
        id: "saveFormat",
        size: "small",
        color: "primary"
      }, "Save"))]);

      if (this.props.docType == 'x0') {
        var filterMenuItems = ontologyNode.filter(i => {
          return i['name'] == 'status';
        })[0]['list'];
        filterMenuItems = filterMenuItems.map(item => {
          return /*#__PURE__*/_react.default.createElement(_core.MenuItem, {
            key: item,
            style: {
              display: 'flex'
            }
          }, /*#__PURE__*/_react.default.createElement(_core.Button, {
            onClick: () => this.filterBtn(item),
            size: "small",
            color: "primary"
          }, item));
        });
      } //main return function


      return /*#__PURE__*/_react.default.createElement(_dataGrid.GridToolbarContainer, null, /*#__PURE__*/_react.default.createElement(_core.Button, {
        onClick: () => Actions.showForm('new', null, null),
        id: "addDataBtn",
        startIcon: /*#__PURE__*/_react.default.createElement(_AddCircle.default, null),
        size: "small",
        color: "primary"
      }, "Add data"), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx-4"
      }, "|"), /*#__PURE__*/_react.default.createElement(_core.Button, {
        onClick: event => this.headerBtnOpen(event),
        startIcon: /*#__PURE__*/_react.default.createElement(_ViewArray.default, null),
        size: "small",
        id: "formatColsBtn",
        color: "primary"
      }, "Column width"), /*#__PURE__*/_react.default.createElement(_core.Menu, {
        anchorEl: this.state.anchorFormatMenu,
        keepMounted: true,
        open: Boolean(this.state.anchorFormatMenu),
        onClose: this.headerMenuClose
      }, formatMenuItems), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx-4"
      }, "|"), /*#__PURE__*/_react.default.createElement(_dataGrid.GridToolbarExport, null), this.props.docType == 'x0' && /*#__PURE__*/_react.default.createElement("div", {
        className: "mx-4"
      }, "|", /*#__PURE__*/_react.default.createElement(_core.Button, {
        onClick: event => this.headerBtnOpen(event),
        startIcon: /*#__PURE__*/_react.default.createElement(_FilterList.default, null),
        size: "small",
        id: "filterBtn",
        color: "primary",
        className: "mx-4"
      }, "Filter"), /*#__PURE__*/_react.default.createElement(_core.Menu, {
        anchorEl: this.state.anchorFilterMenu,
        keepMounted: true,
        open: Boolean(this.state.anchorFilterMenu),
        onClose: this.headerMenuClose
      }, filterMenuItems)));
    };

    this.state = {
      ontologyNode: null,
      colWidth: null,
      data: null,
      columns: null,
      selectID: null,
      docLabel: null,
      subtypes: null,
      selectedSubtype: '',
      anchorAddMenu: null,
      anchorFormatMenu: null,
      anchorFilterMenu: null,
      validData: true,
      maxTableColumns: _Store.default.getGUIConfig('maxTabColumns'),
      formatMenuItems: null
    };
  }

  componentDidMount() {
    _Store.default.on('changeTable', this.getTable);

    _Store.default.on('initStore', this.getTable);

    Actions.readTable(this.props.docType, true, true); //initialize automatic filling when loaded
  }

  componentWillUnmount() {
    _Store.default.removeListener('initStore', this.getTable);

    _Store.default.removeListener('changeTable', this.getTable);
  }
  /** Functions as class properties (immediately bound): react on user interactions **/


  /** the render method **/
  render() {
    const {
      data,
      columns,
      subtypes
    } = this.state;

    if (!this.state.validData) {
      return /*#__PURE__*/_react.default.createElement(_lab.Alert, {
        severity: "error"
      }, "Click 'Health check' on the configuration page to repair this page.");
    }

    if (!data || !columns || !subtypes) {
      //if still loading: wait... dont' show anything
      return /*#__PURE__*/_react.default.createElement("div", null, "\xA0\xA0Loading data...");
    }

    const menuItems = subtypes.map(i => {
      var value = i.split('/');
      value = value.slice(1, value.length).join('/');
      var label = value;
      if (value == '') label = 'default';
      return /*#__PURE__*/_react.default.createElement(_core.MenuItem, {
        value: value,
        key: value
      }, label);
    });
    return (
      /*#__PURE__*/
      //default case: data present, show add data button
      _react.default.createElement("div", {
        className: "col-sm-12",
        style: { ..._style.area,
          height: window.innerHeight - 38
        }
      }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("span", {
        style: _style.h1,
        className: "mr-5"
      }, this.state.docLabel), this.props.docType != 'x/project' && this.props.docType != 'measurement' && subtypes.length > 1 && /*#__PURE__*/_react.default.createElement("span", null, "SUBTYPE:", /*#__PURE__*/_react.default.createElement(_core.Select, {
        id: "selectSubtype",
        value: this.state.selectedSubtype,
        onChange: e => this.changeSubtype(e),
        fullWidth: true,
        className: "col-sm-5"
      }, menuItems))), data.length == 0 && /*#__PURE__*/_react.default.createElement("div", {
        className: "col-sm-12"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "row"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "m-2",
        style: {
          fontSize: 18
        }
      }, "Empty database:", /*#__PURE__*/_react.default.createElement(_core.Button, {
        onClick: () => Actions.showForm('new', null, null),
        id: "addDataBtn",
        startIcon: /*#__PURE__*/_react.default.createElement(_AddCircle.default, null)
      }, "Add data")))), data.length > 0 && /*#__PURE__*/_react.default.createElement("div", {
        className: "mt-2",
        style: {
          height: window.innerHeight - 68
        }
      }, /*#__PURE__*/_react.default.createElement(_dataGrid.DataGrid, {
        rows: data,
        columns: columns,
        density: "compact",
        autoPageSize: true,
        components: {
          Toolbar: this.customToolbar
        },
        onRowClick: this.toggleDetails
      })))
    );
  }

}

exports.default = DocTable;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlcmVyL2NvbXBvbmVudHMvRG9jVGFibGUuanMiXSwibmFtZXMiOlsiRG9jVGFibGUiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInRvZ2dsZURldGFpbHMiLCJkb2MiLCJzZXRTdGF0ZSIsInNlbGVjdElEIiwicm93IiwiaWQiLCJBY3Rpb25zIiwicmVhZERvYyIsImhlYWRlckJ0bk9wZW4iLCJldmVudCIsImN1cnJlbnRUYXJnZXQiLCJpbm5lclRleHQiLCJhbmNob3JGb3JtYXRNZW51IiwiYW5jaG9yRmlsdGVyTWVudSIsImNvbnNvbGUiLCJsb2ciLCJoZWFkZXJNZW51Q2xvc2UiLCJ2YWx1ZUxhYmVsRm9ybWF0IiwidmFsdWUiLCJ0YmxDb2xGbXQiLCJsYWJlbCIsImNoYW5nZVNsaWRlciIsImlkeCIsImNvbFdpZHRoIiwic3RhdGUiLCJ3aWR0aCIsImdldFRhYmxlIiwic2F2ZUZtdEJ0biIsInByb3BzIiwiZG9jVHlwZSIsImZpbHRlckJ0biIsImZpbHRlciIsImNoYW5nZVN1YnR5cGUiLCJlIiwic2VsZWN0ZWRTdWJ0eXBlIiwidGFyZ2V0IiwiZmlsdGVyU3RhdHVzIiwiZG9jTGFiZWwiLCJTdG9yZSIsImdldERvY1R5cGVMYWJlbHMiLCJzdWJ0eXBlcyIsImdldFN1YnR5cGVzIiwicmVzdGFydERvY0RldGFpbCIsImVuZHNXaXRoIiwic2xpY2UiLCJsZW5ndGgiLCJnZXRDb25maWd1cmF0aW9uIiwib250b2xvZ3lOb2RlIiwiZ2V0T250b2xvZ3lOb2RlIiwiY29sdW1ucyIsIm1hcCIsIml0ZW0iLCJuYW1lIiwibWF4VGFibGVDb2x1bW5zIiwiaGVhZGVyTmFtZSIsInN1YnN0cmluZyIsInRvVXBwZXJDYXNlIiwiZmllbGQiLCJ0b1N0cmluZyIsImRpc2FibGVDb2x1bW5NZW51IiwicmVuZGVyQ2VsbCIsInBhcmFtcyIsIk1hdGgiLCJhYnMiLCJ0YmxDb2xGYWN0b3IiLCJkYXRhIiwiSlNPTiIsInN0cmluZ2lmeSIsInZhbGlkIiwidmFsaWREYXRhIiwicG9zIiwiaW5kZXhPZiIsInN0YXR1c0xpc3QiLCJpIiwib2JqIiwic3ViaXRlbSIsIkFycmF5IiwiaXNBcnJheSIsImZvcm1hdE1lbnVJdGVtcyIsImVudHJpZXNGb3JtYXRUb29sYmFyIiwiZ2V0T250b2xvZ3kiLCJjdXN0b21Ub29sYmFyIiwibWF4SXRlbSIsImlDb2xXaWR0aCIsImlWYWx1ZSIsInJvb3QiLCJfIiwiY29uY2F0IiwiZGlzcGxheSIsIm1hcmdpbkxlZnQiLCJmaWx0ZXJNZW51SXRlbXMiLCJzaG93Rm9ybSIsIkJvb2xlYW4iLCJhbmNob3JBZGRNZW51IiwiZ2V0R1VJQ29uZmlnIiwiY29tcG9uZW50RGlkTW91bnQiLCJvbiIsInJlYWRUYWJsZSIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlTGlzdGVuZXIiLCJyZW5kZXIiLCJtZW51SXRlbXMiLCJzcGxpdCIsImpvaW4iLCJhcmVhIiwiaGVpZ2h0Iiwid2luZG93IiwiaW5uZXJIZWlnaHQiLCJoMSIsImZvbnRTaXplIiwiVG9vbGJhciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQWRBO0FBQ0E7QUFDdUU7QUFDMEI7QUFDMUI7QUFDQTtBQUNBO0FBQ29CO0FBQ1c7QUFDL0I7QUFPeEQsTUFBTUEsUUFBTixTQUF1QkMsZ0JBQXZCLENBQWlDO0FBQzlDQyxFQUFBQSxXQUFXLEdBQUc7QUFDWjs7QUFEWSxTQThCZEMsYUE5QmMsR0E4QkdDLEdBQUQsSUFBUztBQUN2QjtBQUNBLFdBQUtDLFFBQUwsQ0FBYztBQUFDQyxRQUFBQSxRQUFRLEVBQUVGLEdBQUcsQ0FBQ0csR0FBSixDQUFRQztBQUFuQixPQUFkO0FBQ0FDLE1BQUFBLE9BQU8sQ0FBQ0MsT0FBUixDQUFnQk4sR0FBRyxDQUFDRyxHQUFKLENBQVFDLEVBQXhCO0FBQ0QsS0FsQ2E7O0FBQUEsU0FvQ2RHLGFB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QyxNQUFmO0FBQXNCLFFBQUEsS0FBSyxFQUFFO0FBQUM0RCxVQUFBQSxNQUFNLEVBQUNDLE1BQU0sQ0FBQ0MsV0FBUCxHQUFtQjtBQUEzQjtBQUE3QixzQkFDRSw2QkFBQyxrQkFBRDtBQUFVLFFBQUEsSUFBSSxFQUFFMUMsSUFBaEI7QUFBc0IsUUFBQSxPQUFPLEVBQUVoQixPQUEvQjtBQUF3QyxRQUFBLE9BQU8sRUFBQyxTQUFoRDtBQUEwRCxRQUFBLFlBQVksTUFBdEU7QUFDRSxRQUFBLFVBQVUsRUFBRTtBQUFDNkQsVUFBQUEsT0FBTyxFQUFFLEtBQUs3QjtBQUFmLFNBRGQ7QUFDNkMsUUFBQSxVQUFVLEVBQUUsS0FBS2pGO0FBRDlELFFBREYsQ0E5Qko7QUFERjtBQXFDRDs7QUE1UzZDIiwic291cmNlc0NvbnRlbnQiOlsiLyogVGFidWxhciBvdmVydmlldyBvbiB0aGUgbGVmdCBzaWRlXG4qL1xuaW1wb3J0IFJlYWN0LCB7IENvbXBvbmVudCB9IGZyb20gJ3JlYWN0JzsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgeyBCdXR0b24sIE1lbnUsIE1lbnVJdGVtLCBTbGlkZXIsIFNlbGVjdCwgVG9vbHRpcCwgSWNvbkJ1dHRvbiB9IGZyb20gJ0BtYXRlcmlhbC11aS9jb3JlJzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IEFkZENpcmNsZUljb24gZnJvbSAnQG1hdGVyaWFsLXVpL2ljb25zL0FkZENpcmNsZSc7ICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgVmlld0FycmF5IGZyb20gJ0BtYXRlcmlhbC11aS9pY29ucy9WaWV3QXJyYXknOyAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCBGaWx0ZXJMaXN0IGZyb20gJ0BtYXRlcmlhbC11aS9pY29ucy9GaWx0ZXJMaXN0JzsgICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IHsgRGF0YUdyaWQsIEdyaWRUb29sYmFyQ29udGFpbmVyLCBHcmlkVG9vbGJhckV4cG9ydH0gZnJvbSAnQG1hdGVyaWFsLXVpL2RhdGEtZ3JpZCc7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCB7IERvbmUsIENsZWFyLCBGb3JtYXRMaXN0TnVtYmVyZWRSdGxPdXRsaW5lZCB9IGZyb20gJ0BtYXRlcmlhbC11aS9pY29ucyc7ICAgICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCB7IEFsZXJ0IH0gZnJvbSAnQG1hdGVyaWFsLXVpL2xhYic7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IHsgbWFrZVN0eWxlcyB9IGZyb20gJ0BtYXRlcmlhbC11aS9jb3JlL3N0eWxlcyc7XG5pbXBvcnQgKiBhcyBBY3Rpb25zIGZyb20gJy4uL0FjdGlvbnMnO1xuaW1wb3J0IFN0b3JlIGZyb20gJy4uL1N0b3JlJztcbmltcG9ydCB7IHNhdmVUYWJsZUZvcm1hdCB9IGZyb20gJy4uL2xvY2FsSW50ZXJhY3Rpb24nO1xuaW1wb3J0IHsgaDEsIGFyZWEsIHRibENvbEZtdCwgdGJsQ29sRmFjdG9yIH0gZnJvbSAnLi4vc3R5bGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEb2NUYWJsZSBleHRlbmRzIENvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG9udG9sb2d5Tm9kZTogbnVsbCxcbiAgICAgIGNvbFdpZHRoOiBudWxsLFxuICAgICAgZGF0YTogbnVsbCxcbiAgICAgIGNvbHVtbnM6IG51bGwsXG4gICAgICBzZWxlY3RJRDogbnVsbCxcbiAgICAgIGRvY0xhYmVsOiBudWxsLFxuICAgICAgc3VidHlwZXM6IG51bGwsXG4gICAgICBzZWxlY3RlZFN1YnR5cGU6ICcnLFxuICAgICAgYW5jaG9yQWRkTWVudTogbnVsbCxcbiAgICAgIGFuY2hvckZvcm1hdE1lbnU6IG51bGwsXG4gICAgICBhbmNob3JGaWx0ZXJNZW51OiBudWxsLFxuICAgICAgdmFsaWREYXRhOiB0cnVlLFxuICAgICAgbWF4VGFibGVDb2x1bW5zOiBTdG9yZS5nZXRHVUlDb25maWcoJ21heFRhYkNvbHVtbnMnKSxcbiAgICAgIGZvcm1hdE1lbnVJdGVtczogbnVsbFxuICAgIH07XG4gIH1cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgU3RvcmUub24oJ2NoYW5nZVRhYmxlJywgdGhpcy5nZXRUYWJsZSk7XG4gICAgU3RvcmUub24oJ2luaXRTdG9yZScsIHRoaXMuZ2V0VGFibGUpO1xuICAgIEFjdGlvbnMucmVhZFRhYmxlKHRoaXMucHJvcHMuZG9jVHlwZSwgdHJ1ZSwgdHJ1ZSk7ICAvL2luaXRpYWxpemUgYXV0b21hdGljIGZpbGxpbmcgd2hlbiBsb2FkZWRcbiAgfVxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBTdG9yZS5yZW1vdmVMaXN0ZW5lcignaW5pdFN0b3JlJywgICB0aGlzLmdldFRhYmxlKTtcbiAgICBTdG9yZS5yZW1vdmVMaXN0ZW5lcignY2hhbmdlVGFibGUnLCB0aGlzLmdldFRhYmxlKTtcbiAgfVxuXG4gIC8qKiBGdW5jdGlvbnMgYXMgY2xhc3MgcHJvcGVydGllcyAoaW1tZWRpYXRlbHkgYm91bmQpOiByZWFjdCBvbiB1c2VyIGludGVyYWN0aW9ucyAqKi9cbiAgdG9nZ2xlRGV0YWlscyA9IChkb2MpID0+IHtcbiAgICAvKiBUcmlnZ2VyIHRoZSBkb2Mgd2l0aCB0aGUgaWQgdG8gYmUgc2hvd24gKi9cbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RJRDogZG9jLnJvdy5pZH0pO1xuICAgIEFjdGlvbnMucmVhZERvYyhkb2Mucm93LmlkKTtcbiAgfVxuXG4gIGhlYWRlckJ0bk9wZW49KGV2ZW50KT0+e1xuICAgIC8qKnByZXNzIGJ1dHRvbiBpbiB0aGUgdGFibGUgaGVhZGVyIGFuZCBvcGVuIGEgbWVudSovXG4gICAgaWYgKGV2ZW50LmN1cnJlbnRUYXJnZXQuaW5uZXJUZXh0PT0nQ09MVU1OIFdJRFRIJylcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2FuY2hvckZvcm1hdE1lbnU6IGV2ZW50LmN1cnJlbnRUYXJnZXR9KTtcbiAgICBlbHNlIGlmIChldmVudC5jdXJyZW50VGFyZ2V0LmlubmVyVGV4dD09J0ZJTFRFUicpXG4gICAgICB0aGlzLnNldFN0YXRlKHthbmNob3JGaWx0ZXJNZW51OiBldmVudC5jdXJyZW50VGFyZ2V0fSk7XG4gICAgZWxzZVxuICAgICAgY29uc29sZS5sb2coJ2hlYWRlckJ0bk9wZW46IGV2ZW50IGRvZXMgbm90IGhhdmUgYSBjYXNlJyk7XG4gIH1cbiAgaGVhZGVyTWVudUNsb3NlPSgpPT57XG4gICAgLyoqY2xvc2UgdGhlIG1lbnUgaW4gdGhlIHRhYmxlIGhlYWRlciAqL1xuICAgIHRoaXMuc2V0U3RhdGUoe2FuY2hvckZvcm1hdE1lbnU6IG51bGx9KTtcbiAgfVxuICB2YWx1ZUxhYmVsRm9ybWF0PSh2YWx1ZSk9PntcbiAgICAvKipGcm9tIGluZGV4L3ZhbHVlIGNyZWF0ZSBsYWJlbCByZWFkIGJ5IGh1bWFuKi9cbiAgICByZXR1cm4gdGJsQ29sRm10W3ZhbHVlXS5sYWJlbDtcbiAgfVxuXG4gIGNoYW5nZVNsaWRlcj0oaWR4LHZhbHVlKT0+e1xuICAgIC8qKkFmdGVyIHNsaWRlciBjaGFuZ2VkLCBzYXZlIG5ldyBzdGF0ZSBpbiB0aGlzIHN0YXRlICovXG4gICAgdmFyIGNvbFdpZHRoID0gdGhpcy5zdGF0ZS5jb2xXaWR0aDtcbiAgICBjb2xXaWR0aFtpZHhdPXRibENvbEZtdFt2YWx1ZV0ud2lkdGg7XG4gICAgdGhpcy5zZXRTdGF0ZSh7Y29sV2lkdGg6Y29sV2lkdGh9KTtcbiAgICB0aGlzLmdldFRhYmxlKCk7XG4gIH1cblxuICBzYXZlRm10QnRuPSgpPT57XG4gICAgLyoqUHJlc3Mgc2F2ZSBidXR0b24gaW4gZm9ybWF0IG1lbnUgaW4gdGFibGUgaGVhZGVyICovXG4gICAgc2F2ZVRhYmxlRm9ybWF0KHRoaXMucHJvcHMuZG9jVHlwZSx0aGlzLnN0YXRlLmNvbFdpZHRoKTtcbiAgfVxuICBmaWx0ZXJCdG49KGZpbHRlcik9PntcbiAgICAvKipDaGFuZ2UgdGhlIGZpbHRlcjogZmlsdGVyIGFjdGl2ZSxwYXNzaXZlIHByb2plY3RzICovXG4gICAgdGhpcy5zZXRTdGF0ZSh7YW5jaG9yRmlsdGVyTWVudTogbnVsbH0pO1xuICAgIHRoaXMuZ2V0VGFibGUodGhpcy5wcm9wcy5kb2NUeXBlLCBmaWx0ZXIpO1xuICB9XG5cbiAgY2hhbmdlU3VidHlwZT0oZSk9PntcbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZFN1YnR5cGU6ZS50YXJnZXQudmFsdWV9KTtcbiAgICB0aGlzLmdldFRhYmxlKHRoaXMucHJvcHMuZG9jVHlwZSsnLycrZS50YXJnZXQudmFsdWUpO1xuICB9XG5cbiAgZ2V0VGFibGU9KCBkb2NUeXBlPW51bGwsIGZpbHRlclN0YXR1cz1udWxsICk9PntcbiAgICAvL1RPRE9fUDIgc2ltcGxpZnk6IG9udG9sb2d5Tm9kZSBzaG91bGQgb25seSBiZSBnb3R0ZW4gb25jZSBhbmQgdGhlbiBzdG9yZWQsIGV0Y1xuICAgIC8vIGluaXRpYWxpemVcbiAgICBjb25zdCBkb2NMYWJlbCA9IFN0b3JlLmdldERvY1R5cGVMYWJlbHMoKVt0aGlzLnByb3BzLmRvY1R5cGVdO1xuICAgIGNvbnN0IHN1YnR5cGVzID0gU3RvcmUuZ2V0U3VidHlwZXModGhpcy5wcm9wcy5kb2NUeXBlKTtcbiAgICB0aGlzLnNldFN0YXRlKHtkb2NMYWJlbDogZG9jTGFiZWwsIHN1YnR5cGVzOiBzdWJ0eXBlc30pO1xuICAgIC8qIGdldCB0YWJsZSBjb2x1bW4gaW5mb3JtYXRpb246IG5hbWVzLCB3aWR0aCovXG4gICAgY29uc3QgcmVzdGFydERvY0RldGFpbCA9IChkb2NUeXBlKSA/IHRydWUgOiBmYWxzZTtcbiAgICBpZiAoIWRvY1R5cGUpXG4gICAgICBkb2NUeXBlID0gdGhpcy5wcm9wcy5kb2NUeXBlKycvJyt0aGlzLnN0YXRlLnNlbGVjdGVkU3VidHlwZTtcbiAgICBpZiAoZG9jVHlwZS5lbmRzV2l0aCgnLycpKVxuICAgICAgZG9jVHlwZSA9IGRvY1R5cGUuc2xpY2UoMCxkb2NUeXBlLmxlbmd0aC0xKTtcbiAgICB2YXIgY29sV2lkdGggPSBTdG9yZS5nZXRDb25maWd1cmF0aW9uKClbJ3RhYmxlRm9ybWF0J11bZG9jVHlwZV07XG4gICAgaWYgKGNvbFdpZHRoICYmICctZGVmYXVsdC0nIGluIGNvbFdpZHRoKVxuICAgICAgY29sV2lkdGggPSBjb2xXaWR0aFsnLWRlZmF1bHQtJ107XG4gICAgZWxzZSBpZiAodGhpcy5zdGF0ZS5jb2xXaWR0aClcbiAgICAgIGNvbFdpZHRoID0gdGhpcy5zdGF0ZS5jb2xXaWR0aDtcbiAgICBlbHNlXG4gICAgICBjb2xXaWR0aCA9IFsyMCwyMCwyMCwyMF07XG4gICAgdGhpcy5zZXRTdGF0ZSh7Y29sV2lkdGg6IGNvbFdpZHRofSk7XG4gICAgY29uc3Qgb250b2xvZ3lOb2RlID0gU3RvcmUuZ2V0T250b2xvZ3lOb2RlKGRvY1R5cGUpO1xuICAgIC8vaW1wcm92ZSBkaXNwbGF5OiBhZGQgc3ltYm9scywgZG9uJ3QgZGlzcGxheSBpZiB6ZXJvLXdpZHRoIGNvbHVtblxuICAgIHZhciBjb2x1bW5zID0gb250b2xvZ3lOb2RlLm1hcCgoaXRlbSk9PntyZXR1cm4gaXRlbS5uYW1lO30pOyAgLy9saXN0IG9mIG5hbWVzXG4gICAgY29sdW1ucyA9IGNvbHVtbnMuZmlsdGVyKGl0ZW09PntyZXR1cm4gKGl0ZW0pO30pOyAgLy9maWx0ZXIgb3V0IGhlYWRpbmdzXG4gICAgY29sdW1ucyA9IGNvbHVtbnMuc2xpY2UoMCx0aGlzLnN0YXRlLm1heFRhYmxlQ29sdW1ucyk7XG4gICAgY29sdW1ucyA9IGNvbHVtbnMubWFwKChpdGVtLGlkeCk9PntcbiAgICAgIGlmICghY29sV2lkdGhbaWR4XSB8fCBjb2xXaWR0aFtpZHhdPT0wKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIGlmIChjb2xXaWR0aFtpZHhdPDApIC8vaWNvbnNcbiAgICAgICAgcmV0dXJuIHtoZWFkZXJOYW1lOihpdGVtWzBdPT0nLScpID8gaXRlbS5zdWJzdHJpbmcoMSkudG9VcHBlckNhc2UoKSA6IGl0ZW0udG9VcHBlckNhc2UoKSxcbiAgICAgICAgICBmaWVsZDondicraWR4LnRvU3RyaW5nKCksXG4gICAgICAgICAgd2lkdGg6OTAsXG4gICAgICAgICAgZGlzYWJsZUNvbHVtbk1lbnU6dHJ1ZSxcbiAgICAgICAgICByZW5kZXJDZWxsOiAocGFyYW1zKT0+KHBhcmFtcy52YWx1ZT88RG9uZSAvPjo8Q2xlYXIgLz4pXG4gICAgICAgIH07XG4gICAgICBlbHNlICAgICAgLy90ZXh0LCBpLmUuIG5vbi1pY29uc1xuICAgICAgICByZXR1cm4ge2hlYWRlck5hbWU6KGl0ZW1bMF09PSctJykgPyBpdGVtLnN1YnN0cmluZygxKS50b1VwcGVyQ2FzZSgpIDogaXRlbS50b1VwcGVyQ2FzZSgpLFxuICAgICAgICAgIGZpZWxkOid2JytpZHgudG9TdHJpbmcoKSxcbiAgICAgICAgICB3aWR0aDpNYXRoLmFicyhjb2xXaWR0aFtpZHhdKSp0YmxDb2xGYWN0b3IsXG4gICAgICAgICAgZGlzYWJsZUNvbHVtbk1lbnU6dHJ1ZVxuICAgICAgICB9O1xuICAgIH0pO1xuICAgIGNvbHVtbnMgPSBjb2x1bW5zLmZpbHRlcihmdW5jdGlvbih2YWx1ZSl7cmV0dXJuIHZhbHVlIT1udWxsO30pO1xuICAgIC8vZ2V0IGluZm9ybWF0aW9uIGZyb20gc3RvcmUgYW5kIHByb2Nlc3MgaXQgaW50byBmb3JtYXQgdGhhdCB0YWJsZSBjYW4gcGxvdFxuICAgIHZhciBkYXRhID0gU3RvcmUuZ2V0VGFibGUoZG9jVHlwZSk7XG4gICAgaWYgKCFkYXRhKVxuICAgICAgcmV0dXJuO1xuICAgIGlmIChKU09OLnN0cmluZ2lmeShkYXRhWzBdKT09SlNPTi5zdHJpbmdpZnkoe3ZhbGlkOmZhbHNlfSkpIHtcbiAgICAgIC8vaWYgZGF0YSBpcyBub3QtZnVsbCwgZmxhZyBkYXRhIHN1Y2ggdGhhdCBubyB0YWJsZSBpcyBzaG93biBhbmQgdXNlciBpcyBkaXJlY3RlZCB0byAnSGVhbHRoIGNoZWNrJ1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7dmFsaWREYXRhOiBmYWxzZX0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvL2lmIHByb2plY3QgZmlsdGVyIGZvciBzdGF0dXNcbiAgICBpZiAodGhpcy5wcm9wcy5kb2NUeXBlPT0neDAnKSB7XG4gICAgICBjb25zdCBwb3MgPSBvbnRvbG9neU5vZGUubWFwKGZ1bmN0aW9uKGUpIHtyZXR1cm4gZVsnbmFtZSddOyB9KS5pbmRleE9mKCdzdGF0dXMnKTtcbiAgICAgIGNvbnN0IHN0YXR1c0xpc3QgPSBvbnRvbG9neU5vZGUuZmlsdGVyKGk9PntyZXR1cm4gaVsnbmFtZSddPT0nc3RhdHVzJzt9KVswXVsnbGlzdCddO1xuICAgICAgZGF0YSA9IGRhdGEuZmlsdGVyKGk9PntcbiAgICAgICAgcmV0dXJuICghZmlsdGVyU3RhdHVzIHx8IHN0YXR1c0xpc3QuaW5kZXhPZihpLnZhbHVlW3Bvc10pPD1zdGF0dXNMaXN0LmluZGV4T2YoZmlsdGVyU3RhdHVzKSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLy9jb252ZXJ0IHRhYmxlIGludG8gYXJyYXkgb2Ygb2JqZWN0c1xuICAgIGRhdGEgPSBkYXRhLm1hcChpdGVtPT57XG4gICAgICBjb25zdCBvYmogPSB7aWQ6aXRlbS5pZH07XG4gICAgICBpdGVtLnZhbHVlLm1hcCgoc3ViaXRlbSxpKT0+e1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShzdWJpdGVtKSlcbiAgICAgICAgICBvYmpbJ3YnK2kudG9TdHJpbmcoKV0gID0gc3ViaXRlbS5sZW5ndGg9PTAgPyBmYWxzZSA6IHRydWU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBvYmpbJ3YnK2kudG9TdHJpbmcoKV0gPSBzdWJpdGVtID8gc3ViaXRlbSA6ICcnO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH0pO1xuICAgIHRoaXMuc2V0U3RhdGUoe2NvbHVtbnM6Y29sdW1ucywgZGF0YTpkYXRhfSk7XG4gICAgaWYgKHJlc3RhcnREb2NEZXRhaWwpXG4gICAgICBBY3Rpb25zLnJlc3RhcnREb2NEZXRhaWwoKTtcbiAgICBpZiAoIXRoaXMuc3RhdGUuZm9ybWF0TWVudUl0ZW1zKVxuICAgICAgdGhpcy5lbnRyaWVzRm9ybWF0VG9vbGJhcigpO1xuICB9XG5cbiAgZW50cmllc0Zvcm1hdFRvb2xiYXIgPSgpPT57XG4gICAgLy9tZW51IHRvIGZvcm1hdCB0YWJsZSBjb2x1bW5zOiBjaGFuZ2Ugd2lkdGhcbiAgICB2YXIgb250b2xvZ3lOb2RlID0gU3RvcmUuZ2V0T250b2xvZ3koKVt0aGlzLnByb3BzLmRvY1R5cGVdO1xuICAgIHZhciBmb3JtYXRNZW51SXRlbXMgPSBvbnRvbG9neU5vZGUuZmlsdGVyKChpKT0+e3JldHVybiBpLm5hbWU7fSk7ICAvL2ZpbHRlciBvdXQgaGVhZGluZyBmaXJzdCwgc3VjaCB0aGF0IGlkeCBjb3JyZXNwb25kcyB0byB2aXNpYmxlIGl0ZW1zXG4gICAgZm9ybWF0TWVudUl0ZW1zID0gZm9ybWF0TWVudUl0ZW1zLnNsaWNlKDAsdGhpcy5zdGF0ZS5tYXhUYWJsZUNvbHVtbnMpO1xuICAgIHRoaXMuc2V0U3RhdGUoe2Zvcm1hdE1lbnVJdGVtczpmb3JtYXRNZW51SXRlbXMsIG9udG9sb2d5Tm9kZTpvbnRvbG9neU5vZGV9KTtcbiAgfVxuXG5cbiAgLyoqIGNyZWF0ZSBodG1sLXN0cnVjdHVyZTsgYWxsIHNob3VsZCByZXR1cm4gYXQgbGVhc3QgPGRpdj48L2Rpdj4gKiovXG4gIGN1c3RvbVRvb2xiYXI9KCk9PntcbiAgICB2YXIgeyBmb3JtYXRNZW51SXRlbXMsIG9udG9sb2d5Tm9kZSB9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAoZm9ybWF0TWVudUl0ZW1zID09IG51bGwgfHwgb250b2xvZ3lOb2RlPT1udWxsKVxuICAgICAgcmV0dXJuIDxkaXY+PC9kaXY+O1xuICAgIGNvbnN0IG1heEl0ZW0gPSB0YmxDb2xGbXQubGVuZ3RoLTE7XG4gICAgZm9ybWF0TWVudUl0ZW1zID0gZm9ybWF0TWVudUl0ZW1zLm1hcCgoaSxpZHgpPT57XG4gICAgICBjb25zdCBpQ29sV2lkdGggPSB0aGlzLnN0YXRlLmNvbFdpZHRoW2lkeF07XG4gICAgICB2YXIgaVZhbHVlICAgID0gdGJsQ29sRm10LmZpbHRlcigoaSk9PntyZXR1cm4gaS53aWR0aD09aUNvbFdpZHRoO30pWzBdO1xuICAgICAgaVZhbHVlID0gKGlWYWx1ZSkgPyBpVmFsdWUudmFsdWUgOiAwO1xuICAgICAgcmV0dXJuICg8TWVudUl0ZW0ga2V5PXtpLm5hbWV9IGlkPXtpLm5hbWV9IGNsYXNzTmFtZT17bWFrZVN0eWxlcyh7cm9vdDp7d2lkdGg6MzAwfX0pKCkucm9vdH0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb250YWluZXIgcm93IG14LTAgcHgtMCBwdC00IHBiLTAnPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wtbWQtYXV0byBwbC0wJz57KGkubmFtZVswXT09Jy0nKSA/IGkubmFtZS5zdWJzdHJpbmcoMSkgOiBpLm5hbWV9PC9kaXY+XG4gICAgICAgICAgPFNsaWRlciBkZWZhdWx0VmFsdWU9e2lWYWx1ZX0gc3RlcD17MX0gbWF4PXttYXhJdGVtfSBtYXJrcyB2YWx1ZUxhYmVsRGlzcGxheT1cImF1dG9cIlxuICAgICAgICAgICAgdmFsdWVMYWJlbEZvcm1hdD17dGhpcy52YWx1ZUxhYmVsRm9ybWF0fSBjbGFzc05hbWU9J2NvbCcga2V5PXtgc2xkciR7aVZhbHVlfWB9XG4gICAgICAgICAgICBvbkNoYW5nZUNvbW1pdHRlZD17KF8sdmFsdWUpPT50aGlzLmNoYW5nZVNsaWRlcihpZHgsdmFsdWUpfS8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9NZW51SXRlbT4pO1xuICAgIH0pO1xuICAgIGZvcm1hdE1lbnVJdGVtcyA9IGZvcm1hdE1lbnVJdGVtcy5jb25jYXQoW1xuICAgICAgPE1lbnVJdGVtIGtleT0nc2F2ZScgY2xhc3NOYW1lPXttYWtlU3R5bGVzKHtyb290Ont3aWR0aDozMDB9fSkoKS5yb290fSBzdHlsZT17e2Rpc3BsYXk6J2ZsZXgnfX0+XG4gICAgICAgIDxCdXR0b24gb25DbGljaz17KCk9PnRoaXMuc2F2ZUZtdEJ0bigpfSBzdHlsZT17e21hcmdpbkxlZnQ6J2F1dG8nfX0gaWQ9J3NhdmVGb3JtYXQnXG4gICAgICAgICAgc2l6ZT0nc21hbGwnIGNvbG9yPSdwcmltYXJ5Jz5cbiAgICAgICAgICBTYXZlXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9NZW51SXRlbT5cbiAgICBdKTtcbiAgICBpZiAodGhpcy5wcm9wcy5kb2NUeXBlPT0neDAnKSB7XG4gICAgICB2YXIgZmlsdGVyTWVudUl0ZW1zID0gb250b2xvZ3lOb2RlLmZpbHRlcihpPT57cmV0dXJuIGlbJ25hbWUnXT09J3N0YXR1cyc7fSlbMF1bJ2xpc3QnXTtcbiAgICAgIGZpbHRlck1lbnVJdGVtcyA9IGZpbHRlck1lbnVJdGVtcy5tYXAoaXRlbT0+e1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxNZW51SXRlbSBrZXk9e2l0ZW19IHN0eWxlPXt7ZGlzcGxheTonZmxleCd9fT5cbiAgICAgICAgICAgIDxCdXR0b24gb25DbGljaz17KCk9PnRoaXMuZmlsdGVyQnRuKGl0ZW0pfSBzaXplPSdzbWFsbCcgY29sb3I9J3ByaW1hcnknPlxuICAgICAgICAgICAgICB7aXRlbX1cbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvTWVudUl0ZW0+KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvL21haW4gcmV0dXJuIGZ1bmN0aW9uXG4gICAgcmV0dXJuIChcbiAgICAgIDxHcmlkVG9vbGJhckNvbnRhaW5lcj5cbiAgICAgICAgey8qQWRkIGRhdGEgYnV0dG9uIGFuZCBtZW51ICovfVxuICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9eygpPT5BY3Rpb25zLnNob3dGb3JtKCduZXcnLG51bGwsbnVsbCl9XG4gICAgICAgICAgaWQ9J2FkZERhdGFCdG4nIHN0YXJ0SWNvbj17PEFkZENpcmNsZUljb24gLz59IHNpemU9J3NtYWxsJyBjb2xvcj0ncHJpbWFyeSc+XG4gICAgICAgICAgQWRkIGRhdGFcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteC00Jz58PC9kaXY+XG5cbiAgICAgICAgey8qRm9ybWF0IGNvbHVtbnMgYnV0dG9uIGFuZCBtZW51ICovfVxuICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9eyhldmVudCk9PnRoaXMuaGVhZGVyQnRuT3BlbihldmVudCl9IHN0YXJ0SWNvbj17PFZpZXdBcnJheSAvPn0gc2l6ZT0nc21hbGwnXG4gICAgICAgICAgaWQ9J2Zvcm1hdENvbHNCdG4nIGNvbG9yPSdwcmltYXJ5Jz5cbiAgICAgICAgICBDb2x1bW4gd2lkdGhcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDxNZW51IGFuY2hvckVsPXt0aGlzLnN0YXRlLmFuY2hvckZvcm1hdE1lbnV9IGtlZXBNb3VudGVkXG4gICAgICAgICAgb3Blbj17Qm9vbGVhbih0aGlzLnN0YXRlLmFuY2hvckZvcm1hdE1lbnUpfSBvbkNsb3NlPXt0aGlzLmhlYWRlck1lbnVDbG9zZX0gPlxuICAgICAgICAgIHtmb3JtYXRNZW51SXRlbXN9XG4gICAgICAgIDwvTWVudT5cblxuICAgICAgICB7Lyo8R3JpZEZpbHRlclRvb2xiYXJCdXR0b24gLz4qL31cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J214LTQnPnw8L2Rpdj5cbiAgICAgICAgPEdyaWRUb29sYmFyRXhwb3J0IC8+XG5cbiAgICAgICAgey8qPEJ1dHRvbiB0byBmaWx0ZXIgdGhlIHZpZXcgZm9yIHByb2plY3QgLz4qL31cbiAgICAgICAgeyB0aGlzLnByb3BzLmRvY1R5cGU9PSd4MCcgJiYgIDxkaXYgY2xhc3NOYW1lPSdteC00Jz58XG4gICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoZXZlbnQpPT50aGlzLmhlYWRlckJ0bk9wZW4oZXZlbnQpfSBzdGFydEljb249ezxGaWx0ZXJMaXN0IC8+fSBzaXplPSdzbWFsbCdcbiAgICAgICAgICAgIGlkPSdmaWx0ZXJCdG4nIGNvbG9yPSdwcmltYXJ5JyBjbGFzc05hbWU9J214LTQnPlxuICAgICAgICAgICAgRmlsdGVyXG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPE1lbnUgYW5jaG9yRWw9e3RoaXMuc3RhdGUuYW5jaG9yRmlsdGVyTWVudX0ga2VlcE1vdW50ZWRcbiAgICAgICAgICAgIG9wZW49e0Jvb2xlYW4odGhpcy5zdGF0ZS5hbmNob3JGaWx0ZXJNZW51KX0gb25DbG9zZT17dGhpcy5oZWFkZXJNZW51Q2xvc2V9ID5cbiAgICAgICAgICAgIHtmaWx0ZXJNZW51SXRlbXN9XG4gICAgICAgICAgPC9NZW51PlxuICAgICAgICA8L2Rpdj59XG4gICAgICA8L0dyaWRUb29sYmFyQ29udGFpbmVyPlxuICAgICk7XG4gIH1cblxuXG4gIC8qKiB0aGUgcmVuZGVyIG1ldGhvZCAqKi9cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHsgZGF0YSwgY29sdW1ucywgc3VidHlwZXMgfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKCF0aGlzLnN0YXRlLnZhbGlkRGF0YSkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPEFsZXJ0IHNldmVyaXR5PSdlcnJvcic+XG4gICAgICAgIENsaWNrICdIZWFsdGggY2hlY2snIG9uIHRoZSBjb25maWd1cmF0aW9uIHBhZ2UgdG8gcmVwYWlyIHRoaXMgcGFnZS5cbiAgICAgICAgPC9BbGVydD4pO1xuICAgIH1cbiAgICBpZiAoIWRhdGEgfHwgIWNvbHVtbnMgfHwgIXN1YnR5cGVzKSB7ICAgICAgICAgIC8vaWYgc3RpbGwgbG9hZGluZzogd2FpdC4uLiBkb250JyBzaG93IGFueXRoaW5nXG4gICAgICByZXR1cm4gKDxkaXY+Jm5ic3A7Jm5ic3A7TG9hZGluZyBkYXRhLi4uPC9kaXY+KTtcbiAgICB9XG4gICAgY29uc3QgbWVudUl0ZW1zID0gc3VidHlwZXMubWFwKChpKT0+e1xuICAgICAgdmFyIHZhbHVlID0gaS5zcGxpdCgnLycpO1xuICAgICAgdmFsdWUgPSB2YWx1ZS5zbGljZSgxLHZhbHVlLmxlbmd0aCkuam9pbignLycpO1xuICAgICAgdmFyIGxhYmVsID0gdmFsdWU7XG4gICAgICBpZiAodmFsdWU9PScnKVxuICAgICAgICBsYWJlbCA9ICdkZWZhdWx0JztcbiAgICAgIHJldHVybiA8TWVudUl0ZW0gdmFsdWU9e3ZhbHVlfSBrZXk9e3ZhbHVlfT57bGFiZWx9PC9NZW51SXRlbT47XG4gICAgfSk7XG4gICAgcmV0dXJuICggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2RlZmF1bHQgY2FzZTogZGF0YSBwcmVzZW50LCBzaG93IGFkZCBkYXRhIGJ1dHRvblxuICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS0xMicgc3R5bGU9e3suLi5hcmVhLCBoZWlnaHQ6d2luZG93LmlubmVySGVpZ2h0LTM4fX0+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPHNwYW4gc3R5bGU9e2gxfSBjbGFzc05hbWU9J21yLTUnPnt0aGlzLnN0YXRlLmRvY0xhYmVsfTwvc3Bhbj5cbiAgICAgICAgICB7KHRoaXMucHJvcHMuZG9jVHlwZSE9J3gvcHJvamVjdCcgJiYgdGhpcy5wcm9wcy5kb2NUeXBlIT0nbWVhc3VyZW1lbnQnICYmIHN1YnR5cGVzLmxlbmd0aD4xKSAmJlxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgU1VCVFlQRTpcbiAgICAgICAgICAgIDxTZWxlY3QgaWQ9XCJzZWxlY3RTdWJ0eXBlXCIgdmFsdWU9e3RoaXMuc3RhdGUuc2VsZWN0ZWRTdWJ0eXBlfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17ZT0+dGhpcy5jaGFuZ2VTdWJ0eXBlKGUpfSBmdWxsV2lkdGggY2xhc3NOYW1lPSdjb2wtc20tNSc+XG4gICAgICAgICAgICAgIHttZW51SXRlbXN9XG4gICAgICAgICAgICA8L1NlbGVjdD5cbiAgICAgICAgICA8L3NwYW4+fVxuICAgICAgICAgIHsvKjxUb29sdGlwIHRpdGxlPVwiUmVsb2FkIHRhYmxlXCI+XG4gICAgICAgICAgICA8SWNvbkJ1dHRvbiBvbkNsaWNrPXsoKSA9PiB0aGlzLmdldFRhYmxlKCl9IGNsYXNzTmFtZT0nZmxvYXQtcmlnaHQnIHNpemU9J3NtYWxsJz5cbiAgICAgICAgICAgICAgPENhY2hlZEljb24gZm9udFNpemU9J2xhcmdlJy8+XG4gICAgICAgICAgICA8L0ljb25CdXR0b24+XG4gICAgICAgICAgPC9Ub29sdGlwPiovfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge2RhdGEubGVuZ3RoPT0wICYmXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS0xMic+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93Jz5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J20tMicgc3R5bGU9e3tmb250U2l6ZTogMTh9fSA+XG4gICAgICAgICAgICAgICAgRW1wdHkgZGF0YWJhc2U6XG4gICAgICAgICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoKT0+QWN0aW9ucy5zaG93Rm9ybSgnbmV3JyxudWxsLG51bGwpfVxuICAgICAgICAgICAgICAgICAgaWQ9J2FkZERhdGFCdG4nIHN0YXJ0SWNvbj17PEFkZENpcmNsZUljb24gLz59PlxuICAgICAgICAgICAgICAgICAgQWRkIGRhdGFcbiAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj59XG4gICAgICAgIHtkYXRhLmxlbmd0aD4wICYmXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9J210LTInIHN0eWxlPXt7aGVpZ2h0OndpbmRvdy5pbm5lckhlaWdodC02OH19PlxuICAgICAgICAgICAgPERhdGFHcmlkIHJvd3M9e2RhdGF9IGNvbHVtbnM9e2NvbHVtbnN9IGRlbnNpdHk9J2NvbXBhY3QnIGF1dG9QYWdlU2l6ZVxuICAgICAgICAgICAgICBjb21wb25lbnRzPXt7VG9vbGJhcjogdGhpcy5jdXN0b21Ub29sYmFyfX0gb25Sb3dDbGljaz17dGhpcy50b2dnbGVEZXRhaWxzfS8+XG4gICAgICAgICAgPC9kaXY+fVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuIl0sImZpbGUiOiJyZW5kZXJlci9jb21wb25lbnRzL0RvY1RhYmxlLmpzIn0=
