import {
  littleEndian, toBitsStr, fromNumber, fromBitsStr, toFloatStr, fromFloatStr, nextFloat, prevFloat, evalFloatStr
} from './float'
import state from './state'

const $bits = document.getElementById('bits')
const $float = document.getElementById('float')
const $numberList = document.getElementById('number-list')
$numberList.innerHTML = '' // Assure no child nodes
const $byteOrder = document.getElementById('byte-order')
const $bitCount = document.querySelectorAll('input[type=radio]') // Assume 32-bit radio comes first

const numberListHeight = () => $numberList.clientHeight + $numberList.offsetTop

let changeBits = () => {}

const updateChangeBits = (f64) => {
  changeBits = bitsStr => {
    if (bitsStr.length !== (f64 ? 8 : 4) * 8) {
      // Assure correct length and fill with trailing zeros if neccesary
      bitsStr = bitsStr.concat(Array(65).join('0')).slice(0, (f64 ? 8 : 4) * 8)
    }
    set({ fStr: toFloatStr(f64)(fromBitsStr(bitsStr)) })
  }
}

// Init dom state

$byteOrder.innerHTML = `${littleEndian ? 'little' : 'big'} endian`

const classSelected = 'selected'

const clickOnNumber = e => { set({ fStr: e.target.innerText }) }

const createNumberElement = (floatStr, selected) => {
  let div = document.createElement('div')
  div.innerHTML = `<div class="number${selected ? ` ${classSelected}` : ''}">${floatStr}</div>`
  div = div.childNodes[0]
  div.addEventListener('click', clickOnNumber)
  return div
}

const updateNumbers = (f64, bytes) => {
  // Assure there are enough number elments
  while ($numberList.clientHeight < window.innerHeight * 2) {
    $numberList.appendChild(createNumberElement('0'))
  }
  // Set content
  window.scrollTo(0, Math.floor((numberListHeight() - window.innerHeight) / 2)) // Scroll to center of numbers
  const $numbers = $numberList.childNodes
  const centerIdx = Math.floor($numbers.length / 2)
  const fStr = toFloatStr(f64)(bytes)
  $numbers[centerIdx].innerText = fStr
  $numbers[centerIdx].classList.add(classSelected)
  let nbs = bytes
  for (let i = centerIdx + 1; i < $numbers.length; i++) {
    nbs = prevFloat(nbs)
    $numbers[i].innerText = toFloatStr(f64)(nbs)
    $numbers[i].classList.remove(classSelected)
  }
  nbs = bytes
  for (let i = centerIdx - 1; i >= 0; i--) {
    nbs = nextFloat(nbs)
    $numbers[i].innerText = toFloatStr(f64)(nbs)
    $numbers[i].classList.remove(classSelected)
  }
}

const setFloatValue = (() => {
  let previousf64
  let previousEvaledFloatStr
  return (f64, floatStr, evaledFloatStr) => {
    if ($float.value !== floatStr) {
      $float.value = floatStr
    } else if (previousf64 && !f64 && previousEvaledFloatStr !== evaledFloatStr) {
      $float.value = evaledFloatStr
    }
    previousf64 = f64
    previousEvaledFloatStr = evaledFloatStr
  }
})()

const setFloatOrJs = floatStrOrJs => {
  set({ fStr: floatStrOrJs })
}

let applyFloat = () => {}

const updateApplyFloat = f64 => {
  applyFloat = (floatStrOrJs) => {
    const floatStr = evalFloatStr(f64)(floatStrOrJs)
    set({ fStr: floatStr })
  }
}

// Add event listeners
Array.prototype.slice.call($bitCount).forEach((r, i) => {
  r.addEventListener('change', () => { set({ f64: !!i }) }, 0)
})
$float.addEventListener('input', e => { setFloatOrJs(e.target.value) })
$float.addEventListener('keydown', e => {
  if (e.keyCode === 13) { // On Enter
    applyFloat(e.target.value)
  }
})
$bits.addEventListener('input', e => { changeBits(e.target.value) })
$bits.addEventListener('keydown', e => {
  if (e.keyCode === 13) { // On Enter
    changeBits(e.target.value)
  }
})

const getScrollY = () => window.pageYOffset

const scrolled = (up, bytes, f64) => () => {
  const scrollY = getScrollY()
  const height = $numberList.clientHeight // Height of number
  const nbrs = $numberList.childNodes
  const count = Math.round(nbrs.length * 0.25) // Count of numbers to add/remove
  let float = fromFloatStr(f64)((up ? $numberList.firstChild : $numberList.lastChild).innerText)
  const fStrSel = toFloatStr(f64)(bytes)
  // Add some numbers
  for (let i = 0; i < count; i++) {
    float = (up ? nextFloat : prevFloat)(float)
    const fStr = toFloatStr(f64)(float)
    const nbrEl = createNumberElement(fStr, fStrSel === fStr)
    if (up) {
      $numberList.insertBefore(nbrEl, $numberList.firstChild)
    } else {
      $numberList.appendChild(nbrEl)
    }
  }
  const heightDiff = $numberList.clientHeight - height
  // Remove some numbers
  for (let i = 0; i < count; i++) {
    $numberList.removeChild(up ? $numberList.lastChild : $numberList.firstChild)
  }
  const scrollDiff = getScrollY() - scrollY
  const scroll = heightDiff + scrollDiff
  window.scrollBy(0, up ? scroll : -scroll)
}

let scrolledUp = () => {}
let scrolledDown = scrolledUp

const updateScrolled = (bytes, f64) => {
  scrolledUp = scrolled(true, bytes, f64)
  scrolledDown = scrolled(false, bytes, f64)
}

window.addEventListener('scroll', () => {
  if (getScrollY() <= 0) { // Scrolled up
    scrolledUp()
  } else if (getScrollY() + window.innerHeight >= numberListHeight()) { // Scrolled down
    scrolledDown()
  }
})

let resizedWindow = () => {}

const updateResizedWindow = (f64, bytes) => {
  resizedWindow = () => updateNumbers(f64, bytes)
}

window.addEventListener('resize', () => resizedWindow())

;(() => { // Apply styling
  // Center inputs
  const $inputs = document.getElementById('inputs')
  $inputs.style.marginLeft = `-${Math.round($inputs.offsetWidth / 2)}px`
  $inputs.style.marginTop = `-${Math.round($inputs.offsetHeight / 2)}px`
  $inputs.style.left = $inputs.style.top = '50%'
})()

const set = state(({ fStr, f64 }) => { // On state change
  const floatStr = evalFloatStr(f64)(fStr)
  const bytes = fromFloatStr(f64)(floatStr)
  updateChangeBits(f64)
  updateApplyFloat(f64)
  updateScrolled(bytes, f64)
  updateResizedWindow(f64, bytes)
  setFloatValue(f64, fStr, floatStr)
  $bits.value = toBitsStr(bytes)
  $bitCount[+f64].checked = true
  updateNumbers(f64, bytes)
})

set({ fStr: toFloatStr(true)(fromNumber(true)(Math.PI)), f64: true })
