import { littleEndian, toBitsStr, fromBitsStr, toFloatStr, fromFloatStr, evalFloatStr } from './float'
import { onChange } from './state'
import './numberScroll'
import './history'

const $bits = document.getElementById('bits')
const $float = document.getElementById('float')
const $byteOrder = document.getElementById('byte-order')
const $bitCount = document.querySelectorAll('input[type=radio]') // Assume 32-bit radio comes first

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

const setFloatValue = floatStr => { $float.value = floatStr }

const setFloatOrJs = floatStrOrJs => { set({ fStr: floatStrOrJs }) }

let applyFloat = () => {}

const updateApplyFloat = f64 => {
  applyFloat = (floatStrOrJs) => {
    const floatStr = evalFloatStr(f64)(floatStrOrJs)
    set({ fStr: floatStr })
  }
}

// Width of a single number character
const numberCharWidth = (() => {
  const { body } = document
  const div = document.createElement('div')
  const numberCount = 128
  div.classList.add('number')
  div.style.display = 'inline'
  div.textContent = Array(numberCount).join('0')
  body.appendChild(div)
  const { offsetWidth } = div
  body.removeChild(div)
  return offsetWidth / numberCount
})()

// Add event listeners
Array.prototype.slice.call($bitCount).forEach((r, i) => {
  r.addEventListener('change', () => { set({ f64: !!i }) }, false)
})
$float.addEventListener('input', e => { setFloatOrJs(e.target.value) }, false)
$float.addEventListener('keydown', e => {
  if (e.keyCode === 13) { // On Enter
    applyFloat(e.target.value)
  }
}, false)
$bits.addEventListener('input', e => { changeBits(e.target.value) }, false)
$bits.addEventListener('keydown', e => {
  if (e.keyCode === 13) { // On Enter
    changeBits(e.target.value)
  }
}, false)

const centerInputs = () => {
  const $inputs = document.getElementById('inputs')
  $inputs.style.marginLeft = `-${Math.round($inputs.offsetWidth / 2)}px`
  $inputs.style.marginTop = `-${Math.round($inputs.offsetHeight / 2)}px`
  $inputs.style.left = $inputs.style.top = '50%'
}

const somePxls = 28
const floatCharWidth = 32

const setFloatWidth = () => {
  $float.style.width = `${Math.round(numberCharWidth * floatCharWidth) + somePxls}px`
}

const setBitsWidth = f64 => {
  $bits.style.width = `${Math.round(numberCharWidth * (f64 ? 64 : 32)) + somePxls}px`
}
const set = onChange(state => { // On state change
  const { fStr, f64 } = state
  const floatStr = evalFloatStr(f64)(fStr)
  const bytes = fromFloatStr(f64)(floatStr)
  updateChangeBits(f64)
  updateApplyFloat(f64)
  setFloatValue(fStr)
  $bits.value = toBitsStr(bytes)
  $bitCount[+f64].checked = true
  // Adapt input element sizes and positions
  setFloatWidth()
  setBitsWidth(f64)
  centerInputs()
})
