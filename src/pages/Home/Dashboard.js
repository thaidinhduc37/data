// pages/Private/Dashboard.js - Trang tổng quan hệ thống
import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { useAuth, useDirectus } from '../../hooks';
import styles from './Dashboard.module.scss';

const cx = classNames.bind(styles);

function Dashboard() {
    const { user } = useAuth();
    const { isConnected, collections } = useDirectus();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [stats, setStats] = useState({
        totalDocuments: 1247,
        pendingApproval: 23,
        publishedToday: 8,
        totalUsers: 156,
        activeUsers: 89,
        systemHealth: 98.5
    });

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={cx('dashboard')}>
            {/* FontAwesome CDN */}
            <link 
                rel="stylesheet" 
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            />
            
            {/* Header */}
            <div className={cx('header')}>
                <h1>
                    <i className="fas fa-tachometer-alt"></i>
                    Dashboard
                </h1>
                <p className={cx('subtitle')}>Tổng quan hệ thống quản lý dữ liệu</p>
                
                <div className={cx('welcome')}>
                    <h2>Chào mừng, {user?.first_name || user?.email || 'Admin'}</h2>
                    <p>Hôm nay là {currentTime.toLocaleDateString('vi-VN')}, {currentTime.toLocaleTimeString('vi-VN')}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className={cx('statsGrid')}>
                <div className={cx('statCard')}>
                    <div className={cx('statIcon', 'blue')}>
                        <i className="fas fa-file-alt"></i>
                    </div>
                    <div className={cx('statValue')}>{stats.totalDocuments.toLocaleString()}</div>
                    <p className={cx('statLabel')}>Tổng văn bản</p>
                    <span className={cx('statTrend', 'positive')}>+12% so với tháng trước</span>
                </div>

                <div className={cx('statCard')}>
                    <div className={cx('statIcon', 'yellow')}>
                        <i className="fas fa-clock"></i>
                    </div>
                    <div className={cx('statValue')}>{stats.pendingApproval}</div>
                    <p className={cx('statLabel')}>Chờ phê duyệt</p>
                    <span className={cx('statTrend', 'negative')}>-5% so với hôm qua</span>
                </div>

                <div className={cx('statCard')}>
                    <div className={cx('statIcon', 'green')}>
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <div className={cx('statValue')}>{stats.publishedToday}</div>
                    <p className={cx('statLabel')}>Phát hành hôm nay</p>
                    <span className={cx('statTrend', 'positive')}>+3 so với hôm qua</span>
                </div>

                <div className={cx('statCard')}>
                    <div className={cx('statIcon', 'purple')}>
                        <i className="fas fa-users"></i>
                    </div>
                    <div className={cx('statValue')}>{stats.activeUsers}/{stats.totalUsers}</div>
                    <p className={cx('statLabel')}>Người dùng hoạt động</p>
                    <span className={cx('statTrend', 'positive')}>{Math.round((stats.activeUsers/stats.totalUsers)*100)}% online</span>
                </div>
            </div>

            {/* Content Grid */}
            <div className={cx('contentGrid')}>
                {/* Main Content */}
                <div>
                    {/* System Status */}
                    <div className={cx('card')}>
                        <h2>
                            <i className="fas fa-server"></i>
                            Trạng thái hệ thống
                        </h2>
                        <div className={cx('systemInfo')}>
                            <div className={cx('infoItem')}>
                                <span className={cx('label')}>
                                    <i className="fas fa-database"></i>
                                    Kết nối Database
                                </span>
                                <span className={cx('value', isConnected ? 'success' : 'error')}>
                                    {isConnected ? `Hoạt động (${collections.length} collections)` : 'Mất kết nối'}
                                </span>
                            </div>
                            <div className={cx('infoItem')}>
                                <span className={cx('label')}>
                                    <i className="fas fa-memory"></i>
                                    Hiệu suất hệ thống
                                </span>
                                <span className={cx('value', 'success')}>
                                    {stats.systemHealth}% - Tối ưu
                                </span>
                            </div>
                            <div className={cx('infoItem')}>
                                <span className={cx('label')}>
                                    <i className="fas fa-clock"></i>
                                    Thời gian hệ thống
                                </span>
                                <span className={cx('value')}>
                                    {currentTime.toLocaleString('vi-VN')}
                                </span>
                            </div>
                            <div className={cx('infoItem')}>
                                <span className={cx('label')}>
                                    <i className="fas fa-shield-alt"></i>
                                    Bảo mật
                                </span>
                                <span className={cx('value', 'success')}>
                                    SSL Active - Cấp độ cao
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className={cx('card')} style={{ marginTop: '24px' }}>
                        <h2>
                            <i className="fas fa-history"></i>
                            Hoạt động gần đây
                        </h2>
                        <div className={cx('activityList')}>
                            {[
                                { time: '10:30', action: 'Văn bản "Quy định mới về ATGT" đã được phê duyệt', type: 'success', icon: 'check' },
                                { time: '09:15', action: 'Người dùng "Nguyễn Văn A" đăng nhập hệ thống', type: 'info', icon: 'sign-in-alt' },
                                { time: '08:45', action: 'Cập nhật dữ liệu từ hệ thống trung ương', type: 'info', icon: 'sync' },
                                { time: '08:30', action: 'Sao lưu dữ liệu tự động thành công', type: 'success', icon: 'save' },
                                { time: '08:00', action: 'Khởi động hệ thống buổi sáng', type: 'info', icon: 'power-off' }
                            ].map((activity, index) => (
                                <div key={index} className={cx('activityItem')}>
                                    <div className={cx('activityIcon', activity.type)}>
                                        <i className={`fas fa-${activity.icon}`}></i>
                                    </div>
                                    <div className={cx('activityContent')}>
                                        <div className={cx('time')}>{activity.time}</div>
                                        <div className={cx('description')}>{activity.action}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div>
                    {/* Quick Actions */}
                    <div className={cx('card')}>
                        <h2>
                            <i className="fas fa-bolt"></i>
                            Thao tác nhanh
                        </h2>
                        <div className={cx('quickActions')}>
                            <button className={cx('actionBtn', 'primary')}>
                                <i className="fas fa-plus"></i>
                                Tạo văn bản mới
                            </button>
                            <button className={cx('actionBtn', 'success')}>
                                <i className="fas fa-chart-bar"></i>
                                Xem báo cáo
                            </button>
                            <button className={cx('actionBtn', 'warning')}>
                                <i className="fas fa-cog"></i>
                                Cài đặt hệ thống
                            </button>
                            <button className={cx('actionBtn', 'danger')}>
                                <i className="fas fa-download"></i>
                                Sao lưu dữ liệu
                            </button>
                        </div>
                    </div>

                    {/* Chart Placeholder */}
                    <div className={cx('card')} style={{ marginTop: '24px' }}>
                        <h2>
                            <i className="fas fa-chart-line"></i>
                            Thống kê theo tháng
                        </h2>
                        <div className={cx('chartContainer')}>
                            <div>
                                <i className="fas fa-chart-area"></i>
                                Biểu đồ sẽ hiển thị ở đây
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;