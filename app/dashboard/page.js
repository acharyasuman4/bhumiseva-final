"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Trash2, PlusCircle, CheckCircle, XCircle, Info, Settings, FileText, DollarSign, AlertCircle, List } from 'lucide-react';

export default function MasterDashboard() {
  const [activeTab, setActiveTab] = useState("setup");
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [masterDocs, setMasterDocs] = useState([]);
  const [mappedDocs, setMappedDocs] = useState([]);
  const [exclusions, setExclusions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [revTitles, setRevTitles] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  const [formData, setFormData] = useState({
    catId: "", srvName: "", mapType: "category", mapTargetId: "", mapGroup: "आवश्यक कागजात"
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const { data: cat } = await supabase.from('categories').select('*');
    const { data: srv } = await supabase.from('services').select('*, categories(name)');
    const { data: mDoc } = await supabase.from('document_master').select('*');
    const { data: maps } = await supabase.from('service_document_map').select('*, document_master(*)');
    const { data: ex } = await supabase.from('document_exceptions').select('*');
    const { data: prov } = await supabase.from('provinces').select('*');
    const { data: rTitles } = await supabase.from('revenue_titles').select('*');
    const { data: rev } = await supabase.from('revenue_details').select('*, services(name), provinces(name), revenue_titles(title)');

    setCategories(cat || []); setServices(srv || []); setMasterDocs(mDoc || []);
    setMappedDocs(maps || []); setExclusions(ex || []); setProvinces(prov || []);
    setRevTitles(rTitles || []); setRevenueData(rev || []);
  };

  const deleteItem = async (table, id) => {
    if (confirm("के तपाईं यो विवरण हटाउन चाहनुहुन्छ?")) {
      await supabase.from(table).delete().eq('id', id);
      fetchAll();
    }
  };

  // १. कागजात म्यापिङ (पहिले नै म्याप भएको कागजात लिस्टबाट हराउने लजिक)
  const availableDocs = masterDocs.filter(doc => {
    const isAlreadyMapped = mappedDocs.find(m => 
      m.document_id === doc.id && 
      (formData.mapType === 'category' ? m.category_id == formData.mapTargetId : m.service_id == formData.mapTargetId)
    );
    return !isAlreadyMapped;
  });

  // २. मुख्य सेवाबाट आएको कागजातलाई 'Untick' गरेर हटाउने (Exclusion Logic)
  const toggleExclusion = async (docId, serviceId, isExcluded) => {
    if (isExcluded) {
      await supabase.from('document_exceptions').delete().eq('document_id', docId).eq('service_id', serviceId);
    } else {
      await supabase.from('document_exceptions').insert([{ document_id: docId, service_id: serviceId }]);
    }
    fetchAll();
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h2>भूमि प्रशासन सुपर ड्यासबोर्ड</h2>
        <div style={navStyle}>
          <button onClick={() => setActiveTab("setup")} style={tabBtn(activeTab==="setup")}><Settings size={16}/> सेटअप</button>
          <button onClick={() => setActiveTab("docs")} style={tabBtn(activeTab==="docs")}><FileText size={16}/> कागजात व्यवस्थापन</button>
          <button onClick={() => setActiveTab("revenue")} style={tabBtn(activeTab==="revenue")}><DollarSign size={16}/> राजश्व विवरण</button>
        </div>
      </header>

      <main style={{marginTop: '20px'}}>
        {/* सेटअप ट्याब (Edit/Delete सहित) */}
        {activeTab === "setup" && (
          <div style={grid}>
            <div style={card}>
              <h3>हालका किसिमहरू (Services)</h3>
              {services.map(s => (
                <div key={s.id} style={listItem}>
                  <span>{s.name} <small>({s.categories?.name})</small></span>
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
              <input style={input} placeholder="उदा: राजिनामा" id="srvInp" />
              <button style={btn} onClick={async () => {
                const name = document.getElementById('srvInp').value;
                await supabase.from('services').insert([{name, category_id: formData.catId, status: 'approved'}]);
                fetchAll();
              }}>थप्नुहोस्</button>
            </div>
          </div>
        )}

        {/* कागजात व्यवस्थापन (Tick/Untick र Exclusion) */}
        {activeTab === "docs" && (
          <div style={grid}>
            <div style={card}>
              <h3>१. म्यापिङ र हटाउने (Mapping)</h3>
              <div style={{marginBottom: '10px'}}>
                <label><input type="radio" name="mtype" onClick={() => setFormData({...formData, mapType: 'category'})}/> मुख्य सेवामा</label>
                <label style={{marginLeft: '10px'}}><input type="radio" name="mtype" onClick={() => setFormData({...formData, mapType: 'service'})}/> किसिममा</label>
              </div>
              <select style={input} onChange={e => setFormData({...formData, mapTargetId: e.target.value})}>
                <option value="">छान्नुहोस्</option>
                {formData.mapType === 'category' ? categories.map(c => <option value={c.id}>{c.name}</option>) : services.map(s => <option value={s.id}>{s.name}</option>)}
              </select>

              <h4>बाँकी रहेका कागजातहरू (Available):</h4>
              <div style={scrollBox}>
                {availableDocs.map(d => (
                  <div key={d.id} style={listItem}>
                    {d.name} <PlusCircle size={18} color="blue" onClick={async () => {
                      await supabase.from('service_document_map').insert([{
                        document_id: d.id, group_name: formData.mapGroup,
                        [formData.mapType === 'category' ? 'category_id' : 'service_id']: formData.mapTargetId
                      }]);
                      fetchAll();
                    }} style={{cursor:'pointer'}}/>
                  </div>
                ))}
              </div>
            </div>

            <div style={card}>
              <h3>२. हाल छानिएका कागजात र अपवाद (Exclusions)</h3>
              <p style={{fontSize: '12px'}}>मुख्य सेवाबाट आएका कागजात हटाउन 'Uncheck' गर्नुहोस्।</p>
              {formData.mapType === 'service' && formData.mapTargetId && (
                <div>
                  <h4 style={{color: 'green'}}>मुख्य सेवाबाट प्राप्त (Inherited):</h4>
                  {mappedDocs.filter(m => m.category_id == services.find(s => s.id == formData.mapTargetId)?.category_id).map(m => {
                    const isExcluded = exclusions.find(ex => ex.document_id === m.document_id && ex.service_id == formData.mapTargetId);
                    return (
                      <div key={m.id} style={listItem}>
                        <span><input type="checkbox" checked={!isExcluded} onChange={() => toggleExclusion(m.document_id, formData.mapTargetId, isExcluded)} /> {m.document_master?.name}</span>
                        <small>मुख्य सेवाबाट</small>
                      </div>
                    );
                  })}
                </div>
              )}
              <h4 style={{marginTop: '20px', color: 'blue'}}>यस किसिमका लागि मात्र थपिएका:</h4>
              {mappedDocs.filter(m => m.service_id == formData.mapTargetId).map(m => (
                <div key={m.id} style={listItem}>
                  {m.document_master?.name}
                  <Trash2 size={16} color="red" onClick={() => deleteItem('service_document_map', m.id)} style={{cursor:'pointer'}}/>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Styles (पहिलेकै जस्तै)
const containerStyle = { padding: '20px', background: '#f4f7f6', minHeight: '100vh' };
const headerStyle = { background: '#003366', color: '#fff', padding: '20px', borderRadius: '10px' };
const navStyle = { display: 'flex', gap: '10px', marginTop: '15px' };
const tabBtn = (active) => ({ padding: '10px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer', background: active ? '#ffcc00' : '#002244', color: active ? '#000' : '#fff' });
const grid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const card = { background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
const input = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' };
const btn = { width: '100%', padding: '10px', background: '#003366', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const listItem = { display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' };
const scrollBox = { maxHeight: '400px', overflowY: 'auto' };
