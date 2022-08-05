import { web3Utils, sendAsync, abi, VOID_ETHEREUM_ADDRESS } from '@ethereansos/interfaces-core'

export async function getData({ provider }, address) {

    var label = await getRawField({provider}, address, 'LABEL')
    var value = await getRawField({provider}, address, 'value')
    var discriminant = await getRawField({provider}, address, 'discriminant')
    var uri = await getRawField({provider}, address, 'uri')
    var data = {
        address,
        label : label === '0x' ? '' : abi.decode(["string"], label)[0],
        valueUint256 : value === '0x' ? '0' : abi.decode(["uint256"], value)[0].toString(),
        valueAddress : value === '0x' ? VOID_ETHEREUM_ADDRESS : abi.decode(["address"], value)[0],
        uri : uri === '0x' ? '' : abi.decode(["string"], uri)[0]
    }

    try {
        data.discriminant = abi.decode(["bool"], discriminant)[0]
    } catch(e) {}

    return data
}

export async function getRawField({provider}, to, fieldName) {
    var response = '0x'
    var data = web3Utils.sha3(fieldName + '()').substring(0, 10)
    if(fieldName.indexOf('(') !== -1 && fieldName.indexOf('()') === -1) {
        var fields = fieldName.split('(')[1]
        fields = fields.split(')')[0]
        fields = fields.split(',')
        fields = abi.encode(fields, [...arguments].slice(3, arguments.length))
        data = (web3Utils.sha3(fieldName).substring(0, 10)) + fields.substring(2)
    }
    while(true) {
        try {
            response = await sendAsync(provider, 'eth_call', {
                to,
                data
            }, 'latest')
            break
        } catch(e) {
            var message = (e.stack || e.message || e).toLowerCase()
            if(message.indexOf("response has no error") === -1) {
                break
            }
        }
    }

    return response
}