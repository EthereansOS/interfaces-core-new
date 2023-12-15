import sleep from "./sleep"

export default function Mutex(permissions, sleepMillis) {
    const context = this

    var enqueued = 0

    context.lock = async function lock() {
        while(enqueued === (permissions || 1)) {
            await sleep(sleepMillis)
        }
        enqueued++
    }

    context.release = function release() {
        if(enqueued <= 0) {
            enqueued = 0
        } else {
            enqueued--
        }
    }

    context.queue = function queue() {
        return enqueued
    }
}