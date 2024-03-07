export default async function getFileFromBlobURL(blobURL) {
  try {
    const response = await fetch(blobURL)

    const blob = await response.blob()
    return blob
  } catch (error) {
    console.error('Error while trying to get file from blob url:', error)
    throw error
  }
}
