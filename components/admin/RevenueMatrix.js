import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { X, Save } from 'lucide-react';

export default function RevenueMatrix({ provs, srvs, fetchAll }) {
  const [modal, setModal] = useState(null);
  const [revForm, setRevForm] = useState({ 
    valuation: "", reg_p: "", reg_f: "", srv_p: "", srv_f: "", delay: "", rem: "", cgt: "तिनपुस्ता भित्र", three_gen: false 
  });

  const saveRevenue = async () => {
    await supabase.from('revenue_details').upsert([{
      service_id: modal.srvId, province_id: modal.provId,
      valuation_amount: revForm.valuation, reg_fee_percent: revForm.reg_p, reg_fee_fixed: revForm.reg_f,
      srv_fee_percent: revForm.srv_p, srv_fee_fixed: revForm.srv_f, delay_fee: revForm.delay,
      remarks: revForm.rem, cgt_option: revForm.cgt, is_three_gen: revForm.three_gen
    }], { onConflict: 'service_id,province_id' });
    alert("सुरक्षित भयो!");
    setModal(null); fetchAll();
  };

  return (
    <div style={{overflowX: 'auto'}}>
      <table style={{width: '100%', borderCollapse: 'collapse', background: '#fff'}}>
        <thead>
          <tr>
            <th style={th}>मुख्य सेवा (किसिम)</th>
            {provs.map(p => <th key={p.id} style={th}>{p.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {srvs.map(s => (
            <tr key={s.id}>
              <td style={td}><strong>{s.name}</strong><br/><small>{s.categories?.name}</small></td>
              {provs.map(p => (
                <td key={p.id} style={{...td, textAlign: 'center'}}>
                  <button onClick={() => setModal({srvId: s.id, provId: p.id, sName: s.name, pName: p.name})} style={smallBtn}>थप्नुहोस्</button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {modal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3>{modal.sName} - {modal.pName}</h3>
              <X cursor="pointer" onClick={() => setModal(null)} />
            </div>
            <div style={modalBody}>
              <div style={formGrid}>
                <Field label="थैली अङ्क" set={v => setRevForm({...revForm, valuation: v})} />
                <Field label="रजिष्ट्रेशन दस्तुर (%)" set={v => setRevForm({...revForm, reg_p: v})} />
                <Field label="रजिष्ट्रेशन दस्तुर (Fixed)" set={v => setRevForm({...revForm, reg_f: v})} />
                <Field label="सेवा शुल्क (%)" set={v => setRevForm({...revForm, srv_p: v})} />
                <Field label="सेवा शुल्क (Fixed)" set={v => setRevForm({...revForm, srv_f: v})} />
                <Field label="विलम्व शुल्क" set={v => setRevForm({...revForm, delay: v})} />
                <div style={{gridColumn: 'span 2'}}>
                  <label><input type="checkbox" onChange={e => setRevForm({...revForm, three_gen: e.target.checked})} /> तिनपुस्ता आवश्यक छ?</label>
                </div>
                <div style={{gridColumn: 'span 2'}}>
                  <label>लाभकर</label>
                  <select style={input} onChange={e => setRevForm({...revForm, cgt: e.target.value})}>
                    <option value="तिनपुस्ता भित्र">तिनपुस्ता भित्र</option>
                    <option value="तिनपुस्ता बाहिर">तिनपुस्ता बाहिर</option>
                  </select>
                </div>
                <textarea style={{gridColumn: 'span 2', padding: '10px'}} placeholder="कैफियत" onChange={e => setRevForm({...revForm, rem: e.target.value})}></textarea>
              </div>
              <button style={saveFullBtn} onClick={saveRevenue}>सुरक्षित गर्नुहोस्</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, set }) {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
      <label style={{fontSize: '12px'}}>{label}</label>
      <input style={input} onChange={e => set(e.target.value)} />
    </div>
  );
}

const th = { background: '#003366', color: '#fff', padding: '12px', border: '1px solid #ddd' };
const td = { padding: '12px', border: '1px solid #ddd' };
const input = { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };
const smallBtn = { padding: '5px 10px', background: '#e3f2fd', color: '#007bff', border: '1px solid #007bff', borderRadius: '4px', cursor: 'pointer' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { background: '#fff', padding: '30px', borderRadius: '15px', width: '600px' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', marginBottom: '20px' };
const modalBody = { maxHeight: '70vh', overflowY: 'auto' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const saveFullBtn = { width: '100%', padding: '12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', marginTop: '20px', cursor: 'pointer', fontWeight: 'bold' };
