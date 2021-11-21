import React from 'react'

import style from './beta-banner.module.css'

const BetaBanner = ({close}) => {
    return (
        <div className={style.ModalBack}>
            <div className={style.ModalBoxBanner}>
                <h5><b>The EthOS interface is in BETA, and has limited features.</b></h5>
                <h6>We'll introduce these over the next few weeks. Currently missing are:</h6>
                <p>Create an Organization</p>
                <p>Create an Item</p>
                <p>Create or View a Factory</p>
                <p>Create a Farming or a Routine contract</p>
                <h6>If you find any issues, or have cool ideas to share, please contact us on GitHub here: <a target="_blank" ></a></h6>
            <a className={style.Enter} onClick={close}>Enter</a>

            </div>
        </div>
    )
}

export default BetaBanner