import React, { useContext, useState, useEffect, useMemo } from 'react'

import { OpenSeaPort, Network } from 'opensea-js'

import MenuCapableComponent from "../components/Global/MenuCapableComponent"
import { useLocation } from 'react-router'
import { useEthosContext, useWeb3, sendAsync } from '@ethereansos/interfaces-core'

import RegularModal from '../components/Global/RegularModal'

import style from '../all.module.css'
import TransactionResult from '../components/Global/TransactionResult'

export function retrieveComponentsByReflection(contextualRequire, key, returnElement) {
    return contextualRequire.keys().map(element => {
        var Element = contextualRequire(element).default
        return Element && Element[key] ? returnElement ? Element : Element[key] : undefined
    }).filter(it => it !== undefined && it !== null)
}

export function retrieveSavedPath(menuVoices, currentLocationInput) {
    const database = menuVoices.filter(it => it !== undefined && it !== null).map(it => it.toLowerCase()).sort((a, b) => a.localeCompare(b))

    const currentLocation = currentLocationInput.toLowerCase()

    var selectedVoices = database.filter(it => it === currentLocation)
    selectedVoices = selectedVoices.length > 0 ? selectedVoices : database.filter(it => selectedVoices.indexOf(it) === -1 && it !== currentLocation && currentLocation.indexOf(it.split(':')[0]) !== -1 && it.split('/').length === currentLocation.split('/').length)
    selectedVoices = selectedVoices.length > 0 ? selectedVoices : database.filter(it => selectedVoices.indexOf(it) === -1 && it !== currentLocation && currentLocation.indexOf(it.split(':')[0]) !== -1)
    selectedVoices = selectedVoices.length > 0 ? selectedVoices : database.filter(it => selectedVoices.indexOf(it) === -1 && it !== currentLocation && it.split(':')[0].indexOf(currentLocation) !== -1)
    selectedVoices = selectedVoices.length > 0 ? selectedVoices : database

    return selectedVoices[selectedVoices.length - 1]
}

export function prepareAddToPlugin(contextualRequire, all, name, link, className, pluginIndex, image, nomenu) {
    return {
        pluginIndex,
        addToPlugin: ({ index }) =>
            ({ addElement }) => {
                retrieveComponentsByReflection(all, "menuVoice").forEach((it, i) => it.path && addElement('router', {
                    ...it,
                    index: index + i,
                    Component: MenuCapableComponent,
                    requireConnection: true,
                    templateProps: {
                        ...it.templateProps,
                        contextualRequire,
                        menuName: 'appMenu',
                        isDapp: true,
                        link,
                        className,
                        nomenu
                    },
                }))
                addElement('appMenu', {
                    name,
                    label: name,
                    link,
                    image,
                    index
                })
            }
    }
}

const ThemeSelectorContext = React.createContext('themeSelector')

const themes = [
    {name : '💡', value:'light'},
    {name : '🕶', value:'dark'},
    {name : '🍀', value:'biz'},
]

export const ThemeSelectorContextProvider = ({children}) => {

    const { pathname } = useLocation()

    var currentTheme = themes[0].value

    try {
        currentTheme = window.localStorage.theme || currentTheme
    } catch(e) {}

    const [theme, setTheme] = useState(currentTheme)

    useEffect(() => {
        try {
            window.localStorage.setItem("theme", theme)
        } catch(e) {
        }
    }, [theme])

    var value = {
        theme,
        themes,
        setTheme
    }

    return <ThemeSelectorContext.Provider value={value}>
        <div className={pathname.indexOf('/dapp') !== -1 ? style[theme] : undefined}>
            {children}
        </div>
    </ThemeSelectorContext.Provider>
}

export const useThemeSelector = () => useContext(ThemeSelectorContext)

const OpenSeaContext = React.createContext('openSea')

export const OpenSeaContextProvider = ({ children }) => {

    const { chainId, web3 } = useWeb3()

    const seaport = useMemo(() => web3 ? new OpenSeaPort(web3.currentProvider, {
        networkName: chainId === 4 ? Network.Rinkeby : Network.Main,
        apiKey: chainId === 4 ? undefined : require('./frankSwet.json')
    }) : null, [chainId, web3])

    return (<OpenSeaContext.Provider value={seaport}>{children}</OpenSeaContext.Provider>)
}

export const useOpenSea = () => useContext(OpenSeaContext)

export async function perform({
    setLoading,
    call,
    onSuccess,
}) {
    setLoading && setLoading(true)
    var errorMessage;
    try {
        var result = call()
        result = result.then ? await result : result
        onSuccess && onSuccess(result)
    } catch(e) {
        errorMessage = e.message || e
        if(errorMessage.toLowerCase().indexOf("user denied") !== -1) {
            errorMessage = undefined
        }
    }
    setLoading(false)
    errorMessage && setTimeout(() => alert(errorMessage))
}

const GlobalModalContext = React.createContext("globalModal")

export const useGlobalModal = () => useContext(GlobalModalContext)

export const GlobalModalContextProvider = (props) => {

    const [closeable, setCloseable] = useState()
    const [onClose, setOnClose] = useState()

    const [children, setChildren] = useState()

    function close() {
        setChildren()
        setCloseable()
        var oc = onClose
        setOnClose()
        oc && oc()
    }

    function value({
        closeable,
        onClose,
        children,
        timeout
    }) {
        setCloseable(closeable)
        setOnClose(onClose)
        timeout && setTimeout(close, timeout)
        setChildren(children)
    }

    return (
        <GlobalModalContext.Provider value={value}>
            {children && <div className={style.SuccessMessage}>{children}</div>}
            {props.children}
        </GlobalModalContext.Provider>
    )
}

const TransactionModalContext = React.createContext("transactionModal")

export const useTransactionModal = () => useContext(TransactionModalContext)

export const TransactionModalContextProvider = ({ children }) => {

    const { web3 } = useWeb3()

    const globalModal = useGlobalModal()

    function instrumentMethod(provider, name, funct) {
        if(!provider[name]) {
            return
        }
        if(provider['old_' + name]) {
            return
        }
        var oldMethod = provider[name]
        provider['old_' + name] = oldMethod
        provider[name] = function() {
            return instrumentedMethod(provider, oldMethod, arguments)
        }
    }

    function instrumentedMethod(provider, oldMethod, methodArgs) {
        var methodName = methodArgs[0].method
        if(methodName === 'eth_sendTransaction' || methodName === 'eth_sendRawTransaction' || methodName === 'eth_sendSignedTransaction') {
            var callback = methodArgs[1]
            methodArgs[1] = function (err, response) {
                setTimeout(() => callback(err, response))
                if(err) {
                    return
                }
                var transactionHash = response.result
                var millis = 4000
                async function tim() {
                    var receipt = await sendAsync(provider, 'eth_getTransactionReceipt', transactionHash)
                    if(!receipt) {
                        return setTimeout(tim, millis)
                    }
                    globalModal({
                        timeout : 7000,
                        children : <TransactionResult transactionHash={transactionHash}/>
                    })
                }
                setTimeout(tim, millis)
            }
        }
        return oldMethod.apply(provider, methodArgs)
    }

    useEffect(function() {
        if(!web3 || !web3.currentProvider) {
            return
        }
        instrumentMethod(web3.currentProvider, "send")
        instrumentMethod(web3.currentProvider, "sendAsync")
    }, [web3])

    return (
        <TransactionModalContext.Provider value={null}>
            {children}
        </TransactionModalContext.Provider>
    )
}