const PNG_TEXT_CHUNKS = new Set(['eXIf', 'tEXt', 'iTXt', 'zTXt'])

export function stripJpegMetadata(bytes: Uint8Array): Uint8Array {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return bytes
  const out: number[] = [0xff, 0xd8]
  let index = 2
  while (index < bytes.length - 1) {
    if (bytes[index] !== 0xff) {
      out.push(...bytes.slice(index))
      break
    }
    const marker = bytes[index + 1]
    if (marker === 0xd9) {
      out.push(0xff, 0xd9)
      break
    }
    if (marker === 0xda) {
      out.push(...bytes.slice(index))
      break
    }
    if (marker >= 0xd0 && marker <= 0xd7) {
      out.push(0xff, marker)
      index += 2
      continue
    }
    if (index + 4 > bytes.length) break
    const length = (bytes[index + 2] << 8) | bytes[index + 3]
    if (length < 2 || index + 2 + length > bytes.length) break
    const removable = (marker >= 0xe0 && marker <= 0xef) || marker === 0xfe
    if (!removable) out.push(...bytes.slice(index, index + 2 + length))
    index += 2 + length
  }
  return Uint8Array.from(out)
}

function readUint32(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0
}

export function stripPngMetadata(bytes: Uint8Array): Uint8Array {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10]
  if (bytes.length < 8 || signature.some((value, index) => bytes[index] !== value)) return bytes
  const out: number[] = [...signature]
  let index = 8
  while (index + 12 <= bytes.length) {
    const length = readUint32(bytes, index)
    const type = String.fromCharCode(bytes[index + 4], bytes[index + 5], bytes[index + 6], bytes[index + 7])
    const chunkEnd = index + 12 + length
    if (chunkEnd > bytes.length) break
    if (!PNG_TEXT_CHUNKS.has(type)) out.push(...bytes.slice(index, chunkEnd))
    index = chunkEnd
    if (type === 'IEND') break
  }
  return Uint8Array.from(out)
}

export function stripImageMetadata(bytes: Uint8Array): Uint8Array {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return stripJpegMetadata(bytes)
  if (bytes[0] === 137 && bytes[1] === 80) return stripPngMetadata(bytes)
  return bytes
}
