import getSolidityUtilities from './getSolidityUtilities'

/**
 * Get supported solidity version
 * @return {Promise<string[]>}
 */
async function getSupportedSolidityVersion() {
  const supportedSolidityVersion = '0.7.0'
  return [
    supportedSolidityVersion,
    (await getSolidityUtilities().getCompilers()).releases[
      supportedSolidityVersion
    ],
  ]
}

export default getSupportedSolidityVersion
