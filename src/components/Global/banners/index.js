import React, { useState } from 'react'

import style from '../../../all.module.css'

export default props => {

    const { linkA, titleA, textA, sizeA, bannerA, linkB, titleB, textB, sizeB, bannerB} = props

    return (
    <div className={style.exploreBanners}>
                <a className={style[bannerA]} target="_blank" href={linkA} style={{"width" : sizeA, "marginRight" : "5%"}}>
                    <span>↗</span>
                    <h6>{titleA}</h6>
                    <p>{textA}</p>
                </a>
                <a className={style[bannerB]} target="_blank" href={linkB} style={{"width" : sizeB}}>
                    <span>↗</span>
                    <h6>{titleB}</h6>
                    <p>{textB}</p>

                </a>
            </div>
    )
}


