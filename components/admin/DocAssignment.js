import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { Trash2, Plus, GripVertical, CheckCircle2, Circle, Save } from 'lucide-react';

export default function DocAssignment() {
  const [cats, setCats] = useState([]);
  const [srvs, setSrvs] = useState([]);
  const [mDocs, setMDocs] = useState([]);
  const [mappedDocs, setMappedDocs] = useState([]);
  const [exceptions, setExclusions] = useState([]);

  const [sel, setSel] = useState({ catId: "", srvId: "", type: "category", targetId: "", group: "आवश्यक कागजात" });

  useEffect(() => { fetchInitial(); }, []);
  useEffect(() => { if (sel.targetId) fetchAssignments(); }, [sel.targetId, sel.type]);

  const fetchInitial = async () => {
    const { data: c } = await supabase.from('categories').select('*');
    const { data: s } = await supabase.from('services').select('*');
    const { data: d } = await supabase.from('document_master').select('*');
    setCats(c || []); setSrvs(s || []); setMDocs(d || []);
  };

  const fetchAssignments = async () => {
    // १. म्यापिङ तान्ने
    const { data: maps } = await supabase.from('service_document_map')
      .select('*, document_master(name)')
      .order('sort_order', { ascending: true });
    setMappedDocs(maps || []);

    // २. अपवाद तान्ने
    const { data: ex } = await supabase.from('document_exceptions').select('*');
    setExclusions(ex || []);
  };

  // कागजात थप्ने (Duplicate रोक्ने लजिक सहित)
  const assignDoc = async (docId) => {
    if (!sel.targetId) return alert("पहिले मुख्य सेवा वा किसिम छान्नुहोस्");
    
    // चेक गर्ने: के यो कागजात यो ग्रुपमा पहिले नै छ?
    const isDup = mappedDocs.find(m => 
      m.document_id === docId && 
      m.group_name === sel.group &&
      (sel.type === 'category' ? m.category_id == sel.targetId : m.service_id == sel.targetId)
    );
    if (isDup) return alert("यो कागजात यो ग्रुपमा पहिले नै थपिएको छ।");

    const nextOrder = mappedDocs.length + 1;
    await supabase.from('service_document_map').insert([{
      document_id: docId,
      group_name: sel.group,
      sort_order: nextOrder,
      [sel.type === 'category' ? 'category_id' : 'service_id']: sel.targetId
    }]);
    fetchAssignments();
  };

  // अपवाद (Exclusion) मिलाउने - Tick/Untick Logic
  const toggleExclusion = async (docId, serviceId, isExcluded) => {
    if (isExcluded) {
      await supabase.from('document_exceptions').delete().eq('document_id', docId).eq('service_id', serviceId);
    } else {
      await supabase.from('document_exceptions').insert([{ document_id: docId, service_id: serviceId }]);
    }
    fetchAssignments();
  };

  // क्र.सं. (Order) अपडेट गर्ने
  const updateOrder = async (id, newOrder) => {
    await supabase.from('service_document_map').update({ sort_order: parseInt(newOrder) }).eq('id', id);
    fetchAssignments();
  };

  return (
    <div style={card}>
      <h2 style={{ color: '#003366', marginBottom: '20px' }}>आवश्यक कागजातहरू व्यवस्थापन</h2>
      
      {/* १. छनौट सेक्सन */}
      <div style={filterSection}>
        <div style={{display:'flex', gap:'20px', marginBottom:'15px'}}>
          <label><input type="radio" name="mtype" checked={sel.type === 'category'} onChange={() => setSel({...sel, type: 'category', targetId: ""})}/> मुख्य सेवामा थप्ने</label>
          <label><input type="radio" name="mtype" checked={sel.type === 'service'} onChange={() => setSel({...sel, type: 'service', targetId: ""})}/> किसिममा थप्ने</label>
        </div>

        <select style={input} onChange={e => setSel({...sel, targetId: e.target.value})}>
          <option value="">छान्नुहोस्...</option>
          {sel.type === 'category' ? cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>) : srvs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <input style={input} placeholder="ग्रुपको नाम (उदा: वारेशनामा भएमा थप)" value={sel.group} onChange={e => setSel({...sel, group: e.target.value})} />
      </div>

      <div style={grid}>
        {/* २. मास्टर लिस्ट (Pool) */}
        <div style={listPanel}>
          <h4>१. मास्टर लिस्टबाट थप्नुहोस्</h4>
          <div style={scrollBox}>
            {mDocs.map(d => (
              <div key={d.id} style={listItem}>
                <span>{d.name}</span>
                <button onClick={() => assignDoc(d.id)} style={addBtn}><Plus size={14}/> थप्नुहोस्</button>
              </div>
            ))}
          </div>
        </div>

        {/* ३. असाइन गरिएको लिस्ट (अर्डर र अपवाद सहित) */}
        <div style={listPanel}>
          <h4>२. हाल कायम रहेका कागजातहरू</h4>
          <div style={scrollBox}>
            {/* क. मुख्य सेवाबाट आएका (Inherited) - यदि किसिम छानिएको छ भने मात्र */}
            {sel.type === 'service' && sel.targetId && (
              <div style={{marginBottom:'20px'}}>
                <small style={{color:'green', fontWeight:'bold'}}>मुख्य सेवाबाट प्राप्त (Inherited):</small>
                {mappedDocs.filter(m => m.category_id == srvs.find(s => s.id == sel.targetId)?.category_id).map(m => {
                  const isExcluded = exceptions.find(ex => ex.document_id === m.document_id && ex.service_id == sel.targetId);
                  return (
                    <div key={m.id} style={{...listItem, opacity: isExcluded ? 0.5 : 1}}>
                      <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer'}}>
                        <input type="checkbox" checked={!isExcluded} onChange={() => toggleExclusion(m.document_id, sel.targetId, isExcluded)} />
                        <span>{m.document_master?.name}</span>
                      </label>
                      <span style={badge}>Main</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ख. यस किसिमका लागि सिधै छानिएका वा ग्रुपमा भएका */}
            <small style={{color:'blue', fontWeight:'bold'}}>थपिएका कागजात/ग्रुपहरू:</small>
            {mappedDocs.filter(m => (sel.type === 'category' ? m.category_id == sel.targetId : m.service_id == sel.targetId)).map(m => (
              <div key={m.id} style={listItem}>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                   <Trash2 size={16} color="red" cursor="pointer" onClick={() => supabase.from('service_document_map').delete().eq('id', m.id).then(fetchAssignments)}/>
                   <span style={m.group_name !== "आवश्यक कागजात" ? {fontWeight:'bold'} : {}}>{m.document_master?.name} {m.group_name !== "आवश्यक कागजात" && <small>({m.group_name})</small>}</span>
                </div>
                <input 
                  type="number" 
                  value={m.sort_order} 
                  onChange={(e) => updateOrder(m.id, e.target.value)} 
                  style={{width:'40px', textAlign:'center', border:'1px solid #ddd'}}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const card = { background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const filterSection = { background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' };
const input = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginRight: '10px', width: '250px' };
const grid = { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' };
const listPanel = { border: '1px solid #eee', padding: '15px', borderRadius: '10px' };
const scrollBox = { maxHeight: '500px', overflowY: 'auto' };
const listItem = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f0f0f0' };
const addBtn = { background: '#007bff', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };
const badge = { fontSize: '10px', background: '#e0e0e0', padding: '2px 6px', borderRadius: '10px' };
