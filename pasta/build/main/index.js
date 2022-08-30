"use strict";

var _path = _interopRequireDefault(require("path"));

var _electron = require("electron");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const isDevelopment = process.env.NODE_ENV === 'development';
let mainWindow = null;
let forceQuit = false;

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');

  const extensions = ['REDUX_DEVTOOLS']; //'REACT_DEVELOPER_TOOLS'

  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;

  for (const name of extensions) {
    try {
      await installer.default(installer[name], forceDownload);
    } catch (e) {
      console.log(`Error installing ${name} extension: ${e.message}`);
    }
  }
};

_electron.app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    _electron.app.quit();
  }
});

_electron.app.on('ready', async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  mainWindow = new _electron.BrowserWindow({
    width: 1000,
    //default
    height: 800,
    minWidth: 640,
    minHeight: 480,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    autoHideMenuBar: true,
    icon: _path.default.join(__dirname, '../renderer/pasta.png')
  }); //mainWindow.openDevTools({detach: true});

  mainWindow.maximize();
  /* Interesting short-cuts
  - Ctrl-R: Reload
  - Ctrl-Q: Quit
  - Ctrl-Shift-I: Developer tools
  - F11: Full screen
  */

  mainWindow.loadFile(_path.default.resolve(_path.default.join(__dirname, '../renderer/index.html'))); // show window once on first load

  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.show();
  });
  mainWindow.webContents.on('did-finish-load', () => {
    // Handle window logic properly on macOS:
    // 1. App should not terminate if window has been closed
    // 2. Click on icon in dock should re-open the window
    // 3. ⌘+Q should close the window and quit the app
    if (process.platform === 'darwin') {
      mainWindow.on('close', function (e) {
        if (!forceQuit) {
          e.preventDefault();
          mainWindow.hide();
        }
      });

      _electron.app.on('activate', () => {
        mainWindow.show();
      });

      _electron.app.on('before-quit', () => {
        forceQuit = true;
      });
    } else {
      mainWindow.on('closed', () => {
        mainWindow = null;
      });
    }
  });

  if (isDevelopment) {
    // auto-open dev tools
    mainWindow.webContents.closeDevTools(); //openDevTools if development tools open by default
    // add inspect element on right click menu

    mainWindow.webContents.on('context-menu', (e, props) => {
      _electron.Menu.buildFromTemplate([{
        label: 'Inspect element',

        click() {
          mainWindow.inspectElement(props.x, props.y);
        }

      }]).popup(mainWindow);
    });
  }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4vaW5kZXguanMiXSwibmFtZXMiOlsiaXNEZXZlbG9wbWVudCIsInByb2Nlc3MiLCJlbnYiLCJOT0RFX0VOViIsIm1haW5XaW5kb3ciLCJmb3JjZVF1aXQiLCJpbnN0YWxsRXh0ZW5zaW9ucyIsImluc3RhbGxlciIsInJlcXVpcmUiLCJleHRlbnNpb25zIiwiZm9yY2VEb3dubG9hZCIsIlVQR1JBREVfRVhURU5TSU9OUyIsIm5hbWUiLCJkZWZhdWx0IiwiZSIsImNvbnNvbGUiLCJsb2ciLCJtZXNzYWdlIiwiYXBwIiwib24iLCJwbGF0Zm9ybSIsInF1aXQiLCJCcm93c2VyV2luZG93Iiwid2lkdGgiLCJoZWlnaHQiLCJtaW5XaWR0aCIsIm1pbkhlaWdodCIsInNob3ciLCJ3ZWJQcmVmZXJlbmNlcyIsIm5vZGVJbnRlZ3JhdGlvbiIsImNvbnRleHRJc29sYXRpb24iLCJlbmFibGVSZW1vdGVNb2R1bGUiLCJhdXRvSGlkZU1lbnVCYXIiLCJpY29uIiwicGF0aCIsImpvaW4iLCJfX2Rpcm5hbWUiLCJtYXhpbWl6ZSIsImxvYWRGaWxlIiwicmVzb2x2ZSIsIndlYkNvbnRlbnRzIiwib25jZSIsInByZXZlbnREZWZhdWx0IiwiaGlkZSIsImNsb3NlRGV2VG9vbHMiLCJwcm9wcyIsIk1lbnUiLCJidWlsZEZyb21UZW1wbGF0ZSIsImxhYmVsIiwiY2xpY2siLCJpbnNwZWN0RWxlbWVudCIsIngiLCJ5IiwicG9wdXAiXSwibWFwcGluZ3MiOiI7O0FBQUE7O0FBQ0E7Ozs7QUFFQSxNQUFNQSxhQUFhLEdBQUdDLE9BQU8sQ0FBQ0MsR0FBUixDQUFZQyxRQUFaLEtBQXlCLGFBQS9DO0FBRUEsSUFBSUMsVUFBVSxHQUFHLElBQWpCO0FBQ0EsSUFBSUMsU0FBUyxHQUFHLEtBQWhCOztBQUVBLE1BQU1DLGlCQUFpQixHQUFHLFlBQVk7QUFDcEMsUUFBTUMsU0FBUyxHQUFHQyxPQUFPLENBQUMsNkJBQUQsQ0FBekI7O0FBQ0EsUUFBTUMsVUFBVSxHQUFHLENBQUMsZ0JB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LFVBQVUsR0FBRyxJQUFiO0FBQ0QsT0FGRDtBQUdEO0FBQ0YsR0F6QkQ7O0FBMkJBLE1BQUlKLGFBQUosRUFBbUI7QUFDakI7QUFDQUksSUFBQUEsVUFBVSxDQUFDb0MsV0FBWCxDQUF1QkksYUFBdkIsR0FGaUIsQ0FFd0I7QUFFekM7O0FBQ0F4QyxJQUFBQSxVQUFVLENBQUNvQyxXQUFYLENBQXVCckIsRUFBdkIsQ0FBMEIsY0FBMUIsRUFBMEMsQ0FBQ0wsQ0FBRCxFQUFJK0IsS0FBSixLQUFjO0FBQ3REQyxxQkFBS0MsaUJBQUwsQ0FBdUIsQ0FDckI7QUFDRUMsUUFBQUEsS0FBSyxFQUFFLGlCQURUOztBQUVFQyxRQUFBQSxLQUFLLEdBQUc7QUFDTjdDLFVBQUFBLFVBQVUsQ0FBQzhDLGNBQVgsQ0FBMEJMLEtBQUssQ0FBQ00sQ0FBaEMsRUFBbUNOLEtBQUssQ0FBQ08sQ0FBekM7QUFDRDs7QUFKSCxPQURxQixDQUF2QixFQU9HQyxLQVBILENBT1NqRCxVQVBUO0FBUUQsS0FURDtBQVVEO0FBQ0YsQ0E5RUQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGFwcCwgQnJvd3NlcldpbmRvdywgTWVudSB9IGZyb20gJ2VsZWN0cm9uJztcblxuY29uc3QgaXNEZXZlbG9wbWVudCA9IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnO1xuXG5sZXQgbWFpbldpbmRvdyA9IG51bGw7XG5sZXQgZm9yY2VRdWl0ID0gZmFsc2U7XG5cbmNvbnN0IGluc3RhbGxFeHRlbnNpb25zID0gYXN5bmMgKCkgPT4ge1xuICBjb25zdCBpbnN0YWxsZXIgPSByZXF1aXJlKCdlbGVjdHJvbi1kZXZ0b29scy1pbnN0YWxsZXInKTtcbiAgY29uc3QgZXh0ZW5zaW9ucyA9IFsnUkVEVVhfREVWVE9PTFMnXTsgLy8nUkVBQ1RfREVWRUxPUEVSX1RPT0xTJ1xuICBjb25zdCBmb3JjZURvd25sb2FkID0gISFwcm9jZXNzLmVudi5VUEdSQURFX0VYVEVOU0lPTlM7XG4gIGZvciAoY29uc3QgbmFtZSBvZiBleHRlbnNpb25zKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGluc3RhbGxlci5kZWZhdWx0KGluc3RhbGxlcltuYW1lXSwgZm9yY2VEb3dubG9hZCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5sb2coYEVycm9yIGluc3RhbGxpbmcgJHtuYW1lfSBleHRlbnNpb246ICR7ZS5tZXNzYWdlfWApO1xuICAgIH1cbiAgfVxufTtcblxuYXBwLm9uKCd3aW5kb3ctYWxsLWNsb3NlZCcsICgpID0+IHtcbiAgLy8gT24gT1MgWCBpdCBpcyBjb21tb24gZm9yIGFwcGxpY2F0aW9ucyBhbmQgdGhlaXIgbWVudSBiYXJcbiAgLy8gdG8gc3RheSBhY3RpdmUgdW50aWwgdGhlIHVzZXIgcXVpdHMgZXhwbGljaXRseSB3aXRoIENtZCArIFFcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gIT09ICdkYXJ3aW4nKSB7XG4gICAgYXBwLnF1aXQoKTtcbiAgfVxufSk7XG5cbmFwcC5vbigncmVhZHknLCBhc3luYyAoKSA9PiB7XG4gIGlmIChpc0RldmVsb3BtZW50KSB7XG4gICAgYXdhaXQgaW5zdGFsbEV4dGVuc2lvbnMoKTtcbiAgfVxuXG4gIG1haW5XaW5kb3cgPSBuZXcgQnJvd3NlcldpbmRvdyh7XG4gICAgd2lkdGg6IDEwMDAsICAvL2RlZmF1bHRcbiAgICBoZWlnaHQ6IDgwMCxcbiAgICBtaW5XaWR0aDogNjQwLFxuICAgIG1pbkhlaWdodDogNDgwLFxuICAgIHNob3c6IGZhbHNlLFxuICAgIHdlYlByZWZlcmVuY2VzOiB7XG4gICAgICBub2RlSW50ZWdyYXRpb246IHRydWUsXG4gICAgICBjb250ZXh0SXNvbGF0aW9uOiBmYWxzZSxcbiAgICAgIGVuYWJsZVJlbW90ZU1vZHVsZTogdHJ1ZVxuICAgIH0sXG4gICAgYXV0b0hpZGVNZW51QmFyOiB0cnVlLFxuICAgIGljb246IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9yZW5kZXJlci9wYXN0YS5wbmcnKVxuICB9KTtcbiAgLy9tYWluV2luZG93Lm9wZW5EZXZUb29scyh7ZGV0YWNoOiB0cnVlfSk7XG4gIG1haW5XaW5kb3cubWF4aW1pemUoKTtcbiAgLyogSW50ZXJlc3Rpbmcgc2hvcnQtY3V0c1xuICAtIEN0cmwtUjogUmVsb2FkXG4gIC0gQ3RybC1ROiBRdWl0XG4gIC0gQ3RybC1TaGlmdC1JOiBEZXZlbG9wZXIgdG9vbHNcbiAgLSBGMTE6IEZ1bGwgc2NyZWVuXG4gICovXG5cbiAgbWFpbldpbmRvdy5sb2FkRmlsZShwYXRoLnJlc29sdmUocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3JlbmRlcmVyL2luZGV4Lmh0bWwnKSkpO1xuXG4gIC8vIHNob3cgd2luZG93IG9uY2Ugb24gZmlyc3QgbG9hZFxuICBtYWluV2luZG93LndlYkNvbnRlbnRzLm9uY2UoJ2RpZC1maW5pc2gtbG9hZCcsICgpID0+IHtcbiAgICBtYWluV2luZG93LnNob3coKTtcbiAgfSk7XG5cbiAgbWFpbldpbmRvdy53ZWJDb250ZW50cy5vbignZGlkLWZpbmlzaC1sb2FkJywgKCkgPT4ge1xuICAgIC8vIEhhbmRsZSB3aW5kb3cgbG9naWMgcHJvcGVybHkgb24gbWFjT1M6XG4gICAgLy8gMS4gQXBwIHNob3VsZCBub3QgdGVybWluYXRlIGlmIHdpbmRvdyBoYXMgYmVlbiBjbG9zZWRcbiAgICAvLyAyLiBDbGljayBvbiBpY29uIGluIGRvY2sgc2hvdWxkIHJlLW9wZW4gdGhlIHdpbmRvd1xuICAgIC8vIDMuIOKMmCtRIHNob3VsZCBjbG9zZSB0aGUgd2luZG93IGFuZCBxdWl0IHRoZSBhcHBcbiAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcbiAgICAgIG1haW5XaW5kb3cub24oJ2Nsb3NlJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoIWZvcmNlUXVpdCkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBtYWluV2luZG93LmhpZGUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGFwcC5vbignYWN0aXZhdGUnLCAoKSA9PiB7XG4gICAgICAgIG1haW5XaW5kb3cuc2hvdygpO1xuICAgICAgfSk7XG5cbiAgICAgIGFwcC5vbignYmVmb3JlLXF1aXQnLCAoKSA9PiB7XG4gICAgICAgIGZvcmNlUXVpdCA9IHRydWU7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWFpbldpbmRvdy5vbignY2xvc2VkJywgKCkgPT4ge1xuICAgICAgICBtYWluV2luZG93ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKGlzRGV2ZWxvcG1lbnQpIHtcbiAgICAvLyBhdXRvLW9wZW4gZGV2IHRvb2xzXG4gICAgbWFpbldpbmRvdy53ZWJDb250ZW50cy5jbG9zZURldlRvb2xzKCk7ICAvL29wZW5EZXZUb29scyBpZiBkZXZlbG9wbWVudCB0b29scyBvcGVuIGJ5IGRlZmF1bHRcblxuICAgIC8vIGFkZCBpbnNwZWN0IGVsZW1lbnQgb24gcmlnaHQgY2xpY2sgbWVudVxuICAgIG1haW5XaW5kb3cud2ViQ29udGVudHMub24oJ2NvbnRleHQtbWVudScsIChlLCBwcm9wcykgPT4ge1xuICAgICAgTWVudS5idWlsZEZyb21UZW1wbGF0ZShbXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ0luc3BlY3QgZWxlbWVudCcsXG4gICAgICAgICAgY2xpY2soKSB7XG4gICAgICAgICAgICBtYWluV2luZG93Lmluc3BlY3RFbGVtZW50KHByb3BzLngsIHByb3BzLnkpO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICBdKS5wb3B1cChtYWluV2luZG93KTtcbiAgICB9KTtcbiAgfVxufSk7XG4iXSwiZmlsZSI6Im1haW4vaW5kZXguanMifQ==
