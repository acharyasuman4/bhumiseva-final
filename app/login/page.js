"use client";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("लगइन असफल: " + error.message);
    else {
      alert("लगइन सफल!");
      router.push("/dashboard");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '350px' }}>
        <h2 style={{ textAlign: 'center', color: '#003366' }}>कर्मचारी लगइन</h2>
        <input type="email" placeholder="इमेल" onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
        <input type="password" placeholder="पासवर्ड" onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
        <button type="submit" style={{ width: '100%', padding: '12px', background: '#003366', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>लगइन गर्नुहोस्</button>
      </form>
    </div>
  );
}
const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' };
