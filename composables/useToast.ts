export interface Toast {
  id: number
  name: string
  initials: string
  activity: string
  time: string
  color: string
}

const toasts = ref<Toast[]>([])
let idCounter = 0

const COLORS = ['#4f86c6', '#5ba88a', '#8b6cbf', '#c4744e', '#c46f6f']

function makeInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function pickColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff
  return COLORS[h % COLORS.length]
}

export function useToast() {
  function add(opts: { name: string; activity: string; time?: string }, duration = 5000) {
    // clear semua toast lama dulu — hanya satu yang tampil sekaligus
    toasts.value = []
    const id = ++idCounter
    toasts.value.push({
      id,
      name: opts.name,
      initials: makeInitials(opts.name),
      activity: opts.activity,
      time: opts.time ?? 'baru saja',
      color: pickColor(opts.name),
    })
    setTimeout(() => remove(id), duration)
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts: readonly(toasts), add, remove }
}
