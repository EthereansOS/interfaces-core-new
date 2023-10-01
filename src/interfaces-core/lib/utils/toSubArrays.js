/**
 * Split an array in chunks
 * @param array
 * @param chunks
 * @return {array[]}
 */
function toSubArrays(array, chunks = 100) {
  const subArrays = []
  for (let i = 0, j = array.length; i < j; i += chunks) {
    subArrays.push(array.slice(i, i + chunks))
  }
  return subArrays
}

export default toSubArrays
