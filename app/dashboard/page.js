"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // फर्मका स्टेटहरू
  const [title, setTitle] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // युजरको रोल तान्ने
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    setRole(profile?.role || 'viewer');

    // क्याटगोरी र सेवाहरू तान्ने
    const { data: catData } = await supabase.from('categories').select('*');
    setCategories(catData || []);
    setSelectedCat(catData?.[0]?.id || "");

    fetchServices();
    setLoading(false);
  };

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select(`*, categories(name)`);
    setServices(data || []);
  };

  const handleAddService = async () => {
    if (!title) return alert("सेवाको नाम लेख्नुहोस्");
    
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('services').insert([
      { name: title, category_id: selectedCat, status: 'pending', created_by: user.id }
    ]);

    if (error) alert("Error: " + error.message);
    else {
      alert("सेवा थपियो! एड्मिनले एप्रुभ गरेपछि होमपेजमा देखिनेछ।");
      setTitle("");
      fetchServices();
    }
  };

  const handleApprove = async (id) => {
    const { error } = await supabase.from('services').update({ status: 'approved' }).eq('id', id);
    if (error) alert(error.message);
    else {
      alert("Approved Successfully!");
      fetchServices();
    }
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>लोड हुँदैछ...</div>;
  if (role === 'viewer') return <div style={{padding: '50px', textAlign: 'center'}}>तपाईंलाई यो पेज हेर्ने अनुमति छैन। कृपया एड्मिनसँग सम्पर्क गर्नुहोस्।</div>;

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #003366', paddingBottom: '10px' }}>
        <h1 style={{ color: '#003366' }}>भूमि प्रशासन ड्यासबोर्ड</h1>
        <span style={{ background: '#ffcc00', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>रोल: {role}</span>
      </div>

      {/* नयाँ सेवा थप्ने फर्म (एडिटर र एड्मिन दुवैले पाउने) */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h3>नयाँ सेवा थप्नुहोस् (Add New Service)</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <input 
            type="text" placeholder="सेवाको नाम (उदा: राजिनामा)" 
            value={title} onChange={(e) => setTitle(e.target.value)} 
            style={{ flex: 2, padding: '10px' }} 
          />
          <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} style={{ flex: 1, padding: '10px' }}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={handleAddService} style={{ background: 'green', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer' }}>थप्नुहोस्</button>
        </div>
      </div>

      {/* सेवाहरूको लिष्ट र एप्रुभल (एड्मिनले मात्र एप्रुभ गर्न पाउने) */}
      <div style={{ marginTop: '40px' }}>
        <h2>हालका सेवाहरू (All Services)</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#003366', color: 'white' }}>
              <th style={tdStyle}>सेवाको नाम</th>
              <th style={tdStyle}>क्याटगोरी</th>
              <th style={tdStyle}>अवस्था (Status)</th>
              <th style={tdStyle}>कार्य (Action)</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={tdStyle}>{s.name}</td>
                <td style={tdStyle}>{s.categories?.name}</td>
                <td style={tdStyle}>
                   <span style={{ color: s.status === 'approved' ? 'green' : 'orange', fontWeight: 'bold' }}>{s.status}</span>
                </td>
                <td style={tdStyle}>
                  {role === 'admin' && s.status === 'pending' && (
                    <button onClick={() => handleApprove(s.id)} style={{ background: 'blue', color: 'white', padding: '5px 10px', cursor: 'pointer' }}>Approve</button>
                  )}
                  {s.status === 'approved' && <span>✅</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const tdStyle = { padding: '12px', textAlign: 'left' };
