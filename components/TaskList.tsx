import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function TaskList({ templateOnly = false }: { templateOnly?: boolean }) {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(()=>{
    (async ()=>{
      const query = supabase.from('tasks').select('*').order('id', { ascending: true });
      const filter = templateOnly ? query.eq('template', true) : query;
      const { data } = await filter;
      setTasks(data ?? []);
    })();
  },[templateOnly]);

  return (
    <div className="space-y-2">
      {tasks.slice(0,20).map(t => (
        <div key={t.id} className="p-2 border rounded">
          <div className="text-sm text-gray-600">{t.nummer} — {t.kategorie}</div>
          <div className="font-medium">{t.beschreibung}</div>
          <div className="text-xs text-gray-500">{t.frequenz} {t.extern ? '(Extern)' : ''}</div>
        </div>
      ))}
      {tasks.length === 0 && <div className="text-sm text-gray-500">Keine Aufgaben gefunden.</div>}
    </div>
  );
}
