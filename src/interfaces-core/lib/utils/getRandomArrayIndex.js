/**
 * Get random array index
 * @param array
 * @return {number}
 */
function getRandomArrayIndex(array) {
  return Math.floor(Math.random() * array.length)
}

export default getRandomArrayIndex
