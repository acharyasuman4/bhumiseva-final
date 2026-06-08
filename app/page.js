"use client";
import React, { useState, useEffect } from 'react';
import { Search, FileText, Scale, Lock, Info, ChevronLeft } from 'lucide-react';

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedMain, setSelectedMain] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [userType, setUserType] = useState("personal");

  // डाटाबेसको सट्टा अहिलेका लागि पूर्ण डाटा यहाँ छ (यसलाई पछि सुपाबेसबाट तान्न सकिन्छ)
  const services = [
    {
      id: "likhat", title: "लिखत पारित", icon: <FileText size={40} />,
      subs: [
        { 
          name: "राजिनामा", 
          common: [{ name: "जग्गाधनी प्रमाणपुर्जा", hint: "सक्कल", law: "मुलुकी देवानी संहिता २०७४ बमोजिम" }],
          personal: [{ name: "घरबाटो सिफारिस", hint: "म्याद ३५ दिन", law: "स्थानीय तहबाट जारी भएको हुनुपर्ने।" }],
          business: [{ name: "संस्था दर्ता प्रमाणपत्र", hint: "प्रमाणित प्रतिलिपि", law: "नविकरण भएको हुनुपर्ने।" }]
        },
        { name: "हालैदेखिको बकसपत्र", common: [], personal: [], business: [] },
        { name: "अंश वण्डा", common: [], personal: [], business: [] }
      ]
    },
    { id: "nirnay", title: "निर्णय सम्बन्धी", icon: <Scale size={40} />, subs: [{ name: "नामसारी" }, { name: "अदालतको फैसला" }] },
    { id: "rokka", title: "रोक्का फुकुवा सम्बन्धी", icon: <Lock size={40} />, subs: [{ name: "दृष्टिबन्धकी रोक्का" }, { name: "ठाडो रोक्का" }] }
  ];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* १. ड्यासबोर्ड र स्वागत सन्देश */}
      <header style={headerStyle}>
        <div className="typewriter">भूमि प्रशासन कार्यालयमा यहाँलाई स्वागत छ...</div>
        <p style={{ color: '#ffcc00', marginTop: '10px' }}>"यो सहयोगी साइट मात्र हो, पूर्ण जानकारीको लागि कार्यलयमा सम्पर्क गर्नुहोला।"</p>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        {/* २. सर्च बक्स */}
        {!selectedMain && (
          <div style={searchContainer}>
            <h2 style={{ color: '#003366' }}>के सेवा गरौँ?</h2>
            <div style={searchBox}>
              <Search style={{ color: '#666' }} />
              <input 
                type="text" placeholder="राजिनामा, नामसारी, रोक्का फुकुवा सर्च गर्नुहोस्..." 
                style={searchInput} onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ३. मुख्य कार्डहरू */}
        {!selectedMain && (
          <div style={gridStyle}>
            {services.filter(s => s.title.includes(search)).map(s => (
              <div key={s.id} style={cardStyle} onClick={() => setSelectedMain(s)}>
                <div style={{ color: '#003366' }}>{s.icon}</div>
                <h3>{s.title}</h3>
                <button style={viewBtn}>विवरण हेर्नुहोस्</button>
              </div>
            ))}
          </div>
        )}

        {/* ४. भित्रि सेवा र कागजात विवरण */}
        {selectedMain && (
          <div style={detailPanel}>
            <button onClick={() => {setSelectedMain(null); setSelectedSub(null);}} style={backBtn}><ChevronLeft /> पछाडि फर्कनुहोस्</button>
            <h2 style={{ color: '#003366', borderBottom: '2px solid #ddd' }}>{selectedMain.title}</h2>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '20px 0' }}>
              {selectedMain.subs.map(sub => (
                <button key={sub.name} onClick={() => setSelectedSub(sub)} style={sub === selectedSub ? activeSub : subBtn}>{sub.name}</button>
              ))}
            </div>

            {selectedSub && (
              <div style={docBox}>
                <h3>{selectedSub.name}का लागि आवश्यक कागजातहरू</h3>
                <div style={{ marginBottom: '20px' }}>
                  <label><input type="radio" checked={userType === "personal"} onChange={() => setUserType("personal")} /> व्यक्तिगत</label>
                  <label style={{ marginLeft: '20px' }}><input type="radio" checked={userType === "business"} onChange={() => setUserType("business")} /> संस्थागत</label>
                </div>
                {selectedSub.common?.map((d, i) => <DocItem key={i} doc={d} />)}
                {(userType === "personal" ? selectedSub.personal : selectedSub.business)?.map((d, i) => <DocItem key={i} doc={d} />)}
              </div>
            )}
          </div>
        )}
      </main>

      <style jsx>{`
        .typewriter {
          overflow: hidden; border-right: .15em solid orange; white-space: nowrap; margin: 0 auto; letter-spacing: .10em;
          animation: typing 3.5s steps(40, end), blink-caret .75s step-end infinite; font-size: 1.8rem; font-weight: bold;
        }
        @keyframes typing { from { width: 0 } to { width: 100% } }
        @keyframes blink-caret { from, to { border-color: transparent } 50% { border-color: orange; } }
      `}</style>
    </div>
  );
}

// कागजातको सानो कम्पोनेन्ट (Hover/Click को लागि)
function DocItem({ doc }) {
  return (
    <div style={docItemStyle} title={doc.hint} onClick={() => alert(doc.law)}>
      <span>📄 {doc.name}</span>
      <Info size={16} style={{ color: '#007bff' }} />
    </div>
  );
}

// --- Style Objects ---
const headerStyle = { background: '#003366', color: 'white', padding: '60px 20px', textAlign: 'center' };
const searchContainer = { textAlign: 'center', margin: '40px 0' };
const searchBox = { display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px 20px', borderRadius: '30px', border: '2px solid #003366', maxWidth: '600px', margin: '0 auto' };
const searchInput = { border: 'none', outline: 'none', width: '100%', fontSize: '1rem' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' };
const cardStyle = { background: 'white', padding: '30px', borderRadius: '15px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
const viewBtn = { background: '#003366', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', marginTop: '15px', cursor: 'pointer' };
const detailPanel = { background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' };
const backBtn = { display: 'flex', alignItems: 'center', gap: '5px', color: '#003366', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' };
const subBtn = { padding: '10px 15px', borderRadius: '5px', border: '1px solid #003366', background: 'white', cursor: 'pointer' };
const activeSub = { ...subBtn, background: '#003366', color: 'white' };
const docBox = { marginTop: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '10px' };
const docItemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '15px', marginBottom: '10px', borderRadius: '8px', borderLeft: '5px solid #003366', cursor: 'help', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
