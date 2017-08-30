import { littleEndian, toBitsStr, fromNumber, toNumber, fromBitsStr, toFloatStr, fromFloatStr,
  nextFloat, prevFloat } from './float';

const $bits = document.getElementById('bits');
const $float = document.getElementById('float');
const $numberList = document.getElementById('number-list');
const $byteOrder = document.getElementById('byte-order');
const $bitCount = document.querySelectorAll('input[type=radio]'); // Assume 32-bit radio comes first

const numberListHeight = () => $numberList.clientHeight + $numberList.offsetTop;

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
  setFloatStr(toFloatStr(f64)(fromBitsStr(bitsStr)));
  showFloat();
};

// Init dom state

$byteOrder.innerHTML = `${littleEndian ? 'little' : 'big'} endian`;
$bitCount[+f64].checked = true;
showFloat();
showBits();
//showBitsInfo();

const classSelected = 'selected';

const createNumberElement = (floatStr, selected) => {
  const div = document.createElement('div');
  div.innerHTML = `<div class="number${selected? ` ${classSelected}` : ''}">${floatStr}</div>`;
  return div.childNodes[0];
};

(() => {
  let docHeight = $numberList.clientHeight;
  let winHeight = window.innerHeight;
  const bs = bytes();
  $numberList.innerHTML = ''; // Make sure no child nodes
  $numberList.appendChild(createNumberElement(toFloatStr(f64)(bs), true));
  let nbs = bs, pbs = bs;
  while (docHeight < winHeight * 2) {
    nbs = nextFloat(nbs);
    $numberList.prepend(createNumberElement(toFloatStr(f64)(nbs)));
    pbs = prevFloat(pbs);
    $numberList.appendChild(createNumberElement(toFloatStr(f64)(pbs)));
    docHeight = $numberList.clientHeight;
  }
})();

// Foo
const setF64 = v => {
  f64 = v;
  showFloat();
  showBits();
  //showBitsInfo();
  updateNumbers();
};

const updateNumbers = () => {
  window.scrollTo(0, Math.floor((numberListHeight() - window.innerHeight) / 2)); // Scroll to center of numbers
  const $numbers = $numberList.childNodes;
  const centerIdx = Math.floor($numbers.length / 2);
  const bs = bytes();
  const fStr = toFloatStr(f64)(bs);
  $numbers[centerIdx].innerText = fStr;
  $numbers[centerIdx].classList.add(classSelected);
  let nbs = bs;
  for (let i = centerIdx + 1; i < $numbers.length; i++) {
    nbs = prevFloat(nbs);
    $numbers[i].innerText = toFloatStr(f64)(nbs);
    $numbers[i].classList.remove(classSelected);
  }
  nbs = bs;
  for (let i = centerIdx - 1; i >= 0; i--) {
    nbs = nextFloat(nbs);
    $numbers[i].innerText = toFloatStr(f64)(nbs);
    $numbers[i].classList.remove(classSelected);
  }
};

const setFloatStr = fStr => {
  f64Str = fStr;
  updateNumbers();
};

const setFloatOrJs = floatStrOrJs => {
  let fStr = toFloatStr(true)(fromFloatStr(true)(floatStrOrJs));
  if (fStr === toFloatStr(true)(fromNumber(true)(NaN))) try { // Default NaN?
    // Try to evaluate input
    const result = new Function(`return (${floatStrOrJs});`)();
    if (typeof result === 'number') {
      fStr = toFloatStr(true)(fromNumber(true)(result));
    }
  } catch (_) {}
  setFloatStr(fStr);
  showBits();
};

const applyFloat = floatStr => {
  if (floatStr === toFloatStr(f64)(bytes())) {
    setFloatStr(toFloatStr(f64)(bytes()));
  }
  showFloat();
};

// Add event listeners
$bitCount.forEach((r, i) => { r.addEventListener('change', () => { setF64(!!i); }, 0); });
$float.addEventListener('input', e => { setFloatOrJs(e.target.value); });
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

const scrolled = up => () => {
  const height = $numberList.clientHeight; // Height of number
  const nbrs = $numberList.childNodes;
  const count = Math.round(nbrs.length * 0.25); // Count of numbers to add/remove
  let float = fromFloatStr(f64)((up ? $numberList.firstChild : $numberList.lastChild).innerText);
  const fStrSel = toFloatStr(f64)(bytes());
  // Add some numbers
  for (let i = 0; i < count; i++) {
    float = (up ? nextFloat : prevFloat)(float);
    const fStr = toFloatStr(f64)(float);
    const nbrEl = createNumberElement(fStr, fStrSel === fStr);
    if (up) {
      $numberList.insertBefore(nbrEl, $numberList.firstChild);
    } else {
      $numberList.appendChild(nbrEl);
    }
  };
  const scroll = $numberList.clientHeight - height;
  // Remove some numbers
  for (let i = 0; i < count; i++) {
    (up ? $numberList.lastChild : $numberList.firstChild).remove();
  };
  // Scroll to same position as before
  window.scrollTo(0, window.scrollY + (up ? scroll : -scroll));
};

const scrolledUp = scrolled(true);
const scrolledDown = scrolled(false);

window.addEventListener('scroll', e => {
  if (window.scrollY <= 0) { // Scrolled up
    scrolledUp();
  } else if (window.scrollY + window.innerHeight >= numberListHeight()) { // Scrolled down
    scrolledDown();
  }
});
