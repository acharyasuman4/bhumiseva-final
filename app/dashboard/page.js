"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Trash2, Edit3, Plus, Save, FileText, LayoutGrid, DollarSign, ListChecks, ChevronRight, X, Info } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("docs"); // docs, structure, grouping, assignment, revenue
  const [data, setData] = useState({ cats: [], srvs: [], mDocs: [], provs: [], maps: [] });
  const [loading, setLoading] = useState(true);

  // Form States
  const [docForm, setDocForm] = useState({ name: "", hover: "", click: "" });
  const [catForm, setCatForm] = useState({ name: "", svg: "" });
  const [srvForm, setSrvForm] = useState({ catId: "", name: "" });
  const [mapForm, setMapForm] = useState({ type: 'category', targetId: '', group: 'आवश्यक कागजात' });
  const [revForm, setRevForm] = useState(null); // For Revenue Modal

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const cats = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
    const srvs = await supabase.from('services').select('*, categories(name)');
    const docs = await supabase.from('document_master').select('*').order('created_at', { ascending: false });
    const provs = await supabase.from('provinces').select('*');
    const maps = await supabase.from('service_document_map').select('*, document_master(name)');
    
    setData({ cats: cats.data, srvs: srvs.data, mDocs: docs.data, provs: provs.data, maps: maps.data });
    setLoading(false);
  }

  // --- Handlers ---
  const handleAddDoc = async () => {
    await supabase.from('document_master').insert([{ name: docForm.name, hover_note: docForm.hover, click_detail: docForm.click }]);
    setDocForm({ name: "", hover: "", click: "" });
    fetchAll();
  };

  const handleAddService = async () => {
    await supabase.from('services').insert([{ name: srvForm.name, category_id: srvForm.catId }]);
    setSrvForm({ ...srvForm, name: "" });
    fetchAll();
  };

  // --- UI Components ---
  const TabBtn = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => setActiveTab(id)} 
      style={{
        padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', borderRadius: '8px',
        background: activeTab === id ? '#003366' : '#fff', color: activeTab === id ? '#fff' : '#333', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div style={{ padding: '30px', background: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#003366' }}>भूमि प्रशासन: सुपर एड्मिन प्यानल</h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
          <TabBtn id="docs" label="कागजपत्र थप्ने" icon={FileText} />
          <TabBtn id="structure" label="मुख्य सेवा र किसिम" icon={LayoutGrid} />
          <TabBtn id="grouping" label="कागजात ग्रुपिङ" icon={ListChecks} />
          <TabBtn id="revenue" label="राजश्व प्रणाली" icon={DollarSign} />
        </div>
      </header>

      <main style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        
        {/* २. कागजपत्र थप्ने मोड्युल */}
        {activeTab === "docs" && (
          <div>
            <div style={formGrid}>
              <input style={input} placeholder="कागजपत्रको नाम" value={docForm.name} onChange={e => setDocForm({...docForm, name: e.target.value})} />
              <input style={input} placeholder="होभर विवरण" value={docForm.hover} onChange={e => setDocForm({...docForm, hover: e.target.value})} />
              <textarea style={input} placeholder="क्लिक विवरण (कानुनी व्यवस्था)" value={docForm.click} onChange={e => setDocForm({...docForm, click: e.target.value})} />
              <button style={saveBtn} onClick={handleAddDoc}>सुरक्षित गर्नुहोस्</button>
            </div>
            <div style={{ marginTop: '30px' }}>
              {data.mDocs.map(d => (
                <div key={d.id} style={listItem}>
                  <div><strong>{d.name}</strong> <br/> <small>{d.hover_note}</small></div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Edit3 size={18} color="blue" cursor="pointer" />
                    <Trash2 size={18} color="red" cursor="pointer" onClick={() => { if(confirm("हटाउने?")) supabase.from('document_master').delete().eq('id', d.id).then(fetchAll) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ३. मुख्य सेवा र किसिम */}
        {activeTab === "structure" && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div style={card}>
              <h3>मुख्य सेवा (Category)</h3>
              <input style={input} placeholder="सेवाको नाम" onChange={e => setCatForm({...catForm, name: e.target.value})} />
              <textarea style={input} placeholder="SVG ICON कोड" onChange={e => setCatForm({...catForm, svg: e.target.value})} />
              <button style={btn} onClick={async () => { await supabase.from('categories').insert([{ name: catForm.name, icon_svg: catForm.svg }]); fetchAll(); }}>मुख्य सेवा थप्नुहोस्</button>
              <div style={{marginTop:'20px'}}>
                {data.cats.map(c => <div key={c.id} style={listItem}>{c.name} <Trash2 size={16} color="red" cursor="pointer"/></div>)}
              </div>
            </div>
            <div style={card}>
              <h3>सेवाको किसिम (Service Type)</h3>
              <select style={input} onChange={e => setSrvForm({...srvForm, catId: e.target.value})}>
                <option value="">मुख्य सेवा छान्नुहोस्</option>
                {data.cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input style={input} placeholder="किसिमको नाम" value={srvForm.name} onChange={e => setSrvForm({...srvForm, name: e.target.value})} />
              <button style={btn} onClick={handleAddService}>किसिम थप्नुहोस्</button>
              <div style={{marginTop:'20px'}}>
                {data.srvs.map(s => <div key={s.id} style={listItem}>{s.name} <small>({s.categories?.name})</small> <Trash2 size={16} color="red" cursor="pointer"/></div>)}
              </div>
            </div>
          </div>
        )}

        {/* ६. राजश्व प्रणाली (Matrix View) */}
// १. स्टेटहरू (States) मा यी थप्नुहोस्
const [revModal, setRevModal] = useState(null); // कुन सेवा र प्रदेश छानियो
const [revFormData, setRevFormData] = useState({
  valuation_amount: "", reg_fee_percent: "", reg_fee_fixed: "",
  srv_fee_percent: "", srv_fee_fixed: "", is_three_gen: false,
  delay_fee: "", remarks: "", cgt_option: "तिनपुस्ता भित्र"
});

// २. राजश्व विवरण सेभ गर्ने फङ्सन
const saveRevenue = async () => {
  const { error } = await supabase.from('revenue_details').upsert([{
    service_id: revModal.srvId,
    province_id: revModal.provId,
    ...revFormData
  }], { onConflict: 'service_id,province_id' });

  if (error) alert(error.message);
  else {
    alert("राजश्व विवरण सुरक्षित भयो!");
    setRevModal(null);
    fetchAll();
  }
};

// ३. UI: राजश्व प्रणाली ट्याब
{activeTab === "revenue" && (
  <div style={{ overflowX: 'auto' }}>
    <h3 style={{ marginBottom: '20px', color: '#003366' }}>राजश्व मेट्रिक्स (सातै प्रदेश)</h3>
    <table style={matrixTable}>
      <thead>
        <tr>
          <th style={matrixTh}>मुख्य सेवा (किसिम)</th>
          {data.provs.map(p => (
            <th key={p.id} style={matrixTh}>{p.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.srvs.map(s => (
          <tr key={s.id}>
            <td style={matrixTd}>
              <div style={{ fontWeight: 'bold' }}>{s.name}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>{s.categories?.name}</div>
            </td>
            {data.provs.map(p => (
              <td key={p.id} style={matrixTdCenter}>
                <button 
                  onClick={() => setRevModal({ srvName: s.name, catName: s.categories.name, provName: p.name, srvId: s.id, provId: p.id })}
                  style={addRevBtn}
                >
                  थप्नुहोस् / हेर्नुहोस्
                </button>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>

    {/* डाइलग बक्स (Modal) */}
    {revModal && (
      <div style={modalOverlay}>
        <div style={modalContent}>
          <div style={modalHeader}>
            <h3>{revModal.catName} ({revModal.srvName}) - {revModal.provName}</h3>
            <X cursor="pointer" onClick={() => setRevModal(null)} />
          </div>
          
          <div style={modalBody}>
            <div style={formGrid}>
              <div style={field}>
                <label>थैली अङ्क</label>
                <input style={input} value={revFormData.valuation_amount} onChange={e => setRevFormData({...revFormData, valuation_amount: e.target.value})} />
              </div>
              <div style={field}>
                <label>रजिष्ट्रेशन दस्तुर (%)</label>
                <input style={input} type="number" onChange={e => setRevFormData({...revFormData, reg_fee_percent: e.target.value})} />
              </div>
              <div style={field}>
                <label>रजिष्ट्रेशन दस्तुर (Fixed)</label>
                <input style={input} type="number" onChange={e => setRevFormData({...revFormData, reg_fee_fixed: e.target.value})} />
              </div>
              <div style={field}>
                <label>सेवा शुल्क (%)</label>
                <input style={input} type="number" onChange={e => setRevFormData({...revFormData, srv_fee_percent: e.target.value})} />
              </div>
              <div style={field}>
                <label>सेवा शुल्क (Fixed)</label>
                <input style={input} type="number" onChange={e => setRevFormData({...revFormData, srv_fee_fixed: e.target.value})} />
              </div>
              <div style={field}>
                <label>विलम्व शुल्क</label>
                <input style={input} onChange={e => setRevFormData({...revFormData, delay_fee: e.target.value})} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" onChange={e => setRevFormData({...revFormData, is_three_gen: e.target.checked})} />
                  तिनपुस्ता आवश्यक छ?
                </label>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label>लाभकर विकल्प (Capital Gain)</label>
                <select style={input} onChange={e => setRevFormData({...revFormData, cgt_option: e.target.value})}>
                  <option value="तिनपुस्ता भित्र">तिनपुस्ता भित्र</option>
                  <option value="तिनपुस्ता बाहिर">तिनपुस्ता बाहिर</option>
                  <option value="छनौट नगर्ने">छनौट नगर्ने</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label>कैफियत</label>
                <textarea style={input} rows="3" onChange={e => setRevFormData({...revFormData, remarks: e.target.value})}></textarea>
              </div>
            </div>
            <button style={saveFullBtn} onClick={saveRevenue}>सुरक्षित गर्नुहोस्</button>
          </div>
        </div>
      </div>
    )}
  </div>
)}
// --- Styles ---
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const input = { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' };
const saveBtn = { padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const btn = { padding: '10px 20px', background: '#003366', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' };
const listItem = { display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #eee', background: '#fff', marginBottom: '5px', borderRadius: '8px' };
const card = { background: '#f9f9f9', padding: '20px', borderRadius: '10px' };
const th = { background: '#003366', color: '#fff', padding: '12px', border: '1px solid #eee' };
const td = { padding: '12px', border: '1px solid #eee' };
const smallBtn = { padding: '5px 10px', background: '#e3f2fd', color: '#007bff', border: '1px solid #007bff', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { background: '#fff', padding: '30px', borderRadius: '15px', width: '600px', maxHeight: '90vh', overflowY: 'auto' };
const formGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
const matrixTable = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' };
const matrixTh = { background: '#003366', color: '#fff', padding: '10px', border: '1px solid #ddd', position: 'sticky', top: 0 };
const matrixTd = { padding: '10px', border: '1px solid #ddd', background: '#fff' };
const matrixTdCenter = { ...matrixTd, textAlign: 'center' };
const addRevBtn = { padding: '5px 8px', background: '#e3f2fd', border: '1px solid #2196f3', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', color: '#1976d2' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { background: '#fff', width: '700px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' };
const modalHeader = { background: '#003366', color: '#fff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const modalBody = { padding: '20px' };
const field = { display: 'flex', flexDirection: 'column', gap: '5px' };
const saveFullBtn = { width: '100%', padding: '12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '15px' };
