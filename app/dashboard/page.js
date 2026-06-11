"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { FileText, LayoutGrid, DollarSign, ListChecks, Activity, Users, ChevronRight } from 'lucide-react';

// कम्पोनेन्टहरू इम्पोट गर्ने
import DocsMaster from '@/components/admin/DocsMaster';
import CategoryService from '@/components/admin/CategoryService';
import RevenueMatrix from '@/components/admin/RevenueMatrix';
import DocAssignment from '@/components/admin/DocAssignment'; // भविष्यको लागि
import Workflow from '@/components/admin/Workflow';           // भविष्यको लागि

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

    const cats = await supabase.from('categories').select('*').order('id', { ascending: true });
    const srvs = await supabase.from('services').select('*, categories(name)');
    const docs = await supabase.from('document_master').select('*').order('created_at', { ascending: false });
    const provs = await supabase.from('provinces').select('*').order('id', { ascending: true });
    
    setData({ cats: cats.data || [], srvs: srvs.data || [], mDocs: docs.data || [], provs: provs.data || [] });
  };

  if (role === "viewer") return <div style={{padding: '50px', textAlign: 'center'}}>अनुमति छैन।</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar Menu */}
      <aside style={sidebarStyle}>
        <div style={{padding: '20px', borderBottom: '1px solid #004488', marginBottom: '10px'}}>
          <h3 style={{color: '#fff', margin: 0}}>Admin Panel</h3>
          <small style={{color: '#aaa'}}>{role} mode</small>
        </div>
        <nav>
          <MenuBtn id="docs" label="कागजपत्र थप्ने" icon={FileText} active={activeTab} set={setActiveTab} />
          <MenuBtn id="structure" label="मुख्य सेवा र किसिम" icon={LayoutGrid} active={activeTab} set={setActiveTab} />
          <MenuBtn id="assignment" label="आवश्यक कागजातहरू" icon={ListChecks} active={activeTab} set={setActiveTab} />
          <MenuBtn id="revenue" label="राजश्व प्रणाली" icon={DollarSign} active={activeTab} set={setActiveTab} />
          <MenuBtn id="workflow" label="कार्यप्रक्रिया" icon={Activity} active={activeTab} set={setActiveTab} />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        {activeTab === "docs" && <DocsMaster fetchAll={fetchAll} docs={data.mDocs} />}
        {activeTab === "structure" && <CategoryService fetchAll={fetchAll} cats={data.cats} srvs={data.srvs} />}
        {activeTab === "revenue" && <RevenueMatrix provs={data.provs} srvs={data.srvs} fetchAll={fetchAll} />}
        {activeTab === "assignment" && <DocAssignment fetchAll={fetchAll} />}
        {activeTab === "workflow" && <Workflow fetchAll={fetchAll} />}
      </main>
    </div>
  );
}

function MenuBtn({ id, label, icon: Icon, active, set }) {
  return (
    <button 
      onClick={() => set(id)}
      style={{
        width: '100%', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '12px',
        border: 'none', background: active === id ? '#004488' : 'transparent', color: '#fff',
        cursor: 'pointer', textAlign: 'left', borderLeft: active === id ? '4px solid #ffcc00' : '4px solid transparent',
        transition: '0.3s'
      }}>
      <Icon size={18} /> {label}
    </button>
  );
}

const sidebarStyle = { width: '260px', background: '#003366', color: '#fff', position: 'sticky', top: 0, height: '100vh' };
