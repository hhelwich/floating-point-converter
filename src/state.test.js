import { state, equals } from './state'

describe('set', () => {
  it('notifies change handler', () => {
    // GIVEN Initial state
    let newState
    const set = state(state => { newState = state })
    set({ fStr: '42', f64: true })
    // WHEN New state is set
    set({ fStr: '0', f64: false })
    // THEN Change handler has been called with the new state
    expect(newState).toEqual({ fStr: '0', f64: false })
  })

  it('only updates given properties', () => {
    // GIVEN Initial state
    let newState
    const set = state(state => { newState = state })
    set({ fStr: '0', f64: true })
    // WHEN Only one property is set
    set({ fStr: '1' })
    // THEN Only the given property is changed
    expect(newState).toEqual({ fStr: '1', f64: true })
  })

  it('does not emit change event when properties are not changed', () => {
    // GIVEN Initial state
    let changeHandlerCalled
    const set = state(() => { changeHandlerCalled = true })
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
    const set = state(state => states.push(state))
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
})

describe('equals', () => {
  it('returns true for equal states', () => {
    expect(equals({ fStr: 'foo', f64: true }, { fStr: 'foo', f64: true })).toBe(true)
    expect(equals({ fStr: 'foo', f64: false }, { fStr: 'foo', f64: false })).toBe(true)
  })
  it('returns false for not equal states', () => {
    expect(equals({ fStr: 'foo', f64: true }, { fStr: 'bar', f64: true })).toBe(false)
    expect(equals({ fStr: 'foo', f64: true }, { fStr: 'foo', f64: false })).toBe(false)
    expect(equals({ fStr: 'bar', f64: false }, { fStr: 'foo', f64: true })).toBe(false)
  })
  it('throws if at least one of the states is null or undefined', () => {
    expect(() => { equals(null, { fStr: 'foo', f64: true }) }).toThrow()
    expect(() => { equals(undefined, { fStr: 'foo', f64: true }) }).toThrow()
    expect(() => { equals({ fStr: 'foo', f64: true }, null) }).toThrow()
    expect(() => { equals({ fStr: 'foo', f64: true }, undefined) }).toThrow()
    expect(() => { equals(undefined, undefined) }).toThrow()
    expect(() => { equals(undefined, null) }).toThrow()
    expect(() => { equals(null, undefined) }).toThrow()
    expect(() => { equals(null, null) }).toThrow()
  })
})
