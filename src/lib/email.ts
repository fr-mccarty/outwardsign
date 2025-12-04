/**
 * Email utility using AWS SES
 */

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

// Initialize SES client
const sesClient = new SESClient({
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

/**
 * Send email via AWS SES
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  try {
    // Check if SES is configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.warn('AWS SES not configured - skipping email send')
      console.log('Missing AWS credentials:', {
        hasAccessKeyId: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretAccessKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      })
      return false
    }

    const fromEmail = process.env.FROM_EMAIL || process.env.AWS_SES_FROM_EMAIL || 'noreply@outwardsign.church'

    console.log('Attempting to send email via AWS SES:', {
      to,
      from: fromEmail,
      region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
      subject,
    })

    const command = new SendEmailCommand({
      Source: fromEmail,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: html,
            Charset: 'UTF-8',
          },
        },
      },
    })

    const result = await sesClient.send(command)
    console.log('✅ Email sent successfully via AWS SES:', {
      to,
      messageId: result.MessageId,
    })
    return true
  } catch (error) {
    console.error('❌ Error sending email via AWS SES:', error)
    console.error('Error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack,
    })
    return false
  }
}

/**
 * Send magic link email (bilingual)
 */
export async function sendMagicLinkEmail(
  email: string,
  magicLink: string,
  language: 'en' | 'es' = 'en'
): Promise<boolean> {
  console.log('📧 Preparing magic link email:', { email, language })

  const subject = language === 'es' ? 'Tu enlace de acceso - Outward Sign' : 'Your Access Link - Outward Sign'

  const html =
    language === 'es'
      ? `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Tu enlace de acceso</h2>
      <p>Haz clic en el siguiente enlace para acceder a tu portal ministerial:</p>
      <p style="margin: 20px 0;">
        <a href="${magicLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Acceder al portal
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">Este enlace expirará en 30 días.</p>
      <p style="color: #666; font-size: 14px;">Si no solicitaste este enlace, puedes ignorar este correo.</p>
    </div>
  `
      : `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your Access Link</h2>
      <p>Click the link below to access your ministry portal:</p>
      <p style="margin: 20px 0;">
        <a href="${magicLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Access Portal
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">This link will expire in 30 days.</p>
      <p style="color: #666; font-size: 14px;">If you didn't request this link, you can safely ignore this email.</p>
    </div>
  `

  const result = await sendEmail({ to: email, subject, html })
  console.log('📧 Magic link email send result:', { success: result, email })
  return result
}

/**
 * Send reminder email for upcoming commitment
 */
export async function sendCommitmentReminderEmail(
  email: string,
  commitment: {
    role: string
    date: string
    time: string
    location: string
  },
  language: 'en' | 'es' = 'en'
): Promise<boolean> {
  const subject =
    language === 'es'
      ? 'Recordatorio: Próximo compromiso ministerial'
      : 'Reminder: Upcoming Ministry Commitment'

  const html =
    language === 'es'
      ? `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Recordatorio de compromiso</h2>
      <p>Tienes un compromiso ministerial próximo:</p>
      <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Rol:</strong> ${commitment.role}</p>
        <p style="margin: 4px 0;"><strong>Fecha:</strong> ${commitment.date}</p>
        <p style="margin: 4px 0;"><strong>Hora:</strong> ${commitment.time}</p>
        <p style="margin: 4px 0;"><strong>Ubicación:</strong> ${commitment.location}</p>
      </div>
      <p>Gracias por tu servicio ministerial.</p>
    </div>
  `
      : `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Commitment Reminder</h2>
      <p>You have an upcoming ministry commitment:</p>
      <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Role:</strong> ${commitment.role}</p>
        <p style="margin: 4px 0;"><strong>Date:</strong> ${commitment.date}</p>
        <p style="margin: 4px 0;"><strong>Time:</strong> ${commitment.time}</p>
        <p style="margin: 4px 0;"><strong>Location:</strong> ${commitment.location}</p>
      </div>
      <p>Thank you for your ministry service.</p>
    </div>
  `

  return sendEmail({ to: email, subject, html })
}
