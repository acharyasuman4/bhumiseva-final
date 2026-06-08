"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedMain, setSelectedMain] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [docs, setDocs] = useState([]);
  const [userType, setUserType] = useState("personal");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const { data: catData } = await supabase.from('categories').select('*');
    setCategories(catData || []);
  };

  const showServices = async (cat) => {
    setSelectedMain(cat);
    const { data } = await supabase.from('services').select('*').eq('category_id', cat.id).eq('status', 'approved');
    setServices(data || []);
  };

  const showDocs = async (sub) => {
    setSelectedSub(sub);
    const { data } = await supabase.from('documents').select('*').eq('service_id', sub.id);
    setDocs(data || []);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <header style={{ background: '#003366', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{fontSize: '2.5rem'}}>भूमि प्रशासन सेवा पोर्टल</h1>
        <p>"यो सहयोगी साइट मात्र हो, आधिकारिक जानकारीको लागि कार्यालयमा सम्पर्क गर्नुहोला।"</p>
      </header>

      <main style={{ maxWidth: '900px', margin: '40px auto', padding: '20px' }}>
        {!selectedMain ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            {categories.map(cat => (
              <div key={cat.id} onClick={() => showServices(cat)} style={cardStyle}>
                <h3>{cat.name}</h3>
                <button style={btnStyle}>विवरण हेर्नुहोस्</button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <button onClick={() => {setSelectedMain(null); setSelectedSub(null);}} style={{ cursor: 'pointer', border: 'none', background: 'none', color: 'blue' }}>← पछाडि</button>
            <h2 style={{ color: '#003366' }}>{selectedMain.name}</h2>
            
            <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
              {services.map(s => (
                <button key={s.id} onClick={() => showDocs(s)} style={s.id === selectedSub?.id ? activeBtn : srvBtn}>{s.name}</button>
              ))}
            </div>

            {selectedSub && (
              <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px' }}>
                <div style={{ marginBottom: '15px' }}>
                  <label><input type="radio" checked={userType === "personal"} onChange={() => setUserType("personal")} /> व्यक्तिगत</label>
                  <label style={{ marginLeft: '20px' }}><input type="radio" checked={userType === "institutional"} onChange={() => setUserType("institutional")} /> संस्थागत</label>
                </div>
                {docs.filter(d => d.doc_type === 'common' || d.doc_type === userType).map((d, i) => (
                  <div key={i} title={d.hover_note} onClick={() => d.click_detail && alert(d.click_detail)} style={docStyle}>
                    📄 {d.name} {d.hover_note && <span style={{fontSize: '11px', color: 'blue'}}>(Info)</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const cardStyle = { background: 'white', padding: '30px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
const btnStyle = { background: '#003366', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const srvBtn = { padding: '10px 15px', borderRadius: '5px', border: '1px solid #003366', background: 'white', cursor: 'pointer' };
const activeBtn = { ...srvBtn, background: '#003366', color: 'white' };
const docStyle = { background: 'white', padding: '15px', marginBottom: '10px', borderRadius: '8px', borderLeft: '5px solid #003366', cursor: 'help' };
