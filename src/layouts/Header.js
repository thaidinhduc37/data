// components/Header.js - Top Header
import { Link } from 'react-router-dom';
import { useAuth, useDirectus } from '../hooks';
import config from '../config';

function Header({ isCollapsed, onToggle }) {
    const { user, isLoggedIn, logout } = useAuth();
    const { isConnected, collections } = useDirectus();

    return (
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
            left: isCollapsed ? '70px' : '280px',
            right: 0,
            zIndex: 999,
            transition: 'left 0.3s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button
                    onClick={onToggle}
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
                            background: '#ccc',
                            borderRadius: '20px'
                        }}>
                            
                            <Link 
                                to={config.routes.profile} 
                                style={{ 
                                    textDecoration: 'none', 
                                    color: '#374151',
                                    fontSize: '14px'
                                }}
                            >
                                <i class="fa-regular fa-user"
                                style={
                                    { marginRight: '6px' }
                                }></i> 
                                {user?.first_name || user?.email}
                            </Link>
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
                             <Link 
                                to={config.routes.home} 
                                style={{ 
                                    textDecoration: 'none', 
                                    color: '#ffffffff',
                                    fontSize: '14px'
                                }}
                            >
                                <i class="fa-solid fa-arrow-right-from-bracket"></i>
                                {" Đăng xuất"}
                            </Link>
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
}

export default Header;