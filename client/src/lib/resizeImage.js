// Shrinks an image in the browser before upload: caps the longest side and
// re-encodes as WebP. A 4–8 MB phone photo typically comes out at a few
// hundred kB, so pages load faster and big originals fit under the 5 MB
// upload limit. GIFs pass through untouched (re-encoding would drop the
// animation), as does anything that wouldn't actually get smaller.
export async function resizeImage(file, maxSide = 1600, quality = 0.82) {
  if (file.type === 'image/gif' || typeof createImageBitmap !== 'function') return file

  let bitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    return file
  }

  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)
  bitmap.close?.()

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality))
  // Browsers without WebP encoding hand back PNG — only use the result if it
  // really is WebP and smaller than what we started with.
  if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file

  const name = file.name.replace(/\.[^.]+$/, '') + '.webp'
  return new File([blob], name, { type: 'image/webp' })
}
