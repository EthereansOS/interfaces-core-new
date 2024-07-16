import Web3 from 'web3'

import Mutex from '../utils/mutex'

import sleep from '../utils/sleep'

const defaultInstrumentableMethods = ['eth_getLogs']

const instrumentedProviders = []

const sleepCodes = [
  429
]

const sleepText = [
  'Network request failed'
].map(it => it.toLowerCase())

const forceInstrumentationCodes = [
  -32005,
  -32701,
  -32001
]

const forceInstrumentationText = [
  sleepText[0]
].map(it => it.toLowerCase())

async function instrumentProvider(provider, method, force) {
  if(window.customProvider) {
    return window.customProvider
  }
  var instrumentableMethods = [...defaultInstrumentableMethods]

  try {
    instrumentableMethods = [
      ...(sendAsync.context.providerInstrumentableMethods ||
        defaultInstrumentableMethods),
    ]
  } catch (e) {}

  instrumentableMethods = instrumentableMethods
    .map((it) => it.toLowerCase())
    .filter((it, i, arr) => arr.indexOf(it) === i)

  if (!force && instrumentableMethods.indexOf(method.toLowerCase()) === -1) {
    return provider
  }

  var entry = instrumentedProviders.filter(
    (it) => it.provider == provider || it.instrumentedProvider == provider
  )[0]

  const chainId = parseInt(
    chainIds.filter((it) => it.provider == provider)[0]?.response ||
      (await sendAsync(provider, 'eth_chainId'))
  )

  if (entry) {
    return chainId === 1 && !force ? entry.provider : entry.instrumentedProvider
  }

  instrumentedProviders.push(
    (entry = {
      chainId,
      provider,
      instrumentedProvider: provider,
    })
  )

  const { chainProvider } = sendAsync.context || {
    chainProvider: {},
  }

  entry.instrumentedProvider = chainProvider[chainId]
    ? new Web3.providers.HttpProvider(chainProvider[chainId])
    : provider

  return chainId === 1 && !force ? entry.provider : entry.instrumentedProvider
}

async function _sendAsync(provider, method, params) {
  return await new Promise(async function (ok, ko) {
    try {
      var resp = (provider.sendAsync || provider.send || provider.request).call(
        provider,
        {
          jsonrpc: '2.0',
          method,
          params,
          id: new Date().getTime(),
        },
        function (error, response) {
          return error || (response && response.error)
            ? ko(error || (response && response.error))
            : ok(response && response.result)
        }
      )
      if(!provider.sendAsync && !provider.send) {
        return ok(await resp)
      }
    } catch (e) {
      return ko(e)
    }
  })
}

const permissions = 5
const mutex = new Mutex(permissions)
const chainIds = []
const blockNumbers = []
const l1BlockNumbers = []
const sleepLock = new Mutex()

async function waitForSleepLock() {
  if(sleepLock.queue() > 0) {
    await sleepLock.lock()
  }
}

var lockId
function enqueueSleepLock(noLock) {
  var sleepTime = sendAsync.sleepTime || 1500
  !noLock && sleepLock.lock()
  clearTimeout(lockId)
  lockId = setTimeout(() => {
    var oldNumber = sleepLock.queue()
    sleepLock.release(oldNumber < permissions ? oldNumber : permissions)
    oldNumber > permissions && enqueueSleepLock(true)
  }, sleepTime)
}

const sendAsync = async function sendAsync(prv, method) {
  const provider = prv.provider || prv.currentProvider || prv
  var params = [...arguments].slice(2) || []

  await mutex.lock()

  if (method === 'eth_chainId') {
    var entry = chainIds.filter((it) => it.provider == provider)[0]
    if (entry) {
      mutex.release()
      return entry.response
    }
  }

  if (
    method === 'eth_blockNumber' ||
    (method === 'eth_call' &&
      params[0].to === '0x4200000000000000000000000000000000000013')
  ) {
    var arr = method === 'eth_blockNumber' ? blockNumbers : l1BlockNumbers
    var entry = arr.filter((it) => it.provider == provider)[0]
    if (entry && entry.response && new Date().getTime() - entry.time < 15000) {
      mutex.release()
      return entry.response
    }
    !entry &&
      arr.push(
        (entry = {
          provider,
        })
      )
    entry.time = new Date().getTime()
  }

  var released = false
  const releaseId = undefined
    /*method === 'eth_getLogs'
      ? undefined
      : setTimeout(() => void (mutex.release(), (released = true)), 3500)*/

  var response
  var error
  var force
  while (!response && !error) {
    try {
      await waitForSleepLock()
      response = await _sendAsync(
        await instrumentProvider(provider, method, force),
        method,
        params
      )
      break
    } catch (e) {
      error = e
      var message = (e.message || e).toString().toLowerCase()
      if (sleepCodes.indexOf(e.code) !== -1 || sleepText.indexOf(message) !== -1) {
        error = undefined
        //await sleep(1500)
        enqueueSleepLock()
      }
      if (forceInstrumentationCodes.indexOf(e.code) !== -1 || forceInstrumentationText.indexOf(message) !== -1) {
        error = undefined
        force = true
      }
    }
  }

  if (!released) {
    clearTimeout(releaseId)

    mutex.release()
  }

  if (error) {
    throw error
  }

  if (!released) {
    if (method === 'eth_chainId') {
      chainIds.push({
        provider,
        response,
      })
    }

    if (
      method === 'eth_blockNumber' ||
      (method === 'eth_call' &&
        params[0].to === '0x4200000000000000000000000000000000000013')
    ) {
      ;(method === 'eth_blockNumber' ? blockNumbers : l1BlockNumbers).filter(
        (it) => it.provider == provider
      )[0].response = response
    }
  }

  return response
}

sendAsync.cleanCache = function cleanCache(array) {
  if (!array) {
    sendAsync.cleanCache(chainIds)
    sendAsync.cleanCache(blockNumbers)
    sendAsync.cleanCache(l1BlockNumbers)
    sendAsync.cleanCache(instrumentedProviders)
    return
  }
  while (array.length > 0) {
    array.pop()
  }
}

export default sendAsync
