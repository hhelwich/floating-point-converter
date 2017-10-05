import { somePxls } from '../config'

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

export const inputWidth = charCount => `${Math.round(numberCharWidth * charCount + somePxls)}px`

export const centerInputs = () => {
  const $inputs = document.getElementById('inputs')
  $inputs.style.marginLeft = `-${Math.round($inputs.offsetWidth / 2)}px`
  $inputs.style.marginTop = `-${Math.round($inputs.offsetHeight / 2)}px`
  $inputs.style.left = $inputs.style.top = '50%'
}
