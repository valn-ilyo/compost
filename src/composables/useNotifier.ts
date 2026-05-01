import { ref } from 'vue'

interface NotificationOptions {
  message: string
  color?: 'success' | 'error' | 'info' | 'warning'
  timeout?: number
}

const isActive = ref(false)
const message = ref('')
const color = ref<'success' | 'error' | 'info' | 'warning'>('info')
const timeout = ref(3000)

const queue = ref<NotificationOptions[]>([])

function showNext() {
  if (queue.value.length === 0) {
    isActive.value = false
    return
  }

  const next = queue.value.shift()!
  message.value = next.message
  color.value = next.color ?? 'info'
  timeout.value = next.timeout ?? 3000
  isActive.value = true
}

export function useNotifier() {
  const notify = (options: NotificationOptions) => {
    if (isActive.value) {
      // A notification is already showing — enqueue
      queue.value.push(options)
    } else {
      message.value = options.message
      color.value = options.color ?? 'info'
      timeout.value = options.timeout ?? 3000
      isActive.value = true
    }
  }

  // Called by the snackbar component when it finishes closing
  const onClosed = () => {
    // Brief delay so the exit animation completes before the next one appears
    setTimeout(showNext, 300)
  }

  return {
    isActive,
    message,
    color,
    timeout,
    queue,
    notify,
    onClosed,
  }
}
