let lastEthereumPrice

/**
 * Get the ethereum price
 *
 * @param {Object} adapters - The adapters injected required by the function.
 * @param {EthosContext} adapters.context - The application context.
 * @return {Promise<*>}
 */
const getEthereumPrice = async function getEthereumPrice({ context }) {
  if (
    lastEthereumPrice &&
    lastEthereumPrice.requestExpires > new Date().getTime() &&
    lastEthereumPrice.price !== 0
  ) {
    return lastEthereumPrice.price
  }
  var price = 0
  try {
    const res = await fetch(context.coingeckoEthereumPriceURL)
    const resultPrice = await res.json()
    price = resultPrice[0].current_price
  } catch (e) {}

  lastEthereumPrice = {
    price,
    requestExpires:
      new Date().getTime() + context.coingeckoEthereumPriceRequestInterval,
  }

  return lastEthereumPrice.price
}

export default getEthereumPrice
