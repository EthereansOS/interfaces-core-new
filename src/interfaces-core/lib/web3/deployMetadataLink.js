import getSolidityUtilities from './getSolidityUtilities'
import getNetworkElement from './getNetworkElement'
import validateDFOMetadata from './validateDFOMetadata'
import { createContract } from './contracts'

/**
 * Deploy metadata link
 *
 * @param {Object} adapters - The adapters injected required by the function.
 * @param {web3} adapters.web3 - The web3 instance.
 * @param {EthosContext} adapters.context - The application context.
 * @param {string} adapters.chainId - The network id.
 * @param {IpfsHttpClient} adapters.ipfsHttpClient - The ipfsHttpClient.
 * @param metadata
 * @param functionalitiesManager
 * @return {Promise<*>}
 */
async function deployMetadataLink(
  { web3, context, chainId, ipfsHttpClient },
  metadata,
  functionalitiesManager
) {
  if (metadata) {
    let aVar = false
    Object.values(metadata).forEach((it) => {
      if (it) {
        aVar = true
      }
    })
    if (!aVar) {
      return
    }
  }

  const metadataLink = await validateDFOMetadata(
    { context, ipfsHttpClient },
    metadata
  )
  const code = `
pragma solidity ^0.7.1;

contract DeployMetadataLink {

  constructor(address mVDFunctionalitiesManagerAddress, address sourceLocation, uint256 sourceLocationId, string memory metadataLink) {
      IMVDFunctionalitiesManager functionalitiesManager = IMVDFunctionalitiesManager(mVDFunctionalitiesManagerAddress);
      functionalitiesManager.addFunctionality("getMetadataLink", sourceLocation, sourceLocationId, address(new GetStringValue(metadataLink)), false, "getValue()", '["string"]', false, false);
      selfdestruct(msg.sender);
  }
}

interface IMVDFunctionalitiesManager {
  function addFunctionality(string calldata codeName, address sourceLocation, uint256 sourceLocationId, address location, bool submitable, string calldata methodSignature, string calldata returnAbiParametersArray, bool isInternal, bool needsSender) external;
}

contract GetStringValue {

  string private _value;

  constructor(string memory value) public {
      _value = value;
  }

  function onStart(address, address) public {
  }

  function onStop(address) public {
  }

  function getValue() public view returns(string memory) {
      return _value;
  }
}
`.trim()

  const selectedSolidityVersion = 'soljson-v0.7.1+commit.f4a555be.js'
  const SolidityUtilities = await getSolidityUtilities()
  const compiled = await SolidityUtilities.compile(
    code,
    selectedSolidityVersion,
    200
  )
  const selectedContract = compiled['DeployMetadataLink']
  const args = [
    selectedContract.abi,
    selectedContract.bytecode,
    functionalitiesManager,
    getNetworkElement({ context, chainId }, 'defaultOcelotTokenAddress'),
    getNetworkElement(
      { context, chainId },
      'deployMetadataLinkSourceLocationId'
    ),
    metadataLink,
  ]

  return await createContract({ web3, context }, args)
}

export default deployMetadataLink
