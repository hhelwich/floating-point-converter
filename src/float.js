// Endianess of this system (untested…)
export const littleEndian = new Uint16Array(new Uint8Array([0, 1]).buffer)[0] !== 1;

// Maps a bits string to a byte list
export const fromBitsStr = bitsStr => (bitsStr.match(/.{1,8}/g)||[]).map(byteStr => parseInt(byteStr, 2));

// Maps a hex string to byte list
export const fromHexStr = hex => (hex.match(/.{1,2}/g)||[]).map(byteStr => parseInt(byteStr, 16));

// Maps an unsigned integer to a byte list
export const fromInt = int => {
  if (int > Number.MAX_SAFE_INTEGER) {
    throw Error('Overflow');
  }
  const bytes = [];
  while (int > 0) {
    const byte = int & 0xff;
    bytes.unshift(byte);
    int = (int - byte) / 256;
  }
  return bytes;
};

// Maps a byte list to a bits string
export const toBitsStr = bytes => bytes.map(toByteStr).join('');

const toByteStr = byte => {
  const s = `0000000${byte.toString(2)}`;
  return s.substr(s.length - 8);
};

// Maps
export const toHexStr = bytes => bytes.map(b => ('0' + b.toString(16)).substr(-2)).join('');

// Convert byte list to unsigned integer
export const toInt = bytes => bytes.reduce((n, byte) => {
  if (n >= 2 ** 45) {
    throw Error('Overflow');
  }
  return n * 256 + byte;
}, 0);

// Convert a number to a byte array (4 or 8 bytes) holding the floating point representation (32 or 64 bit)
export const fromNumber = f64 => float => {
  const bytes = Array.from(new Uint8Array(new (f64 ? Float64Array : Float32Array)([float]).buffer));
  return littleEndian ? bytes.reverse() : bytes;
};

// Convert a byte array (4 or 8 bytes) holding the floating point representation (32 or 64 bit) to a number
export const toNumber = f64 => bytes => {
  if (littleEndian) {
    bytes = bytes.slice().reverse();
  }
  return new (f64 ? Float64Array : Float32Array)(new Uint8Array(bytes).buffer)[0];
};

export const toFloatStr = f64 => bytes => {
  const float = toNumber(f64)(bytes);
  if (isNaN(float)) {
    const mantisse = bytes.slice(1);
    mantisse[0] &= f64 ? 0xf : 0x7f;
    return `${positive(bytes) ? '' : '-'}NaN(${toInt(mantisse)})`;
  }
  if (float === 0 && 1 / float === -Infinity) {
    return '-0';
  }
  return String(float);
};

export const fromFloatStr = f64 => floatStr => {
  const float = Number(floatStr);
  if (isNaN(float)) { // Enable NaN sign and payload
    const match = floatStr.match(/^(-?)NaN(\((\d+)\))?$/);
    if (match !== null) {
      const pos = !match[1];
      const payloadStr = match[3];
      if (payloadStr !== undefined) {
        // NaN with payload
        const payload = parseInt(payloadStr, 10);
        if (payload <= (f64 ? 0xfffffffffffff : 0x7fffff) && payload > 0) {
          const bytes = fromInt(payload);
          while (bytes.length < (f64 ? 7 : 3)) {
            bytes.unshift(0);
          }
          bytes[0] |= f64 ? 0xf0 : 0x80;
          bytes.unshift(pos ? 0x7f : 0xff);
          return bytes;
        }
      }
      // NaN with default payload
      const bytes = fromNumber(f64)(NaN);
      if (!pos) {
        negate(bytes);
      }
      return bytes;
    }
  }
  return fromNumber(f64)(float);
};

const incBytes = (bytes, i = bytes.length - 1) => {
  if (i >= 0 && ++bytes[i] > 255) {
    bytes[i] = 0;
    incBytes(bytes, i - 1);
  }
};

const decBytes = (bytes, i = bytes.length - 1) => {
  if (i >= 0 && --bytes[i] < 0) {
    bytes[i] = 255;
    decBytes(bytes, i - 1);
  }
};

const positive = bytes => !(bytes[0] >> 7);

const negate = bytes => {
  if (bytes.length > 0) {
    bytes[0] ^= 0x80;
  }
  return bytes;
};

const next = (inc, dec) => bytes => {
  const b = bytes.slice();
  const pos = positive(b);
  if (pos) {
    inc(b);
  } else {
    dec(b);
  }
  if (pos !== positive(b)) { // Overflow or Underflow?
    return negate(bytes.slice());
  }
  return b;
};

export const nextFloat = next(incBytes, decBytes);
export const prevFloat = next(decBytes, incBytes);
