declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

export function useRecaptcha() {
  const config = useRuntimeConfig()
  const siteKey = config.public.recaptchaSiteKey as string

  function loadScript() {
    if (!siteKey || document.getElementById('recaptcha-v3-script')) return
    const script = document.createElement('script')
    script.id = 'recaptcha-v3-script'
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    document.head.appendChild(script)
  }

  async function executeRecaptcha(action: string): Promise<string> {
    if (!siteKey) return ''
    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(siteKey, { action })
          resolve(token)
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  return { loadScript, executeRecaptcha }
}
