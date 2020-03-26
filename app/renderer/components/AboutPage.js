/* Information on the software
*/
import React from 'react'

const textSyle = {
  maxWidth: '900px',
  margin: '0 auto'
}

export default function AboutPage() {
  return (
    <div style={textSyle}>
      <h1>Agile Materials Science</h1> 
      <h2>Towards a database for experimental materials science </h2>
      <p>
        In experimental materials science, four major types of data accumulate: measurements, procedures, sample-data and text-based comments.
        Measurements and their meta data arises from a multitude of formats, sub-formats and this data is incomplete and sparse.
        Experimental procedures involve different experimental equipment and is changing constantly and depending on the current facility.
        Samples should be easily traceable and recoverable in stacked storage containers and sample-data should include meta-information.
        The data of paper lab notebooks should be stored electronically for future processing and annotate the measurements.
        These requirements highlight the necessity to create a database that is easily adoptable, agile in its evolution and efficient for sparse meta-data.
        Mobile, Desktop software and python-based scripting should create a low entrance barrier for scientists.
        This contribution shows the steps towards the implementation of such database and related software. I will present the requirements, 
          inclusion of project management and show how the data is stored in the data-base and its ability for agile adaptation. 
        A python interface, desktop software and mobile app will show basic functionality.
      </p>

      <p>This page should be the entrance to documentation</p>
      <ol>
        <li>Short about</li>
        <li>link to slide show</li>
        <li>link to MD-files converted to html</li>
      </ol>      
    </div>
  )
}
