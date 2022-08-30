"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ontologyHelp = ontologyHelp;
exports.logo = void 0;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-line no-unused-vars

/* eslint-disable max-len */
const logo = 'data:image/png;base64,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'; //helps to translate md-> html https://markdowntohtml.com/

exports.logo = logo;

function ontologyHelp() {
  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, "Ontology describes the types of document you want to store (called docTypes) and their properties. A docType of \"sample\" might have a property \"name\". The ontology is designed to be completely flexible only bound by naming rules. Read the default doctypes and their properties for examples."), /*#__PURE__*/_react.default.createElement("h2", {
    id: "three-kinds-of-document-types"
  }, "Three kinds of document types"), /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement("li", null, "Structure:"), /*#__PURE__*/_react.default.createElement("li", null, "\"project\" is the name of the root folder/directory on the hard-disk. Every other doctype could belong to (at least) one project."), /*#__PURE__*/_react.default.createElement("li", null, "\"task\" are sub-folders in a project to give more structure"), /*#__PURE__*/_react.default.createElement("li", null, "internally the \"project\" is \"x0\", \"task\" is \"x1\", \"subtask\" is \"x2\", ..."), /*#__PURE__*/_react.default.createElement("li", null, "Automatically added"), /*#__PURE__*/_react.default.createElement("li", null, "\"measurement\" corresponds to a file on the disk. When scanning for new files, \"measurement\" is the default doctype."), /*#__PURE__*/_react.default.createElement("li", null, "Ordinary types (added manually or preexisting)"), /*#__PURE__*/_react.default.createElement("li", null, "the user can add as many as she/he wants"), /*#__PURE__*/_react.default.createElement("li", null, "\"sample\" and \"procedure\" are examples for ordinary doctypes.")), /*#__PURE__*/_react.default.createElement("p", null, "The doctypes \"sample\" and \"procedure\" correspond to the information found in the methods section of a publication. ", /*#__PURE__*/_react.default.createElement("strong", null, "The minimalist statement of research: A \"sample\" was studied by the \"procedure\" to obtain the \"measurement\".")), /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement("li", null, "procedure"), /*#__PURE__*/_react.default.createElement("li", null, "standard recipes with instrument information, e.g. Bake the cake at 200-210C"), /*#__PURE__*/_react.default.createElement("li", null, "the revision number can be added as field"), /*#__PURE__*/_react.default.createElement("li", null, "measurements"), /*#__PURE__*/_react.default.createElement("li", null, "precise configuration of the measurement and any deviations from the procedures, aka used \"200C\" as temperature."), /*#__PURE__*/_react.default.createElement("li", null, "have hierarchical types: e.g. length measurements, meter measurements, ..."), /*#__PURE__*/_react.default.createElement("li", null, "link to calibration measurements possible"), /*#__PURE__*/_react.default.createElement("li", null, "sample"), /*#__PURE__*/_react.default.createElement("li", null, "link to other/previous samples is possible")), /*#__PURE__*/_react.default.createElement("h2", {
    id: "rules-for-document-types"
  }, "Rules for document types"), /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement("li", null, "docType is the \"sample\", \"instrument\", ... Doctypes are lowercase; cannot start with 'x','_', numbers, no spaces."), /*#__PURE__*/_react.default.createElement("li", null, "use single-case (instrument), not plural (instruments)"), /*#__PURE__*/_react.default.createElement("li", null, "different properties of a doctype can be separated by a heading to add structure."), /*#__PURE__*/_react.default.createElement("li", null, "Example of doctype: Sample", /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement("li", null, "Heading \"Geometry\" with properties height, width, length"), /*#__PURE__*/_react.default.createElement("li", null, "Heading \"Identifiers\" with properties name, qr-code")))), /*#__PURE__*/_react.default.createElement("h2", {
    id: "rules-for-properties"
  }, "Rules for properties"), /*#__PURE__*/_react.default.createElement("ol", null, /*#__PURE__*/_react.default.createElement("li", null, "name: alpha-numeric, no spaces"), /*#__PURE__*/_react.default.createElement("li", null, "query: long description including spaces"), /*#__PURE__*/_react.default.createElement("li", null, "if omitted: user is not asked about this property (those that are filled automatically)"), /*#__PURE__*/_react.default.createElement("li", null, "list: list of options"), /*#__PURE__*/_react.default.createElement("li", null, "list of options in text form ['hammer','saw','screwdriver']"), /*#__PURE__*/_react.default.createElement("li", null, "list of other documents of anotehr doctype, e.g. list of samples => 'sample'"), /*#__PURE__*/_react.default.createElement("li", null, "required: if this property is required if omitted: required=false is assumed"), /*#__PURE__*/_react.default.createElement("li", null, "unit: a unit of property, e.g. 'm^2'", /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement("li", null, "if present: entered value is a number (not enforced yet)"), /*#__PURE__*/_react.default.createElement("li", null, "if omitted: entered value is a text")))), /*#__PURE__*/_react.default.createElement("h2", {
    id: "special-properties"
  }, "Special properties"), /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement("li", null, "\"name\" is optional but generally helpful. Alternative meanings of name: specimen-id."), /*#__PURE__*/_react.default.createElement("li", null, "\"comment\" is a remark which has additional functions. If you enter \"#tag\" in it or \":length:2:\", these are automatically processed. If not present, a comment will be added to all doctypes."), /*#__PURE__*/_react.default.createElement("li", null, "\"tags\" is added automatically if those tags are found in comments"), /*#__PURE__*/_react.default.createElement("li", null, "\"content\" is displayed in a pretty fashion and it is a markdown formatted text. This is a very optional property.")), /*#__PURE__*/_react.default.createElement("h3", {
    id: "advanced-information"
  }, "Advanced information"), /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement("li", null, "\"-curated\" is added automatically if the document was edited"), /*#__PURE__*/_react.default.createElement("li", null, "\"image\" is optional but should be base64 encoded string"), /*#__PURE__*/_react.default.createElement("li", null, "Don't add 'project' etc. as property as it is added automatically (during the creation of the forms and then processed into branch.)")), /*#__PURE__*/_react.default.createElement("h3", {
    id: "example-of-doctype-internetshop-"
  }, "Example of docType \"internetShop\""), /*#__PURE__*/_react.default.createElement("table", {
    style: {
      width: '40%',
      border: '1px solid',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/_react.default.createElement("thead", {
    style: {
      backgroundColor: 'lightgrey'
    }
  }, /*#__PURE__*/_react.default.createElement("tr", {
    style: {
      border: '1px solid'
    }
  }, /*#__PURE__*/_react.default.createElement("th", {
    style: {
      border: '1px solid'
    }
  }, "name"), /*#__PURE__*/_react.default.createElement("th", {
    style: {
      border: '1px solid'
    }
  }, "query"), /*#__PURE__*/_react.default.createElement("th", {
    style: {
      border: '1px solid'
    }
  }, "required"), /*#__PURE__*/_react.default.createElement("th", {
    style: {
      border: '1px solid'
    }
  }, "list"), /*#__PURE__*/_react.default.createElement("th", {
    style: {
      border: '1px solid'
    }
  }, "unit"))), /*#__PURE__*/_react.default.createElement("tbody", null, /*#__PURE__*/_react.default.createElement("tr", {
    style: {
      border: '1px solid'
    }
  }, /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }, "name"), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }, "What is the name?"), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }, "X"), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  })), /*#__PURE__*/_react.default.createElement("tr", {
    style: {
      border: '1px solid'
    }
  }, /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }, "webaddress"), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }, "What is the url to enter?"), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  })), /*#__PURE__*/_react.default.createElement("tr", {
    style: {
      border: '1px solid'
    }
  }, /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }, "kind"), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }, "What is the kind?"), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }, "shop, auction"), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  })), /*#__PURE__*/_react.default.createElement("tr", {
    style: {
      border: '1px solid'
    }
  }, /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }, "comment"), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }, "#tags comments :field:value:'"), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  })), /*#__PURE__*/_react.default.createElement("tr", {
    style: {
      border: '1px solid'
    }
  }, /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }, "lastVisit"), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  })), /*#__PURE__*/_react.default.createElement("tr", {
    style: {
      border: '1px solid'
    }
  }, /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    },
    colSpan: "5"
  }, "Heading: Requirements for computer")), /*#__PURE__*/_react.default.createElement("tr", {
    style: {
      border: '1px solid'
    }
  }, /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }, "browser"), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }, "What browser is required?"), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }, "browser"), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  })), /*#__PURE__*/_react.default.createElement("tr", {
    style: {
      border: '1px solid'
    }
  }, /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }, "monitorSize"), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }, "Size for comfortable reading?"), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }), /*#__PURE__*/_react.default.createElement("td", {
    style: {
      border: '1px solid'
    }
  }, "inch")))));
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlcmVyL2NvbXBvbmVudHMvbG9uZ1N0cmluZ3MuanMiXSwibmFtZXMiOlsibG9nbyIsIm9udG9sb2d5SGVscCIsIndpZHRoIiwiYm9yZGVyIiwiYm9yZGVyQ29sbGFwc2UiLCJiYWNrZ3JvdW5kQ29sb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7QUFBbUQ7O0FBRW5EO0FBQ08sTUFBTUEsSUFBSSxHQUFHLG8wTUFBYixDLENBRVA7Ozs7QUFDTyxTQUFTQyxZQUFULEdBQXVCO0FBQzVCLHNCQUNFLHVEQUNFLGlWQURGLGVBRUU7QUFBSSxJQUFBLEVBQUUsRUFBQztBQUFQLHFDQUZGLGVBR0Usc0RBQ0Usc0RBREYsZUFFRSw4S0FGRixlQUdFLHdHQUhGLGVBSUUsZ0lBSkYsZUFLRSwrREFMRixlQU1FLG1LQU5GLGVBT0UsMEZBUEYsZUFRRSxvRkFSRixlQVNFLDRHQVRGLENBSEYsZUFjRSxnTEFBMEksa0tBQTFJLENBZEYsZUFlRSxzREFDRSxxREFERixlQUVFLHdIQUZGLGVBR0UscUZBSEYsZUFJRSx3REFKRixlQUtFLDhKQUxGLGVBTUUsc0hBTkYsZUFPRSxxRkFQRixlQVFFLGtEQVJGLGVBU0Usc0ZBVEYsQ0FmRixlQTBCRTtBQUFJLElBQUEsRUFBRSxFQUFDO0FBQVAsZ0NBMUJGLGVBMkJFLHNEQUNFLGlLQURGLGVBRUUsa0dBRkYsZUFHRSw2SEFIRixlQUlFLG9GQUE4QixzREFDNUIsc0dBRDRCLGVBRTVCLGlHQUY0QixDQUE5QixDQUpGLENBM0JGLGVBcUNFO0FBQUksSUFBQSxFQUFFLEVBQUM7QUFBUCw0QkFyQ0YsZUFzQ0Usc0RBQ0UsMEVBREYsZUFFRSxvRkFGRixlQUdFLG1JQUhGLGVBSUUsaUVBSkYsZUFLRSx1R0FMRixlQU1FLHdIQU5GLGVBT0Usd0hBUEYsZUFTRSw4RkFBZ0Qsc0RBQzlDLG9HQUQ4QyxlQUU5QywrRUFGOEMsQ0FBaEQsQ0FURixDQXRDRixlQXFERTtBQUFJLElBQUEsRUFBRSxFQUFDO0FBQVAsMEJBckRG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ICAgICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtbGVuICovXG5leHBvcnQgY29uc3QgbG9nbyA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUVBQUFBQkFDQVlBQUFDcWFYSGVBQUFTcGtsRVFWUjRuTldiZVpCZFZaM0hQNzl6N3IzdnZlN1huYzRDZ2JBVHRpU1F3Q0M0b0NJNE9vTG9JRXVrZEdSRVNGSk9EUzRsZzA2Vk0yTHB6RlROakF2T1dFUFBxS2lNaXAyUXRKWWJEQnB4SEVSbEozUkFBZ1REa3IzVDIzdnYzbnZPK2MwZjk3MU9kL3FGTFUyQWI5V3Q5KzY5Wi9uOXZyOXpmcit6WGFFTjlEdkh6ZkdsNkZlbzFHM3MzaUxuUHp6aStoWmRJZ252TXRuam41Q2x0YzN0OHIwYUlSTnYrdnY3NXpsWDdqNUgvdTZ5am5MamFsLzNtMnc5TzNIVWxpdmxXTytKcXViZ3pmV2pycjVkbC8wVXNyWUZHbU5FVlYyU0pKdlBPKys4d2YyaXhUNGdtbmpqMWZ4cmQyWDRmQk9TQ3FZT2xtdmxBeHVHM2NvVFAyakxldkRvMkF6dU5oZi9vNWp3ZVZTa1hZR3Fpb2g0NTl6Vy92Nyt2aVJKUG5mdXVlY083eDkxWGpqTXhKdGdiT2RzdDZsUy8rWGpiTDl0YUp2dGlHNW92am1YNEhuR25FUnE1MFNSSlltaUtKNTRXV3RqWTB4c2pJbEZwR3lNT2J4VUtsMlZaZG1hbTI2NjZjQ1hRN21KNk92cnM2cHE5bncreVlvMy9leG4xOC85NW4rOFgyNzhRU3lRT25qbm0vUXp0L21iVnEyM05oenoyL0QrOUVtekpGamNsQXBVMVloSWFjL25wVktKTE10K0xTS1hEZzhQN3pER0pETm16SWp5UEkrTk1aSDNmdEt2cWliTmNrb2hoSksxTm1uOUIwcXRkMEF5OFY1Vlc4OG4zUnRqU2tEaW5JdHJ0UnBwbWo2bHFqY3NXN1pzcFlqb3BDNWdTcVdQUjdmZDJtWGdRbGRVMEFVRHNVSVZMSWY2dXo3NHBKNzhPNCtmUW9DSXZORmEreTFWUlZYSG42ZHBTaFJGYjh6ei9IZlZhblZNVmVNOHp5TlZqVUlJRm9oQ0NKR0lXQ0N5MXJiS3cxcUxpQ0ROM2pieFYwUW0xZE0wd2hTNThqeW5YcTlUcTlYdzNpTWlwNGpJZWIyOXZXZmZlZWVkVjA3cHg3VXZILzZaMFh1eWEwYUgzTzNmNnQ5KzVqVTNMeTY1WWZkQVZMSkhrWTZkS3hjLzl0TXB0UUNyVjY4KzAxcjd5ejBKR0NmWG1IRUZua3Z3ZHZtZkwxckVaRmxHclZhajBXZ1FRaGl2dTVVbWlpSlU5Uk9UQ0ZqWmYvUEhGOXBmWExvdy92SEpJV09ES1ptVGVmdjlOYjlxMGEyMkhNNStMRHY5a2J0azZUTVJhYnU2WjRySVNTOWE4bjFBU3pubkhJMUdnM3E5VHA3bkxZZmNObzh4QmxWOWNuSVgwT3dkSTlYWG5leUgxbUowOUJnL0hONGRDZDl6Sy9VV2tMTVBOSnVPN1NtNVk0bTZnTWxXOHQ3VGFEUmVHZzNib0tWWUNJRTBUYW5YNjZScGl2ZCsvUDNlbEcvbE04WWNPaW5GcWxXcjNoeVh1dzg1cS9IWlM3bzZodDd0YStGT0d6aWpEZ2ZGSW5kSEpabTlJVHR0OVQxMmFYOU13MDRRSm9RUVRqTEdYTFV2emZlNU1GSHBWdDl1S2YxczFuNFc1TzFqK1NxT0NHYkJmWWp0TnNwWmNzRzYyL0pWaTc0WWRkcVBoOUg2V252eEkyZnZtV2ZseXBXdlRaTGtqblkrUUVTSTQzaUs0MnFsYlQzYjgzY2lRZ2hrV1VhYXBxUnBpblB1eFNvTlFCUkZlTzl2bWRRRit2djdMeFdSSmF1RDhXL3gxelptVlo2WmtkZjFUT0MyU0h5ZnIvUFJJT1hYLzJMMVYvNWxVSTRZTTRTSjJlZnZUWG1BTkUyL0NReFMrSXB1b0txcUZSSHBiUDd2QURxQlJFUWlpaEJIbnVka1dVYVdaWk1zSGNjeGU5YjNmSWdFaU9NWTcvMVdhKzBuSnhHZ3FrdXIxZW83NjVteXMzRTBzL3dtUk8zODV1c25DTG9qdGh4UWlaT3JhcWFNbVJBT1c4MXlJcG9oVGIzM243cmdnZ3YrdVowd3ZiMjljYVZTU2JxNnVtSmpUTWxhMjVubmVhZHpybWRvYUdobXZWNlByYlV6UmVRQVk4enNFRUlua0tocXR6Rm1EakJEVlR0Vk5RWmlvQ29pRlZWTmpESFM4Z1d0eTN0UENPRk80Q1BMbHkrL045cERIaDF2bHVPRFJMRUFvMmtVeXJFUG9LZ0dna0tXQndKS1lnVnJoQ1JKeGdzeXhwRG4rV2llNTUrNjhNSUx2OXJXRk1DS0ZTdHlJTi9iKytmQzJyVnJvM3E5YnRldlgyK3ExV3BpcmUySm9xanFuS3Q0N3hNZ1Z0VURWZlVBRWJIR21BZWlLTHJqc3NzdWE4QWVjd0ZWdmFQUmFFUzV3M1dGcDg3QTJKa0lUd0pVSzNLZ0Q4eDBRWHpEaGR1Y052TFoyWVkzeGRaM0RPZXoxOVdqV1U5T0tNb0I2MFhrZXhkZWVPRTlMMWE1NTRPenpqckxOZXNEcUFOREx5VC9KQUl1dU9DQ2Z3RFExY3oybkxBT2pVSGRid0M4RCtmWWpqanhOZi9nVzkvejEyOE5YK2crSmxRT3VnOFJiOXpRWlhMbDVqdW5RWi85amltVEF3RG5GMXhwTytLRFhNTS9Ialh5dFhyOWtoNVZYUUdnR2xZcDRDcUhYV0U2U2gwKzJQdVpPK3YrL1NyMU5HSUtBZnJEVStlSXlCVW9pSmgvbHc5c0dQYWQrWHVqRG51MHIvdk5rY3AxMm52Y25LRGhnM2dGNGV1eWRLRDk0c0NyQUZNSWNHbnRERnV5aC9oNjJHeERNUjJXc2ptZlNKQll2aTFMQnpablBqb3JLZHU1ZVJxZWpuMjRjZitMUFgzWU13cWdLaWNUQ3pUMGJsbDY3emJkOW9hdXJaOS80dmhkUDkvRjhMYjg0TFVRR1dFeGtVQ3FkOG1WRCsxNE9RU2ZMa3hkSUJDZGpZQ0tGT3QrYTdlVy8vamRyZDNiMW8yUmI4ays0R0FCc1hRRG9MenExd2FuRUdERWpnQUkyZ1BBYVlma1BYOVNyVmRLaGlEY3ZSV2V4Rk1IVUpHZS9TanJTNEtwUGtEOWVweUNza1J2WHR6SmtiY05IM1hGdkkwbmZ2VllGbi8xdVA3M3cyQncrakFlQkYyaXZhZDJ2QnlDVHhlbUVKQUkvK3RxZnRpVXpIdy82dDhsUWtDNE9UbThUTWZjK0pKbnZyMjRNekh4MnJ6aFJrMWtqbld1OFk2WFEvRHB3bFFmY05INkp4RDZKRGFnK2dudFc1aFl3ZzErMk8yd0piUHdnSXA3bjN6NHZvMkl1Y2ttUmp6aHFuVjlDNU4yaGI4YTBIWWdGS2wrMmRmOG1GanpHaWZ5QnJsby9ST3FmQXNySUh4UVA0UFJuQys1aHEvYlNGNTczR1ozMnY0V2ZMclFsZ0M1ZVAyREV2aU5xUmhFOU0wQVN1anpkUjhVT1ltVEZ4MVMrc2lEOTRXZ2QwVWxhMElVdlduL2lqMTlhRXNBUUVBZlJDQW84d0hpeEc1VXJ6dXMwSlhuL3RCbTVnRU1vRHAvYitXODByRlhBa0FjQWlKU3BFbWpJQ0plaklDeEJpQ29lZ0FqMkwyWDg4ckdYZ2tRZEg1ejNmTXBnQ3cwNW9MT2RsNGJNV0Zya1VhT0x1WU1QTG0zY2w3cGFFdUE5aDgvRCtFTU1nWFIyd0Vrc3VmWWppZ0dIdVhJam8yMUx5ODhITVBwbWdVODNMRmZwWjVHdEo4TzUyYTU3YkFIK0laL0xLcGx2OVExUzNwTWF6b2NaS1c4NXE3Y2x2VERjZG5PZEprK01wcDEvWHIvaWoxOWFETWRQbTRPeURJQ0JPR3I4b0VOd3o3NDk5b09POS9WM0phWTBLdlhubndBZ1E4UkFNTlg1bnowZDYvWTNkL253dFNoc0N1ZEVaWHRQRi8zVytLT3BOZ2RWajBmSzZEY0tFc0hObWMyUFNzcDJ3T3pobis2N3NMMzlydlUwNGdwMDJFMG5FSm5oQWgzeWJuM2J0TytoVldQSGsrbWdLNEZNSWFUaVFTQk8yZTh5cWZEVXdrSXpCcjc5UkRiSGhpTis2REN6RkRTWGJZYnA2amFyUUFLc3dHUUZ6OGQxanRQalhrc0x1cXZiZzl5N29hMkc0NHZOYVlROFBqWG4ybU0zTHdUcDd6dElQZzRmL3EyTDhpcW45ZXhncUJkQUFxalJXcVo4WHdyMG04c09zdzVmUzNLR2FJY2xmKytkaFRRZ1NMc2pGTjMzY0pOUWZVSkkzS0g3YlMzYzRwLy9OWVRCeXB2ZTRHcnZDOFVVd2dZdkh2c0ViTjdRNlVzOXQ5UzkvMUZHMG5Nb1RMcVhndmNFcFFCQWlpOFRudVBuaUVySG1zcnBQWmRiTjJPZFg5bURKZTVOSndkV1RNTEk2Q0tWU24yVjFzN1c0YUZWZ3dJeTdOaE4vYklKWnMyVktIblYvRHROOFBmdnhUS0Y5WHVnY1dmUGZKLzVsMXgwTkFSbHgvTWtpL04zMEFBaEp1YnI5K24vY2QzSWRIYXZPNTJvbXdnS1ZmYUZaejFubkNtM3psd2l6SG14OGFZaXd3eUsxZkZHY1dWd0hlQjd3YlhCYTRLcmd6T0tnN0ZEL25PK2g5cVM0QWpTaFZ6OWM1UEgvMitsNHFBOXB1alAxcjhYM1RJRlg3US9jYk9tdk5tUnJiTjg3bmNieXQyaHErNTkwY1hEWHkzMFh2aUNlVVY2eDZha3ZmNkk4b3VxMTRqOERGcktEbW5hQUpTRmlRQkRJZ1Jzc0VjVzdiWURvT0dacFBUNHRKTTJmaU5aOWorK3hFT2ZuMFBoMTB3RjY5OE16YjZDVmsyc1BNbEp5QmR1ZUFVYTh6dmJHS2lQSFZuSmhldC81WHJXM0E1VmhxMlpIOGk1ejB3Q0tBM0hOT2RqNVpPd29URm9oeW15SUdDbmhCWmM0WjNTakJndXFVNGJDTkFLRFpMdDk0NnlNYnZiS0Y4UU14eFZ4NUdhVTZNQ2tnRTJJSWtGTnl3eDJLaG9VU1JJWGRoblFpL0JUYUxzQ21nOThZMkRNZ1ZENDlNS3dHcW1IRFRvalVtRWNXSGErUTlBL2RPSXVockMwNHh6bndJMVhjcUhCVkhyWjZrRUNCM1RZc2FJSWJ4bzFNcFNCRFdmL0VKZGp4VStORUZ5dzVqOW11NkNVNUJRR0tnTEVnRnhBb2FGSzJEamlpeENNMDFDVkRJODZBaStxZ3g1b2RPd2pkS3k5Yy9PQzBFQUdqZjZ5cXk5STc2eEdlanZTY2NYTUplUTlCTG85aVVjVVdmSGJkYWk0Y0E2Z0ZmL0o5VVlTenNXamZDRS8xYnFNeE5PUG92NXhGMVJtaXV4UTVmYUVvVmcra1VLTzhtTHd6cHVPTVVXNlNORUlnRTUvd29ScjVldDlrL2RGKytZZHMrRTdBbjh1c1d2RlhFWEdldEhPUHpnRVpBUmJDZEFxYlpmZDN1OEVFQUhWYTBkV3JHVWxpMUpFaEpDR2xBWWtFTWFLQW93SUUyQ291M2lKQU9NRDBHRXd0K0pCQjJGblZJZCtGVE5BV3RLOGFEalEzQjY0TXBMTzlZOGVEdDAwWkEycnZ3WWl2eURhdFVjMVdrV2pSUmdDMjNEREx5aHhvSHZXMFcxZmtkNExVZ3BLNW9yYWxFR2FRcWpLOGFoQ1pCVGNYRnNMc1ZBWGpRMFlJTUVXSDRpVEdHTjlhWWMzbzM1WjRTV2xlSXdNd3V5Q2RRZEpOUkpiYUNWeDEwUWYraS9PSDFQOWxuQXVxOUo3dzlGclBHQk9sd1ZndW5GaFg5YzNSOW5mdi85bEU4MEhOa2hZVlhIelU1czRKMENNMXRsTUxDZFVYVFFzbnhjMVpTRUNBbGtJcU1qMDUwQk5Jbk14NzQvS09ramNDTXc4c3N2UG9veERUUEN5WkYrZU5PTm9jd3JNUkJjT2d1TmVHY1pQbER6enBWZjVZVm9XTDBadFY4eldwVCtSNHB6bUE0Q0RzVjZ3MmxuZ2dCS3ZOS1NOSzBzdXhXVGh1S2poYXRJZXhVZExUSWo2RlFOR3FtZDRYVnc4NGlyWTRvcElBUlRGUW9iRW9HaVhhM0pFMGg3RkowcUVsb0FxWkh5STBTR2VuQnkvWGFlOXljWjlQeFdWdEFkdDNDYjhXUnVUUjNBVE96VUY1VDBDRUZYemlpeGxCT1l5aGp4b0lPVEljcG1yZUM1a0RMMnMyYXhEUUpMRGU5L1VTbm1ZSFdkUEpaRVNsYXhOaFRkVVllcXpQcnRDN0tjNVBDMXpqUVJrRXdXaEE1YnFBTXdxQVN4NFlzQzllVy9tcmdZeStZZ0t4MzBXa1M5UDlFaWJXNzJlZGRVVENPSXJ4MUM2YlNkR1M1Rm4yYXBtTE51RThkd3FnaVFHTm5UblNRSVprZEYwcm9oUFEwaVJ0cCtnNTJkeCtKQkRHQ1pvbzJmY3k0NUNtRWtTWnhNWVdoSXRBeHhZeUNSOGZpT0p3cVZ6ejhjRHM5cDg0R3g2SExvNHFOZ3lqU1FSR1BSd3ZMRXpmWmpnckZReDFJdFFoOXJSQlZrU0wrZDRCTkRGdCtzcE9OMzk5TVBDUGkrS3NPcCtPQUVxSFI5T2dSMEZsNGRla3FscUsxQWVRS1FRZ2pvYmh2SG9RUkM1U2FSaW1CTVVMWTFTU2hEdElGVWpYNFJpQVcyNW5sWEFaOHFwMlc3ZGNFcjEvU2cvS09YZmNNODhjZmJLWCtkRnA0NXJSUTBIUTFIWlZ2OXNFUlJiT214WnZwdFBrY0xjTGYwQ05qWkkzQTJKYU0wWFcxNG9oaUt4bzBRQWUxYU03U2pCZ0d0Tm5pZExpdzlIajZyTmxTZHUwMmlGUUZpWVdoZThkNDROTWJlZXcvbjBaUkNJb283OUsrUTl2T1dkcTNnSXBibEczS0RubjR1azAwMHNESStsRVcvTTJSUlpOdEhValhJczZURnFWSUI0VVQxTjJ4WEd1QVVUUVM1cjE3TnRuMm5LUXJvdWZFTHRRcXBnb2dhSzFwOFpGQ0dhSWlJbWlkd3FvQzBsbU1JUkRRdE9rb1UyQkVrUm1DbElFTW52clJWblk5VW1Ob1lJeFpTN3FZZVV3VlZZN05kcFdPQnFhTUZOc1RVTThXVmtxSU1RRUwyRWdSVjNSd1V3SkVvRkVJSWhiTURDRFo3Zm9sQVRWTmoxOER5a3JYQ1NVV2ZmTHczWVIxaFdiN0s4b0llZE9hdVJSZEl0bzlxSkt1WnJocmxtOFMwTGpaN0ZPUXZEQ0tsSVdlaFoyTWJLeFRPVENtY25pQ29pU3hpY0V1YWtlQXJGNjkrZ2N3WVdQRG1GRE50ODd2bHNHRll3L3Z4RzNjUnZuMEk0aDd5cWpUd250YkNpL2NER2NTdHlHeEZRbVlNTW54eldkdDhtaE9NVm1LOTBnckJhSGpBb3ZndkdQWFNJcExtMnNLdG5rRndDbjFMUm54REV2Y0U2RnBZYTloclQ0MnB0MVBpK2hFeHg5a3pabzF0VktwVkpsNHJOUjVKUStLaVF3WVFWMkFpVlBXY1dtWStvem5lTCszUE04bnJRaDVsakc0YXhjdXp5ZkhzQW1ES3JIRm9rdkxLVU54cnNmdTRmRzg5eUVDQnB4enA3YU9tYmRnWVR3bTczM0d0TGNYei9KK2IzbWVJNjJJTURZMnh2RHdNQ0VFN0o2SHBDZmUrcW5QTklDYk1ERXp4Z0RjYjRCYm1qZXZTSWdJSVFRR0J3Y1pHaHJhcHhQaUU5SDhIT2RXSXlML25lZjU4Q3VOaEphU3RWcU43ZHUzVTZ2VnByVnM1OXlZdGZZR2MvNzU1dzhBMzU1NDBQbmx4SVRqOWV6WXNZUEJ3VUdjYzlOaTlSYWF1bjVuMmJKbDl4ZmIzQ0Y4cnRGb1BQUnlrdEE2enA1bEdZT0RnK3pZc1lNMFRaL3owNWNYaWlpS3lMTHMwV3ExZWcxTWNCTnIxcXc1MVZyN1EydnR2Q3piZnlkZlcxK1JwR2s2L3BYWGRQWHpQUkhITVNHRTdjQ2ZyMWl4b3RqMW5waWd2Ny8vRk9DYlNaSXN6dk9jRUVLN2N2WVpMK1lycjMyQk1ZWTRqbkhPUFNRaWx5MWZ2bng4aldCS2JYMTlmYk9TSkxrSytGQVVSWE5WZGZ4VGxYMUJ5OUt0YjM4YWpjYVVyN3ltRzYwUEwxVjFwNGpjSUNML3RHelpzaTJUNU5wYjVsV3JWaDBkeC9GRnFucU9xcDVBc1IvWWJzejNuSmlvZEpabE9GZE02MTRLcFZzUWtURVJlVkJFYm82aTZNYkxMNzk4b0YyNi93ZUNMa2dBajJtaTlBQUFBQUJKUlU1RXJrSmdnZz09JztcblxuLy9oZWxwcyB0byB0cmFuc2xhdGUgbWQtPiBodG1sIGh0dHBzOi8vbWFya2Rvd250b2h0bWwuY29tL1xuZXhwb3J0IGZ1bmN0aW9uIG9udG9sb2d5SGVscCgpe1xuICByZXR1cm4gKFxuICAgIDxkaXY+XG4gICAgICA8cD5PbnRvbG9neSBkZXNjcmliZXMgdGhlIHR5cGVzIG9mIGRvY3VtZW50IHlvdSB3YW50IHRvIHN0b3JlIChjYWxsZWQgZG9jVHlwZXMpIGFuZCB0aGVpciBwcm9wZXJ0aWVzLiBBIGRvY1R5cGUgb2YgJnF1b3Q7c2FtcGxlJnF1b3Q7IG1pZ2h0IGhhdmUgYSBwcm9wZXJ0eSAmcXVvdDtuYW1lJnF1b3Q7LiBUaGUgb250b2xvZ3kgaXMgZGVzaWduZWQgdG8gYmUgY29tcGxldGVseSBmbGV4aWJsZSBvbmx5IGJvdW5kIGJ5IG5hbWluZyBydWxlcy4gUmVhZCB0aGUgZGVmYXVsdCBkb2N0eXBlcyBhbmQgdGhlaXIgcHJvcGVydGllcyBmb3IgZXhhbXBsZXMuPC9wPlxuICAgICAgPGgyIGlkPVwidGhyZWUta2luZHMtb2YtZG9jdW1lbnQtdHlwZXNcIj5UaHJlZSBraW5kcyBvZiBkb2N1bWVudCB0eXBlczwvaDI+XG4gICAgICA8dWw+XG4gICAgICAgIDxsaT5TdHJ1Y3R1cmU6PC9saT5cbiAgICAgICAgPGxpPiZxdW90O3Byb2plY3QmcXVvdDsgaXMgdGhlIG5hbWUgb2YgdGhlIHJvb3QgZm9sZGVyL2RpcmVjdG9yeSBvbiB0aGUgaGFyZC1kaXNrLiBFdmVyeSBvdGhlciBkb2N0eXBlIGNvdWxkIGJlbG9uZyB0byAoYXQgbGVhc3QpIG9uZSBwcm9qZWN0LjwvbGk+XG4gICAgICAgIDxsaT4mcXVvdDt0YXNrJnF1b3Q7IGFyZSBzdWItZm9sZGVycyBpbiBhIHByb2plY3QgdG8gZ2l2ZSBtb3JlIHN0cnVjdHVyZTwvbGk+XG4gICAgICAgIDxsaT5pbnRlcm5hbGx5IHRoZSAmcXVvdDtwcm9qZWN0JnF1b3Q7IGlzICZxdW90O3gwJnF1b3Q7LCAmcXVvdDt0YXNrJnF1b3Q7IGlzICZxdW90O3gxJnF1b3Q7LCAmcXVvdDtzdWJ0YXNrJnF1b3Q7IGlzICZxdW90O3gyJnF1b3Q7LCAuLi48L2xpPlxuICAgICAgICA8bGk+QXV0b21hdGljYWxseSBhZGRlZDwvbGk+XG4gICAgICAgIDxsaT4mcXVvdDttZWFzdXJlbWVudCZxdW90OyBjb3JyZXNwb25kcyB0byBhIGZpbGUgb24gdGhlIGRpc2suIFdoZW4gc2Nhbm5pbmcgZm9yIG5ldyBmaWxlcywgJnF1b3Q7bWVhc3VyZW1lbnQmcXVvdDsgaXMgdGhlIGRlZmF1bHQgZG9jdHlwZS48L2xpPlxuICAgICAgICA8bGk+T3JkaW5hcnkgdHlwZXMgKGFkZGVkIG1hbnVhbGx5IG9yIHByZWV4aXN0aW5nKTwvbGk+XG4gICAgICAgIDxsaT50aGUgdXNlciBjYW4gYWRkIGFzIG1hbnkgYXMgc2hlL2hlIHdhbnRzPC9saT5cbiAgICAgICAgPGxpPiZxdW90O3NhbXBsZSZxdW90OyBhbmQgJnF1b3Q7cHJvY2VkdXJlJnF1b3Q7IGFyZSBleGFtcGxlcyBmb3Igb3JkaW5hcnkgZG9jdHlwZXMuPC9saT5cbiAgICAgIDwvdWw+XG4gICAgICA8cD5UaGUgZG9jdHlwZXMgJnF1b3Q7c2FtcGxlJnF1b3Q7IGFuZCAmcXVvdDtwcm9jZWR1cmUmcXVvdDsgY29ycmVzcG9uZCB0byB0aGUgaW5mb3JtYXRpb24gZm91bmQgaW4gdGhlIG1ldGhvZHMgc2VjdGlvbiBvZiBhIHB1YmxpY2F0aW9uLiA8c3Ryb25nPlRoZSBtaW5pbWFsaXN0IHN0YXRlbWVudCBvZiByZXNlYXJjaDogQSAmcXVvdDtzYW1wbGUmcXVvdDsgd2FzIHN0dWRpZWQgYnkgdGhlICZxdW90O3Byb2NlZHVyZSZxdW90OyB0byBvYnRhaW4gdGhlICZxdW90O21lYXN1cmVtZW50JnF1b3Q7Ljwvc3Ryb25nPjwvcD5cbiAgICAgIDx1bD5cbiAgICAgICAgPGxpPnByb2NlZHVyZTwvbGk+XG4gICAgICAgIDxsaT5zdGFuZGFyZCByZWNpcGVzIHdpdGggaW5zdHJ1bWVudCBpbmZvcm1hdGlvbiwgZS5nLiBCYWtlIHRoZSBjYWtlIGF0IDIwMC0yMTBDPC9saT5cbiAgICAgICAgPGxpPnRoZSByZXZpc2lvbiBudW1iZXIgY2FuIGJlIGFkZGVkIGFzIGZpZWxkPC9saT5cbiAgICAgICAgPGxpPm1lYXN1cmVtZW50czwvbGk+XG4gICAgICAgIDxsaT5wcmVjaXNlIGNvbmZpZ3VyYXRpb24gb2YgdGhlIG1lYXN1cmVtZW50IGFuZCBhbnkgZGV2aWF0aW9ucyBmcm9tIHRoZSBwcm9jZWR1cmVzLCBha2EgdXNlZCAmcXVvdDsyMDBDJnF1b3Q7IGFzIHRlbXBlcmF0dXJlLjwvbGk+XG4gICAgICAgIDxsaT5oYXZlIGhpZXJhcmNoaWNhbCB0eXBlczogZS5nLiBsZW5ndGggbWVhc3VyZW1lbnRzLCBtZXRlciBtZWFzdXJlbWVudHMsIC4uLjwvbGk+XG4gICAgICAgIDxsaT5saW5rIHRvIGNhbGlicmF0aW9uIG1lYXN1cmVtZW50cyBwb3NzaWJsZTwvbGk+XG4gICAgICAgIDxsaT5zYW1wbGU8L2xpPlxuICAgICAgICA8bGk+bGluayB0byBvdGhlci9wcmV2aW91cyBzYW1wbGVzIGlzIHBvc3NpYmxlPC9saT5cbiAgICAgIDwvdWw+XG4gICAgICA8aDIgaWQ9XCJydWxlcy1mb3ItZG9jdW1lbnQtdHlwZXNcIj5SdWxlcyBmb3IgZG9jdW1lbnQgdHlwZXM8L2gyPlxuICAgICAgPHVsPlxuICAgICAgICA8bGk+ZG9jVHlwZSBpcyB0aGUgJnF1b3Q7c2FtcGxlJnF1b3Q7LCAmcXVvdDtpbnN0cnVtZW50JnF1b3Q7LCAuLi4gRG9jdHlwZXMgYXJlIGxvd2VyY2FzZTsgY2Fubm90IHN0YXJ0IHdpdGggJiMzOTt4JiMzOTssJiMzOTtfJiMzOTssIG51bWJlcnMsIG5vIHNwYWNlcy48L2xpPlxuICAgICAgICA8bGk+dXNlIHNpbmdsZS1jYXNlIChpbnN0cnVtZW50KSwgbm90IHBsdXJhbCAoaW5zdHJ1bWVudHMpPC9saT5cbiAgICAgICAgPGxpPmRpZmZlcmVudCBwcm9wZXJ0aWVzIG9mIGEgZG9jdHlwZSBjYW4gYmUgc2VwYXJhdGVkIGJ5IGEgaGVhZGluZyB0byBhZGQgc3RydWN0dXJlLjwvbGk+XG4gICAgICAgIDxsaT5FeGFtcGxlIG9mIGRvY3R5cGU6IFNhbXBsZTx1bD5cbiAgICAgICAgICA8bGk+SGVhZGluZyAmcXVvdDtHZW9tZXRyeSZxdW90OyB3aXRoIHByb3BlcnRpZXMgaGVpZ2h0LCB3aWR0aCwgbGVuZ3RoPC9saT5cbiAgICAgICAgICA8bGk+SGVhZGluZyAmcXVvdDtJZGVudGlmaWVycyZxdW90OyB3aXRoIHByb3BlcnRpZXMgbmFtZSwgcXItY29kZTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDwvbGk+XG4gICAgICA8L3VsPlxuICAgICAgPGgyIGlkPVwicnVsZXMtZm9yLXByb3BlcnRpZXNcIj5SdWxlcyBmb3IgcHJvcGVydGllczwvaDI+XG4gICAgICA8b2w+XG4gICAgICAgIDxsaT5uYW1lOiBhbHBoYS1udW1lcmljLCBubyBzcGFjZXM8L2xpPlxuICAgICAgICA8bGk+cXVlcnk6IGxvbmcgZGVzY3JpcHRpb24gaW5jbHVkaW5nIHNwYWNlczwvbGk+XG4gICAgICAgIDxsaT5pZiBvbWl0dGVkOiB1c2VyIGlzIG5vdCBhc2tlZCBhYm91dCB0aGlzIHByb3BlcnR5ICh0aG9zZSB0aGF0IGFyZSBmaWxsZWQgYXV0b21hdGljYWxseSk8L2xpPlxuICAgICAgICA8bGk+bGlzdDogbGlzdCBvZiBvcHRpb25zPC9saT5cbiAgICAgICAgPGxpPmxpc3Qgb2Ygb3B0aW9ucyBpbiB0ZXh0IGZvcm0gWyYjMzk7aGFtbWVyJiMzOTssJiMzOTtzYXcmIzM5OywmIzM5O3NjcmV3ZHJpdmVyJiMzOTtdPC9saT5cbiAgICAgICAgPGxpPmxpc3Qgb2Ygb3RoZXIgZG9jdW1lbnRzIG9mIGFub3RlaHIgZG9jdHlwZSwgZS5nLiBsaXN0IG9mIHNhbXBsZXMgPSZndDsgJiMzOTtzYW1wbGUmIzM5OzwvbGk+XG4gICAgICAgIDxsaT5yZXF1aXJlZDogaWYgdGhpcyBwcm9wZXJ0eSBpcyByZXF1aXJlZFxuaWYgb21pdHRlZDogcmVxdWlyZWQ9ZmFsc2UgaXMgYXNzdW1lZDwvbGk+XG4gICAgICAgIDxsaT51bml0OiBhIHVuaXQgb2YgcHJvcGVydHksIGUuZy4gJiMzOTttXjImIzM5Ozx1bD5cbiAgICAgICAgICA8bGk+aWYgcHJlc2VudDogZW50ZXJlZCB2YWx1ZSBpcyBhIG51bWJlciAobm90IGVuZm9yY2VkIHlldCk8L2xpPlxuICAgICAgICAgIDxsaT5pZiBvbWl0dGVkOiBlbnRlcmVkIHZhbHVlIGlzIGEgdGV4dDwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDwvbGk+XG4gICAgICA8L29sPlxuICAgICAgPGgyIGlkPVwic3BlY2lhbC1wcm9wZXJ0aWVzXCI+U3BlY2lhbCBwcm9wZXJ0aWVzPC9oMj5cbiAgICAgIDx1bD5cbiAgICAgICAgPGxpPiZxdW90O25hbWUmcXVvdDsgaXMgb3B0aW9uYWwgYnV0IGdlbmVyYWxseSBoZWxwZnVsLiBBbHRlcm5hdGl2ZSBtZWFuaW5ncyBvZiBuYW1lOiBzcGVjaW1lbi1pZC48L2xpPlxuICAgICAgICA8bGk+JnF1b3Q7Y29tbWVudCZxdW90OyBpcyBhIHJlbWFyayB3aGljaCBoYXMgYWRkaXRpb25hbCBmdW5jdGlvbnMuIElmIHlvdSBlbnRlciAmcXVvdDsjdGFnJnF1b3Q7IGluIGl0IG9yICZxdW90OzpsZW5ndGg6MjomcXVvdDssIHRoZXNlIGFyZSBhdXRvbWF0aWNhbGx5IHByb2Nlc3NlZC4gSWYgbm90IHByZXNlbnQsIGEgY29tbWVudCB3aWxsIGJlIGFkZGVkIHRvIGFsbCBkb2N0eXBlcy48L2xpPlxuICAgICAgICA8bGk+JnF1b3Q7dGFncyZxdW90OyBpcyBhZGRlZCBhdXRvbWF0aWNhbGx5IGlmIHRob3NlIHRhZ3MgYXJlIGZvdW5kIGluIGNvbW1lbnRzPC9saT5cbiAgICAgICAgPGxpPiZxdW90O2NvbnRlbnQmcXVvdDsgaXMgZGlzcGxheWVkIGluIGEgcHJldHR5IGZhc2hpb24gYW5kIGl0IGlzIGEgbWFya2Rvd24gZm9ybWF0dGVkIHRleHQuIFRoaXMgaXMgYSB2ZXJ5IG9wdGlvbmFsIHByb3BlcnR5LjwvbGk+XG4gICAgICA8L3VsPlxuICAgICAgPGgzIGlkPVwiYWR2YW5jZWQtaW5mb3JtYXRpb25cIj5BZHZhbmNlZCBpbmZvcm1hdGlvbjwvaDM+XG4gICAgICA8dWw+XG4gICAgICAgIDxsaT4mcXVvdDstY3VyYXRlZCZxdW90OyBpcyBhZGRlZCBhdXRvbWF0aWNhbGx5IGlmIHRoZSBkb2N1bWVudCB3YXMgZWRpdGVkPC9saT5cbiAgICAgICAgPGxpPiZxdW90O2ltYWdlJnF1b3Q7IGlzIG9wdGlvbmFsIGJ1dCBzaG91bGQgYmUgYmFzZTY0IGVuY29kZWQgc3RyaW5nPC9saT5cbiAgICAgICAgPGxpPkRvbiYjMzk7dCBhZGQgJiMzOTtwcm9qZWN0JiMzOTsgZXRjLiBhcyBwcm9wZXJ0eSBhcyBpdCBpcyBhZGRlZCBhdXRvbWF0aWNhbGx5IChkdXJpbmcgdGhlIGNyZWF0aW9uIG9mIHRoZSBmb3JtcyBhbmQgdGhlbiBwcm9jZXNzZWQgaW50byBicmFuY2guKTwvbGk+XG4gICAgICA8L3VsPlxuICAgICAgPGgzIGlkPVwiZXhhbXBsZS1vZi1kb2N0eXBlLWludGVybmV0c2hvcC1cIj5FeGFtcGxlIG9mIGRvY1R5cGUgJnF1b3Q7aW50ZXJuZXRTaG9wJnF1b3Q7PC9oMz5cbiAgICAgIDx0YWJsZSBzdHlsZT17eyB3aWR0aDogJzQwJScsIGJvcmRlcjogJzFweCBzb2xpZCcsIGJvcmRlckNvbGxhcHNlOiAnY29sbGFwc2UnIH19PlxuICAgICAgICA8dGhlYWQgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiAnbGlnaHRncmV5JyB9fT5cbiAgICAgICAgICA8dHIgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkJyB9fT5cbiAgICAgICAgICAgIDx0aCBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQnIH19Pm5hbWU8L3RoPlxuICAgICAgICAgICAgPHRoIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCcgfX0+cXVlcnk8L3RoPlxuICAgICAgICAgICAgPHRoIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCcgfX0+cmVxdWlyZWQ8L3RoPlxuICAgICAgICAgICAgPHRoIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCcgfX0+bGlzdDwvdGg+XG4gICAgICAgICAgICA8dGggc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkJyB9fT51bml0PC90aD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICA8L3RoZWFkPlxuICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgPHRyIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCcgfX0+XG4gICAgICAgICAgICA8dGQgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkJyB9fT5uYW1lPC90ZD5cbiAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQnIH19PldoYXQgaXMgdGhlIG5hbWU/PC90ZD5cbiAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQnIH19Plg8L3RkPlxuICAgICAgICAgICAgPHRkIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCcgfX0+PC90ZD5cbiAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQnIH19PjwvdGQ+XG4gICAgICAgICAgPC90cj5cbiAgICAgICAgICA8dHIgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkJyB9fT5cbiAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQnIH19PndlYmFkZHJlc3M8L3RkPlxuICAgICAgICAgICAgPHRkIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCcgfX0+V2hhdCBpcyB0aGUgdXJsIHRvIGVudGVyPzwvdGQ+XG4gICAgICAgICAgICA8dGQgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkJyB9fT48L3RkPlxuICAgICAgICAgICAgPHRkIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCcgfX0+PC90ZD5cbiAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQnIH19PjwvdGQ+XG4gICAgICAgICAgPC90cj5cbiAgICAgICAgICA8dHIgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkJyB9fT5cbiAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQnIH19PmtpbmQ8L3RkPlxuICAgICAgICAgICAgPHRkIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCcgfX0+V2hhdCBpcyB0aGUga2luZD88L3RkPlxuICAgICAgICAgICAgPHRkIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCcgfX0+PC90ZD5cbiAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQnIH19PnNob3AsIGF1Y3Rpb248L3RkPlxuICAgICAgICAgICAgPHRkIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCcgfX0+PC90ZD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICAgIDx0ciBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQnIH19PlxuICAgICAgICAgICAgPHRkIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCcgfX0+Y29tbWVudDwvdGQ+XG4gICAgICAgICAgICA8dGQgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkJyB9fT4jdGFncyBjb21tZW50cyA6ZmllbGQ6dmFsdWU6JiMzOTs8L3RkPlxuICAgICAgICAgICAgPHRkIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCcgfX0+PC90ZD5cbiAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQnIH19PjwvdGQ+XG4gICAgICAgICAgICA8dGQgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkJyB9fT48L3RkPlxuICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgPHRyIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCcgfX0+XG4gICAgICAgICAgICA8dGQgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkJyB9fT5sYXN0VmlzaXQ8L3RkPlxuICAgICAgICAgICAgPHRkIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCcgfX0+PC90ZD5cbiAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQnIH19PjwvdGQ+XG4gICAgICAgICAgICA8dGQgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkJyB9fT48L3RkPlxuICAgICAgICAgICAgPHRkIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCcgfX0+PC90ZD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICAgIDx0ciBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQnIH19PlxuICAgICAgICAgICAgPHRkIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCcgfX0gY29sU3Bhbj1cIjVcIiA+SGVhZGluZzogUmVxdWlyZW1lbnRzIGZvciBjb21wdXRlcjwvdGQ+XG4gICAgICAgICAgPC90cj5cbiAgICAgICAgICA8dHIgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkJyB9fT5cbiAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQnIH19PmJyb3dzZXI8L3RkPlxuICAgICAgICAgICAgPHRkIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCcgfX0+V2hhdCBicm93c2VyIGlzIHJlcXVpcmVkPzwvdGQ+XG4gICAgICAgICAgICA8dGQgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkJyB9fT48L3RkPlxuICAgICAgICAgICAgPHRkIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCcgfX0+YnJvd3NlcjwvdGQ+XG4gICAgICAgICAgICA8dGQgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkJyB9fT48L3RkPlxuICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgPHRyIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCcgfX0+XG4gICAgICAgICAgICA8dGQgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkJyB9fT5tb25pdG9yU2l6ZTwvdGQ+XG4gICAgICAgICAgICA8dGQgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkJyB9fT5TaXplIGZvciBjb21mb3J0YWJsZSByZWFkaW5nPzwvdGQ+XG4gICAgICAgICAgICA8dGQgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkJyB9fT48L3RkPlxuICAgICAgICAgICAgPHRkIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCcgfX0+PC90ZD5cbiAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQnIH19PmluY2g8L3RkPlxuICAgICAgICAgIDwvdHI+XG4gICAgICAgIDwvdGJvZHk+XG4gICAgICA8L3RhYmxlPlxuICAgIDwvZGl2PlxuICApO1xufVxuIl0sImZpbGUiOiJyZW5kZXJlci9jb21wb25lbnRzL2xvbmdTdHJpbmdzLmpzIn0=
