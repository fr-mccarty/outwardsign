/**
 * SMS utility using Twilio
 * Install: npm install twilio
 */

interface SendSMSParams {
  to: string
  message: string
}

/**
 * Send SMS via Twilio
 */
export async function sendSMS({ to, message }: SendSMSParams): Promise<boolean> {
  try {
    // Check if Twilio is configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.warn('Twilio not configured - skipping SMS send')
      return false
    }

    // Dynamic import to avoid errors if package not installed
    const twilio = await import('twilio')
    const client = twilio.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    })

    return true
  } catch (error) {
    console.error('Error sending SMS:', error)
    return false
  }
}

/**
 * Send magic link SMS (bilingual)
 */
export async function sendMagicLinkSMS(
  phoneNumber: string,
  magicLink: string,
  language: 'en' | 'es' = 'en'
): Promise<boolean> {
  const message =
    language === 'es'
      ? `Tu enlace de acceso a Outward Sign: ${magicLink}\n\nExpira en 1 hora.`
      : `Your Outward Sign access link: ${magicLink}\n\nExpires in 1 hour.`

  return sendSMS({ to: phoneNumber, message })
}

/**
 * Send reminder SMS for upcoming commitment
 */
export async function sendCommitmentReminderSMS(
  phoneNumber: string,
  commitment: {
    role: string
    date: string
    time: string
    location: string
  },
  language: 'en' | 'es' = 'en'
): Promise<boolean> {
  const message =
    language === 'es'
      ? `Recordatorio: ${commitment.role} - ${commitment.date} a las ${commitment.time} en ${commitment.location}`
      : `Reminder: ${commitment.role} - ${commitment.date} at ${commitment.time} at ${commitment.location}`

  return sendSMS({ to: phoneNumber, message })
}
