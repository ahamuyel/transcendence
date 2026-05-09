import { Resend } from "resend"

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

let _resend: Resend | null = null
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set")
    }
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}
const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev"
const baseUrl = process.env.AUTH_URL || "http://localhost:3000"

function wrap(title: string, body: string) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;">
      <h2 style="color:#6366f1;margin-bottom:8px;">${title}</h2>
      ${body}
      <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;" />
      <p style="font-size:12px;color:#a1a1aa;">Cur10usX — Sistema de Gestão Escolar</p>
    </div>
  `
}

export async function sendApplicationConfirmation(to: string, name: string, trackingToken: string) {
  const statusUrl = `${baseUrl}/aplicacao/status?token=${trackingToken}`
  await getResend().emails.send({
    from,
    to,
    subject: "Solicitação recebida — Cur10usX",
    html: wrap(
      "Solicitação recebida!",
      `<p>Olá ${escapeHtml(name)},</p>
       <p>A sua solicitação foi recebida com sucesso. Acompanhe o estado pelo link abaixo:</p>
       <p><a href="${statusUrl}" style="color:#6366f1;font-weight:600;">Acompanhar a minha solicitação</a></p>
       <p>O seu código de acompanhamento: <strong>${escapeHtml(trackingToken)}</strong></p>`
    ),
  })
}

export async function sendApplicationApproved(to: string, name: string, schoolName: string) {
  await getResend().emails.send({
    from,
    to,
    subject: "Solicitação aprovada — Cur10usX",
    html: wrap(
      "Solicitação aprovada!",
      `<p>Olá ${escapeHtml(name)},</p>
       <p>A sua solicitação para <strong>${escapeHtml(schoolName)}</strong> foi aprovada!</p>
       <p>O próximo passo é aguardar a matrícula pela escola. Receberá um e-mail quando a sua conta estiver activa.</p>`
    ),
  })
}

export async function sendApplicationRejected(to: string, name: string, reason: string) {
  await getResend().emails.send({
    from,
    to,
    subject: "Solicitação não aprovada — Cur10usX",
    html: wrap(
      "Solicitação não aprovada",
      `<p>Olá ${escapeHtml(name)},</p>
       <p>Infelizmente a sua solicitação não foi aprovada.</p>
       <p><strong>Motivo:</strong> ${escapeHtml(reason)}</p>
       <p>Se tiver dúvidas, entre em contacto com a escola.</p>`
    ),
  })
}

export async function sendEnrollmentComplete(to: string, name: string, schoolName: string) {
  const loginUrl = `${baseUrl}/signin`
  await getResend().emails.send({
    from,
    to,
    subject: "Matrícula confirmada — Cur10usX",
    html: wrap(
      "Matrícula confirmada!",
      `<p>Olá ${escapeHtml(name)},</p>
       <p>A sua matrícula na <strong>${escapeHtml(schoolName)}</strong> foi confirmada! A sua conta está activa.</p>
       <p>Se já criou a sua palavra-passe, pode aceder à plataforma:</p>
       <p><a href="${loginUrl}" style="color:#6366f1;font-weight:600;">Aceder ao Cur10usX</a></p>
       <p>Caso ainda não tenha criado uma conta, registe-se com este mesmo e-mail (${to}).</p>`
    ),
  })
}

export async function sendSchoolApproved(to: string, schoolName: string) {
  await getResend().emails.send({
    from,
    to,
    subject: "Escola aprovada — Cur10usX",
    html: wrap(
      "Escola aprovada!",
      `<p>A escola <strong>${escapeHtml(schoolName)}</strong> foi aprovada na plataforma Cur10usX.</p>
       <p>O próximo passo é a activação pela equipa da plataforma. Receberá um e-mail quando a escola estiver activa.</p>`
    ),
  })
}

export async function sendSchoolActivated(to: string, schoolName: string, tempPassword: string) {
  const loginUrl = `${baseUrl}/signin`
  await getResend().emails.send({
    from,
    to,
    subject: "Escola activada — Cur10usX",
    html: wrap(
      "Escola activada!",
      `<p>A escola <strong>${escapeHtml(schoolName)}</strong> foi activada na plataforma Cur10usX!</p>
       <p>Uma conta de administrador foi criada para si. Use as seguintes credenciais para aceder:</p>
       <p><strong>E-mail:</strong> ${escapeHtml(to)}<br/><strong>Palavra-passe temporária:</strong> ${escapeHtml(tempPassword)}</p>
       <p><a href="${loginUrl}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Aceder ao Cur10usX</a></p>
       <p style="color:#71717a;font-size:13px;">Recomendamos que altere a sua palavra-passe após o primeiro acesso.</p>`
    ),
  })
}

export async function sendSchoolActivatedExistingAdmin(to: string, schoolName: string) {
  const loginUrl = `${baseUrl}/signin`
  await getResend().emails.send({
    from,
    to,
    subject: "Escola activada — Cur10usX",
    html: wrap(
      "Escola activada!",
      `<p>A escola <strong>${escapeHtml(schoolName)}</strong> foi activada na plataforma Cur10usX!</p>
       <p>Pode aceder à plataforma com as credenciais que usou no registo.</p>
       <p><a href="${loginUrl}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Aceder ao Cur10usX</a></p>`
    ),
  })
}

export async function sendTempCredentials(to: string, name: string, schoolName: string, tempPassword: string) {
  const loginUrl = `${baseUrl}/signin`
  await getResend().emails.send({
    from,
    to,
    subject: "Conta criada — Cur10usX",
    html: wrap(
      "A sua conta foi criada!",
      `<p>Olá ${escapeHtml(name)},</p>
       <p>Foi criada uma conta para si na escola <strong>${escapeHtml(schoolName)}</strong>.</p>
       <p>Use as seguintes credenciais para aceder:</p>
       <p><strong>E-mail:</strong> ${escapeHtml(to)}<br/><strong>Palavra-passe temporária:</strong> ${escapeHtml(tempPassword)}</p>
       <p><a href="${loginUrl}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Aceder ao Cur10usX</a></p>
       <p style="color:#71717a;font-size:13px;">Será obrigado a alterar a sua palavra-passe no primeiro acesso.</p>`
    ),
  })
}

export async function sendSchoolRejected(to: string, schoolName: string, reason: string) {
  await getResend().emails.send({
    from,
    to,
    subject: "Escola não aprovada — Cur10usX",
    html: wrap(
      "Escola não aprovada",
      `<p>Infelizmente a escola <strong>${escapeHtml(schoolName)}</strong> não foi aprovada na plataforma.</p>
       <p><strong>Motivo:</strong> ${escapeHtml(reason)}</p>
       <p>Se tiver dúvidas, entre em contacto connosco.</p>`
    ),
  })
}

export async function sendVerificationEmail(to: string, name: string, verifyUrl: string) {
  await getResend().emails.send({
    from,
    to,
    subject: "Verifique o seu e-mail — Cur10usX",
    html: wrap(
      "Verifique o seu e-mail",
      `<p>Olá ${escapeHtml(name)},</p>
       <p>Obrigado por se registar no Cur10usX! Para completar o seu registo, clique no link abaixo:</p>
       <p><a href="${verifyUrl}" style="color:#6366f1;font-weight:600;">Verificar o meu e-mail</a></p>
       <p>Este link expira em 24 horas.</p>
       <p>Se não fez esta solicitação, ignore este e-mail.</p>`
    ),
  })
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  await getResend().emails.send({
    from,
    to,
    subject: "Redefinir palavra-passe — Cur10usX",
    html: wrap(
      "Redefinir palavra-passe",
      `<p>Olá ${escapeHtml(name)},</p>
       <p>Solicitou a redefinição da sua palavra-passe. Clique no link abaixo:</p>
       <p><a href="${resetUrl}" style="color:#6366f1;font-weight:600;">Redefinir a minha palavra-passe</a></p>
       <p>Este link expira em 1 hora.</p>
       <p>Se não fez esta solicitação, ignore este e-mail.</p>`
    ),
  })
}
