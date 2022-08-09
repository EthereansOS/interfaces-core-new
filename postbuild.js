var fs = require('fs')
var path = require('path')

var build = path.resolve(__dirname, 'build')

async function run() {
    var data = path.resolve(build, 'data')

    var contextLocal = path.resolve(data, 'context.local.json')

    try {
        fs.unlinkSync(contextLocal)
        console.log('context.local.json purged')
    } catch(e){}

    var version = path.resolve(data, 'version.txt')
    try {
        fs.unlinkSync(version)
    } catch(e) {}

    try {
        fs.writeFileSync(version, new Date().getTime().toString(), 'UTF-8')
        console.log('new version installed')
    } catch(e) {}
}

console.log('Running postbuild')
run().then(() => void(console.log('postbuild end'), process.exit())).catch(console.error)