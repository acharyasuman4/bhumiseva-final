"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { FileText, Database, Map, TrendingUp, AlertTriangle, ListChecks } from 'lucide-react';

export default function SuperDashboard() {
  const [activeTab, setActiveTab] = useState("docs"); // docs, mapping, revenue, workflow, caution
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(true);
  
  // डाटाका लागि स्टेटहरू
  const [services, setServices] = useState([]);
  const [masterDocs, setMasterDocs] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [revTitles, setRevTitles] = useState([]);

  // फर्मका लागि स्टेटहरू
  const [selectedService, setSelectedService] = useState("");
  const [newDoc, setNewDoc] = useState({ name: "", hover: "", click: "" });
  const [newRevenue, setNewRevenue] = useState({ province: "", title: "", rate: "", remarks: "" });

  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role === 'viewer') return setRole("viewer");
    setRole(profile.role);
    fetchEverything();
    setLoading(false);
  };

  const fetchEverything = async () => {
    const { data: srv } = await supabase.from('services').select('*');
    const { data: mDocs } = await supabase.from('document_master').select('*');
    const { data: prov } = await supabase.from('provinces').select('*');
    const { data: titles } = await supabase.from('revenue_titles').select('*');
    setServices(srv || []);
    setMasterDocs(mDocs || []);
    setProvinces(prov || []);
    setRevTitles(titles || []);
  };

  // १. मास्टर डकुमेन्ट थप्ने (बुँदा ३)
  const addMasterDoc = async () => {
    const { error } = await supabase.from('document_master').insert([{ name: newDoc.name, hover_note: newDoc.hover, click_detail: newDoc.click }]);
    if (error) alert(error.message); else { alert("Master Document थपियो"); fetchEverything(); }
  };

  // २. सेवामा डकुमेन्ट म्यापिङ गर्ने (बुँदा ३ र ४ - Checkbox System)
  const mapDocToService = async (docId, groupName) => {
    if (!selectedService) return alert("पहिले सेवा छान्नुहोस्");
    const { error } = await supabase.from('service_document_map').insert([{ service_id: selectedService, document_id: docId, group_name: groupName }]);
    if (error) alert("यो कागजात पहिले नै थपिएको हुन सक्छ"); else alert("म्यापिङ सफल!");
  };

  // ३. राजश्व थप्ने (बुँदा ७)
  const addRevenue = async () => {
    const { error } = await supabase.from('revenue_details').insert([{ province_id: newRevenue.province, title_id: newRevenue.title, rate_detail: newRevenue.rate, remarks: newRevenue.remarks }]);
    if (error) alert(error.message); else alert("राजश्व विवरण सुरक्षित भयो");
  };

  if (role === "viewer") return <div style={{textAlign: 'center', padding: '50px'}}>अनुमति छैन।</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', background: '#f8f9fa', minHeight: '100vh' }}>
      <header style={headerStyle}>
        <h2>भूमि प्रशासन सुपर ड्यासबोर्ड ({role})</h2>
        <nav style={subNav}>
          <button onClick={() => setActiveTab("docs")} style={tabBtn(activeTab==="docs")}>कागजात मास्टर</button>
          <button onClick={() => setActiveTab("mapping")} style={tabBtn(activeTab==="mapping")}>सेवा म्यापिङ</button>
          <button onClick={() => setActiveTab("revenue")} style={tabBtn(activeTab==="revenue")}>राजश्व सेटिङ</button>
          <button onClick={() => setActiveTab("workflow")} style={tabBtn(activeTab==="workflow")}>कार्यप्रक्रिया</button>
        </nav>
      </header>

      <main style={{ marginTop: '20px' }}>
        {/* १. मास्टर डकुमेन्ट व्यवस्थापन */}
        {activeTab === "docs" && (
          <div style={card}>
            <h3>📄 मास्टर कागजात लिस्ट (Master Pool)</h3>
            <div style={formGrid}>
              <input type="text" placeholder="कागजातको नाम" onChange={e => setNewDoc({...newDoc, name: e.target.value})} style={input} />
              <input type="text" placeholder="होभर म्यासेज (म्याद ३५ दिन)" onChange={e => setNewDoc({...newDoc, hover: e.target.value})} style={input} />
              <textarea placeholder="क्लिक गर्दा देखिने कानुन" onChange={e => setNewDoc({...newDoc, click: e.target.value})} style={input} />
              <button onClick={addMasterDoc} style={saveBtn}>मास्टर लिस्टमा थप्नुहोस्</button>
            </div>
            <table style={table}>
              <thead><tr><th>कागजात</th><th>होभर</th><th>कार्य</th></tr></thead>
              <tbody>
                {masterDocs.map(d => <tr key={d.id}><td>{d.name}</td><td>{d.hover_note}</td><td>❌</td></tr>)}
              </tbody>
            </table>
          </div>
        )}

        {/* २. म्यापिङ सेक्सन (बुँदा ३ र ४) */}
        {activeTab === "mapping" && (
          <div style={card}>
            <h3>🔗 सेवा र कागजात जोड्नुहोस् (Mapping)</h3>
            <select onChange={e => setSelectedService(e.target.value)} style={input}>
              <option value="">सेवा छान्नुहोस् (उदा: राजिनामा)</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            
            <div style={{marginTop: '20px'}}>
              <h4>मास्टर लिस्टबाट कागजात छान्नुहोस्:</h4>
              {masterDocs.map(d => (
                <div key={d.id} style={mapRow}>
                  <span>{d.name}</span>
                  <input type="text" placeholder="ग्रुप (उदा: वारेशनामा भए थप)" id={`group-${d.id}`} style={{width: '200px'}} />
                  <button onClick={() => mapDocToService(d.id, document.getElementById(`group-${d.id}`).value)} style={smallBtn}>Tick लगाएर जोड्नुहोस्</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ३. राजश्व सेटिङ (बुँदा ७) */}
        {activeTab === "revenue" && (
          <div style={card}>
            <h3>💰 प्रदेशगत राजश्व विवरण</h3>
            <div style={formGrid}>
              <select onChange={e => setNewRevenue({...newRevenue, province: e.target.value})} style={input}>
                <option value="">प्रदेश</option>
                {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select onChange={e => setNewRevenue({...newRevenue, title: e.target.value})} style={input}>
                <option value="">राजश्व शीर्षक</option>
                {revTitles.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
              <input type="text" placeholder="दर (उदा: ५%)" onChange={e => setNewRevenue({...newRevenue, rate: e.target.value})} style={input} />
              <textarea placeholder="कैफियत" onChange={e => setNewRevenue({...newRevenue, remarks: e.target.value})} style={input} />
              <button onClick={addRevenue} style={saveBtn}>राजश्व सुरक्षित गर्नुहोस्</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Styles
const headerStyle = { background: '#003366', color: '#fff', padding: '20px', borderRadius: '10px' };
const subNav = { display: 'flex', gap: '10px', marginTop: '15px' };
const tabBtn = (active) => ({ padding: '10px 15px', background: active ? '#ffcc00' : '#002244', color: active ? '#000' : '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' });
const card = { background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' };
const input = { padding: '10px', marginBottom: '10px', width: '100%', borderRadius: '5px', border: '1px solid #ccc' };
const saveBtn = { padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const table = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
const mapRow = { display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' };
const smallBtn = { padding: '5px 10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
