const E164_PHONE_RE = /^\+[1-9]\d{7,14}$/

export type TwilioSmsResult = {
  sid: string
  status: string | null
  to: string
}

function requiredTwilioConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim()
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim()
  const from = process.env.TWILIO_PHONE_NUMBER?.trim()

  if (!accountSid || !authToken || !from) {
    throw new Error('Twilio SMS is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.')
  }
  if (!accountSid.startsWith('AC')) throw new Error('TWILIO_ACCOUNT_SID is invalid.')
  if (!E164_PHONE_RE.test(from)) throw new Error('TWILIO_PHONE_NUMBER must use E.164 format, for example +14155550123.')

  return { accountSid, authToken, from }
}

export function normalizeE164Phone(value: string | null | undefined) {
  if (!value) return ''
  return value.trim().replace(/[\s().-]+/g, '')
}

export function isValidE164Phone(value: string | null | undefined) {
  return E164_PHONE_RE.test(normalizeE164Phone(value))
}

export async function sendTwilioSms(to: string, body: string): Promise<TwilioSmsResult> {
  const { accountSid, authToken, from } = requiredTwilioConfig()
  const destination = normalizeE164Phone(to)
  if (!isValidE164Phone(destination)) {
    throw new Error(`Recipient phone must use E.164 format, for example +14155550123.`)
  }

  const form = new URLSearchParams({ To: destination, From: from, Body: body })
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form,
  })

  const payload: any = await response.json().catch(() => null)
  if (!response.ok) {
    const message = payload?.message || `Twilio SMS failed with HTTP ${response.status}.`
    const code = payload?.code ? ` (Twilio ${payload.code})` : ''
    throw new Error(`${message}${code}`)
  }

  return {
    sid: String(payload?.sid ?? ''),
    status: payload?.status ? String(payload.status) : null,
    to: destination,
  }
}
