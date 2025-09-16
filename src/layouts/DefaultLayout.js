// layouts/DefaultLayout.js - Default Layout with Sidebar
import { Link, useLocation } from 'react-router-dom';
import { useAuth, useDirectus } from '../hooks';
import config from '../config';
import { useState } from 'react';

function DefaultLayout({ children }) {
    const location = useLocation();
    const { user, isLoggedIn, logout } = useAuth();
    const { isConnected, collections } = useDirectus();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Sidebar menu items
    const menuItems = [
        { path: config.routes.home, icon: '🏠', label: 'Trang chủ', public: true },
        { path: config.routes.dashboard, icon: '📊', label: 'Dashboard', protected: true },
        { path: config.routes.posts, icon: '📰', label: 'Bài viết', protected: true },
        { path: config.routes.blogs, icon: '📝', label: 'Blog', public: true },
        { path: config.routes.contact, icon: '📞', label: 'Liên hệ', public: true },
        { path: config.routes.about, icon: 'ℹ️', label: 'Giới thiệu', public: true },
        
    ];

    // Top Header component
    const TopHeader = () => (
        <header style={{
            background: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            padding: '0 20px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'fixed',
            top: 0,
            left: sidebarCollapsed ? '70px' : '280px',
            right: 0,
            zIndex: 999,
            transition: 'left 0.3s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        padding: '5px'
                    }}
                >
                    ☰
                </button>
                <h1 style={{
                    margin: 0,
                    fontSize: '20px',
                    color: '#1f2937',
                    fontWeight: '600'
                }}>
                    {config.app.name}
                </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {/* Connection Status */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: isConnected ? '#dcfce7' : '#fee2e2',
                    color: isConnected ? '#166534' : '#991b1b',
                    fontSize: '12px'
                }}>
                    <span>{isConnected ? '🟢' : '🔴'}</span>
                    {isConnected ? `Directus (${collections.length})` : 'Mất kết nối'}
                </div>

                {/* User Menu */}
                {isLoggedIn ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 12px',
                            background: '#f3f4f6',
                            borderRadius: '20px'
                        }}>
                            <span style={{ fontSize: '16px' }}>👤</span>
                            <span style={{ fontSize: '14px', color: '#374151' }}>
                                <a href={config.routes.profile} style={{ textDecoration: 'none', color: '#374151' }}> {user?.first_name || user?.email}</a>
                               
                            </span>
                        </div>
                        <button
                            onClick={logout}
                            style={{
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '500'
                            }}
                        >
                            🚪 Đăng xuất
                        </button>
                    </div>
                ) : (
                    <Link
                        to={config.routes.login}
                        style={{
                            background: '#3b82f6',
                            color: 'white',
                            textDecoration: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        🔐 Đăng nhập
                    </Link>
                )}
            </div>
        </header>
    );

    // Sidebar component
    const Sidebar = () => (
        <aside style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: sidebarCollapsed ? '70px' : '280px',
            background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
            color: 'white',
            transition: 'width 0.3s ease',
            zIndex: 1000,
            overflowY: 'auto',
            boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
        }}>
            {/* Logo Section */}
            <div style={{
                padding: sidebarCollapsed ? '20px 10px' : '20px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                textAlign: sidebarCollapsed ? 'center' : 'left'
            }}>
                <div style={{
                    fontSize: sidebarCollapsed ? '24px' : '20px',
                    fontWeight: 'bold',
                    color: '#60a5fa'
                }}>
                    {sidebarCollapsed ? '⚖️' : '⚖️ Legal Admin'}
                </div>
                {!sidebarCollapsed && (
                    <div style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.7)',
                        marginTop: '4px'
                    }}>
                        Hệ thống quản lý pháp lý
                    </div>
                )}
            </div>

            {/* Menu Items */}
            <nav style={{ padding: '20px 0' }}>
                {menuItems.map((item) => {
                    // Skip protected items if not logged in
                    if (item.protected && !isLoggedIn) return null;
                    
                    const isActive = location.pathname === item.path || 
                                   (item.path === config.routes.posts && location.pathname.startsWith('/posts'));
                    
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: sidebarCollapsed ? '0' : '12px',
                                padding: sidebarCollapsed ? '12px 0' : '12px 20px',
                                color: 'white',
                                textDecoration: 'none',
                                background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                                borderRight: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                                if (!isActive) {
                                    e.target.style.background = 'rgba(255,255,255,0.05)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!isActive) {
                                    e.target.style.background = 'transparent';
                                }
                            }}
                        >
                            <span style={{ fontSize: '18px', minWidth: '20px' }}>
                                {item.icon}
                            </span>
                            {!sidebarCollapsed && (
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: sidebarCollapsed ? '15px 10px' : '20px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.2)'
            }}>
                {!sidebarCollapsed && (
                    <>
                        <div style={{
                            fontSize: '12px',
                            color: 'rgba(255,255,255,0.7)',
                            marginBottom: '8px'
                        }}>
                            Version {config.app.version}
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: 'rgba(255,255,255,0.5)'
                        }}>
                            © 2024 Legal System
                        </div>
                    </>
                )}
                {sidebarCollapsed && (
                    <div style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.7)',
                        textAlign: 'center'
                    }}>
                        v{config.app.version.split('.')[0]}.{config.app.version.split('.')[1]}
                    </div>
                )}
            </div>
        </aside>
    );

    return (
        <div style={{
            minHeight: '100vh',
            fontFamily: '"Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            background: '#f8fafc'
        }}>
            <Sidebar />
            <TopHeader />
            
            <main style={{
                marginLeft: sidebarCollapsed ? '70px' : '280px',
                marginTop: '60px',
                minHeight: 'calc(100vh - 60px)',
                padding: '20px',
                transition: 'margin-left 0.3s ease'
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto'
                }}>
                    {children}
                </div>
            </main>
        </div>
    );
}

export default DefaultLayout;