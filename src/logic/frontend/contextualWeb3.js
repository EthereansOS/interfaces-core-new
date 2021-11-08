import React, { useState, useEffect, useContext } from 'react'
import { getNetworkElement, useEthosContext, useWeb3 } from '@ethereansos/interfaces-core';

const ContextualWeb3Context = React.createContext("contextualWeb3")

export const ContextualWeb3ContextWeb3Provider = ({children}) => {

    const context = useEthosContext()
    const {web3, chainId} = useWeb3()

    const [globalContractNames, setGlobalContractNames] = useState([])
    const [globalContracts, setGlobalContracts] = useState([])

    useEffect(() => {
        if(web3) {
            setGlobalContracts(globalContractNames.map(createContract))
        }
    }, [chainId])

    function createContract(contractName) {
        return new web3.eth.Contract(context[(contractName[0].toUpperCase() + contractName.substring(1)) + "ABI"], getNetworkElement({context, networkId : chainId},contractName + "Address"))
    }

    function getGlobalContract(contractName) {
        var index = globalContractNames.indexOf(contractName)
        if(index === -1) {
            var contract = createContract(contractName)
            setGlobalContracts(oldValue => [...oldValue, contract])
            setGlobalContractNames(oldValue => [...oldValue, contractName])
            return contract;
        }
        return globalContracts[index]
    }

    var value = {
        getGlobalContract
    }

    return <ContextualWeb3Context.Provider value={value}>{children}</ContextualWeb3Context.Provider>
}

export const useContextualWeb3 = () => useContext(ContextualWeb3Context)