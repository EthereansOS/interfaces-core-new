import React, { useState } from 'react'

import { useEthosContext, useWeb3 } from 'interfaces-core'

import RegularModal from '../../Global/RegularModal'
import CreateItem from '../../../pages/items/dapp/create/item'

import style from '../../../all.module.css'

export default ({item, onRefresh}) => {

    const context = useEthosContext()

    const web3Data = useWeb3()

    const { account } = web3Data

    const [mode, setMode] = useState()

    if(item.collectionData.mintOperator !== account && item.collectionData.metadataOperator !== account) {
        return <></>
    }

    return (
    <>
        <div className={style.CollectionRightSubtitles}>
        <h4>Host Tools</h4>
      </div>
      <div className={style.ViewBasicsHost} style={{ marginTop: '10px'}}>
        {mode && <RegularModal close={() => setMode()}>
            <CreateItem inputItem={item} mode={mode} close={() => void(onRefresh(), setMode())}/>
        </RegularModal>}
        {account === item.collectionData.mintOperator && <a onClick={() => setMode("mintMore")}>Mint</a>}
        {account === item.collectionData.metadataOperator && <a onClick={() => setMode("changeMetadata")}>Edit Metadata</a>}
    </div>
    </>
    )
}