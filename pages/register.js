// pages/register.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Register() {
  const router = useRouter();
  const { token } = router.query; // optional: invite token
  const [loading, setLoading] = useState(false);
  const [emailPrefill, setEmailPrefill] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (!token) return;
    // Wenn ein Invite-Token mitgegeben wurde: lade Invite (falls vorhanden) und prefill Email
    (async () => {
      try {
        const { data, error } = await supabase
          .from('invites')
          .select('*')
          .eq('token', token)
          .eq('used', false)
          .limit(1)
          .single();
        if (error || !data) {
          setError('Ungültiges oder bereits verwendetes Invite-Token.');
          return;
        }
        setEmailPrefill(data.email);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [token]);

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (!emailPrefill && !/^[^@]+@[^@]+\.[^@]+$/.test(emailPrefill || '')) {
        // allow register only with prefilled email or let user put email via form (here we use prefill for invite case)
      }

      // 1) Signup über Supabase Auth
      // Wenn du offene Registrierung willst: benutze `email` statt emailPrefill
      const signupEmail = emailPrefill || promptEmailFallback();
      if (!signupEmail) {
        setError('Keine gültige E-Mail vorhanden.');
        setLoading(false);
        return;
      }

      const { data: signData, error: signError } = await supabase.auth.signUp({
        email: signupEmail,
        password,
      });

      if (signError) {
        // wenn z.B. E-Mail bereits existiert, supabase meldet das hier
        setError(signError.message || 'Fehler bei der Registrierung.');
        setLoading(false);
        return;
      }

      // signData: { user, session, ... } — bei Email-Verifikation kann user null sein, es gibt jedoch 'data' fields
      const newAuthUser = signData?.user ?? signData?.data ?? null;

      // 2) Falls Auth-User schon existiert (z.B. von Admin per Auth angelegt), hole die auth UID
      // Wenn signData.user nicht verfügbar (z.B. E-Mail confirm enabled), wir prüfen auth.users table
      let authUid = newAuthUser?.id ?? null;
      if (!authUid) {
        // Versuche über auth.users die id zu finden (erfordert anon key reicht)
        const { data: users } = await supabase.auth.getUserByEmail ? await supabase.auth.getUserByEmail(signupEmail) : { data: null };
        // fallback: query via REST isn't available from client - so we rely on signData or ask user to confirm email
      }

      // 3) Schreibe app_users (nur wenn nicht schon angelegt)
      // Prüfe ob ein app_users-Eintrag existiert
      const { data: existingAppUser } = await supabase.from('app_users').select('*').eq('email', signupEmail).limit(1).single();
      if (!existingAppUser) {
        // determine role: if register via invite, fetch invite row to set role and hausverwaltung_id
        let role_id = null;
        let hausverwaltung_id = null;
        if (token) {
          const { data: inv } = await supabase.from('invites').select('*').eq('token', token).limit(1).single();
          if (inv) {
            role_id = inv.role_id;
            hausverwaltung_id = inv.hausverwaltung_id || null;
          }
        }
        // if no role found (open registration), default to hausverwaltung
        if (!role_id) {
          const { data: roleRow } = await supabase.from('roles').select('id').eq('name', 'hausverwaltung').limit(1).single();
          role_id = roleRow?.id ?? null;
        }

        // Insert app_users (auth_uid may be null until email confirmed, but we still write email + role)
        const insertObj = {
          auth_uid: authUid,
          email: signupEmail,
          name: name || null,
          role_id,
          hausverwaltung_id,
        };
        const { error: insertErr } = await supabase.from('app_users').insert([insertObj]);
        if (insertErr) {
          console.error('app_users insert error', insertErr);
          setError('Fehler beim Anlegen des Benutzer-Datensatzes.');
          setLoading(false);
          return;
        }
      }

      // 4) Markiere invite used (falls token)
      if (token) {
        await supabase.from('invites').update({ used: true }).eq('token', token);
      }

      // 5) Informiere Benutzer
      // Wenn Supabase E-Mail-Verifikation aktiviert ist, informiere den User
      setInfo('Registrierung erfolgreich. Falls E-Mail-Verifikation aktiviert ist, überprüfe bitte dein Postfach.');
      setLoading(false);
      router.push('/login');
    } catch (err) {
      console.error(err);
      setError('Unbekannter Fehler bei Registrierung.');
      setLoading(false);
    }
  }

  function promptEmailFallback() {
    // Wenn keine Prefill-Email vorhanden, fragen wir den Benutzer nach einer Email (nur OFFENE Registrierung)
    // Du kannst die UI so anpassen, hier nur fallback-Logik.
    return window.prompt('Bitte gebe deine E-Mail ein (für Tests):');
  }

  return (
    <div style={{ maxWidth: 520, margin: '40px auto' }}>
      <h2>Registrierung</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {info && <div style={{ color: 'green' }}>{info}</div>}
      <form onSubmit={handleRegister}>
        {/* Wenn Invite vorhanden: zeige die vorgeladene Email */}
        {emailPrefill ? (
          <div style={{ marginBottom: 10 }}>
            <label>E-Mail (Invite):</label>
            <div><strong>{emailPrefill}</strong></div>
          </div>
        ) : (
          <div style={{ marginBottom: 10 }}>
            <label>Name:</label>
            <input required value={name} onChange={(e)=>setName(e.target.value)} style={{ width: '100%', marginBottom: 6 }} />
            <label>E-Mail:</label>
            <input required type="email" value={emailPrefill} onChange={(e)=>setEmailPrefill(e.target.value)} style={{ width: '100%', marginBottom: 6 }} />
          </div>
        )}

        <label>Passwort:</label>
        <input required type="password" value={password} onChange={(e)=>setPassword(e.target.value)} style={{ width: '100%', marginBottom: 12 }} />
        <button disabled={loading} style={{ padding: '10px 16px', background: '#0b74de', color: '#fff', border: 'none', cursor: 'pointer' }}>
          {loading ? 'Registriere...' : 'Registrieren'}
        </button>
      </form>
    </div>
  );
}
