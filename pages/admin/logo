import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminLogo(){
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [preview, setPreview] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(()=>{
    (async ()=>{
      const { data } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id;
      if(uid){
        const { data: appu } = await supabase.from('app_users').select('*').eq('auth_uid', uid).limit(1).single();
        setUser(appu);
        if(appu?.logo_url) setPreview(appu.logo_url);
      }
    })();
  },[]);

  async function handleUpload(e){
    e.preventDefault();
    if(!file){ setMsg('Bitte Datei wählen'); return; }
    if(!user){ setMsg('Nicht eingeloggt'); return; }
    setUploading(true);
    try{
      const ext = file.name.split('.').pop();
      const filename = `hausverwaltung-${user.id}.${ext}`;
      const { data, error: upErr } = await supabase.storage.from('logos').upload(filename, file, { upsert: true });
      if(upErr){ setMsg('Upload Fehler: '+upErr.message); setUploading(false); return; }
      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(filename);
      const publicUrl = urlData.publicUrl;
      await supabase.from('app_users').update({ logo_url: publicUrl }).eq('id', user.id);
      setPreview(publicUrl);
      setMsg('Upload erfolgreich');
    }catch(err){
      console.error(err);
      setMsg('Fehler beim Upload');
    }finally{
      setUploading(false);
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl mb-4">Hausverwaltung Logo</h1>
      {preview && <div className="mb-4"><img src={preview} alt="Logo" className="h-24" /></div>}
      <form onSubmit={handleUpload} className="bg-white p-4 rounded shadow">
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} className="mb-3" />
        <button className="bg-blue-600 text-white px-3 py-1 rounded">{uploading ? '...' : 'Hochladen'}</button>
      </form>
      {msg && <div className="mt-3 text-sm">{msg}</div>}
      <p className="text-xs text-gray-500 mt-4">Bucket 'logos' muss in Supabase Storage angelegt und öffentlich sein.</p>
    </div>
  );
}
