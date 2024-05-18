var env = Object.entries(process.env).filter(it => it[0].indexOf('REACT_APP_') === 0).reduce((acc, it) => ({...acc, [it[0].split('REACT_APP_').join('')] : it[1]}), {})

var ctx = {
    chainInfo : {},
    chainProvider : {}
}

env.CHAINS.split(',').forEach(it => ctx.chainProvider[it] = env["CHAIN_PROVIDER_" + it])
env.CHAINS.split(',').forEach(it => ctx.chainInfo[it] = {
    rpcUrl : env["CHAIN_PROVIDER_" + it],
    label : env["CHAIN_NAME_" + it],
    token : env["CHAIN_TOKEN_" + it] || 'ETH'
})

window.sessionStorage.tryInternalRPC && Object.values(ctx.chainInfo).forEach(it => delete it.rpcUrl)

export default ctx