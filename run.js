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

    processLocalEnv();
}

function processLocalEnv(disable) {
    try {
        var original = path.resolve(__dirname, '.env.local');
        var backup = path.resolve(__dirname, 'envLocalBackup.txt');
        fs.renameSync(disable ? original : backup, disable ? backup : original);
    } catch(e){}
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
        unstorageDist = unstorageDist.split("import destr from 'destr'").join("function destr(value) {try{return JSON.parse(value);}catch(e){return value;}}");
        fs.unlinkSync(unstorageDistPath);
        fs.writeFileSync(unstorageDistPath, unstorageDist);
    } catch(e) {}

    try {
        var safeEventEmitterPath = path.resolve(__dirname, 'node_modules/@coinbase/wallet-sdk/node_modules/@metamask/safe-event-emitter/dist/esm/index.mjs');
        var safeEventEmitter = fs.readFileSync(safeEventEmitterPath, 'utf-8');
        safeEventEmitter = safeEventEmitter.split("import { EventEmitter } from 'events';").join("import evt from 'events';var EventEmitter = evt.EventEmitter;");
        fs.unlinkSync(safeEventEmitterPath);
        fs.writeFileSync(safeEventEmitterPath, safeEventEmitter);
    } catch(e) {}

    var isWindows = os.type().toLowerCase().indexOf("windows") !== -1;
    var mode = process.argv[process.argv.length - 1];
    mode === 'build' && processLocalEnv(true);
    var env = {
        ...process.env,
        NODE_OPTIONS : '--openssl-legacy-provider'
    };
    mode !== 'build' && (env.HOST = '127.0.0.1');
    var command = isWindows ? 'cmd' : 'react-scripts';
    var args = [mode === 'build' ? 'build' : 'start'];
    isWindows && (args = ['/k', `react-scripts ${args[0]} && exit`]);
    var child = spawn(command, args, { env });
    child.stdout.on("data", data => console.log(data.toString()));
    child.stderr.on("data", data => console.error(data.toString()));
    child.on('close', () => void(mode === 'build' && postBuild(), process.exit()));
}
run().catch(console.error);