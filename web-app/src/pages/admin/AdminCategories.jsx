import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('display_order');
    setCategories(data || []);
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="admin-section">
        <div className="admin-section__header">
          <h3 className="admin-section__title">Categories</h3>
          <button className="btn btn--primary"><Plus size={16} /> Add Category</button>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Name (English)</th>
                <th>Name (Tamil)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-8)' }}><div className="spinner spinner--sm" style={{ margin: '0 auto' }}/></td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>No categories found.</td></tr>
              ) : (
                categories.map(c => (
                  <tr key={c.id}>
                    <td>{c.display_order}</td>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td>{c.name_ta}</td>
                    <td><span className={`badge ${c.status === 'active' ? 'badge--success' : 'badge--error'}`}>{c.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn--ghost btn--sm btn--icon"><Edit2 size={16}/></button>
                        <button className="btn btn--ghost btn--danger btn--sm btn--icon"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
