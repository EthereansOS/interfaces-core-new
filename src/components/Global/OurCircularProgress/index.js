import React from 'react'

import style from '../../../all.module.css'

export default ({}) => {
    return (
        <><div className={style.LoaderA}>
            <div className={style.loadingio_spinner_disk_hn1zpmja0x6}><div className={style.ldio_f2vadqclpalj}>
                    <img className={style.animateFlicker} src={`${process.env.PUBLIC_URL}/img/loading-icon.png`}></img>
                </div>
            </div>
        </div>
        <div className={style.LoaderB}>
            <img src={`${process.env.PUBLIC_URL}/img/loading-icon.png`}></img>
        </div>
        </>)
}