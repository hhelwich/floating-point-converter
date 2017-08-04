import { littleEndian, toBitsStr, toBytes, fromBytes, fromBitsStr, roundFloat32, toFloatStr } from './float';

const $bits = document.getElementById('bits');
const $float = document.getElementById('float');
const $numberList = document.getElementById('number-list');
const $byteOrder = document.getElementById('byte-order');
const $bitCount = document.querySelectorAll('input[type=radio]'); // Assume 32-bit radio comes first

let f64 = true;
let float = Math.PI;

// Round to number to current
const round = n => f64 ? n : roundFloat32(n);

const showFloat = () => {
  $float.value = toFloatStr(round(float));
}

const showBits = () => {
  $bits.value = toBitsStr(toBytes(f64)(float));
}

const changeBits = bitsStr => {
  float = fromBytes(f64)(fromBitsStr(bitsStr));
  showFloat();
};

// Init dom state

$byteOrder.innerHTML = `${littleEndian ? 'little' : 'big'} endian`;
$bitCount[+f64].checked = true;
showFloat();
showBits();
//showBitsInfo();

// Foo
const setF64 = v => {
  f64 = v;
  showFloat();
  showBits();
  //showBitsInfo();
};

const setFloat = floatStr => {
  float = Number(floatStr);
  if (isNaN(float)) {
    try {
      float = parseFloat(new Function(`return (${floatStr});`)(), 10);
    } catch (_) {
      float = NaN;
    }
  }
  showBits();
};

const applyFloat = floatStr => {
  if (floatStr === toFloatStr(round(float))) {
    float = round(float);
  }
  showFloat();
};

// Add event listeners
$bitCount.forEach((r, i) => { r.addEventListener('change', () => { setF64(!!i); }, 0); });
$float.addEventListener('input', e => { setFloat(e.target.value); });
$float.addEventListener('keydown', e => {
  if (e.keyCode === 13) { // On Enter
    applyFloat(e.target.value);
  }
});
$bits.addEventListener('input', e => { changeBits(e.target.value); });
$bits.addEventListener('keydown', e => {
  if (e.keyCode === 13) { // On Enter
    changeBits(e.target.value);
  }
});