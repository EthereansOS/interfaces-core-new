import React, { useContext, useState, useEffect, useMemo } from 'react'

import { OpenSeaPort, Network } from 'opensea-js'
import { loadTokenFromAddress } from './erc20'

import MenuCapableComponent from "../components/Global/MenuCapableComponent"
import { useLocation } from 'react-router'
import { useWeb3, sendAsync, web3Utils } from '@ethereansos/interfaces-core'

import TransactionResult from '../components/Global/TransactionResult'

import style from '../all.module.css'
import custom from '../custom.module.css'

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
    {name : '👓', value:'sepia'},
    {name : '🕶', value:'dark'},
    {name : '🍀', value:'biz'},
    {name : '💾', value:'matrix'}
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
        <div className={pathname.indexOf('') !== -1 ? style[theme] : undefined}>
            {children}
        </div>
    </ThemeSelectorContext.Provider>
}

export const useThemeSelector = () => useContext(ThemeSelectorContext)

const OpenSeaContext = React.createContext('openSea')

export const OpenSeaContextProvider = ({ children }) => {

    const { chainId, web3, dualChainId, dualChainWeb3 } = useWeb3()

    const seaport = useMemo(() => {
        var theWeb3 = dualChainWeb3 || web3
        var theChainId = dualChainId || chainId
        return theWeb3 && theWeb3.currentProvider ? new OpenSeaPort(theWeb3.currentProvider, {
            networkName: theChainId === 4 ? Network.Rinkeby : Network.Main,
            apiKey: theChainId === 4 ? undefined : require('./frankSwet.json')
        }) : null
    }, [chainId, web3, dualChainId, dualChainWeb3])

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

export const GlobalModalContextProvider = props => {

    const [value, setValue] = useState({})

    const [onClose, setOnClose] = useState()

    const [children, setChildren] = useState()

    const [className, setClassName] = useState()

    function close() {
        setChildren()
        var oc = onClose
        setOnClose()
        oc && oc()
    }

    value.show = function show(data) {
        const {
            onClose,
            className,
            timeout,
            content
        } = data || {}
        if(content && children) {
            return
        }
        setOnClose(onClose)
        setClassName(className)
        setChildren(content)
        timeout && setTimeout(close, timeout)
    }

    var chosenClassName = className || "OverlayBox"

    return (
        <GlobalModalContext.Provider value={value}>
            {children && <div className={style[chosenClassName] || custom[chosenClassName]}>{children}</div>}
            {props.children}
        </GlobalModalContext.Provider>
    )
}

const TransactionModalContext = React.createContext("transactionModal")

export const useTransactionModal = () => useContext(TransactionModalContext)

export const TransactionModalContextProvider = ({ children }) => {

    const { web3 } = useWeb3()

    const globalModal = useGlobalModal()

    function instrumentMethod(provider, name) {
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
                    globalModal.show({
                        className : "SuccessMessage",
                        timeout : 7000,
                        content : <TransactionResult transactionHash={transactionHash}/>
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

export async function addTokenToMetamask(data, address, image) {

    const { web3 } = data

    const token = await loadTokenFromAddress(data, address)

    web3.currentProvider.request({
        method: 'wallet_watchAsset',
        params: {
            type: "ERC20",
            options: {
                address,
                symbol : token.symbol,
                decimals : token.decimals,
                image : image || token.image,
            },
        },
        id: Math.round(Math.random() * 100000),
    }, (err, added) => {
        console.log('provider returned', { err, added })
    })
}

export function copyToClipboard(value) {
    if(navigator.clipboard) {
        return navigator.clipboard.writeText(value)
    }
    const input = document.createElement('input')
    input.type = 'text'
    input.value = value
    document.body.appendChild(input)
    input.focus()
    input.select()
    input.setSelectionRange(0, 99999)
    try {
        document.execCommand('copy')
    } catch(e) {
        console.log(e)
    }
    document.body.removeChild(input)
}

export function toChecksumAddress(item) {
    if(!item) {
        return item
    }
    if(item.sourceAddress) {
        item.sourceAddress = web3Utils.toChecksumAddress(item.sourceAddress)
    }
    if(item.address) {
        item.address = web3Utils.toChecksumAddress(item.address)
    }
    if(item.tokenAddress) {
        item.tokenAddress = web3Utils.toChecksumAddress(item.tokenAddress)
    }
    if((typeof item).toLowerCase() === 'string') {
        item = web3Utils.toChecksumAddress(item)
    }
    return item
}

export function getAddress(item) {
    if(!item) {
        return item
    }
    if(item.sourceAddress) {
        return web3Utils.toChecksumAddress(item.sourceAddress)
    }
    if(item.address) {
        return web3Utils.toChecksumAddress(item.address)
    }
    if(item.sourceAddress) {
        return web3Utils.toChecksumAddress(item.sourceAddress)
    }
    if(item.tokenAddress) {
        return web3Utils.toChecksumAddress(item.tokenAddress)
    }
    if((typeof item).toLowerCase() === 'string') {
        return web3Utils.toChecksumAddress(item)
    }
    return item
}

export function sleep(millis) {
    return new Promise(ok => setTimeout(ok), millis || 500)}