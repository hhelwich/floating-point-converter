import { onChange } from '../state'

const $bitCount = document.querySelectorAll('input[type=radio]') // Assume 32-bit radio comes first

const { setF64 } = onChange(({ f64 }) => {
  $bitCount[+f64].checked = true
})

// Add event listeners
Array.prototype.slice.call($bitCount).forEach((r, i) => {
  r.addEventListener('change', () => { setF64(!!i) }, false)
})
