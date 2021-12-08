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
                <h5><b>The EthOS interface is in BETA, and has limited features.</b></h5>
                <h6>We'll introduce these over the next few weeks. Currently missing are:</h6>
                <p>Create an Organization</p>
                <p>Create or View an Item</p>
                <p>Create or View a Factory</p>
                <p>Create or view Covenants</p>
                <p>Mobile View and Dark Mode</p>
                <h6>If you find any issues, or have cool ideas to share, please contact us <a target="_blank" href="https://discord.gg/5YNX74qNYj">here</a></h6>
                <a className={style.Enter} onClick={close}>Enter</a>
            </div>
        </div>
    )
}