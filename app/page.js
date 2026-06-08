"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function AdvancedLandPortal() {
  const [activeTab, setActiveTab] = useState("services"); // services, revenue, workflow
  const [selectedMain, setSelectedMain] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [userPradesh, setUserPradesh] = useState("");

  // १. सेवा र कागजात सेक्सन (तपाईंको बुँदा १-६)
  const renderServiceDetail = () => (
    <div style={detailBox}>
      <button onClick={() => {setSelectedMain(null); setSelectedSub(null);}} style={backBtn}>← पछाडि</button>
      <h2 style={{color: '#003366'}}>{selectedSub?.name}</h2>
      
      {/* कागजात सेक्सन (बुँदा ३, ४, ५) */}
      <section style={sectionStyle}>
        <h4 style={subHeadingStyle}>आवश्यक कागजातहरू</h4>
        <div style={docListStyle}>
          {/* यहाँ डाटाबेसबाट आएका 'group_name' अनुसार कागजातहरू फिल्टर भएर देखिनेछन् */}
          <div style={docItem} title="म्याद ३५ दिन">📄 घरबाटो सिफारिस <small>(i)</small></div>
        </div>
        
        <h4 style={subHeadingStyle}>वारेशनामाबाट बिक्री गर्ने भएमा (थप)</h4>
        <div style={docListStyle}>
          <div style={docItem} onClick={() => alert('अदालत वा राजदुतावासको प्रमाणित...')}>📄 अधिकृत वारेशनामा</div>
        </div>
      </section>

      {/* ध्यान दिनुपर्ने कुराहरू (बुँदा ६) */}
      <section style={cautionStyle}>
        <h4 style={{color: '#d9534f'}}>⚠️ ध्यान दिनुपर्ने कुराहरू</h4>
        <ul>
          <li>स्रेस्तामा जग्गाको किसिम 'खेत' भएमा सिंचाइको प्रमाण चाहिने । <span style={lawTag}>(मुलुकी संहिता दफा २)</span></li>
        </ul>
      </section>
    </div>
  );

  // २. राजश्व विवरण (तपाईंको बुँदा ७)
  const renderRevenue = () => (
    <div style={revenueBox}>
      <h3>राजश्व विवरण हेर्नुहोस्</h3>
      <select onChange={(e) => setUserPradesh(e.target.value)} style={inputStyle}>
        <option>प्रदेश छान्नुहोस्</option>
        <option value="1">कोशी प्रदेश</option>
        <option value="3">बागमती प्रदेश</option>
      </select>

      <table style={tableStyle}>
        <thead>
          <tr style={{background: '#003366', color: '#fff'}}>
            <th>राजश्व शीर्षक</th>
            <th>विवरण / दर</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>रजिष्ट्रेशन दस्तुर</td><td>थैलीको ५%</td></tr>
          <tr><td>लाभकर</td><td>१० लाख माथि भएमा ५%</td></tr>
        </tbody>
      </table>
      <p style={kaifiyatStyle}><strong>कैफियत:</strong> लाभकर १०,००,०० भन्दा माथि थैली भएमा मात्र लाग्छ ।</p>
    </div>
  );

  return (
    <div style={{fontFamily: 'Arial'}}>
      <nav style={navStyle}>
        <button onClick={() => setActiveTab("services")}>सेवा र कागजात</button>
        <button onClick={() => setActiveTab("revenue")}>राजश्व विवरण</button>
        <button onClick={() => setActiveTab("workflow")}>कार्यप्रक्रिया</button>
      </nav>

      <main style={{padding: '20px'}}>
        {activeTab === "services" && !selectedSub && <h1 style={welcomeStyle}>भूमि प्रशासन पोर्टलमा स्वागत छ</h1>}
        {activeTab === "services" && (selectedSub ? renderServiceDetail() : renderCategories())}
        {activeTab === "revenue" && renderRevenue()}
        {activeTab === "workflow" && <div>कार्यप्रक्रियाको फ्लोचार्ट यहाँ देखिनेछ (बुँदा ८)</div>}
      </main>
    </div>
  );
}

// Styles (नमुनाका लागि केही)
const navStyle = { background: '#003366', padding: '15px', display: 'flex', gap: '20px', justifyContent: 'center' };
const subHeadingStyle = { borderBottom: '2px solid #ddd', paddingBottom: '5px', marginTop: '20px', color: '#555' };
const lawTag = { fontSize: '12px', background: '#eee', padding: '2px 5px', borderRadius: '4px', marginLeft: '10px', color: 'blue', cursor: 'pointer' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
const kaifiyatStyle = { marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '5px' };
const welcomeStyle = { textAlign: 'center', margin: '50px 0', color: '#003366' };
