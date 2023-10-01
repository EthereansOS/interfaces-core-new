import sendAsync from './sendAsync'

/**
 * Get current ethereum address
 *
 * @param {Object} adapters - The adapters injected required by the function.
 * @param {web3} adapters.web3 - The web3 instance.
 * @return Promise<string>
 */
export default async function getAddress({ provider }) {
  try {
    return provider.accounts[0]
  } catch (e) {
    return (await sendAsync(provider, 'eth_requestAccounts'))[0]
  }
}
