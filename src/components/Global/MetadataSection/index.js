import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './metadata-section.module.css'

const MetadataSection  = (props) => {
    return (

        <div className={style.MetadataSection}>
            {/* Single Metadata */}
            <div className={style.MetadataSingle}>
                <h6>Description</h6>
                <a className={style.MetadataSingleToogle}>Open</a>
                {/* Div to open <div className={style.MetadataSingleOpened}>
                 For Text  <p></p>
                 For Link  <a target="_blank">Link</a>
                </div>*/}
            </div>
            {/* Single Metadata End */}
            <div className={style.MetadataSingle}>
                <h6>Description</h6>
                <a className={style.MetadataSingleToogle}>Open</a>
            </div>
            <div className={style.MetadataSingle}>
                <h6>Description</h6>
                <a className={style.MetadataSingleToogle}>Open</a>
            </div>
            <div className={style.MetadataSingle}>
                <h6>Description</h6>
                <a className={style.MetadataSingleToogle}>Open</a>
            </div>
            <div className={style.MetadataSingle}>
                <h6>Description</h6>
                <a className={style.MetadataSingleToogle}>Open</a>
            </div>
            <div className={style.MetadataSingle}>
                <h6>Description</h6>
                <a className={style.MetadataSingleToogle}>Open</a>
            </div>
            <div className={style.MetadataSingle}>
                <h6>Description</h6>
                <a className={style.MetadataSingleToogle}>Open</a>
            </div>
            <div className={style.MetadataSingle}>
                <h6>Description</h6>
                <a className={style.MetadataSingleToogle}>Open</a>
            </div>
            <div className={style.MetadataSingle}>
                <h6>Description</h6>
                <a className={style.MetadataSingleToogle}>Open</a>
            </div>
            <div className={style.MetadataSingle}>
                <h6>Description</h6>
                <a className={style.MetadataSingleToogle}>Open</a>
            </div>
            
        </div>

    )
}

    export default MetadataSection