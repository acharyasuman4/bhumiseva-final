"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { PlusCircle, FileText, Settings, DollarSign, List, CheckCircle, Trash2, Info } from 'lucide-react';

export default function SuperDashboard() {
  const [activeTab, setActiveTab] = useState("setup");
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(true);
  
  // डाटा लिष्टहरू
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [revTitles, setRevTitles] = useState([]);
  const [masterDocs, setMasterDocs] = useState([]);

  // फर्म स्टेटहरू
  const [formData, setFormData] = useState({
    catName: "", serviceName: "", serviceCatId: "",
    revService: "", revProvince: "", revTitle: "", revRate: "", revRemarks: "",
    docName: "", docHover: "", docClick: "",
    mapServiceId: "", mapDocId: "", mapGroupName: "सबैलाई चाहिने"
  });

  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    setRole(profile?.role || "viewer");
    if (profile?.role !== 'admin' && profile?.role !== 'editor') return;
    fetchInitialData();
    setLoading(false);
  };

  const fetchInitialData = async () => {
    const { data: cats } = await supabase.from('categories').select('*');
    const { data: srvs } = await supabase.from('services').select('*, categories(name)');
    const { data: provs } = await supabase.from('provinces').select('*');
    const { data: titles } = await supabase.from('revenue_titles').select('*');
    const { data: mDocs } = await supabase.from('document_master').select('*');
    
    setCategories(cats || []);
    setServices(srvs || []);
    setProvinces(provs || []);
    setRevTitles(titles || []);
    setMasterDocs(mDocs || []);
  };

  // १. सेवा र किसिम थप्ने
  const addCategory = async () => {
    await supabase.from('categories').insert([{ name: formData.catName }]);
    alert("मुख्य सेवा थपियो"); fetchInitialData();
  };
  const addService = async () => {
    await supabase.from('services').insert([{ name: formData.serviceName, category_id: formData.serviceCatId, status: 'approved' }]);
    alert("सेवाको किसिम थपियो"); fetchInitialData();
  };

  // २. कागजात मास्टर र म्यापिङ
  const addMasterDoc = async () => {
    await supabase.from('document_master').insert([{ name: formData.docName, hover_note: formData.docHover, click_detail: formData.docClick }]);
    alert("कागजात मास्टर लिस्टमा थपियो"); fetchInitialData();
  };
  const mapDocToService = async (docId) => {
    if (!formData.mapServiceId) return alert("पहिले सेवाको किसिम छान्नुहोस्");
    const { error } = await supabase.from('service_document_map').insert([{ 
      service_id: formData.mapServiceId, 
      document_id: docId, 
      group_name: formData.mapGroupName 
    }]);
    if (error) alert("यो कागजात पहिले नै थपिएको छ");
    else alert("म्यापिङ सफल!");
  };

  // ३. राजश्व विवरण
  const addRevenue = async () => {
    await supabase.from('revenue_details').insert([{
      service_id: formData.revService, province_id: formData.revProvince,
      title_id: formData.revTitle, rate_detail: formData.revRate, remarks: formData.revRemarks
    }]);
    alert("राजश्व विवरण थपियो");
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>लोड हुँदैछ...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', background: '#f0f4f8', minHeight: '100vh' }}>
      <header style={headerStyle}>
        <h2>भूमि प्रशासन सुपर ड्यासबोर्ड ({role})</h2>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab("setup")} style={tabBtn(activeTab==="setup")}><Settings size={16}/> सेटअप</button>
          <button onClick={() => setActiveTab("docs")} style={tabBtn(activeTab==="docs")}><FileText size={16}/> कागजात व्यवस्थापन</button>
          <button onClick={() => setActiveTab("revenue")} style={tabBtn(activeTab==="revenue")}><DollarSign size={16}/> राजश्व विवरण</button>
          <button onClick={() => setActiveTab("workflow")} style={tabBtn(activeTab==="workflow")}><List size={16}/> कार्यप्रक्रिया</button>
        </div>
      </header>

      {/* १. सेटअप: सेवा र किसिम */}
      {activeTab === "setup" && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={card}>
            <h3>मुख्य सेवा थप्नुहोस् (उदा: लिखत पारित)</h3>
            <input type="text" placeholder="नाम" style={input} onChange={e => setFormData({...formData, catName: e.target.value})} />
            <button onClick={addCategory} style={btn}>थप्नुहोस्</button>
          </div>
          <div style={card}>
            <h3>सेवाको किसिम थप्नुहोस् (उदा: राजिनामा)</h3>
            <select style={input} onChange={e => setFormData({...formData, serviceCatId: e.target.value})}>
              <option value="">मुख्य सेवा छान्नुहोस्</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="text" placeholder="किसिमको नाम" style={input} onChange={e => setFormData({...formData, serviceName: e.target.value})} />
            <button onClick={addService} style={btn}>थप्नुहोस्</button>
          </div>
        </div>
      )}

      {/* २. कागजात व्यवस्थापन (मास्टर र म्यापिङ) */}
      {activeTab === "docs" && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
          <div style={card}>
            <h3>१. कागजात मास्टर लिस्ट (Master Pool)</h3>
            <p style={{fontSize: '12px', color: '#666'}}>सबैतिर चाहिने कागजात यहाँ एकैचोटी थप्नुहोस्।</p>
            <input type="text" placeholder="कागजातको नाम" style={input} onChange={e => setFormData({...formData, docName: e.target.value})} />
            <input type="text" placeholder="होभर म्यासेज (म्याद ३५ दिन)" style={input} onChange={e => setFormData({...formData, docHover: e.target.value})} />
            <textarea placeholder="क्लिक विवरण (कानुनको दफा)" style={input} onChange={e => setFormData({...formData, docClick: e.target.value})} />
            <button onClick={addMasterDoc} style={{...btn, background: '#28a745'}}>मास्टर लिस्टमा सुरक्षित गर्नुहोस्</button>
          </div>

          <div style={card}>
            <h3>२. सेवामा कागजात जोड्नुहोस् (Mapping)</h3>
            <select style={input} onChange={e => setFormData({...formData, mapServiceId: e.target.value})}>
              <option value="">सेवाको किसिम छान्नुहोस् (उदा: राजिनामा)</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.categories?.name})</option>)}
            </select>
            <input type="text" placeholder="समूह (उदा: सबैलाई, वारेशनामा भएमा थप)" style={input} value={formData.mapGroupName} onChange={e => setFormData({...formData, mapGroupName: e.target.value})} />
            
            <div style={{maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '5px'}}>
              {masterDocs.map(d => (
                <div key={d.id} style={{display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #eee'}}>
                  <span>{d.name}</span>
                  <button onClick={() => mapDocToService(d.id)} style={{background: '#007bff', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer'}}>
                    <CheckCircle size={14} /> जोड्नुहोस्
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ३. राजश्व विवरण */}
      {activeTab === "revenue" && (
        <div style={card}>
          <h3>राजश्व व्यवस्थापन (Service + Province Wise)</h3>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px'}}>
            <select style={input} onChange={e => setFormData({...formData, revService: e.target.value})}>
              <option value="">सेवाको किसिम</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select style={input} onChange={e => setFormData({...formData, revProvince: e.target.value})}>
              <option value="">प्रदेश</option>
              {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select style={input} onChange={e => setFormData({...formData, revTitle: e.target.value})}>
              <option value="">राजश्व शीर्षक</option>
              {revTitles.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <input type="text" placeholder="दर / विवरण" style={input} onChange={e => setFormData({...formData, revRate: e.target.value})} />
          <textarea placeholder="कैफियत" style={input} onChange={e => setFormData({...formData, revRemarks: e.target.value})} />
          <button onClick={addRevenue} style={{...btn, background: '#28a745'}}>राजश्व विवरण सुरक्षित गर्नुहोस्</button>
        </div>
      )}
    </div>
  );
}

const headerStyle = { background: '#003366', color: '#fff', padding: '20px', borderRadius: '10px' };
const card = { background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '20px' };
const input = { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' };
const btn = { width: '100%', padding: '10px', background: '#003366', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const tabBtn = (active) => ({ padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', background: active ? '#ffcc00' : '#002244', color: active ? '#000' : '#fff', display: 'flex', alignItems: 'center', gap: '5px' });
