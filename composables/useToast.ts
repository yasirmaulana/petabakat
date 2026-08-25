export interface Toast {
  id: number
  message: string
}

const toasts = ref<Toast[]>([])
let idCounter = 0

export function useToast() {
  function add(message: string, duration = 3000) {
    const id = ++idCounter
    toasts.value.push({ id, message })
    setTimeout(() => remove(id), duration)
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts: readonly(toasts), add, remove }
}
