/* Component that houses the table(left side) and details(right side)
*/
import React, { Component } from 'react';      // eslint-disable-line no-unused-vars
import DocTable from './DocTable';             // eslint-disable-line no-unused-vars
import DocDetail from './DocDetail';           // eslint-disable-line no-unused-vars
import ModalForm from './ModalForm';           // eslint-disable-line no-unused-vars

export default class DocComponent extends Component {

  /** the render method **/
  render() {
    return (
      <div className='container-fluid px-0 pt-1'>
        <div className='row px-0'>
          <div  className='col-sm-7 pr-0'>  {/* nested div required to enforce  col-sm-8 */}
            <DocTable docType={this.props.docType} />
          </div>
          <div className='col-sm-5 pl-0'>
            <DocDetail docType={this.props.docType}/>
          </div>
        </div>
        <ModalForm />
      </div>
    );
  }
}

