function resolveCID(link) {
    var cid = findCIDInIPFSLink(link)
    if(!cid) {
        return link
    }
    var prefix = ''
    var key = 'eth3r34n5'
    prefix = `${key}${window.isLocal ? 'dev' : ''}.infura-ipfs.io`
    prefix = 'ipfs.io'
    return 'https://' + prefix + '/ipfs/' + cid
}

function findCIDInIPFSLink(ipfsLink) {
    var parts = ipfsLink.split('/')
    while(parts.length > 0) {
        var part = parts.pop().split('?')[0]
        if (part.toLowerCase().startsWith('qm') && part.length >= 46 && part.length <= 59) {
            return part
        }
        if (part.toLowerCase().startsWith('bafy') && part.length <= 59) {
            return part
        }
    }
}

resolveCID.findCIDInIPFSLink = findCIDInIPFSLink

export default resolveCID