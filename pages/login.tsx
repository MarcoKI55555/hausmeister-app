import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Login() {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [loading,setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e:any){
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      alert('Login fehlgeschlagen: ' + error.message);
    } else {
      router.push('/');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white shadow p-6 rounded">
        <h1 className="text-2xl mb-4">Hausmeister-App — Login</h1>
        <form onSubmit={handleLogin}>
          <label className="block mb-2">E-Mail</label>
          <input className="w-full p-2 border rounded mb-3" value={email} onChange={e=>setEmail(e.target.value)} />
          <label className="block mb-2">Passwort</label>
          <input type="password" className="w-full p-2 border rounded mb-3" value={password} onChange={e=>setPassword(e.target.value)} />
          <button disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded">
            {loading ? 'Anmelden...' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  );
}
