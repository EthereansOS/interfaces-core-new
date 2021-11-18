import React from 'react'

export default ({type}) => {
  return (
    <div>
        {type === 'delegation' ? <>
        I'm a delegation
        </> : <>I'm a organization</>}
    </div>
  )
}