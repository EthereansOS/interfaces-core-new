import React from 'react'

import { Modal } from '@ethereansos/interfaces-ui'

const BetaBanner = ({close}) => {
    return (
        <Modal visible>
            Ciao, siamo in BETA, non scassare la minchia.
            <a onClick={close}>Close</a>
        </Modal>
    )
}

export default BetaBanner