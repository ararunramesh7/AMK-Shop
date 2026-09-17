import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../config/supabase';
import { Plus, Edit2, Trash2, Search, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    weight: '',
    category_id: '',
    image_url: '',
    status: 'available'
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  };

  const openAddModal = () => {
    setFormData({ name: '', description: '', price: '', stock: '', weight: '', category_id: '', image_url: '', status: 'available' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      weight: product.weight || '',
      category_id: product.category_id || '',
      image_url: product.image_url || '',
      status: product.status
    });
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        weight: formData.weight,
        category_id: formData.category_id || null,
        image_url: formData.image_url,
        status: formData.status
      };

      if (editingId) {
        await supabase.from('products').update(payload).eq('id', editingId);
        toast.success('Snack updated successfully');
      } else {
        await supabase.from('products').insert(payload);
        toast.success('Snack added successfully');
      }
      
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to save snack');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this snack?')) {
      await supabase.from('products').delete().eq('id', id);
      toast.success('Snack deleted');
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="admin-section animate-fade-in">
      <div className="admin-section__header" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '16px' }}>
        <h3 className="admin-section__title">Products (Snacks)</h3>
        
        <div style={{ display: 'flex', gap: '16px', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ maxWidth: '300px' }}>
            <Search size={18} className="search-bar__icon" />
            <input 
              type="text" 
              className="search-bar__input" 
              placeholder="Search snacks..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn--primary" onClick={openAddModal}>
            <Plus size={18} /> Add Snack
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}/></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.image_url ? 
                      <img src={p.image_url} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} /> :
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={20} color="var(--text-muted)" /></div>
                    }
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p.categories?.name || '—'}</td>
                  <td>₹{p.price}</td>
                  <td>
                    <span className={`badge ${p.stock <= 5 ? 'badge--error' : 'badge--success'}`}>{p.stock}</span>
                  </td>
                  <td>
                    <span className={`badge ${p.status === 'available' ? 'badge--success' : 'badge--warning'}`}>{p.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn--ghost btn--icon" onClick={() => openEditModal(p)} style={{ marginRight: '8px' }}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn--ghost btn--icon" onClick={() => handleDelete(p.id)} style={{ color: 'var(--color-error)' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No snacks found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{editingId ? 'Edit Snack' : 'Add Snack'}</h2>
              <button className="btn btn--ghost btn--icon" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input type="text" className="form-input" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://example.com/image.jpg" />
              </div>

              <div className="form-group">
                <label className="form-label">Snack Name *</label>
                <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div className="admin-grid-2">
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input type="number" step="0.01" className="form-input" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input type="number" className="form-input" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>

              <div className="admin-grid-2">
                <div className="form-group">
                  <label className="form-label">Weight (e.g. 250g)</label>
                  <input type="text" className="form-input" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="available">Available</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn--ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary">Save Snack</button>
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
