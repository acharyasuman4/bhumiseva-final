"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, LayoutGrid, DollarSign, ListChecks } from 'lucide-react';

// टुक्राहरू (Components) इम्पोट गर्ने
import DocsMaster from '@/components/admin/DocsMaster';
import RevenueMatrix from '@/components/admin/RevenueMatrix';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("docs");
  const [data, setData] = useState({ cats: [], srvs: [], mDocs: [], provs: [] });
  const [role, setRole] = useState("");
  const router = useRouter();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    setRole(prof?.role);

    const cats = await supabase.from('categories').select('*');
    const srvs = await supabase.from('services').select('*, categories(name)');
    const docs = await supabase.from('document_master').select('*');
    const provs = await supabase.from('provinces').select('*');
    
    setData({ cats: cats.data, srvs: srvs.data, mDocs: docs.data, provs: provs.data });
  };

  if (role === "viewer") return <div style={{padding: '50px', textAlign: 'center'}}>अनुमति छैन।</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>
      {/* साइड मेनु (Menu Sidebar) */}
      <aside style={sidebar}>
        <h2 style={{color: '#fff', padding: '20px'}}>प्रशासक प्यानल</h2>
        <nav style={{display: 'flex', flexDirection: 'column'}}>
          <button style={activeTab === "docs" ? activeMenu : menu} onClick={() => setActiveTab("docs")}><FileText size={18}/> कागजपत्र थप्ने</button>
          <button style={activeTab === "revenue" ? activeMenu : menu} onClick={() => setActiveTab("revenue")}><DollarSign size={18}/> राजश्व प्रणाली</button>
        </nav>
      </aside>

      {/* मुख्य कन्टेन्ट */}
      <main style={{ flex: 1, padding: '30px' }}>
        {activeTab === "docs" && <DocsMaster fetchAll={fetchAll} docs={data.mDocs} />}
        {activeTab === "revenue" && <RevenueMatrix srvs={data.srvs} provs={data.provs} fetchAll={fetchAll} />}
      </main>
    </div>
  );
}

const sidebar = { width: '250px', background: '#003366', color: '#fff' };
const menu = { padding: '15px 20px', background: 'none', border: 'none', color: '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px' };
const activeMenu = { ...menu, background: '#002244', borderLeft: '5px solid #ffcc00' };
