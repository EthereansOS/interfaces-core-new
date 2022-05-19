import React, { useState } from 'react'

import PropTypes from 'prop-types'

import style from '../../../all.module.css'

const PoolCheck = props => {

    const { onClick, placeholder, text, label, deleteAfterInsert } = props

    const [tokenAddress, setTokenAddress] = useState(props.tokenAddress || "")

    function onClickLocal() {
        if (!tokenAddress) {
            return
        }
        onClick(tokenAddress)
        deleteAfterInsert && setTokenAddress('')
    }

    return (<>
                <input type="text" value={tokenAddress} onChange={e => setTokenAddress(e.target.value)} placeholder={placeholder} aria-label={placeholder}/>
                <a className={style.RoundedButton}  onClick={onClickLocal}>+</a>
            </>
    )
}

PoolCheck.propTypes = {
    onClick: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
}

export default PoolCheck