import React from 'react'

export default ({element, type}) => {
  return (
    <div>
      {type === 'delegation' ? <>
      I'm a delegation
      </> : <>I'm a organization</>}
    </div>
  )
}