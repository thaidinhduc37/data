// pages/Home.jsx - Government Legal System Home Page
import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import { useDirectus, useAuth } from '../../hooks';
import config from '../../config';
import styles from './Home.module.scss';

const cx = classNames.bind(styles);

function Home() {
  const { collections, isConnected } = useDirectus();
  const { isLoggedIn, user } = useAuth();

  return (
    <div className={cx('home')}>
      {/* Header Section */}
      <div className={cx('header-section')}>
        <div className={cx('container')}>
          <div className={cx('header-content')}>
            <div className={cx('logo-section')}>
              <div className={cx('national-emblem')}>
                <img href=''/>
              </div>
              <div className={cx('title-group')}>
                <h1 className={cx('main-title')}>
                  HỆ THỐNG QUẢN LÝ DỮ LIỆU
                </h1>
                <p className={cx('subtitle')}>
                  BỘ CÔNG AN
                </p>
                <p className={cx('motto')}>
                  CÔNG AN TỈNH ĐẮK LẮK
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status Section */}
      <div className={cx('status-section')}>
        <div className={cx('container')}>
          <h2 className={cx('section-title')}>
            📊 TRẠNG THÁI HỆ THỐNG
          </h2>
          
          <div className={cx('status-grid')}>
            <div className={cx('status-card', { connected: isConnected })}>
              <div className={cx('status-header')}>
                <span className={cx('status-icon')}>
                  {isConnected ? '🟢' : '🔴'}
                </span>
                <h3>Kết nối Cơ sở dữ liệu</h3>
              </div>
              <div className={cx('status-content')}>
                <div className={cx('status-value')}>
                  {isConnected ? 'Hoạt động bình thường' : 'Lỗi kết nối'}
                </div>
                <div className={cx('status-detail')}>
                  Collections: {collections.length}
                </div>
              </div>
            </div>

            <div className={cx('status-card')}>
              <div className={cx('status-header')}>
                <span className={cx('status-icon')}>🔐</span>
                <h3>Bảo mật hệ thống</h3>
              </div>
              <div className={cx('status-content')}>
                <div className={cx('status-value')}>
                  {isLoggedIn ? 'Đã xác thực' : 'Chưa đăng nhập'}
                </div>
                <div className={cx('status-detail')}>
                  SSL: Được bảo mật
                </div>
              </div>
            </div>

            <div className={cx('status-card')}>
              <div className={cx('status-header')}>
                <span className={cx('status-icon')}>⏰</span>
                <h3>Thời gian hệ thống</h3>
              </div>
              <div className={cx('status-content')}>
                <div className={cx('status-value')}>
                  {new Date().toLocaleString('vi-VN')}
                </div>
                <div className={cx('status-detail')}>
                  Múi giờ: UTC+7
                </div>
              </div>
            </div>
          </div>

          {isLoggedIn && user && (
            <div className={cx('user-welcome')}>
              <div className={cx('welcome-content')}>
                <h3>Chào mừng cán bộ</h3>
                <p>
                  <strong>{user.first_name || user.email}</strong>
                </p>
                <small>Phiên làm việc: {new Date().toLocaleString('vi-VN')}</small>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={cx('actions-section')}>
        <div className={cx('container')}>
          <h2 className={cx('section-title')}>
            🚀 TRUY CẬP NHANH
          </h2>
          
          <div className={cx('actions-grid')}>
            {isLoggedIn ? (
              <>
                <Link to={config.routes.dashboard} className={cx('action-card', 'primary')}>
                  <div className={cx('action-icon')}>📊</div>
                  <h3>Bảng điều khiển</h3>
                  <p>Theo dõi hoạt động và thống kê hệ thống</p>
                </Link>
                
                <Link to={config.routes.posts} className={cx('action-card', 'secondary')}>
                  <div className={cx('action-icon')}>📄</div>
                  <h3>Quản lý văn bản</h3>
                  <p>Tạo, chỉnh sửa và quản lý văn bản pháp lý</p>
                </Link>
                
                <Link to={config.routes.blogs} className={cx('action-card', 'tertiary')}>
                  <div className={cx('action-icon')}>📚</div>
                  <h3>Thông tin pháp luật</h3>
                  <p>Cập nhật tin tức và thông tin pháp luật mới</p>
                </Link>
              </>
            ) : (
              <div className={cx('login-prompt')}>
                <div className={cx('prompt-content')}>
                  <h3>⚠️ YÊU CẦU ĐĂNG NHẬP</h3>
                  <p>Vui lòng đăng nhập để truy cập các chức năng của hệ thống</p>
                  <Link to={config.routes.login} className={cx('login-btn')}>
                    🔐 ĐĂNG NHẬP HỆ THỐNG
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Features */}
      <div className={cx('features-section')}>
        <div className={cx('container')}>
          <h2 className={cx('section-title')}>
            ⭐ TÍNH NĂNG HỆ THỐNG
          </h2>
          
          <div className={cx('features-grid')}>
            <div className={cx('feature-item')}>
              <div className={cx('feature-icon')}>🛡️</div>
              <h3>Bảo mật cao</h3>
              <p>Đảm bảo an ninh thông tin theo tiêu chuẩn Nhà nước</p>
            </div>

            <div className={cx('feature-item')}>
              <div className={cx('feature-icon')}>📋</div>
              <h3>Quản lý văn bản</h3>
              <p>Hệ thống quản lý văn bản pháp quy chuyên nghiệp</p>
            </div>

            <div className={cx('feature-item')}>
              <div className={cx('feature-icon')}>🔍</div>
              <h3>Tra cứu thông tin</h3>
              <p>Tra cứu nhanh chóng các văn bản pháp luật</p>
            </div>

            <div className={cx('feature-item')}>
              <div className={cx('feature-icon')}>📊</div>
              <h3>Báo cáo thống kê</h3>
              <p>Tạo báo cáo và thống kê chi tiết về hoạt động</p>
            </div>

            <div className={cx('feature-item')}>
              <div className={cx('feature-icon')}>👥</div>
              <h3>Quản lý người dùng</h3>
              <p>Phân quyền và quản lý tài khoản cán bộ</p>
            </div>

            <div className={cx('feature-item')}>
              <div className={cx('feature-icon')}>🔄</div>
              <h3>Sao lưu dữ liệu</h3>
              <p>Tự động sao lưu và bảo vệ dữ liệu hệ thống</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className={cx('info-section')}>
        <div className={cx('container')}>
          <div className={cx('info-content')}>
            <div className={cx('contact-info')}>
              <h3>📞 THÔNG TIN LIÊN HỆ</h3>
              <p>Phòng Tham mưu</p>
              <p>Email: pv01@dala.bca</p>
              <p>Hotline: 1900-xxxx</p>
            </div>
            
            <div className={cx('version-info')}>
              <h3>🔧 THÔNG TIN HỆ THỐNG</h3>
              <p>Phiên bản: {config.app.version}</p>
              <p>Cập nhật: {new Date().getFullYear()}</p>
              <p>Đội ngũ phát triển: Đội CNTT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;