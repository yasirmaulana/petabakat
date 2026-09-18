const MIN_SCORE = 0.5

export async function verifyRecaptcha(token: string, expectedAction?: string): Promise<void> {
  const config = useRuntimeConfig()
  const secretKey = config.recaptchaSecretKey as string | undefined

  // Skip verification jika secret key belum dikonfigurasi (dev mode)
  if (!secretKey) return

  if (!token) throw createError({ statusCode: 400, message: 'reCAPTCHA token diperlukan.' })

  const res = await $fetch<{
    success: boolean
    score: number
    action: string
    'error-codes'?: string[]
  }>('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: secretKey, response: token }).toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  if (!res.success || res.score < MIN_SCORE) {
    throw createError({ statusCode: 403, message: 'Verifikasi keamanan gagal. Coba lagi.' })
  }

  if (expectedAction && res.action !== expectedAction) {
    throw createError({ statusCode: 403, message: 'Verifikasi keamanan tidak valid.' })
  }
}
