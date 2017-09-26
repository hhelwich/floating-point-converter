import { evalFloatStr } from '../float'
import { onChange } from '../state'
import { numberCharWidth, somePxls } from './inputCharWidth'

const $float = document.getElementById('float')

const setFloatValue = floatStr => { $float.value = floatStr }

const setFloatOrJs = floatStrOrJs => { set({ fStr: floatStrOrJs }) }

let applyFloat = () => {}

const updateApplyFloat = f64 => {
  applyFloat = (floatStrOrJs) => {
    const floatStr = evalFloatStr(f64)(floatStrOrJs)
    setFloatValue(floatStr)
    set({ fStr: floatStr })
  }
}

$float.addEventListener('input', e => { setFloatOrJs(e.target.value) }, false)
$float.addEventListener('keydown', e => {
  if (e.keyCode === 13) { // On Enter
    applyFloat(e.target.value)
  }
}, false)

const floatCharWidth = 32

const setFloatWidth = () => {
  $float.style.width = `${Math.round(numberCharWidth * floatCharWidth) + somePxls}px`
}

const set = onChange(state => {
  const { fStr, f64 } = state
  updateApplyFloat(f64)
  setFloatValue(fStr)
  setFloatWidth()
})
