export default function Mutex(permissions) {
    const context = this

    var enqueued = 0

    var waiters = []

    context.lock = async function lock() {
        enqueued++
        if(enqueued > (permissions || 1)) {
            return await new Promise(ok => waiters.push(ok))
        }
    }

    context.release = function release() {
        if(enqueued <= 0) {
            enqueued = 0
        } else {
            enqueued--
        }
        if(waiters.length !== 0) {
            return waiters.shift()()
        }
    }

    context.queue = function queue() {
        return enqueued
    }
}