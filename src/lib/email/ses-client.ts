'use server'

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

// Initialize SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export interface EmailParams {
  to: string | string[]
  subject: string
  htmlBody: string
  textBody?: string
  from?: string
  replyTo?: string
}

export async function sendEmail({
  to,
  subject,
  htmlBody,
  textBody,
  from = process.env.AWS_SES_FROM_EMAIL || 'noreply@liturgy.faith',
  replyTo = process.env.AWS_SES_REPLY_TO_EMAIL,
}: EmailParams) {
  try {
    const toAddresses = Array.isArray(to) ? to : [to]

    console.log('[AWS SES] Preparing to send email:', {
      to: toAddresses,
      from,
      subject,
      replyTo: replyTo || '(none)',
      region: process.env.AWS_REGION || 'us-east-1',
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    })

    const params = {
      Destination: {
        ToAddresses: toAddresses,
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: htmlBody,
          },
          ...(textBody && {
            Text: {
              Charset: 'UTF-8',
              Data: textBody,
            },
          }),
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: from,
      ...(replyTo && {
        ReplyToAddresses: [replyTo],
      }),
    }

    const command = new SendEmailCommand(params)
    const response = await sesClient.send(command)
    
    return {
      success: true,
      messageId: response.MessageId,
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}

export async function sendParishInvitationEmail(
  email: string,
  parishName: string,
  inviterName: string,
  invitationLink: string
) {
  const subject = `You've been invited to join ${parishName} on Outward Sign`
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 30px 0;
            border-bottom: 1px solid #eee;
          }
          .content {
            padding: 30px 0;
          }
          .button {
            display: inline-block;
            background-color: #0070f3;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 500;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #0051cc;
          }
          .footer {
            padding-top: 30px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Outward Sign</h1>
        </div>
        <div class="content">
          <h2>You're invited to join ${parishName}</h2>
          <p>Hi there,</p>
          <p>${inviterName} has invited you to join <strong>${parishName}</strong> on Outward Sign, a platform for managing liturgical planning and parish activities.</p>
          <p>To accept this invitation and create your account, please click the button below:</p>
          <div style="text-align: center;">
            <a href="${invitationLink}" class="button">Accept Invitation</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #0070f3;">${invitationLink}</p>
          <p>This invitation link will expire in 7 days for security reasons.</p>
          <p>If you have any questions, please don't hesitate to reach out.</p>
          <p>Best regards,<br>The Outward Sign Team</p>
        </div>
        <div class="footer">
          <p>This email was sent to ${email} because someone invited you to join their parish on Outward Sign.</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
  `
  
  const textBody = `
You're invited to join ${parishName} on Outward Sign

Hi there,

${inviterName} has invited you to join ${parishName} on Outward Sign, a platform for managing liturgical planning and parish activities.

To accept this invitation and create your account, please visit:
${invitationLink}

This invitation link will expire in 7 days for security reasons.

If you have any questions, please don't hesitate to reach out.

Best regards,
The Outward Sign Team

---
This email was sent to ${email} because someone invited you to join their parish on Outward Sign.
If you didn't expect this invitation, you can safely ignore this email.
  `

  return sendEmail({
    to: email,
    subject,
    htmlBody,
    textBody,
  })
}