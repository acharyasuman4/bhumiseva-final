"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Trash2, PlusCircle, CheckCircle, XCircle, Settings, FileText, DollarSign, List, AlertCircle, Save } from 'lucide-react';

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState("setup");
  const [data, setData] = useState({ categories: [], services: [], mDocs: [], provs: [], rTitles: [] });
  const [selection, setSelection] = useState({ catId: "", srvId: "", mapType: "category", mapId: "", group: "आवश्यक कागजात" });
  const [role, setRole] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
    setRole(prof?.role || "viewer");
    
    const cats = await supabase.from('categories').select('*');
    const srvs = await supabase.from('services').select('*, categories(name)');
    const docs = await supabase.from('document_master').select('*');
    const provs = await supabase.from('provinces').select('*');
    const titles = await supabase.from('revenue_titles').select('*');
    
    setData({ categories: cats.data, services: srvs.data, mDocs: docs.data, provs: provs.data, rTitles: titles.data });
  };

  const addItem = async (table, payload) => {
    await supabase.from(table).insert([payload]);
    fetchAll();
    alert("सुरक्षित भयो");
  };

  const deleteItem = async (table, id) => {
    if (confirm("के तपाईं यो विवरण हटाउन चाहनुहुन्छ?")) {
      await supabase.from(table).delete().eq('id', id);
      fetchAll();
    }
  };

  if (role === "viewer") return <div style={{padding: '50px', textAlign: 'center'}}>अनुमति छैन।</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ background: '#003366', color: '#fff', padding: '20px', borderRadius: '10px' }}>
        <h2>भूमि प्रशासन सुपर एड्मिन प्यानल</h2>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab("setup")} style={tabBtn(activeTab==="setup")}><Settings size={16}/> सेवा सेटअप</button>
          <button onClick={() => setActiveTab("docs")} style={tabBtn(activeTab==="docs")}><FileText size={16}/> कागजात व्यवस्थापन</button>
          <button onClick={() => setActiveTab("revenue")} style={tabBtn(activeTab==="revenue")}><DollarSign size={16}/> राजश्व विवरण</button>
          <button onClick={() => setActiveTab("content")} style={tabBtn(activeTab==="content")}><List size={16}/> कार्यप्रक्रिया र अन्य</button>
        </div>
      </header>

      <main style={{marginTop: '20px'}}>
        {activeTab === "setup" && (
          <div style={grid}>
            <div style={card}>
              <h3>१. मुख्य सेवा (Category)</h3>
              <input id="catInp" style={input} placeholder="उदा: लिखत पारित" />
              <button style={btn} onClick={() => addItem('categories', {name: document.getElementById('catInp').value})}>थप्नुहोस्</button>
              <div style={listScroll}>
                {data.categories.map(c => <div key={c.id} style={listItem}>{c.name} <Trash2 size={16} color="red" onClick={() => deleteItem('categories', c.id)}/></div>)}
              </div>
            </div>
            <div style={card}>
              <h3>२. सेवाको किसिम (Service Type)</h3>
              <select style={input} onChange={e => setSelection({...selection, catId: e.target.value})}>
                <option value="">मुख्य सेवा छान्नुहोस्</option>
                {data.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input id="srvInp" style={input} placeholder="उदा: राजिनामा" />
              <button style={btn} onClick={() => addItem('services', {name: document.getElementById('srvInp').value, category_id: selection.catId})}>किसिम थप्नुहोस्</button>
              <div style={listScroll}>
                {data.services.map(s => <div key={s.id} style={listItem}>{s.name} ({s.categories?.name}) <Trash2 size={16} color="red" onClick={() => deleteItem('services', s.id)}/></div>)}
              </div>
            </div>
          </div>
        )}

        {activeTab === "docs" && (
          <div style={grid}>
            <div style={card}>
              <h3>१. कागजात मास्टर लिस्ट</h3>
              <input id="dmName" style={input} placeholder="कागजातको नाम" />
              <input id="dmHover" style={input} placeholder="होभर विवरण" />
              <textarea id="dmClick" style={input} placeholder="क्लिक विवरण (कानुन)"></textarea>
              <button style={btn} onClick={() => addItem('document_master', {name: document.getElementById('dmName').value, hover_note: document.getElementById('dmHover').value, click_detail: document.getElementById('dmClick').value})}>मास्टरमा थप्नुहोस्</button>
              <div style={listScroll}>
                {data.mDocs.map(d => <div key={d.id} style={listItem}>{d.name} <Trash2 size={16} color="red" onClick={() => deleteItem('document_master', d.id)}/></div>)}
              </div>
            </div>
            <div style={card}>
              <h3>२. म्यापिङ र अपवाद (Tick/Untick)</h3>
              <div style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
                <label><input type="radio" name="mtype" onClick={() => setSelection({...selection, mapType: 'category'})}/> मुख्य सेवा</label>
                <label><input type="radio" name="mtype" onClick={() => setSelection({...selection, mapType: 'service'})}/> किसिम</label>
              </div>
              <select style={input} onChange={e => setSelection({...selection, mapId: e.target.value})}>
                <option value="">छान्नुहोस्</option>
                {selection.mapType === 'category' ? data.categories.map(c => <option value={c.id}>{c.name}</option>) : data.services.map(s => <option value={s.id}>{s.name}</option>)}
              </select>
              <input style={input} placeholder="ग्रुप (उदा: वारेशनामा भएमा थप)" onChange={e => setSelection({...selection, group: e.target.value})} />
              <div style={listScroll}>
                {data.mDocs.map(d => (
                  <div key={d.id} style={listItem}>
                    {d.name} <PlusCircle color="blue" style={{cursor:'pointer'}} onClick={() => addItem('service_document_map', {document_id: d.id, group_name: selection.group, [selection.mapType === 'category' ? 'category_id' : 'service_id']: selection.mapId})}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const tabBtn = (active) => ({ padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', background: active ? '#ffcc00' : '#002244', color: active ? '#000' : '#fff', display:'flex', alignItems:'center', gap:'5px' });
const card = { background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
const grid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const input = { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' };
const btn = { width: '100%', padding: '10px', background: '#003366', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const listItem = { display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee', fontSize: '14px' };
const listScroll = { maxHeight: '300px', overflowY: 'auto', marginTop: '10px' };
