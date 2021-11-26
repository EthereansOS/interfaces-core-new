import React, { useState } from 'react'

var Description = ({title, description, className}) => {

    const [short, setShort] = useState(true)

    if(!description) {
      return
    }


    var shortLength = 50

    return (
      <>
        <h6>{title}</h6>
        <p className={className}></p>
      </>
    )
  }

export default Description