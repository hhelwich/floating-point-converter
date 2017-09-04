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

const clickOnNumber = e => {
  setFloatStr(e.target.innerText);
  showFloat();
  showBits();
};

const createNumberElement = (floatStr, selected) => {
  let div = document.createElement('div');
  div.innerHTML = `<div class="number${selected? ` ${classSelected}` : ''}">${floatStr}</div>`;
  div = div.childNodes[0];
  div.addEventListener('click', clickOnNumber);
  return div;
};

const updateNumbers = () => {
  // Assure there are enough number elments
  while ($numberList.clientHeight < window.innerHeight * 2) {
    $numberList.appendChild(createNumberElement('0'));
  }
  // Set content
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

// Foo
const setF64 = v => {
  f64 = v;
  showFloat();
  showBits();
  //showBitsInfo();
  updateNumbers();
};

(() => {
  $numberList.innerHTML = ''; // Assure no child nodes
  updateNumbers();
})();

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
Array.prototype.slice.call($bitCount).forEach((r, i) => { r.addEventListener('change', () => { setF64(!!i); }, 0); });
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

const getScrollY = () => window.pageYOffset;

const scrolled = up => () => {
  const scrollY = getScrollY();
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
  const heightDiff = $numberList.clientHeight - height;
  // Remove some numbers
  for (let i = 0; i < count; i++) {
    $numberList.removeChild(up ? $numberList.lastChild : $numberList.firstChild);
  };
  const scrollDiff = getScrollY() - scrollY;
  const scroll = heightDiff + scrollDiff;
  window.scrollBy(0, up ? scroll : -scroll);
};

const scrolledUp = scrolled(true);
const scrolledDown = scrolled(false);

window.addEventListener('scroll', e => {
  if (getScrollY() <= 0) { // Scrolled up
    scrolledUp();
  } else if (getScrollY() + window.innerHeight >= numberListHeight()) { // Scrolled down
    scrolledDown();
  }
});

window.addEventListener('resize', updateNumbers);
