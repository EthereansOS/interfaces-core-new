import React from 'react'
import { Link } from 'react-router-dom'


import style from '../../../all.module.css'

const ViewProperties = ({ item }) => {
  if (!item.attributes || item.attributes.length === 0) {
    return <></>
  }
  return (
    <div>
      <div className={style.CollectionRightSubtitles} style={{borderBottom: '0px', marginBottom: '0px'}}>
        <h4>Metadata</h4>
      </div>
      <div className={style.ViewProperties} style={{ marginTop: '10px'}}>
        {item.attributes.map(attr => <div key={attr.name} className={style.ViewProperty}>
          <p>{attr.trait_type}:</p>
          <h6>{attr.value || '\u00a0'}</h6>
        </div>)}
      </div>
    </div>

  )
}

export default ViewProperties
