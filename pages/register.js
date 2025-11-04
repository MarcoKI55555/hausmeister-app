// pages/register.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Register() {
  const router = useRouter();
  const { token } = router.query; // Einladungstoken (optional)

  // 🧩 States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailPrefill, setEmailPrefill] = useState(""); // bei Einladung
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // 🟢 Wenn ein Invite-Token übergeben wird → Hole E-Mail aus invites-Tabelle
  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data, error } = await supabase
        .from("invites")
        .select("*")
        .eq("token", token)
        .eq("used", false)
        .single();
      if (error || !data) {
        setError("Ungültiger oder bereits verwendeter Einladungscode.");
        return;
      }
      setEmailPrefill(data.email);
    })();
  }, [token]);

  // 🟣 Registrierungshandler
  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const signupEmail = emailPrefill || email;

      // 1️⃣ Benutzer in Supabase Auth anlegen
      const { data: signData, error: signError } = await supabase.auth.signUp({
        email: signupEmail,
        password,
      });
      if (signError) throw signError;

      const authUser = signData?.user;
      const authUid = authUser?.id || null;

      // 2️⃣ Rolle bestimmen
      let role_id = null;
      let hausverwaltung_id = null;

      if (token) {
        const { data: inv } = await supabase
          .from("invites")
          .select("*")
          .eq("token", token)
          .single();
        if (inv) {
          role_id = inv.role_id;
          hausverwaltung_id = inv.hausverwaltung_id;
        }
      } else {
        const { data: roleRow } = await supabase
          .from("roles")
          .select("id")
          .eq("name", "hausverwaltung")
          .single();
        role_id = roleRow?.id;
      }

      // 3️⃣ app_users-Eintrag erzeugen
      const { error: insertErr } = await supabase.from("app_users").insert([
        {
          auth_uid: authUid,
          email: signupEmail,
          name,
          role_id,
          hausverwaltung_id,
        },
      ]);
      if (insertErr) throw insertErr;

      // 4️⃣ Invite als verwendet markieren
      if (token) {
        await supabase.from("invites").update({ used: true }).eq("token", token);
      }

      // 5️⃣ Erfolgsmeldung
      setInfo(
        "Registrierung erfolgreich. Bitte melde dich jetzt an oder prüfe deine E-Mails, falls eine Bestätigung nötig ist."
      );
      setLoading(false);
      router.push("/login");
    } catch (err) {
      console.error(err);
      setError(err.message || "Fehler bei der Registrierung.");
      setLoading(false);
    }
  }

  // 🧱 Render-Teil
  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 20 }}>
      <h2>Registrierung</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {info && <p style={{ color: "green" }}>{info}</p>}

      <form onSubmit={handleRegister}>
        {/* Wenn Einladung existiert, E-Mail fix anzeigen */}
        {emailPrefill ? (
          <div style={{ marginBottom: 10 }}>
            <label>E-Mail (aus Einladung):</label>
            <div>
              <strong>{emailPrefill}</strong>
            </div>
          </div>
        ) : (
          <>
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: "100%", marginBottom: 10 }}
            />
            <label>E-Mail:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", marginBottom: 10 }}
            />
          </>
        )}

        <label>Passwort:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 20 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: "#0070f3",
            color: "white",
            padding: "10px",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Registriere..." : "Registrieren"}
        </button>
      </form>
    </div>
  );
}
