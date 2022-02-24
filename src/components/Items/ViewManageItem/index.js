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

    if(item.collectionData.mintOperator !== account && item.collectionData.metadataOperator !== account) {
        return <></>
    }

    return (<div className={style.ViewBasics}>
        {mode && <RegularModal close={() => setMode()}>
            <CreateItem inputItem={item} mode={mode}/>
        </RegularModal>}
        <h5>Host options</h5>
        {account === item.collectionData.mintOperator && <a onClick={() => setMode("mintMore")}>Mint More</a>}
        {account === item.collectionData.metadataOperator && <a onClick={() => setMode("changeMetadata")}>Edit Metadata</a>}
    </div>)
}