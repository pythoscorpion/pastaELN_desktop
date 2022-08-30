//global definitions: bright->dark
const textBG           = 'white';
export const colorBG   = '#ededed';
const colorBGMiddle    = '#c6C6C6';
export const textFG    = '#212121';
export const colorStrong  = '#004176';
export const colorWarning = '#ff4a00';

// styles for html elements
export const area        = {backgroundColor: textBG}; // white areas: e.g. config page
export const areaScrollY = {...area, overflowY:'scroll'}; // white areas: e.g. config page
export const btn         = {backgroundColor: colorBGMiddle};  //non important grey button
export const btnStrong   = {backgroundColor:colorStrong, color:'white'};
export const btnStrongDeactive = {backgroundColor:colorBG, color:colorBGMiddle};
export const btnWarning  = {backgroundColor:colorWarning, color:'white'};
export const navStyle    = {borderBottom:'1px solid '+colorBGMiddle, borderTop:'1px solid '+colorBGMiddle,
  backgroundColor: colorStrong};//top-bar
export const linkStyle   = {padding:'3px', marginRight:'4px', ...btnStrong};//links in top-bar
export const paper       = {backgroundColor:colorBG, overflow: 'hidden'};
export const h1          = {fontSize:'1.5rem'};
export const flowText    = {fontSize:'1.0rem'};

// for modals
export const modal = {
  position: 'fixed', zIndex: 1, left: 0, top: 0, width: '100%', height: '100%', overflow: 'auto',
  backgroundColor: 'rgba(0,0,0,0.4)'
};
export const modalContent = {
  backgroundColor: colorBG, margin: '5% auto', padding: '2px', border: '1px solid '+colorBGMiddle,
  width: '90%'
};

//table column format
export const tblColFmt = [{value:0, label:'off', width:0}, {value:1, label:'icon', width:-6},
  {value:2, label:'min', width:10},{value:3, label:'med',  width:20},
  {value:4, label:'max', width:40}];
export const tblColFactor = 10; //from table width to pixelwidth

var shadowsDefault = ['none',
  '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
  '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
  '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
  '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
  '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
  '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
  '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
  '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
  '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
  '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
  '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
  '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
  '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
  '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
  '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
  '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
  '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
  '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
  '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
  '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
  '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
  '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
  '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
  '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)'];
shadowsDefault[2] = shadowsDefault[0]; //button default
shadowsDefault[4] = shadowsDefault[1]; //button when hover with mouse
shadowsDefault[8] = shadowsDefault[1]; //select box

//overrides to Material-UI theme
export const pastaTheme = {
  palette: {
    primary: {light:textFG, main:textFG, dark:textFG}
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
    MuiAccordionSummary:{
      root: {
        '&$expanded': {
          minHeight: '48px',
          height: '48px'
        }
      }
    },
    MuiDataGrid: {
      root: {
        '& .MuiDataGrid-colCellTitle': {fontSize: '0.7rem'},
        '& .MuiDataGrid-cell':    {paddingLeft:'5pt', paddingRight:'5pt'},
        '& .MuiDataGrid-colCell': {paddingLeft:'5pt', paddingRight:'5pt'}
      }
    }
  }
};
