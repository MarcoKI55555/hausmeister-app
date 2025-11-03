import crypto from 'crypto';
import nodemailer from 'nodemailer';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MAIL_FROM = process.env.MAIL_FROM;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, role_id, liegenschaft_id, hausverwaltung_id } = req.body;
  if(!email || !role_id) return res.status(400).json({ error: 'email + role_id required' });
  const token = crypto.randomBytes(20).toString('hex');
  const expiresAt = new Date(Date.now() + 1000*60*60*24*7).toISOString();

  const insertResp = await fetch(`${SUPABASE_URL}/rest/v1/invites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ token, email, role_id, liegenschaft_id, hausverwaltung_id, expires_at: expiresAt })
  });

  if(!insertResp.ok){
    const txt = await insertResp.text();
    console.error('invite insert failed', txt);
    return res.status(500).json({ error: 'invite insert failed', details: txt });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.MAIL_PORT || 587),
    secure: false,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
  });

  const inviteUrl = `${APP_URL}/register?token=${token}`;
  const subject = 'Einladung zur Hausmeister-App';
  const html = `<p>Du wurdest eingeladen. Bitte registriere dich: <a href="${inviteUrl}">${inviteUrl}</a></p>`;
  try{
    await transporter.sendMail({ from: MAIL_FROM, to: email, subject, html });
  }catch(err){
    console.error('mail error', err);
    return res.status(500).json({ error: 'mail error', details: err.message });
  }

  return res.status(200).json({ ok: true, token });
}
