import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { X } from 'lucide-react';

export default function RevenueMatrix({ srvs, provs, fetchAll }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ 
    valuation_amount: "", reg_fee_percent: "", reg_fee_fixed: "", 
    srv_fee_percent: "", srv_fee_fixed: "", is_three_gen: false,
    delay_fee: "", remarks: "", cgt_option: "तिनपुस्ता भित्र"
  });

  const saveRev = async () => {
    await supabase.from('revenue_details').upsert([{
      service_id: modal.srvId, province_id: modal.provId, ...form
    }], { onConflict: 'service_id,province_id' });
    alert("सुरक्षित भयो");
    setModal(null);
    fetchAll();
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={table}>
        <thead>
          <tr>
            <th style={th}>किसिम / प्रदेश</th>
            {provs.map(p => <th key={p.id} style={th}>{p.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {srvs.map(s => (
            <tr key={s.id}>
              <td style={td}><strong>{s.name}</strong></td>
              {provs.map(p => (
                <td key={p.id} style={tdCenter}>
                  <button style={smallBtn} onClick={() => setModal({ srvName: s.name, provName: p.name, srvId: s.id, provId: p.id })}>
                    भर्नुहोस्
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {modal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <h3>{modal.srvName} - {modal.provName}</h3>
              <X cursor="pointer" onClick={() => setModal(null)} />
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop:'15px'}}>
              <input style={input} placeholder="थैली अङ्क" onChange={e => setForm({...form, valuation_amount: e.target.value})} />
              <input style={input} placeholder="रजिष्ट्रेशन दस्तुर (%)" onChange={e => setForm({...form, reg_fee_percent: e.target.value})} />
              <input style={input} placeholder="रजिष्ट्रेशन दस्तुर (Fixed)" onChange={e => setForm({...form, reg_fee_fixed: e.target.value})} />
              <input style={input} placeholder="सेवा शुल्क (%)" onChange={e => setForm({...form, srv_fee_percent: e.target.value})} />
              <input style={input} placeholder="सेवा शुल्क (Fixed)" onChange={e => setForm({...form, srv_fee_fixed: e.target.value})} />
              <div style={{gridColumn:'span 2'}}>
                 <label><input type="checkbox" onChange={e => setForm({...form, is_three_gen: e.target.checked})} /> तिनपुस्ता आवश्यक?</label>
              </div>
              <textarea style={{gridColumn:'span 2', padding:'10px'}} placeholder="कैफियत" onChange={e => setForm({...form, remarks: e.target.value})}></textarea>
            </div>
            <button style={saveFullBtn} onClick={saveRev}>सुरक्षित गर्नुहोस्</button>
          </div>
        </div>
      )}
    </div>
  );
}

const table = { width: '100%', borderCollapse: 'collapse' };
const th = { background: '#003366', color: '#fff', padding: '10px', border: '1px solid #ddd' };
const td = { padding: '10px', border: '1px solid #ddd' };
const tdCenter = { ...td, textAlign: 'center' };
const smallBtn = { background: '#e3f2fd', color: '#007bff', border: '1px solid #007bff', padding: '5px', cursor: 'pointer' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { background: '#fff', padding: '20px', borderRadius: '10px', width: '500px' };
const input = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' };
const saveFullBtn = { width: '100%', padding: '10px', background: '#28a745', color: '#fff', border: 'none', marginTop: '10px', cursor: 'pointer' };
