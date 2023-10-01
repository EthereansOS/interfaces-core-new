import { useEffect, useState } from 'react'
import web3Utils from 'web3-utils'

import toSubArrays from '../lib/utils/toSubArrays'
import loadBlockSearchTranches from '../lib/web3/loadBlockSearchTranches'
import getLogs from '../lib/web3/getLogs'
import loadTokenInfos from '../lib/web3/loadTokenInfos'
import { VOID_BYTES32 } from '../lib/constants'
import { useWeb3 } from '../context/Web3Context'
import useEthosContext from '../hooks/useEthosContext'

import { useIsUnmounted } from './useIsUnmounted'

export function useLoadUniswapPairs(address, secondToken) {
  const { chainId, web3, web3ForLogs } = useWeb3()
  const context = useEthosContext()

  const [uniswapPairs, setUniswapPairs] = useState([])
  const unmounted = useIsUnmounted()

  useEffect(() => {
    const load = async () => {
      let pairCreatedTopic = web3Utils.sha3(
        'PairCreated(address,address,address,uint256)'
      )

      let myToken = !address
        ? []
        : address instanceof Array
        ? address.map((it) => web3.eth.abi.encodeParameter('address', it))
        : [web3.eth.abi.encodeParameter('address', address)]

      let blockSearchTranches = await loadBlockSearchTranches({
        web3,
        context,
        chainId,
      })

      let subArrays
      if (
        myToken.length === 0 ||
        (myToken.length === 1 && myToken[0] === VOID_BYTES32)
      ) {
        subArrays = toSubArrays(
          await (
            await fetch(context.uniswapTokensURL)
          )
            .json()
            ?.tokens.filter((it) => it.chainId === chainId)
            .map((it) => web3.eth.abi.encodeParameter('address', it.address)),
          500
        )

        myToken = subArrays.splice(0, 1)[0]
      } else {
        setUniswapPairs((pairs) =>
          pairs.filter(
            (it) =>
              myToken.indexOf(
                web3.eth.abi.encodeParameter('address', it.token0.address)
              ) !== -1 ||
              myToken.indexOf(
                web3.eth.abi.encodeParameter('address', it.token1.address)
              ) !== -1
          )
        )
      }
      !subArrays &&
        secondToken &&
        myToken.push(web3.eth.abi.encodeParameter('address', secondToken))

      while (myToken) {
        for (const tranche of blockSearchTranches) {
          const logArgs = {
            address: context.uniSwapV2FactoryAddress,
            fromBlock: tranche[0],
            toBlock: tranche[1],
            topics: [pairCreatedTopic, myToken],
          }
          if (subArrays || secondToken) {
            logArgs.topics.push(myToken)
          }
          const logs = await getLogs(
            { web3, web3ForLogs, context, chainId },
            logArgs
          )

          if (!subArrays && !secondToken) {
            logArgs.topics = [logArgs.topics[0], [], myToken]
            logs.push(
              ...(await getLogs(
                { web3, web3ForLogs, context, chainId },
                logArgs
              ))
            )
          }

          for (const log of logs) {
            if (unmounted.current) {
              return
            }
            const pairTokenAddress = web3Utils.toChecksumAddress(
              web3.eth.abi.decodeParameters(['address', 'uint256'], log.data)[0]
            )

            const pairToken = {
              address: pairTokenAddress,
              decimals: '18',
              name: 'Uniswap V2 Pair',
            }
            const token0 = web3Utils.toChecksumAddress(
              web3.eth.abi.decodeParameter('address', log.topics[1])
            )
            const token1 = web3Utils.toChecksumAddress(
              web3.eth.abi.decodeParameter('address', log.topics[2])
            )
            try {
              pairToken.token0 = await loadTokenInfos(
                { web3, context },
                token0,
                undefined,
                true
              )

              pairToken.token1 = await loadTokenInfos(
                { web3, context },
                token1,
                undefined,
                true
              )

              pairToken.key = `${token0}_${token1}-${token1}_${token0}`
              pairToken.fromBlock = log.blockNumber + ''
              pairToken.isUniswapPair = true
              pairToken.symbol =
                pairToken.token0.symbol + '/' + pairToken.token1.symbol

              setUniswapPairs((pairs) => [...pairs, pairToken])
            } catch (e) {
              console.log('loadUniswapPairs inner error', e)
            }
          }
        }
        myToken =
          subArrays && subArrays.length > 0
            ? subArrays.splice(0, 1)[0]
            : undefined
      }
    }

    if (address) {
      load()
    }
  }, [address, context, chainId, secondToken, unmounted, web3, web3ForLogs])

  return uniswapPairs
}
