window.intervalId = window.intervalId
window.callbacks = window.callbacks || {}

export function enqueue(id, callback) {
    window.callbacks[id] = callback
    ensureStart()
}

export function dequeue(id) {
    delete window.callbacks[id]
    ensureStart()
}

function ensureStart() {
    try {
        clearInterval(window.intervalId)
        delete window.intervalId
    } catch(e) {
    }
    var callbacks = Object.values(window.callbacks)
    callbacks.length > 0 && (window.intervalId = setInterval(() => {
        callbacks.forEach(it => setTimeout(it))
    }, 5000))
}