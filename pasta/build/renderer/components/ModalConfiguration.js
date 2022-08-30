"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _core = require("@material-ui/core");

var _icons = require("@material-ui/icons");

var _lab = require("@material-ui/lab");

var _qrcode = _interopRequireDefault(require("qrcode.react"));

var _axios = _interopRequireDefault(require("axios"));

var _localInteraction = require("../localInteraction");

var _style = require("../style");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* CONFIGURATION-EDITOR
 * Modal that allows the user to add/edit database configurations
*/
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
// eslint-disable-line no-unused-vars
class ModalConfiguration extends _react.Component {
  constructor() {
    super();

    this.togglePWD = () => {
      this.setState({
        showPassword: !this.state.showPassword
      });
    };

    this.pressedSaveBtn = () => {
      var link = this.state.link;

      if (link.local.cred) {
        delete link.local['user'];
        delete link.local['password'];
      }

      if (link.remote.cred) {
        delete link.remote['user'];
        delete link.remote['password'];
      }

      link['name'] = this.state.config;
      (0, _localInteraction.saveCredentials)(link);
      this.props.callback();
    };

    this.pressedTestBtn = () => {
      var link = { ...this.state.link
      }; //local tests -- no creation on QR code

      if (link.local.user && link.local.user.length > 0) {
        _axios.default.get('http://127.0.0.1:5984').then(res => {
          if (res.data.couchdb == 'Welcome') {
            this.setState({
              local: Object.assign(this.state.local, {
                testServer: 'OK'
              })
            });
          }
        }).catch(() => {
          this.setState({
            local: Object.assign(this.state.local, {
              testServer: 'ERROR',
              testLogin: 'ERROR',
              testDB: 'ERROR'
            })
          });
        });

        _axios.default.get('http://127.0.0.1:5984/_all_dbs', {
          auth: {
            username: link.local.user,
            password: link.local.password
          }
        }).then(() => {
          this.setState({
            local: Object.assign(this.state.local, {
              testLogin: 'OK'
            })
          });
        }).catch(() => {
          this.setState({
            local: Object.assign(this.state.local, {
              testLogin: 'ERROR',
              testDB: 'ERROR'
            })
          });
        });

        _axios.default.get('http://127.0.0.1:5984/' + link.local.database + '/', {
          auth: {
            username: link.local.user,
            password: link.local.password
          }
        }).then(res => {
          if (res.data.db_name == link.local.database) {
            this.setState({
              local: Object.assign(this.state.local, {
                testDB: 'OK'
              })
            });
          } else {
            this.setState({
              local: Object.assign(this.state.local, {
                testDB: 'ERROR'
              })
            });
          }
        }).catch(() => {
          this.setState({
            local: Object.assign(this.state.local, {
              testDB: 'ERROR'
            })
          });
        });

        if ((0, _localInteraction.testDirectory)(link.local.path)) {
          this.setState({
            local: Object.assign(this.state.local, {
              testPath: 'OK'
            })
          });
        } else {
          this.setState({
            local: Object.assign(this.state.local, {
              testPath: 'ERROR'
            })
          });
        }
      } else {
        //if no local user given
        this.setState({
          local: {
            testPath: 'OK',
            testServer: 'OK',
            testLogin: 'OK',
            testDB: 'OK'
          }
        });
      } //remote tests and create QR code


      if (link.remote.user) {
        const server = link.remote.url.indexOf('http') > -1 ? link.remote.url.split(':')[1].slice(2) : link.remote.url;
        var url = server.length == 0 ? '' : 'http://' + server + ':5984';

        _axios.default.get(url).then(res => {
          if (res.data.couchdb == 'Welcome') {
            this.setState({
              remote: Object.assign(this.state.remote, {
                testServer: 'OK'
              })
            });
          }
        }).catch(() => {
          this.setState({
            remote: Object.assign(this.state.remote, {
              testServer: 'ERROR',
              testLogin: 'ERROR',
              testDB: 'ERROR'
            })
          });
        });

        _axios.default.get(url + '/' + link.remote.database + '/', {
          auth: {
            username: link.remote.user,
            password: link.remote.password
          }
        }).then(res => {
          if (res.data.db_name == link.remote.database) {
            this.setState({
              remote: Object.assign(this.state.remote, {
                testLogin: 'OK',
                testDB: 'OK'
              })
            });
          }
        }).catch(() => {
          this.setState({
            remote: Object.assign(this.state.remote, {
              testLogin: 'ERROR',
              testDB: 'ERROR'
            })
          });
        });

        const qrString = {
          server: server,
          user: link.remote.user,
          password: link.remote.password,
          database: link.remote.database
        };
        this.setState({
          qrString: JSON.stringify({
            [this.state.config]: qrString
          })
        });
      } else {
        this.setState({
          remote: Object.assign(this.state.remote, {
            testLogin: 'OK',
            testDB: 'OK'
          }),
          link: Object.assign(this.state.link, {
            remote: {
              user: '',
              password: '',
              database: '',
              url: ''
            }
          })
        });
      }
    };

    this.pressedDeleteBtn = () => {
      (0, _localInteraction.deleteConfig)(this.state.config);
      var configuration = this.state.configuration;
      delete configuration[this.state.config];
      this.setState({
        configuration: configuration,
        config: '--addNew--'
      });
      this.setState({
        link: {
          user: '',
          password: '',
          database: '',
          url: '',
          path: (0, _localInteraction.getHomeDir)(),
          name: ''
        }
      });
    };

    this.createDB = () => {
      /** Create database on local server */
      var conf = this.state.link;

      var url = _axios.default.create({
        baseURL: 'http://127.0.0.1:5984',
        auth: {
          username: conf.local.user.trim(),
          password: conf.local.password.trim()
        }
      });

      url.put(conf.local.database).then(res => {
        if (res.data.ok == true) {
          console.log('Success creating database. Ontology will be created during health test.');
          this.setState({
            local: Object.assign(this.state.local, {
              testDB: 'OK'
            })
          });
        } else {
          this.setState({
            local: Object.assign(this.state.local, {
              testDB: 'ERROR'
            })
          });
        }
      }).catch(() => {
        this.setState({
          local: Object.assign(this.state.local, {
            testDB: 'ERROR'
          })
        });
      });
    };

    this.changeConfigSelector = event => {
      this.setState({
        config: event.target.value
      });
      var thisConfig = this.state.configuration.links[event.target.value];

      if (thisConfig) {
        if (thisConfig.remote.cred) {
          const ups = (0, _localInteraction.getUP)('"' + thisConfig.local.cred.toString() + ' ' + thisConfig.remote.cred.toString() + '"');
          thisConfig.local['user'] = ups[0][0];
          thisConfig.local['password'] = ups[0][1];
          thisConfig.remote['user'] = ups[1][0];
          thisConfig.remote['password'] = ups[1][1];
        } else {
          const ups = (0, _localInteraction.getUP)('"' + thisConfig.local.cred.toString() + '"');
          thisConfig.local['user'] = ups[0];
          thisConfig.local['password'] = ups[1];
          thisConfig['remote'] = {
            'url': '',
            'database': '',
            'user': '',
            'password': ''
          };
        }

        this.setState({
          link: thisConfig
        });
      } else {
        this.setState({
          link: {
            'local': {
              'database': '',
              'path': (0, _localInteraction.getHomeDir)(),
              'user': '',
              'password': ''
            },
            'remote': {
              'url': '',
              'database': '',
              'user': '',
              'password': ''
            }
          }
        });
      }
    };

    this.loginChange = (event, task, site) => {
      if (site) {
        var link = this.state.link;
        link[site][task] = task == 'database' ? event.target.value.replace(/^[^a-z]|[\W]/g, '').toLowerCase() : event.target.value;
        this.setState({
          link: link
        });
      } else {
        const name = event.target.value.replace(/^[^a-z]|[\W]/g, '').toLowerCase();
        this.setState({
          config: name
        });
      }
    };

    this.callback = content => {
      const inData = JSON.parse(content.split('\n')[0]);
      const remoteLinkBranch = {
        user: inData['user-name'],
        password: inData['password'],
        database: inData['database'],
        url: inData['Server']
      };
      this.setState({
        link: Object.assign(this.state.link, {
          remote: remoteLinkBranch
        })
      });
    };

    this.state = {
      link: null,
      showPassword: false,
      config: '--addNew--',
      qrString: '',
      local: {
        testServer: '',
        testLogin: '',
        testDB: '',
        testPath: ''
      },
      remote: {
        testServer: '',
        testLogin: '',
        testDB: ''
      }
    };
  }

  componentDidMount() {
    this.setState({
      link: {
        'local': {
          'database': '',
          'path': (0, _localInteraction.getHomeDir)(),
          'user': '',
          'password': ''
        },
        'remote': {
          'url': '',
          'database': '',
          'user': '',
          'password': ''
        }
      }
    });
    this.setState({
      configuration: (0, _localInteraction.getCredentials)().configuration
    });
  }
  /** Functions as class properties (immediately bound): react on user interactions **/


  //File handling: what to do with content
  onChangeFile(event) {
    event.stopPropagation();
    event.preventDefault();
    const reader = new FileReader();

    reader.onload = async event => {
      (0, _localInteraction.executeCmd)('btn_modCfg_be_decipher', this.callback, null, event.target.result);
    };

    reader.readAsBinaryString(event.target.files[0]);
  }

  /** the render method **/
  render() {
    const {
      link,
      showPassword
    } = this.state;

    if (this.props.show == 'none' || !link) {
      return /*#__PURE__*/_react.default.createElement("div", null);
    }

    var options = this.state.configuration ? Object.keys(this.state.configuration.links) : [];
    options = options.map(item => {
      return /*#__PURE__*/_react.default.createElement(_core.MenuItem, {
        value: item,
        key: item
      }, item);
    });
    options = options.concat( /*#__PURE__*/_react.default.createElement(_core.MenuItem, {
      key: "--addNew--",
      value: "--addNew--"
    }, '-- Add new --'));
    const enabled = this.state.local.testLogin == 'OK' && this.state.local.testPath == 'OK' && this.state.local.testDB == 'OK' && this.state.remote.testLogin == 'OK' && this.state.remote.testDB == 'OK';
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "modal",
      style: { ..._style.modal,
        ...{
          display: this.props.show
        }
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
    }, "Add / Edit / Show configuration"), /*#__PURE__*/_react.default.createElement("div", {
      className: "row p-4"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6 pt-3"
    }, /*#__PURE__*/_react.default.createElement(_core.Select, {
      onChange: e => this.changeConfigSelector(e),
      value: this.state.config,
      fullWidth: true
    }, options)), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, /*#__PURE__*/_react.default.createElement(_core.TextField, {
      type: "text",
      label: "configuration name",
      onChange: e => this.loginChange(e, 'name'),
      value: this.state.config == '--addNew--' ? '' : this.state.config,
      required: true,
      fullWidth: true,
      id: "confName"
    }))), /*#__PURE__*/_react.default.createElement("div", {
      className: "row p-3"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-4"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "p-2"
    }, /*#__PURE__*/_react.default.createElement("strong", null, "Local server")), /*#__PURE__*/_react.default.createElement("div", {
      className: "form-popup m-2"
    }, /*#__PURE__*/_react.default.createElement("form", {
      className: "form-container"
    }, /*#__PURE__*/_react.default.createElement(_core.TextField, {
      type: "text",
      label: "username",
      value: link.local.user,
      required: true,
      fullWidth: true,
      onChange: e => this.loginChange(e, 'user', 'local'),
      id: "local_confUser"
    }), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement(_core.FormControl, {
      fullWidth: true
    }, /*#__PURE__*/_react.default.createElement(_core.InputLabel, {
      htmlFor: "standard-adornment-password"
    }, "password"), /*#__PURE__*/_react.default.createElement(_core.Input, {
      fullWidth: true,
      id: "local_password",
      required: true,
      type: showPassword ? 'text' : 'password',
      value: link.local.password,
      onChange: e => this.loginChange(e, 'password', 'local'),
      endAdornment: /*#__PURE__*/_react.default.createElement(_core.InputAdornment, {
        position: "end"
      }, /*#__PURE__*/_react.default.createElement(_core.IconButton, {
        "aria-label": "toggle password visibility",
        onClick: this.togglePWD
      }, showPassword ? /*#__PURE__*/_react.default.createElement(_icons.Visibility, null) : /*#__PURE__*/_react.default.createElement(_icons.VisibilityOff, null)))
    })), /*#__PURE__*/_react.default.createElement(_core.TextField, {
      type: "text",
      label: "database",
      value: link.local.database,
      required: true,
      fullWidth: true,
      onChange: e => this.loginChange(e, 'database', 'local'),
      id: "local_confDatabase"
    }), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement(_core.TextField, {
      type: "text",
      label: "path",
      value: link.local.path,
      onChange: e => this.loginChange(e, 'path', 'local'),
      required: true,
      fullWidth: true
    })))), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-8"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "p-2"
    }, /*#__PURE__*/_react.default.createElement("strong", null, "Remote server")), /*#__PURE__*/_react.default.createElement("div", {
      className: "row p-0"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "form-popup m-2"
    }, /*#__PURE__*/_react.default.createElement("form", {
      className: "form-container"
    }, /*#__PURE__*/_react.default.createElement(_core.TextField, {
      type: "text",
      label: "username",
      value: link.remote.user,
      required: true,
      fullWidth: true,
      onChange: e => this.loginChange(e, 'user', 'remote'),
      id: "remote_confUser"
    }), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement(_core.FormControl, {
      fullWidth: true
    }, /*#__PURE__*/_react.default.createElement(_core.InputLabel, {
      htmlFor: "standard-adornment-password"
    }, "password"), /*#__PURE__*/_react.default.createElement(_core.Input, {
      fullWidth: true,
      id: "remote_password",
      required: true,
      type: showPassword ? 'text' : 'password',
      value: link.remote.password,
      onChange: e => this.loginChange(e, 'password', 'remote'),
      endAdornment: /*#__PURE__*/_react.default.createElement(_core.InputAdornment, {
        position: "end"
      }, /*#__PURE__*/_react.default.createElement(_core.IconButton, {
        "aria-label": "toggle password visibility",
        onClick: this.togglePWD
      }, showPassword ? /*#__PURE__*/_react.default.createElement(_icons.Visibility, null) : /*#__PURE__*/_react.default.createElement(_icons.VisibilityOff, null)))
    })), /*#__PURE__*/_react.default.createElement(_core.TextField, {
      type: "text",
      label: "database",
      value: link.remote.database,
      required: true,
      fullWidth: true,
      onChange: e => this.loginChange(e, 'database', 'remote'),
      id: "remote_confDatabase"
    }), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement(_core.TextField, {
      type: "text",
      label: "server",
      value: link.remote.url,
      required: true,
      fullWidth: true,
      onChange: e => this.loginChange(e, 'url', 'remote'),
      id: "remote_confUrl"
    })))), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-6 py-0 px-3"
    }, this.state.qrString != '' && /*#__PURE__*/_react.default.createElement(_qrcode.default, {
      value: this.state.qrString,
      size: 280
    }))))), this.state.local.testServer == 'ERROR' && /*#__PURE__*/_react.default.createElement(_lab.Alert, {
      severity: "error"
    }, "Local couch-DB installation incorrect. Please check it!"), this.state.remote.testServer == 'ERROR' && /*#__PURE__*/_react.default.createElement(_lab.Alert, {
      severity: "error"
    }, "Remote server IP incorrect or non-reachable. Please check it!"), this.state.local.testServer == 'OK' && this.state.local.testLogin == 'ERROR' && /*#__PURE__*/_react.default.createElement(_lab.Alert, {
      severity: "error"
    }, "Local couch-DB user name and password incorrect."), this.state.local.testServer == 'OK' && this.state.local.testLogin == 'OK' && this.state.local.testDB == 'ERROR' && /*#__PURE__*/_react.default.createElement(_lab.Alert, {
      severity: "error"
    }, "Local couch-DB database does not exist.", /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.createDB(),
      fullWidth: true,
      variant: "contained",
      id: "createBtn",
      style: _style.btn
    }, "Create now!")), this.state.remote.testServer == 'OK' && this.state.remote.testLogin == 'ERROR' && /*#__PURE__*/_react.default.createElement(_lab.Alert, {
      severity: "error"
    }, "Remote server: Remote couch-DB user name, password or database on server incorrect."), this.state.local.testPath == 'ERROR' && /*#__PURE__*/_react.default.createElement(_lab.Alert, {
      severity: "error"
    }, "Path does not exist. Please create it manually!"), enabled && /*#__PURE__*/_react.default.createElement(_lab.Alert, null, /*#__PURE__*/_react.default.createElement("strong", null, "Test was successful!")), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-sm-12 p-3"
    }, /*#__PURE__*/_react.default.createElement(_core.Grid, {
      container: true,
      spacing: 4
    }, /*#__PURE__*/_react.default.createElement(_core.Grid, {
      item: true,
      xs: true
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => {
        this.upload.click();
      },
      fullWidth: true,
      label: "Open File",
      primary: "false",
      variant: "contained",
      id: "loadBtn",
      style: _style.btn
    }, "Load from file"), /*#__PURE__*/_react.default.createElement("input", {
      id: "myInput",
      type: "file",
      ref: ref => this.upload = ref,
      style: {
        display: 'none'
      },
      onChange: this.onChangeFile.bind(this)
    })), /*#__PURE__*/_react.default.createElement(_core.Grid, {
      item: true,
      xs: true
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.pressedTestBtn(),
      fullWidth: true,
      variant: "contained",
      id: "confQRBtn",
      style: _style.btnStrong
    }, "Test ", !this.state.link.path && '& generate QR')), /*#__PURE__*/_react.default.createElement(_core.Grid, {
      item: true,
      xs: true
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.pressedDeleteBtn(),
      fullWidth: true,
      variant: "contained",
      disabled: !enabled,
      id: "confDeleteBtn",
      style: !enabled ? { ..._style.btn,
        backgroundColor: _style.colorBG
      } : _style.btn
    }, "Delete")), /*#__PURE__*/_react.default.createElement(_core.Grid, {
      item: true,
      xs: true
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.pressedSaveBtn(),
      fullWidth: true,
      variant: "contained",
      style: !enabled ? { ..._style.btnStrong,
        backgroundColor: _style.colorBG
      } : _style.btnStrong,
      disabled: !enabled,
      id: "confSaveBtn"
    }, "Save")), /*#__PURE__*/_react.default.createElement(_core.Grid, {
      item: true,
      xs: true
    }, /*#__PURE__*/_react.default.createElement(_core.Button, {
      onClick: () => this.props.callback(),
      fullWidth: true,
      variant: "contained",
      id: "closeBtn",
      style: _style.btn
    }, "Cancel")))))));
  }

}

exports.default = ModalConfiguration;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlcmVyL2NvbXBvbmVudHMvTW9kYWxDb25maWd1cmF0aW9uLmpzIl0sIm5hbWVzIjpbIk1vZGFsQ29uZmlndXJhdGlvbiIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwidG9nZ2xlUFdEIiwic2V0U3RhdGUiLCJzaG93UGFzc3dvcmQiLCJzdGF0ZSIsInByZXNzZWRTYXZlQnRuIiwibGluayIsImxvY2FsIiwiY3JlZCIsInJlbW90ZSIsImNvbmZpZyIsInByb3BzIiwiY2FsbGJhY2siLCJwcmVzc2VkVGVzdEJ0biIsInVzZXIiLCJsZW5ndGgiLCJheGlvcyIsImdldCIsInRoZW4iLCJyZXMiLCJkYXRhIiwiY291Y2hkYiIsIk9iamVjdCIsImFzc2lnbiIsInRlc3RTZXJ2ZXIiLCJjYXRjaCIsInRlc3RMb2dpbiIsInRlc3REQiIsImF1dGgiLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwiZGF0YWJhc2UiLCJkYl9uYW1lIiwicGF0aCIsInRlc3RQYXRoIiwic2VydmVyIiwidXJsIiwiaW5kZXhPZiIsInNwbGl0Iiwic2xpY2UiLCJxclN0cmluZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJwcmVzc2VkRGVsZXRlQnRuIiwiY29uZmlndXJhdGlvbiIsIm5hbWUiLCJjcmVhdGVEQiIsImNvbmYiLCJjcmVhdGUiLCJiYXNlVVJMIiwidHJpbSIsInB1dCIsIm9rIiwiY29uc29sZSIsImxvZyIsImNoYW5nZUNvbmZpZ1NlbGVjdG9yIiwiZXZlbnQiLCJ0YXJnZXQiLCJ2YWx1ZSIsInRoaXNDb25maWciLCJsaW5rcyIsInVwcyIsInRvU3RyaW5nIiwibG9naW5DaGFuZ2UiLCJ0YXNrIiwic2l0ZSIsInJlcGxhY2UiLCJ0b0xvd2VyQ2FzZSIsImNvbnRlbnQiLCJpbkRhdGEiLCJwYXJzZSIsInJlbW90ZUxpbmtCcmFuY2giLCJjb21wb25lbnREaWRNb3VudCIsIm9uQ2hhbmdlRmlsZSIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwicmVhZGVyIiwiRmlsZVJlYWRlciIsIm9ubG9hZCIsInJlc3VsdCIsInJlYWRBc0JpbmFyeVN0cmluZyIsImZpbGVzIiwicmVuZGVyIiwic2hvdyIsIm9wdGlvbnMiLCJrZXlzIiwibWFwIiwiaXRlbSIsImNvbmNhdCIsImVuYWJsZWQiLCJtb2RhbCIsImRpc3BsYXkiLCJtb2RhbENvbnRlbnQiLCJoMSIsImJ0blN0cm9uZyIsImUiLCJidG4iLCJ1cGxvYWQiLCJjbGljayIsInJlZiIsImJpbmQiLCJiYWNrZ3JvdW5kQ29sb3IiLCJjb2xvckJHIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBR0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7Ozs7Ozs7O0FBWkE7QUFDQTtBQUNBO0FBQ2tFO0FBRVU7QUFDVjtBQUNBO0FBQ0Q7QUFNbEQsTUFBTUEsa0JBQU4sU0FBaUNDLGdCQUFqQyxDQUEyQztBQUN4REMsRUFBQUEsV0FBVyxHQUFHO0FBQ1o7O0FBRFksU0FtQmRDLFNBbkJjLEdBbUJGLE1BQU07QUFDaEIsV0FBS0MsUUFBTCxDQUFjO0FBQUVDLFFBQUFBLFlBQVksRUFBRSxDQUFDLEtBQUtDLEtBQUwsQ0FBV0Q7QUFBNUIsT0FBZDtBQUNELEtBckJhOztBQUFBLFNBdUJkRSxjQXZCYyxHQXVCRyxNQUFNO0FBQ3JCLFVBQUlDLElBQUksR0FBRyxLQUFLRixLQUFMLENBQVdFLElBQXRCOztBQUNBLFVBQUlBLElBQUksQ0FBQ0MsS0FBTCxDQUFXQyxJQUFmLEVBQXFCO0FBQ25CLGVBQU9GLElBQUksQ0FBQ0MsS0FBTCxDQUFXLE1BQVgsQ0FBUDtBQUNBLGVBQU9ELElBQUksQ0FBQ0MsS0FBTCxDQUFXLFVBQVgsQ0FBUDtBQUNEOztBQUNELFVBQUlELElBQUksQ0FBQ0csTUFBTCxDQUFZRCxJQUFoQixFQUFzQjtBQUNwQixlQUFPRixJQUFJLENBQUNHLE1BQUwsQ0FBWSxNQUFaLENBQVA7QUFDQSxlQUFPSCxJQUFJLENBQUNHLE1BQUwsQ0FBWSxVQUFaLENBQVA7QUFDRDs7QUFDREgsTUFBQUEs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LEtBQUszRixjQUFMLEVBQXZCO0FBQThDLE1BQUEsU0FBUyxNQUF2RDtBQUF3RCxNQUFBLE9BQU8sRUFBQyxXQUFoRTtBQUNFLE1BQUEsS0FBSyxFQUFFLENBQUNvRixPQUFELEdBQVcsRUFBQyxHQUFHSyxnQkFBSjtBQUFlTyxRQUFBQSxlQUFlLEVBQUNDO0FBQS9CLE9BQVgsR0FBcURSLGdCQUQ5RDtBQUVFLE1BQUEsUUFBUSxFQUFFLENBQUNMLE9BRmI7QUFFc0IsTUFBQSxFQUFFLEVBQUM7QUFGekIsY0FERixDQXRCRixlQTZCRSw2QkFBQyxVQUFEO0FBQU0sTUFBQSxJQUFJLE1BQVY7QUFBVyxNQUFBLEVBQUU7QUFBYixvQkFDRSw2QkFBQyxZQUFEO0FBQVEsTUFBQSxPQUFPLEVBQUUsTUFBTSxLQUFLOUUsS0FBTCxDQUFXQyxRQUFYLEVBQXZCO0FBQThDLE1BQUEsU0FBUyxNQUF2RDtBQUNFLE1BQUEsT0FBTyxFQUFDLFdBRFY7QUFDc0IsTUFBQSxFQUFFLEVBQUMsVUFEekI7QUFDb0MsTUFBQSxLQUFLLEVBQUVvRjtBQUQzQyxnQkFERixDQTdCRixDQURGLENBcEhGLENBREYsQ0FERixDQURGO0FBa0tEOztBQTdXdUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBDT05GSUdVUkFUSU9OLUVESVRPUlxuICogTW9kYWwgdGhhdCBhbGxvd3MgdGhlIHVzZXIgdG8gYWRkL2VkaXQgZGF0YWJhc2UgY29uZmlndXJhdGlvbnNcbiovXG5pbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50IH0gZnJvbSAncmVhY3QnOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgeyBCdXR0b24sIElucHV0LCBJbnB1dEFkb3JubWVudCwgSWNvbkJ1dHRvbiwgVGV4dEZpZWxkLCAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIElucHV0TGFiZWwsIFNlbGVjdCwgTWVudUl0ZW0sIEZvcm1Db250cm9sLCBHcmlkfSBmcm9tICdAbWF0ZXJpYWwtdWkvY29yZSc7Ly8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IHsgVmlzaWJpbGl0eSwgVmlzaWJpbGl0eU9mZiB9IGZyb20gJ0BtYXRlcmlhbC11aS9pY29ucyc7ICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IHsgQWxlcnQgfSBmcm9tICdAbWF0ZXJpYWwtdWkvbGFiJzsgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IFFSQ29kZSBmcm9tICdxcmNvZGUucmVhY3QnOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xuaW1wb3J0IHsgc2F2ZUNyZWRlbnRpYWxzLCBnZXRIb21lRGlyLCBnZXRDcmVkZW50aWFscywgZGVsZXRlQ29uZmlnLCBnZXRVUCwgdGVzdERpcmVjdG9yeSxcbiAgZXhlY3V0ZUNtZCB9IGZyb20gJy4uL2xvY2FsSW50ZXJhY3Rpb24nO1xuaW1wb3J0IHsgbW9kYWwsIG1vZGFsQ29udGVudCwgYnRuLCBidG5TdHJvbmcsIGgxLCBjb2xvckJHfSBmcm9tICcuLi9zdHlsZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZGFsQ29uZmlndXJhdGlvbiBleHRlbmRzIENvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGxpbms6IG51bGwsXG4gICAgICBzaG93UGFzc3dvcmQ6IGZhbHNlLFxuICAgICAgY29uZmlnOiAnLS1hZGROZXctLScsXG4gICAgICBxclN0cmluZzogJycsXG4gICAgICBsb2NhbDogIHt0ZXN0U2VydmVyOiAnJywgdGVzdExvZ2luOiAnJywgdGVzdERCOiAnJywgdGVzdFBhdGg6ICcnfSxcbiAgICAgIHJlbW90ZToge3Rlc3RTZXJ2ZXI6ICcnLCB0ZXN0TG9naW46ICcnLCB0ZXN0REI6ICcnfVxuICAgIH07XG4gIH1cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7bGluazogeydsb2NhbCc6eydkYXRhYmFzZSc6JycsJ3BhdGgnOmdldEhvbWVEaXIoKSwndXNlcic6JycsJ3Bhc3N3b3JkJzogJyd9LFxuICAgICAgJ3JlbW90ZSc6IHsndXJsJzogJycsICdkYXRhYmFzZSc6ICcnLCAndXNlcic6ICcnLCAncGFzc3dvcmQnOicnfX19KTtcbiAgICB0aGlzLnNldFN0YXRlKHtjb25maWd1cmF0aW9uOiBnZXRDcmVkZW50aWFscygpLmNvbmZpZ3VyYXRpb24gfSk7XG4gIH1cblxuXG4gIC8qKiBGdW5jdGlvbnMgYXMgY2xhc3MgcHJvcGVydGllcyAoaW1tZWRpYXRlbHkgYm91bmQpOiByZWFjdCBvbiB1c2VyIGludGVyYWN0aW9ucyAqKi9cbiAgdG9nZ2xlUFdEID0gKCkgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoeyBzaG93UGFzc3dvcmQ6ICF0aGlzLnN0YXRlLnNob3dQYXNzd29yZCB9KTtcbiAgfVxuXG4gIHByZXNzZWRTYXZlQnRuID0gKCkgPT4ge1xuICAgIHZhciBsaW5rID0gdGhpcy5zdGF0ZS5saW5rO1xuICAgIGlmIChsaW5rLmxvY2FsLmNyZWQpIHtcbiAgICAgIGRlbGV0ZSBsaW5rLmxvY2FsWyd1c2VyJ107XG4gICAgICBkZWxldGUgbGluay5sb2NhbFsncGFzc3dvcmQnXTtcbiAgICB9XG4gICAgaWYgKGxpbmsucmVtb3RlLmNyZWQpIHtcbiAgICAgIGRlbGV0ZSBsaW5rLnJlbW90ZVsndXNlciddO1xuICAgICAgZGVsZXRlIGxpbmsucmVtb3RlWydwYXNzd29yZCddO1xuICAgIH1cbiAgICBsaW5rWyduYW1lJ10gPSB0aGlzLnN0YXRlLmNvbmZpZztcbiAgICBzYXZlQ3JlZGVudGlhbHMobGluayk7XG4gICAgdGhpcy5wcm9wcy5jYWxsYmFjaygpO1xuICB9XG5cbiAgcHJlc3NlZFRlc3RCdG4gPSAoKSA9PiB7XG4gICAgdmFyIGxpbmsgPSB7Li4udGhpcy5zdGF0ZS5saW5rfTtcblxuICAgIC8vbG9jYWwgdGVzdHMgLS0gbm8gY3JlYXRpb24gb24gUVIgY29kZVxuICAgIGlmIChsaW5rLmxvY2FsLnVzZXIgJiYgbGluay5sb2NhbC51c2VyLmxlbmd0aD4wKSB7XG4gICAgICBheGlvcy5nZXQoJ2h0dHA6Ly8xMjcuMC4wLjE6NTk4NCcpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICBpZiAocmVzLmRhdGEuY291Y2hkYiA9PSAnV2VsY29tZScpIHtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtsb2NhbDpPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUubG9jYWwse3Rlc3RTZXJ2ZXI6J09LJ30pfSk7XG4gICAgICAgIH1cbiAgICAgIH0pLmNhdGNoKCgpPT57XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2xvY2FsOk9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZS5sb2NhbCxcbiAgICAgICAgICB7dGVzdFNlcnZlcjonRVJST1InLCB0ZXN0TG9naW46J0VSUk9SJyx0ZXN0REI6J0VSUk9SJ30pfSk7XG4gICAgICB9KTtcbiAgICAgIGF4aW9zLmdldCgnaHR0cDovLzEyNy4wLjAuMTo1OTg0L19hbGxfZGJzJyxcbiAgICAgICAgeyBhdXRoOiB7IHVzZXJuYW1lOiBsaW5rLmxvY2FsLnVzZXIsIHBhc3N3b3JkOiBsaW5rLmxvY2FsLnBhc3N3b3JkIH0gfSkudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2xvY2FsOk9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZS5sb2NhbCx7dGVzdExvZ2luOidPSyd9KX0pO1xuICAgICAgfSkuY2F0Y2goKCk9PntcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bG9jYWw6T2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLmxvY2FsLCB7dGVzdExvZ2luOidFUlJPUicsdGVzdERCOidFUlJPUid9KX0pO1xuICAgICAgfSk7XG4gICAgICBheGlvcy5nZXQoJ2h0dHA6Ly8xMjcuMC4wLjE6NTk4NC8nICsgbGluay5sb2NhbC5kYXRhYmFzZSArICcvJyxcbiAgICAgICAgeyBhdXRoOiB7IHVzZXJuYW1lOiBsaW5rLmxvY2FsLnVzZXIsIHBhc3N3b3JkOiBsaW5rLmxvY2FsLnBhc3N3b3JkIH0gfSkudGhlbigocmVzKSA9PiB7XG4gICAgICAgIGlmIChyZXMuZGF0YS5kYl9uYW1lID09IGxpbmsubG9jYWwuZGF0YWJhc2UpIHtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtsb2NhbDpPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUubG9jYWwse3Rlc3REQjonT0snfSl9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtsb2NhbDpPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUubG9jYWwse3Rlc3REQjonRVJST1InfSl9KTtcbiAgICAgICAgfVxuICAgICAgfSkuY2F0Y2goKCk9PntcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bG9jYWw6T2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLmxvY2FsLHt0ZXN0REI6J0VSUk9SJ30pfSk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0ZXN0RGlyZWN0b3J5KGxpbmsubG9jYWwucGF0aCkpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bG9jYWw6T2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLmxvY2FsLHt0ZXN0UGF0aDonT0snfSl9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2xvY2FsOk9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZS5sb2NhbCx7dGVzdFBhdGg6J0VSUk9SJ30pfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vaWYgbm8gbG9jYWwgdXNlciBnaXZlblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7bG9jYWw6e3Rlc3RQYXRoOidPSycsdGVzdFNlcnZlcjonT0snLHRlc3RMb2dpbjonT0snLHRlc3REQjonT0snfSB9KTtcbiAgICB9XG5cbiAgICAvL3JlbW90ZSB0ZXN0cyBhbmQgY3JlYXRlIFFSIGNvZGVcbiAgICBpZiAobGluay5yZW1vdGUudXNlcikge1xuICAgICAgY29uc3Qgc2VydmVyID0gbGluay5yZW1vdGUudXJsLmluZGV4T2YoJ2h0dHAnKSA+IC0xID8gbGluay5yZW1vdGUudXJsLnNwbGl0KCc6JylbMV0uc2xpY2UoMilcbiAgICAgICAgOiBsaW5rLnJlbW90ZS51cmw7XG4gICAgICB2YXIgdXJsID0gc2VydmVyLmxlbmd0aD09MCA/ICcnIDogJ2h0dHA6Ly8nK3NlcnZlcisnOjU5ODQnO1xuICAgICAgYXhpb3MuZ2V0KHVybCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgIGlmIChyZXMuZGF0YS5jb3VjaGRiID09ICdXZWxjb21lJykge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3JlbW90ZTpPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUucmVtb3RlLHt0ZXN0U2VydmVyOidPSyd9KX0pO1xuICAgICAgICB9XG4gICAgICB9KS5jYXRjaCgoKT0+e1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtyZW1vdGU6T2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLnJlbW90ZSxcbiAgICAgICAgICB7dGVzdFNlcnZlcjonRVJST1InLHRlc3RMb2dpbjonRVJST1InLHRlc3REQjonRVJST1InfSl9KTtcbiAgICAgIH0pO1xuICAgICAgYXhpb3MuZ2V0KHVybCsnLycrbGluay5yZW1vdGUuZGF0YWJhc2UrJy8nLFxuICAgICAgICB7IGF1dGg6IHsgdXNlcm5hbWU6IGxpbmsucmVtb3RlLnVzZXIsIHBhc3N3b3JkOiBsaW5rLnJlbW90ZS5wYXNzd29yZCB9IH0pLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICBpZiAocmVzLmRhdGEuZGJfbmFtZSA9PSBsaW5rLnJlbW90ZS5kYXRhYmFzZSkge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3JlbW90ZTpPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUucmVtb3RlLHt0ZXN0TG9naW46ICdPSycsIHRlc3REQjonT0snfSl9KTtcbiAgICAgICAgfVxuICAgICAgfSkuY2F0Y2goKCk9PntcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cmVtb3RlOk9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZS5yZW1vdGUse3Rlc3RMb2dpbjonRVJST1InLCB0ZXN0REI6J0VSUk9SJ30pfSk7XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHFyU3RyaW5nID0ge3NlcnZlcjpzZXJ2ZXIsIHVzZXI6bGluay5yZW1vdGUudXNlciwgcGFzc3dvcmQ6bGluay5yZW1vdGUucGFzc3dvcmQsXG4gICAgICAgIGRhdGFiYXNlOiBsaW5rLnJlbW90ZS5kYXRhYmFzZX07XG4gICAgICB0aGlzLnNldFN0YXRlKHtxclN0cmluZzogSlNPTi5zdHJpbmdpZnkoeyBbdGhpcy5zdGF0ZS5jb25maWddOiBxclN0cmluZ30pfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3JlbW90ZTpPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUucmVtb3RlLHt0ZXN0TG9naW46ICdPSycsIHRlc3REQjonT0snfSksXG4gICAgICAgIGxpbms6IE9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZS5saW5rLCB7cmVtb3RlOnt1c2VyOicnLCBwYXNzd29yZDonJywgZGF0YWJhc2U6JycsIHVybDonJ319KX0pO1xuICAgIH1cbiAgfVxuXG5cbiAgcHJlc3NlZERlbGV0ZUJ0biA9ICgpID0+IHtcbiAgICBkZWxldGVDb25maWcodGhpcy5zdGF0ZS5jb25maWcpO1xuICAgIHZhciBjb25maWd1cmF0aW9uID0gdGhpcy5zdGF0ZS5jb25maWd1cmF0aW9uO1xuICAgIGRlbGV0ZSBjb25maWd1cmF0aW9uW3RoaXMuc3RhdGUuY29uZmlnXTtcbiAgICB0aGlzLnNldFN0YXRlKHtjb25maWd1cmF0aW9uOmNvbmZpZ3VyYXRpb24sY29uZmlnOictLWFkZE5ldy0tJ30pO1xuICAgIHRoaXMuc2V0U3RhdGUoe2xpbms6e3VzZXI6JycscGFzc3dvcmQ6JycsZGF0YWJhc2U6JycsdXJsOicnLHBhdGg6Z2V0SG9tZURpcigpLG5hbWU6Jyd9fSk7XG4gIH1cblxuXG4gIGNyZWF0ZURCID0gKCkgPT57XG4gICAgLyoqIENyZWF0ZSBkYXRhYmFzZSBvbiBsb2NhbCBzZXJ2ZXIgKi9cbiAgICB2YXIgY29uZiA9IHRoaXMuc3RhdGUubGluaztcbiAgICB2YXIgdXJsID0gYXhpb3MuY3JlYXRlKHtiYXNlVVJMOiAnaHR0cDovLzEyNy4wLjAuMTo1OTg0JyxcbiAgICAgIGF1dGg6IHt1c2VybmFtZTogY29uZi5sb2NhbC51c2VyLnRyaW0oKSwgcGFzc3dvcmQ6IGNvbmYubG9jYWwucGFzc3dvcmQudHJpbSgpfVxuICAgIH0pO1xuICAgIHVybC5wdXQoY29uZi5sb2NhbC5kYXRhYmFzZSkudGhlbigocmVzKT0+e1xuICAgICAgaWYgKHJlcy5kYXRhLm9rID09IHRydWUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1N1Y2Nlc3MgY3JlYXRpbmcgZGF0YWJhc2UuIE9udG9sb2d5IHdpbGwgYmUgY3JlYXRlZCBkdXJpbmcgaGVhbHRoIHRlc3QuJyk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2xvY2FsOk9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZS5sb2NhbCx7dGVzdERCOidPSyd9KX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bG9jYWw6T2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLmxvY2FsLHt0ZXN0REI6J0VSUk9SJ30pfSk7XG4gICAgICB9XG4gICAgfSkuY2F0Y2goKCk9PntcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2xvY2FsOk9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZS5sb2NhbCx7dGVzdERCOidFUlJPUid9KX0pO1xuICAgIH0pO1xuICB9XG5cbiAgY2hhbmdlQ29uZmlnU2VsZWN0b3IgPSAoZXZlbnQpID0+IHtcbiAgICB0aGlzLnNldFN0YXRlKHsgY29uZmlnOiBldmVudC50YXJnZXQudmFsdWUgfSk7XG4gICAgdmFyIHRoaXNDb25maWcgPSB0aGlzLnN0YXRlLmNvbmZpZ3VyYXRpb24ubGlua3NbZXZlbnQudGFyZ2V0LnZhbHVlXTtcbiAgICBpZiAodGhpc0NvbmZpZykge1xuICAgICAgaWYgKHRoaXNDb25maWcucmVtb3RlLmNyZWQpIHtcbiAgICAgICAgY29uc3QgdXBzICA9IGdldFVQKCdcIicrdGhpc0NvbmZpZy5sb2NhbC5jcmVkLnRvU3RyaW5nKCkrJyAnK3RoaXNDb25maWcucmVtb3RlLmNyZWQudG9TdHJpbmcoKSsnXCInKTtcbiAgICAgICAgdGhpc0NvbmZpZy5sb2NhbFsndXNlciddID0gdXBzWzBdWzBdO1xuICAgICAgICB0aGlzQ29uZmlnLmxvY2FsWydwYXNzd29yZCddID0gdXBzWzBdWzFdO1xuICAgICAgICB0aGlzQ29uZmlnLnJlbW90ZVsndXNlciddID0gdXBzWzFdWzBdO1xuICAgICAgICB0aGlzQ29uZmlnLnJlbW90ZVsncGFzc3dvcmQnXSA9IHVwc1sxXVsxXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHVwcyAgPSBnZXRVUCgnXCInK3RoaXNDb25maWcubG9jYWwuY3JlZC50b1N0cmluZygpKydcIicpO1xuICAgICAgICB0aGlzQ29uZmlnLmxvY2FsWyd1c2VyJ10gPSB1cHNbMF07XG4gICAgICAgIHRoaXNDb25maWcubG9jYWxbJ3Bhc3N3b3JkJ10gPSB1cHNbMV07XG4gICAgICAgIHRoaXNDb25maWdbJ3JlbW90ZSddID0geyd1cmwnOiAnJywgJ2RhdGFiYXNlJzogJycsICd1c2VyJzogJycsICdwYXNzd29yZCc6Jyd9O1xuICAgICAgfVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxpbms6IHRoaXNDb25maWcgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2xpbms6IHsnbG9jYWwnOnsnZGF0YWJhc2UnOicnLCdwYXRoJzpnZXRIb21lRGlyKCksJ3VzZXInOicnLCdwYXNzd29yZCc6ICcnfSxcbiAgICAgICAgJ3JlbW90ZSc6IHsndXJsJzogJycsICdkYXRhYmFzZSc6ICcnLCAndXNlcic6ICcnLCAncGFzc3dvcmQnOicnfX19KTtcbiAgICB9XG4gIH1cblxuXG4gIGxvZ2luQ2hhbmdlID0gKGV2ZW50LCB0YXNrLCBzaXRlKSA9PiB7XG4gICAgaWYgKHNpdGUpIHtcbiAgICAgIHZhciBsaW5rID0gdGhpcy5zdGF0ZS5saW5rO1xuICAgICAgbGlua1tzaXRlXVt0YXNrXSA9ICh0YXNrPT0nZGF0YWJhc2UnKSA/IGV2ZW50LnRhcmdldC52YWx1ZS5yZXBsYWNlKC9eW15hLXpdfFtcXFddL2csJycpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgOiBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICB0aGlzLnNldFN0YXRlKHtsaW5rOmxpbmt9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbmFtZSA9IGV2ZW50LnRhcmdldC52YWx1ZS5yZXBsYWNlKC9eW15hLXpdfFtcXFddL2csJycpLnRvTG93ZXJDYXNlKCk7XG4gICAgICB0aGlzLnNldFN0YXRlKHtjb25maWc6bmFtZX0pO1xuICAgIH1cbiAgfVxuXG4gIC8vRmlsZSBoYW5kbGluZzogd2hhdCB0byBkbyB3aXRoIGNvbnRlbnRcbiAgb25DaGFuZ2VGaWxlKGV2ZW50KSB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgIHJlYWRlci5vbmxvYWQgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgICAgIGV4ZWN1dGVDbWQoJ2J0bl9tb2RDZmdfYmVfZGVjaXBoZXInLCB0aGlzLmNhbGxiYWNrLCBudWxsLCAoZXZlbnQudGFyZ2V0LnJlc3VsdCkpO1xuICAgIH07XG4gICAgcmVhZGVyLnJlYWRBc0JpbmFyeVN0cmluZyhldmVudC50YXJnZXQuZmlsZXNbMF0pO1xuICB9XG4gIGNhbGxiYWNrPShjb250ZW50KT0+e1xuICAgIGNvbnN0IGluRGF0YSA9IEpTT04ucGFyc2UoY29udGVudC5zcGxpdCgnXFxuJylbMF0pO1xuICAgIGNvbnN0IHJlbW90ZUxpbmtCcmFuY2ggPSAge3VzZXI6IGluRGF0YVsndXNlci1uYW1lJ10sIHBhc3N3b3JkOiBpbkRhdGFbJ3Bhc3N3b3JkJ10sXG4gICAgICBkYXRhYmFzZTogaW5EYXRhWydkYXRhYmFzZSddLCB1cmw6IGluRGF0YVsnU2VydmVyJ119O1xuICAgIHRoaXMuc2V0U3RhdGUoe2xpbms6T2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLmxpbmssIHtyZW1vdGU6cmVtb3RlTGlua0JyYW5jaH0pfSk7XG4gIH1cblxuICAvKiogdGhlIHJlbmRlciBtZXRob2QgKiovXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IGxpbmssIHNob3dQYXNzd29yZCB9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAodGhpcy5wcm9wcy5zaG93PT0nbm9uZScgfHwgIWxpbmspIHtcbiAgICAgIHJldHVybiAoPGRpdj48L2Rpdj4pO1xuICAgIH1cbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMuc3RhdGUuY29uZmlndXJhdGlvbiA/IE9iamVjdC5rZXlzKHRoaXMuc3RhdGUuY29uZmlndXJhdGlvbi5saW5rcykgOiBbXTtcbiAgICBvcHRpb25zID0gb3B0aW9ucy5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIHJldHVybiAoPE1lbnVJdGVtIHZhbHVlPXtpdGVtfSBrZXk9e2l0ZW19PntpdGVtfTwvTWVudUl0ZW0+KTtcbiAgICB9KTtcbiAgICBvcHRpb25zID0gb3B0aW9ucy5jb25jYXQoPE1lbnVJdGVtIGtleT0nLS1hZGROZXctLScgdmFsdWU9Jy0tYWRkTmV3LS0nPnsnLS0gQWRkIG5ldyAtLSd9PC9NZW51SXRlbT4pO1xuICAgIGNvbnN0IGVuYWJsZWQgPSB0aGlzLnN0YXRlLmxvY2FsLnRlc3RMb2dpbj09J09LJyAmJiB0aGlzLnN0YXRlLmxvY2FsLnRlc3RQYXRoPT0nT0snICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUubG9jYWwudGVzdERCPT0nT0snICAgICYmIHRoaXMuc3RhdGUucmVtb3RlLnRlc3RMb2dpbj09J09LJyAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLnJlbW90ZS50ZXN0REI9PSdPSycgICA7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibW9kYWxcIiBzdHlsZT17ey4uLm1vZGFsLCAuLi57IGRpc3BsYXk6IHRoaXMucHJvcHMuc2hvdyB9fX0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibW9kYWwtY29udGVudFwiIHN0eWxlPXttb2RhbENvbnRlbnR9PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29sIHAtMFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJweC0zIHB5LTRcIiBzdHlsZT17ey4uLmgxLCAuLi5idG5TdHJvbmd9fT5cbiAgICAgICAgICAgICAgey8qPT09PT09PVBBR0UgSEVBRElORz09PT09PT0qL31cbiAgICAgICAgICAgICAgQWRkIC8gRWRpdCAvIFNob3cgY29uZmlndXJhdGlvblxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93IHAtNCc+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wtc20tNiBwdC0zJz5cbiAgICAgICAgICAgICAgICA8U2VsZWN0IG9uQ2hhbmdlPXtlID0+IHRoaXMuY2hhbmdlQ29uZmlnU2VsZWN0b3IoZSl9IHZhbHVlPXt0aGlzLnN0YXRlLmNvbmZpZ30gZnVsbFdpZHRoPlxuICAgICAgICAgICAgICAgICAge29wdGlvbnN9XG4gICAgICAgICAgICAgICAgPC9TZWxlY3Q+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTYnPlxuICAgICAgICAgICAgICAgIDxUZXh0RmllbGQgdHlwZT0ndGV4dCcgbGFiZWw9J2NvbmZpZ3VyYXRpb24gbmFtZScgb25DaGFuZ2U9e2UgPT4gdGhpcy5sb2dpbkNoYW5nZShlLCAnbmFtZScpfVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuY29uZmlnPT0nLS1hZGROZXctLScgPyAnJzogdGhpcy5zdGF0ZS5jb25maWd9IHJlcXVpcmVkIGZ1bGxXaWR0aFxuICAgICAgICAgICAgICAgICAgaWQ9J2NvbmZOYW1lJy8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93IHAtMyc+XG4gICAgICAgICAgICAgIHsvKj09PT09PT1DT05URU5UIExFRlQ9PT09PT09Ki99XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wtc20tNCc+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3AtMic+XG4gICAgICAgICAgICAgICAgICA8c3Ryb25nPkxvY2FsIHNlcnZlcjwvc3Ryb25nPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1wb3B1cCBtLTJcIiA+XG4gICAgICAgICAgICAgICAgICA8Zm9ybSBjbGFzc05hbWU9XCJmb3JtLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICA8VGV4dEZpZWxkIHR5cGU9J3RleHQnIGxhYmVsPSd1c2VybmFtZScgdmFsdWU9e2xpbmsubG9jYWwudXNlcn0gcmVxdWlyZWQgZnVsbFdpZHRoXG4gICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e2UgPT4gdGhpcy5sb2dpbkNoYW5nZShlLCAndXNlcicsJ2xvY2FsJyl9IGlkPSdsb2NhbF9jb25mVXNlcicvPlxuICAgICAgICAgICAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICAgICAgICAgICAgPEZvcm1Db250cm9sIGZ1bGxXaWR0aD5cbiAgICAgICAgICAgICAgICAgICAgICA8SW5wdXRMYWJlbCBodG1sRm9yPVwic3RhbmRhcmQtYWRvcm5tZW50LXBhc3N3b3JkXCI+cGFzc3dvcmQ8L0lucHV0TGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgPElucHV0IGZ1bGxXaWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ9XCJsb2NhbF9wYXNzd29yZFwiIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPXtzaG93UGFzc3dvcmQgPyAndGV4dCcgOiAncGFzc3dvcmQnfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2xpbmsubG9jYWwucGFzc3dvcmR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17ZSA9PiB0aGlzLmxvZ2luQ2hhbmdlKGUsICdwYXNzd29yZCcsJ2xvY2FsJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRBZG9ybm1lbnQ9e1xuICAgICAgICAgICAgICAgICAgICAgICAgICA8SW5wdXRBZG9ybm1lbnQgcG9zaXRpb249XCJlbmRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8SWNvbkJ1dHRvbiBhcmlhLWxhYmVsPVwidG9nZ2xlIHBhc3N3b3JkIHZpc2liaWxpdHlcIiBvbkNsaWNrPXt0aGlzLnRvZ2dsZVBXRH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c2hvd1Bhc3N3b3JkID8gPFZpc2liaWxpdHkgLz4gOiA8VmlzaWJpbGl0eU9mZiAvPn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0ljb25CdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvSW5wdXRBZG9ybm1lbnQ+fVxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvRm9ybUNvbnRyb2w+XG4gICAgICAgICAgICAgICAgICAgIDxUZXh0RmllbGQgdHlwZT0ndGV4dCcgbGFiZWw9J2RhdGFiYXNlJyB2YWx1ZT17bGluay5sb2NhbC5kYXRhYmFzZX0gcmVxdWlyZWQgZnVsbFdpZHRoXG4gICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e2UgPT4gdGhpcy5sb2dpbkNoYW5nZShlLCAnZGF0YWJhc2UnLCdsb2NhbCcpfSAgaWQ9J2xvY2FsX2NvbmZEYXRhYmFzZScgLz5cbiAgICAgICAgICAgICAgICAgICAgPGJyIC8+XG4gICAgICAgICAgICAgICAgICAgIDxUZXh0RmllbGQgdHlwZT0ndGV4dCcgbGFiZWw9J3BhdGgnIHZhbHVlPXtsaW5rLmxvY2FsLnBhdGh9XG4gICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e2UgPT4gdGhpcy5sb2dpbkNoYW5nZShlLCAncGF0aCcsJ2xvY2FsJyl9IHJlcXVpcmVkIGZ1bGxXaWR0aCAvPlxuICAgICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgey8qPT09PT09PUNPTlRFTlQgUklHSFQ9PT09PT09Ki99XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wtc20tOCc+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3AtMic+XG4gICAgICAgICAgICAgICAgICA8c3Ryb25nPlJlbW90ZSBzZXJ2ZXI8L3N0cm9uZz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93IHAtMCc+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTYnPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tcG9wdXAgbS0yXCIgPlxuICAgICAgICAgICAgICAgICAgICAgIDxmb3JtIGNsYXNzTmFtZT1cImZvcm0tY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8VGV4dEZpZWxkIHR5cGU9J3RleHQnIGxhYmVsPSd1c2VybmFtZScgdmFsdWU9e2xpbmsucmVtb3RlLnVzZXJ9IHJlcXVpcmVkIGZ1bGxXaWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17ZSA9PiB0aGlzLmxvZ2luQ2hhbmdlKGUsICd1c2VyJywncmVtb3RlJyl9IGlkPSdyZW1vdGVfY29uZlVzZXInIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxGb3JtQ29udHJvbCBmdWxsV2lkdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxJbnB1dExhYmVsIGh0bWxGb3I9XCJzdGFuZGFyZC1hZG9ybm1lbnQtcGFzc3dvcmRcIj5wYXNzd29yZDwvSW5wdXRMYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPElucHV0IGZ1bGxXaWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkPVwicmVtb3RlX3Bhc3N3b3JkXCIgcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPXtzaG93UGFzc3dvcmQgPyAndGV4dCcgOiAncGFzc3dvcmQnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtsaW5rLnJlbW90ZS5wYXNzd29yZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17ZSA9PiB0aGlzLmxvZ2luQ2hhbmdlKGUsICdwYXNzd29yZCcsJ3JlbW90ZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZEFkb3JubWVudD17XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8SW5wdXRBZG9ybm1lbnQgcG9zaXRpb249XCJlbmRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEljb25CdXR0b24gYXJpYS1sYWJlbD1cInRvZ2dsZSBwYXNzd29yZCB2aXNpYmlsaXR5XCIgb25DbGljaz17dGhpcy50b2dnbGVQV0R9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93UGFzc3dvcmQgPyA8VmlzaWJpbGl0eSAvPiA6IDxWaXNpYmlsaXR5T2ZmIC8+fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0ljb25CdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0lucHV0QWRvcm5tZW50Pn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvRm9ybUNvbnRyb2w+XG4gICAgICAgICAgICAgICAgICAgICAgICA8VGV4dEZpZWxkIHR5cGU9J3RleHQnIGxhYmVsPSdkYXRhYmFzZScgdmFsdWU9e2xpbmsucmVtb3RlLmRhdGFiYXNlfSByZXF1aXJlZCBmdWxsV2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e2UgPT4gdGhpcy5sb2dpbkNoYW5nZShlLCAnZGF0YWJhc2UnLCdyZW1vdGUnKX0gaWQ9J3JlbW90ZV9jb25mRGF0YWJhc2UnLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxiciAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPFRleHRGaWVsZCB0eXBlPSd0ZXh0JyBsYWJlbD0nc2VydmVyJyB2YWx1ZT17bGluay5yZW1vdGUudXJsfSByZXF1aXJlZCBmdWxsV2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e2UgPT4gdGhpcy5sb2dpbkNoYW5nZShlLCAndXJsJywncmVtb3RlJyl9IGlkPSdyZW1vdGVfY29uZlVybCcgLz5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTYgcHktMCBweC0zJz5cbiAgICAgICAgICAgICAgICAgICAge3RoaXMuc3RhdGUucXJTdHJpbmchPScnICYmIDxRUkNvZGUgdmFsdWU9e3RoaXMuc3RhdGUucXJTdHJpbmd9IHNpemU9ezI4MH0gLz59XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAge3RoaXMuc3RhdGUubG9jYWwudGVzdFNlcnZlcj09J0VSUk9SJyAmJlxuICAgICAgICAgICAgICA8QWxlcnQgc2V2ZXJpdHk9XCJlcnJvclwiPkxvY2FsIGNvdWNoLURCIGluc3RhbGxhdGlvbiBpbmNvcnJlY3QuIFBsZWFzZSBjaGVjayBpdCE8L0FsZXJ0Pn1cbiAgICAgICAgICAgIHt0aGlzLnN0YXRlLnJlbW90ZS50ZXN0U2VydmVyPT0nRVJST1InICYmXG4gICAgICAgICAgICAgIDxBbGVydCBzZXZlcml0eT1cImVycm9yXCI+UmVtb3RlIHNlcnZlciBJUCBpbmNvcnJlY3Qgb3Igbm9uLXJlYWNoYWJsZS4gUGxlYXNlIGNoZWNrIGl0ITwvQWxlcnQ+fVxuICAgICAgICAgICAge3RoaXMuc3RhdGUubG9jYWwudGVzdFNlcnZlcj09J09LJyAmJiB0aGlzLnN0YXRlLmxvY2FsLnRlc3RMb2dpbj09J0VSUk9SJyAmJlxuICAgICAgICAgICAgICA8QWxlcnQgc2V2ZXJpdHk9XCJlcnJvclwiID5Mb2NhbCBjb3VjaC1EQiB1c2VyIG5hbWUgYW5kIHBhc3N3b3JkIGluY29ycmVjdC5cbiAgICAgICAgICAgICAgPC9BbGVydD59XG4gICAgICAgICAgICB7dGhpcy5zdGF0ZS5sb2NhbC50ZXN0U2VydmVyPT0nT0snICYmIHRoaXMuc3RhdGUubG9jYWwudGVzdExvZ2luPT0nT0snICYmXG4gICAgICAgICAgICAgIHRoaXMuc3RhdGUubG9jYWwudGVzdERCPT0nRVJST1InICYmXG4gICAgICAgICAgICAgIDxBbGVydCBzZXZlcml0eT1cImVycm9yXCIgPkxvY2FsIGNvdWNoLURCIGRhdGFiYXNlIGRvZXMgbm90IGV4aXN0LlxuICAgICAgICAgICAgICAgIDxCdXR0b24gb25DbGljaz17KCk9PnRoaXMuY3JlYXRlREIoKX0gZnVsbFdpZHRoIHZhcmlhbnQ9XCJjb250YWluZWRcIiBpZD0nY3JlYXRlQnRuJyBzdHlsZT17YnRufT5cbiAgICAgICAgICAgICAgICBDcmVhdGUgbm93IVxuICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICA8L0FsZXJ0Pn1cbiAgICAgICAgICAgIHt0aGlzLnN0YXRlLnJlbW90ZS50ZXN0U2VydmVyPT0nT0snICYmIHRoaXMuc3RhdGUucmVtb3RlLnRlc3RMb2dpbj09J0VSUk9SJyAmJlxuICAgICAgICAgICAgICA8QWxlcnQgc2V2ZXJpdHk9XCJlcnJvclwiID5cbiAgICAgICAgICAgICAgICBSZW1vdGUgc2VydmVyOiBSZW1vdGUgY291Y2gtREIgdXNlciBuYW1lLCBwYXNzd29yZCBvciBkYXRhYmFzZSBvbiBzZXJ2ZXIgaW5jb3JyZWN0LlxuICAgICAgICAgICAgICA8L0FsZXJ0Pn1cbiAgICAgICAgICAgIHt0aGlzLnN0YXRlLmxvY2FsLnRlc3RQYXRoPT0nRVJST1InICYmXG4gICAgICAgICAgICAgIDxBbGVydCBzZXZlcml0eT1cImVycm9yXCIgPlBhdGggZG9lcyBub3QgZXhpc3QuIFBsZWFzZSBjcmVhdGUgaXQgbWFudWFsbHkhPC9BbGVydD59XG4gICAgICAgICAgICB7ZW5hYmxlZCAmJlxuICAgICAgICAgICAgICA8QWxlcnQ+PHN0cm9uZz5UZXN0IHdhcyBzdWNjZXNzZnVsITwvc3Ryb25nPjwvQWxlcnQ+fVxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXNtLTEyIHAtMyc+XG4gICAgICAgICAgICAgIDxHcmlkIGNvbnRhaW5lciBzcGFjaW5nPXs0fT5cbiAgICAgICAgICAgICAgICA8R3JpZCBpdGVtIHhzPlxuICAgICAgICAgICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoKSA9PiB7dGhpcy51cGxvYWQuY2xpY2soKTt9fSBmdWxsV2lkdGggbGFiZWw9XCJPcGVuIEZpbGVcIiBwcmltYXJ5PVwiZmFsc2VcIlxuICAgICAgICAgICAgICAgICAgICB2YXJpYW50PVwiY29udGFpbmVkXCIgaWQ9J2xvYWRCdG4nIHN0eWxlPXtidG59PlxuICAgICAgICAgICAgICAgICAgICBMb2FkIGZyb20gZmlsZVxuICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgICA8aW5wdXQgaWQ9XCJteUlucHV0XCIgdHlwZT1cImZpbGVcIiByZWY9eyhyZWYpID0+IHRoaXMudXBsb2FkID0gcmVmfSBzdHlsZT17e2Rpc3BsYXk6ICdub25lJ319XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlRmlsZS5iaW5kKHRoaXMpfS8+XG4gICAgICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgICAgICAgIDxHcmlkIGl0ZW0geHM+XG4gICAgICAgICAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9eygpID0+IHRoaXMucHJlc3NlZFRlc3RCdG4oKX0gZnVsbFdpZHRoXG4gICAgICAgICAgICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIiBpZD0nY29uZlFSQnRuJyBzdHlsZT17YnRuU3Ryb25nfT5cbiAgICAgICAgICAgICAgICAgICAgVGVzdCB7IXRoaXMuc3RhdGUubGluay5wYXRoICYmICcmIGdlbmVyYXRlIFFSJ31cbiAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgICAgICA8R3JpZCBpdGVtIHhzPlxuICAgICAgICAgICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoKSA9PiB0aGlzLnByZXNzZWREZWxldGVCdG4oKX0gZnVsbFdpZHRoIHZhcmlhbnQ9XCJjb250YWluZWRcIlxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IWVuYWJsZWR9IGlkPSdjb25mRGVsZXRlQnRuJ1xuICAgICAgICAgICAgICAgICAgICBzdHlsZT17IWVuYWJsZWQgPyB7Li4uYnRuLCBiYWNrZ3JvdW5kQ29sb3I6Y29sb3JCR30gOiBidG59PlxuICAgICAgICAgICAgICAgICAgICBEZWxldGVcbiAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgICAgICA8R3JpZCBpdGVtIHhzPlxuICAgICAgICAgICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoKSA9PiB0aGlzLnByZXNzZWRTYXZlQnRuKCl9IGZ1bGxXaWR0aCB2YXJpYW50PVwiY29udGFpbmVkXCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9eyFlbmFibGVkID8gey4uLmJ0blN0cm9uZywgYmFja2dyb3VuZENvbG9yOmNvbG9yQkd9IDogYnRuU3Ryb25nfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IWVuYWJsZWR9IGlkPSdjb25mU2F2ZUJ0bic+XG4gICAgICAgICAgICAgICAgICAgIFNhdmVcbiAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgICAgICA8R3JpZCBpdGVtIHhzPlxuICAgICAgICAgICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoKSA9PiB0aGlzLnByb3BzLmNhbGxiYWNrKCl9IGZ1bGxXaWR0aFxuICAgICAgICAgICAgICAgICAgICB2YXJpYW50PVwiY29udGFpbmVkXCIgaWQ9J2Nsb3NlQnRuJyBzdHlsZT17YnRufT5cbiAgICAgICAgICAgICAgICAgICAgQ2FuY2VsXG4gICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuIl0sImZpbGUiOiJyZW5kZXJlci9jb21wb25lbnRzL01vZGFsQ29uZmlndXJhdGlvbi5qcyJ9
