//global definitions: bright->dark
const textBG    = 'white';
const generalBG = '#ededed';
const middleBG  = '#c6C6C6';
const textFG    = '#212121';

// styles for html elements
export const area = {backgroundColor: textBG}; // white areas: e.g. config page
export const btn  = {backgroundColor: middleBG};
export const h1 = {fontSize: '1.5rem'};
export const navStyle = {borderBottom:'2px solid '+middleBG};//top-bar
export const accordion = {backgroundColor:middleBG, color:textFG}; //accordion header
export const paper = {backgroundColor:generalBG, overflow: 'hidden'};

// for modals
export const modal = {
  position: 'fixed',
  zIndex: 1,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  overflow: 'auto',
  backgroundColor: 'rgba(0,0,0,0.4)'
}
export const modalContent = {
  backgroundColor: generalBG,
  margin: '5% auto',
  padding: '2px',
  border: '1px solid '+middleBG,
  width: '90%'
}

//overrides to Material-UI theme
export const pastaTheme = {
  palette: {
    primary: {light:textFG, main:textFG, dark:textFG}
  },
  shadows: Array(25).fill('none'),
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
        '& .MuiDataGrid-colCellTitle': {fontSize: '0.9rem'}
      }
    }
  }
}
