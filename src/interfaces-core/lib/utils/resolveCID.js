function resolveCID(link, raw) {
    var cid = findCIDInIPFSLink(link)
    if(!cid) {
        return link
    }
    var prefix = ''
    var key = 'eth3r34n5'
    prefix = `${key}${window.isLocal ? 'dev' : ''}.infura-ipfs.io`
    //prefix = 'ipfs.io'
    //prefix = 'ethereansos.quicknode-ipfs.com'
    prefix = window.ipfsPrefix || prefix
    var url = 'https://' + prefix + '/ipfs/' + cid
    if(raw) {
        return url
    }
    url = window.context.urlCacheResolver + encodeURIComponent(url.substring(6))
    url = raw ? url.split('?').join('?raw=true&') : url
    return url
}

function findCIDInIPFSLink(ipfsLink) {
    var parts = ipfsLink.split('/')
    while(parts.length > 0) {
        var part = parts[0].split('?')[0]
        if (part.toLowerCase().startsWith('qm') && part.length >= 46 && part.length <= 59) {
            return parts.join('/')
        }
        if (part.toLowerCase().startsWith('bafy') && part.length <= 59) {
            return parts.join('/')
        }
        parts.shift()
    }
}

resolveCID.findCIDInIPFSLink = findCIDInIPFSLink

export default resolveCID