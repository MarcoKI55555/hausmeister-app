import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Header(){
  const [logo, setLogo] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(()=>{
    (async ()=>{
      const { data } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id;
      const email = data?.session?.user?.email;
      setUserEmail(email);
      if(!uid) return;
      const { data: appu } = await supabase.from('app_users').select('*').eq('auth_uid', uid).limit(1).single();
      if(!appu) return;
      if(appu.role_id && appu.role_id === 1){
        setLogo(appu.logo_url || null);
      }else if(appu.hausverwaltung_id){
        const { data: hv } = await supabase.from('app_users').select('logo_url').eq('id', appu.hausverwaltung_id).limit(1).single();
        setLogo(hv?.logo_url || null);
      }
    })();
  },[]);

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow mb-6">
      <div className="flex items-center">
        {logo ? <img src={logo} alt="Logo" className="h-10 mr-3" /> : <div className="h-10 w-10 bg-gray-200 mr-3 rounded" />}
        <h1 className="text-lg font-semibold">Hausmeister-App</h1>
      </div>
      <div className="text-sm text-gray-600">{userEmail}</div>
    </header>
  );
}
