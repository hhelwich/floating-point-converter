// Endianess of this system (untested…)
export const littleEndian = new Uint16Array(new Uint8Array([0, 1]).buffer)[0] !== 1;

// Convert a number to a byte array (4 or 8 bytes) holding the floating point representation (32 or 64 bit)
export const toBytes = f64 => float => {
  const bytes = Array.from(new Uint8Array(new (f64 ? Float64Array : Float32Array)([float]).buffer));
  return littleEndian ? bytes.reverse() : bytes;
};

// Convert a byte array (4 or 8 bytes) holding the floating point representation (32 or 64 bit) to a number
export const fromBytes = f64 => bytes => {
  if (littleEndian) {
    bytes = bytes.slice().reverse();
  }
  return new (f64 ? Float64Array : Float32Array)(new Uint8Array(bytes).buffer)[0];
};

// Get a byte list from a bit string
export const fromBitsStr = bitsStr => (bitsStr.match(/.{1,8}/g)||[]).map(byteStr => parseInt(byteStr, 2));

// Get a bit string from a byte list
export const toBitsStr = bytes => bytes.map(toByteStr).join('');

const toByteStr = byte => {
  const s = `0000000${byte.toString(2)}`;
  return s.substr(s.length - 8);
};

export const roundFloat32 = n => fromBytes(false)(toBytes(false)(n));

export const toFloatStr = float => {
  if (float === 0 && 1 / float === -Infinity) {
    return '-0';
  }
  return String(float);
};

const inc = (bytes, i = bytes.length - 1) => {
  if (i >= 0 && ++bytes[i] > 255) {
    bytes[i] = 0;
    inc(bytes, i - 1);
  }
};

export const nextFloat = f64 => float => {
  const bytes = toBytes(f64)(float);
  inc(bytes);
  return fromBytes(f64)(bytes);
};

const dec = (bytes, i = bytes.length - 1) => {
  if (i >= 0 && --bytes[i] < 0) {
    bytes[i] = 255;
    dec(bytes, i - 1);
  }
};

export const prevFloat = f64 => float => {
  const bytes = toBytes(f64)(float);
  dec(bytes);
  return fromBytes(f64)(bytes);
};
