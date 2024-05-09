var fs = require('fs');
var path = require('path');
var os = require('os');
var spawn = require('child_process').spawn;

function postBuild() {

    console.log("=== POSTBUILD ===");

    var build = path.resolve(__dirname, 'build');

    var data = path.resolve(build, 'data');

    var contextLocal = path.resolve(data, 'context.local.json');

    try {
        fs.unlinkSync(contextLocal);
        console.log('context.local.json purged');
    } catch(e){}

    var version = path.resolve(data, 'version.txt');
    try {
        fs.unlinkSync(version);
    } catch(e) {}

    try {
        fs.writeFileSync(version, new Date().getTime().toString(), 'UTF-8');
        console.log('new version installed');
    } catch(e) {}
}

async function run() {
    try {
        var useWalletDistPath = path.resolve(__dirname, 'node_modules/use-wallet/dist/esm/index.js');
        fs.unlinkSync(useWalletDistPath);
        fs.writeFileSync(useWalletDistPath, fs.readFileSync(path.resolve(__dirname, 'use-wallet-optimism-hack.js'), 'utf-8'));
    } catch(e) {}

    try {
        var unstorageDistPath = path.resolve(__dirname, 'node_modules/unstorage/dist/index.mjs');
        var unstorageDist = fs.readFileSync(unstorageDistPath, 'utf-8');
        unstorageDist = unstorageDist.split("import destr from 'destr'").join("var destr = JSON.parse");
        fs.unlinkSync(unstorageDistPath);
        fs.writeFileSync(unstorageDistPath, unstorageDist);
    } catch(e) {}

    var isWindows = os.type().toLowerCase().indexOf("windows") !== -1;
    var mode = process.argv[process.argv.length - 1];

    var command = `${isWindows ? 'set' : 'export'} NODE_OPTIONS=--openssl-legacy-provider`;
    if(mode === 'build') {
        command += ` && react-scripts build`;
    } else {
        command += ` && ${isWindows ? 'env ' : ''}HOST=127.0.0.1 && react-scripts start`;
    }
    console.log('Executing:', command, "on", os.type());
    var child = spawn(isWindows ? 'cmd' : 'bash', isWindows ? ['/k', command + " && exit"] : ['eval', command]);
    child.stdout.on("data", data => console.log(data.toString()));
    child.stderr.on("data", data => console.error(data.toString()));
    child.on('close', () => {
        if(mode === 'build') {
            postBuild();
        }
        process.exit();
    });
}
run().catch(console.error);