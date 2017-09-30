import { onChange } from '../state'
import { numberCharWidth } from './inputs'
import { floatCharWidth, somePxls } from '../config'

const $float = document.getElementById('float')

$float.style.width = `${Math.round(numberCharWidth * floatCharWidth + somePxls)}px`

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

const { setInput, evalInput } = onChange(({ input }) => {
  setInputValue(input)
})
