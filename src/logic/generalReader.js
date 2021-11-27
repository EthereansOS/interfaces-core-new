import { web3Utils, sendAsync, abi } from '@ethereansos/interfaces-core'

export function getData({ provider }, address) {

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
        data.discriminant = abi.decode(["bool"], discriminant)
    } catch(e) {}

    return data
}

export async function getRawField({provider}, to, fieldName) {
    var response = '0x'
    try {
        response = sendAsync(provider, 'eth_call', {
            to,
            data : web3Utils(fieldName + '()')
        })
    } catch(e) {}
    return response
}