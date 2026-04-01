import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { productsAPI } from '../api/products';
import { showAdminError, showAdminSuccess } from '../utils/adminToasts';
import { getProductEmoji } from '../utils/helpers';

const formatPrice = (value) => {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(numeric);
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getAdminList();
      const nextProducts = response.data.results || response.data || [];
      setProducts(
        nextProducts
          .filter((item) => !item.is_deleted)
          .sort((a, b) => Number(a.id || 0) - Number(b.id || 0))
      );
    } catch {
      showAdminError('Unable to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return products;
    }

    return products.filter((product) => {
      const nameMatch = product.name?.toLowerCase().includes(query);
      const idMatch = String(product.id).includes(query);
      return nameMatch || idMatch;
    });
  }, [products, searchTerm]);

  const handleDelete = async (productId) => {
    setIsDeletingId(productId);
    try {
      await productsAPI.remove(productId);
      setProducts((current) => current.filter((product) => product.id !== productId));
      showAdminSuccess('Product deleted successfully');
    } catch {
      showAdminError('Delete failed');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div className="admin-heading-block">
          <h1>Product Dashboard</h1>
        </div>
        <div className="admin-stats-card">
          <span>Total active products</span>
          <strong>{products.length}</strong>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search products by name or id"
            aria-label="Search products by name or id"
          />
        </div>
        <button
          type="button"
          className="admin-add-btn"
          onClick={() => navigate('/admin/products/new')}
          aria-label="Add product"
        >
          <Plus size={18} />
          <span>Add product</span>
        </button>
      </div>

      <div className="admin-list-card">
        {loading ? (
          <div className="admin-loading-panel">
            <div className="admin-primary-spinner" aria-label="Loading products" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="admin-empty-state">No matching products found.</div>
        ) : (
          <div className="admin-product-list">
            {filteredProducts.map((product) => (
              <article key={product.id} className="admin-product-card-row">
                <div className="admin-product-card-media">
                  {product.image_url ? (
                    <img
                      className="admin-product-thumb"
                      src={product.image_url}
                      alt={product.name}
                    />
                  ) : (
                    <div className="admin-product-thumb admin-product-thumb-placeholder">
                      {getProductEmoji(product)}
                    </div>
                  )}
                </div>

                <div className="admin-product-card-copy">
                  <div className="admin-product-name">{product.name}</div>
                  <div className="admin-product-meta">Product ID: {product.id}</div>
                  <div className="admin-product-price">{formatPrice(product.price)}</div>
                  <p className="admin-description-cell">{product.description || 'No description'}</p>
                </div>

                <div className="admin-action-row admin-action-column">
                  <button
                    type="button"
                    className="admin-action-btn"
                    onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                  >
                    <Pencil size={16} />
                    Update
                  </button>
                  <button
                    type="button"
                    className="admin-action-btn admin-delete-btn"
                    onClick={() => handleDelete(product.id)}
                    disabled={isDeletingId === product.id}
                  >
                    <Trash2 size={16} />
                    {isDeletingId === product.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminDashboard;
