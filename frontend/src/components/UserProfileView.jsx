import React, { useState } from 'react';
import { Camera, Trash2, ShieldCheck, Briefcase } from 'lucide-react';

export const UserProfileView = () => {
  const [activeTab, setActiveTab] = useState('work_info');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    gstIn: '',
    address: '',
    role: 'Admin'
  });

  return (
    <div className="fade-in glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '32px', margin: '0 auto', maxWidth: '1000px', minHeight: '600px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--blackish)', margin: 0, marginBottom: '12px' }}>Setting</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" style={{ padding: '6px 16px' }}>Save</button>
            <button className="btn btn-secondary" style={{ padding: '6px 16px' }}>Discard</button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--blackish)' }}>Admin</span>
           <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--border)', border: '2px solid var(--primary)' }}></div>
        </div>
      </div>

      {/* Main Profile Info Section */}
      <div style={{ display: 'flex', gap: '48px', marginBottom: '40px' }}>
        
        {/* Left Col - Basic Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ width: '120px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ flex: 1, border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', outline: 'none', fontSize: '14px', padding: '4px 0', color: 'var(--text-primary)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ width: '120px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ flex: 1, border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', outline: 'none', fontSize: '14px', padding: '4px 0', color: 'var(--text-primary)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ width: '120px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Phone</label>
            <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ flex: 1, border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', outline: 'none', fontSize: '14px', padding: '4px 0', color: 'var(--text-primary)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
            <label style={{ width: '120px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Company name</label>
            <input type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} style={{ flex: 1, border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', outline: 'none', fontSize: '14px', padding: '4px 0', color: 'var(--text-primary)' }} />
          </div>
        </div>

        {/* Center Col - Company Details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ width: '120px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Company Logo</label>
            <button className="btn btn-primary" style={{ padding: '4px 16px', fontSize: '12px' }}>Upload</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ width: '120px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>GST IN</label>
            <input type="text" value={formData.gstIn} onChange={e => setFormData({...formData, gstIn: e.target.value})} style={{ flex: 1, border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', outline: 'none', fontSize: '14px', padding: '4px 0', color: 'var(--text-primary)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <label style={{ width: '120px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '4px' }}>Address</label>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', outline: 'none', fontSize: '14px', padding: '4px 0', color: 'var(--text-primary)' }} />
               <input type="text" style={{ width: '100%', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', outline: 'none', fontSize: '14px', padding: '4px 0', color: 'var(--text-primary)' }} />
               <input type="text" style={{ width: '100%', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', outline: 'none', fontSize: '14px', padding: '4px 0', color: 'var(--text-primary)' }} />
            </div>
          </div>
        </div>

        {/* Right Col - Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
          <div style={{ width: '140px', height: '140px', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--extra-light)' }}>
             <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>User</span>
             <div style={{ position: 'absolute', bottom: '8px', right: '8px', display: 'flex', gap: '4px' }}>
               <button style={{ background: 'var(--whitish)', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Camera size={14} color="var(--text-secondary)" />
               </button>
               <button style={{ background: 'var(--whitish)', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Trash2 size={14} color="var(--danger)" />
               </button>
             </div>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '32px' }}>
        <button 
          onClick={() => setActiveTab('work_info')}
          style={{ padding: '12px 24px', background: activeTab === 'work_info' ? 'var(--primary)' : 'transparent', color: activeTab === 'work_info' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontWeight: 600, borderTopLeftRadius: '8px', borderTopRightRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Briefcase size={16} /> Work Information
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          style={{ padding: '12px 24px', background: activeTab === 'security' ? 'var(--primary)' : 'transparent', color: activeTab === 'security' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontWeight: 600, borderTopLeftRadius: '8px', borderTopRightRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ShieldCheck size={16} /> Security
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'work_info' && (
        <div className="fade-in" style={{ display: 'flex', gap: '48px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--blackish)' }}>Role:</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="radio" name="role" value="Admin" checked={formData.role === 'Admin'} onChange={e => setFormData({...formData, role: e.target.value})} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Admin</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="radio" name="role" value="Vendor" checked={formData.role === 'Vendor'} onChange={e => setFormData({...formData, role: e.target.value})} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Vendor</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="radio" name="role" value="Client" checked={formData.role === 'Client'} onChange={e => setFormData({...formData, role: e.target.value})} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Client</span>
              </label>
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--extra-light)' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{color: 'var(--primary)', fontWeight: 800}}>i</span> Note
              </div>
              <div style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                - Settings should only be visible to Admin user.<br/>
                - For all the non-admin users this user information page should only be visible under profile section.
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--blackish)' }}>Change Password:</span>
          <button className="btn btn-primary" style={{ padding: '10px 24px' }}>Change Password</button>
        </div>
      )}

    </div>
  );
};
