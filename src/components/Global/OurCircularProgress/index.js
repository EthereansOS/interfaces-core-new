import React from 'react'

import style from '../../../all.module.css'

export default ({}) => {
    return (
        <><div className={style.LoaderA}>
            <div class={style.loadingio_spinner_disk_hn1zpmja0x6}><div class={style.ldio_f2vadqclpalj}>
                    <div><div></div><div></div></div>
                </div>
            </div>
        </div>
        <div className={style.LoaderB}>
            <img src={`${process.env.PUBLIC_URL}/img/miniloader.gif`}></img>
        </div>
        </>)
}