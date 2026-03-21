export function buildResetEmail({ logoUrl, resetLink, siteName = 'INCES', userName = 'Usuario' }){
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,Helvetica,sans-serif;background-color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden;">
          <!-- Header with logo -->
          <tr>
            <td style="background:linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);padding:30px;text-align:center;">
              <img src="${logoUrl}" alt="${siteName}" style="max-width:180px;height:auto;display:inline-block;"/>
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td style="padding:40px 30px;">
              <h1 style="color:#1a1a2e;font-size:24px;font-weight:600;margin:0 0 20px 0;text-align:center;">
                Restablecer contraseña
              </h1>
              
              <p style="color:#4a4a4a;font-size:16px;line-height:1.6;margin:0 0 20px 0;">
                Hola <strong>${userName}</strong>,
              </p>
              
              <p style="color:#4a4a4a;font-size:16px;line-height:1.6;margin:0 0 30px 0;">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>${siteName}</strong>. 
                Haz clic en el botón de abajo para crear una nueva contraseña.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg, #e94560 0%, #c72c41 100%);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:8px;font-size:16px;font-weight:600;box-shadow:0 4px 12px rgba(233,69,96,0.3);">
                      Restablecer mi contraseña
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color:#888888;font-size:14px;line-height:1.6;margin:30px 0 0 0;text-align:center;">
                Si no solicitaste este cambio, puedes ignorar este correo de manera segura. Tu contraseña actual seguirá siendo válida.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f9fa;padding:20px 30px;text-align:center;border-top:1px solid #eeeeee;">
              <p style="color:#999999;font-size:12px;margin:0;">
                Este correo fue enviado automáticamente por <strong>${siteName}</strong>. Por favor no respondas a este mensaje.
              </p>
              <p style="color:#cccccc;font-size:11px;margin:10px 0 0 0;">
                © ${new Date().getFullYear()} Instituto Nacional de Capacitación y Educación Socialista - INCES
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Fallback link -->
        <p style="color:#999999;font-size:12px;margin:20px 0 0 0;text-align:center;">
          Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
          <a href="${resetLink}" style="color:#e94560;">${resetLink}</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export function buildWelcomeEmail({ logoUrl, userName, email, password, enrollment, siteName = 'INCES' }){
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,Helvetica,sans-serif;background-color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden;">
          <!-- Header with logo -->
          <tr>
            <td style="background:linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);padding:30px;text-align:center;">
              <img src="${logoUrl}" alt="${siteName}" style="max-width:180px;height:auto;display:inline-block;"/>
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td style="padding:40px 30px;">
              <h1 style="color:#1a1a2e;font-size:24px;font-weight:600;margin:0 0 20px 0;text-align:center;">
                ¡Bienvenido al INCES!
              </h1>
              
              <p style="color:#4a4a4a;font-size:16px;line-height:1.6;margin:0 0 20px 0;">
                Hola <strong>${userName}</strong>,
              </p>
              
              <p style="color:#4a4a4a;font-size:16px;line-height:1.6;margin:0 0 30px 0;">
                Tu cuenta ha sido creada exitosamente en <strong>${siteName}</strong>. 
                A continuación encontrarás tus credenciales de acceso:
              </p>
              
              <!-- Credentials Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:8px;border:1px solid #e9ecef;margin:20px 0;">
                <tr>
                  <td style="padding:20px;">
                    <p style="color:#4a4a4a;font-size:14px;margin:0 0 10px 0;">
                      <strong>Correo electrónico:</strong><br/>
                      <span style="color:#1a1a2e;font-size:16px;">${email}</span>
                    </p>
                    <p style="color:#4a4a4a;font-size:14px;margin:0 0 10px 0;">
                      <strong>Contraseña temporal:</strong><br/>
                      <span style="color:#1a1a2e;font-size:16px;font-family:monospace;background-color:#e9ecef;padding:4px 8px;border-radius:4px;">${password}</span>
                    </p>
                    <p style="color:#4a4a4a;font-size:14px;margin:0;">
                      <strong>Tu matrícula:</strong><br/>
                      <span style="color:#e94560;font-size:18px;font-weight:bold;">${enrollment}</span>
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="color:#e94560;font-size:14px;line-height:1.6;margin:0 0 20px 0;text-align:center;">
                <strong>Importante:</strong> Changea tu contraseña en tu primer inicio de sesión.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${logoUrl.replace('/assets/inces-logo.png', '')}" style="display:inline-block;background:linear-gradient(135deg, #e94560 0%, #c72c41 100%);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:8px;font-size:16px;font-weight:600;box-shadow:0 4px 12px rgba(233,69,96,0.3);">
                      Iniciar sesión
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color:#888888;font-size:14px;line-height:1.6;margin:30px 0 0 0;text-align:center;">
                Guarda tu matrícula <strong>${enrollment}</strong> - la necesitarás para identificarte en el sistema.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f9fa;padding:20px 30px;text-align:center;border-top:1px solid #eeeeee;">
              <p style="color:#999999;font-size:12px;margin:0;">
                Este correo fue enviado automáticamente por <strong>${siteName}</strong>. Por favor no respondas a este mensaje.
              </p>
              <p style="color:#cccccc;font-size:11px;margin:10px 0 0 0;">
                © ${new Date().getFullYear()} Instituto Nacional de Capacitación y Educación Socialista - INCES
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
