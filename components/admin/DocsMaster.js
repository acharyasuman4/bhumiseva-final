import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Trash2, Edit3, Plus, Save } from 'lucide-react';

export default function DocsMaster({ fetchAll, docs }) {
  const [form, setForm] = useState({ id: null, name: "", hover: "", click: "" });

  const handleSave = async () => {
    if (!form.name) return alert("कागजपत्रको नाम लेख्नुहोस्");
    if (form.id) {
      await supabase.from('document_master').update({ name: form.name, hover_note: form.hover, click_detail: form.click }).eq('id', form.id);
    } else {
      await supabase.from('document_master').insert([{ name: form.name, hover_note: form.hover, click_detail: form.click }]);
    }
    setForm({ id: null, name: "", hover: "", click: "" });
    fetchAll();
  };

  return (
    <div style={card}>
      <h2 style={{color: '#003366', marginBottom: '20px'}}>कागजपत्र व्यवस्थापन</h2>
      <div style={formGrid}>
        <input style={input} placeholder="कागजपत्रको नाम" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input style={input} placeholder="होभर गर्दा देखिने विवरण" value={form.hover} onChange={e => setForm({...form, hover: e.target.value})} />
        <textarea style={input} placeholder="क्लिक गर्दा देखिने विवरण (कानुनी व्यवस्था)" value={form.click} onChange={e => setForm({...form, click: e.target.value})} />
        <button style={saveBtn} onClick={handleSave}>
          {form.id ? <><Save size={18}/> अपडेट गर्नुहोस्</> : <><Plus size={18}/> मास्टर लिस्टमा थप्नुहोस्</>}
        </button>
      </div>

      <div style={{marginTop: '30px'}}>
        <h3>हालका कागजपत्रहरू (Newest First)</h3>
        {docs.map(d => (
          <div key={d.id} style={listItem}>
            <div>
              <strong>{d.name}</strong> <br/>
              <small style={{color: '#666'}}>{d.hover_note}</small>
            </div>
            <div style={{display: 'flex', gap: '15px'}}>
              <Edit3 size={18} color="blue" cursor="pointer" onClick={() => setForm({id: d.id, name: d.name, hover: d.hover_note, click: d.click_detail})} />
              <Trash2 size={18} color="red" cursor="pointer" onClick={() => { if(confirm("हटाउने?")) supabase.from('document_master').delete().eq('id', d.id).then(fetchAll)}} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const card = { background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const formGrid = { display: 'grid', gap: '15px', background: '#f8f9fa', padding: '20px', borderRadius: '8px' };
const input = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' };
const saveBtn = { padding: '12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const listItem = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #eee' };
