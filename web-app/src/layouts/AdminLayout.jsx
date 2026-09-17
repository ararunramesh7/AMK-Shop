import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import {
  LayoutDashboard, Package, FolderOpen, ShoppingCart, Warehouse,
  Users, BarChart3, Settings, Bell, LogOut, Menu, X, ChevronLeft,
  Sun, Moon, Globe, Truck, Shield
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import useThemeStore from '../store/themeStore';

const sidebarLinks = [
  { key: 'dashboard', path: '/admin', icon: LayoutDashboard, section: 'main', label: 'Dashboard' },
  { key: 'products', path: '/admin/products', icon: Package, section: 'catalog', label: 'Products' },
  { key: 'categories', path: '/admin/categories', icon: FolderOpen, section: 'catalog', label: 'Categories' },
  { key: 'inventory', path: '/admin/inventory', icon: Warehouse, section: 'catalog', label: 'Inventory' },
  { key: 'orders', path: '/admin/orders', icon: ShoppingCart, section: 'main', label: 'Orders' },
  { key: 'customers', path: '/admin/customers', icon: Users, section: 'people', label: 'Customers' },
  { key: 'reports', path: '/admin/reports', icon: BarChart3, section: 'analytics', label: 'Sales & Reports' },
  { key: 'delivery', path: '/admin/delivery', icon: Truck, section: 'system', label: 'Delivery Settings' },
  { key: 'notifications', path: '/admin/notifications', icon: Bell, section: 'system', label: 'Notifications' },
  { key: 'languages', path: '/admin/languages', icon: Globe, section: 'system', label: 'Languages' },
  { key: 'settings', path: '/admin/settings', icon: Settings, section: 'system', label: 'Shop Settings' },
  { key: 'staff', path: '/admin/staff', icon: Shield, section: 'system', label: 'Staff Management', requireMainAdmin: true },
  { key: 'profile', path: '/admin/profile', icon: Users, section: 'system', label: 'Admin Profile' },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const { profile, logout, isMainAdmin } = useAuth();
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const currentLink = sidebarLinks.find((l) =>
      l.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(l.path)
    );
    return currentLink ? t(`admin.${currentLink.key}`) : t('admin.dashboard');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__header">
          <div className="admin-sidebar__logo">A</div>
          <div>
            <div className="admin-sidebar__title">{t('app_name')}</div>
            <div className="admin-sidebar__subtitle">{t('nav.admin')}</div>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          <div className="admin-sidebar__section">Overview</div>
          {sidebarLinks.filter(l => l.section === 'main').map(link => {
            if (link.requireMainAdmin && !isMainAdmin) return null;
            return (
              <Link 
                key={link.key}
                to={link.path} 
                className={`admin-nav-item ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <link.icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="admin-sidebar__section">Catalog</div>
          {sidebarLinks.filter(l => l.section === 'catalog').map(link => {
            if (link.requireMainAdmin && !isMainAdmin) return null;
            return (
              <Link 
                key={link.key}
                to={link.path} 
                className={`admin-nav-item ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <link.icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="admin-sidebar__section">Customers</div>
          {sidebarLinks.filter(l => l.section === 'people').map(link => {
            if (link.requireMainAdmin && !isMainAdmin) return null;
            return (
              <Link 
                key={link.key}
                to={link.path} 
                className={`admin-nav-item ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <link.icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="admin-sidebar__section">Analytics</div>
          {sidebarLinks.filter(l => l.section === 'analytics').map(link => {
            if (link.requireMainAdmin && !isMainAdmin) return null;
            return (
              <Link 
                key={link.key}
                to={link.path} 
                className={`admin-nav-item ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <link.icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="admin-sidebar__section">System</div>
          {sidebarLinks.filter(l => l.section === 'system').map(link => {
            if (link.requireMainAdmin && !isMainAdmin) return null;
            return (
              <Link 
                key={link.key}
                to={link.path} 
                className={`admin-nav-item ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <link.icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: 'var(--space-3)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button className="admin-sidebar__link" onClick={handleLogout} style={{ width: '100%' }}>
            <LogOut size={18} />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar__left">
            <button
              className="btn btn--ghost btn--icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none' }}
              id="admin-menu-toggle"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <style>{`@media (max-width: 768px) { #admin-menu-toggle { display: flex !important; } }`}</style>
            <h1 className="admin-topbar__title">{getPageTitle()}</h1>
          </div>
          <div className="admin-topbar__right">
            <button className="header__action-btn" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link to="/" className="btn btn--ghost btn--sm">
              <ChevronLeft size={16} /> Store
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="header__avatar" style={{ width: 32, height: 32, fontSize: '13px' }}>
                {profile?.full_name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{profile?.full_name || 'Admin'}</span>
            </div>
          </div>
        </div>

        <div className="admin-content page-enter">
          <Outlet />
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 299, display: 'none'
          }}
          onClick={() => setSidebarOpen(false)}
          id="admin-overlay"
        />
      )}
      <style>{`@media (max-width: 768px) { #admin-overlay { display: block !important; } }`}</style>
    </div>
  );
}
