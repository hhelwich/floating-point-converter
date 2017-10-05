import { onChange, getBits } from '../state'
import { inputWidth, centerInputs } from './inputs'

const $bits = document.getElementById('bits')

const setBitsWidth = width => {
  $bits.style.width = inputWidth(width)
  centerInputs()
}

const setBitsValue = value => {
  setBitsWidth(value.length)
  $bits.value = value
}

$bits.addEventListener('input', ({ target: { value } }) => {
  setBits(value)
}, false)

$bits.addEventListener('keydown', ({ keyCode }) => {
  if (keyCode === 13) { // On Enter
    setBitsValue(getBits())
  }
}, false)

const { setBits } = onChange(() => {
  setBitsValue(getBits())
})
