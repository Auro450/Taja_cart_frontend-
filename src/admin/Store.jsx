import React, { useState, useEffect } from 'react';

function Store() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch('http://localhost:3000/api/categories');
    const data = await res.json();
    setCategories(data);
    if (!activeCategory && data.length > 0) setActiveCategory(data[0].id);
  };

  const fetchProducts = async () => {
    const res = await fetch('http://localhost:3000/api/products');
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    if (!name) return;

    if (editingCategory.id) {
      await fetch(`http://localhost:3000/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        body: formData
      });
    } else {
      await fetch(`http://localhost:3000/api/categories`, {
        method: 'POST',
        body: formData
      });
    }
    setEditingCategory(null);
    fetchCategories();
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Delete this category and all its products?")) {
      await fetch(`http://localhost:3000/api/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
      fetchProducts();
      if (activeCategory === id) setActiveCategory(null);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append('category_id', activeCategory);

    if (editingProduct.id) {
      await fetch(`http://localhost:3000/api/products/${editingProduct.id}`, {
        method: 'PUT',
        body: formData
      });
    } else {
      await fetch(`http://localhost:3000/api/products`, {
        method: 'POST',
        body: formData
      });
    }
    setEditingProduct(null);
    fetchProducts();
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Delete this product?")) {
      await fetch(`http://localhost:3000/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    }
  };

  const currentProducts = products.filter(p => p.category_id === activeCategory);

  if (loading) return <div>Loading store data...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 style={{ margin: 0 }}>Store Inventory</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Manage your categories and products.</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', padding: '20px' }}>
        {/* Sidebar: Categories */}
        <div style={{ width: '250px', backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Categories</h3>
            <button onClick={() => setEditingCategory({})} style={{ backgroundColor: '#f1f5f9', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>+ Add</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categories.map(c => (
              <div 
                key={c.id} 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', backgroundColor: activeCategory === c.id ? '#f0fdf4' : 'transparent', border: activeCategory === c.id ? '1px solid #bbf7d0' : '1px solid transparent' }}
                onClick={() => setActiveCategory(c.id)}
              >
                <span style={{ fontWeight: activeCategory === c.id ? 'bold' : 'normal', color: activeCategory === c.id ? '#166534' : '#334155' }}>{c.name}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={(e) => { e.stopPropagation(); setEditingCategory(c); }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', color: '#3b82f6' }}>Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(c.id); }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', color: '#ef4444' }}>Del</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main: Products */}
        <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          {activeCategory ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Products in Category</h3>
                <button 
                  onClick={() => setEditingProduct({ name: '', quantity: '', currentPrice: '', cutPrice: '', rating: 4.5, image: '' })}
                  style={{ backgroundColor: 'var(--primary-green)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  + Add Product
                </button>
              </div>

              {currentProducts.length === 0 ? (
                <p style={{ color: '#64748b' }}>No products in this category.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {currentProducts.map(p => (
                    <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column' }}>
                      <img src={p.image?.startsWith('/uploads') ? `http://localhost:3000${p.image}` : p.image} alt={p.name} style={{ width: '100%', height: '100px', objectFit: 'contain', marginBottom: '12px' }} />
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{p.name}</h4>
                      <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>{p.quantity}</p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontWeight: 'bold', color: '#0f172a', marginRight: '6px' }}>₹{p.currentPrice}</span>
                          <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '12px' }}>₹{p.cutPrice}</span>
                        </div>
                        <span style={{ backgroundColor: '#f0fdf4', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>★ {p.rating}</span>
                      </div>
                      
                      <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                        <button onClick={() => setEditingProduct(p)} style={{ flex: 1, padding: '6px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                        <button onClick={() => handleDeleteProduct(p.id)} style={{ flex: 1, padding: '6px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p style={{ color: '#64748b' }}>Select a category to view products.</p>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {editingCategory && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '300px' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>{editingCategory.id ? 'Edit Category' : 'New Category'}</h3>
            <form onSubmit={handleSaveCategory}>
              <input name="name" defaultValue={editingCategory.name} placeholder="Category Name" style={{ width: '100%', padding: '8px', marginBottom: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} autoFocus required />
              <label style={{ fontSize: '12px', color: '#64748b' }}>Category Image</label>
              <input name="image" type="file" accept="image/*" style={{ width: '100%', padding: '8px', marginBottom: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setEditingCategory(null)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '8px', backgroundColor: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {editingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>{editingProduct.id ? 'Edit Product' : 'New Product'}</h3>
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b' }}>Name</label>
                <input name="name" defaultValue={editingProduct.name} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b' }}>Quantity (e.g. '1 kg', '500 grams')</label>
                <input name="quantity" defaultValue={editingProduct.quantity} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#64748b' }}>Current Price (₹)</label>
                  <input name="currentPrice" type="number" step="0.01" defaultValue={editingProduct.currentPrice} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#64748b' }}>Cut Price (₹)</label>
                  <input name="cutPrice" type="number" step="0.01" defaultValue={editingProduct.cutPrice} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b' }}>Rating (e.g. 4.5)</label>
                <input name="rating" type="number" step="0.1" max="5" min="1" defaultValue={editingProduct.rating} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b' }}>Product Image</label>
                <input name="image" type="file" accept="image/*" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                {editingProduct.image && <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Current: {editingProduct.image.split('/').pop()}</p>}
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button type="button" onClick={() => setEditingProduct(null)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Store;
