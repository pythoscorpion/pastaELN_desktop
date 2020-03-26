/* Tabular overview on the left side
*/
import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExclamationTriangle} from '@fortawesome/free-solid-svg-icons'
import DataTable from 'react-data-table-component';
// import * as Actions from "../Actions";
// import Store from "../Store";

export default class DocTable extends Component {
  //initialize
  constructor() {
    super();
    this.getTable    = this.getTable.bind(this);
    this.showItem    = this.showItem.bind(this);
    this.state = {
      colWidth: null,
      data: null,
      columns: null,
      selectID: null
    }
  }
  componentDidMount() {
    console.log("did mount");
    // Store.on("changeTable", this.getTable);
    // Actions.readTable(this.props.docType);  //initialize automatic filling when loaded
  }
  componentWillUnmount() {
    console.log("dit unmount");
    // Store.removeListener("changeTable", this.getTable);
  }


  //actions triggered
  toggleNew() {
    console.log("toggled");
    // Actions.toggleNew();
  }


  //get information from store
  getTable() {
    var data = null; //Store.getTable(this.props.docType);
    if (!data) return;
    data = data.map(item=>{
      const obj = {id:item.id};
      for (var i = 0; i < item.value.length; ++i) {
        obj['v'+i.toString()] = item.value[i];
      }
      return obj;
    });
    this.setState({data: data});
    const columns = null; //Store.getTableMeta();
    if (!columns) return;
    this.setState({colWidth:  columns['lengths']});
    if (!columns) { return; }
    var names = columns['names'];
    names = names.map((item,idx)=>{
      if (this.state.colWidth[idx]===0) { return null; }
      const maxWidth = (Math.abs(this.state.colWidth[idx])*7).toString()+'px';
      var obj = {name:item.toUpperCase(), selector:'v'+idx.toString(), sortable: true, width:maxWidth};
      if (this.state.colWidth[idx]<0) {
        obj['cell'] = (row) => {
          return <FontAwesomeIcon icon={row['v'+idx.toString()]==='true' ? faCheck : faExclamationTriangle} />;
        };
      }
      return obj;
    });
    this.setState({columns: names});
  }

  showItem(doc) {
    /* Trigger the id to be shown*/
    this.setState({selectID: doc.id});
    //Actions.readDoc(doc.id);
  }
 

  /**************************************
   * the render method
   **************************************/
  render() {
    const { data, columns } = this.state;
    const h2Style = {textAlign: "center"};
    const conditionalRowStyles = [{
        when: row => row.id === this.state.selectID,
        style: { backgroundColor: '#8e8c84', color: 'white' }
      }]

    if (!data || !columns) {                //if still loading
      return <div style={{textAlign:"center"}}>
                <h2 style={h2Style}>Loading data</h2>
              </div>
    }
    if (data.length === 0) {                   //if empty data: nothing added, show add data button
      return <div style={{textAlign:"center"}}>
                <h2 style={h2Style}>{this.props.docType}</h2>
                <p>Empty database</p>
                <button onClick={this.toggleNew.bind(this)} className="btn btn-secondary">Add data</button>
              </div> 
    }
    return (                                    //default case: data present, show add data button
      <div className="col">
        <DataTable
          title={this.props.docType} dense highlightOnHover pagination
          columns={this.state.columns}
          data={this.state.data}
          onRowClicked={this.showItem}
          conditionalRowStyles={conditionalRowStyles}
        />
        <button onClick={this.toggleNew.bind(this)} className="btn btn-secondary">Add data</button>
      </div>
    );
  }
}
