// components/NavBar.js - Sidebar Navigation with Submenu
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks';
import config from '../config';
import images from '../assets/images';

function NavBar({ isCollapsed, onToggle }) {
    const location = useLocation();
    const { isLoggedIn } = useAuth();
    const [openMenus, setOpenMenus] = useState({});

    // Toggle submenu
    const toggleSubmenu = (key) => {
        setOpenMenus(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Sidebar menu items với submenu
    const menuItems = [
        { 
            path: config.routes.dashboard, 
            icon: 'fas fa-tachometer-alt', 
            label: 'Trang chủ', 
            protected: true 
        },
        { 
            key: 'documents',
            icon: 'fas fa-folder-open', 
            label: 'Quản lý bài viết', 
            protected: true,
            submenu: [
                { path: config.routes.posts, label: 'Bài viết ban hành' },
                { path: '/posts/create', label: 'Tạo bài viết mới' },
                { path: '/posts/drafts', label: 'Bản nháp' },
                { path: '/posts/published', label: 'Đã phát hành' }
            ]
        },
        { 
            key: 'denounce',
            icon: 'fa-solid fa-scroll', 
            label: 'Quản lý khiếu nại, tố cáo', 
            protected: true,
            submenu: [
                { path: '/denounce/dashboard', label: 'Tổng quan' },
                { path: '/denounce/reception', label: 'Tiếp nhận đơn, thư' },
                { path: '/denounce/processing', label: 'Xử lý đơn, thư' },
                { path: '/denounce/tracking', label: 'Theo dõi tiến trình' },
                { path: '/denounce/reports', label: 'Báo cáo, thống kê' }
            ]
        },
        { 
            key: 'news',
            icon: 'fas fa-newspaper', 
            label: 'Tin tức & Thông báo', 
            protected: true,
            submenu: [
                { path: config.routes.blogs, label: 'Tin tức chung' },
                { path: '/news/internal', label: 'Thông báo nội bộ' },
                { path: '/news/public', label: 'Thông tin công khai' }
            ]
        },{ 
            key: 'schedule',
            icon: 'fa-regular fa-calendar-days', 
            label: 'Kế hoạch & Công việc', 
            protected: true,
            submenu: [
                { path: '/schedule/guard', label: 'Phân công lịch trực' },
                { path: '/schedule/timeoff', label: 'Đăng ký nghỉ phép' },
                { path: '/schedule/plans', label: 'Kế hoạch công tác' },
    
            ]
        },
        { 
            key: 'management',
            icon: 'fas fa-cogs', 
            label: 'Quản trị hệ thống', 
            protected: true,
            submenu: [
                { path: '', label: 'Quản lý người dùng' },
                { path: '', label: 'Phân quyền' },
                { path: '', label: 'Cài đặt hệ thống' },
                { path: '', label: 'Nhật ký hoạt động' }
            ]
        },
        { 
            key: 'adress_management',
            icon: 'fa-solid fa-map', 
            label: 'Địa giới hành chính', 
            protected: true,
            submenu: [
                { path: config.routes.address, label: 'Địa giới hành chính mới' },
                { path: '', label: 'Tra cứu địa giới cũ' },
                
            ]
        },
        { 
            path: config.routes.contact, 
            icon: 'fas fa-phone', 
            label: 'Liên hệ', 
            public: true 
        }
    ];

    const renderMenuItem = (item) => {
        // Skip protected items if not logged in
        if (item.protected && !isLoggedIn) return null;
        
        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const isSubmenuOpen = openMenus[item.key];
        const isActive = item.path ? (location.pathname === item.path || 
                       (item.path === config.routes.posts && location.pathname.startsWith('/posts'))) : false;
        
        if (hasSubmenu) {
            return (
                <div key={item.key}>
                    {/* Parent Menu Item */}
                    <div
                        onClick={() => !isCollapsed && toggleSubmenu(item.key)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isCollapsed ? 'center' : 'space-between',
                            gap: isCollapsed ? '0' : '12px',
                            padding: isCollapsed ? '12px 0' : '12px 20px',
                            color: 'white',
                            cursor: 'pointer',
                            background: 'transparent',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: isCollapsed ? '0' : '12px' }}>
                            <i 
                                className={item.icon}
                                style={{ 
                                    fontSize: '16px', 
                                    minWidth: '20px',
                                    textAlign: 'center'
                                }}
                            ></i>
                            {!isCollapsed && (
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    {item.label}
                                </span>
                            )}
                        </div>
                        {!isCollapsed && (
                            <i 
                                className={`fas fa-chevron-${isSubmenuOpen ? 'down' : 'right'}`}
                                style={{ 
                                    fontSize: '12px',
                                    transition: 'transform 0.2s ease'
                                }}
                            ></i>
                        )}
                    </div>
                    
                    {/* Submenu Items */}
                    {!isCollapsed && isSubmenuOpen && (
                        <div style={{ 
                            background: 'rgba(0,0,0,0.2)',
                            marginLeft: '10px',
                            borderLeft: '2px solid rgba(96,165,250,0.3)'
                        }}>
                            {item.submenu.map((subItem, index) => {
                                const isSubActive = location.pathname === subItem.path;
                                
                                return (
                                    <Link
                                        key={index}
                                        to={subItem.path}
                                        style={{
                                            display: 'block',
                                            padding: '10px 20px 10px 30px',
                                            color: isSubActive ? '#60a5fa' : 'rgba(255,255,255,0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                            background: isSubActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                            borderRight: isSubActive ? '2px solid #3b82f6' : 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            if (!isSubActive) {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                                e.currentTarget.style.color = 'white';
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (!isSubActive) {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                                            }
                                        }}
                                    >
                                        {subItem.label}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        } else {
            // Regular menu item without submenu
            return (
                <Link
                    key={item.path}
                    to={item.path}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isCollapsed ? '0' : '12px',
                        padding: isCollapsed ? '12px 0' : '12px 20px',
                        color: 'white',
                        textDecoration: 'none',
                        background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                        borderRight: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        if (!isActive) {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        }
                    }}
                    onMouseOut={(e) => {
                        if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                        }
                    }}
                >
                    <i 
                        className={item.icon}
                        style={{ 
                            fontSize: '16px', 
                            minWidth: '20px',
                            textAlign: 'center'
                        }}
                    ></i>
                    {!isCollapsed && (
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            {item.label}
                        </span>
                    )}
                </Link>
            );
        }
    };

    return (
        <aside style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: isCollapsed ? '70px' : '280px',
            background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
            color: 'white',
            transition: 'width 0.3s ease',
            zIndex: 1000,
            overflowY: 'auto',
            boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
        }}>
            {/* FontAwesome CDN */}
            <link 
                rel="stylesheet" 
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            />
            
            {/* Logo Section */}
            <div style={{
                padding: isCollapsed ? '20px 10px' : '20px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                textAlign: isCollapsed ? 'center' : 'left',
                display: 'flex',
                flexDirection: isCollapsed ? 'column' : 'row',
                alignItems: 'center',
                gap: isCollapsed ? '8px' : '12px'
            }}>
                <img 
                    src={images.cand} 
                    alt="Logo Công An" 
                    style={{
                        width: isCollapsed ? '32px' : '40px',
                        height: isCollapsed ? '32px' : '40px',
                        objectFit: 'contain',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        padding: '4px'
                    }}
                />
                {!isCollapsed && (
                    <div>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#60a5fa',
                            lineHeight: '1.2'
                        }}>
                            Công An Tỉnh Đắk Lắk
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: 'rgba(255,255,255,0.7)',
                            marginTop: '2px'
                        }}>
                            Hệ thống quản lý dữ liệu
                        </div>
                    </div>
                )}
            </div>

            {/* Menu Items */}
            <nav style={{ padding: '20px 0' }}>
                {menuItems.map(renderMenuItem)}
            </nav>

            {/* Bottom Section */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: isCollapsed ? '15px 10px' : '20px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.2)'
            }}>
                {!isCollapsed && (
                    <>
                        <div style={{
                            fontSize: '12px',
                            color: 'rgba(255,255,255,0.7)',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <i className="fas fa-code-branch"></i>
                            Version {config.app.version}
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: 'rgba(255,255,255,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <i className="fas fa-copyright"></i>
                            2024 Công An System
                        </div>
                    </>
                )}
                {isCollapsed && (
                    <div style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.7)',
                        textAlign: 'center'
                    }}>
                        <i className="fas fa-code-branch" style={{ marginBottom: '4px', display: 'block' }}></i>
                        v{config.app.version.split('.')[0]}.{config.app.version.split('.')[1]}
                    </div>
                )}
            </div>
        </aside>
    );
}

export default NavBar;