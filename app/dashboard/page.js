"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function Dashboard() {
  const [services, setServices] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("लिखत पारित");
  const [role, setRole] = useState("editor");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*');
    setServices(data || []);
  };

  const handleAdd = async () => {
    const { error } = await supabase.from('services').insert([
      { title, category, status: 'pending' }
    ]);
    if (error) alert(error.message);
    else {
      alert("सेवा थपियो! एड्मिनको एप्रुभल आवश्यक छ।");
      fetchServices();
    }
  };

  const handleApprove = async (id) => {
    await supabase.from('services').update({ status: 'approved' }).eq('id', id);
    alert("एप्रुभ भयो!");
    fetchServices();
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      <h1>ड्यासबोर्ड ({role})</h1>
      <div style={{ background: '#eee', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
        <h3>नयाँ सेवा थप्नुहोस्</h3>
        <input type="text" placeholder="सेवाको नाम" onChange={(e) => setTitle(e.target.value)} style={{ padding: '10px', marginRight: '10px' }} />
        <select onChange={(e) => setCategory(e.target.value)} style={{ padding: '10px', marginRight: '10px' }}>
          <option value="लिखत पारित">लिखत पारित</option>
          <option value="निर्णय सम्बन्धी">निर्णय सम्बन्धी</option>
          <option value="रोक्का फुकुवा">रोक्का फुकुवा</option>
        </select>
        <button onClick={handleAdd} style={{ padding: '10px 20px', background: 'green', color: 'white', border: 'none' }}>थप्नुहोस्</button>
      </div>

      <h2>सबै सेवाहरू</h2>
      {services.map(s => (
        <div key={s.id} style={{ borderBottom: '1px solid #ccc', padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{s.title} ({s.category}) - <strong>{s.status}</strong></span>
          {s.status === 'pending' && (
            <button onClick={() => handleApprove(s.id)} style={{ background: 'blue', color: 'white' }}>Approve</button>
          )}
        </div>
      ))}
    </div>
  );
}
