const { toBytes, fromBytes, fromBitsStr, toBitsStr, roundFloat32, toFloatStr, nextFloat, prevFloat } = require('./float');

const fromHex = hex => (hex.match(/.{1,2}/g)||[]).map(hb => parseInt(hb, 16));
const toHex = bs => bs.map(b => ('0' + b.toString(16)).substr(-2)).join('');
const toBytes64 = n => toHex(toBytes(true)(n));
const toBytes32 = n => toHex(toBytes(false)(n));
const fromBytes64 = hex => fromBytes(true)(fromHex(hex));
const fromBytes32 = hex => fromBytes(false)(fromHex(hex));
const MAX_VALUE_32 = 3.4028234663852886e+38;
const MIN_VALUE_32 = 1.401298464324817e-45;

describe('toBytes', () => {

  it('encodes +-0', () => {
    expect(toBytes64( 0)).toBe('0000000000000000');
    expect(toBytes32( 0)).toBe('00000000');
    expect(toBytes64(-0)).toBe('8000000000000000');
    expect(toBytes32(-0)).toBe('80000000');
  });

  it('encodes +-Infinity', () => {
    expect(toBytes64( Infinity)).toBe('7ff0000000000000');
    expect(toBytes32( Infinity)).toBe('7f800000');
    expect(toBytes64(-Infinity)).toBe('fff0000000000000');
    expect(toBytes32(-Infinity)).toBe('ff800000');
  });

  it('encodes NaN', () => {
    expect(toBytes64(NaN)).toBe('7ff8000000000000');
    expect(toBytes32(NaN)).toBe('7fc00000');
  });

  it('encodes +-1', () => {
    expect(toBytes64( 1)).toBe('3ff0000000000000');
    expect(toBytes32( 1)).toBe('3f800000');
    expect(toBytes64(-1)).toBe('bff0000000000000');
    expect(toBytes32(-1)).toBe('bf800000');
  });

  it('encodes PI', () => {
    expect(toBytes64(Math.PI)).toBe('400921fb54442d18');
    expect(toBytes32(Math.PI)).toBe('40490fdb');
  });

});

describe('fromBytes', () => {

  it('decodes +-0', () => {
    expect(fromBytes64('0000000000000000')).toBeNbr(0);
    expect(fromBytes32('00000000')).toBeNbr(0);
    expect(fromBytes64('8000000000000000')).toBeNbr(-0);
    expect(fromBytes32('80000000')).toBeNbr(-0);
  });

  it('decodes +-Infinity', () => {
    expect(fromBytes64('7ff0000000000000')).toBe(Infinity);
    expect(fromBytes32('7f800000')).toBe(Infinity);
    expect(fromBytes64('fff0000000000000')).toBe(-Infinity);
    expect(fromBytes32('ff800000')).toBe(-Infinity);
  });

  it('encodes NaN', () => {
    expect(fromBytes64('7ff8000000000000')).toBeNaN();
    expect(fromBytes32('7fc00000')).toBeNaN();
  });

  it('decodes +-1', () => {
    expect(fromBytes64('3ff0000000000000')).toBe(1);
    expect(fromBytes32('3f800000')).toBe(1);
    expect(fromBytes64('bff0000000000000')).toBe(-1);
    expect(fromBytes32('bf800000')).toBe(-1);
  });

  it('decodes PI', () => {
    expect(fromBytes64('400921fb54442d18')).toBe(Math.PI);
    expect(fromBytes32('40490fdb')).toBe(3.1415927410125732);
  });

});

describe('fromBitsStr', () => {

  it('parses empty string', () => {
    expect(fromBitsStr('')).toEqual([]);
  });

  it('gets bytes from bits string', () => {
    expect(fromBitsStr('00000000')).toEqual([0]);
    expect(fromBitsStr('0100000000001001001000011111101101010100010001000010110100011000')).toEqual([
      64, 9, 33, 251, 84, 68, 45, 24
    ]);
  });

});

describe('toBitsStr', () => {

  it('gets bit string from bytes', () => {
    expect(toBitsStr([])).toBe('');
    expect(toBitsStr([0])).toBe('00000000');
    expect(toBitsStr([64, 9, 33, 251, 84, 68, 45, 24])).toBe(
      '0100000000001001001000011111101101010100010001000010110100011000'
    );
  });

});

describe('roundFloat32', () => {

  it('preserves special values', () => {
    expect(roundFloat32(0)).toBeNbr(0);
    expect(roundFloat32(-0)).toBeNbr(-0);
    expect(roundFloat32(Infinity)).toBe(Infinity);
    expect(roundFloat32(-Infinity)).toBe(-Infinity);
    expect(roundFloat32(NaN)).toBeNaN();
  });

  it('rounds float64 to float32', () => {
    expect(roundFloat32(Math.PI)).toBe(3.1415927410125732);
  });

});

describe('toFloatStr', () => {

  it('can handle +-0', () => {
    expect(toFloatStr(0)).toBe('0');
    expect(toFloatStr(-0)).toBe('-0');
  });

  it('can handle special values', () => {
    expect(toFloatStr(NaN)).toBe('NaN');
    expect(toFloatStr(Infinity)).toBe('Infinity');
    expect(toFloatStr(-Infinity)).toBe('-Infinity');
  });

  it('can handle normal numbers', () => {
    expect(toFloatStr(Math.PI)).toBe('3.141592653589793');
  });

});

const nextF64 = hexStr => toBytes64(nextFloat(true)(fromBytes64(hexStr)));
const nextF32 = hexStr => toBytes32(nextFloat(false)(fromBytes32(hexStr)));
const prevF64 = hexStr => toBytes64(prevFloat(true)(fromBytes64(hexStr)));
const prevF32 = hexStr => toBytes32(prevFloat(false)(fromBytes32(hexStr)));

describe('nextFloat', () => {

  it('can carry forward', () => {
    expect(nextF64('0123456789abcdef')).toBe('0123456789abcdf0');
    expect(nextF64('00000000000000ff')).toBe('0000000000000100');
    expect(nextF64('000000000000ffff')).toBe('0000000000010000');
    expect(nextF64('0000000000ffffff')).toBe('0000000001000000');
    expect(nextF64('00000000ffffffff')).toBe('0000000100000000');
    expect(nextF64('000000ffffffffff')).toBe('0000010000000000');
    expect(nextF64('0000ffffffffffff')).toBe('0001000000000000');
    expect(nextF64('00ffffffffffffff')).toBe('0100000000000000');
    expect(nextF32('01234567')).toBe('01234568');
    expect(nextF32('000000ff')).toBe('00000100');
    expect(nextF32('0000ffff')).toBe('00010000');
    expect(nextF32('00ffffff')).toBe('01000000');
    expect(nextF32('ffffffff')).toBe('00000000');
  });

  it('can handle special numbers', () => {
    expect(nextFloat(false)(0)).toBe(MIN_VALUE_32);
    expect(nextFloat(false)(-0)).toBe(-MIN_VALUE_32);
    expect(nextFloat(true)(0)).toBe(Number.MIN_VALUE);
    expect(nextFloat(true)(-0)).toBe(-Number.MIN_VALUE);
    expect(nextFloat(false)(NaN)).toBeNaN();
    expect(nextFloat(true)(NaN)).toBeNaN();
    expect(nextFloat(false)(Infinity)).toBeNaN();
    expect(nextFloat(false)(-Infinity)).toBeNaN();
    expect(nextFloat(true)(Infinity)).toBeNaN();
    expect(nextFloat(true)(-Infinity)).toBeNaN();
  });

});

describe('prevFloat', () => {

  it('can carry backward', () => {
    expect(prevF64('0123456789abcdef')).toBe('0123456789abcdee');
    expect(prevF64('0000000000000100')).toBe('00000000000000ff');
    expect(prevF64('0000000000010000')).toBe('000000000000ffff');
    expect(prevF64('0000000001000000')).toBe('0000000000ffffff');
    expect(prevF64('0000000100000000')).toBe('00000000ffffffff');
    expect(prevF64('0000010000000000')).toBe('000000ffffffffff');
    expect(prevF64('0001000000000000')).toBe('0000ffffffffffff');
    expect(prevF64('0100000000000000')).toBe('00ffffffffffffff');
    expect(prevF64('0000000000000000')).toBe('ffffffffffffffff');
    expect(prevF32('01234567')).toBe('01234566');
    expect(prevF32('00000100')).toBe('000000ff');
    expect(prevF32('00010000')).toBe('0000ffff');
    expect(prevF32('01000000')).toBe('00ffffff');
    expect(prevF32('00000000')).toBe('ffffffff');
  });

  it('can handle special numbers', () => {
    expect(prevFloat(false)(0)).toBeNaN();
    expect(prevFloat(false)(-0)).toBeNaN();
    expect(prevFloat(true)(0)).toBeNaN();
    expect(prevFloat(true)(-0)).toBeNaN();
    expect(prevFloat(false)(NaN)).toBeNaN();
    expect(prevFloat(true)(NaN)).toBeNaN();
    expect(prevFloat(false)(Infinity)).toBe(MAX_VALUE_32);
    expect(prevFloat(false)(-Infinity)).toBe(-MAX_VALUE_32);
    expect(prevFloat(true)(Infinity)).toBe(Number.MAX_VALUE);
    expect(prevFloat(true)(-Infinity)).toBe(-Number.MAX_VALUE);
  });

  it('is identity when composed with nextFloat', () => {
    const randomHex = length => Array.apply(null, { length }).map(() =>
      Math.floor(Math.random() * 16).toString(16)).join('');

    for (let b = 0; b < 4; b++) {
      const f64 = b % 2 === 0;
      const identity = hex => {
        switch(b) {
          case 0: return nextF64(prevF64(hex));
          case 1: return nextF32(prevF32(hex));
          case 2: return prevF64(nextF64(hex));
          case 3: return prevF32(nextF32(hex));
        }
      }
      for (let i = 0; i < 100; i++) {
        const hex = randomHex(f64 ? 16 : 8);
        const isNan = isNaN((f64 ? fromBytes64 : fromBytes32)(hex));
        if (!isNan) {
          expect(identity(hex)).toBe(hex);
        }
      }
    }
  });

});

expect.extend({
  // Like toBe matcher for numbers but 0 and -0 are not equal
  toBeNbr(received, argument) {
    const pass =
      typeof received === 'number' &&
      typeof argument === 'number' &&
      received === argument &&
     (received !== 0 || 1 / received === 1 / argument);
    const message = () => pass ?
      `expected ${received} not to be equal number to ${argument}` :
      `expected ${received} to be equal number to ${argument}`;
    return { pass, message };
  },
});
