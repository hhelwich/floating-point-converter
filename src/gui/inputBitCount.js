import { onChange, getF64 } from '../state'

const $bitCount = document.querySelectorAll('input[type=radio]') // Assume 32-bit radio comes first

const { setF64 } = onChange(() => {
  $bitCount[+getF64()].checked = true
})

// Add event listeners
;[0, 1].forEach(i => {
  $bitCount[i].addEventListener('change', () => { setF64(!!i) }, false)
})
