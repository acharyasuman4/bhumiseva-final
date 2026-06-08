"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [role, setRole] = useState("viewer");
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // फर्म स्टेटहरू
  const [serviceName, setServiceName] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("common");
  const [hoverNote, setHoverNote] = useState("");
  const [clickDetail, setClickDetail] = useState("");

  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    setRole(profile?.role || 'viewer');

    const { data: catData } = await supabase.from('categories').select('*');
    setCategories(catData || []);
    setSelectedCat(catData?.[0]?.id || "");

    fetchData();
    setLoading(false);
  };

  const fetchData = async () => {
    const { data: srvData } = await supabase.from('services').select('*, categories(name)');
    setServices(srvData || []);
  };

  // १. नयाँ सेवा थप्ने (राजिनामा, नामसारी आदि)
  const addService = async () => {
    if (!serviceName) return alert("नाम लेख्नुहोस्");
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('services').insert([{ name: serviceName, category_id: selectedCat, created_by: user.id, status: 'approved' }]);
    alert("सेवा थपियो");
    setServiceName("");
    fetchData();
  };

  // २. कागजात थप्ने (Hover र Click विवरण सहित)
  const addDocument = async () => {
    if (!selectedService || !docName) return alert("सेवा छान्नुहोस् र कागजातको नाम लेख्नुहोस्");
    const { error } = await supabase.from('documents').insert([{
      service_id: selectedService,
      name: docName,
      doc_type: docType,
      hover_note: hoverNote,
      click_detail: clickDetail
    }]);
    if (error) alert(error.message);
    else {
      alert("कागजात थपियो");
      setDocName(""); setHoverNote(""); setClickDetail("");
    }
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>लोड हुँदैछ...</div>;

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: '#003366', borderBottom: '2px solid #003366' }}>भूमि प्रशासन ड्यासबोर्ड ({role})</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
        
        {/* सेवा थप्ने फर्म */}
        <div style={formCard}>
          <h3>१. नयाँ सेवा थप्नुहोस्</h3>
          <select onChange={(e) => setSelectedCat(e.target.value)} style={inputStyle}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="text" placeholder="सेवाको नाम (उदा: राजिनामा)" value={serviceName} onChange={(e) => setServiceName(e.target.value)} style={inputStyle} />
          <button onClick={addService} style={btnStyle}>सेवा सुरक्षित गर्नुहोस्</button>
        </div>

        {/* कागजात थप्ने फर्म */}
        <div style={formCard}>
          <h3>२. आवश्यक कागजात थप्नुहोस्</h3>
          <select onChange={(e) => setSelectedService(e.target.value)} style={inputStyle}>
            <option value="">सेवा छान्नुहोस्</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input type="text" placeholder="कागजातको नाम (उदा: नागरिकता)" value={docName} onChange={(e) => setDocName(e.target.value)} style={inputStyle} />
          <select onChange={(e) => setDocType(e.target.value)} style={inputStyle}>
            <option value="common">सबैको लागि (Common)</option>
            <option value="personal">व्यक्तिगत मात्र</option>
            <option value="institutional">संस्थागत मात्र</option>
          </select>
          <input type="text" placeholder="होभर गर्दा देखिने (उदा: म्याद ३५ दिन)" value={hoverNote} onChange={(e) => setHoverNote(e.target.value)} style={inputStyle} />
          <textarea placeholder="क्लिक गर्दा देखिने कानुनको विवरण" value={clickDetail} onChange={(e) => setClickDetail(e.target.value)} style={{...inputStyle, height: '60px'}} />
          <button onClick={addDocument} style={{...btnStyle, background: '#28a745'}}>कागजात सुरक्षित गर्नुहोस्</button>
        </div>

      </div>
    </div>
  );
}

const formCard = { background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
const inputStyle = { display: 'block', width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '10px', background: '#003366', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' };
