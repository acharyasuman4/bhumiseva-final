import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Trash2, Plus } from 'lucide-react';

export default function CategoryService({ fetchAll, cats, srvs }) {
  const [catName, setCatName] = useState("");
  const [catSvg, setCatSvg] = useState("");
  const [srvName, setSrvName] = useState("");
  const [selectedCat, setSelectedCat] = useState("");

  const addCat = async () => {
    await supabase.from('categories').insert([{ name: catName, icon_svg: catSvg }]);
    setCatName(""); setCatSvg(""); fetchAll();
  };

  const addSrv = async () => {
    await supabase.from('services').insert([{ name: srvName, category_id: selectedCat }]);
    setSrvName(""); fetchAll();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
      <div style={card}>
        <h3>मुख्य सेवा (Category)</h3>
        <input style={input} placeholder="सेवाको नाम" value={catName} onChange={e => setCatName(e.target.value)} />
        <textarea style={input} placeholder="SVG ICON" value={catSvg} onChange={e => setCatSvg(e.target.value)} />
        <button style={btn} onClick={addCat}>मुख्य सेवा थप्नुहोस्</button>
        <div style={{marginTop:'20px'}}>
          {cats.map(c => <div key={c.id} style={listItem}>{c.name} <Trash2 size={16} color="red" cursor="pointer" onClick={() => supabase.from('categories').delete().eq('id', c.id).then(fetchAll)}/></div>)}
        </div>
      </div>
      <div style={card}>
        <h3>सेवाको किसिम (Service Type)</h3>
        <select style={input} onChange={e => setSelectedCat(e.target.value)}>
          <option value="">मुख्य सेवा छान्नुहोस्</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input style={input} placeholder="किसिमको नाम" value={srvName} onChange={e => setSrvName(e.target.value)} />
        <button style={btn} onClick={addSrv}>किसिम थप्नुहोस्</button>
        <div style={{marginTop:'20px'}}>
          {srvs.map(s => <div key={s.id} style={listItem}>{s.name} <Trash2 size={16} color="red" cursor="pointer" onClick={() => supabase.from('services').delete().eq('id', s.id).then(fetchAll)}/></div>)}
        </div>
      </div>
    </div>
  );
}

const card = { background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const input = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };
const btn = { width: '100%', padding: '10px', background: '#003366', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const listItem = { display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' };
