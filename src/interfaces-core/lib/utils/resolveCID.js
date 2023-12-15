function resolveCID(link) {
    var cid = findCIDInIPFSLink(link)
    if(!cid) {
        return link
    }
    return `https://ethereansos${window.isLocal ? 'dev' : ''}.infura-ipfs.io/ipfs/${cid}`
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