import { onChange, getInput, evalInput } from '../state'
import { inputWidth } from './inputs'
import { floatCharWidth } from '../config'

const $float = document.getElementById('float')

$float.style.width = inputWidth(floatCharWidth)

const setInputValue = input => {
  $float.value = input
}

$float.addEventListener('input', ({ target: { value } }) => {
  setInput(value)
}, false)

$float.addEventListener('keydown', ({ keyCode }) => {
  if (keyCode === 13) { // On Enter
    evalInput()
  }
}, false)

const { setInput } = onChange(() => {
  setInputValue(getInput())
})
