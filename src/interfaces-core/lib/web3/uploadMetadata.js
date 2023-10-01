import uploadToIPFS from './uploadToIPFS'

async function normalizeMetadata(metadata) {
  if (metadata.image && metadata.image instanceof Array) {
    metadata.image = metadata.image[0]
    if (
      metadata.image &&
      metadata.image.toLowerCase().indexOf('ipfs://ipfs/') !== -1
    ) {
      metadata.image =
        'https://ipfs.io/ipfs/' + metadata.image.split('ipfs://ipfs/')[1]
    }
  }
  if (metadata.image_data && metadata.image_data instanceof Array) {
    metadata.image_data = metadata.image_data[0]
    if (
      metadata.image_data &&
      metadata.image_data.toLowerCase().indexOf('ipfs://ipfs/') !== -1
    ) {
      metadata.image_data =
        'https://ipfs.io/ipfs/' + metadata.image_data.split('ipfs://ipfs/')[1]
    }
  }
  if (metadata.animation_url && metadata.animation_url instanceof Array) {
    metadata.animation_url = metadata.animation_url[0]
    if (
      metadata.animation_url &&
      metadata.animation_url.toLowerCase().indexOf('ipfs://ipfs/') !== -1
    ) {
      metadata.animation_url =
        'https://ipfs.io/ipfs/' +
        metadata.animation_url.split('ipfs://ipfs/')[1]
    }
  }
  if (metadata.file && metadata.file instanceof Array) {
    metadata.file = metadata.file[0]
    if (
      metadata.file &&
      metadata.file.toLowerCase().indexOf('ipfs://ipfs/') !== -1
    ) {
      metadata.file =
        'https://ipfs.io/ipfs/' + metadata.file.split('ipfs://ipfs/')[1]
    }
  }

  if (metadata.pro_url && metadata.pro_url instanceof Array) {
    metadata.pro_url = metadata.pro_url[0]
    if (
      metadata.pro_url &&
      metadata.pro_url.toLowerCase().indexOf('ipfs://ipfs/') !== -1
    ) {
      metadata.pro_url =
        'https://ipfs.io/ipfs/' + metadata.pro_url.split('ipfs://ipfs/')[1]
    }
  }
  if (metadata.specials_url && metadata.specials_url instanceof Array) {
    metadata.specials_url = metadata.specials_url[0]
    if (
      metadata.specials_url &&
      metadata.specials_url.toLowerCase().indexOf('ipfs://ipfs/') !== -1
    ) {
      metadata.specials_url =
        'https://ipfs.io/ipfs/' + metadata.specials_url.split('ipfs://ipfs/')[1]
    }
  }
  if (metadata.soundtrack_file && metadata.soundtrack_file instanceof Array) {
    metadata.soundtrack_file = metadata.soundtrack_file[0]
    if (
      metadata.soundtrack_file &&
      metadata.soundtrack_file.toLowerCase().indexOf('ipfs://ipfs/') !== -1
    ) {
      metadata.soundtrack_file =
        'https://ipfs.io/ipfs/' +
        metadata.soundtrack_file.split('ipfs://ipfs/')[1]
    }
  }
  if (metadata.gameitem_url && metadata.gameitem_url instanceof Array) {
    metadata.gameitem_url = metadata.gameitem_url[0]
    if (
      metadata.gameitem_url &&
      metadata.gameitem_url.toLowerCase().indexOf('ipfs://ipfs/') !== -1
    ) {
      metadata.gameitem_url =
        'https://ipfs.io/ipfs/' + metadata.gameitem_url.split('ipfs://ipfs/')[1]
    }
  }
  if (metadata.voxel_url && metadata.voxel_url instanceof Array) {
    metadata.voxel_url = metadata.voxel_url[0]
    if (
      metadata.voxel_url &&
      metadata.voxel_url.toLowerCase().indexOf('ipfs://ipfs/') !== -1
    ) {
      metadata.voxel_url =
        'https://ipfs.io/ipfs/' + metadata.voxel_url.split('ipfs://ipfs/')[1]
    }
  }
  if (metadata.folder && metadata.folder instanceof Array) {
    metadata.folder = metadata.folder[metadata.folder.length - 1]
    if (
      metadata.folder &&
      metadata.folder.toLowerCase().indexOf('ipfs://ipfs/') !== -1
    ) {
      metadata.folder =
        'https://ipfs.io/ipfs/' + metadata.folder.split('ipfs://ipfs/')[1]
    }
  }
  if (
    metadata.soundtrack_folder &&
    metadata.soundtrack_folder instanceof Array
  ) {
    metadata.soundtrack_folder =
      metadata.soundtrack_folder[metadata.soundtrack_folder.length - 1]
    if (
      metadata.soundtrack_folder &&
      metadata.soundtrack_folder.toLowerCase().indexOf('ipfs://ipfs/') !== -1
    ) {
      metadata.soundtrack_folder =
        'https://ipfs.io/ipfs/' +
        metadata.soundtrack_folder.split('ipfs://ipfs/')[1]
    }
  }

  if (metadata.licence_url && metadata.licence_url instanceof Array) {
    metadata.licence_url = metadata.licence_url[0]
    if (
      metadata.licence_url &&
      metadata.licence_url.toLowerCase().indexOf('ipfs://ipfs/') !== -1
    ) {
      metadata.licence_url =
        'https://ipfs.io/ipfs/' + metadata.licence_url.split('ipfs://ipfs/')[1]
    }
  }
  delete metadata.fileType
  var keys = Object.keys(metadata)
  for (var key of keys) {
    if (
      metadata[key] === '' ||
      metadata[key] === undefined ||
      metadata[key] === null
    ) {
      delete metadata[key]
    }
  }
}

async function prepareMetadata({ context, ipfsHttpClient }, data) {
  if (data instanceof FileList) {
    if (data.length === 0) {
      return ''
    }
    return await uploadToIPFS({ context, ipfsHttpClient }, data)
  }
  if (data instanceof Array) {
    var array = []
    for (var item of data) {
      array.push(await prepareMetadata({ context, ipfsHttpClient }, item))
    }
    return array
  }
  if ((typeof data).toLowerCase() === 'object') {
    var newData = {}
    var entries = Object.entries(data)
    for (var entry of entries) {
      newData[entry[0]] = await prepareMetadata(
        { context, ipfsHttpClient },
        entry[1]
      )
    }
    return newData
  }
  return data
}

export default async function uploadMetadata(
  { context, ipfsHttpClient },
  metadata
) {
  var cleanMetadata = await prepareMetadata(
    { context, ipfsHttpClient },
    metadata
  )

  await normalizeMetadata(cleanMetadata)

  return await uploadToIPFS({ context, ipfsHttpClient }, cleanMetadata)
}
