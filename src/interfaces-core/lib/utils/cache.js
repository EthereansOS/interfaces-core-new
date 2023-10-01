;(typeof window).toLowerCase() === 'undefined' && (global.window = global)

const dbEngine =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB
window.IDBTransaction = window.IDBTransaction ||
  window.webkitIDBTransaction ||
  window.msIDBTransaction || { READ_WRITE: 'readwrite' }
window.IDBKeyRange =
  window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

const dbName = 'ethereansos'
const dbTable = 'ethereansos'
const dbVersion = 1

var internalDB

function openDB(name, version) {
  return new Promise((ok, ko) => {
    if (internalDB) {
      return ok(internalDB)
    }
    const request = dbEngine.open(name, version)
    request.onerror = (event) => ko(event.target.errorCode)
    request.onsuccess = (event) => ok((internalDB = event.target.result))
    request.onupgradeneeded = (event) => {
      event.target.result
        .createObjectStore(dbTable, {
          autoIncrement: true,
        })
        .createIndex('key', 'key', {
          unique: true,
        })
    }
  })
}

function closeDB(db) {
  if (!db) {
    return
  }
  return new Promise((ok, ko) => {
    if (db === internalDB) {
      internalDB = undefined
    }
    const request = db.close()
    if (!request) {
      return ok()
    }
    request.onerror = (event) =>
      ko(event.target.error || event.target.errorCode)
    request.onsuccess = (event) => ok(event.target.result)
  })
}

function setItem(key, value) {
  if (window.customProvider) {
    return
  }
  return new Promise(async (ok, ko) => {
    const db = await openDB(dbName, dbVersion)

    const txn = db.transaction(dbTable, 'readwrite')

    const store = txn.objectStore(dbTable)

    const query = store.put(
      {
        key,
        value:
          value && (typeof value).toLowerCase() === 'string'
            ? value
            : JSON.stringify(value || null),
      },
      key
    )

    query.onsuccess = (event) => ok(event.target.result)

    query.onerror = (event) => ko(event.target.error || event.target.errorCode)
  })
}

function getItem(key) {
  return new Promise(async (ok, ko) => {
    if (window.customProvider) {
      return ok('null')
    }
    const db = await openDB(dbName, dbVersion)

    const txn = db.transaction(dbTable, 'readonly')

    const store = txn.objectStore(dbTable)

    const index = store.index('key')

    const query = index.get(key)

    query.onsuccess = (event) => ok(event.target?.result?.value || 'null')

    query.onerror = (event) => ko(event.target.error || event.target.errorCode)
  })
}

async function clear() {
  await closeDB(internalDB)
  internalDB = undefined
  return await new Promise((ok, ko) => {
    const request = dbEngine.deleteDatabase(dbName)
    request.onsuccess = (event) => ok(event?.target?.result)
    request.onerror = (event) =>
      ko(event.target.error || event.target.errorCode)
  })
}

export default window.ethereansOSCache = {
  getItem,
  setItem,
  clear,
}
