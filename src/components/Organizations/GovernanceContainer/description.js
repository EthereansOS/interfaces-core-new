import React, { useState } from 'react'

var Description = ({title, description, className, shortLength}) => {

    const [short, setShort] = useState(true)

    if(!description) {
      return <></>
    }

    var sl = shortLength || 300

    return (
      <>
        {title && <h6>{title}</h6>}
        <p className={className}>
          {short ? description.substring(0, sl) : description}
          {description.length > sl && <>
            <br/>
            <a onClick={() => setShort(!short)}>{short ? "More" : "Less"}</a>
          </>}
        </p>
      </>
    )
  }

export default Description