import React, { useState, useEffect, useContext } from 'react'
import { getNetworkElement, useEthosContext, useWeb3, web3Utils } from '@ethereansos/interfaces-core';

const ContextualWeb3Context = React.createContext("contextualWeb3")

export const ContextualWeb3ContextWeb3Provider = ({children}) => {

    const context = useEthosContext()
    const {web3, chainId} = useWeb3()

    const [globalContractNames, setGlobalContractNames] = useState([])
    const [globalContracts, setGlobalContracts] = useState([])

    const [contracts, setContracts] = useState({})

    useEffect(() => {
        setContracts({})
        web3 && setGlobalContracts(globalContractNames.map(newContractByName))
    }, [chainId])

    function newContractByName(contractName) {
        return newContract(context[(contractName[0].toUpperCase() + contractName.substring(1)) + "ABI"], getNetworkElement({context, networkId : chainId},contractName + "Address"))
    }

    function newContract(abi, address) {
        var key = web3Utils.sha3(JSON.stringify(abi) + address)
        var contract = contracts[key]
        contract = contract || (web3 && new web3.eth.Contract(abi, address))
        contract && setContracts(oldValue => ({...oldValue, [key] : contract}))
        return contract
    }

    function getGlobalContract(contractName) {
        var index = globalContractNames.indexOf(contractName)
        if(index === -1) {
            var contract = newContractByName(contractName)
            contract && setGlobalContracts(oldValue => [...oldValue, contract])
            contract && setGlobalContractNames(oldValue => [...oldValue, contractName])
            return contract;
        }
        return globalContracts[index]
    }

    var value = {
        getGlobalContract,
        newContract
    }

    return <ContextualWeb3Context.Provider value={value}>{web3 && children}</ContextualWeb3Context.Provider>
}

export const useContextualWeb3 = () => useContext(ContextualWeb3Context)