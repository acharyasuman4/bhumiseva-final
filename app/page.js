"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function ViewerPortal() {
  const [selectedSub, setSelectedSub] = useState(null);
  const [groupedDocs, setGroupedDocs] = useState({});

  const fetchDocs = async (subService) => {
    setSelectedSub(subService);
    
    // १. मुख्य सेवा (Category) बाट कागजात तान्ने
    const { data: catDocs } = await supabase.from('service_document_map').select('*, document_master(*)').eq('category_id', subService.category_id);
    
    // २. यो किसिम (Sub-service) को लागि मात्र राखिएका कागजात तान्ने
    const { data: srvDocs } = await supabase.from('service_document_map').select('*, document_master(*)').eq('service_id', subService.id);

    // ३. अपवाद (Exclusions) तान्ने - (अझै बनाउन बाँकी भएपनि संरचना तयार छ)
    
    const allDocs = [...(catDocs || []), ...(srvDocs || [])];
    
    // ग्रुपिङ गर्ने (बुँदा ३ र ४)
    const groups = allDocs.reduce((acc, item) => {
      const gName = item.group_name || "आवश्यक कागजात";
      if (!acc[gName]) acc[gName] = [];
      acc[gName].push(item.document_master);
      return acc;
    }, {});
    
    setGroupedDocs(groups);
  };

  return (
    <div>
      {/* ... Header र Search ... */}
      
      {selectedSub && (
        <div style={{padding: '20px'}}>
          {Object.keys(groupedDocs).map(group => (
            <div key={group} style={{marginBottom: '20px'}}>
              <h4 style={{fontWeight: 'bold', borderBottom: '2px solid #333'}}>{group}</h4>
              {groupedDocs[group].map(doc => (
                <div key={doc.id} title={doc.hover_note} style={docStyle}>📄 {doc.name}</div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
const docStyle = { padding: '10px', borderBottom: '1px solid #eee' };
