import { onChange, reset } from './state'

describe('set', () => {
  beforeEach(reset)

  it('notifies change handler', () => {
    // GIVEN Initial state
    let newState
    const set = onChange(() => {})
    onChange(state => { newState = state })
    set({ fStr: '42', f64: true })
    // WHEN New state is set
    set({ fStr: '0', f64: false })
    // THEN Change handler has been called with the new state
    expect(newState).toEqual({ fStr: '0', f64: false })
  })

  it('only updates given properties', () => {
    // GIVEN Initial state
    let newState
    const set = onChange(() => {})
    onChange(state => { newState = state })
    set({ fStr: '0', f64: true })
    // WHEN Only one property is set
    set({ fStr: '1' })
    // THEN Only the given property is changed
    expect(newState).toEqual({ fStr: '1', f64: true })
  })

  it('does not emit change event when properties are not changed', () => {
    // GIVEN Initial state
    let changeHandlerCalled
    const set = onChange(() => {})
    onChange(() => { changeHandlerCalled = true })
    set({ fStr: '0', f64: true })
    changeHandlerCalled = false
    // WHEN Properties are set with the same value
    set({ fStr: '0' })
    set({ f64: true })
    set({})
    set({ fStr: '0', f64: true })
    // THEN Change handler is not called
    expect(changeHandlerCalled).toBe(false)
  })

  it('remembers state changes', () => {
    // GIVEN Initial state
    const states = []
    const set = onChange(() => {})
    onChange(state => states.push(state))
    set({ fStr: '0', f64: true })
    // WHEN Apply multiple state changes
    set({ fStr: '42' })
    set({ f64: false })
    set({ fStr: '1', f64: true })
    // THEN Emit applied states
    expect(states).toEqual([
      { fStr: '0', f64: true },
      { fStr: '42', f64: true },
      { fStr: '42', f64: false },
      { fStr: '1', f64: true }
    ])
  })

  it('does not notity state emitter', () => {
    // GIVEN Three state emitters
    const states = [[], [], []]
    const set = states.map((_, i) => onChange(state => { states[i].push(state) }))
    // WHEN Emitting state
    set[0]({ fStr: '1', f64: true })
    set[2]({ fStr: '2', f64: true })
    set[1]({ fStr: '3', f64: true })
    set[2]({ fStr: '4', f64: true })
    // THEN State source is not notified
    expect(states.map(statesi => statesi.map(state => +state.fStr))).toEqual([
      [2, 3, 4], [1, 2, 4], [1, 3]
    ])
  })
})
