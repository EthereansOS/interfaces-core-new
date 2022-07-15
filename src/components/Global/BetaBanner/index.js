import React from 'react'

import style from '../../../all.module.css'

export default ({close}) => {

    function preventClose(e) {
        e.preventDefault && e.preventDefault();
        e.stopPropagation && e.stopPropagation();
        e.stopImmediatePropagation && e.stopImmediatePropagation();
        return false;
    }

    return (
        <div onClick={close} className={style.ModalBack}>
            <div onClick={preventClose} className={style.ModalBoxBanner}>
                <h5><b>The EthereansOS interface is in BETA, and has limited features.</b></h5>
                <h6>If you find any issue, please contact us <a target="_blank" href="https://discord.gg/Eqf5xWBJsN">in our Discord Server</a></h6>
                <a className={style.Enter} onClick={close}>Enter</a>
                <span>By connecting to the App, you certify that you know all of the possible risks of using Ethereum Applications in Beta. Use EthereansOS at your own risk.</span>
            </div>
        </div>
    )
}