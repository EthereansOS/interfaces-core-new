import { VOID_ETHEREUM_ADDRESS } from '../constants'

import getAddress from './getAddress'
import sendBlockchainTransaction from './sendBlockchainTransaction'

let allContracts = {}

/**
 * Reset contracts
 */
export const resetContracts = () => {
  allContracts = {}
}

/**
 * New contract
 *
 * @param {Object} adapters - The adapters injected required by the function.
 * @param {web3} adapters.web3 - The web3 instance.
 * @param abi
 * @param address
 * @return {*}
 */
export const newContract = ({ web3 }, abi, address = VOID_ETHEREUM_ADDRESS) => {
  const abiKey = web3.utils.sha3(JSON.stringify(abi))
  const contracts = (allContracts[abiKey] = allContracts[abiKey] || {})
  const key = address.toLowerCase()
  contracts[key] =
    contracts[key] ||
    new web3.eth.Contract(
      abi,
      address === VOID_ETHEREUM_ADDRESS ? undefined : address
    )
  return contracts[key]
}

/**
 * Create a contract
 *
 * @param {Object} adapters - The adapters injected required by the function.
 * @param {web3} adapters.web3 - The web3 instance.
 * @param {EthosContext} adapters.context - The application context.
 * @param abi
 * @param data
 * @return {Promise<*>}
 */
export async function createContract({ web3, context }, abi, data) {
  const args = []
  if (arguments.length > 3) {
    for (var i = 3; i < arguments.length; i++) {
      args.push(arguments[i])
    }
  }

  const from = await getAddress({ web3 })
  data = newContract({ web3 }, abi).deploy({
    data,
    arguments: args,
  })

  let contractAddress
  // TODO verify how to import this.
  // It's currently imported through an npm module called 'rlp'
  // var nonce = await web3.eth.getTransactionCount(from)
  // nonce = parseInt(numberToString(nonce) + '')
  // contractAddress =
  //   window.getNextContractAddress &&
  //   window.getNextContractAddress(from, nonce === 0 ? undefined : nonce)
  try {
    const sendTransactionParams = {
      from,
      data: data.encodeABI(),
      gasLimit: await data.estimateGas({ from }),
    }

    contractAddress = (
      await sendBlockchainTransaction(
        { web3, context },
        undefined,
        web3.eth.sendTransaction(sendTransactionParams)
      )
    ).contractAddress
  } catch (e) {
    try {
      if (
        !contractAddress ||
        (e.message || e).indexOf(
          "The contract code couldn't be stored, please check your gas"
        ) === -1
      ) {
        throw e
      }
    } catch (a) {
      throw e
    }
  }
  return newContract({ web3 }, abi, contractAddress)
}

/**
 * Get all contracts
 * @return {{}}
 */
export const getAllContracts = () => allContracts
