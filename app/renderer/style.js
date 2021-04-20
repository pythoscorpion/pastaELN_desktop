export const area = {backgroundColor: 'white'}; // white areas: e.g. config page
export const h1 = {fontSize: '1.5rem'};
export const navStyle = {borderBottom:'1px solid #8E8C84'};//top-bar

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
  backgroundColor: '#fefefe',
  margin: '5% auto',
  padding: '2px',
  border: '1px solid #888',
  width: '90%'
}



//overrides to Material-UI theme
export const pastaTheme = {
  shadows: ['none'],
  overrides: {
    MuiPaper: {
      root: {backgroundColor: '#f1f1f1', overflow: 'hidden'}
    },
    MuiAccordion: {
      root: {
        '&$expanded': {
          marginTop: '0px !important',
          marginBottom: '0px !important'
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

