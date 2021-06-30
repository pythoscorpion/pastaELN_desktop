/* Modal that shows help information
   eslint max-len: 0 */
import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { Button} from '@material-ui/core';                        // eslint-disable-line no-unused-vars
import ReactMarkdown from 'react-markdown';                       // eslint-disable-line no-unused-vars
import dispatcher from '../Dispatcher';
import { modal, modalContent, btn, flowText } from '../style';

export default class ModalHelp extends Component {
  constructor() {
    super();
    this.state = {
      //modal items
      dispatcherToken: null,
      display: 'none',
      help: null,
    };
  }
  //component mounted immediately, even if Modal not shown
  componentDidMount() {
    this.setState({dispatcherToken: dispatcher.register(this.handleActions)});
  }
  componentWillUnmount() {
    dispatcher.unregister(this.state.dispatcherToken);
  }


  /** Functions as class properties (immediately bound): react on user interactions **/
  cancel = () => {
    this.setState({display:'none'});
  }

  handleActions=(action)=>{     //Modal show; first function
    if (action.type==='SHOW_HELP') {
      this.setState({display:'block', help:action.help});
    }
  }


  /** the render method **/
  render(){
    return (
      <div className="modal" style={Object.assign({display: this.state.display},modal)}>
        <div className="modal-content" style={modalContent}>
          <div  className="col border rounded p-3">
            <Button onClick={()=>this.setState({display:'none'})}
              variant="contained" className='float-right m-3' id='closeBtn' style={btn}>
                Cancel
            </Button>
            <div style={flowText}>
              <ReactMarkdown source={this.getString(this.state.help)}/>
            </div>
          </div>
        </div>
      </div>
    );
  }


  /** special methods with lots of text**/
  getString=(help)=>{
    var helpString = '';
    //from notesUser.md
    if (help=='ontology')
      helpString = `
## Ontology
Ontology describes the types of document you want to store (called docTypes) and their properties. A docType of "sample" might have a property "name". The ontology is designed to be completely flexible with only rules on naming. Read the default doctypes and their properties to get a picture.

## Rules for document types
- docType is the "sample", "instrument", ... Doctypes are lowercase; cannot start with 'x','_', numbers, no spaces.
- different properties of a doctype can be separated with a heading to add structure.
  - Example of doctype: Sample
    - Heading "Geometry" with properties height, width, length
    - Heading "Identifiers" with properties name, qr-code

### Special document types
- "project" is the name of the root folder/directory on the hard-disk. Every other doctype should belong to (at least) one project.
- "measurement" corresponds to a file on the disk. When scanning for new files, "measurement" is the default doctype.

### Other doctypes
- "step" and "task" are sub-folders in a project to give more structure
- "sample" and "procedure" are ordinary doctypes. The doctypes "sample" and "procedure" correspond to the information found in the methods section of a publication. **The minimalist statement of research: A "sample" was studied by the "procedure" to obtain the "measurement".**
  - procedure
    - standard recipes with instrument information, e.g. Bake the cake at 200-210C
    - the revision number can be added as field
  - measurements
    - precise configuration of the measurement and any deviations from the procedures, aka used "200C" as temperature.
    - have hierarchical types: e.g. length measurements, meter measurements, ...
    - link to calibration measurements possible
  - sample
    - link to other/previous samples is possible


## Rules for properties
1. name: alpha-numeric, no spaces
  - forbidden names: branch, type, user, client
2. query: long description including spaces
  - if omitted: user is not asked about this property (those that are filled automatically)
3. list: list of options
  - Important: a list is always better than no list. It gives user specific choices and prevents typos.
  - list of options in text form ['hammer','saw','screwdriver']
  - list of other doctypes, e.g. list of samples, to link to those
4. required: if this property is required
    if omitted: required=false is assumed
5. unit: a unit of property, e.g. 'm^2'
    - if present: entered value is a number (not enforced yet)
    - if omitted: entered value is a text

### Special properties
- Don't add 'project' etc. as property as it is added automatically (during the creation of the forms and then processed into branch.)
- "comment" is a remark which has additional functions. If you enter "#tag" in it or ":length:2:", these are
  automatically processed. If not present, a comment will be added to all doctypes.
- "content" is displayed in a pretty fashion and it is a markdown formatted text. This is a very optional property.
- "tags" is added automatically if those tags are found in comments
- "curated" is added automatically if the document was edited
- "image" is optional but should be base64 encoded string
- "name" is optional but generally helpful. Alternative meanings of name: specimen-id.

### Example of docType "instrument"
- 'name':'name',       'query':'What is the name?',           'required':True
- 'name':'vendor',     'query':'What is the vendor?'
- 'name':'model',      'query':'What is the model?'
- 'name':'comment',    'query':'#tags comments :field:value:'
- 'name':'kind',       'query':'What is the kind?',                           'list':['hammer','saw']
- 'name':'procedure',  'query':'What is the procedure?',                      'list':'procedure'
- 'heading':'Requirements for room'
- 'name':'size',       'query':'What is the foot print area?',                'unit':'m^2'
- 'name':'temperature','query':'What is the required temperature stability?', 'unit':'C'
      `;
    return helpString;
  }

}