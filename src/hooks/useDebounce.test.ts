import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('a', 250))
    expect(result.current).toBe('a')
  })

  it('updates after delay elapses', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 250), {
      initialProps: { value: 'a' },
    })
    rerender({ value: 'b' })
    expect(result.current).toBe('a')
    act(() => {
      vi.advanceTimersByTime(250)
    })
    expect(result.current).toBe('b')
  })

  it('cancels previous timer on rapid changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 250), {
      initialProps: { value: 'a' },
    })
    rerender({ value: 'b' })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    rerender({ value: 'c' })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBe('a')
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe('c')
  })
})
