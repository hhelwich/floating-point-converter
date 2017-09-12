const { fromBitsStr, fromNumber, toNumber, fromInt, toBitsStr, toHexStr, toInt, roundFloat32, toFloatStr,
  fromFloatStr, nextFloat, prevFloat, fromHexStr, evalFloatStr } = require('./float');

const fromNumber64 = n => toHexStr(fromNumber(true)(n));
const fromNumber32 = n => toHexStr(fromNumber(false)(n));
const toNumber64 = hex => toNumber(true)(fromHexStr(hex));
const toNumber32 = hex => toNumber(false)(fromHexStr(hex));

describe('fromBitsStr', () => {

  it('maps an empty string to an empty (byte) list', () => {
    expect(fromBitsStr('')).toEqual([]);
  });

  it('maps a bits string to a byte list', () => {
    expect(fromBitsStr('00000000')).toEqual([0]);
    expect(fromBitsStr('0100000000001001001000011111101101010100010001000010110100011000')).toEqual([
      64, 9, 33, 251, 84, 68, 45, 24
    ]);
  });

});

describe('fromHexStr', () => {

  it('maps an empty string to an empty (byte) list', () => {
    expect(fromHexStr('')).toEqual([]);
  });

  it('maps a single byte hex string to a single byte in a list', () => {
    expect(fromHexStr('00')).toEqual([0]);
    expect(fromHexStr('12')).toEqual([0x12]);
  });

  it('maps a hex byte string to a byte list', () => {
    expect(fromHexStr('1234567890abcdef')).toEqual([0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd, 0xef]);
  });

});

describe('fromInt', () => {

  it('maps an unsigned byte to a single element byte list', () => {
    expect(fromInt(0)).toEqual([]);
    expect(fromInt(1)).toEqual([1]);
    expect(fromInt(42)).toEqual([42]);
    expect(fromInt(255)).toEqual([255]);
  });

  it('maps an unsigned integer to a byte list', () => {
    expect(fromInt(0xff00)).toEqual([0xff, 0]);
    expect(fromInt(0x123456)).toEqual([0x12, 0x34, 0x56]);
    expect(fromInt(0x123456789abcde)).toEqual([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde]);
  });

  it('maps max NaN payload for float64 to a byte list', () => {
    expect(fromInt(0xfffffffffffff)).toEqual([0xf, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
  });

  it('maps up to max save integer for float64 to a byte list', () => {
    expect(fromInt(0x1fffffffffffff)).toEqual([0x1f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]); // Can do max float64 integer
    expect(() => fromInt(0x20000000000000)).toThrow(); // throws if greater than that
  });

  it('maps negative integers to an empty (byte) list', () => {
    expect(fromInt(-0)).toEqual([]);
    expect(fromInt(-1193046)).toEqual([]);
    expect(fromInt(-0x1fffffffffffff)).toEqual([]);
  });

});

describe('toBitsStr', () => {

  it('maps a byte list to a bits string', () => {
    expect(toBitsStr([])).toBe('');
    expect(toBitsStr([0])).toBe('00000000');
    expect(toBitsStr([64, 9, 33, 251, 84, 68, 45, 24])).toBe(
      '0100000000001001001000011111101101010100010001000010110100011000'
    );
  });

});

describe('toHexStr', () => {

  it('maps a byte list to a hex string', () => {
    expect(toHexStr([])).toBe('');
    expect(toHexStr([0])).toBe('00');
    expect(toHexStr([1])).toBe('01');
    expect(toHexStr([0xff])).toBe('ff');
    expect(toHexStr([0x40, 0x09, 0x21, 0xfb, 0x54, 0x44, 0x2d, 0x18])).toBe('400921fb54442d18');
  });

});

describe('toInt', () => {

  it('maps a byte list to an unsigned integer', () => {
    expect(toInt([])).toBeNbr(0);
    expect(toInt([0])).toBeNbr(0);
    expect(toInt([1])).toBe(1);
    expect(toInt([0xff])).toBe(0xff);
    expect(toInt([0xff, 0])).toBe(0xff00);
    expect(toInt([0x12, 0x34, 0x56])).toBe(0x123456);
    expect(toInt([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde])).toBe(0x123456789abcde);
  });

  it('maps a byte list up to maximum save integer for float64', () => {
    expect(toInt([0xf, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff])).toBe(0xfffffffffffff); // Maximum NaN payload in float64
    expect(toInt([0x1f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff])).toBe(0x1fffffffffffff); // Can do max float64 integer
    expect(() => toInt([0x20, 0, 0, 0, 0, 0, 0])).toThrow(); // Throws if greater than max float64 integer
  });

});

describe('fromNumber', () => {

  it('encodes +-0', () => {
    expect(fromNumber64( 0)).toBe('0000000000000000');
    expect(fromNumber32( 0)).toBe('00000000');
    expect(fromNumber64(-0)).toBe('8000000000000000');
    expect(fromNumber32(-0)).toBe('80000000');
  });

  it('encodes +-Infinity', () => {
    expect(fromNumber64( Infinity)).toBe('7ff0000000000000');
    expect(fromNumber32( Infinity)).toBe('7f800000');
    expect(fromNumber64(-Infinity)).toBe('fff0000000000000');
    expect(fromNumber32(-Infinity)).toBe('ff800000');
  });

  it('encodes NaN', () => {
    expect(fromNumber64(NaN)).toBe('7ff8000000000000');
    expect(fromNumber32(NaN)).toBe('7fc00000');
  });

  it('encodes +-1', () => {
    expect(fromNumber64( 1)).toBe('3ff0000000000000');
    expect(fromNumber32( 1)).toBe('3f800000');
    expect(fromNumber64(-1)).toBe('bff0000000000000');
    expect(fromNumber32(-1)).toBe('bf800000');
  });

  it('encodes PI', () => {
    expect(fromNumber64(Math.PI)).toBe('400921fb54442d18');
    expect(fromNumber32(Math.PI)).toBe('40490fdb');
  });

});

describe('toNumber', () => {

  it('decodes +-0', () => {
    expect(toNumber64('0000000000000000')).toBeNbr(0);
    expect(toNumber32('00000000')).toBeNbr(0);
    expect(toNumber64('8000000000000000')).toBeNbr(-0);
    expect(toNumber32('80000000')).toBeNbr(-0);
  });

  it('decodes +-Infinity', () => {
    expect(toNumber64('7ff0000000000000')).toBe(Infinity);
    expect(toNumber32('7f800000')).toBe(Infinity);
    expect(toNumber64('fff0000000000000')).toBe(-Infinity);
    expect(toNumber32('ff800000')).toBe(-Infinity);
  });

  it('encodes NaN', () => {
    expect(toNumber64('7ff8000000000000')).toBeNaN();
    expect(toNumber32('7fc00000')).toBeNaN();
  });

  it('decodes +-1', () => {
    expect(toNumber64('3ff0000000000000')).toBe(1);
    expect(toNumber32('3f800000')).toBe(1);
    expect(toNumber64('bff0000000000000')).toBe(-1);
    expect(toNumber32('bf800000')).toBe(-1);
  });

  it('decodes PI', () => {
    expect(toNumber64('400921fb54442d18')).toBe(Math.PI);
    expect(toNumber32('40490fdb')).toBe(3.1415927410125732);
  });

});

describe('toFloatStr', () => {

  it('maps +-0', () => {
    expect(toFloatStr(false)(fromHexStr('00000000'))).toBe('0');
    expect(toFloatStr(false)(fromHexStr('80000000'))).toBe('-0');
    expect(toFloatStr(true)(fromHexStr('0000000000000000'))).toBe('0');
    expect(toFloatStr(true)(fromHexStr('8000000000000000'))).toBe('-0');
  });

  it('maps special values', () => {
    expect(toFloatStr(false)(fromHexStr('7f800000'))).toBe('Infinity');
    expect(toFloatStr(true)(fromHexStr('7ff0000000000000'))).toBe('Infinity');
    expect(toFloatStr(false)(fromHexStr('ff800000'))).toBe('-Infinity');
    expect(toFloatStr(true)(fromHexStr('fff0000000000000'))).toBe('-Infinity');
    expect(toFloatStr(false)(fromHexStr('7f800001'))).toBe('NaN(1)');
    expect(toFloatStr(false)(fromHexStr('7f923456'))).toBe('NaN(1193046)');
    expect(toFloatStr(false)(fromHexStr('7fffffff'))).toBe('NaN(8388607)');
    expect(toFloatStr(false)(fromHexStr('ff800001'))).toBe('-NaN(1)');
    expect(toFloatStr(false)(fromHexStr('ff923456'))).toBe('-NaN(1193046)');
    expect(toFloatStr(false)(fromHexStr('ffffffff'))).toBe('-NaN(8388607)');
    expect(toFloatStr(true)(fromHexStr('7ff0000000000001'))).toBe('NaN(1)');
    expect(toFloatStr(true)(fromHexStr('7ff123456789abcd'))).toBe('NaN(320255973501901)');
    expect(toFloatStr(true)(fromHexStr('7fffffffffffffff'))).toBe('NaN(4503599627370495)');
    expect(toFloatStr(true)(fromHexStr('fff0000000000001'))).toBe('-NaN(1)');
    expect(toFloatStr(true)(fromHexStr('fff123456789abcd'))).toBe('-NaN(320255973501901)');
    expect(toFloatStr(true)(fromHexStr('ffffffffffffffff'))).toBe('-NaN(4503599627370495)');
    expect(toFloatStr(true)(fromNumber(true)(NaN))).toBe('NaN(2251799813685248)');
    expect(toFloatStr(false)(fromNumber(false)(NaN))).toBe('NaN(4194304)');
  });

  it('maps normal numbers', () => {
    expect(toFloatStr(true) (fromNumber(true) ( Math.PI))).toBe( '3.141592653589793');
    expect(toFloatStr(false)(fromNumber(false)( Math.PI))).toBe( '3.1415927410125732');
    expect(toFloatStr(true) (fromNumber(true) (-Math.PI))).toBe('-3.141592653589793');
    expect(toFloatStr(false)(fromNumber(false)(-Math.PI))).toBe('-3.1415927410125732');
  });

});

describe('fromFloatStr', () => {

  it('maps (-)0', () => {
    expect(toHexStr(fromFloatStr(false)('0'))).toBe('00000000');
    expect(toHexStr(fromFloatStr(true)('0'))).toBe('0000000000000000');
    expect(toHexStr(fromFloatStr(false)('-0'))).toBe('80000000');
    expect(toHexStr(fromFloatStr(true)('-0'))).toBe('8000000000000000');
  });

  it('maps special values', () => {
    expect(toHexStr(fromFloatStr(false)('Infinity'))).toBe('7f800000');
    expect(toHexStr(fromFloatStr(true)('Infinity'))).toBe('7ff0000000000000');
    expect(toHexStr(fromFloatStr(false)('-Infinity'))).toBe('ff800000');
    expect(toHexStr(fromFloatStr(true)('-Infinity'))).toBe('fff0000000000000');
    expect(toHexStr(fromFloatStr(true)('NaN(1)'))).toBe('7ff0000000000001');
    expect(toHexStr(fromFloatStr(false)('NaN(1)'))).toBe('7f800001');
    expect(toHexStr(fromFloatStr(true)('NaN(4503599627370495)'))).toBe('7fffffffffffffff');
    expect(toHexStr(fromFloatStr(false)('NaN(8388607)'))).toBe('7fffffff');
    expect(toHexStr(fromFloatStr(true)('-NaN(1)'))).toBe('fff0000000000001');
    expect(toHexStr(fromFloatStr(false)('-NaN(1)'))).toBe('ff800001');
    expect(toHexStr(fromFloatStr(true)('-NaN(4503599627370495)'))).toBe('ffffffffffffffff');
    expect(toHexStr(fromFloatStr(true)('NaN'))).toBe('7ff8000000000000');
    expect(toHexStr(fromFloatStr(false)('NaN'))).toBe('7fc00000');
    expect(toHexStr(fromFloatStr(true)('-NaN'))).toBe('fff8000000000000');
    expect(toHexStr(fromFloatStr(false)('-NaN'))).toBe('ffc00000');
  });

  it('maps normal number strings', () => {
    expect(toNumber(true)(fromFloatStr(true)('3.141592653589793'))).toBe(3.141592653589793);
    expect(toNumber(true)(fromFloatStr(true)('-3.141592653589793'))).toBe(-3.141592653589793);
    expect(toNumber(false)(fromFloatStr(false)('3.1415927410125732'))).toBe(3.1415927410125732);
    expect(toNumber(false)(fromFloatStr(false)('-3.1415927410125732'))).toBe(-3.1415927410125732);
  });

  it('maps everything else to default NaN', () => {
    // Payload overflow
    expect(toHexStr(fromFloatStr(true)('NaN(4503599627370496)'))).toBe('7ff8000000000000');
    expect(toHexStr(fromFloatStr(false)('NaN(8388608)'))).toBe('7fc00000');

    expect(toHexStr(fromFloatStr(true)('NaN(-42)'))).toBe('7ff8000000000000');
    expect(toHexStr(fromFloatStr(false)('NaN(-42)'))).toBe('7fc00000');
    expect(toHexStr(fromFloatStr(true)('NaN(0)'))).toBe('7ff8000000000000');
    expect(toHexStr(fromFloatStr(false)('NaN(0)'))).toBe('7fc00000');
    expect(toHexStr(fromFloatStr(true)('foo'))).toBe('7ff8000000000000');
    expect(toHexStr(fromFloatStr(false)('foo'))).toBe('7fc00000');
  });

  it('rounds to next float32 if needed', () => {
    expect(toNumber(false)(fromFloatStr(false)('3.141592653589793'))).toBe(3.1415927410125732);
    expect(toNumber(false)(fromFloatStr(false)('-3.141592653589793'))).toBe(-3.1415927410125732);
  });

  it('can restore any output of toFloatStr to original bytes', () => {
    const randBytes = f64 => Array.apply(null, { length: f64 ? 8 : 4 }).map(() => Math.floor(Math.random() * 256));
    for (let i = 0; i < 200; i++) {
      const f64 = Math.random() > 0.5;
      const bytes = randBytes(f64);
      const bytesCp = bytes.slice();
      const bytes2 = fromFloatStr(f64)(toFloatStr(f64)(bytes));
      expect(bytesCp).toEqual(bytes); // Also check input is not touched
      expect(bytes2).toEqual(bytes);
    }
  });

});

const nextF64 = fStr => toFloatStr(true)(nextFloat(fromFloatStr(true)(fStr)));
const nextF32 = fStr => toFloatStr(false)(nextFloat(fromFloatStr(false)(fStr)));
const prevF64 = fStr => toFloatStr(true)(prevFloat(fromFloatStr(true)(fStr)));
const prevF32 = fStr => toFloatStr(false)(prevFloat(fromFloatStr(false)(fStr)));

describe('nextFloat', () => {

  it('can carry forward', () => {
    expect(nextF64('-Infinity')).toBe('-1.7976931348623157e+308');
    expect(nextF64('-1.7976931348623157e+308')).toBe('-1.7976931348623155e+308');
    expect(nextF64('-1e-323')).toBe('-5e-324');
    expect(nextF64('-5e-324')).toBe('-0');
    expect(nextF64('-0')).toBe('0');
    expect(nextF64('0')).toBe('5e-324');
    expect(nextF64('5e-324')).toBe('1e-323');
    expect(nextF64('1.7976931348623155e+308')).toBe('1.7976931348623157e+308');
    expect(nextF64('1.7976931348623157e+308')).toBe('Infinity');
    expect(nextF64('Infinity')).toBe('NaN(1)');
    expect(nextF64('NaN(1)')).toBe('NaN(2)');
    expect(nextF64('NaN(2251799813685247)')).toBe('NaN(2251799813685248)');
    expect(nextF64('NaN(2251799813685248)')).toBe('NaN(2251799813685249)');
    expect(nextF64('NaN')).toBe('NaN(2251799813685249)');
    expect(nextF64('NaN(4503599627370495)')).toBe('-NaN(4503599627370495)');
    expect(nextF64('-NaN(4503599627370495)')).toBe('-NaN(4503599627370494)');
    expect(nextF64('-NaN(2251799813685249)')).toBe('-NaN(2251799813685248)');
    expect(nextF64('-NaN(2251799813685248)')).toBe('-NaN(2251799813685247)');
    expect(nextF64('-NaN')).toBe('-NaN(2251799813685247)');
    expect(nextF64('-NaN(2)')).toBe('-NaN(1)');
    expect(nextF64('-NaN(1)')).toBe('-Infinity');
  });

  it('can carry forward 32', () => {
    expect(nextF32('-Infinity')).toBe('-3.4028234663852886e+38');
    expect(nextF32('-3.4028234663852886e+38')).toBe('-3.4028232635611926e+38');
    expect(nextF32('-2.802596928649634e-45')).toBe('-1.401298464324817e-45');
    expect(nextF32('-1.401298464324817e-45')).toBe('-0');
    expect(nextF32('-0')).toBe('0');
    expect(nextF32('0')).toBe('1.401298464324817e-45');
    expect(nextF32('1.401298464324817e-45')).toBe('2.802596928649634e-45');
    expect(nextF32('3.4028232635611926e+38')).toBe('3.4028234663852886e+38');
    expect(nextF32('3.4028234663852886e+38')).toBe('Infinity');
    expect(nextF32('Infinity')).toBe('NaN(1)');
    expect(nextF32('NaN(1)')).toBe('NaN(2)');
    expect(nextF32('NaN(4194304)')).toBe('NaN(4194305)');
    expect(nextF32('NaN(4194305)')).toBe('NaN(4194306)');
    expect(nextF32('NaN')).toBe('NaN(4194305)');
    expect(nextF32('NaN(8388607)')).toBe('-NaN(8388607)');
    expect(nextF32('-NaN(4194305)')).toBe('-NaN(4194304)');
    expect(nextF32('-NaN(4194304)')).toBe('-NaN(4194303)');
    expect(nextF32('-NaN')).toBe('-NaN(4194303)');
    expect(nextF32('-NaN(2)')).toBe('-NaN(1)');
    expect(nextF32('-NaN(1)')).toBe('-Infinity');
  });

});

describe('prevFloat', () => {

  it('is identity when composed with nextFloat', () => {
    const randBytes = length => Array.apply(null, { length }).map(() =>
      Math.floor(Math.random() * 256));
    for (let i = 0; i < 100; i++) {
      const bytes = randBytes(Math.floor(Math.random() * 10) + 1);
      expect(prevFloat(nextFloat(bytes.slice()))).toEqual(bytes);
      expect(nextFloat(prevFloat(bytes.slice()))).toEqual(bytes);
    }
  });

});

describe('evalFloatStr', () => {

  it('preserves float32 strings', () => {
    expect(evalFloatStr(true)('4.3203125')).toBe('4.3203125');
    expect(evalFloatStr(false)('4.3203125')).toBe('4.3203125');
  });

  it('evaluates JS code', () => {
    expect(evalFloatStr(true)('Math.round(Math.PI * 1337 / 100)')).toBe('42');
    expect(evalFloatStr(false)('Math.round(Math.PI * 1337 / 100)')).toBe('42');
  });

  it('preserves special values', () => {
    // 64 bit
    expect(evalFloatStr(true)('NaN(42)')).toBe('NaN(42)');
    expect(evalFloatStr(true)('-NaN(42)')).toBe('-NaN(42)');
    expect(evalFloatStr(true)('0')).toBe('0');
    expect(evalFloatStr(true)('-0')).toBe('-0');
    expect(evalFloatStr(true)('Infinity')).toBe('Infinity');
    expect(evalFloatStr(true)('-Infinity')).toBe('-Infinity');
    // 32 bit
    expect(evalFloatStr(false)('NaN(42)')).toBe('NaN(42)');
    expect(evalFloatStr(false)('-NaN(42)')).toBe('-NaN(42)');
    expect(evalFloatStr(false)('0')).toBe('0');
    expect(evalFloatStr(false)('-0')).toBe('-0');
    expect(evalFloatStr(false)('Infinity')).toBe('Infinity');
    expect(evalFloatStr(false)('-Infinity')).toBe('-Infinity');
  });

  it('expands NaN to default NaN', () => {
    expect(evalFloatStr(true)('NaN')).toBe('NaN(2251799813685248)');
    expect(evalFloatStr(false)('NaN')).toBe('NaN(4194304)');
  });

  it('expands unparseable string to default NaN', () => {
    expect(evalFloatStr(true)('foo')).toBe('NaN(2251799813685248)');
    expect(evalFloatStr(false)('foo')).toBe('NaN(4194304)');
  });

  it('rounds to float32 if needed', () => {
    // Do not round for float64
    expect(evalFloatStr(true)('3.141592653589793')).toBe('3.141592653589793');
    expect(evalFloatStr(true)('Math.PI')).toBe('3.141592653589793');
    expect(evalFloatStr(true)('NaN(2251799813685248)')).toBe('NaN(2251799813685248)');
    expect(evalFloatStr(true)('-NaN(2251799813685248)')).toBe('-NaN(2251799813685248)');
    // Round for float32
    expect(evalFloatStr(false)('3.141592653589793')).toBe('3.1415927410125732');
    expect(evalFloatStr(false)('Math.PI')).toBe('3.1415927410125732');
    expect(evalFloatStr(false)('NaN(2251799813685248)')).toBe('NaN(4194304)');
    expect(evalFloatStr(false)('-NaN(2251799813685248)')).toBe('-NaN(4194304)');
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
