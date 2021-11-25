import { abi, VOID_ETHEREUM_ADDRESS, uploadMetadata, getNetworkElement, numberToString, blockchainCall, web3Utils, sendAsync, formatLink, tryRetrieveMetadata } from "@ethereansos/interfaces-core"

import { getEthereum } from "./erc20"

export async function create({ context, ipfsHttpClient, newContract, chainId, ballotMaker }, metadata, duration, values, votingToken, tokenId, weight) {

    var uri = await uploadMetadata({ context, ipfsHttpClient }, metadata)

    weight = weight || 1
    if(!tokenId) {
        tokenId = abi.encode(["address"], [votingToken])
        votingToken = VOID_ETHEREUM_ADDRESS
    }

    await blockchainCall(ballotMaker.methods.createBallot, ballotMaker.options.address, uri, values, duration, [votingToken], [tokenId], [weight])
}

export async function all({ context, ballotMaker }) {

    var proposalIds = {}

    var args = {
        address: ballotMaker.options.address,
        topics: [
            web3Utils.sha3('Ballot(address,bytes32)')
        ],
        fromBlock: '0x0',
        toBlock: 'latest'
    }

    var logs = await sendAsync(ballotMaker.currentProvider, 'eth_getLogs', args)

    logs.forEach(it => proposalIds[it.topics[2]] = true)

    proposalIds = Object.keys(proposalIds)

    var proposals = await Promise.all(proposalIds.map(async it => ({...(await blockchainCall(ballotMaker.methods.execute, it)), id: it })))

    proposals = await Promise.all(proposals.map(async it => {
        var link = formatLink({ context }, it.uri)
        var metadata = await (await fetch(link)).json()
        return {...it, ...metadata }
    }))

    return proposals
}

export async function getProposal({ context, contract, newContract, account, web3 }, id) {
    var proposalData = {...(await blockchainCall(contract.methods.execute, id)), id }
    proposalData = {...proposalData, ...(await (await fetch(formatLink({ context }, proposalData.uri))).json()) }

    try {
        proposalData.values = proposalData.values.map(it => {
            var decoded = abi.decode([proposalData.valueType], it)[0]
            var toString = decoded.toString()
            if (toString === '[object Object]') {
                toString = decoded
            }
            return toString
        })
    } catch (e) {}

    var proposalsManager = contract.contract ? contract.proposalsManager : newContract(context.ProposalsManagerABI, await blockchainCall(contract.methods.get, context.grimoire.COMPONENT_KEY_PROPOSALS_MANAGER))
    proposalData.proposalsManager = proposalsManager
    proposalData.proposals = await blockchainCall(proposalsManager.methods.list, proposalData.proposalIds)
    proposalData.endBlock = proposalData.ballotDuration.ethereansosAdd(proposalData.proposals[0].creationBlock)
    var currentBlock = await sendAsync(proposalsManager.currentProvider, 'eth_getBlockByNumber', 'latest', false)
    currentBlock = currentBlock.number
    currentBlock = parseInt(currentBlock)
    proposalData.terminated = currentBlock >= parseInt(proposalData.endBlock)
    proposalData.proposals = await Promise.all(proposalData.proposals.map((prop, i) => decodeProposal({ account, web3, context, newContract }, {...prop, uri: proposalData.uri, value: proposalData.values[i], id: proposalData.proposalIds[i] })))
    return proposalData
}

export async function decodeProposal({ account, web3, context, newContract }, prop) {
    var proposal = {...prop }
    proposal.votingTokens = web3.eth.abi.decodeParameters(["address[]", "uint256[]", "uint256[]"], proposal.votingTokens)
    var votingTokens = [];
    for (var i in proposal.votingTokens[0]) {
        votingTokens.push({
            address: proposal.votingTokens[0][i],
            objectId: proposal.votingTokens[1][i],
            weight: proposal.votingTokens[2][i]
        })
    }
    proposal.votingTokens = await Promise.all(votingTokens.map(it => decodeProposalVotingToken({ account, web3, context, newContract }, proposal.id, it.address, it.objectId, it.weight)))
    return proposal
}

export async function decodeProposalVotingToken({ account, web3, context, newContract }, proposalId, addr, objectId, weight) {

    var token = await decodeToken({ account, web3, context, newContract }, addr, objectId)
    token.weight = weight
    token.itemKey = generateItemKey(token, proposalId)
    return token
}

export function generateItemKey(token, proposalId) {
    return web3Utils.soliditySha3({
        type: 'bytes32',
        value: proposalId
    }, {
        type: 'address',
        value: token.originalAddress
    }, {
        type: 'uint256',
        value: token.originalObjectId
    })
}

export async function decodeToken({ account, web3, context, newContract }, addr, objectId) {
    var address = addr === VOID_ETHEREUM_ADDRESS ? !parseInt(objectId) ? VOID_ETHEREUM_ADDRESS : web3Utils.toHex(objectId) : addr
    if (address === VOID_ETHEREUM_ADDRESS) {
        return await getEthereum({ account, web3 })
    }
    var contract = newContract(context[addr === VOID_ETHEREUM_ADDRESS ? "ItemInteroperableInterfaceABI" : "ItemMainInterfaceABI"], address)
    var mainInterface = null
    var itemId = null
    var interoperableInterface = null
    var hasPermit = null
    try {
        if (addr === VOID_ETHEREUM_ADDRESS) {
            mainInterface = newContract(context.ItemMainInterfaceABI, await blockchainCall(contract.methods.mainInterface))
            itemId = await blockchainCall(contract.methods.itemId)
            interoperableInterface = newContract(context.ItemInteroperableInterfaceABI, await blockchainCall(mainInterface.methods.interoperableOf, itemId))
            hasPermit = true
        } else {
            interoperableInterface = newContract(context.ItemInteroperableInterfaceABI, await blockchainCall(contract.methods.interoperableOf, objectId))
            itemId = objectId
            mainInterface = newContract(context.ItemMainInterfaceABI, await blockchainCall(interoperableInterface.methods.mainInterface))
            hasPermit = true
        }
    } catch (e) {}
    var token = {
        originalAddress : addr,
        originalObjectId : objectId,
        address,
        contract: mainInterface || contract,
        mainInterface,
        interoperableInterface,
        id: itemId || (addr !== VOID_ETHEREUM_ADDRESS && objectId),
        passedAsERC20: addr === VOID_ETHEREUM_ADDRESS,
        hasPermit
    }

    if (addr === VOID_ETHEREUM_ADDRESS && !mainInterface) {
        token = {...token, ...(await getERC20ClassicMetadata(token.contract)) }
    } else {
        token = {...token, ...(await getERC20ClassicMetadata(token.interoperableInterface)), ...(await tryRetrieveMetadata({ context }, token)) }
    }

    return token
}

export async function getERC20ClassicMetadata(contract) {
    var name = await blockchainCall(contract.methods.name)
    var symbol = await blockchainCall(contract.methods.symbol)
    var decimals = await blockchainCall(contract.methods.decimals)
    return {
        name,
        symbol,
        decimals
    }
}

export async function preparePermit({ chainId, account }, token, spender, value, deadline) {
    isNaN(deadline) && (deadline = numberToString((new Date().getTime() / 1000) + 300).split('.')[0]);

    var owner = account;

    var nonce = await token.methods.nonces(owner).call();

    var EIP712Domain = [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
    ];

    var domainSeparatorName = "Item";
    var domainSeparatorVersion = "1";

    try {
        var domainSeparatorData = await token.methods.EIP712_PERMIT_DOMAINSEPARATOR_NAME_AND_VERSION().call();
        domainSeparatorName = domainSeparatorData[0];
        domainSeparatorVersion = domainSeparatorData[1];
    } catch (e) {}

    var domain = {
        name: domainSeparatorName,
        version: domainSeparatorVersion,
        chainId,
        verifyingContract: token.options.address
    };

    var Permit = [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
    ];

    var message = {
        owner,
        spender,
        value,
        nonce,
        deadline
    };

    var data = {
        types: {
            EIP712Domain,
            Permit
        },
        domain,
        primaryType: 'Permit',
        message
    };

    return await new Promise(async function(ok, ko) {
        await token.currentProvider.sendAsync({
            method: 'eth_signTypedData_v4',
            params: [owner, JSON.stringify(data)],
            from: owner
        }, function(e, signature) {
            if (e) {
                return ko(e);
            }
            signature = signature.result.substring(2);
            return ok({
                r: '0x' + signature.slice(0, 64),
                s: '0x' + signature.slice(64, 128),
                v: web3Utils.toDecimal('0x' + signature.slice(128, 130)),
                ...message
            });
        });
    });
}