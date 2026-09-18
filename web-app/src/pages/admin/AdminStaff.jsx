import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../features/auth/AuthContext';
import { Users, UserPlus, Trash2, Shield, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Navigate } from 'react-router-dom';

export default function AdminStaff() {
  const { isMainAdmin } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phone: '', password: '' });

  // Redirect if not the main admin
  if (!isMainAdmin) {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'sub_admin'])
      .order('role', { ascending: true }); // Admin first

    if (error) {
      toast.error('Failed to load staff list');
    } else if (data) {
      setStaff(data);
    }
    setLoading(false);
  };

  const handleCreateSubAdmin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const formattedPhone = formData.phone.startsWith('+') ? formData.phone : `+91${formData.phone}`;
      const { data, error } = await supabase.rpc('create_sub_admin', {
        p_phone: formattedPhone,
        p_password: formData.password,
        p_full_name: formData.fullName
      });

      if (error) throw error;
      
      toast.success('Sub-Admin created successfully!');
      setIsModalOpen(false);
      setFormData({ fullName: '', phone: '', password: '' });
      fetchStaff();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to create sub-admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubAdmin = async (id, role) => {
    if (role === 'admin') {
      toast.error('Cannot delete the main admin account');
      return;
    }

    if (window.confirm('Are you sure you want to delete this sub-admin? This action cannot be undone.')) {
      try {
        const { error } = await supabase.rpc('delete_sub_admin', { p_sub_admin_id: id });
        if (error) throw error;
        
        toast.success('Sub-Admin deleted successfully');
        fetchStaff();
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete sub-admin');
      }
    }
  };

  return (
    <div className="admin-section animate-fade-in">
      <div className="admin-section__header" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '16px' }}>
        <h3 className="admin-section__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={24} style={{ color: 'var(--color-primary)' }} />
          Staff Management
        </h3>
        
        <button className="btn btn--primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={18} /> Add Sub-Admin
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}/></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact Info</th>
                <th>Role</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(user => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={16} color="var(--text-muted)" />
                      </div>
                      {user.full_name || 'Admin User'}
                    </div>
                  </td>
                  <td>
                    {user.phone || 'No phone'}
                  </td>
                  <td>
                    {user.role === 'admin' ? (
                      <span className="badge" style={{ background: '#FFEBEE', color: '#C62828', border: '1px solid #EF9A9A' }}>Main Admin</span>
                    ) : (
                      <span className="badge" style={{ background: '#E3F2FD', color: '#1565C0', border: '1px solid #90CAF9' }}>Sub Admin</span>
                    )}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {user.role !== 'admin' && (
                      <button 
                        className="btn btn--ghost btn--icon" 
                        style={{ color: 'var(--color-error)' }}
                        onClick={() => handleDeleteSubAdmin(user.id, user.role)}
                        title="Delete Sub-Admin"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Create Sub-Admin</h2>
              <button className="btn btn--ghost btn--icon" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleCreateSubAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={formData.fullName} 
                  onChange={e => setFormData({...formData, fullName: e.target.value})} 
                  placeholder="e.g. Ramesh"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  required 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  placeholder="+919876543210"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  required 
                  minLength={6}
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn--ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={submitting}>
                  {submitting ? <span className="spinner spinner--sm btn__spinner" /> : null}
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }
        .modal-content {
          background: var(--bg-card);
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
