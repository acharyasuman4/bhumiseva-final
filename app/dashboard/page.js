"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Trash2, PlusCircle, CheckCircle, XCircle, Info, Settings, FileText, DollarSign, AlertCircle } from 'lucide-react';

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState("setup");
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [masterDocs, setMasterDocs] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [revTitles, setRevTitles] = useState([]);
  const [mappedDocs, setMappedDocs] = useState([]);

  const [formData, setFormData] = useState({
    catId: "", srvName: "", docName: "", docHover: "", docClick: "", 
    mapTargetId: "", mapType: "service", mapGroup: "आवश्यक कागजात",
    revProv: "", revSrv: "", revTitle: "", revRate: "", revRem: "",
    conDesc: "", conLaw: ""
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const { data: cat } = await supabase.from('categories').select('*');
    const { data: srv } = await supabase.from('services').select('*, categories(name)');
    const { data: mDoc } = await supabase.from('document_master').select('*');
    const { data: prov } = await supabase.from('provinces').select('*');
    const { data: titles } = await supabase.from('revenue_titles').select('*');
    const { data: maps } = await supabase.from('service_document_map').select('*, document_master(name)');
    
    setCategories(cat || []); setServices(srv || []); setMasterDocs(mDoc || []);
    setProvinces(prov || []); setRevTitles(titles || []); setMappedDocs(maps || []);
  };

  // हटाउने सुविधा (Delete Logic)
  const deleteItem = async (table, id) => {
    if (!confirm("के तपाईं यो विवरण हटाउन चाहनुहुन्छ?")) return;
    await supabase.from(table).delete().eq('id', id);
    fetchAll();
  };

  // कागजात म्यापिङ (Inheritance Logic)
  const mapDocument = async (docId) => {
    const payload = {
      document_id: docId,
      group_name: formData.mapGroup,
      [formData.mapType === 'category' ? 'category_id' : 'service_id']: formData.mapTargetId
    };
    await supabase.from('service_document_map').insert([payload]);
    alert("सफलतापूर्वक जोडियो"); fetchAll();
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h2>भूमि प्रशासन सुपर ड्यासबोर्ड</h2>
        <div style={navStyle}>
          <button onClick={() => setActiveTab("setup")} style={tabBtn(activeTab==="setup")}><Settings size={16}/> सेटअप र हटाउने</button>
          <button onClick={() => setActiveTab("docs")} style={tabBtn(activeTab==="docs")}><FileText size={16}/> कागजात व्यवस्थापन</button>
          <button onClick={() => setActiveTab("revenue")} style={tabBtn(activeTab==="revenue")}><DollarSign size={16}/> राजश्व</button>
          <button onClick={() => setActiveTab("caution")} style={tabBtn(activeTab==="caution")}><AlertCircle size={16}/> ध्यान दिनुहोस्</button>
        </div>
      </header>

      <main style={{marginTop: '20px'}}>
        {activeTab === "setup" && (
          <div style={grid}>
            <div style={card}>
              <h3>सेवाका किसिमहरू</h3>
              {services.map(s => (
                <div key={s.id} style={listItem}>
                  {s.name} ({s.categories?.name})
                  <Trash2 size={16} color="red" onClick={() => deleteItem('services', s.id)} style={{cursor:'pointer'}}/>
                </div>
              ))}
            </div>
            <div style={card}>
              <h3>नयाँ किसिम थप्नुहोस्</h3>
              <select style={input} onChange={e => setFormData({...formData, catId: e.target.value})}>
                <option value="">मुख्य सेवा छान्नुहोस्</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input style={input} placeholder="नाम (उदा: राजिनामा)" onChange={e => setFormData({...formData, srvName: e.target.value})}/>
              <button style={btn} onClick={async () => {
                await supabase.from('services').insert([{name: formData.srvName, category_id: formData.catId, status: 'approved'}]);
                fetchAll();
              }}>थप्नुहोस्</button>
            </div>
          </div>
        )}

        {activeTab === "docs" && (
          <div style={grid}>
            <div style={card}>
              <h3>१. कागजात मास्टर र हटाउने</h3>
              {masterDocs.map(d => (
                <div key={d.id} style={listItem}>
                  {d.name} <Trash2 size={16} color="red" onClick={() => deleteItem('document_master', d.id)}/>
                </div>
              ))}
              <hr/>
              <input style={input} placeholder="नयाँ कागजातको नाम" onChange={e => setFormData({...formData, docName: e.target.value})}/>
              <button style={btn} onClick={async () => {
                await supabase.from('document_master').insert([{name: formData.docName}]);
                fetchAll();
              }}>मास्टरमा थप्नुहोस्</button>
            </div>

            <div style={card}>
              <h3>२. सेवा/मुख्य सेवामा जोड्नुहोस्</h3>
              <div style={{display:'flex', gap:'10px', marginBottom: '10px'}}>
                <label><input type="radio" name="mtype" onClick={() => setFormData({...formData, mapType: 'category'})}/> मुख्य सेवा</label>
                <label><input type="radio" name="mtype" onClick={() => setFormData({...formData, mapType: 'service'})}/> किसिम</label>
              </div>
              <select style={input} onChange={e => setFormData({...formData, mapTargetId: e.target.value})}>
                <option value="">छान्नुहोस्</option>
                {formData.mapType === 'category' ? categories.map(c => <option value={c.id}>{c.name}</option>) : services.map(s => <option value={s.id}>{s.name}</option>)}
              </select>
              <input style={input} placeholder="ग्रुप नाम (उदा: कम्पनी भए थप)" onChange={e => setFormData({...formData, mapGroup: e.target.value})}/>
              <div style={scrollBox}>
                {masterDocs.map(d => (
                  <div key={d.id} style={listItem}>
                    {d.name} <PlusCircle size={18} color="blue" onClick={() => mapDocument(d.id)}/>
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

// Styles
const containerStyle = { padding: '20px', background: '#f4f7f6', minHeight: '100vh' };
const headerStyle = { background: '#003366', color: '#fff', padding: '20px', borderRadius: '10px' };
const navStyle = { display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' };
const tabBtn = (active) => ({ padding: '10px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer', background: active ? '#ffcc00' : '#002244', color: active ? '#000' : '#fff', display: 'flex', alignItems: 'center', gap: '5px' });
const grid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' };
const card = { background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
const input = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' };
const btn = { width: '100%', padding: '10px', background: '#003366', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const listItem = { display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' };
const scrollBox = { maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', padding: '5px' };
