import { VOID_ETHEREUM_ADDRESS } from '../constants'

import isEthereumAddress from './isEthereumAddress'

/**
 * Check if address exists and is not the VOID ethereum address
 * @param address
 * @return {boolean}
 */
function hasEthereumAddress(address) {
  return isEthereumAddress(address) && address !== VOID_ETHEREUM_ADDRESS
}

export default hasEthereumAddress
