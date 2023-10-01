import getRandomArrayIndex from './getRandomArrayIndex'

/**
 * Get random array alement
 * @param array
 * @return {*}
 */
function getRandomArrayElement(array) {
  return array[getRandomArrayIndex(array)]
}

export default getRandomArrayElement
