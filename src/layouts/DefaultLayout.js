// layouts/DefaultLayout.js - Default Layout with Components
import { useState } from 'react';
import NavBar from '../layouts/NavBar';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';

function DefaultLayout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <div style={{
            minHeight: '100vh',
            fontFamily: '"Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Navigation Sidebar */}
            <NavBar 
                isCollapsed={sidebarCollapsed} 
                onToggle={toggleSidebar} 
            />
            
            {/* Top Header */}
            <Header 
                isCollapsed={sidebarCollapsed} 
                onToggle={toggleSidebar} 
            />
            
            {/* Main Content */}
            <main style={{
                marginLeft: sidebarCollapsed ? '70px' : '280px',
                marginTop: '60px',
                minHeight: 'calc(100vh - 60px)',
                padding: '20px',
                transition: 'margin-left 0.3s ease',
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    width: '100%',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {children}
                </div>
                
                {/* Footer */}
                <Footer />
            </main>
        </div>
    );
}

export default DefaultLayout;