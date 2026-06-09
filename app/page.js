"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { Search, Info, ChevronRight, AlertCircle, HelpCircle } from 'lucide-react';

export default function HomePortal() {
  const [categories, setCategories] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [groupedDocs, setGroupedDocs] = useState({});
  const [revenue, setRevenue] = useState([]);
  const [search, setSearch] = useState("");
  const [pradesh, setPradesh] = useState("");

  useEffect(() => {
    supabase.from('categories').select('*').then(({data}) => setCategories(data || []));
  }, []);

  const loadDetails = async (sub) => {
    setSelectedSub(sub);
    // १. डकुमेन्ट तान्ने (Category + Service - Exceptions)
    const { data: maps } = await supabase.from('service_document_map').select('*, document_master(*)').or(`category_id.eq.${sub.category_id},service_id.eq.${sub.id}`);
    const { data: ex } = await supabase.from('document_exceptions').select('document_id').eq('service_id', sub.id);
    const exIds = ex?.map(e => e.document_id) || [];
    
    const filtered = maps?.filter(m => !exIds.includes(m.document_id)) || [];
    const groups = filtered.reduce((acc, item) => {
      const g = item.group_name || "आवश्यक कागजात";
      if (!acc[g]) acc[g] = [];
      acc[g].push(item.document_master);
      return acc;
    }, {});
    setGroupedDocs(groups);

    // २. राजश्व तान्ने
    const { data: rev } = await supabase.from('revenue_details').select('*, revenue_titles(title)').eq('service_id', sub.id);
    setRevenue(rev || []);
  };

  return (
    <div style={{ fontFamily: 'Arial', background: '#f4f7f6', minHeight: '100vh' }}>
      <header style={headerStyle}>
        <div className="typewriter">भूमि प्रशासन कार्यालयमा यहाँलाई स्वागत छ...</div>
        <p style={{color: '#ffcc00'}}>"यो सहयोगी साइट मात्र हो, पूर्ण जानकारीको लागि कार्यालयमा सम्पर्क गर्नुहोला।"</p>
      </header>

      <main style={{ maxWidth: '1100px', margin: '30px auto', padding: '20px' }}>
        <div style={searchContainer}>
          <Search size={20} />
          <input type="text" placeholder="के सेवा गरौँ? (राजिनामा, नामसारी, रोक्का...)" onChange={e => setSearch(e.target.value)} style={searchInput} />
        </div>

        {!selectedSub ? (
          <div style={grid}>
            {categories.map(cat => (
              <div key={cat.id} style={catCard}>
                <h3 style={{color: '#003366', borderBottom: '2px solid #003366'}}>{cat.name}</h3>
                <ServiceList catId={cat.id} onSelect={loadDetails} search={search} />
              </div>
            ))}
          </div>
        ) : (
          <div style={detailPage}>
            <button onClick={() => setSelectedSub(null)} style={backBtn}>← मुख्य मेनु</button>
            <h2 style={{color: '#003366'}}>{selectedSub.name}</h2>
            
            <div style={section}>
              {Object.keys(groupedDocs).map(group => (
                <div key={group} style={{marginBottom: '20px'}}>
                  <h4 style={groupHeading}>{group}</h4>
                  {groupedDocs[group].map(doc => (
                    <div key={doc.id} style={docItem} title={doc.hover_note} onClick={() => doc.click_detail && alert(doc.click_detail)}>
                      📄 {doc.name} {doc.hover_note && <span style={badge}>म्याद/थप जानकारी</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {revenue.length > 0 && (
              <div style={section}>
                <h4 style={groupHeading}>राजश्व विवरण</h4>
                <table style={table}>
                  <thead><tr style={{background:'#eee'}}><th>शीर्षक</th><th>दर</th><th>कैफियत</th></tr></thead>
                  <tbody>{revenue.map(r => <tr key={r.id}><td>{r.revenue_titles?.title}</td><td>{r.rate}</td><td>{r.remarks}</td></tr>)}</tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <style jsx>{`
        .typewriter { overflow: hidden; border-right: .15em solid orange; white-space: nowrap; margin: 0 auto; letter-spacing: .10em; animation: typing 3.5s steps(40, end), blink-caret .75s step-end infinite; font-size: 1.8rem; font-weight: bold; max-width: fit-content; }
        @keyframes typing { from { width: 0 } to { width: 100% } }
        @keyframes blink-caret { from, to { border-color: transparent } 50% { border-color: orange; } }
      `}</style>
    </div>
  );
}

function ServiceList({ catId, onSelect, search }) {
  const [srvs, setSrvs] = useState([]);
  useEffect(() => {
    supabase.from('services').select('*').eq('category_id', catId).then(({data}) => setSrvs(data || []));
  }, [catId]);
  
  return srvs.filter(s => s.name.includes(search)).map(s => (
    <div key={s.id} onClick={() => onSelect(s)} style={srvItem}>{s.name} <ChevronRight size={16} /></div>
  ));
}

// Styles
const headerStyle = { background: '#003366', color: 'white', padding: '60px 20px', textAlign: 'center' };
const searchContainer = { display: 'flex', alignItems: 'center', background: '#fff', padding: '15px 25px', borderRadius: '35px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', maxWidth: '700px', margin: '0 auto 40px', gap: '10px' };
const searchInput = { border: 'none', outline: 'none', width: '100%', fontSize: '1.1rem' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' };
const catCard = { background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const srvItem = { display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #eee', cursor: 'pointer', color: '#444' };
const detailPage = { background: '#fff', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' };
const groupHeading = { borderBottom: '3px solid #003366', paddingBottom: '8px', marginBottom: '15px', color: '#003366', fontWeight: 'bold' };
const docItem = { padding: '15px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'help' };
const badge = { fontSize: '10px', background: '#007bff', color: '#fff', padding: '2px 8px', borderRadius: '10px' };
const backBtn = { border: 'none', background: 'none', color: 'blue', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' };
const table = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
const section = { marginBottom: '30px' };
