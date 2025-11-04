import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import TaskList from '../components/TaskList';
import { useRouter } from 'next/router';

export default function Home(){
  const [user, setUser] = useState(null);
  const [liegenschaften, setLiegenschaften] = useState([]);
  const router = useRouter();

  useEffect(()=> {
    const s = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) router.push('/login');
    });
    supabase.auth.getSession().then(r => setUser(r.data.session?.user ?? null));
    return () => { s.data.subscription?.unsubscribe(); }
  },[]);

  useEffect(()=> {
    (async ()=>{
      const { data } = await supabase.from('liegenschaften').select('*').order('id', { ascending: true });
      setLiegenschaften(data ?? []);
    })();
  },[]);

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Hausmeister-App</h1>
        <div>
          <button className="px-3 py-1 bg-gray-200 rounded mr-2" onClick={async ()=>{ await supabase.auth.signOut(); router.push('/login'); }}>Logout</button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Liegenschaften</h2>
          <ul>
            {liegenschaften.map(l => <li key={l.id} className="py-1 border-b">{l.name} — {l.address}</li>)}
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Leistungsverzeichnis (Template Vorschau)</h2>
          <TaskList templateOnly />
        </div>
      </section>
    </div>
  )
}
