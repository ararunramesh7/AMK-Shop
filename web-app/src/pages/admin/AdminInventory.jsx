import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { Search, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editStock, setEditStock] = useState({});

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const { data } = await supabase.from('products').select('id, name, stock, image_url').order('stock', { ascending: true });
    if (data) {
      setProducts(data);
      // Initialize edit state
      const initialEdits = {};
      data.forEach(p => initialEdits[p.id] = p.stock);
      setEditStock(initialEdits);
    }
    setLoading(false);
  };

  const handleStockChange = (id, value) => {
    setEditStock(prev => ({ ...prev, [id]: value }));
  };

  const saveStock = async (id) => {
    const newStock = Number(editStock[id]);
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Invalid stock number');
      return;
    }
    try {
      await supabase.from('products').update({ stock: newStock }).eq('id', id);
      toast.success('Stock updated');
      
      // Update local state to remove unsaved indication
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
    } catch (err) {
      toast.error('Failed to update stock');
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="admin-section animate-fade-in">
      <div className="admin-section__header" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '16px' }}>
        <h3 className="admin-section__title">Inventory Management</h3>
        <div className="search-bar" style={{ maxWidth: '300px' }}>
          <Search size={18} className="search-bar__icon" />
          <input 
            type="text" 
            className="search-bar__input" 
            placeholder="Search products..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}/></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
                <th style={{ width: '250px' }}>Quick Edit</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => {
                const isChanged = Number(editStock[p.id]) !== p.stock;
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {p.image_url ? 
                          <img src={p.image_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} /> :
                          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--bg-secondary)' }} />
                        }
                        <span style={{ fontWeight: 500 }}>{p.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.stock <= 5 ? 'badge--error' : 'badge--success'}`}>{p.stock}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          type="number" 
                          className="form-input" 
                          style={{ width: '80px', padding: '6px 12px' }}
                          value={editStock[p.id]}
                          onChange={(e) => handleStockChange(p.id, e.target.value)}
                        />
                        {isChanged && (
                          <button 
                            className="btn btn--primary btn--sm" 
                            style={{ padding: '6px 12px' }}
                            onClick={() => saveStock(p.id)}
                          >
                            <Save size={14} style={{ marginRight: '4px' }} /> Save
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
