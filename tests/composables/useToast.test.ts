import { afterEach, describe, expect, it, vi } from 'vitest'
import { useToast } from '../../composables/useToast'

afterEach(() => vi.useRealTimers())

describe('useToast', () => {
  it('menampilkan satu toast saja dengan inisial, warna, dan waktu default', () => {
    vi.useFakeTimers()
    const { toasts, add } = useToast()
    add({ name: 'siti aminah zahra', activity: 'mengisi survey' })
    add({ name: 'Budi Santoso', activity: 'melihat hasil', time: '2 menit lalu' })

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({ name: 'Budi Santoso', initials: 'BS', time: '2 menit lalu' })
    expect(toasts.value[0].color).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('warna konsisten untuk nama yang sama', () => {
    vi.useFakeTimers()
    const { toasts, add } = useToast()
    add({ name: 'Ahmad', activity: 'x' })
    const first = toasts.value[0].color
    add({ name: 'Ahmad', activity: 'y' })
    expect(toasts.value[0].color).toBe(first)
  })

  it('toast hilang otomatis setelah durasi dan bisa dihapus manual', () => {
    vi.useFakeTimers()
    const { toasts, add, remove } = useToast()
    add({ name: 'Ani', activity: 'x' }, 1000)
    vi.advanceTimersByTime(1000)
    expect(toasts.value).toHaveLength(0)

    add({ name: 'Ani', activity: 'y' })
    remove(toasts.value[0].id)
    expect(toasts.value).toHaveLength(0)
  })
})
