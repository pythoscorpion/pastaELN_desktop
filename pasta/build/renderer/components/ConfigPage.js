"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _core = require("@material-ui/core");

var _ExpandMore = _interopRequireDefault(require("@material-ui/icons/ExpandMore"));

var _lab = require("@material-ui/lab");

var _Store = _interopRequireDefault(require("../Store"));

var Actions = _interopRequireWildcard(require("../Actions"));

var _ModalOntology = _interopRequireDefault(require("./ModalOntology"));

var _ModalConfiguration = _interopRequireDefault(require("./ModalConfiguration"));

var _localInteraction = require("../localInteraction");

var _style = require("../style");

var _longStrings = require("./longStrings");

var _errorCodes = require("../errorCodes");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* Configuration of the software
  Elements:
  - Database configuration and ontology
  - Tasks:
    Test-Backend: testBackend
    Verify Database integrity: verifyDB
    ...
  - About information
*/
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
//import { Bar } from 'react-chartjs-2';                            // eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
class ConfigPage extends _react.Component {
  constructor() {
    super();

    this.timer = () => {
      //execute every 20sec
      this.setState({
        healthButton: _style.btnStrong
      });
    };

    this.changeSelector = event => {
      /** change configuration selector */
      (0, _localInteraction.editDefault)(event.target.value);
      var config = this.state.configuration;
      config['default'] = event.target.value;
      this.setState({
        configuration: config
      });
      this.reload('fast');
    };

    this.reload = (grade = 'fast') => {
      /** Reload entire app. Fast version of window.location.reload(); */
      if (grade == 'fast') {
        _Store.default.initStore();
      } else {
        window.location.reload();
      }
    };

    this.pressedButton = task => {
      /**
       * clicked button and execute a command in backend
       * sibling for pressedButton in Project.js: change both similarly
       */
      if (task != 'btn_cfg_be_history' || !this.state.history) {
        Actions.comState('busy');
        this.setState({
          ready: false
        });
        (0, _localInteraction.executeCmd)(task, this.callback);
      } else {
        //default
        this.setState({
          history: null
        });
      }
    };

    this.callback = content => {
      /** callback for all executeCmd functions */
      this.setState({
        ready: true
      }); //parse information: success/failure

      var contentArray = content.trim().split('\n');
      content = contentArray.slice(0, contentArray.length - 1).join('\n').trim(); //clean version

      const lastLine = contentArray[contentArray.length - 1].split(' ');

      if (lastLine[1] == 'btn_cfg_be_extractorScan') {
        Actions.updateExtractors();
        content = 'Extractor scan: success';
      } else if (lastLine[1] == 'btn_cfg_be_testDev') {
        this.reload();
      }

      if (lastLine[0] === 'SUCCESS') {
        Actions.comState('ok');
        content += '\nSUCCESS';
      } else if (lastLine[0] === 'success') {
        content += '\nsuccess';
      } else {
        Actions.comState('fail');
        content += '\nFAILURE';
      }

      contentArray.pop();
      var errors = contentArray.filter(i => {
        return i.match(/\*\*ERROR [\w]{3}[\d]{2}\w*:/i);
      });

      if (errors.length > 0) {
        console.log('Errors', errors);
        errors = errors.map(i => {
          const key = i.substring(8, 13);
          if (key == 'pma20' || key == 'pma01' && i.includes('https://____')) //User can ignore these
            return '';
          var value = _errorCodes.errorCodes[key];

          if (value) {
            value += i.includes('|') ? ' : ' + i.split('|')[1] : '';
            return '<strong>' + value + '</strong>';
          }

          return 'Unidentified error: ' + i;
        });
        errors = errors.filter(i => {
          return i != '';
        });
        this.setState({
          healthText: errors.join('<br/>'),
          healthButton: {
            backgroundColor: 'red'
          }
        });
      } else {
        this.setState({
          healthButton: {
            backgroundColor: 'lightgreen',
            color: 'black'
          }
        });
      } // get history data


      if (content[0] == '{' && content.indexOf('-bins-') > 0 && content.indexOf('-score-') > 0) {
        var history = content.substring(0, content.length - 8).replace(/'/g, '"');
        history = history.replace(/array\(\[/g, '[').replace(/\]\),\s/g, '],');
        history = JSON.parse(history);
        const keys = Object.keys(history).filter(i => {
          return i[0] != '-';
        });
        const colors = ['#00F', '#0F0', '#F00', '#000', '#0FF', '#F0F', '#FF0'];
        const datasets = keys.map((key, idx) => {
          const score = history['-score-'][key];
          return {
            label: key + ' ' + score.toFixed(2),
            data: history[key],
            backgroundColor: colors[idx]
          };
        });
        const labels = history['-bins-'].map(i => {
          return i.split('T')[0];
        });
        var data = {
          labels: labels,
          datasets: datasets
        };
        this.setState({
          history: data
        });
      }
    };

    this.toggleOntology = btnName => {
      /** changes in visibility of ontology modals */
      if (this.state.showOntology === 'none') {
        this.setState({
          showOntology: 'block'
        });
      } else {
        this.setState({
          showOntology: 'none'
        });
        if (btnName == 'save') this.pressedButton('btn_cfg_be_test'); //run backend test to create views
      }
    };

    this.toggleConfiguration = () => {
      /** change visibility of configuration modal */
      if (this.state.showConfiguration === 'none') {
        this.setState({
          showConfiguration: 'block'
        });
      } else {
        //after close of configuration editor
        this.setState({
          showConfiguration: 'none'
        });
        this.reload('complete'); //reload possibly new configuration

        this.pressedButton('btn_cfg_be_test'); //health-test incl. create views for new ontology?
      }
    };

    this.state = {
      ready: true,
      //ready is for all task buttons
      showOntology: 'none',
      showConfiguration: 'none',
      configuration: '',
      healthButton: _style.btnStrong,
      healthText: '',
      history: null
    };
  }

  componentDidMount() {
    var config = (0, _localInteraction.getCredentials)().configuration;
    if (!config) return;
    this.setState({
      configuration: config,
      intervalId: setInterval(this.timer, 20000)
    }); // store intervalId for later access
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  /** create html-structure; all should return at least <div></div> **/
  showConfiguration() {
    /* configuration block */
    if (!this.state.configuration || !this.state.configuration['links']) {
      return /*#__PURE__*/_react.default.createElement("div", null);
    }

    const options = Object.keys(this.state.configuration['links']).map(item => {
      return /*#__PURE__*/_react.default.createElement(_core.MenuItem, {
        value: item,
        key: item
      }, item);
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      style: _style.flowText
    }, /*#__PURE__*/_react.default.createElement("div", {
      style: _style.h1
    }, "Configuration"), /*#__PURE__*/_react.default.createElement("div", {
      className: "row mt-2"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, "Information on access (username, password), database configuration and local folders"), /*#__PURE__*/_react.default.createElement(_core.FormControl, {
      fullWidth: true,
      className: "col-sm-6 px-3"
    }, /*#__PURE__*/_react.default.createElement(_core.Select, {
      onChange: e => this.changeSelector(e),
      value: this.state.configuration['default']
    }, options))), /*#__PURE__*/_react.default.createElement("div", {
      className: "row mt-2"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, " Edit / Create / Delete configurations  "), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      className: "btn-block",
      variant: "contained",
      onClick: this.toggleConfiguration,
      disabled: !this.state.ready,
      id: "configEditorBtn",
      style: _style.btn
    }, "Configuration-Editor"))), /*#__PURE__*/_react.default.createElement(_ModalConfiguration.default, {
      show: this.state.showConfiguration,
      callback: this.toggleConfiguration
    }), _localInteraction.ELECTRON &&
    /*#__PURE__*/
    // *** React-Electron version TODO pr-1 on Local->Remote button
    _react.default.createElement("div", {
      className: "row mt-2"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, "Synchronize"), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      className: "btn-block",
      variant: "contained",
      onClick: () => this.pressedButton('btn_cfg_be_syncLR'),
      style: _style.btn
    }, "Local > Remote"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "row mt-4"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, "Ontology: Define what data types (samples, measurements, ...) with which metadata (name, comments, ...) you want to store."), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      className: "btn-block",
      variant: "contained",
      onClick: this.toggleOntology,
      disabled: !this.state.ready,
      id: "ontologyBtn",
      style: _style.btn
    }, "Questionnaire-Editor"), /*#__PURE__*/_react.default.createElement(_ModalOntology.default, {
      show: this.state.showOntology,
      callback: this.toggleOntology
    }))));
  }

  showTasks() {
    /* show System / Maintenance block */
    return /*#__PURE__*/_react.default.createElement("div", {
      style: _style.flowText
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "row mb-2"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6",
      style: _style.h1
    }, "System"), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      variant: "contained",
      style: { ..._style.btn,
        ...this.state.healthButton
      },
      onClick: () => this.pressedButton('btn_cfg_be_test'),
      disabled: !this.state.ready,
      className: "btn-block"
    }, "Health check"))), this.state.healthText.length > 2 && /*#__PURE__*/_react.default.createElement(_lab.Alert, {
      severity: "error",
      key: "healthAlert"
    }, "At least an error occurred: (after repair: \"maintance-complete restart\")", /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement("div", {
      dangerouslySetInnerHTML: {
        __html: this.state.healthText
      }
    })), /*#__PURE__*/_react.default.createElement(_core.Accordion, {
      TransitionProps: {
        unmountOnExit: true,
        timeout: 0
      }
    }, /*#__PURE__*/_react.default.createElement(_core.AccordionSummary, {
      expandIcon: /*#__PURE__*/_react.default.createElement(_ExpandMore.default, null),
      style: _style.btn
    }, "Maintenance"), /*#__PURE__*/_react.default.createElement(_core.AccordionDetails, null, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      className: "row mt-2"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, "Restart application:"), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-3 pr-1"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      className: "btn-block",
      variant: "contained",
      onClick: () => this.reload('fast'),
      style: _style.btn
    }, "fast restart")), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-3 pl-1"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      className: "btn-block",
      variant: "contained",
      onClick: () => this.reload('complete'),
      style: _style.btn
    }, "complete restart"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "row mt-2"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, "Reset ontology / delete all previously entered questions."), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.pressedButton('btn_cfg_be_testDev'),
      className: "btn-block",
      variant: "contained",
      disabled: !this.state.ready,
      style: _style.btn
    }, "Reset ontology"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "row mt-2"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, "Re-check and get all extractors"), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.pressedButton('btn_cfg_be_extractorScan'),
      className: "btn-block",
      variant: "contained",
      disabled: !this.state.ready,
      style: _style.btn
    }, "Scan extractors"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "row mt-2"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, "Configuration file in home directory"), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.pressedButton('btn_cfg_be_verifyConfigurationDev'),
      className: "btn-block",
      variant: "contained",
      disabled: !this.state.ready,
      style: _style.btn
    }, "Automatically repair configuration"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "row mt-2"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, "Test / Repair database logic: e.g. revisions make sense, QR codes exist for samples,..."), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-3 pr-1"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.pressedButton('btn_cfg_be_verifyDB'),
      className: "btn-block",
      variant: "contained",
      disabled: !this.state.ready,
      style: _style.btn
    }, "Test database integrity")), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-3 pl-1"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.pressedButton('btn_cfg_be_verifyDBdev'),
      className: "btn-block",
      variant: "contained",
      disabled: !this.state.ready,
      style: _style.btn
    }, "Repair database"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "row"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, "Backup files are zip-files which include all the meta data. Unzip and open the resulting json-files with web-browser."), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-3 pr-1"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.pressedButton('btn_cfg_be_saveBackup'),
      className: "btn-block",
      variant: "contained",
      disabled: !this.state.ready,
      style: _style.btn
    }, "Save backup")), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-3 pl-1"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.pressedButton('btn_cfg_be_loadBackup'),
      className: "btn-block",
      variant: "contained",
      disabled: !this.state.ready,
      style: _style.btn
    }, "Load backup"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "row"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, "Download update to backend and frontend from jugit.fz-juelich.de server. After update, reload app by pressing button."), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.pressedButton('btn_cfg_be_updatePASTA'),
      className: "btn-block",
      variant: "contained",
      disabled: !this.state.ready,
      style: _style.btn
    }, "Update software")))))));
  }

  showAbout() {
    /* show about block */
    return /*#__PURE__*/_react.default.createElement("div", {
      style: _style.flowText
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "row"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx-3"
    }, /*#__PURE__*/_react.default.createElement("img", {
      src: _longStrings.logo,
      alt: "logo, changed from free icon of monkik @ flaticon.com"
    })), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h1", {
      style: _style.h1,
      className: "ml-3"
    }, "PASTA (adaPtive mAterials Science meTa dAta) database"))), /*#__PURE__*/_react.default.createElement("p", {
      className: "m-2"
    }, /*#__PURE__*/_react.default.createElement("strong", null, "Links to help / more information"), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement("a", {
      target: "_blank",
      href: "https://jugit.fz-juelich.de/pasta/main/-/wikis/troubleshooting",
      style: {
        color: _style.textFG
      }
    }, "> What if problems occur..."), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement("a", {
      target: "_blank",
      style: {
        color: _style.textFG
      },
      href: "https://jugit.fz-juelich.de/pasta/main/-/wikis/home#concepts-of-pasta-database"
    }, "> Concept of PASTA ..."), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement("a", {
      target: "_blank",
      href: "https://youtu.be/9nVMqMs1Wvw",
      style: {
        color: _style.textFG
      }
    }, "> A teaser youtube video...(it uses the old name: jamDB)"), " ", /*#__PURE__*/_react.default.createElement("br", null)));
  }
  /** the render method **/


  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "container px-4 pt-2",
      style: {
        height: window.innerHeight - 38,
        overflowY: 'scroll'
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "p-3",
      style: _style.area
    }, this.showConfiguration()), _localInteraction.ELECTRON &&
    /*#__PURE__*/
    // *** React-Electron version
    _react.default.createElement("div", {
      className: "my-3 p-3",
      style: _style.area
    }, this.showTasks()), /*#__PURE__*/_react.default.createElement("div", {
      className: "p-3",
      style: _style.area
    }, this.showAbout()), /*#__PURE__*/_react.default.createElement("div", {
      className: "mb-3 p-3",
      style: _style.area
    }, /*#__PURE__*/_react.default.createElement("p", {
      style: _style.flowText
    }, "* During initial software development, certain functions (e.g. delete, some functions on this page) exist that will be removed once software more stable."), /*#__PURE__*/_react.default.createElement("p", {
      style: _style.flowText
    }, "Version number: 1.2.2")));
  }

}
/*
        Sentry warning
        ==============
          <p style={flowText}><strong>Warning:</strong>
          To find the problems that lead to the failure of the code and to easily help, we use
          sentry.io to get information when a crash/error/failure occurs. We only get information on
          which part of the code was responsible and the operating system. We do not get/collect/care
          for any data and metadata that you saved.</p>

          Show history of commits
          =======================
        <div className='row mt-2'>
          <div className='col-sm-6'>
            Show history of modifications to this database
          </div>
          <div className='col-sm-6'>
            <Button onClick={() => this.pressedButton('btn_cfg_be_history')} className='btn-block'
              variant="contained" disabled={!this.state.ready} style={btn}>
              {!this.state.history && 'Show history'}
              { this.state.history && 'Hide history'}
            </Button>
          </div>
        </div>
        {this.state.history &&
        <Bar className='my-2' data={this.state.history} />
        }
*/


exports.default = ConfigPage;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlcmVyL2NvbXBvbmVudHMvQ29uZmlnUGFnZS5qcyJdLCJuYW1lcyI6WyJDb25maWdQYWdlIiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJ0aW1lciIsInNldFN0YXRlIiwiaGVhbHRoQnV0dG9uIiwiYnRuU3Ryb25nIiwiY2hhbmdlU2VsZWN0b3IiLCJldmVudCIsInRhcmdldCIsInZhbHVlIiwiY29uZmlnIiwic3RhdGUiLCJjb25maWd1cmF0aW9uIiwicmVsb2FkIiwiZ3JhZGUiLCJTdG9yZSIsImluaXRTdG9yZSIsIndpbmRvdyIsImxvY2F0aW9uIiwicHJlc3NlZEJ1dHRvbiIsInRhc2siLCJoaXN0b3J5IiwiQWN0aW9ucyIsImNvbVN0YXRlIiwicmVhZHkiLCJjYWxsYmFjayIsImNvbnRlbnQiLCJjb250ZW50QXJyYXkiLCJ0cmltIiwic3BsaXQiLCJzbGljZSIsImxlbmd0aCIsImpvaW4iLCJsYXN0TGluZSIsInVwZGF0ZUV4dHJhY3RvcnMiLCJwb3AiLCJlcnJvcnMiLCJmaWx0ZXIiLCJpIiwibWF0Y2giLCJjb25zb2xlIiwibG9nIiwibWFwIiwia2V5Iiwic3Vic3RyaW5nIiwiaW5jbHVkZXMiLCJlcnJvckNvZGVzIiwiaGVhbHRoVGV4dCIsImJhY2tncm91bmRDb2xvciIsImNvbG9yIiwiaW5kZXhPZiIsInJlcGxhY2UiLCJKU09OIiwicGFyc2UiLCJrZXlzIiwiT2JqZWN0IiwiY29sb3JzIiwiZGF0YXNldHMiLCJpZHgiLCJzY29yZSIsImxhYmVsIiwidG9GaXhlZCIsImRhdGEiLCJsYWJlbHMiLCJ0b2dnbGVPbnRvbG9neSIsImJ0bk5hbWUiLCJzaG93T250b2xvZ3kiLCJ0b2dnbGVDb25maWd1cmF0aW9uIiwic2hvd0NvbmZpZ3VyYXRpb24iLCJjb21wb25lbnREaWRNb3VudCIsImludGVydmFsSWQiLCJzZXRJbnRlcnZhbCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwiY2xlYXJJbnRlcnZhbCIsIm9wdGlvbnMiLCJpdGVtIiwiZmxvd1RleHQiLCJoMSIsImUiLCJidG4iLCJFTEVDVFJPTiIsInNob3dUYXNrcyIsIl9faHRtbCIsInVubW91bnRPbkV4aXQiLCJ0aW1lb3V0Iiwic2hvd0Fib3V0IiwibG9nbyIsInRleHRGRyIsInJlbmRlciIsImhlaWdodCIsImlubmVySGVpZ2h0Iiwib3ZlcmZsb3dZIiwiYXJlYSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQVNBOztBQUNBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQXRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDa0U7QUFFUTtBQUNSO0FBQ0E7QUFDbEU7QUFHa0U7QUFDQTtBQU1uRCxNQUFNQSxVQUFOLFNBQXlCQyxnQkFBekIsQ0FBbUM7QUFDaERDLEVBQUFBLFdBQVcsR0FBRztBQUNaOztBQURZLFNBd0JkQyxLQXhCYyxHQXdCTixNQUFNO0FBQUc7QUFDZixXQUFLQyxRQUFMLENBQWM7QUFBQ0MsUUFBQUEsWUFBWSxFQUFFQztBQUFmLE9BQWQ7QUFDRCxLQTFCYTs7QUFBQSxTQTZCZEMsY0E3QmMsR0E2QklDLEtBQUQsSUFBVTtBQUN6QjtBQUNBLHlDQUFZQSxLQUFLLENBQUNDLE1BQU4sQ0FBYUMsS0FBekI7QUFDQSxVQUFJQyxNQUFNLEdBQUcsS0FBS0MsS0FBTCxDQUFXQyxhQUF4QjtBQUNBRixNQUFBQSxNQUFNLENBQUMsU0FBRCxDQUFOLEdBQW9CSCxLQUFLLENBQUNDLE1BQU4sQ0FBYUMsS0FBakM7QUFDQSxXQUFLTixRQUFMLENBQWM7QUFBQ1MsUUFBQUEsYUFBYSxFQUFFRjtBQUFoQixPQUFkO0FBQ0EsV0FBS0csTUFBTCxDQUFZLE1BQVo7QUFDRCxLQXBDYTs7QUFBQSxTQXNDZEEsTUF0Q2MsR0FzQ0wsQ0FBQ0MsS0FBSyxHQUFDLE1BQVAsS0FBa0I7QUFDekI7QUFDQSxVQUFJQSxLQUFLLElBQUUsTUFBWCxFQUFtQjtBQUNqQkMsdUJBQU1DLFNB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QyxPQUNHLEtBQUtYLFNBQUwsRUFESCxDQU5KLGVBV0U7QUFBSyxNQUFBLFNBQVMsRUFBQyxLQUFmO0FBQXFCLE1BQUEsS0FBSyxFQUFFVztBQUE1QixPQUNHLEtBQUtQLFNBQUwsRUFESCxDQVhGLGVBZUU7QUFBSyxNQUFBLFNBQVMsRUFBQyxVQUFmO0FBQTBCLE1BQUEsS0FBSyxFQUFFTztBQUFqQyxvQkFDRTtBQUFHLE1BQUEsS0FBSyxFQUFFaEI7QUFBVixtS0FERixlQUlFO0FBQUcsTUFBQSxLQUFLLEVBQUVBO0FBQVYsK0JBSkYsQ0FmRixDQURGO0FBeUJEOztBQWhhK0M7QUFtYWxEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIi8qIENvbmZpZ3VyYXRpb24gb2YgdGhlIHNvZnR3YXJlXG4gIEVsZW1lbnRzOlxuICAtIERhdGFiYXNlIGNvbmZpZ3VyYXRpb24gYW5kIG9udG9sb2d5XG4gIC0gVGFza3M6XG4gICAgVGVzdC1CYWNrZW5kOiB0ZXN0QmFja2VuZFxuICAgIFZlcmlmeSBEYXRhYmFzZSBpbnRlZ3JpdHk6IHZlcmlmeURCXG4gICAgLi4uXG4gIC0gQWJvdXQgaW5mb3JtYXRpb25cbiovXG5pbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50IH0gZnJvbSAncmVhY3QnOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgeyBCdXR0b24sIEZvcm1Db250cm9sLCBNZW51SXRlbSwgU2VsZWN0LCAgICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIEFjY29yZGlvbiwgQWNjb3JkaW9uU3VtbWFyeSwgQWNjb3JkaW9uRGV0YWlsc30gZnJvbSAnQG1hdGVyaWFsLXVpL2NvcmUnOy8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCBFeHBhbmRNb3JlSWNvbiBmcm9tICdAbWF0ZXJpYWwtdWkvaWNvbnMvRXhwYW5kTW9yZSc7ICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCB7IEFsZXJ0IH0gZnJvbSAnQG1hdGVyaWFsLXVpL2xhYic7ICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbi8vaW1wb3J0IHsgQmFyIH0gZnJvbSAncmVhY3QtY2hhcnRqcy0yJzsgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IFN0b3JlIGZyb20gJy4uL1N0b3JlJztcbmltcG9ydCAqIGFzIEFjdGlvbnMgZnJvbSAnLi4vQWN0aW9ucyc7XG5pbXBvcnQgTW9kYWxPbnRvbG9neSBmcm9tICcuL01vZGFsT250b2xvZ3knOyAgICAgICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgTW9kYWxDb25maWd1cmF0aW9uIGZyb20gJy4vTW9kYWxDb25maWd1cmF0aW9uJzsgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQge2dldENyZWRlbnRpYWxzLCBlZGl0RGVmYXVsdCwgRUxFQ1RST04sIGV4ZWN1dGVDbWR9IGZyb20gJy4uL2xvY2FsSW50ZXJhY3Rpb24nO1xuaW1wb3J0IHsgYXJlYSwgaDEsIGJ0biwgdGV4dEZHLCBmbG93VGV4dCwgYnRuU3Ryb25nIH0gZnJvbSAnLi4vc3R5bGUnO1xuaW1wb3J0IHsgbG9nbyB9IGZyb20gJy4vbG9uZ1N0cmluZ3MnO1xuaW1wb3J0IHsgZXJyb3JDb2RlcyB9IGZyb20gJy4uL2Vycm9yQ29kZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25maWdQYWdlIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgcmVhZHk6IHRydWUsICAvL3JlYWR5IGlzIGZvciBhbGwgdGFzayBidXR0b25zXG4gICAgICBzaG93T250b2xvZ3k6ICdub25lJyxcbiAgICAgIHNob3dDb25maWd1cmF0aW9uOiAnbm9uZScsXG4gICAgICBjb25maWd1cmF0aW9uOiAnJyxcbiAgICAgIGhlYWx0aEJ1dHRvbjogYnRuU3Ryb25nLFxuICAgICAgaGVhbHRoVGV4dDogJycsXG4gICAgICBoaXN0b3J5OiBudWxsXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCl7XG4gICAgdmFyIGNvbmZpZyA9IGdldENyZWRlbnRpYWxzKCkuY29uZmlndXJhdGlvbjtcbiAgICBpZiAoIWNvbmZpZylcbiAgICAgIHJldHVybjtcbiAgICB0aGlzLnNldFN0YXRlKHtjb25maWd1cmF0aW9uOiBjb25maWcsIGludGVydmFsSWQ6IHNldEludGVydmFsKHRoaXMudGltZXIsIDIwMDAwKX0pOyAgICAvLyBzdG9yZSBpbnRlcnZhbElkIGZvciBsYXRlciBhY2Nlc3NcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCl7XG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLnN0YXRlLmludGVydmFsSWQpO1xuICB9XG5cbiAgdGltZXIgPSAoKSA9PiB7ICAvL2V4ZWN1dGUgZXZlcnkgMjBzZWNcbiAgICB0aGlzLnNldFN0YXRlKHtoZWFsdGhCdXR0b246IGJ0blN0cm9uZ30pO1xuICB9XG5cbiAgLyoqIEZ1bmN0aW9ucyBhcyBjbGFzcyBwcm9wZXJ0aWVzIChpbW1lZGlhdGVseSBib3VuZCk6IHJlYWN0IG9uIHVzZXIgaW50ZXJhY3Rpb25zICoqL1xuICBjaGFuZ2VTZWxlY3RvciA9IChldmVudCkgPT57XG4gICAgLyoqIGNoYW5nZSBjb25maWd1cmF0aW9uIHNlbGVjdG9yICovXG4gICAgZWRpdERlZmF1bHQoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5zdGF0ZS5jb25maWd1cmF0aW9uO1xuICAgIGNvbmZpZ1snZGVmYXVsdCddID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgIHRoaXMuc2V0U3RhdGUoe2NvbmZpZ3VyYXRpb246IGNvbmZpZ30pO1xuICAgIHRoaXMucmVsb2FkKCdmYXN0Jyk7XG4gIH1cblxuICByZWxvYWQgPSAoZ3JhZGU9J2Zhc3QnKSA9PiB7XG4gICAgLyoqIFJlbG9hZCBlbnRpcmUgYXBwLiBGYXN0IHZlcnNpb24gb2Ygd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpOyAqL1xuICAgIGlmIChncmFkZT09J2Zhc3QnKSB7XG4gICAgICBTdG9yZS5pbml0U3RvcmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH1cbiAgfVxuXG4gIHByZXNzZWRCdXR0b249KHRhc2spPT57XG4gICAgLyoqXG4gICAgICogY2xpY2tlZCBidXR0b24gYW5kIGV4ZWN1dGUgYSBjb21tYW5kIGluIGJhY2tlbmRcbiAgICAgKiBzaWJsaW5nIGZvciBwcmVzc2VkQnV0dG9uIGluIFByb2plY3QuanM6IGNoYW5nZSBib3RoIHNpbWlsYXJseVxuICAgICAqL1xuICAgIGlmICh0YXNrIT0nYnRuX2NmZ19iZV9oaXN0b3J5JyB8fCAhdGhpcy5zdGF0ZS5oaXN0b3J5KSB7XG4gICAgICBBY3Rpb25zLmNvbVN0YXRlKCdidXN5Jyk7XG4gICAgICB0aGlzLnNldFN0YXRlKHtyZWFkeTogZmFsc2V9KTtcbiAgICAgIGV4ZWN1dGVDbWQodGFzayx0aGlzLmNhbGxiYWNrKTtcbiAgICB9IGVsc2UgeyAgIC8vZGVmYXVsdFxuICAgICAgdGhpcy5zZXRTdGF0ZSh7aGlzdG9yeTpudWxsIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNhbGxiYWNrPShjb250ZW50KT0+e1xuICAgIC8qKiBjYWxsYmFjayBmb3IgYWxsIGV4ZWN1dGVDbWQgZnVuY3Rpb25zICovXG4gICAgdGhpcy5zZXRTdGF0ZSh7cmVhZHk6IHRydWV9KTtcbiAgICAvL3BhcnNlIGluZm9ybWF0aW9uOiBzdWNjZXNzL2ZhaWx1cmVcbiAgICB2YXIgY29udGVudEFycmF5ID0gY29udGVudC50cmltKCkuc3BsaXQoJ1xcbicpO1xuICAgIGNvbnRlbnQgPSBjb250ZW50QXJyYXkuc2xpY2UoMCxjb250ZW50QXJyYXkubGVuZ3RoLTEpLmpvaW4oJ1xcbicpLnRyaW0oKTsvL2NsZWFuIHZlcnNpb25cbiAgICBjb25zdCBsYXN0TGluZSA9IGNvbnRlbnRBcnJheVtjb250ZW50QXJyYXkubGVuZ3RoLTFdLnNwbGl0KCcgJyk7XG4gICAgaWYoIGxhc3RMaW5lWzFdPT0nYnRuX2NmZ19iZV9leHRyYWN0b3JTY2FuJykge1xuICAgICAgQWN0aW9ucy51cGRhdGVFeHRyYWN0b3JzKCk7XG4gICAgICBjb250ZW50ID0gJ0V4dHJhY3RvciBzY2FuOiBzdWNjZXNzJztcbiAgICB9IGVsc2UgaWYgKCBsYXN0TGluZVsxXT09J2J0bl9jZmdfYmVfdGVzdERldicpIHtcbiAgICAgIHRoaXMucmVsb2FkKCk7XG4gICAgfVxuICAgIGlmKCBsYXN0TGluZVswXT09PSdTVUNDRVNTJyApe1xuICAgICAgQWN0aW9ucy5jb21TdGF0ZSgnb2snKTtcbiAgICAgIGNvbnRlbnQgKz0gJ1xcblNVQ0NFU1MnO1xuICAgIH0gZWxzZSBpZiggbGFzdExpbmVbMF09PT0nc3VjY2VzcycgKXtcbiAgICAgIGNvbnRlbnQgKz0gJ1xcbnN1Y2Nlc3MnO1xuICAgIH0gZWxzZSB7XG4gICAgICBBY3Rpb25zLmNvbVN0YXRlKCdmYWlsJyk7XG4gICAgICBjb250ZW50ICs9ICdcXG5GQUlMVVJFJztcbiAgICB9XG5cbiAgICBjb250ZW50QXJyYXkucG9wKCk7XG4gICAgdmFyIGVycm9ycyA9IGNvbnRlbnRBcnJheS5maWx0ZXIoaT0+e1xuICAgICAgcmV0dXJuIGkubWF0Y2goL1xcKlxcKkVSUk9SIFtcXHddezN9W1xcZF17Mn1cXHcqOi9pKTt9KTtcbiAgICBpZiAoZXJyb3JzLmxlbmd0aD4wKSB7XG4gICAgICBjb25zb2xlLmxvZygnRXJyb3JzJyxlcnJvcnMpO1xuICAgICAgZXJyb3JzID0gZXJyb3JzLm1hcChpPT57XG4gICAgICAgIGNvbnN0IGtleSA9IGkuc3Vic3RyaW5nKDgsMTMpO1xuICAgICAgICBpZiAoa2V5PT0ncG1hMjAnIHx8IChrZXk9PSdwbWEwMScgJiYgaS5pbmNsdWRlcygnaHR0cHM6Ly9fX19fJykpICkgLy9Vc2VyIGNhbiBpZ25vcmUgdGhlc2VcbiAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIHZhciB2YWx1ZSA9IGVycm9yQ29kZXNba2V5XTtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgdmFsdWUgKz0gaS5pbmNsdWRlcygnfCcpID8gJyA6ICcraS5zcGxpdCgnfCcpWzFdIDogJyc7XG4gICAgICAgICAgcmV0dXJuICc8c3Ryb25nPicrdmFsdWUrJzwvc3Ryb25nPic7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICdVbmlkZW50aWZpZWQgZXJyb3I6ICcraTtcbiAgICAgIH0pO1xuICAgICAgZXJyb3JzID0gZXJyb3JzLmZpbHRlcihpPT57cmV0dXJuIGkhPScnO30pO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7aGVhbHRoVGV4dDplcnJvcnMuam9pbignPGJyLz4nKSwgaGVhbHRoQnV0dG9uOntiYWNrZ3JvdW5kQ29sb3I6J3JlZCd9fSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2hlYWx0aEJ1dHRvbjp7YmFja2dyb3VuZENvbG9yOidsaWdodGdyZWVuJywgY29sb3I6J2JsYWNrJ319KTtcbiAgICB9XG5cblxuICAgIC8vIGdldCBoaXN0b3J5IGRhdGFcbiAgICBpZiAoY29udGVudFswXT09J3snICYmIGNvbnRlbnQuaW5kZXhPZignLWJpbnMtJyk+MCAmJiBjb250ZW50LmluZGV4T2YoJy1zY29yZS0nKT4wKSB7XG4gICAgICB2YXIgaGlzdG9yeSA9IGNvbnRlbnQuc3Vic3RyaW5nKDAsIGNvbnRlbnQubGVuZ3RoLTgpLnJlcGxhY2UoLycvZywnXCInKTtcbiAgICAgIGhpc3RvcnkgICAgID0gaGlzdG9yeS5yZXBsYWNlKC9hcnJheVxcKFxcWy9nLCdbJykucmVwbGFjZSgvXFxdXFwpLFxccy9nLCddLCcpO1xuICAgICAgaGlzdG9yeSA9IEpTT04ucGFyc2UoaGlzdG9yeSk7XG4gICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoaGlzdG9yeSkuZmlsdGVyKChpKT0+e3JldHVybiBpWzBdIT0nLSc7fSk7XG4gICAgICBjb25zdCBjb2xvcnMgPSBbJyMwMEYnLCcjMEYwJywnI0YwMCcsJyMwMDAnLCcjMEZGJywnI0YwRicsJyNGRjAnXTtcbiAgICAgIGNvbnN0IGRhdGFzZXRzID0ga2V5cy5tYXAoKGtleSxpZHgpPT57XG4gICAgICAgIGNvbnN0IHNjb3JlID0gaGlzdG9yeVsnLXNjb3JlLSddW2tleV07XG4gICAgICAgIHJldHVybiB7bGFiZWw6IGtleSsnICcrc2NvcmUudG9GaXhlZCgyKSwgZGF0YTpoaXN0b3J5W2tleV0sIGJhY2tncm91bmRDb2xvcjpjb2xvcnNbaWR4XX07XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGxhYmVscyA9IGhpc3RvcnlbJy1iaW5zLSddLm1hcCgoaSk9PntcbiAgICAgICAgcmV0dXJuIGkuc3BsaXQoJ1QnKVswXTtcbiAgICAgIH0pO1xuICAgICAgdmFyIGRhdGEgPSB7bGFiZWxzOiBsYWJlbHMsICBkYXRhc2V0czpkYXRhc2V0cywgfTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2hpc3Rvcnk6IGRhdGF9KTtcbiAgICB9XG4gIH1cblxuICB0b2dnbGVPbnRvbG9neT0oYnRuTmFtZSk9PntcbiAgICAvKiogY2hhbmdlcyBpbiB2aXNpYmlsaXR5IG9mIG9udG9sb2d5IG1vZGFscyAqL1xuICAgIGlmKHRoaXMuc3RhdGUuc2hvd09udG9sb2d5PT09J25vbmUnKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzaG93T250b2xvZ3k6ICdibG9jayd9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2hvd09udG9sb2d5OiAnbm9uZSd9KTtcbiAgICAgIGlmIChidG5OYW1lPT0nc2F2ZScpXG4gICAgICAgIHRoaXMucHJlc3NlZEJ1dHRvbignYnRuX2NmZ19iZV90ZXN0Jyk7IC8vcnVuIGJhY2tlbmQgdGVzdCB0byBjcmVhdGUgdmlld3NcbiAgICB9XG4gIH1cblxuICB0b2dnbGVDb25maWd1cmF0aW9uPSgpPT57XG4gICAgLyoqIGNoYW5nZSB2aXNpYmlsaXR5IG9mIGNvbmZpZ3VyYXRpb24gbW9kYWwgKi9cbiAgICBpZih0aGlzLnN0YXRlLnNob3dDb25maWd1cmF0aW9uPT09J25vbmUnKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzaG93Q29uZmlndXJhdGlvbjogJ2Jsb2NrJ30pO1xuICAgIH0gZWxzZSB7ICAgLy9hZnRlciBjbG9zZSBvZiBjb25maWd1cmF0aW9uIGVkaXRvclxuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2hvd0NvbmZpZ3VyYXRpb246ICdub25lJ30pO1xuICAgICAgdGhpcy5yZWxvYWQoJ2NvbXBsZXRlJyk7ICAgICAgICAgICAgICAgIC8vcmVsb2FkIHBvc3NpYmx5IG5ldyBjb25maWd1cmF0aW9uXG4gICAgICB0aGlzLnByZXNzZWRCdXR0b24oJ2J0bl9jZmdfYmVfdGVzdCcpOyAgLy9oZWFsdGgtdGVzdCBpbmNsLiBjcmVhdGUgdmlld3MgZm9yIG5ldyBvbnRvbG9neT9cbiAgICB9XG4gIH1cblxuICAvKiogY3JlYXRlIGh0bWwtc3RydWN0dXJlOyBhbGwgc2hvdWxkIHJldHVybiBhdCBsZWFzdCA8ZGl2PjwvZGl2PiAqKi9cbiAgc2hvd0NvbmZpZ3VyYXRpb24oKSB7XG4gICAgLyogY29uZmlndXJhdGlvbiBibG9jayAqL1xuICAgIGlmICghdGhpcy5zdGF0ZS5jb25maWd1cmF0aW9uIHx8ICF0aGlzLnN0YXRlLmNvbmZpZ3VyYXRpb25bJ2xpbmtzJ10pIHtcbiAgICAgIHJldHVybiA8ZGl2PjwvZGl2PjtcbiAgICB9XG4gICAgY29uc3Qgb3B0aW9ucyA9IE9iamVjdC5rZXlzKHRoaXMuc3RhdGUuY29uZmlndXJhdGlvblsnbGlua3MnXSkubWFwKChpdGVtKT0+e1xuICAgICAgcmV0dXJuICg8TWVudUl0ZW0gdmFsdWU9e2l0ZW19IGtleT17aXRlbX0+e2l0ZW19PC9NZW51SXRlbT4pO1xuICAgIH0pO1xuICAgIHJldHVybihcbiAgICAgIDxkaXYgc3R5bGU9e2Zsb3dUZXh0fT5cbiAgICAgICAgPGRpdiBzdHlsZT17aDF9PkNvbmZpZ3VyYXRpb248L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J3JvdyBtdC0yJz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTYnPlxuICAgICAgICAgICAgSW5mb3JtYXRpb24gb24gYWNjZXNzICh1c2VybmFtZSwgcGFzc3dvcmQpLCBkYXRhYmFzZSBjb25maWd1cmF0aW9uIGFuZCBsb2NhbCBmb2xkZXJzXG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPEZvcm1Db250cm9sIGZ1bGxXaWR0aCBjbGFzc05hbWU9J2NvbC1zbS02IHB4LTMnPlxuICAgICAgICAgICAgPFNlbGVjdCBvbkNoYW5nZT17ZT0+dGhpcy5jaGFuZ2VTZWxlY3RvcihlKX1cbiAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuY29uZmlndXJhdGlvblsnZGVmYXVsdCddfT5cbiAgICAgICAgICAgICAge29wdGlvbnN9XG4gICAgICAgICAgICA8L1NlbGVjdD5cbiAgICAgICAgICA8L0Zvcm1Db250cm9sPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93IG10LTInPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wtc20tNic+IEVkaXQgLyBDcmVhdGUgLyBEZWxldGUgY29uZmlndXJhdGlvbnMgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wtc20tNic+XG4gICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT0nYnRuLWJsb2NrJyB2YXJpYW50PVwiY29udGFpbmVkXCIgb25DbGljaz17dGhpcy50b2dnbGVDb25maWd1cmF0aW9ufVxuICAgICAgICAgICAgICBkaXNhYmxlZD17IXRoaXMuc3RhdGUucmVhZHl9IGlkPSdjb25maWdFZGl0b3JCdG4nIHN0eWxlPXtidG59PlxuICAgICAgICAgICAgICAgIENvbmZpZ3VyYXRpb24tRWRpdG9yXG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxNb2RhbENvbmZpZ3VyYXRpb24gc2hvdz17dGhpcy5zdGF0ZS5zaG93Q29uZmlndXJhdGlvbn0gY2FsbGJhY2s9e3RoaXMudG9nZ2xlQ29uZmlndXJhdGlvbn0vPlxuXG4gICAgICAgIHtFTEVDVFJPTiAmJiAgICAvLyAqKiogUmVhY3QtRWxlY3Ryb24gdmVyc2lvbiBUT0RPIHByLTEgb24gTG9jYWwtPlJlbW90ZSBidXR0b25cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93IG10LTInPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS02Jz5cbiAgICAgICAgICAgICAgU3luY2hyb25pemVcbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS02Jz5cbiAgICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9J2J0bi1ibG9jaycgdmFyaWFudD1cImNvbnRhaW5lZFwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCk9PnRoaXMucHJlc3NlZEJ1dHRvbignYnRuX2NmZ19iZV9zeW5jTFInKX0gc3R5bGU9e2J0bn0+XG4gICAgICAgICAgICAgICAgTG9jYWwgJmd0OyBSZW1vdGVcbiAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHsvKlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS0zIHBsLTEnPlxuICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT0nYnRuLWJsb2NrJyB2YXJpYW50PVwiY29udGFpbmVkXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKT0+dGhpcy5wcmVzc2VkQnV0dG9uKCdidG5fY2ZnX2JlX3N5bmNSTCcpfSBzdHlsZT17YnRufT5cbiAgICAgICAgICAgICAgICBSZW1vdGUgJmd0OyBMb2NhbFxuICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKi99XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIH1cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93IG10LTQnPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wtc20tNic+XG4gICAgICAgICAgICBPbnRvbG9neTogRGVmaW5lIHdoYXQgZGF0YSB0eXBlcyAoc2FtcGxlcywgbWVhc3VyZW1lbnRzLCAuLi4pXG4gICAgICAgICAgICB3aXRoIHdoaWNoIG1ldGFkYXRhIChuYW1lLCBjb21tZW50cywgLi4uKSB5b3Ugd2FudCB0byBzdG9yZS5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTYnPlxuICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9J2J0bi1ibG9jaycgdmFyaWFudD1cImNvbnRhaW5lZFwiIG9uQ2xpY2s9e3RoaXMudG9nZ2xlT250b2xvZ3l9XG4gICAgICAgICAgICAgIGRpc2FibGVkPXshdGhpcy5zdGF0ZS5yZWFkeX0gaWQ9J29udG9sb2d5QnRuJyBzdHlsZT17YnRufT5cbiAgICAgICAgICAgICAgICBRdWVzdGlvbm5haXJlLUVkaXRvclxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICA8TW9kYWxPbnRvbG9neSBzaG93PXt0aGlzLnN0YXRlLnNob3dPbnRvbG9neX0gY2FsbGJhY2s9e3RoaXMudG9nZ2xlT250b2xvZ3l9IC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG5cbiAgc2hvd1Rhc2tzKCl7XG4gICAgLyogc2hvdyBTeXN0ZW0gLyBNYWludGVuYW5jZSBibG9jayAqL1xuICAgIHJldHVybihcbiAgICAgIDxkaXYgc3R5bGU9e2Zsb3dUZXh0fT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J3JvdyBtYi0yJz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTYnIHN0eWxlPXtoMX0+U3lzdGVtPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS02Jz5cbiAgICAgICAgICAgIDxCdXR0b24gdmFyaWFudD1cImNvbnRhaW5lZFwiIHN0eWxlPXt7Li4uYnRuLCAuLi50aGlzLnN0YXRlLmhlYWx0aEJ1dHRvbn19XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMucHJlc3NlZEJ1dHRvbignYnRuX2NmZ19iZV90ZXN0Jyl9IGRpc2FibGVkPXshdGhpcy5zdGF0ZS5yZWFkeX1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPSdidG4tYmxvY2snPlxuICAgICAgICAgICAgICBIZWFsdGggY2hlY2tcbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge3RoaXMuc3RhdGUuaGVhbHRoVGV4dC5sZW5ndGg+MiAmJlxuICAgICAgICAgIDxBbGVydCBzZXZlcml0eT1cImVycm9yXCIga2V5PSdoZWFsdGhBbGVydCc+XG4gICAgICAgICAgICBBdCBsZWFzdCBhbiBlcnJvciBvY2N1cnJlZDogKGFmdGVyIHJlcGFpcjogXCJtYWludGFuY2UtY29tcGxldGUgcmVzdGFydFwiKTxiciAvPlxuICAgICAgICAgICAgPGRpdiBkYW5nZXJvdXNseVNldElubmVySFRNTD17eyBfX2h0bWw6IHRoaXMuc3RhdGUuaGVhbHRoVGV4dH19IC8+XG4gICAgICAgICAgPC9BbGVydD59XG4gICAgICAgIDxBY2NvcmRpb24gVHJhbnNpdGlvblByb3BzPXt7IHVubW91bnRPbkV4aXQ6IHRydWUsIHRpbWVvdXQ6MCB9fT5cbiAgICAgICAgICA8QWNjb3JkaW9uU3VtbWFyeSBleHBhbmRJY29uPXs8RXhwYW5kTW9yZUljb24vPn0gc3R5bGU9e2J0bn0+XG4gICAgICAgICAgICBNYWludGVuYW5jZVxuICAgICAgICAgIDwvQWNjb3JkaW9uU3VtbWFyeT5cbiAgICAgICAgICA8QWNjb3JkaW9uRGV0YWlscz5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdyb3cgbXQtMic+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS02Jz5cbiAgICAgICAgICAgICAgICAgIFJlc3RhcnQgYXBwbGljYXRpb246XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS0zIHByLTEnPlxuICAgICAgICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9J2J0bi1ibG9jaycgdmFyaWFudD1cImNvbnRhaW5lZFwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpPT50aGlzLnJlbG9hZCgnZmFzdCcpfSBzdHlsZT17YnRufT5cbiAgICAgICAgICAgICAgICAgICAgZmFzdCByZXN0YXJ0XG4gICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTMgcGwtMSc+XG4gICAgICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT0nYnRuLWJsb2NrJyB2YXJpYW50PVwiY29udGFpbmVkXCIgb25DbGljaz17KCk9PnRoaXMucmVsb2FkKCdjb21wbGV0ZScpfVxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17YnRufT5cbiAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZSByZXN0YXJ0XG4gICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3JvdyBtdC0yJz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTYnPlxuICAgICAgICAgICAgICAgICAgUmVzZXQgb250b2xvZ3kgLyBkZWxldGUgYWxsIHByZXZpb3VzbHkgZW50ZXJlZCBxdWVzdGlvbnMuXG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS02Jz5cbiAgICAgICAgICAgICAgICAgIDxCdXR0b24gb25DbGljaz17KCkgPT4gdGhpcy5wcmVzc2VkQnV0dG9uKCdidG5fY2ZnX2JlX3Rlc3REZXYnKX0gY2xhc3NOYW1lPSdidG4tYmxvY2snXG4gICAgICAgICAgICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIiBkaXNhYmxlZD17IXRoaXMuc3RhdGUucmVhZHl9IHN0eWxlPXtidG59PlxuICAgICAgICAgICAgICAgICAgICBSZXNldCBvbnRvbG9neVxuICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdyb3cgbXQtMic+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS02Jz5cbiAgICAgICAgICAgICAgICAgIFJlLWNoZWNrIGFuZCBnZXQgYWxsIGV4dHJhY3RvcnNcbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTYnPlxuICAgICAgICAgICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoKSA9PiB0aGlzLnByZXNzZWRCdXR0b24oJ2J0bl9jZmdfYmVfZXh0cmFjdG9yU2NhbicpfSBjbGFzc05hbWU9J2J0bi1ibG9jaydcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFudD1cImNvbnRhaW5lZFwiIGRpc2FibGVkPXshdGhpcy5zdGF0ZS5yZWFkeX0gc3R5bGU9e2J0bn0+XG4gICAgICAgICAgICAgICAgICAgIFNjYW4gZXh0cmFjdG9yc1xuICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdyb3cgbXQtMic+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS02Jz5cbiAgICAgICAgICAgICAgICAgIENvbmZpZ3VyYXRpb24gZmlsZSBpbiBob21lIGRpcmVjdG9yeVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wtc20tNic+XG4gICAgICAgICAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9eygpID0+IHRoaXMucHJlc3NlZEJ1dHRvbignYnRuX2NmZ19iZV92ZXJpZnlDb25maWd1cmF0aW9uRGV2Jyl9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0nYnRuLWJsb2NrJyB2YXJpYW50PVwiY29udGFpbmVkXCIgZGlzYWJsZWQ9eyF0aGlzLnN0YXRlLnJlYWR5fSBzdHlsZT17YnRufT5cbiAgICAgICAgICAgICAgICAgICAgQXV0b21hdGljYWxseSByZXBhaXIgY29uZmlndXJhdGlvblxuICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdyb3cgbXQtMic+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS02Jz5cbiAgICAgICAgICAgICAgICAgIFRlc3QgLyBSZXBhaXIgZGF0YWJhc2UgbG9naWM6IGUuZy4gcmV2aXNpb25zIG1ha2Ugc2Vuc2UsIFFSIGNvZGVzIGV4aXN0IGZvciBzYW1wbGVzLC4uLlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wtc20tMyBwci0xJz5cbiAgICAgICAgICAgICAgICAgIDxCdXR0b24gb25DbGljaz17KCkgPT4gdGhpcy5wcmVzc2VkQnV0dG9uKCdidG5fY2ZnX2JlX3ZlcmlmeURCJyl9IGNsYXNzTmFtZT0nYnRuLWJsb2NrJ1xuICAgICAgICAgICAgICAgICAgICB2YXJpYW50PVwiY29udGFpbmVkXCIgZGlzYWJsZWQ9eyF0aGlzLnN0YXRlLnJlYWR5fSBzdHlsZT17YnRufT5cbiAgICAgICAgICAgICAgICAgICAgVGVzdCBkYXRhYmFzZSBpbnRlZ3JpdHlcbiAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wtc20tMyBwbC0xJz5cbiAgICAgICAgICAgICAgICAgIDxCdXR0b24gb25DbGljaz17KCkgPT4gdGhpcy5wcmVzc2VkQnV0dG9uKCdidG5fY2ZnX2JlX3ZlcmlmeURCZGV2Jyl9IGNsYXNzTmFtZT0nYnRuLWJsb2NrJ1xuICAgICAgICAgICAgICAgICAgICB2YXJpYW50PVwiY29udGFpbmVkXCIgZGlzYWJsZWQ9eyF0aGlzLnN0YXRlLnJlYWR5fSBzdHlsZT17YnRufT5cbiAgICAgICAgICAgICAgICAgICAgUmVwYWlyIGRhdGFiYXNlXG4gICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3Jvdyc+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS02Jz5cbiAgICAgICAgICAgICAgICAgIEJhY2t1cCBmaWxlcyBhcmUgemlwLWZpbGVzIHdoaWNoIGluY2x1ZGUgYWxsIHRoZSBtZXRhIGRhdGEuIFVuemlwIGFuZCBvcGVuIHRoZSByZXN1bHRpbmdcbiAgICAgICAgICAgICAgICAgIGpzb24tZmlsZXMgd2l0aCB3ZWItYnJvd3Nlci5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTMgcHItMSc+XG4gICAgICAgICAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9eygpID0+IHRoaXMucHJlc3NlZEJ1dHRvbignYnRuX2NmZ19iZV9zYXZlQmFja3VwJyl9IGNsYXNzTmFtZT0nYnRuLWJsb2NrJ1xuICAgICAgICAgICAgICAgICAgICB2YXJpYW50PVwiY29udGFpbmVkXCIgZGlzYWJsZWQ9eyF0aGlzLnN0YXRlLnJlYWR5fSBzdHlsZT17YnRufT5cbiAgICAgICAgICAgICAgICAgICAgU2F2ZSBiYWNrdXBcbiAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wtc20tMyBwbC0xJz5cbiAgICAgICAgICAgICAgICAgIDxCdXR0b24gb25DbGljaz17KCkgPT4gdGhpcy5wcmVzc2VkQnV0dG9uKCdidG5fY2ZnX2JlX2xvYWRCYWNrdXAnKX0gY2xhc3NOYW1lPSdidG4tYmxvY2snXG4gICAgICAgICAgICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIiBkaXNhYmxlZD17IXRoaXMuc3RhdGUucmVhZHl9IHN0eWxlPXtidG59PlxuICAgICAgICAgICAgICAgICAgICBMb2FkIGJhY2t1cFxuICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93Jz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTYnPlxuICAgICAgICAgICAgICAgICAgRG93bmxvYWQgdXBkYXRlIHRvIGJhY2tlbmQgYW5kIGZyb250ZW5kIGZyb20ganVnaXQuZnotanVlbGljaC5kZSBzZXJ2ZXIuIEFmdGVyIHVwZGF0ZSxcbiAgICAgICAgICAgICAgICAgIHJlbG9hZCBhcHAgYnkgcHJlc3NpbmcgYnV0dG9uLlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wtc20tNic+XG4gICAgICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMucHJlc3NlZEJ1dHRvbignYnRuX2NmZ19iZV91cGRhdGVQQVNUQScpfSBjbGFzc05hbWU9J2J0bi1ibG9jaydcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFudD1cImNvbnRhaW5lZFwiIGRpc2FibGVkPXshdGhpcy5zdGF0ZS5yZWFkeX0gc3R5bGU9e2J0bn0+XG4gICAgICAgICAgICAgICAgICAgIFVwZGF0ZSBzb2Z0d2FyZVxuICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9BY2NvcmRpb25EZXRhaWxzPlxuICAgICAgICA8L0FjY29yZGlvbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBzaG93QWJvdXQoKSB7XG4gICAgLyogc2hvdyBhYm91dCBibG9jayAqL1xuICAgIHJldHVybihcbiAgICAgIDxkaXYgc3R5bGU9e2Zsb3dUZXh0fSA+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdyb3cnPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteC0zJz5cbiAgICAgICAgICAgIDxpbWcgc3JjPXtsb2dvfSBhbHQ9J2xvZ28sIGNoYW5nZWQgZnJvbSBmcmVlIGljb24gb2YgbW9ua2lrIEAgZmxhdGljb24uY29tJy8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMSBzdHlsZT17aDF9IGNsYXNzTmFtZT0nbWwtMyc+UEFTVEEgKGFkYVB0aXZlIG1BdGVyaWFscyBTY2llbmNlIG1lVGEgZEF0YSkgZGF0YWJhc2U8L2gxPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPHAgY2xhc3NOYW1lPVwibS0yXCI+XG4gICAgICAgICAgPHN0cm9uZz5MaW5rcyB0byBoZWxwIC8gbW9yZSBpbmZvcm1hdGlvbjwvc3Ryb25nPjxiciAvPlxuICAgICAgICAgIDxhIHRhcmdldD1cIl9ibGFua1wiICBocmVmPSdodHRwczovL2p1Z2l0LmZ6LWp1ZWxpY2guZGUvcGFzdGEvbWFpbi8tL3dpa2lzL3Ryb3VibGVzaG9vdGluZydcbiAgICAgICAgICAgIHN0eWxlPXt7Y29sb3I6dGV4dEZHfX0+XG4gICAgICAgICAgICAmZ3Q7IFdoYXQgaWYgcHJvYmxlbXMgb2NjdXIuLi5cbiAgICAgICAgICA8L2E+PGJyLz5cbiAgICAgICAgICA8YSB0YXJnZXQ9XCJfYmxhbmtcIiAgc3R5bGU9e3tjb2xvcjp0ZXh0Rkd9fVxuICAgICAgICAgICAgaHJlZj0naHR0cHM6Ly9qdWdpdC5mei1qdWVsaWNoLmRlL3Bhc3RhL21haW4vLS93aWtpcy9ob21lI2NvbmNlcHRzLW9mLXBhc3RhLWRhdGFiYXNlJz5cbiAgICAgICAgICAgICZndDsgQ29uY2VwdCBvZiBQQVNUQSAuLi5cbiAgICAgICAgICA8L2E+PGJyLz5cbiAgICAgICAgICA8YSB0YXJnZXQ9XCJfYmxhbmtcIiAgaHJlZj0naHR0cHM6Ly95b3V0dS5iZS85blZNcU1zMVd2dycgc3R5bGU9e3tjb2xvcjp0ZXh0Rkd9fT5cbiAgICAgICAgICAgICZndDsgQSB0ZWFzZXIgeW91dHViZSB2aWRlby4uLihpdCB1c2VzIHRoZSBvbGQgbmFtZTogamFtREIpPC9hPiA8YnIgLz5cbiAgICAgICAgPC9wPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG5cbiAgLyoqIHRoZSByZW5kZXIgbWV0aG9kICoqL1xuICByZW5kZXIoKXtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbnRhaW5lciBweC00IHB0LTInIHN0eWxlPXt7aGVpZ2h0OndpbmRvdy5pbm5lckhlaWdodC0zOCwgb3ZlcmZsb3dZOidzY3JvbGwnfX0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdwLTMnIHN0eWxlPXthcmVhfT5cbiAgICAgICAgICB7dGhpcy5zaG93Q29uZmlndXJhdGlvbigpfVxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICB7IEVMRUNUUk9OICYmICAgIC8vICoqKiBSZWFjdC1FbGVjdHJvbiB2ZXJzaW9uXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9J215LTMgcC0zJyBzdHlsZT17YXJlYX0+XG4gICAgICAgICAgICB7dGhpcy5zaG93VGFza3MoKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgfVxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdwLTMnIHN0eWxlPXthcmVhfT5cbiAgICAgICAgICB7dGhpcy5zaG93QWJvdXQoKX1cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J21iLTMgcC0zJyBzdHlsZT17YXJlYX0+XG4gICAgICAgICAgPHAgc3R5bGU9e2Zsb3dUZXh0fT5cbiAgICAgICAgICAgICogRHVyaW5nIGluaXRpYWwgc29mdHdhcmUgZGV2ZWxvcG1lbnQsIGNlcnRhaW4gZnVuY3Rpb25zIChlLmcuIGRlbGV0ZSwgc29tZSBmdW5jdGlvbnMgb25cbiAgICAgICAgICAgIHRoaXMgcGFnZSkgZXhpc3QgdGhhdCB3aWxsIGJlIHJlbW92ZWQgb25jZSBzb2Z0d2FyZSBtb3JlIHN0YWJsZS48L3A+XG4gICAgICAgICAgPHAgc3R5bGU9e2Zsb3dUZXh0fT5WZXJzaW9uIG51bWJlcjogMS4yLjI8L3A+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG5cbi8qXG4gICAgICAgIFNlbnRyeSB3YXJuaW5nXG4gICAgICAgID09PT09PT09PT09PT09XG4gICAgICAgICAgPHAgc3R5bGU9e2Zsb3dUZXh0fT48c3Ryb25nPldhcm5pbmc6PC9zdHJvbmc+XG4gICAgICAgICAgVG8gZmluZCB0aGUgcHJvYmxlbXMgdGhhdCBsZWFkIHRvIHRoZSBmYWlsdXJlIG9mIHRoZSBjb2RlIGFuZCB0byBlYXNpbHkgaGVscCwgd2UgdXNlXG4gICAgICAgICAgc2VudHJ5LmlvIHRvIGdldCBpbmZvcm1hdGlvbiB3aGVuIGEgY3Jhc2gvZXJyb3IvZmFpbHVyZSBvY2N1cnMuIFdlIG9ubHkgZ2V0IGluZm9ybWF0aW9uIG9uXG4gICAgICAgICAgd2hpY2ggcGFydCBvZiB0aGUgY29kZSB3YXMgcmVzcG9uc2libGUgYW5kIHRoZSBvcGVyYXRpbmcgc3lzdGVtLiBXZSBkbyBub3QgZ2V0L2NvbGxlY3QvY2FyZVxuICAgICAgICAgIGZvciBhbnkgZGF0YSBhbmQgbWV0YWRhdGEgdGhhdCB5b3Ugc2F2ZWQuPC9wPlxuXG4gICAgICAgICAgU2hvdyBoaXN0b3J5IG9mIGNvbW1pdHNcbiAgICAgICAgICA9PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93IG10LTInPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wtc20tNic+XG4gICAgICAgICAgICBTaG93IGhpc3Rvcnkgb2YgbW9kaWZpY2F0aW9ucyB0byB0aGlzIGRhdGFiYXNlXG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1zbS02Jz5cbiAgICAgICAgICAgIDxCdXR0b24gb25DbGljaz17KCkgPT4gdGhpcy5wcmVzc2VkQnV0dG9uKCdidG5fY2ZnX2JlX2hpc3RvcnknKX0gY2xhc3NOYW1lPSdidG4tYmxvY2snXG4gICAgICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIiBkaXNhYmxlZD17IXRoaXMuc3RhdGUucmVhZHl9IHN0eWxlPXtidG59PlxuICAgICAgICAgICAgICB7IXRoaXMuc3RhdGUuaGlzdG9yeSAmJiAnU2hvdyBoaXN0b3J5J31cbiAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLmhpc3RvcnkgJiYgJ0hpZGUgaGlzdG9yeSd9XG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHt0aGlzLnN0YXRlLmhpc3RvcnkgJiZcbiAgICAgICAgPEJhciBjbGFzc05hbWU9J215LTInIGRhdGE9e3RoaXMuc3RhdGUuaGlzdG9yeX0gLz5cbiAgICAgICAgfVxuKi9cbiJdLCJmaWxlIjoicmVuZGVyZXIvY29tcG9uZW50cy9Db25maWdQYWdlLmpzIn0=
