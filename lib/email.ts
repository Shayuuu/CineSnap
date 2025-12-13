import nodemailer from 'nodemailer'

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

type EmailOptions = {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  // Skip email sending if SMTP is not configured (for development)
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log('📧 Email not sent (SMTP not configured):', { to, subject })
    return { success: true, skipped: true }
  }

  try {
    const info = await transporter.sendMail({
      from: `"CineSnap" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })
    console.log('📧 Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('📧 Email error:', error)
    return { success: false, error }
  }
}

// Email templates
export function getBookingConfirmationEmail(data: {
  userName: string
  movieTitle: string
  theaterName: string
  screenName: string
  showtime: string
  seats: string[]
  totalAmount: number
  bookingId: string
  ticketUrl: string
}) {
  return {
    subject: `Booking Confirmed: ${data.movieTitle} - CineSnap`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎬 Booking Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Your booking has been confirmed! Here are the details:</p>
              
              <div class="ticket-info">
                <h2>${data.movieTitle}</h2>
                <p><strong>Theater:</strong> ${data.theaterName} - ${data.screenName}</p>
                <p><strong>Showtime:</strong> ${new Date(data.showtime).toLocaleString('en-IN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
                <p><strong>Seats:</strong> ${data.seats.join(', ')}</p>
                <p><strong>Total Amount:</strong> ₹${(data.totalAmount / 100).toFixed(2)}</p>
                <p><strong>Booking ID:</strong> ${data.bookingId.slice(0, 8)}</p>
              </div>

              <a href="${data.ticketUrl}" class="button">View Ticket</a>
              
              <p style="margin-top: 30px;">We look forward to seeing you at the theater!</p>
              <p>Enjoy your movie! 🍿</p>
            </div>
            <div class="footer">
              <p>CineSnap - Your Cinema Experience</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}

export function getCancellationEmail(data: {
  userName: string
  movieTitle: string
  refundAmount: number
  walletBalance: number
}) {
  return {
    subject: `Booking Cancelled: ${data.movieTitle} - CineSnap`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .refund-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Booking Cancelled</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Your booking for <strong>${data.movieTitle}</strong> has been cancelled.</p>
              
              <div class="refund-info">
                <h3>Refund Details</h3>
                <p><strong>Refund Amount:</strong> ₹${(data.refundAmount / 100).toFixed(2)}</p>
                <p><strong>Current Wallet Balance:</strong> ₹${(data.walletBalance / 100).toFixed(2)}</p>
                <p style="margin-top: 15px; color: #666; font-size: 14px;">
                  The refund has been added to your wallet. You can use it for your next booking!
                </p>
              </div>

              <p>If you have any questions, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>CineSnap - Your Cinema Experience</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}

export function getReminderEmail(data: {
  userName: string
  movieTitle: string
  theaterName: string
  screenName: string
  showtime: string
  seats: string[]
  ticketUrl: string
}) {
  return {
    subject: `Reminder: Your movie starts in 2 hours - ${data.movieTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reminder-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #4facfe; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Showtime Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Just a friendly reminder that your movie starts in <strong>2 hours</strong>!</p>
              
              <div class="reminder-info">
                <h2>${data.movieTitle}</h2>
                <p><strong>Theater:</strong> ${data.theaterName} - ${data.screenName}</p>
                <p><strong>Showtime:</strong> ${new Date(data.showtime).toLocaleString('en-IN', { 
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
                <p><strong>Seats:</strong> ${data.seats.join(', ')}</p>
              </div>

              <a href="${data.ticketUrl}" class="button">View Ticket</a>
              
              <p style="margin-top: 30px;">Don't forget to arrive early! 🍿</p>
            </div>
            <div class="footer">
              <p>CineSnap - Your Cinema Experience</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}

