// Width of a single number character
export const numberCharWidth = (() => {
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

export const somePxls = 28
