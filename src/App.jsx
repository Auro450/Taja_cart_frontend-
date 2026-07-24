import React, { useState, useEffect, useMemo } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import AddressMap from './components/AddressMap';
import { generateInvoice } from './utils/generateInvoice';

// Custom hook to sync state with localStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn('Error reading localStorage for ' + key, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn('Error setting localStorage for ' + key, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
import { Search, ChevronDown, User, Heart, ShoppingBag, MapPin, Grid, PlayCircle, Tag, Zap, ChevronUp, ShoppingCart, Leaf, Timer, Shield, Home, ArrowLeft, X } from 'lucide-react';

// categoryData has been moved to the backend database

const OrderRatingWidget = ({ order, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (order.rating) {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#334155' }}>Your Review</h4>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
          {[1, 2, 3, 4, 5].map(star => (
            <span key={star} style={{ color: star <= order.rating ? '#eab308' : '#cbd5e1', fontSize: '16px' }}>★</span>
          ))}
        </div>
        {order.review && <p style={{ margin: '0', fontSize: '13px', color: '#475569', fontStyle: 'italic' }}>"{order.review}"</p>}
      </div>
    );
  }

  const submitReview = async () => {
    if (!rating) {
      alert("Please select a rating.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3000/api/orders/${order.id}/rate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, review })
      });
      if (response.ok) {
        onReviewSubmitted(order.id, rating, review);
      } else {
        alert("Failed to submit review.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
    setSubmitting(false);
  };

  return (
    <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#166534' }}>Rate this Order</h4>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span 
            key={star} 
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            style={{ 
              cursor: 'pointer', 
              color: star <= (hoverRating || rating) ? '#eab308' : '#cbd5e1', 
              fontSize: '24px',
              transition: 'color 0.2s'
            }}
          >
            ★
          </span>
        ))}
      </div>
      <textarea 
        placeholder="Write a review (optional)..."
        value={review}
        onChange={(e) => setReview(e.target.value)}
        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', minHeight: '60px', marginBottom: '8px', resize: 'vertical', boxSizing: 'border-box' }}
      />
      <button 
        onClick={submitReview}
        disabled={submitting || !rating}
        style={{ width: '100%', backgroundColor: rating ? '#16a34a' : '#94a3b8', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: rating ? 'pointer' : 'not-allowed', fontSize: '13px', boxSizing: 'border-box' }}
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useLocalStorage('activeTab', 'home');
  const [activeCategory, setActiveCategory] = useLocalStorage('activeCategory', 'All');
  const [cart, setCart] = useLocalStorage('cart', {});
  const [couponCode, setCouponCode] = useLocalStorage('couponCode', '');
  const [appliedCoupon, setAppliedCoupon] = useLocalStorage('appliedCoupon', null);
  const [couponError, setCouponError] = useState('');

  // Delivery Details State
  const [deliveryDetails, setDeliveryDetails] = useLocalStorage('deliveryDetails', {
    name: '',
    phone: '',
    street: '',
    building: '',
    locality: '',
    landmark: '',
    city: '',
    state: '',
    lat: null,
    lng: null
  });

  // Orders State
  const [placedOrders, setPlacedOrders] = useState([]);

  // User Authentication State
  const [user, setUser] = useLocalStorage('user', null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryData, setCategoryData] = useState({});
  const [categoryList, setCategoryList] = useState([]);

  // Fetch Inventory from Backend
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('http://localhost:3000/api/categories'),
          fetch('http://localhost:3000/api/products')
        ]);
        const categories = await catRes.json();
        const products = await prodRes.json();
        
        const newCategoryData = {};
        categories.forEach(c => {
          newCategoryData[c.name] = products.filter(p => p.category_id === c.id);
        });
        
        setCategoryData(newCategoryData);
        setCategoryList(categories);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
    fetchInventory();
  }, []);

  // Fetch Orders from Backend
  useEffect(() => {
    if (user && user.phone) {
      fetch(`http://localhost:3000/api/orders/user/${user.phone}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setPlacedOrders(data);
        })
        .catch(err => console.error("Error fetching orders:", err));
    } else {
      setPlacedOrders([]);
    }
  }, [user, activeTab]); // Re-fetch on tab switch or user change

  // Collect all unique products for search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    
    // Flatten categoryData into a single list and remove duplicates by name
    const allUniqueProducts = [];
    const seenNames = new Set();
    Object.values(categoryData).flat().forEach(product => {
      if (!seenNames.has(product.name)) {
        seenNames.add(product.name);
        allUniqueProducts.push(product);
      }
    });

    return allUniqueProducts.filter(item => item.name.toLowerCase().includes(query));
  }, [searchQuery]);
  
  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCollectingPhone, setIsCollectingPhone] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [pendingRatingOrder, setPendingRatingOrder] = useState(null);
  
  // Profile State
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [editPhoneInput, setEditPhoneInput] = useState('');

  const handlePlaceOrder = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!deliveryDetails.name || !deliveryDetails.phone || !deliveryDetails.street || !deliveryDetails.city) {
      alert("Please fill in your Name, Phone Number, Street, and City.");
      return;
    }

    const newOrder = {
      id: 'TC-' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      items: cartDetails.items,
      grandTotal: cartDetails.grandTotal,
      deliveryDetails: { ...deliveryDetails, email: user.email }
    };

    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (response.ok) {
        const freshOrder = {...newOrder, status: 'Placed'};
        setPlacedOrders([freshOrder, ...placedOrders]);
        setCart({});
        setAppliedCoupon(null);
        setCouponCode('');
        setActiveTab('orders');
        setPendingRatingOrder(freshOrder);
      } else {
        alert("Failed to place order.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    }
  };

  const handleReviewSubmitted = (orderId, rating, review) => {
    setPlacedOrders(placedOrders.map(o => 
      o.id === orderId ? { ...o, rating, review } : o
    ));
  };

  const cancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        const response = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setPlacedOrders(placedOrders.filter(o => o.id !== orderId));
        } else {
          alert("Failed to cancel order.");
        }
      } catch (err) {
        console.error(err);
        alert("Network error. Please try again.");
      }
    }
  };

  const downloadInvoice = (order) => {
    generateInvoice(order);
  };

  const handleApplyCoupon = () => {
    if (couponCode === 'FIRST20' || couponCode === 'FLAT20') {
      setAppliedCoupon(couponCode);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const updateCart = (productName, delta) => {
    setCart(prev => {
      const currentQty = prev[productName] || 0;
      const newQty = Math.max(0, currentQty + delta);
      const newCart = { ...prev };
      if (newQty === 0) {
        delete newCart[productName];
      } else {
        newCart[productName] = newQty;
      }
      return newCart;
    });
  };

  const totalCartItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const cartDetails = React.useMemo(() => {
    const allProducts = Object.values(categoryData).flat();
    const items = [];
    let itemTotal = 0;

    Object.entries(cart).forEach(([name, qty]) => {
      const product = allProducts.find(p => p.name === name);
      if (product) {
        items.push({ ...product, qty });
        itemTotal += product.currentPrice * qty;
      }
    });

    let discountAmount = 0;
    if (appliedCoupon === 'FIRST20' || appliedCoupon === 'FLAT20') {
      discountAmount = Math.floor(itemTotal * 0.2); // 20% off
    }

    const discountedTotal = itemTotal - discountAmount;
    const deliveryFee = discountedTotal > 99 ? 0 : 10;
    const grandTotal = discountedTotal + (items.length > 0 ? deliveryFee : 0);

    return { items, itemTotal, discountAmount, deliveryFee, grandTotal };
  }, [cart, appliedCoupon]);

  const allList = React.useMemo(() => {
    const allProducts = Object.values(categoryData).flat();
    return allProducts.sort(() => 0.5 - Math.random());
  }, [categoryData]);

  const dealsOfTheDay = React.useMemo(() => {
    const allProducts = Object.values(categoryData).flat();
    return allProducts.sort(() => 0.5 - Math.random()).slice(0, 10);
  }, [categoryData]);

  const categories = [
    { name: 'All', iconUrl: '/category-icons/all.png' },
    ...categoryList.map(c => ({
      name: c.name,
      iconUrl: c.image ? (c.image.startsWith('/uploads') ? `http://localhost:3000${c.image}` : c.image) : '/category-icons/all.png'
    }))
  ];

  const currentProductList = activeCategory === 'All' ? allList : (categoryData[activeCategory] || []);

  const handleGoogleSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    try {
      const response = await fetch(`http://localhost:3000/api/customers/${decoded.email}`);
      if (response.ok) {
        const customer = await response.json();
        setUser({ name: decoded.name, email: decoded.email, picture: decoded.picture, phone: customer.phone });
        setDeliveryDetails(prev => ({ ...prev, name: decoded.name, phone: customer.phone }));
        setIsAuthModalOpen(false);
      } else {
        setTempUser({ name: decoded.name, email: decoded.email, picture: decoded.picture });
        setIsCollectingPhone(true);
      }
    } catch (err) {
      console.error(err);
      alert("Error checking customer details.");
    }
  };

  const handleSavePhone = async () => {
    if (!phoneInput || phoneInput.length < 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }
    const finalUser = { ...tempUser, phone: phoneInput };
    
    try {
      const response = await fetch('http://localhost:3000/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalUser)
      });
      if (response.ok) {
        setUser(finalUser);
        setIsCollectingPhone(false);
        setIsAuthModalOpen(false);
        setDeliveryDetails(prev => ({ ...prev, name: finalUser.name, phone: finalUser.phone }));
        setPhoneInput('');
        setTempUser(null);
      } else {
        alert("Failed to save phone number.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
  };
  
  const handleUpdatePhone = () => {
    if (!editPhoneInput || editPhoneInput.length < 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }
    setUser({ ...user, phone: editPhoneInput });
    setDeliveryDetails({ ...deliveryDetails, phone: editPhoneInput });
    setIsEditingPhone(false);
  };

  const handleGoogleError = () => {
    console.log('Login Failed');
    alert("Google Login Failed");
  };

  const userOrders = user ? placedOrders.filter(o => o.deliveryDetails && o.deliveryDetails.phone === user.phone) : [];

  return (
    <div className="app-container">
      
      {/* Header */}
      <div className="header-bg">
        <div className="flex justify-between items-center" style={{ position: 'relative', zIndex: 10 }}>
          <div 
            className="flex items-center gap-1"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setActiveTab('home');
              setSearchQuery('');
            }}
          >
            <div className="flex items-center justify-center relative">
              <svg width="50" height="45" viewBox="0 0 50 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Leaves inside cart */}
                <path d="M15 15 C10 5, 22 2, 28 12 C34 5, 42 8, 35 18 Z" fill="#228B22"/>
                <path d="M10 18 C5 10, 15 5, 20 15 Z" fill="#32CD32"/>
                {/* Orange/Yellow Fruits */}
                <circle cx="28" cy="24" r="4.5" fill="#FF8C00"/>
                <circle cx="22" cy="20" r="3.5" fill="#FFD700"/>
                {/* Cart Body */}
                <path d="M5 16 H42 L36 32 H14 L5 16 Z" fill="#1b6e23"/>
                {/* Cart Grid Lines (Horizontal & Vertical) */}
                <line x1="10" y1="21" x2="39" y2="21" stroke="#FFFFFF" strokeWidth="1.5"/>
                <line x1="12" y1="27" x2="37" y2="27" stroke="#FFFFFF" strokeWidth="1.5"/>
                <line x1="16" y1="16" x2="19" y2="32" stroke="#FFFFFF" strokeWidth="1.5"/>
                <line x1="24" y1="16" x2="24" y2="32" stroke="#FFFFFF" strokeWidth="1.5"/>
                <line x1="32" y1="16" x2="29" y2="32" stroke="#FFFFFF" strokeWidth="1.5"/>
                {/* Cart Handle */}
                <path d="M5 16 L3 8 H0" stroke="#1b6e23" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                {/* Cart Wheels */}
                <circle cx="16" cy="38" r="2.5" fill="#1b6e23" stroke="#8bc34a" strokeWidth="1"/>
                <circle cx="31" cy="38" r="2.5" fill="#1b6e23" stroke="#8bc34a" strokeWidth="1"/>
              </svg>
            </div>
            
            <div className="flex flex-col justify-center -ml-1">
              <div className="flex items-start" style={{ position: 'relative' }}>
                {/* Small icon before T */}
                <span style={{ position: 'absolute', top: '-3px', left: '-8px', fontSize: '12px', transform: 'rotate(-15deg)' }}>🍋</span>
                <span style={{ 
                  color: '#084c20', 
                  fontWeight: 800, 
                  fontSize: '32px', 
                  fontFamily: '"Georgia", serif', 
                  fontStyle: 'italic',
                  lineHeight: '1',
                  letterSpacing: '-0.5px',
                  paddingLeft: '4px'
                }}>
                  Taja Cart
                </span>
                {/* Green Leaves on Cart */}
                <svg width="16" height="16" viewBox="0 0 24 24" style={{ position: 'absolute', top: '-4px', right: '-12px' }}>
                  <path d="M12 2 C8 2 2 8 2 12 C2 12 8 6 12 6 C16 6 22 12 22 12 C22 8 16 2 12 2 Z" fill="#4caf50" transform="rotate(-20 12 12)" />
                  <path d="M12 6 C8 6 2 12 2 16 C2 16 8 10 12 10 C16 10 22 16 22 16 C22 12 16 6 12 6 Z" fill="#2e7d32" transform="rotate(20 12 12)" />
                </svg>
              </div>
              <div className="flex items-center justify-end pr-1 mt-1">
                <span style={{ fontSize: '11px' }}>🥦</span>
                <span style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '11px', margin: '0 3px' }}>Freshness Delivered Daily</span>
                <span style={{ fontSize: '11px' }}>🥕</span>
              </div>
            </div>
          </div>
          <div className="profile-icon" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setActiveTab('cart')}>
            <ShoppingCart size={20} className="text-gray" />
            {totalCartItems > 0 && (
              <span style={{
                position: 'absolute',
                top: -4,
                right: -4,
                backgroundColor: 'var(--primary-green)',
                color: 'white',
                fontSize: 10,
                fontWeight: 'bold',
                width: 16,
                height: 16,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {totalCartItems}
              </span>
            )}
          </div>
        </div>



        {/* Search */}
        <div className="search-bar-container">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            className="search-bar" 
            placeholder='Search for "Fresh Vegetables"' 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 8 }}>
             {searchQuery.length > 0 ? (
               <div style={{ backgroundColor: '#f1f5f9', borderRadius: '50%', padding: '4px', display: 'flex', cursor: 'pointer' }} onClick={() => setSearchQuery('')}>
                 <X size={16} className="text-gray" />
               </div>
             ) : (
               <>
                 <Heart size={18} className="text-gray" />
                 <ShoppingBag size={18} className="text-gray" />
               </>
             )}
          </div>
        </div>
      </div>

      {searchQuery.trim().length > 0 ? (
        <div className="search-results-container" style={{ padding: '16px', paddingBottom: '90px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', marginBottom: '16px' }}>
            Search Results for "{searchQuery}"
          </h2>
          
          {searchResults.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', textAlign: 'center' }}>
              <Search size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)' }}>No products found</h3>
              <p style={{ fontSize: '14px', color: 'var(--gray-text)', marginTop: '8px' }}>Try searching for a different keyword like "Apple" or "Potato".</p>
            </div>
          ) : (
            <div className="product-grid">
              {searchResults.map((item, idx) => {
                const qty = cart[item.name] || 0;
                return (
                  <div key={idx} className="product-card">
                    <div className="product-image-container">
                      {item.image ? (
                        <img src={item.image?.startsWith('/uploads') ? `http://localhost:3000${item.image}` : item.image} alt={item.name} className="product-image" />
                      ) : (
                        <span style={{ fontSize: '48px' }}>{item.emoji}</span>
                      )}
                      {cart[item.name] ? (
                        <div className="quantity-control">
                          <button className="qty-btn" onClick={() => updateCart(item.name, -1)}>-</button>
                          <span className="qty-text">{cart[item.name]}</span>
                          <button className="qty-btn" onClick={() => updateCart(item.name, 1)}>+</button>
                        </div>
                      ) : (
                        <button className="add-btn" onClick={() => updateCart(item.name, 1)}>
                          <span className="plus-sign">+</span>
                        </button>
                      )}
                    </div>
                    <div className="product-details">
                      <div className="price-row">
                        <span className="current-price">₹{item.currentPrice}</span>
                      </div>
                      <h3 className="product-name">{item.name}</h3>
                      <p className="product-quantity">{item.quantity}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {activeTab === 'home' && (
        <>
          {/* Announcement Bar */}
      <div className="announcement-bar">
        <div className="marquee-content">
          <span className="marquee-item">🎉 Free delivery above Rs 99/-</span>
          <span className="marquee-item">⚡️ Rs 10/- delivery charge below Rs 99/-</span>
          <span className="marquee-item">🎉 Free delivery above Rs 99/-</span>
          <span className="marquee-item">⚡️ Rs 10/- delivery charge below Rs 99/-</span>
        </div>
      </div>

      {/* Nav Categories */}
      <div className="nav-categories">
        {categories.map((cat, idx) => (
          <div 
            key={idx} 
            className={`nav-item ${activeCategory === cat.name ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.name)}
          >
            <div className="nav-icon-wrapper" style={{ background: 'transparent', boxShadow: 'none' }}>
              <img src={cat.iconUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply', filter: 'contrast(1.1) brightness(1.05)' }} />
            </div>
            <span style={{ fontWeight: 700, color: '#334155', fontSize: '15px' }}>{cat.name}</span>
          </div>
        ))}
      </div>

      {/* Category Dropdown */}
      {currentProductList.length > 0 && (
        <div className="veggies-dropdown-section">
          <div className="product-scroll-container">
            {currentProductList.map((product, idx) => (
              <div key={idx} className="product-card">
                <div className="product-image-container">
                  {product.image ? (
                    <img src={product.image?.startsWith('/uploads') ? `http://localhost:3000${product.image}` : product.image} alt={product.name} className="product-image" />
                  ) : (
                    <span style={{ fontSize: '48px' }}>{product.emoji}</span>
                  )}
                  {cart[product.name] ? (
                    <div className="quantity-control">
                      <button className="qty-btn" onClick={() => updateCart(product.name, -1)}>-</button>
                      <span className="qty-text">{cart[product.name]}</span>
                      <button className="qty-btn" onClick={() => updateCart(product.name, 1)}>+</button>
                    </div>
                  ) : (
                    <button className="add-btn" onClick={() => updateCart(product.name, 1)}>
                      <span className="plus-sign">+</span>
                    </button>
                  )}
                </div>
                <div className="product-details">
                  <div className="price-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="current-price">₹{product.currentPrice}</span>
                      <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '12px' }}>₹{product.cutPrice}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: '#f0fdf4', padding: '2px 6px', borderRadius: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 'bold' }}>{product.rating}</span>
                      <span style={{ fontSize: '10px' }}>⭐</span>
                    </div>
                  </div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-quantity">{product.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="see-all-container">
            <button className="see-all-btn" onClick={() => setActiveTab('category')}>See all ▸</button>
          </div>
        </div>
      )}

      {/* Promo Banners */}
      <div className="banner-section mb-4">
        <div className="banner-scroll-container">
          
          {/* Banner 1 */}
          <div className="banner flex items-center" style={{ 
            background: 'linear-gradient(90deg, #0f823a 50%, rgba(15, 130, 58, 0) 100%), url("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80")', 
            backgroundSize: 'cover', 
            backgroundPosition: 'right center' 
          }}>
            <div style={{ width: '70%', zIndex: 2 }}>
              <h2 style={{ fontSize: 26, fontStyle: 'italic', fontWeight: 900, letterSpacing: '-0.5px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>FARM FRESH</h2>
              <p className="mb-3" style={{ fontWeight: 600, fontSize: 13, opacity: 0.95, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>DELIVERED TO YOU</p>
              <button onClick={() => setActiveTab('category')} style={{ backgroundColor: 'white', color: '#0f823a', padding: '8px 20px', borderRadius: '24px', fontWeight: '800', fontSize: '13px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', transition: 'transform 0.2s' }}>Order Now</button>
            </div>
          </div>

          {/* Banner 2 */}
          <div className="banner flex items-center relative overflow-hidden" style={{ 
            backgroundColor: '#388e3c'
          }}>
             <img src="/user-scooter-transparent.png" alt="Delivery Scooter" style={{ position: 'absolute', right: '-5%', bottom: '-5%', height: '110%', zIndex: 1, objectFit: 'contain', transform: 'scaleX(-1)' }} />
             <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, #388e3c 55%, rgba(56, 142, 60, 0.8) 75%, rgba(56, 142, 60, 0) 100%)', zIndex: 2 }}></div>
             <div style={{ width: '75%', zIndex: 3, position: 'relative' }}>
               <h2 style={{ fontSize: 24, fontStyle: 'italic', fontWeight: 900, letterSpacing: '-0.5px', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>FREE & FAST</h2>
               <p className="mb-2" style={{ fontWeight: 600, fontSize: 13, opacity: 0.95, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>SUPERFAST DELIVERY</p>
               <div className="flex gap-2 text-xs">
                 <span className="flex items-center gap-1 font-bold" style={{textShadow: '0 1px 2px rgba(0,0,0,0.1)'}}><span className="bg-white rounded-full p-1 flex items-center justify-center shadow-md" style={{color: '#388e3c', width: 14, height: 14, textShadow: 'none'}}>✓</span> ₹0 Handling</span>
                 <span className="flex items-center gap-1 font-bold" style={{textShadow: '0 1px 2px rgba(0,0,0,0.1)'}}><span className="bg-white rounded-full p-1 flex items-center justify-center shadow-md" style={{color: '#388e3c', width: 14, height: 14, textShadow: 'none'}}>✓</span> ₹0 Fees</span>
               </div>
             </div>
          </div>

          {/* Banner 3 */}
          <div className="banner flex items-center" style={{ 
            background: 'linear-gradient(90deg, #1b5e20 55%, rgba(27, 94, 32, 0) 100%), url("https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=800&q=80")',
            backgroundSize: 'cover', 
            backgroundPosition: 'right center'
          }}>
            <div style={{ width: '70%', zIndex: 2 }}>
              <h2 style={{ fontSize: 24, fontStyle: 'italic', fontWeight: 900, letterSpacing: '-0.5px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>100% TRUSTED</h2>
              <p className="mb-2" style={{ fontWeight: 600, fontSize: 13, opacity: 0.95, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>SERVICE GUARANTEED</p>
              <div className="flex gap-2 text-xs">
                 <span className="flex items-center gap-1 font-bold" style={{textShadow: '0 1px 2px rgba(0,0,0,0.2)'}}><span className="bg-white rounded-full p-1 flex items-center justify-center shadow-md" style={{color: '#1b5e20', width: 14, height: 14, textShadow: 'none'}}>★</span> Top Rated App</span>
               </div>
            </div>
          </div>

        </div>
      </div>

      {/* Deals of the Day */}
      <div className="section mt-2" style={{ padding: '16px 0', backgroundColor: 'var(--white)' }}>
        <div style={{ padding: '0 16px', marginBottom: '12px', textAlign: 'center' }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: 'var(--primary)', 
            margin: 0
          }}>
            Deals of the Day
          </h3>
        </div>
        <div className="product-scroll-container">
          {dealsOfTheDay.map((product, idx) => (
            <div key={idx} className="product-card">
              <div className="product-image-container">
                {product.image ? (
                  <img src={product.image?.startsWith('/uploads') ? `http://localhost:3000${product.image}` : product.image} alt={product.name} className="product-image" />
                ) : (
                  <span style={{ fontSize: '48px' }}>{product.emoji}</span>
                )}
                {cart[product.name] ? (
                  <div className="quantity-control">
                    <button className="qty-btn" onClick={() => updateCart(product.name, -1)}>-</button>
                    <span className="qty-text">{cart[product.name]}</span>
                    <button className="qty-btn" onClick={() => updateCart(product.name, 1)}>+</button>
                  </div>
                ) : (
                  <button className="add-btn" onClick={() => updateCart(product.name, 1)}>
                    <span className="plus-sign">+</span>
                  </button>
                )}
              </div>
              <div className="product-details">
                <div className="price-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="current-price">₹{product.currentPrice}</span>
                    <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '12px' }}>₹200</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: '#f0fdf4', padding: '2px 6px', borderRadius: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 'bold' }}>{(4 + (product.name.charCodeAt(0) % 10) / 10).toFixed(1)}</span>
                    <span style={{ fontSize: '10px' }}>⭐</span>
                  </div>
                </div>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-quantity">{product.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Banner */}
      <div className="section mt-2" style={{ padding: '0 16px', marginBottom: '16px' }}>
        <div style={{
          position: 'relative',
          background: 'linear-gradient(90deg, #11823b 0%, #16a34a 100%)',
          borderRadius: '16px',
          padding: '24px 16px',
          color: '#fff',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div style={{ position: 'relative', zIndex: 2, width: '70%' }}>
            <div style={{ 
              display: 'inline-block', 
              backgroundColor: '#ffd32a', 
              color: '#11823b', 
              fontSize: '11px', 
              fontWeight: '800', 
              padding: '4px 8px', 
              borderRadius: '4px',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              App Exclusive
            </div>
            <h2 style={{ fontSize: '22px', fontStyle: 'italic', fontWeight: '900', lineHeight: '1.2', marginBottom: '8px', textShadow: '0 2px 4px rgba(0,0,0,0.3)', letterSpacing: '-0.5px' }}>
              FLAT <span style={{ color: '#ffd32a' }}>20% OFF</span>
            </h2>
            <p style={{ fontSize: '13px', opacity: 0.95, marginBottom: '16px', lineHeight: '1.4', fontWeight: '600', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
              on your 1st order through app
            </p>
            
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              background: 'rgba(255,255,255,0.25)', 
              border: '1px dashed rgba(255,255,255,0.7)', 
              padding: '6px 12px', 
              borderRadius: '8px',
              gap: '6px',
              backdropFilter: 'blur(2px)'
            }}>
              <span style={{ fontSize: '11px', opacity: 0.9, fontWeight: '600', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>Use code:</span>
              <span style={{ fontSize: '15px', fontWeight: '900', letterSpacing: '0.5px', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>FIRST20</span>
            </div>
          </div>
          <img src="/cart_filled_transparent.png" alt="Grocery Cart" style={{
            position: 'absolute',
            right: '0',
            bottom: '5%',
            height: '95%',
            objectFit: 'contain',
            zIndex: 1,
            filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.3))'
          }} />
        </div>
      </div>
      <div style={{ height: '20px' }}></div>
      </>
      )}

      {/* Category Page Split-Screen */}
      {activeTab === 'category' && (
        <div className="category-page-container">
          {/* Left Sidebar */}
          <div className="category-sidebar">
            {categories.filter(c => c.name !== 'All').map((cat, idx) => (
              <div 
                key={idx} 
                className={`category-sidebar-item ${activeCategory === cat.name ? 'active' : ''}`}
                onClick={() => {
                  // If clicking a category on the left, set it as active
                  // "All" is excluded, so this will always be a specific category
                  setActiveCategory(cat.name);
                }}
              >
                <div className="icon-wrapper">
                  <img src={cat.iconUrl} alt={cat.name} />
                </div>
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
          
          {/* Right Content */}
          <div className="category-content">
            <div className="product-grid">
              {(categoryData[activeCategory === 'All' ? 'Veggies' : activeCategory] || []).map((product, idx) => (
                <div key={idx} className="product-card" style={{ minWidth: 'auto', width: '100%', maxWidth: '100%', margin: 0 }}>
                  <div className="product-image-container">
                    {product.image ? (
                      <img src={product.image?.startsWith('/uploads') ? `http://localhost:3000${product.image}` : product.image} alt={product.name} className="product-image" />
                    ) : (
                      <span style={{ fontSize: '48px' }}>{product.emoji}</span>
                    )}
                    {cart[product.name] ? (
                      <div className="quantity-control">
                        <button className="qty-btn" onClick={() => updateCart(product.name, -1)}>-</button>
                        <span className="qty-text">{cart[product.name]}</span>
                        <button className="qty-btn" onClick={() => updateCart(product.name, 1)}>+</button>
                      </div>
                    ) : (
                      <button className="add-btn" onClick={() => updateCart(product.name, 1)}>
                        <span className="plus-sign">+</span>
                      </button>
                    )}
                  </div>
                  <div className="product-details">
                    <div className="price-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="current-price">₹{product.currentPrice}</span>
                        <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '12px' }}>₹200</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: '#f0fdf4', padding: '2px 6px', borderRadius: '4px' }}>
                        <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 'bold' }}>{(4 + (product.name.charCodeAt(0) % 10) / 10).toFixed(1)}</span>
                        <span style={{ fontSize: '10px' }}>⭐</span>
                      </div>
                    </div>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-quantity">{product.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            {!(categoryData[activeCategory === 'All' ? 'Veggies' : activeCategory] || []).length && (
              <p style={{ textAlign: 'center', marginTop: '40px', color: '#64748b', fontSize: '14px' }}>No products found.</p>
            )}
          </div>
        </div>
      )}

      {/* Cart Page */}
      {activeTab === 'cart' && (
        <div className="cart-page-container" style={{ paddingBottom: '90px' }}>
          <div className="cart-header">
            <ArrowLeft size={24} style={{ marginRight: '16px', cursor: 'pointer', color: 'var(--primary)' }} onClick={() => setActiveTab('home')} />
            <h1>Cart ({totalCartItems} items)</h1>
          </div>

          {cartDetails.items.length === 0 ? (
            <div className="empty-cart">
              <ShoppingCart size={64} color="#cbd5e1" style={{ marginBottom: '16px' }} />
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added anything yet.</p>
              <button 
                onClick={() => setActiveTab('home')}
                style={{ backgroundColor: 'var(--primary-green)', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div style={{ padding: '16px' }}>
              {/* Cart Items List */}
              <div className="cart-items-section" style={{ padding: '0', backgroundColor: 'transparent', marginBottom: '24px' }}>
                {cartDetails.items.map((item, idx) => (
                  <div key={idx} className="cart-item-row-new">
                    <img src={item.image?.startsWith('/uploads') ? `http://localhost:3000${item.image}` : item.image} alt={item.name} className="cart-item-image" />
                    <div className="cart-item-info">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <p className="cart-item-qty">{item.quantity}</p>
                      <span className="cart-item-price-unit">₹{item.currentPrice}</span>
                    </div>
                    <div className="cart-item-actions">
                      <span className="cart-item-total">₹{item.currentPrice * item.qty}</span>
                      <div className="quantity-control-new">
                        <button className="qty-btn" onClick={() => updateCart(item.name, -1)}>-</button>
                        <span className="qty-text">{item.qty}</span>
                        <button className="qty-btn" onClick={() => updateCart(item.name, 1)}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="coupon-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  <input 
                    type="text" 
                    className="coupon-input" 
                    placeholder="Enter Coupon Code (e.g. FIRST20)" 
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                  />
                  <button 
                    className="coupon-apply-btn" 
                    onClick={handleApplyCoupon}
                  >
                    Apply
                  </button>
                </div>
                {couponError && <span style={{ color: '#ef4444', fontSize: '13px', marginLeft: '4px' }}>{couponError}</span>}
                {appliedCoupon && !couponError && <span style={{ color: 'var(--primary-green)', fontSize: '13px', fontWeight: 'bold', marginLeft: '4px' }}>'{appliedCoupon}' applied successfully!</span>}
              </div>

              {/* Delivery Details */}
              <div className="delivery-details-section" style={{ backgroundColor: 'var(--white)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)', margin: '0 0 16px 0' }}>Delivery Details</h3>
                <AddressMap lat={deliveryDetails.lat} lng={deliveryDetails.lng} onChange={(lat, lng) => setDeliveryDetails({...deliveryDetails, lat, lng})} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input 
                    type="text" 
                    placeholder="Receiver's Name" 
                    className="delivery-input"
                    value={deliveryDetails.name}
                    onChange={(e) => setDeliveryDetails({...deliveryDetails, name: e.target.value})}
                  />
                  <input 
                    type="tel" 
                    placeholder="10 digit mobile number" 
                    className="delivery-input"
                    value={deliveryDetails.phone}
                    maxLength={10}
                    onChange={(e) => setDeliveryDetails({...deliveryDetails, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                  />
                  <input 
                    type="text" 
                    placeholder="Street Name" 
                    className="delivery-input"
                    value={deliveryDetails.street || ''}
                    onChange={(e) => setDeliveryDetails({...deliveryDetails, street: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="Building Name / House No" 
                    className="delivery-input"
                    value={deliveryDetails.building || ''}
                    onChange={(e) => setDeliveryDetails({...deliveryDetails, building: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="Locality / Area" 
                    className="delivery-input"
                    value={deliveryDetails.locality || ''}
                    onChange={(e) => setDeliveryDetails({...deliveryDetails, locality: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="Landmark (Optional)" 
                    className="delivery-input"
                    value={deliveryDetails.landmark || ''}
                    onChange={(e) => setDeliveryDetails({...deliveryDetails, landmark: e.target.value})}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="City" 
                      className="delivery-input"
                      style={{ flex: 1 }}
                      value={deliveryDetails.city || ''}
                      onChange={(e) => setDeliveryDetails({...deliveryDetails, city: e.target.value})}
                    />
                    <input 
                      type="text" 
                      placeholder="State" 
                      className="delivery-input"
                      style={{ flex: 1 }}
                      value={deliveryDetails.state || ''}
                      onChange={(e) => setDeliveryDetails({...deliveryDetails, state: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Bill Details */}
              <div className="bill-details-section" style={{ borderRadius: '12px' }}>
                <h3 className="bill-details-title">Bill Details</h3>
                <div className="bill-row">
                  <span>Item Total</span>
                  <span>₹{cartDetails.itemTotal}</span>
                </div>
                {cartDetails.discountAmount > 0 && (
                  <div className="bill-row" style={{ color: 'var(--primary-green)' }}>
                    <span>Coupon Discount</span>
                    <span>-₹{cartDetails.discountAmount}</span>
                  </div>
                )}
                <div className="bill-row">
                  <span>Delivery Fee</span>
                  <span>{cartDetails.deliveryFee === 0 ? <span style={{ color: 'var(--primary-green)' }}>FREE</span> : `₹${cartDetails.deliveryFee}`}</span>
                </div>
                <div className="bill-row grand-total">
                  <span>Grand Total</span>
                  <span>₹{cartDetails.grandTotal}</span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button className="place-order-btn" onClick={handlePlaceOrder}>
                <span>Place Order</span>
                <span>₹{cartDetails.grandTotal}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Orders Page */}
      {activeTab === 'orders' && (
        <div className="orders-page-container" style={{ paddingBottom: '90px' }}>
          <div className="orders-header" style={{ padding: '24px 16px 8px 16px' }}>
            <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '24px', fontWeight: '800' }}>My Orders</h2>
          </div>

          <div style={{ padding: '16px' }}>
            {(!user || userOrders.length === 0) ? (
              <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
                <ShoppingBag size={64} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', margin: '16px 0 8px 0' }}>{!user ? 'Log in to view orders' : 'No orders yet'}</h3>
                <p style={{ fontSize: '14px', color: 'var(--gray-text)', marginBottom: '24px' }}>{!user ? 'You need to be logged in to track your order history.' : 'Looks like you haven\'t placed any orders yet.'}</p>
                <button 
                  onClick={() => !user ? setIsAuthModalOpen(true) : setActiveTab('home')}
                  style={{ backgroundColor: 'var(--primary-green)', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                >
                  {!user ? 'Log In' : 'Start Shopping'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {userOrders.map((order) => (
                  <div key={order.id} className="order-card" style={{ backgroundColor: 'var(--white)', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', paddingBottom: '12px', marginBottom: '12px' }}>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>{order.id}</span>
                        <p style={{ fontSize: '12px', color: 'var(--gray-text)', margin: '4px 0 0 0' }}>{order.date}</p>
                      </div>
                      <span style={{ 
                        backgroundColor: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Picked Up' ? '#fef9c3' : '#f0fdf4', 
                        color: order.status === 'Delivered' ? '#16a34a' : order.status === 'Picked Up' ? '#ca8a04' : 'var(--primary-green)', 
                        padding: '4px 12px', 
                        borderRadius: '16px', 
                        fontSize: '12px', 
                        fontWeight: '700' 
                      }}>
                        {order.status || 'Placed'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--primary)' }}>
                          <span>{item.qty}x {item.name}</span>
                          <span style={{ fontWeight: '600' }}>₹{item.currentPrice * item.qty}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: 'var(--gray-text)' }}>{order.items.reduce((sum, item) => sum + item.qty, 0)} Items</span>
                        <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)' }}>Total: ₹{order.grandTotal}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {order.status === 'Delivered' && (
                          <button 
                            onClick={() => downloadInvoice(order)}
                            style={{ flex: 1, backgroundColor: 'var(--white)', border: '1px solid var(--primary-green)', color: 'var(--primary-green)', padding: '10px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', textAlign: 'center' }}
                          >
                            Download Invoice
                          </button>
                        )}
                        {(!order.status || order.status === 'Placed') && (
                          <button 
                            onClick={() => cancelOrder(order.id)}
                            style={{ flex: 1, backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', padding: '10px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', textAlign: 'center' }}
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                      <OrderRatingWidget order={order} onReviewSubmitted={handleReviewSubmitted} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Page */}
      {activeTab === 'profile' && (
        <div className="profile-page-container" style={{ paddingBottom: '90px' }}>
          <div className="orders-header" style={{ padding: '24px 16px 8px 16px' }}>
            <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '24px', fontWeight: '800' }}>Profile</h2>
          </div>
          <div style={{ padding: '16px' }}>
            {user ? (
              <div style={{ backgroundColor: 'var(--white)', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--light-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-green)', overflow: 'hidden' }}>
                    {user.picture ? <img src={user.picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={32} />}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--primary)' }}>{user.name}</h3>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--gray-text)', fontSize: '14px' }}>{user.email}</p>
                    
                    {isEditingPhone ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                        <span style={{ fontSize: '14px', color: 'var(--gray-text)' }}>+91</span>
                        <input 
                          type="tel" 
                          value={editPhoneInput}
                          onChange={(e) => setEditPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          maxLength={10}
                          style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 8px', fontSize: '14px', width: '120px' }}
                          autoFocus
                        />
                        <button onClick={handleUpdatePhone} style={{ background: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>Save</button>
                        <button onClick={() => setIsEditingPhone(false)} style={{ background: '#f1f5f9', color: 'var(--gray-text)', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <p style={{ margin: 0, color: 'var(--gray-text)', fontSize: '14px' }}>+91 {user.phone}</p>
                        <button 
                          onClick={() => {
                            setEditPhoneInput(user.phone || '');
                            setIsEditingPhone(true);
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--primary-green)', fontSize: '12px', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <button 
                    onClick={() => {
                      setUser(null);
                      setActiveTab('home');
                    }}
                    style={{ width: '100%', padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
                <User size={64} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', margin: '16px 0 8px 0' }}>Not logged in</h3>
                <p style={{ fontSize: '14px', color: 'var(--gray-text)', marginBottom: '24px' }}>Log in to view your profile and manage your details.</p>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  style={{ backgroundColor: 'var(--primary-green)', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                >
                  Log In / Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
        </>
      )}

      {/* Bottom Nav */}
      <div className="bottom-nav">
        <div className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <Home size={24} />
          <span>Home</span>
        </div>
        <div className={`nav-tab ${activeTab === 'category' ? 'active' : ''}`} onClick={() => setActiveTab('category')}>
          <Grid size={24} />
          <span>Category</span>
        </div>
        <div className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          <ShoppingBag size={24} />
          <span>My Orders</span>
        </div>
        <div className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <User size={24} />
          <span>Profile</span>
        </div>
      </div>

      {/* Auth Modal (Bottom Sheet) */}
      {isAuthModalOpen && (
        <>
          <div className="auth-backdrop" onClick={() => setIsAuthModalOpen(false)} />
          <div className="auth-bottom-sheet">
            <div className="auth-header">
              <h3>Sign in with Google</h3>
              <button className="close-auth-btn" onClick={() => setIsAuthModalOpen(false)}>×</button>
            </div>
            
            <div className="auth-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
              {!isCollectingPhone ? (
                <>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                  />
                  <p className="auth-terms" style={{ marginTop: '20px' }}>
                    By continuing, you agree to our Terms of Service & Privacy Policy
                  </p>
                </>
              ) : (
                <div style={{ width: '100%', padding: '0 20px' }}>
                  <p style={{ marginBottom: '16px', textAlign: 'center', color: '#64748b' }}>
                    Please enter your phone number to continue
                  </p>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <div className="phone-input-wrapper">
                      <span className="country-code">+91</span>
                      <input 
                        type="tel" 
                        placeholder="10 digit mobile number" 
                        value={phoneInput} 
                        onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <button className="primary-btn mt-4" onClick={handleSavePhone} style={{ width: '100%' }}>Save & Continue</button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {/* Rating Modal */}
      {pendingRatingOrder && (
        <>
          <div className="auth-overlay" onClick={() => setPendingRatingOrder(null)} />
          <div className="auth-modal" style={{ padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '400px', backgroundColor: 'white', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1001 }}>
            <button className="close-btn" onClick={() => setPendingRatingOrder(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
            <h2 style={{ marginBottom: '8px', fontSize: '20px', color: '#0f172a' }}>Order Placed! 🎉</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>Would you like to rate your experience?</p>
            <OrderRatingWidget 
              order={pendingRatingOrder} 
              onReviewSubmitted={(orderId, rating, review) => {
                handleReviewSubmitted(orderId, rating, review);
                setPendingRatingOrder(null);
              }} 
            />
            <button 
              onClick={() => setPendingRatingOrder(null)}
              style={{ width: '100%', marginTop: '12px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              Skip for now
            </button>
          </div>
        </>
      )}

    </div>
  );
}

export default App;
