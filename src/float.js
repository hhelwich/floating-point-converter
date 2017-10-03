
// Show some info for browsers not supporting typed arrays
if (typeof Uint16Array === 'undefined') {
  alert('Your browser is too old. Compatible Browsers:\nChrome 7, Firefox 4, IE 10, Edge 12, Safari 5, Opera 11')
}

// Endianess of this system (untested…)
export const littleEndian = new Uint16Array(new Uint8Array([0, 1]).buffer)[0] !== 1

// Maps a bits string to a byte list
export const fromBitsStr = bitsStr => (bitsStr.match(/.{1,8}/g) || []).map(byteStr => parseInt(byteStr, 2))

// Maps a hex string to byte list
export const fromHexStr = hex => (hex.match(/.{1,2}/g) || []).map(byteStr => parseInt(byteStr, 16))

// Maps an unsigned integer to a byte list
export const fromInt = int => {
  if (int > Number.MAX_SAFE_INTEGER) {
    throw Error('Overflow')
  }
  const bytes = []
  while (int > 0) {
    const byte = int & 0xff
    bytes.unshift(byte)
    int = (int - byte) / 256
  }
  return bytes
}

// Maps a byte list to a bits string
export const toBitsStr = bytes => bytes.map(toByteStr).join('')

const toByteStr = byte => {
  const s = `0000000${byte.toString(2)}`
  return s.substr(s.length - 8)
}

// Maps
export const toHexStr = bytes => bytes.map(b => ('0' + b.toString(16)).substr(-2)).join('')

// Convert byte list to unsigned integer
export const toInt = bytes => bytes.reduce((n, byte) => {
  if (n >= 2 ** 45) {
    throw Error('Overflow')
  }
  return n * 256 + byte
}, 0)

// Convert a number to a byte array (4 or 8 bytes) holding the floating point representation (32 or 64 bit)
export const fromNumber = f64 => float => {
  const bytes = Array.prototype.slice.call(new Uint8Array(new (f64 ? Float64Array : Float32Array)([float]).buffer))
  return littleEndian ? bytes.reverse() : bytes
}

// Convert a byte array (4 or 8 bytes) holding the floating point representation (32 or 64 bit) to a number
export const toNumber = f64 => bytes => {
  if (littleEndian) {
    bytes = bytes.slice().reverse()
  }
  return new (f64 ? Float64Array : Float32Array)(new Uint8Array(bytes).buffer)[0]
}

export const toFloatStr = f64 => bytes => {
  const float = toNumber(f64)(bytes)
  if (isNaN(float)) {
    const mantisse = bytes.slice(1)
    mantisse[0] &= f64 ? 0xf : 0x7f
    return `${positive(bytes) ? '' : '-'}NaN(${toInt(mantisse)})`
  }
  if (float === 0 && 1 / float === -Infinity) {
    return '-0'
  }
  return String(float)
}

export const fromFloatStr = f64 => floatStr => {
  const float = Number(floatStr)
  if (isNaN(float)) { // Enable NaN sign and payload
    const match = floatStr.match(/^(-?)NaN(\((\d+)\))?$/)
    if (match !== null) {
      const pos = !match[1]
      const payloadStr = match[3]
      if (payloadStr !== undefined) {
        // NaN with payload
        const payload = parseInt(payloadStr, 10)
        if (payload <= (f64 ? 0xfffffffffffff : 0x7fffff) && payload > 0) {
          const bytes = fromInt(payload)
          while (bytes.length < (f64 ? 7 : 3)) {
            bytes.unshift(0)
          }
          bytes[0] |= f64 ? 0xf0 : 0x80
          bytes.unshift(pos ? 0x7f : 0xff)
          return bytes
        }
      }
      // NaN with default payload
      const bytes = fromNumber(f64)(NaN)
      if (!pos) {
        negate(bytes)
      }
      return bytes
    } else {
      return
    }
  }
  return fromNumber(f64)(float)
}

const incBytes = (bytes, i = bytes.length - 1) => {
  if (i >= 0 && ++bytes[i] > 255) {
    bytes[i] = 0
    incBytes(bytes, i - 1)
  }
}

const decBytes = (bytes, i = bytes.length - 1) => {
  if (i >= 0 && --bytes[i] < 0) {
    bytes[i] = 255
    decBytes(bytes, i - 1)
  }
}

const positive = bytes => !(bytes[0] >> 7)

const negate = bytes => {
  if (bytes.length > 0) {
    bytes[0] ^= 0x80
  }
  return bytes
}

const next = (inc, dec) => bytes => {
  const b = bytes.slice()
  const pos = positive(b)
  if (pos) {
    inc(b)
  } else {
    dec(b)
  }
  if (pos !== positive(b)) { // Overflow or Underflow?
    return negate(bytes.slice())
  }
  return b
}

export const nextFloat = next(incBytes, decBytes)
export const prevFloat = next(decBytes, incBytes)

const mathOrigin = Math
const mathProps = Object.getOwnPropertyNames(Math)
const mathClone = () => mathProps.reduce((clone, key) => { clone[key] = mathOrigin[key]; return clone }, {})

// Shadow window properties with undefined variables and create Math shortcut variables
const evalVars = `${Object.getOwnPropertyNames(window).filter(key => key !== 'Math').join(',')},` +
  `${mathProps.map(key => `${key}=Math.${key}`).join(',')}`

// Given string must be parseable
export const assureFloatStr = f64 => floatStr => toFloatStr(f64)(fromFloatStr(f64)(floatStr))

export const numberStr = f64 => nbr => toFloatStr(f64)(fromNumber(f64)(nbr))

const nan = [false, true].map(f64 => numberStr(f64)(NaN))

export const isNaNStr = f64 => floatStr => floatStr === nan[+f64]

export const evalJsStr = (f64, jsStr) => {
  try {
    // Evaluate input
    Math = mathClone() // eslint-disable-line no-global-assign
    const nbr = Number(new Function( // eslint-disable-line no-new-func
      `var ${evalVars};return (${jsStr});`).call(Object.create(null)))
    Math = mathOrigin // eslint-disable-line no-global-assign
    return numberStr(f64)(nbr)
  } catch (_) {
    Math = mathOrigin // eslint-disable-line no-global-assign
    return nan[+f64]
  }
}

// Takes a float string or a JavaScript expression that evaluates to number and return a float string.
export const evalFloatStr = f64 => floatStrOrJs => {
  const bytes = fromFloatStr(f64)(floatStrOrJs)
  if (!bytes) { // Cannot parse string as number
    return evalJsStr(f64, floatStrOrJs)
  }
  return toFloatStr(f64)(bytes)
}

// Returns the normalized position of a float in the list of all floats
export const toPosition = f64 => bytes => {
  const p = positive(bytes)
  if (!p) {
    bytes = negate(bytes.slice())
  }
  return 0.5 + (p ? 0.5 : -0.5) * (f64 ? toInt(bytes.slice(0, 6)) / 0x7ff000000000 : toInt(bytes) / 0x7f800000)
}
