import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Benutzer in Supabase Auth erstellen
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    if (!user) {
      setError("Registrierung fehlgeschlagen.");
      setLoading(false);
      return;
    }

    // Benutzer auch in app_users Tabelle eintragen
    const { error: insertError } = await supabase.from("app_users").insert([
      {
        auth_uid: user.id,
        email: email,
        name: name,
        role_id: (await getRoleId("hausverwaltung")),
      },
    ]);

    if (insertError) {
      console.error(insertError);
      setError("Fehler beim Speichern in app_users.");
      setLoading(false);
      return;
    }

    alert("Registrierung erfolgreich! Du kannst dich nun anmelden.");
    router.push("/login");
  }

  async function getRoleId(roleName) {
    const { data, error } = await supabase
      .from("roles")
      .select("id")
      .eq("name", roleName)
      .single();
    if (error) {
      console.error(error);
      return null;
    }
    return data.id;
  }

  return (
    <div style={{ maxWidth: "400px", margin: "80px auto" }}>
      <h2>Registrierung für Hausverwaltung</h2>
      <form onSubmit={handleRegister}>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <label>E-Mail:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <label>Passwort:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px" }}
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
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
