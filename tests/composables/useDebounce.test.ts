import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useDebounce } from '../../composables/useDebounce'

afterEach(() => vi.useRealTimers())

describe('useDebounce', () => {
  it('hanya menerapkan nilai terakhir setelah delay', async () => {
    vi.useFakeTimers()
    const source = ref('a')
    const debounced = useDebounce(source, 300)
    expect(debounced.value).toBe('a')

    source.value = 'b'
    await nextTick()
    vi.advanceTimersByTime(200)
    source.value = 'c'
    await nextTick()
    vi.advanceTimersByTime(299)
    expect(debounced.value).toBe('a')

    vi.advanceTimersByTime(1)
    expect(debounced.value).toBe('c')
  })
})
