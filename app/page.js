"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function AdvancedLandPortal() {
  const [activeTab, setActiveTab] = useState("services"); // services, revenue, workflow
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedMain, setSelectedMain] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [docs, setDocs] = useState([]);
  const [notes, setNotes] = useState([]);
  const [userType, setUserType] = useState("personal");
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const { data: catData } = await supabase.from('categories').select('*');
    setCategories(catData || []);
    const { data: provData } = await supabase.from('provinces').select('*');
    setProvinces(provData || []);
  };

  // १. मुख्य क्याटगोरीहरू देखाउने (लिखत पारित, निर्णय आदि)
  const renderCategories = () => (
    <div style={gridStyle}>
      {categories.map(cat => (
        <div key={cat.id} onClick={() => fetchServices(cat)} style={cardStyle}>
          <div style={{fontSize: '40px'}}>📄</div>
          <h3>{cat.name}</h3>
          <button style={btnStyle}>विवरण हेर्नुहोस्</button>
        </div>
      ))}
    </div>
  );

  const fetchServices = async (cat) => {
    setSelectedMain(cat);
    const { data } = await supabase.from('services').select('*').eq('category_id', cat.id).eq('status', 'approved');
    setServices(data || []);
  };

  const fetchServiceDetails = async (sub) => {
    setSelectedSub(sub);
    // कागजातहरू तान्ने
    const { data: docData } = await supabase.from('documents').select('*').eq('service_id', sub.id);
    setDocs(docData || []);
    // ध्यान दिनुपर्ने कुराहरू तान्ने
    const { data: noteData } = await supabase.from('considerations').select('*').eq('service_id', sub.id);
    setNotes(noteData || []);
  };

  // ७. राजश्व विवरण सेक्सन
  const renderRevenue = () => (
    <div style={contentBox}>
      <h3>राजश्व विवरण (Revenue Details)</h3>
      <select onChange={(e) => setSelectedProvince(e.target.value)} style={inputStyle}>
        <option value="">प्रदेश छान्नुहोस्</option>
        {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      
      <table style={tableStyle}>
        <thead>
          <tr style={{background: '#003366', color: '#fff'}}>
            <th style={thStyle}>राजश्व शीर्षक</th>
            <th style={thStyle}>दर / विवरण</th>
            <th style={thStyle}>कैफियत</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={tdStyle}>रजिष्ट्रेशन दस्तुर</td><td style={tdStyle}>५%</td><td style={tdStyle}>-</td></tr>
          <tr><td style={tdStyle}>लाभकर</td><td style={tdStyle}>१०%</td><td style={tdStyle}>१० लाख माथिको थैलीमा लाग्ने</td></tr>
        </tbody>
      </table>
    </div>
  );

  // ८. कार्यप्रक्रिया सेक्सन
  const renderWorkflow = () => (
    <div style={contentBox}>
      <h3>कार्यप्रक्रिया (Workflow Process)</h3>
      <div style={workflowContainer}>
        <div style={workflowStep}>१. अनलाइन फारम / भू-सेवा प्रविष्टि</div>
        <div style={workflowArrow}>↓</div>
        <div style={workflowStep}>२. टोकन प्राप्ति र फाँटमा उपस्थिति</div>
        <div style={workflowArrow}>↓</div>
        <div style={workflowStep}>३. लिखत जाँच र अधिकृतको सदर</div>
        <div style={workflowArrow}>↓</div>
        <div style={workflowStep}>४. राजश्व बुझाउने र रसिद लिने</div>
        <div style={workflowArrow}>↓</div>
        <div style={workflowStep}>५. पूर्जा वा निर्णय प्रतिलिपि प्राप्ति</div>
      </div>
    </div>
  );

  return (
    <div style={{fontFamily: 'Arial', background: '#f4f7f6', minHeight: '100vh'}}>
      {/* स्वागत सन्देश र एनिमेसन */}
      <header style={headerStyle}>
        <h1 className="typewriter">भूमि प्रशासन कार्यालयमा यहाँलाई स्वागत छ...</h1>
        <p style={{color: '#ffcc00'}}>"यो सहयोगी साइट मात्र हो, पूर्ण जानकारीको लागि कार्यालयमा सम्पर्क गर्नुहोला।"</p>
      </header>

      {/* नेभिगेसन मेनु */}
      <nav style={navStyle}>
        <button onClick={() => {setActiveTab("services"); setSelectedMain(null);}} style={tabBtn(activeTab==="services")}>सेवा र कागजात</button>
        <button onClick={() => setActiveTab("revenue")} style={tabBtn(activeTab==="revenue")}>राजश्व विवरण</button>
        <button onClick={() => setActiveTab("workflow")} style={tabBtn(activeTab==="workflow")}>कार्यप्रक्रिया</button>
      </nav>

      <main style={{maxWidth: '1000px', margin: '30px auto', padding: '0 20px'}}>
        {activeTab === "services" && (
          !selectedMain ? renderCategories() : (
            <div style={contentBox}>
              <button onClick={() => setSelectedMain(null)} style={backBtn}>← मुख्य मेनु</button>
              <h2 style={{color: '#003366'}}>{selectedMain.name}</h2>
              
              <div style={{display: 'flex', gap: '10px', margin: '20px 0', flexWrap: 'wrap'}}>
                {services.map(s => (
                  <button key={s.id} onClick={() => fetchServiceDetails(s)} style={s.id === selectedSub?.id ? activeSubBtn : subBtn}>{s.name}</button>
                ))}
              </div>

              {selectedSub && (
                <div style={docSection}>
                   <h3>{selectedSub.name}का लागि आवश्यक कागजातहरू</h3>
                   <div style={{margin: '15px 0'}}>
                      <label><input type="radio" checked={userType === "personal"} onChange={() => setUserType("personal")} /> व्यक्तिगत</label>
                      <label style={{marginLeft: '20px'}}><input type="radio" checked={userType === "institutional"} onChange={() => setUserType("institutional")} /> संस्थागत</label>
                   </div>
                   
                   {/* बुँदा ३ र ४: कागजातको समूह */}
                   {docs.filter(d => d.doc_type === 'common' || d.doc_type === userType).map((d, i) => (
                     <div key={i} title={d.hover_note} onClick={() => d.click_detail && alert(d.click_detail)} style={docItem}>
                        📄 {d.name} {d.hover_note && <span style={infoBadge}>म्याद</span>}
                     </div>
                   ))}

                   {/* बुँदा ६: ध्यान दिनुपर्ने कुराहरू */}
                   {notes.length > 0 && (
                     <div style={noteBox}>
                        <h4 style={{color: '#d9534f'}}>⚠️ ध्यान दिनुपर्ने कुराहरू</h4>
                        {notes.map((n, i) => (
                          <p key={i}>• {n.point} <span onClick={() => n.law_link && window.open(n.law_link)} style={lawLink}>{n.law_reference && `(${n.law_reference})`}</span></p>
                        ))}
                     </div>
                   )}
                </div>
              )}
            </div>
          )
        )}

        {activeTab === "revenue" && renderRevenue()}
        {activeTab === "workflow" && renderWorkflow()}
      </main>

      <style jsx>{`
        .typewriter { overflow: hidden; border-right: .15em solid orange; white-space: nowrap; margin: 0 auto; letter-spacing: .10em; animation: typing 3.5s steps(40, end), blink-caret .75s step-end infinite; font-size: 1.8rem; font-weight: bold; max-width: fit-content; }
        @keyframes typing { from { width: 0 } to { width: 100% } }
        @keyframes blink-caret { from, to { border-color: transparent } 50% { border-color: orange; } }
      `}</style>
    </div>
  );
}

// --- Styles ---
const headerStyle = { background: '#003366', color: 'white', padding: '50px 20px', textAlign: 'center' };
const navStyle = { display: 'flex', justifyContent: 'center', gap: '10px', background: '#e9ecef', padding: '10px' };
const tabBtn = (active) => ({ padding: '10px 20px', border: 'none', background: active ? '#003366' : 'transparent', color: active ? 'white' : '#333', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' });
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' };
const cardStyle = { background: 'white', padding: '30px', borderRadius: '15px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
const contentBox = { background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' };
const btnStyle = { background: '#003366', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', marginTop: '15px', cursor: 'pointer' };
const subBtn = { padding: '8px 15px', borderRadius: '5px', border: '1px solid #003366', background: 'white', cursor: 'pointer' };
const activeSubBtn = { ...subBtn, background: '#003366', color: 'white' };
const docItem = { background: '#fff', padding: '15px', marginBottom: '10px', borderRadius: '8px', borderLeft: '5px solid #003366', cursor: 'help', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
const infoBadge = { fontSize: '10px', background: '#007bff', color: 'white', padding: '2px 5px', borderRadius: '10px', marginLeft: '10px' };
const noteBox = { marginTop: '30px', padding: '20px', background: '#fff3cd', borderRadius: '10px', border: '1px solid #ffeeba' };
const lawLink = { color: 'blue', cursor: 'pointer', fontSize: '12px', marginLeft: '10px', textDecoration: 'underline' };
const backBtn = { border: 'none', background: 'none', color: 'blue', cursor: 'pointer', marginBottom: '10px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
const thStyle = { padding: '12px', border: '1px solid #ddd', textAlign: 'left' };
const tdStyle = { padding: '10px', border: '1px solid #ddd' };
const inputStyle = { padding: '10px', width: '100%', marginBottom: '20px', borderRadius: '5px', border: '1px solid #ccc' };
const workflowContainer = { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' };
const workflowStep = { background: '#003366', color: 'white', padding: '15px 30px', borderRadius: '30px', width: '80%', textAlign: 'center', fontWeight: 'bold' };
const workflowArrow = { fontSize: '24px', margin: '10px 0', color: '#003366' };
