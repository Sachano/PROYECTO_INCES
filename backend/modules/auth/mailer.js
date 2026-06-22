let nodemailer = null
let transporter = null
let testAccount = null

async function getTransporter(){
  if(transporter) return transporter

  nodemailer = await import('nodemailer')

  const SMTP_HOST = process.env.SMTP_HOST || ''
  const SMTP_USER = process.env.SMTP_USER || ''

  if(SMTP_HOST && SMTP_USER){
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: SMTP_USER, pass: process.env.SMTP_PASS || '' }
    })
  }else{
    testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass }
    })
  }
  return transporter
}

export async function sendEmail({ to, subject, text, html }){
  try{
    const t = await getTransporter()
    const EMAIL_FROM = process.env.EMAIL_FROM || 'INCES <no-reply@inces.local>'
    const info = await t.sendMail({ from: EMAIL_FROM, to, subject, text, html })
    if(nodemailer && nodemailer.getTestMessageUrl){
      const preview = nodemailer.getTestMessageUrl(info)
      if(preview) console.log('Email preview:', preview)
    }
    return { ok: true, messageId: info.messageId }
  }catch(err){
    console.error('Failed to send email:', err)
    return { ok: false, error: err.message }
  }
}
