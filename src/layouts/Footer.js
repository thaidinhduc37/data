// components/Footer.js - Bottom Footer
import config from '../config';

function Footer() {
    return (
        <footer style={{
            background: '#1f2937',
            color: 'white',
            padding: '15px 20px',
            marginTop: 'auto',
            borderTop: '1px solid #374151',
            textAlign: 'center'
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                fontSize: '0.85rem',
                color: '#d1d5db'
            }}>
                © {new Date().getFullYear()} Công an tỉnh Đắk Lắk - Phiên bản {config.app.version} - "VÌ AN NINH TỔ QUỐC - VÌ BÌNH YÊN CUỘC SỐNG"
            </div>
        </footer>
    );
}

export default Footer;