"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { Search, ChevronRight, Info, AlertTriangle } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState("services");
  const [categories, setCategories] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [groupedDocs, setGroupedDocs] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => { 
    supabase.from('categories').select('*').then(({data}) => setCategories(data || []));
  }, []);

  const loadServiceDetails = async (sub) => {
    setSelectedSub(sub);
    // १. म्यापिङ तान्ने (Category र Service दुवै)
    const { data: allMaps } = await supabase.from('service_document_map').select('*, document_master(*)').or(`category_id.eq.${sub.category_id},service_id.eq.${sub.id}`);
    // २. अपवाद (Exclusions) तान्ने
    const { data: ex } = await supabase.from('document_exceptions').select('document_id').eq('service_id', sub.id);
    const exIds = ex?.map(e => e.document_id) || [];

    // ३. फिल्टरिङ र ग्रुपिङ
    const filtered = allMaps?.filter(m => !exIds.includes(m.document_id)) || [];
    const groups = filtered.reduce((acc, item) => {
      const g = item.group_name || "आवश्यक कागजात";
      if (!acc[g]) acc[g] = [];
      acc[g].push(item.document_master);
      return acc;
    }, {});
    setGroupedDocs(groups);
  };

  return (
    <div style={{fontFamily: 'Arial', background: '#f8f9fa', minHeight: '100vh'}}>
      <header style={{background: '#003366', color: '#fff', padding: '50px 20px', textAlign: 'center'}}>
        <h1>भूमि प्रशासन सेवा पोर्टल</h1>
        <p>"सहयोगी डिजिटल प्रणाली"</p>
      </header>

      <main style={{maxWidth: '1000px', margin: '30px auto', padding: '20px'}}>
        <div style={{marginBottom: '30px', textAlign: 'center'}}>
           <input type="text" placeholder="के सेवा गरौँ? (राजिनामा, नामसारी...)" onChange={e => setSearch(e.target.value)} style={searchBox} />
        </div>

        <div style={grid}>
          {!selectedSub ? (
            categories.map(cat => (
              <div key={cat.id} style={card}>
                <h3>{cat.name}</h3>
                <CategoryServices catId={cat.id} onSelect={loadServiceDetails} />
              </div>
            ))
          ) : (
            <div style={{width: '100%', background: '#fff', padding: '30px', borderRadius: '15px'}}>
              <button onClick={() => setSelectedSub(null)} style={{cursor:'pointer', color:'blue', border:'none', background:'none'}}>← पछाडि</button>
              <h2>{selectedSub.name}</h2>
              <hr/>
              {Object.keys(groupedDocs).map(group => (
                <div key={group}>
                  <h4 style={{marginTop: '20px', fontWeight: 'bold', color: '#003366'}}>{group}</h4>
                  {groupedDocs[group].map(doc => (
                    <div key={doc.id} style={docItem} title={doc.hover_note} onClick={() => doc.click_detail && alert(doc.click_detail)}>
                      📄 {doc.name} {doc.hover_note && <Info size={14} color="blue"/>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// सहायक कम्पोनेन्ट (किसिमहरू देखाउन)
function CategoryServices({ catId, onSelect }) {
  const [srvs, setSrvs] = useState([]);
  useEffect(() => {
    supabase.from('services').select('*').eq('category_id', catId).eq('status', 'approved').then(({data}) => setSrvs(data || []));
  }, []);
  return (
    <div style={{marginTop: '10px'}}>
      {srvs.map(s => <button key={s.id} onClick={() => onSelect(s)} style={srvBtn}>{s.name}</button>)}
    </div>
  );
}

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' };
const card = { background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
const searchBox = { width: '80%', padding: '15px', borderRadius: '30px', border: '2px solid #003366', outline: 'none' };
const srvBtn = { margin: '5px', padding: '8px 12px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer' };
const docItem = { padding: '15px', borderBottom: '1px solid #eee', cursor: 'help', display: 'flex', alignItems: 'center', gap: '10px' };
