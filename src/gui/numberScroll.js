import { toFloatStr, fromFloatStr, nextFloat, prevFloat, evalFloatStr, toPosition } from '../float'
import { onChange } from '../state'

// Get dom elemenst
const $numberList = document.getElementById('number-list')
$numberList.innerHTML = '' // Assure no child nodes
const $totalPosition = document.getElementById('number-total-position')
const ctx = $totalPosition.getContext('2d')

// Is called when the browser window is resized
let resizedWindow = () => {}

// Update resizedWindow environment
const updateResizedWindow = (f64, bytes, position) => {
  resizedWindow = () => {
    updateNumbers(f64, bytes)
    updateCanvasSize()
    updateTotalPosition(f64, bytes, position)
  }
}

// Returns the pixel height of the numbers list
const numberListHeight = () => $numberList.clientHeight + $numberList.offsetTop

// CSS class for the currently selected number
const classSelected = 'selected'

const selectNumber = $number => {
  const $numbers = $numberList.childNodes
  for (let i = 0; i < $numbers.length; i++) {
    $numbers[i].classList.remove(classSelected)
  }
  $number.classList.add(classSelected)
}

// Is called when a number in the list is clicked on
const clickOnNumber = ({ target: $number }) => {
  selectNumber($number)
  set({ fStr: $number.textContent })
}

// Returns a new DOM number element
const createNumberElement = (floatStr, selected) => {
  let div = document.createElement('div')
  div.innerHTML = `<div class="number${selected ? ` ${classSelected}` : ''}">${floatStr}</div>`
  div = div.childNodes[0]
  div.addEventListener('click', clickOnNumber, false)
  return div
}

const getScrollY = () => window.pageYOffset

const scrolled = (up, bytes, f64) => () => {
  const scrollY = getScrollY()
  const height = $numberList.clientHeight // Height of number
  const nbrs = $numberList.childNodes
  const count = Math.round(nbrs.length * 0.25) // Count of numbers to add/remove
  let float = fromFloatStr(f64)((up ? $numberList.firstChild : $numberList.lastChild).textContent)
  const fStrSel = toFloatStr(f64)(bytes)
  // Add some numbers
  for (let i = 0; i < count; i++) {
    float = (up ? nextFloat : prevFloat)(float)
    const fStr = toFloatStr(f64)(float)
    const nbrEl = createNumberElement(fStr, fStrSel === fStr)
    if (up) {
      $numberList.insertBefore(nbrEl, $numberList.firstChild)
    } else {
      $numberList.appendChild(nbrEl)
    }
  }
  const heightDiff = $numberList.clientHeight - height
  // Remove some numbers
  for (let i = 0; i < count; i++) {
    $numberList.removeChild(up ? $numberList.lastChild : $numberList.firstChild)
  }
  const scrollDiff = getScrollY() - scrollY
  const scroll = heightDiff + scrollDiff
  window.scrollBy(0, up ? scroll : -scroll)
}

let scrolledUp = () => {}
let scrolledDown = scrolledUp

// Update the scrolledUp/scrolledDown functions on state change
const updateScrolled = (bytes, f64) => {
  scrolledUp = scrolled(true, bytes, f64)
  scrolledDown = scrolled(false, bytes, f64)
}

// Adapts the canvas to the browser window size. Called initially and when window is resized
const updateCanvasSize = () => {
  const { clientHeight, clientWidth } = $totalPosition
  $totalPosition.width = clientWidth
  $totalPosition.height = clientHeight
}

updateCanvasSize()

// Update number list. Is called on state change.
const updateNumbers = (f64, bytes) => {
  // Assure there are enough number elments
  while ($numberList.clientHeight < window.innerHeight * 2) {
    $numberList.appendChild(createNumberElement('0'))
  }
  // Set content
  window.scrollTo(0, Math.floor((numberListHeight() - window.innerHeight) / 2)) // Scroll to center of numbers
  const $numbers = $numberList.childNodes
  const centerIdx = Math.floor($numbers.length / 2)
  const fStr = toFloatStr(f64)(bytes)
  $numbers[centerIdx].textContent = fStr
  $numbers[centerIdx].classList.add(classSelected)
  let nbs = bytes
  for (let i = centerIdx + 1; i < $numbers.length; i++) {
    nbs = prevFloat(nbs)
    $numbers[i].textContent = toFloatStr(f64)(nbs)
    $numbers[i].classList.remove(classSelected)
  }
  nbs = bytes
  for (let i = centerIdx - 1; i >= 0; i--) {
    nbs = nextFloat(nbs)
    $numbers[i].textContent = toFloatStr(f64)(nbs)
    $numbers[i].classList.remove(classSelected)
  }
}

const updateTotalPosition = (() => {
  let lastPHeight
  return (f64, bytes, position) => {
    const { width, height } = $totalPosition
    const pHeight = Math.round((height - 1) * (1 - position))
    if (pHeight !== lastPHeight) {
      ctx.clearRect(0, 0, width, height)
      // ctx.strokeStyle = '#000000'
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(width - 1, pHeight)
      ctx.lineTo(0, height - 1)
      ctx.stroke()
      lastPHeight = pHeight
    }
  }
})()

const set = onChange(state => { // On state change
  // Prepare state
  const { fStr, f64 } = state
  const floatStr = evalFloatStr(f64)(fStr)
  const bytes = fromFloatStr(f64)(floatStr)
  const posititon = toPosition(f64)(bytes)
  // Udate closure environments
  updateScrolled(bytes, f64)
  updateResizedWindow(f64, bytes, posititon)
  // Update numbers list and position canvas
  updateNumbers(f64, bytes)
  updateTotalPosition(f64, bytes, posititon)
})

window.addEventListener('resize', () => resizedWindow(), false)

window.addEventListener('scroll', () => {
  if (getScrollY() <= 0) { // Scrolled up
    scrolledUp()
  } else if (getScrollY() + window.innerHeight >= numberListHeight()) { // Scrolled down
    scrolledDown()
  }
}, false)
