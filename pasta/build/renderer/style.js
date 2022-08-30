"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pastaTheme = exports.tblColFactor = exports.tblColFmt = exports.modalContent = exports.modal = exports.flowText = exports.h1 = exports.paper = exports.linkStyle = exports.navStyle = exports.btnWarning = exports.btnStrongDeactive = exports.btnStrong = exports.btn = exports.areaScrollY = exports.area = exports.colorWarning = exports.colorStrong = exports.textFG = exports.colorBG = void 0;
//global definitions: bright->dark
const textBG = 'white';
const colorBG = '#ededed';
exports.colorBG = colorBG;
const colorBGMiddle = '#c6C6C6';
const textFG = '#212121';
exports.textFG = textFG;
const colorStrong = '#004176';
exports.colorStrong = colorStrong;
const colorWarning = '#ff4a00'; // styles for html elements

exports.colorWarning = colorWarning;
const area = {
  backgroundColor: textBG
}; // white areas: e.g. config page

exports.area = area;
const areaScrollY = { ...area,
  overflowY: 'scroll'
}; // white areas: e.g. config page

exports.areaScrollY = areaScrollY;
const btn = {
  backgroundColor: colorBGMiddle
}; //non important grey button

exports.btn = btn;
const btnStrong = {
  backgroundColor: colorStrong,
  color: 'white'
};
exports.btnStrong = btnStrong;
const btnStrongDeactive = {
  backgroundColor: colorBG,
  color: colorBGMiddle
};
exports.btnStrongDeactive = btnStrongDeactive;
const btnWarning = {
  backgroundColor: colorWarning,
  color: 'white'
};
exports.btnWarning = btnWarning;
const navStyle = {
  borderBottom: '1px solid ' + colorBGMiddle,
  borderTop: '1px solid ' + colorBGMiddle,
  backgroundColor: colorStrong
}; //top-bar

exports.navStyle = navStyle;
const linkStyle = {
  padding: '3px',
  marginRight: '4px',
  ...btnStrong
}; //links in top-bar

exports.linkStyle = linkStyle;
const paper = {
  backgroundColor: colorBG,
  overflow: 'hidden'
};
exports.paper = paper;
const h1 = {
  fontSize: '1.5rem'
};
exports.h1 = h1;
const flowText = {
  fontSize: '1.0rem'
}; // for modals

exports.flowText = flowText;
const modal = {
  position: 'fixed',
  zIndex: 1,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  overflow: 'auto',
  backgroundColor: 'rgba(0,0,0,0.4)'
};
exports.modal = modal;
const modalContent = {
  backgroundColor: colorBG,
  margin: '5% auto',
  padding: '2px',
  border: '1px solid ' + colorBGMiddle,
  width: '90%'
}; //table column format

exports.modalContent = modalContent;
const tblColFmt = [{
  value: 0,
  label: 'off',
  width: 0
}, {
  value: 1,
  label: 'icon',
  width: -6
}, {
  value: 2,
  label: 'min',
  width: 10
}, {
  value: 3,
  label: 'med',
  width: 20
}, {
  value: 4,
  label: 'max',
  width: 40
}];
exports.tblColFmt = tblColFmt;
const tblColFactor = 10; //from table width to pixelwidth

exports.tblColFactor = tblColFactor;
var shadowsDefault = ['none', '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)', '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)', '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)', '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)', '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)', '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)', '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)', '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)', '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)', '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)', '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)', '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)', '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)', '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)', '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)', '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)', '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)', '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)', '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)', '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)', '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)', '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)', '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)', '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)'];
shadowsDefault[2] = shadowsDefault[0]; //button default

shadowsDefault[4] = shadowsDefault[1]; //button when hover with mouse

shadowsDefault[8] = shadowsDefault[1]; //select box
//overrides to Material-UI theme

const pastaTheme = {
  palette: {
    primary: {
      light: textFG,
      main: textFG,
      dark: textFG
    }
  },
  shadows: shadowsDefault,
  overrides: {
    MuiAccordion: {
      root: {
        '&$expanded': {
          marginTop: '0px !important',
          marginBottom: '0px !important'
        }
      }
    },
    MuiAccordionSummary: {
      root: {
        '&$expanded': {
          minHeight: '48px',
          height: '48px'
        }
      }
    },
    MuiDataGrid: {
      root: {
        '& .MuiDataGrid-colCellTitle': {
          fontSize: '0.7rem'
        },
        '& .MuiDataGrid-cell': {
          paddingLeft: '5pt',
          paddingRight: '5pt'
        },
        '& .MuiDataGrid-colCell': {
          paddingLeft: '5pt',
          paddingRight: '5pt'
        }
      }
    }
  }
};
exports.pastaTheme = pastaTheme;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlcmVyL3N0eWxlLmpzIl0sIm5hbWVzIjpbInRleHRCRyIsImNvbG9yQkciLCJjb2xvckJHTWlkZGxlIiwidGV4dEZHIiwiY29sb3JTdHJvbmciLCJjb2xvcldhcm5pbmciLCJhcmVhIiwiYmFja2dyb3VuZENvbG9yIiwiYXJlYVNjcm9sbFkiLCJvdmVyZmxvd1kiLCJidG4iLCJidG5TdHJvbmciLCJjb2xvciIsImJ0blN0cm9uZ0RlYWN0aXZlIiwiYnRuV2FybmluZyIsIm5hdlN0eWxlIiwiYm9yZGVyQm90dG9tIiwiYm9yZGVyVG9wIiwibGlua1N0eWxlIiwicGFkZGluZyIsIm1hcmdpblJpZ2h0IiwicGFwZXIiLCJvdmVyZmxvdyIsImgxIiwiZm9udFNpemUiLCJmbG93VGV4dCIsIm1vZGFsIiwicG9zaXRpb24iLCJ6SW5kZXgiLCJsZWZ0IiwidG9wIiwid2lkdGgiLCJoZWlnaHQiLCJtb2RhbENvbnRlbnQiLCJtYXJnaW4iLCJib3JkZXIiLCJ0YmxDb2xGbXQiLCJ2YWx1ZSIsImxhYmVsIiwidGJsQ29sRmFjdG9yIiwic2hhZG93c0RlZmF1bHQiLCJwYXN0YVRoZW1lIiwicGFsZXR0ZSIsInByaW1hcnkiLCJsaWdodCIsIm1haW4iLCJkYXJrIiwic2hhZG93cyIsIm92ZXJyaWRlcyIsIk11aUFjY29yZGlvbiIsInJvb3QiLCJtYXJnaW5Ub3AiLCJtYXJnaW5Cb3R0b20iLCJNdWlBY2NvcmRpb25TdW1tYXJ5IiwibWluSGVpZ2h0IiwiTXVpRGF0YUdyaWQiLCJwYWRkaW5nTGVmdCIsInBhZGRpbmdSaWdodCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQSxNQUFNQSxNQUFNLEdBQWEsT0FBekI7QUFDTyxNQUFNQyxPQUFPLEdBQUssU0FBbEI7O0FBQ1AsTUFBTUMsYUFBYSxHQUFNLFNBQXpCO0FBQ08sTUFBTUMsTUFBTSxHQUFNLFNBQWxCOztBQUNBLE1BQU1DLFdBQVcsR0FBSSxTQUFyQjs7QUFDQSxNQUFNQyxZQUFZLEdBQUcsU0FBckIs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LEVBQUFBLFNBQVMsRUFBRTtBQUNUQyxJQUFBQSxZQUFZLEVBQUU7QUFDWkMsTUFBQUEsSUFBSSxFQUFFO0FBQ0osc0JBQWM7QUFDWkMsVUFBQUEsU0FBUyxFQUFFLGdCQURDO0FBRVpDLFVBQUFBLFlBQVksRUFBRTtBQUZGO0FBRFY7QUFETSxLQURMO0FBU1RDLElBQUFBLG1CQUFtQixFQUFDO0FBQ2xCSCxNQUFBQSxJQUFJLEVBQUU7QUFDSixzQkFBYztBQUNaSSxVQUFBQSxTQUFTLEVBQUUsTUFEQztBQUVadEIsVUFBQUEsTUFBTSxFQUFFO0FBRkk7QUFEVjtBQURZLEtBVFg7QUFpQlR1QixJQUFBQSxXQUFXLEVBQUU7QUFDWEwsTUFBQUEsSUFBSSxFQUFFO0FBQ0osdUNBQStCO0FBQUMxQixVQUFBQSxRQUFRLEVBQUU7QUFBWCxTQUQzQjtBQUVKLCtCQUEwQjtBQUFDZ0MsVUFBQUEsV0FBVyxFQUFDLEtBQWI7QUFBb0JDLFVBQUFBLFlBQVksRUFBQztBQUFqQyxTQUZ0QjtBQUdKLGtDQUEwQjtBQUFDRCxVQUFBQSxXQUFXLEVBQUMsS0FBYjtBQUFvQkMsVUFBQUEsWUFBWSxFQUFDO0FBQWpDO0FBSHRCO0FBREs7QUFqQko7QUFMYSxDQUFuQiIsInNvdXJjZXNDb250ZW50IjpbIi8vZ2xvYmFsIGRlZmluaXRpb25zOiBicmlnaHQtPmRhcmtcbmNvbnN0IHRleHRCRyAgICAgICAgICAgPSAnd2hpdGUnO1xuZXhwb3J0IGNvbnN0IGNvbG9yQkcgICA9ICcjZWRlZGVkJztcbmNvbnN0IGNvbG9yQkdNaWRkbGUgICAgPSAnI2M2QzZDNic7XG5leHBvcnQgY29uc3QgdGV4dEZHICAgID0gJyMyMTIxMjEnO1xuZXhwb3J0IGNvbnN0IGNvbG9yU3Ryb25nICA9ICcjMDA0MTc2JztcbmV4cG9ydCBjb25zdCBjb2xvcldhcm5pbmcgPSAnI2ZmNGEwMCc7XG5cbi8vIHN0eWxlcyBmb3IgaHRtbCBlbGVtZW50c1xuZXhwb3J0IGNvbnN0IGFyZWEgICAgICAgID0ge2JhY2tncm91bmRDb2xvcjogdGV4dEJHfTsgLy8gd2hpdGUgYXJlYXM6IGUuZy4gY29uZmlnIHBhZ2VcbmV4cG9ydCBjb25zdCBhcmVhU2Nyb2xsWSA9IHsuLi5hcmVhLCBvdmVyZmxvd1k6J3Njcm9sbCd9OyAvLyB3aGl0ZSBhcmVhczogZS5nLiBjb25maWcgcGFnZVxuZXhwb3J0IGNvbnN0IGJ0biAgICAgICAgID0ge2JhY2tncm91bmRDb2xvcjogY29sb3JCR01pZGRsZX07ICAvL25vbiBpbXBvcnRhbnQgZ3JleSBidXR0b25cbmV4cG9ydCBjb25zdCBidG5TdHJvbmcgICA9IHtiYWNrZ3JvdW5kQ29sb3I6Y29sb3JTdHJvbmcsIGNvbG9yOid3aGl0ZSd9O1xuZXhwb3J0IGNvbnN0IGJ0blN0cm9uZ0RlYWN0aXZlID0ge2JhY2tncm91bmRDb2xvcjpjb2xvckJHLCBjb2xvcjpjb2xvckJHTWlkZGxlfTtcbmV4cG9ydCBjb25zdCBidG5XYXJuaW5nICA9IHtiYWNrZ3JvdW5kQ29sb3I6Y29sb3JXYXJuaW5nLCBjb2xvcjond2hpdGUnfTtcbmV4cG9ydCBjb25zdCBuYXZTdHlsZSAgICA9IHtib3JkZXJCb3R0b206JzFweCBzb2xpZCAnK2NvbG9yQkdNaWRkbGUsIGJvcmRlclRvcDonMXB4IHNvbGlkICcrY29sb3JCR01pZGRsZSxcbiAgYmFja2dyb3VuZENvbG9yOiBjb2xvclN0cm9uZ307Ly90b3AtYmFyXG5leHBvcnQgY29uc3QgbGlua1N0eWxlICAgPSB7cGFkZGluZzonM3B4JywgbWFyZ2luUmlnaHQ6JzRweCcsIC4uLmJ0blN0cm9uZ307Ly9saW5rcyBpbiB0b3AtYmFyXG5leHBvcnQgY29uc3QgcGFwZXIgICAgICAgPSB7YmFja2dyb3VuZENvbG9yOmNvbG9yQkcsIG92ZXJmbG93OiAnaGlkZGVuJ307XG5leHBvcnQgY29uc3QgaDEgICAgICAgICAgPSB7Zm9udFNpemU6JzEuNXJlbSd9O1xuZXhwb3J0IGNvbnN0IGZsb3dUZXh0ICAgID0ge2ZvbnRTaXplOicxLjByZW0nfTtcblxuLy8gZm9yIG1vZGFsc1xuZXhwb3J0IGNvbnN0IG1vZGFsID0ge1xuICBwb3NpdGlvbjogJ2ZpeGVkJywgekluZGV4OiAxLCBsZWZ0OiAwLCB0b3A6IDAsIHdpZHRoOiAnMTAwJScsIGhlaWdodDogJzEwMCUnLCBvdmVyZmxvdzogJ2F1dG8nLFxuICBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDAsMCwwLDAuNCknXG59O1xuZXhwb3J0IGNvbnN0IG1vZGFsQ29udGVudCA9IHtcbiAgYmFja2dyb3VuZENvbG9yOiBjb2xvckJHLCBtYXJnaW46ICc1JSBhdXRvJywgcGFkZGluZzogJzJweCcsIGJvcmRlcjogJzFweCBzb2xpZCAnK2NvbG9yQkdNaWRkbGUsXG4gIHdpZHRoOiAnOTAlJ1xufTtcblxuLy90YWJsZSBjb2x1bW4gZm9ybWF0XG5leHBvcnQgY29uc3QgdGJsQ29sRm10ID0gW3t2YWx1ZTowLCBsYWJlbDonb2ZmJywgd2lkdGg6MH0sIHt2YWx1ZToxLCBsYWJlbDonaWNvbicsIHdpZHRoOi02fSxcbiAge3ZhbHVlOjIsIGxhYmVsOidtaW4nLCB3aWR0aDoxMH0se3ZhbHVlOjMsIGxhYmVsOidtZWQnLCAgd2lkdGg6MjB9LFxuICB7dmFsdWU6NCwgbGFiZWw6J21heCcsIHdpZHRoOjQwfV07XG5leHBvcnQgY29uc3QgdGJsQ29sRmFjdG9yID0gMTA7IC8vZnJvbSB0YWJsZSB3aWR0aCB0byBwaXhlbHdpZHRoXG5cbnZhciBzaGFkb3dzRGVmYXVsdCA9IFsnbm9uZScsXG4gICcwcHggMnB4IDFweCAtMXB4IHJnYmEoMCwwLDAsMC4yKSwwcHggMXB4IDFweCAwcHggcmdiYSgwLDAsMCwwLjE0KSwwcHggMXB4IDNweCAwcHggcmdiYSgwLDAsMCwwLjEyKScsXG4gICcwcHggM3B4IDFweCAtMnB4IHJnYmEoMCwwLDAsMC4yKSwwcHggMnB4IDJweCAwcHggcmdiYSgwLDAsMCwwLjE0KSwwcHggMXB4IDVweCAwcHggcmdiYSgwLDAsMCwwLjEyKScsXG4gICcwcHggM3B4IDNweCAtMnB4IHJnYmEoMCwwLDAsMC4yKSwwcHggM3B4IDRweCAwcHggcmdiYSgwLDAsMCwwLjE0KSwwcHggMXB4IDhweCAwcHggcmdiYSgwLDAsMCwwLjEyKScsXG4gICcwcHggMnB4IDRweCAtMXB4IHJnYmEoMCwwLDAsMC4yKSwwcHggNHB4IDVweCAwcHggcmdiYSgwLDAsMCwwLjE0KSwwcHggMXB4IDEwcHggMHB4IHJnYmEoMCwwLDAsMC4xMiknLFxuICAnMHB4IDNweCA1cHggLTFweCByZ2JhKDAsMCwwLDAuMiksMHB4IDVweCA4cHggMHB4IHJnYmEoMCwwLDAsMC4xNCksMHB4IDFweCAxNHB4IDBweCByZ2JhKDAsMCwwLDAuMTIpJyxcbiAgJzBweCAzcHggNXB4IC0xcHggcmdiYSgwLDAsMCwwLjIpLDBweCA2cHggMTBweCAwcHggcmdiYSgwLDAsMCwwLjE0KSwwcHggMXB4IDE4cHggMHB4IHJnYmEoMCwwLDAsMC4xMiknLFxuICAnMHB4IDRweCA1cHggLTJweCByZ2JhKDAsMCwwLDAuMiksMHB4IDdweCAxMHB4IDFweCByZ2JhKDAsMCwwLDAuMTQpLDBweCAycHggMTZweCAxcHggcmdiYSgwLDAsMCwwLjEyKScsXG4gICcwcHggNXB4IDVweCAtM3B4IHJnYmEoMCwwLDAsMC4yKSwwcHggOHB4IDEwcHggMXB4IHJnYmEoMCwwLDAsMC4xNCksMHB4IDNweCAxNHB4IDJweCByZ2JhKDAsMCwwLDAuMTIpJyxcbiAgJzBweCA1cHggNnB4IC0zcHggcmdiYSgwLDAsMCwwLjIpLDBweCA5cHggMTJweCAxcHggcmdiYSgwLDAsMCwwLjE0KSwwcHggM3B4IDE2cHggMnB4IHJnYmEoMCwwLDAsMC4xMiknLFxuICAnMHB4IDZweCA2cHggLTNweCByZ2JhKDAsMCwwLDAuMiksMHB4IDEwcHggMTRweCAxcHggcmdiYSgwLDAsMCwwLjE0KSwwcHggNHB4IDE4cHggM3B4IHJnYmEoMCwwLDAsMC4xMiknLFxuICAnMHB4IDZweCA3cHggLTRweCByZ2JhKDAsMCwwLDAuMiksMHB4IDExcHggMTVweCAxcHggcmdiYSgwLDAsMCwwLjE0KSwwcHggNHB4IDIwcHggM3B4IHJnYmEoMCwwLDAsMC4xMiknLFxuICAnMHB4IDdweCA4cHggLTRweCByZ2JhKDAsMCwwLDAuMiksMHB4IDEycHggMTdweCAycHggcmdiYSgwLDAsMCwwLjE0KSwwcHggNXB4IDIycHggNHB4IHJnYmEoMCwwLDAsMC4xMiknLFxuICAnMHB4IDdweCA4cHggLTRweCByZ2JhKDAsMCwwLDAuMiksMHB4IDEzcHggMTlweCAycHggcmdiYSgwLDAsMCwwLjE0KSwwcHggNXB4IDI0cHggNHB4IHJnYmEoMCwwLDAsMC4xMiknLFxuICAnMHB4IDdweCA5cHggLTRweCByZ2JhKDAsMCwwLDAuMiksMHB4IDE0cHggMjFweCAycHggcmdiYSgwLDAsMCwwLjE0KSwwcHggNXB4IDI2cHggNHB4IHJnYmEoMCwwLDAsMC4xMiknLFxuICAnMHB4IDhweCA5cHggLTVweCByZ2JhKDAsMCwwLDAuMiksMHB4IDE1cHggMjJweCAycHggcmdiYSgwLDAsMCwwLjE0KSwwcHggNnB4IDI4cHggNXB4IHJnYmEoMCwwLDAsMC4xMiknLFxuICAnMHB4IDhweCAxMHB4IC01cHggcmdiYSgwLDAsMCwwLjIpLDBweCAxNnB4IDI0cHggMnB4IHJnYmEoMCwwLDAsMC4xNCksMHB4IDZweCAzMHB4IDVweCByZ2JhKDAsMCwwLDAuMTIpJyxcbiAgJzBweCA4cHggMTFweCAtNXB4IHJnYmEoMCwwLDAsMC4yKSwwcHggMTdweCAyNnB4IDJweCByZ2JhKDAsMCwwLDAuMTQpLDBweCA2cHggMzJweCA1cHggcmdiYSgwLDAsMCwwLjEyKScsXG4gICcwcHggOXB4IDExcHggLTVweCByZ2JhKDAsMCwwLDAuMiksMHB4IDE4cHggMjhweCAycHggcmdiYSgwLDAsMCwwLjE0KSwwcHggN3B4IDM0cHggNnB4IHJnYmEoMCwwLDAsMC4xMiknLFxuICAnMHB4IDlweCAxMnB4IC02cHggcmdiYSgwLDAsMCwwLjIpLDBweCAxOXB4IDI5cHggMnB4IHJnYmEoMCwwLDAsMC4xNCksMHB4IDdweCAzNnB4IDZweCByZ2JhKDAsMCwwLDAuMTIpJyxcbiAgJzBweCAxMHB4IDEzcHggLTZweCByZ2JhKDAsMCwwLDAuMiksMHB4IDIwcHggMzFweCAzcHggcmdiYSgwLDAsMCwwLjE0KSwwcHggOHB4IDM4cHggN3B4IHJnYmEoMCwwLDAsMC4xMiknLFxuICAnMHB4IDEwcHggMTNweCAtNnB4IHJnYmEoMCwwLDAsMC4yKSwwcHggMjFweCAzM3B4IDNweCByZ2JhKDAsMCwwLDAuMTQpLDBweCA4cHggNDBweCA3cHggcmdiYSgwLDAsMCwwLjEyKScsXG4gICcwcHggMTBweCAxNHB4IC02cHggcmdiYSgwLDAsMCwwLjIpLDBweCAyMnB4IDM1cHggM3B4IHJnYmEoMCwwLDAsMC4xNCksMHB4IDhweCA0MnB4IDdweCByZ2JhKDAsMCwwLDAuMTIpJyxcbiAgJzBweCAxMXB4IDE0cHggLTdweCByZ2JhKDAsMCwwLDAuMiksMHB4IDIzcHggMzZweCAzcHggcmdiYSgwLDAsMCwwLjE0KSwwcHggOXB4IDQ0cHggOHB4IHJnYmEoMCwwLDAsMC4xMiknLFxuICAnMHB4IDExcHggMTVweCAtN3B4IHJnYmEoMCwwLDAsMC4yKSwwcHggMjRweCAzOHB4IDNweCByZ2JhKDAsMCwwLDAuMTQpLDBweCA5cHggNDZweCA4cHggcmdiYSgwLDAsMCwwLjEyKSddO1xuc2hhZG93c0RlZmF1bHRbMl0gPSBzaGFkb3dzRGVmYXVsdFswXTsgLy9idXR0b24gZGVmYXVsdFxuc2hhZG93c0RlZmF1bHRbNF0gPSBzaGFkb3dzRGVmYXVsdFsxXTsgLy9idXR0b24gd2hlbiBob3ZlciB3aXRoIG1vdXNlXG5zaGFkb3dzRGVmYXVsdFs4XSA9IHNoYWRvd3NEZWZhdWx0WzFdOyAvL3NlbGVjdCBib3hcblxuLy9vdmVycmlkZXMgdG8gTWF0ZXJpYWwtVUkgdGhlbWVcbmV4cG9ydCBjb25zdCBwYXN0YVRoZW1lID0ge1xuICBwYWxldHRlOiB7XG4gICAgcHJpbWFyeToge2xpZ2h0OnRleHRGRywgbWFpbjp0ZXh0RkcsIGRhcms6dGV4dEZHfVxuICB9LFxuICBzaGFkb3dzOiBzaGFkb3dzRGVmYXVsdCxcbiAgb3ZlcnJpZGVzOiB7XG4gICAgTXVpQWNjb3JkaW9uOiB7XG4gICAgICByb290OiB7XG4gICAgICAgICcmJGV4cGFuZGVkJzoge1xuICAgICAgICAgIG1hcmdpblRvcDogJzBweCAhaW1wb3J0YW50JyxcbiAgICAgICAgICBtYXJnaW5Cb3R0b206ICcwcHggIWltcG9ydGFudCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgTXVpQWNjb3JkaW9uU3VtbWFyeTp7XG4gICAgICByb290OiB7XG4gICAgICAgICcmJGV4cGFuZGVkJzoge1xuICAgICAgICAgIG1pbkhlaWdodDogJzQ4cHgnLFxuICAgICAgICAgIGhlaWdodDogJzQ4cHgnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIE11aURhdGFHcmlkOiB7XG4gICAgICByb290OiB7XG4gICAgICAgICcmIC5NdWlEYXRhR3JpZC1jb2xDZWxsVGl0bGUnOiB7Zm9udFNpemU6ICcwLjdyZW0nfSxcbiAgICAgICAgJyYgLk11aURhdGFHcmlkLWNlbGwnOiAgICB7cGFkZGluZ0xlZnQ6JzVwdCcsIHBhZGRpbmdSaWdodDonNXB0J30sXG4gICAgICAgICcmIC5NdWlEYXRhR3JpZC1jb2xDZWxsJzoge3BhZGRpbmdMZWZ0Oic1cHQnLCBwYWRkaW5nUmlnaHQ6JzVwdCd9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuIl0sImZpbGUiOiJyZW5kZXJlci9zdHlsZS5qcyJ9
