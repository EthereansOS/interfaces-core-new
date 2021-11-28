import { web3Utils, sendAsync, abi } from '@ethereansos/interfaces-core'

export async function getData({ provider }, address) {

    var label = await getRawField({provider}, address, 'LABEL')
    var value = await getRawField({provider}, address, 'value')
    var discriminant = await getRawField({provider}, address, 'discriminant')

    var data = {
        address,
        label : abi.decode(["string"], label)[0],
        valueUint256 : abi.decode(["uint256"], value)[0].toString(),
        valueAddress : abi.decode(["address"], value)[0],
    }

    try {
        data.discriminant = abi.decode(["bool"], discriminant)[0]
    } catch(e) {}

    return data
}

export async function getRawField({provider}, to, fieldName) {
    var response = '0x'
    try {
        response = await sendAsync(provider, 'eth_call', {
            to,
            data : web3Utils.sha3(fieldName + '()').substring(0, 10)
        })
    } catch(e) {
    }
    return response
}