/**
 * Sleep
 * @param millis
 * @return {Promise<unknown>}
 */
function sleep(millis) {
  return new Promise(function (ok) {
    setTimeout(ok, millis || 300)
  })
}

export default sleep
