import { littleEndian, toBitsStr, fromNumber, toNumber, fromBitsStr, toFloatStr, fromFloatStr,
  nextFloat, prevFloat } from './float';

const $bits = document.getElementById('bits');
const $float = document.getElementById('float');
const $numberList = document.getElementById('number-list');
const $byteOrder = document.getElementById('byte-order');
const $bitCount = document.querySelectorAll('input[type=radio]'); // Assume 32-bit radio comes first

let f64 = true;
let f64Str = toFloatStr(true)(fromNumber(true)(Math.PI));

const bytes = () => fromFloatStr(f64)(f64Str);

(() => { // Apply styling
  // Center inputs
  const $inputs = document.getElementById('inputs');
  $inputs.style.marginLeft = `-${Math.round($inputs.offsetWidth / 2)}px`;
  $inputs.style.marginTop = `-${Math.round($inputs.offsetHeight / 2)}px`;
  $inputs.style.left = $inputs.style.top = '50%';
})();

const showFloat = () => {
  $float.value = toFloatStr(f64)(bytes());
};

const showBits = () => {
  $bits.value = toBitsStr(bytes());
};

const changeBits = bitsStr => {
  if (bitsStr.length !== (f64 ? 8 : 4) * 8) {
    // Assure correct length and fill with trailing zeros if neccesary
    bitsStr = bitsStr.concat(Array(65).join('0')).slice(0, (f64 ? 8 : 4) * 8);
  }
  f64Str = toFloatStr(f64)(fromBitsStr(bitsStr));
  showFloat();
};

// Init dom state

$byteOrder.innerHTML = `${littleEndian ? 'little' : 'big'} endian`;
$bitCount[+f64].checked = true;
showFloat();
showBits();
//showBitsInfo();


const createNumberElement = (floatStr, selected) => {
  const div = document.createElement('div');
  div.innerHTML = `<div class="number${selected? ' selected' : ''}">${floatStr}</div>`;
  return div.childNodes[0];
};

(() => {
  let docHeight = document.body.clientHeight;
  let winHeight = window.innerHeight;
  //$numberList.append('<div class="card text-center card-primary"><div class="card-block" >' + float + '</div></div>');
  const bs = bytes();
  $numberList.appendChild(createNumberElement(toFloatStr(f64)(bs), true));
  let nbs = bs, pbs = bs;
  let i = 0;
  while (docHeight < winHeight * 3) {
    nbs = nextFloat(nbs);
    $numberList.prepend(createNumberElement(toFloatStr(f64)(nbs)));
    pbs = prevFloat(pbs);
    $numberList.appendChild(createNumberElement(toFloatStr(f64)(pbs)));
    docHeight = document.body.clientHeight;
    if (i++ > 100) {
      console.warn('infinite loop');
      break;
    }
  }
  //$window.scrollTop(($document.height() - winHeight) / 2);
})();

// Foo
const setF64 = v => {
  f64 = v;
  showFloat();
  showBits();
  //showBitsInfo();
};

const setFloat = floatStrOrJs => {
  f64Str = toFloatStr(true)(fromFloatStr(true)(floatStrOrJs));
  if (f64Str === toFloatStr(true)(fromNumber(true)(NaN))) try { // Default NaN?
    // Try to evaluate input
    const result = new Function(`return (${floatStrOrJs});`)();
    if (typeof result === 'number') {
      f64Str = toFloatStr(true)(fromNumber(true)(result));
    }
  } catch (_) {}
  showBits();
};

const applyFloat = floatStr => {
  if (floatStr === toFloatStr(f64)(bytes())) {
    f64Str = toFloatStr(f64)(bytes());
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

let scrollY = 0;

window.addEventListener('scroll', e => {
  scrollY = window.scrollY;
  console.log(scrollY);
});
