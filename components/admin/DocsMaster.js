
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { Trash2, Edit3, Save } from 'lucide-react';

export default function DocsMaster({ fetchAll, docs }) {
  const [form, setForm] = useState({ name: "", hover: "", click: "" });

  const saveDoc = async () => {
    if (!form.name) return alert("नाम अनिवार्य छ");
    await supabase.from('document_master').insert([{ name: form.name, hover_note: form.hover, click_detail: form.click }]);
    setForm({ name: "", hover: "", click: "" });
    fetchAll();
  };

  return (
    <div style={card}>
      <h3>२. कागजपत्र थप्ने (Master Pool)</h3>
      <div style={formGrid}>
        <input style={input} placeholder="कागजपत्रको नाम" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input style={input} placeholder="होभर विवरण" value={form.hover} onChange={e => setForm({...form, hover: e.target.value})} />
        <textarea style={input} placeholder="क्लिक विवरण (कानुनी व्यवस्था)" value={form.click} onChange={e => setForm({...form, click: e.target.value})} />
        <button style={saveBtn} onClick={saveDoc}>सुरक्षित गर्नुहोस्</button>
      </div>
      <div style={listScroll}>
        {docs.map(d => (
          <div key={d.id} style={listItem}>
            <div><strong>{d.name}</strong></div>
            <Trash2 size={16} color="red" cursor="pointer" onClick={() => { if(confirm("हटाउने?")) supabase.from('document_master').delete().eq('id', d.id).then(fetchAll) }} />
          </div>
        ))}
      </div>
    </div>
  );
}

const card = { background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
const formGrid = { display: 'grid', gap: '10px' };
const input = { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' };
const saveBtn = { padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const listItem = { display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' };
const listScroll = { maxHeight: '300px', overflowY: 'auto', marginTop: '10px' };
