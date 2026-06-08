"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { PlusCircle, FileText, Settings, DollarSign, List } from 'lucide-react';

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
    catName: "",
    serviceName: "",
    serviceCatId: "",
    revService: "",
    revProvince: "",
    revTitle: "",
    revRate: "",
    revRemarks: ""
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

  // १. सेवा (Category) र किसिम (Service) थप्ने
  const addCategory = async () => {
    await supabase.from('categories').insert([{ name: formData.catName }]);
    alert("मुख्य सेवा थपियो"); fetchInitialData();
  };

  const addService = async () => {
    await supabase.from('services').insert([{ name: formData.serviceName, category_id: formData.serviceCatId, status: 'approved' }]);
    alert("सेवाको किसिम थपियो"); fetchInitialData();
  };

  // २. राजश्व विवरण थप्ने (Service + Province + Multi-title)
  const addRevenue = async () => {
    const { error } = await supabase.from('revenue_details').insert([{
      service_id: formData.revService,
      province_id: formData.revProvince,
      title_id: formData.revTitle,
      rate_detail: formData.revRate,
      remarks: formData.revRemarks
    }]);
    if (error) alert(error.message); else alert("राजश्व विवरण थपियो");
  };

  if (role === "viewer") return <div style={{textAlign: 'center', padding: '50px'}}>अनुमति छैन।</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', background: '#f0f4f8', minHeight: '100vh' }}>
      <header style={{ background: '#003366', color: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2>भूमि प्रशासन प्रशासन प्यानल ({role})</h2>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab("setup")} style={tabBtn(activeTab==="setup")}><Settings size={16}/> सेटअप</button>
          <button onClick={() => setActiveTab("docs")} style={tabBtn(activeTab==="docs")}><FileText size={16}/> कागजात मास्टर</button>
          <button onClick={() => setActiveTab("revenue")} style={tabBtn(activeTab==="revenue")}><DollarSign size={16}/> राजश्व विवरण</button>
          <button onClick={() => setActiveTab("workflow")} style={tabBtn(activeTab==="workflow")}><List size={16}/> कार्यप्रक्रिया</button>
        </div>
      </header>

      {/* १. सेटअप ट्याब: सेवा र किसिम थप्ने */}
      {activeTab === "setup" && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={card}>
            <h3>मुख्य सेवा थप्नुहोस् (Category)</h3>
            <input type="text" placeholder="उदा: लिखत पारित" style={input} onChange={e => setFormData({...formData, catName: e.target.value})} />
            <button onClick={addCategory} style={btn}>थप्नुहोस्</button>
            <div style={{marginTop: '10px'}}>{categories.map(c => <span key={c.id} style={badge}>{c.name}</span>)}</div>
          </div>
          <div style={card}>
            <h3>सेवाको किसिम थप्नुहोस् (Service Type)</h3>
            <select style={input} onChange={e => setFormData({...formData, serviceCatId: e.target.value})}>
              <option value="">मुख्य सेवा छान्नुहोस्</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="text" placeholder="उदा: राजिनामा" style={input} onChange={e => setFormData({...formData, serviceName: e.target.value})} />
            <button onClick={addService} style={btn}>किसिम थप्नुहोस्</button>
          </div>
        </div>
      )}

      {/* २. राजश्व ट्याब: सेवा र प्रदेश अनुसार विवरण */}
      {activeTab === "revenue" && (
        <div style={card}>
          <h3>राजश्व व्यवस्थापन (Service + Province Wise)</h3>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px'}}>
            <select style={input} onChange={e => setFormData({...formData, revService: e.target.value})}>
              <option value="">सेवाको किसिम छान्नुहोस् (उदा: राजिनामा)</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.categories?.name})</option>)}
            </select>
            <select style={input} onChange={e => setFormData({...formData, revProvince: e.target.value})}>
              <option value="">प्रदेश छान्नुहोस्</option>
              {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select style={input} onChange={e => setFormData({...formData, revTitle: e.target.value})}>
              <option value="">राजश्व शीर्षक छान्नुहोस्</option>
              {revTitles.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <input type="text" placeholder="राजश्व दर / विवरण" style={input} onChange={e => setFormData({...formData, revRate: e.target.value})} />
          <textarea placeholder="कैफियत (उदा: १० लाख माथिको थैलीमा मात्र)" style={input} onChange={e => setFormData({...formData, revRemarks: e.target.value})} />
          <button onClick={addRevenue} style={{...btn, background: '#28a745'}}>राजश्व विवरण थप्नुहोस्</button>
        </div>
      )}

      {/* ३. कागजात मास्टर र म्यापिङ (पहिलेकै कोड जस्तै) */}
      {activeTab === "docs" && <div style={card}>कागजात मास्टर र सेवा म्यापिङको लागि अघिल्लो कोडको डकुमेन्ट सेक्सन यहाँ राख्न सकिन्छ।</div>}

    </div>
  );
}

const card = { background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
const input = { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' };
const btn = { width: '100%', padding: '10px', background: '#003366', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const tabBtn = (active) => ({ padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', background: active ? '#ffcc00' : '#002244', color: active ? '#000' : '#fff', display: 'flex', alignItems: 'center', gap: '5px' });
const badge = { background: '#e0e0e0', padding: '5px 10px', borderRadius: '15px', marginRight: '5px', fontSize: '12px' };
