import React, { useState } from 'react'

import { useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'

import RegularModal from '../../Global/RegularModal'
import CreateItem from '../../../pages/items/dapp/create/item'

import style from '../../../all.module.css'

export default ({item}) => {

    const context = useEthosContext()

    const web3Data = useWeb3()

    const { account } = web3Data

    const [mode, setMode] = useState()

    if(item.mintOperator !== account && item.metadataOperator !== account) {
        return <></>
    }

    return (<div className={style.ViewBasicsHost}>
        {mode && <RegularModal close={() => setMode()}>
            <CreateItem inputItem={item} mode={mode}/>
        </RegularModal>}
        <h5>Host Tools</h5>
        {account === item.mintOperator && <a onClick={() => setMode("mintNewItem")}>New Item</a>}
        {account === item.mintOperator && <a onClick={() => setMode("changeMintOperator")}>Edit Mint Host</a>}
        {account === item.metadataOperator && <a onClick={() => setMode("changeMetadataOperator")}>Edit Metadata Host</a>}
    </div>)
}