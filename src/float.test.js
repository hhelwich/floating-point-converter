const { toBytes, fromBytes, fromBitsStr, toBitsStr, roundFloat32, toFloatStr } = require('./float');

describe('toBytes', () => {

  const toHex = bs => bs.map(b => ('0' + b.toString(16)).substr(-2)).join('');
  const toBytes64 = n => toHex(toBytes(true)(n));
  const toBytes32 = n => toHex(toBytes(false)(n));

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

  const fromHex = hex => (hex.match(/.{1,2}/g)||[]).map(hb => parseInt(hb, 16));
  const fromBytes64 = hex => fromBytes(true)(fromHex(hex));
  const fromBytes32 = hex => fromBytes(false)(fromHex(hex));

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
