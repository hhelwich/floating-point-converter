
import { toBitsStr, fromBitsStr, toFloatStr, fromFloatStr, evalFloatStr } from '../float'
import { onChange } from '../state'
import { numberCharWidth, somePxls } from './inputCharWidth'

const $bits = document.getElementById('bits')

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

$bits.addEventListener('input', e => { changeBits(e.target.value) }, false)
$bits.addEventListener('keydown', e => {
  if (e.keyCode === 13) { // On Enter
    changeBits(e.target.value)
  }
}, false)

const setBitsWidth = f64 => {
  $bits.style.width = `${Math.round(numberCharWidth * (f64 ? 64 : 32)) + somePxls}px`
}

const centerInputs = () => {
  const $inputs = document.getElementById('inputs')
  $inputs.style.marginLeft = `-${Math.round($inputs.offsetWidth / 2)}px`
  $inputs.style.marginTop = `-${Math.round($inputs.offsetHeight / 2)}px`
  $inputs.style.left = $inputs.style.top = '50%'
}

const set = onChange(state => {
  const { fStr, f64 } = state
  const floatStr = evalFloatStr(f64)(fStr)
  const bytes = fromFloatStr(f64)(floatStr)
  updateChangeBits(f64)
  $bits.value = toBitsStr(bytes)
  setBitsWidth(f64)
  centerInputs()
})
