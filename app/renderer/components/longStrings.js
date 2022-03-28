import React from 'react';                         // eslint-disable-line no-unused-vars

export const logo = 'data:image/png;base64,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';  //eslint-disable-line

//helps to translate md-> html https://markdowntohtml.com/
export function ontologyHelp(){
  return (
    <div>
      <p>Ontology describes the types of document you want to store (called docTypes) and their properties. A docType of &quot;sample&quot; might have a property &quot;name&quot;. The ontology is designed to be completely flexible only bound by naming rules. Read the default doctypes and their properties for examples.</p>
      <h2 id="three-kinds-of-document-types">Three kinds of document types</h2>
      <ul>
        <li>Structure:</li>
        <li>&quot;project&quot; is the name of the root folder/directory on the hard-disk. Every other doctype could belong to (at least) one project.</li>
        <li>&quot;task&quot; are sub-folders in a project to give more structure</li>
        <li>internally the &quot;project&quot; is &quot;x0&quot;, &quot;task&quot; is &quot;x1&quot;, &quot;subtask&quot; is &quot;x2&quot;, ...</li>
        <li>Automatically added</li>
        <li>&quot;measurement&quot; corresponds to a file on the disk. When scanning for new files, &quot;measurement&quot; is the default doctype.</li>
        <li>Ordinary types (added manually or preexisting)</li>
        <li>the user can add as many as she/he wants</li>
        <li>&quot;sample&quot; and &quot;procedure&quot; are examples for ordinary doctypes.</li>
      </ul>
      <p>The doctypes &quot;sample&quot; and &quot;procedure&quot; correspond to the information found in the methods section of a publication. <strong>The minimalist statement of research: A &quot;sample&quot; was studied by the &quot;procedure&quot; to obtain the &quot;measurement&quot;.</strong></p>
      <ul>
        <li>procedure</li>
        <li>standard recipes with instrument information, e.g. Bake the cake at 200-210C</li>
        <li>the revision number can be added as field</li>
        <li>measurements</li>
        <li>precise configuration of the measurement and any deviations from the procedures, aka used &quot;200C&quot; as temperature.</li>
        <li>have hierarchical types: e.g. length measurements, meter measurements, ...</li>
        <li>link to calibration measurements possible</li>
        <li>sample</li>
        <li>link to other/previous samples is possible</li>
      </ul>
      <h2 id="rules-for-document-types">Rules for document types</h2>
      <ul>
        <li>docType is the &quot;sample&quot;, &quot;instrument&quot;, ... Doctypes are lowercase; cannot start with &#39;x&#39;,&#39;_&#39;, numbers, no spaces.</li>
        <li>use single-case (instrument), not plural (instruments)</li>
        <li>different properties of a doctype can be separated by a heading to add structure.</li>
        <li>Example of doctype: Sample<ul>
          <li>Heading &quot;Geometry&quot; with properties height, width, length</li>
          <li>Heading &quot;Identifiers&quot; with properties name, qr-code</li>
        </ul>
        </li>
      </ul>
      <h2 id="rules-for-properties">Rules for properties</h2>
      <ol>
        <li>name: alpha-numeric, no spaces</li>
        <li>query: long description including spaces</li>
        <li>if omitted: user is not asked about this property (those that are filled automatically)</li>
        <li>list: list of options</li>
        <li>list of options in text form [&#39;hammer&#39;,&#39;saw&#39;,&#39;screwdriver&#39;]</li>
        <li>list of other documents of anotehr doctype, e.g. list of samples =&gt; &#39;sample&#39;</li>
        <li>required: if this property is required
if omitted: required=false is assumed</li>
        <li>unit: a unit of property, e.g. &#39;m^2&#39;<ul>
          <li>if present: entered value is a number (not enforced yet)</li>
          <li>if omitted: entered value is a text</li>
        </ul>
        </li>
      </ol>
      <h2 id="special-properties">Special properties</h2>
      <ul>
        <li>&quot;name&quot; is optional but generally helpful. Alternative meanings of name: specimen-id.</li>
        <li>&quot;comment&quot; is a remark which has additional functions. If you enter &quot;#tag&quot; in it or &quot;:length:2:&quot;, these are automatically processed. If not present, a comment will be added to all doctypes.</li>
        <li>&quot;tags&quot; is added automatically if those tags are found in comments</li>
        <li>&quot;content&quot; is displayed in a pretty fashion and it is a markdown formatted text. This is a very optional property.</li>
      </ul>
      <h3 id="advanced-information">Advanced information</h3>
      <ul>
        <li>&quot;-curated&quot; is added automatically if the document was edited</li>
        <li>&quot;image&quot; is optional but should be base64 encoded string</li>
        <li>Don&#39;t add &#39;project&#39; etc. as property as it is added automatically (during the creation of the forms and then processed into branch.)</li>
      </ul>
      <h3 id="example-of-doctype-internetshop-">Example of docType &quot;internetShop&quot;</h3>
      <table style={{ width: '40%', border: '1px solid', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: 'lightgrey' }}>
          <tr style={{ border: '1px solid' }}>
            <th style={{ border: '1px solid' }}>name</th>
            <th style={{ border: '1px solid' }}>query</th>
            <th style={{ border: '1px solid' }}>required</th>
            <th style={{ border: '1px solid' }}>list</th>
            <th style={{ border: '1px solid' }}>unit</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ border: '1px solid' }}>
            <td style={{ border: '1px solid' }}>name</td>
            <td style={{ border: '1px solid' }}>What is the name?</td>
            <td style={{ border: '1px solid' }}>X</td>
            <td style={{ border: '1px solid' }}></td>
            <td style={{ border: '1px solid' }}></td>
          </tr>
          <tr style={{ border: '1px solid' }}>
            <td style={{ border: '1px solid' }}>webaddress</td>
            <td style={{ border: '1px solid' }}>What is the url to enter?</td>
            <td style={{ border: '1px solid' }}></td>
            <td style={{ border: '1px solid' }}></td>
            <td style={{ border: '1px solid' }}></td>
          </tr>
          <tr style={{ border: '1px solid' }}>
            <td style={{ border: '1px solid' }}>kind</td>
            <td style={{ border: '1px solid' }}>What is the kind?</td>
            <td style={{ border: '1px solid' }}></td>
            <td style={{ border: '1px solid' }}>shop, auction</td>
            <td style={{ border: '1px solid' }}></td>
          </tr>
          <tr style={{ border: '1px solid' }}>
            <td style={{ border: '1px solid' }}>comment</td>
            <td style={{ border: '1px solid' }}>#tags comments :field:value:&#39;</td>
            <td style={{ border: '1px solid' }}></td>
            <td style={{ border: '1px solid' }}></td>
            <td style={{ border: '1px solid' }}></td>
          </tr>
          <tr style={{ border: '1px solid' }}>
            <td style={{ border: '1px solid' }}>lastVisit</td>
            <td style={{ border: '1px solid' }}></td>
            <td style={{ border: '1px solid' }}></td>
            <td style={{ border: '1px solid' }}></td>
            <td style={{ border: '1px solid' }}></td>
          </tr>
          <tr style={{ border: '1px solid' }}>
            <td style={{ border: '1px solid' }} colSpan="5" >Heading: Requirements for computer</td>
          </tr>
          <tr style={{ border: '1px solid' }}>
            <td style={{ border: '1px solid' }}>browser</td>
            <td style={{ border: '1px solid' }}>What browser is required?</td>
            <td style={{ border: '1px solid' }}></td>
            <td style={{ border: '1px solid' }}>browser</td>
            <td style={{ border: '1px solid' }}></td>
          </tr>
          <tr style={{ border: '1px solid' }}>
            <td style={{ border: '1px solid' }}>monitorSize</td>
            <td style={{ border: '1px solid' }}>Size for comfortable reading?</td>
            <td style={{ border: '1px solid' }}></td>
            <td style={{ border: '1px solid' }}></td>
            <td style={{ border: '1px solid' }}>inch</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
