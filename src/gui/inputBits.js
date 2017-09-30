import { onChange, getBits } from '../state'
import { numberCharWidth, centerInputs } from './inputs'
import { somePxls } from '../config'

const $bits = document.getElementById('bits')

const setBitsWidth = width => {
  $bits.style.width = `${Math.round(numberCharWidth * width + somePxls)}px`
  centerInputs()
}

const setBitsValue = value => {
  setBitsWidth(value.length)
  $bits.value = value
}

$bits.addEventListener('input', ({ target: { value } }) => {
  setBits(value)
}, false)

$bits.addEventListener('keydown', ({ keyCode, target: { value } }) => {
  if (keyCode === 13) { // On Enter
    setBitsValue(getBits())
  }
}, false)

const { setBits } = onChange(({ bits }) => {
  setBitsValue(bits)
})
