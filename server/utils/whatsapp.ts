interface SendWhatsAppOptions {
  target: string
  message: string
}

export async function sendWhatsAppMessage(options: SendWhatsAppOptions): Promise<any> {
  const config = useRuntimeConfig()

  if (!config.whatsappApiUrl || !config.whatsappFonnteToken) {
    throw new Error('WhatsApp API URL or token not configured')
  }

  return $fetch(config.whatsappApiUrl, {
    method: 'POST',
    headers: { Authorization: config.whatsappFonnteToken },
    body: {
      target: options.target,
      message: options.message,
    },
  })
}
