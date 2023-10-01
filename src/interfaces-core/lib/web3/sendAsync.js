import Web3 from 'web3'

const defaultInstrumentableMethods = ['eth_getLogs']

async function instrumentProvider(provider, method) {
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

  if (instrumentableMethods.indexOf(method.toLowerCase()) === -1) {
    return provider
  }

  var entry = (sendAsync.instrumentedProviders =
    sendAsync.instrumentedProviders || []).filter(
    (it) => it.provider === provider
  )[0]

  if (entry) {
    return entry.instrumentedProvider
  }

  const chainId = parseInt(await sendAsync(provider, 'eth_chainId'))

  entry = {
    chainId,
    provider,
    instrumentedProvider: provider,
  }

  sendAsync.instrumentedProviders = [
    ...(sendAsync.instrumentProvider || []),
    entry,
  ]

  const { chainProvider } = sendAsync.context || {
    chainProvider: {},
  }
  return (entry.instrumentedProvider =
    chainId !== 1 && chainProvider[chainId]
      ? new Web3.providers.HttpProvider(chainProvider[chainId])
      : provider)
}

async function sendAsyncInternal(provider, method, params) {
  return await new Promise(async function (ok, ko) {
    try {
      await (provider.sendAsync || provider.send || provider.request).call(
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
    } catch (e) {
      return ko(e)
    }
  })
}

async function _sendAsync(provider, method, params) {
  while (true) {
    try {
      return await sendAsyncInternal(provider, method, params)
    } catch (e) {
      var message = (e.stack || e.message || e.toString()).toLowerCase()
      if (
        message.indexOf('execution reverted') !== -1 ||
        message.indexOf('zero result') !== -1 ||
        method.indexOf('eth_send') !== -1
      ) {
        throw e
      }
      if (message.indexOf('429') === -1) {
        var instrumentedProvider = await instrumentProvider(provider, method)
        if (provider === instrumentedProvider) {
          throw e
        }
        return await _sendAsync(instrumentedProvider, method, params)
      }
      await new Promise((ok) => setTimeout(ok, 700))
    }
  }
}

function sendAsync(provider, method) {
  var params = [...arguments].slice(2) || []
  return _sendAsync(provider, method, params)
}

export default sendAsync
