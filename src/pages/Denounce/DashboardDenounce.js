import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import directusService from '../../api/directus.js';
import Button from '../../components/Button/Button.js';
import styles from './Denounce.module.scss';

const cx = classNames.bind(styles);

const DashboardDenounce = () => {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    pendingDocuments: 0,
    processingDocuments: 0,
    completedDocuments: 0,
    overdueDocuments: 0
  });
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load dashboard statistics
  const loadDashboardStats = async () => {
    try {
      const isAuth = await directusService.ensureAuthenticated();
      if (!isAuth) {
        setError('Cần đăng nhập để truy cập dữ liệu');
        return;
      }

      // Load total documents
      const documentsResult = await directusService.getCollection('don_thu', {
        aggregate: { count: '*' }
      });

      // Load flow statistics
      const flowsResult = await directusService.getCollection('luong_xu_ly', {
        fields: ['trang_thai'],
        limit: -1
      });

      if (documentsResult.success && flowsResult.success) {
       const flows = flowsResult.data;
       const docs = Array.isArray(documentsResult.data) ? documentsResult.data : [];
        setStats({
          totalDocuments: docs.length,
          pendingDocuments: flows.filter(f => f.trang_thai === 'Chưa nhận').length,
          processingDocuments: flows.filter(f => f.trang_thai === 'Đang xử lý').length,
          completedDocuments: flows.filter(f => f.trang_thai === 'Hoàn thành').length,
          overdueDocuments: flows.filter(f => f.trang_thai === 'Quá hạn').length
        });
      }
    } catch (err) {
      setError('Lỗi tải thống kê: ' + err.message);
    }
  };

  // Load recent documents
  const loadRecentDocuments = async () => {
    try {
      const result = await directusService.getCollection('don_thu', {
        fields: ['id', 'so_van_ban', 'tieu_de', 'ho_ten_nguoi_gui', 'date_created', 'han_xu_ly', 'status'],
        sort: ['-date_created'],
        limit: 5
      });

      if (result.success) {
        setRecentDocuments(result.data);
      }
    } catch (err) {
      console.error('Lỗi tải đơn thư gần đây:', err);
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    try {
      const result = await directusService.getCollection('thong_bao', {
        fields: ['id', 'noi_dung', 'loai_thong_bao', 'ngay_gui', 'da_doc'],
        sort: ['-ngay_gui'],
        limit: 5,
        filter: { da_doc: { _eq: false } }
      });

      if (result.success) {
        setNotifications(result.data);
      }
    } catch (err) {
      console.error('Lỗi tải thông báo:', err);
    }
  };

  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      await Promise.all([
        loadDashboardStats(),
        loadRecentDocuments(),
        loadNotifications()
      ]);
      setLoading(false);
    };

    initDashboard();
  }, []);

  if (loading) {
    return (
      <div className={cx('loading')}>
        <div className={cx('spinner')}></div>
      </div>
    );
  }

  return (
    <div className={cx('dashboardPage')}>
      {/* Header */}
      <div className={cx('pageHeader')}>
        <div className={cx('headerContent')}>
          <h1 className={cx('pageTitle')}>
            <i className={cx('titleIcon', 'fas', 'fa-tachometer-alt')}></i>
            Tổng Quan Hệ Thống
          </h1>
          <p className={cx('pageSubtitle')}>
            Thống kê và theo dõi hoạt động xử lý đơn thư, khiếu nại, tố cáo
          </p>
        </div>
        
        <div className={cx('headerActions')}>
          <Button 
            onClick={() => window.location.reload()}
            variant="secondary"
            icon="fas fa-sync-alt"
            size="small"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={cx('errorAlert')}>
          <div className={cx('alertIcon')}>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className={cx('alertContent')}>{error}</div>
          <button onClick={() => setError('')} className={cx('alertClose')}>×</button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className={cx('statsGrid')}>
        <div className={cx('statCard', 'blue')}>
          <div className={cx('statIcon')}>
            <i className="fas fa-file-alt"></i>
          </div>
          <div className={cx('statContent')}>
            <div className={cx('statValue')}>{stats.totalDocuments}</div>
            <div className={cx('statLabel')}>Tổng đơn thư</div>
          </div>
        </div>

        <div className={cx('statCard', 'yellow')}>
          <div className={cx('statIcon')}>
            <i className="fas fa-clock"></i>
          </div>
          <div className={cx('statContent')}>
            <div className={cx('statValue')}>{stats.pendingDocuments}</div>
            <div className={cx('statLabel')}>Chờ xử lý</div>
          </div>
        </div>

        <div className={cx('statCard', 'green')}>
          <div className={cx('statIcon')}>
            <i className="fas fa-cogs"></i>
          </div>
          <div className={cx('statContent')}>
            <div className={cx('statValue')}>{stats.processingDocuments}</div>
            <div className={cx('statLabel')}>Đang xử lý</div>
          </div>
        </div>

        <div className={cx('statCard', 'purple')}>
          <div className={cx('statIcon')}>
            <i className="fas fa-check-circle"></i>
          </div>
          <div className={cx('statContent')}>
            <div className={cx('statValue')}>{stats.completedDocuments}</div>
            <div className={cx('statLabel')}>Hoàn thành</div>
          </div>
        </div>

        <div className={cx('statCard', 'red')}>
          <div className={cx('statIcon')}>
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <div className={cx('statContent')}>
            <div className={cx('statValue')}>{stats.overdueDocuments}</div>
            <div className={cx('statLabel')}>Quá hạn</div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className={cx('contentGrid')}>
        {/* Recent Documents */}
        <div className={cx('contentCard')}>
          <div className={cx('cardHeader')}>
            <h3 className={cx('cardTitle')}>
              <i className="fas fa-file-alt"></i>
              Đơn thư mới nhất
            </h3>
            <Button variant="ghost" size="small">
              Xem tất cả
            </Button>
          </div>
          
          <div className={cx('cardContent')}>
            {recentDocuments.length > 0 ? (
              <div className={cx('documentList')}>
                {recentDocuments.map(doc => (
                  <div key={doc.id} className={cx('documentItem')}>
                    <div className={cx('documentInfo')}>
                      <div className={cx('documentTitle')}>
                        {doc.tieu_de}
                      </div>
                      <div className={cx('documentMeta')}>
                        <span className={cx('documentNumber')}>{doc.so_van_ban}</span>
                        <span className={cx('documentSender')}>- {doc.ho_ten_nguoi_gui}</span>
                      </div>
                      <div className={cx('documentDate')}>
                        {new Date(doc.date_created).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div className={cx('documentStatus', doc.status?.toLowerCase())}>
                      {doc.status || 'Mới'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={cx('emptyState')}>
                <i className="fas fa-inbox"></i>
                <p>Chưa có đơn thư nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className={cx('contentCard')}>
          <div className={cx('cardHeader')}>
            <h3 className={cx('cardTitle')}>
              <i className="fas fa-bell"></i>
              Thông báo
            </h3>
            <Button variant="ghost" size="small">
              Đánh dấu đã đọc
            </Button>
          </div>
          
          <div className={cx('cardContent')}>
            {notifications.length > 0 ? (
              <div className={cx('notificationList')}>
                {notifications.map(notification => (
                  <div key={notification.id} className={cx('notificationItem', notification.loai_thong_bao)}>
                    <div className={cx('notificationIcon')}>
                      <i className={`fas ${
                        notification.loai_thong_bao === 'urgent' ? 'fa-exclamation-triangle' :
                        notification.loai_thong_bao === 'warning' ? 'fa-exclamation-circle' :
                        'fa-info-circle'
                      }`}></i>
                    </div>
                    <div className={cx('notificationContent')}>
                      <div className={cx('notificationText')}>
                        {notification.noi_dung}
                      </div>
                      <div className={cx('notificationTime')}>
                        {new Date(notification.ngay_gui).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={cx('emptyState')}>
                <i className="fas fa-bell-slash"></i>
                <p>Không có thông báo mới</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={cx('quickActions')}>
        <h3 className={cx('sectionTitle')}>Thao tác nhanh</h3>
        <div className={cx('actionGrid')}>
          <button className={cx('actionCard')}>
            <i className="fas fa-plus-circle"></i>
            <span>Tiếp nhận đơn thư</span>
          </button>
          <button className={cx('actionCard')}>
            <i className="fas fa-search"></i>
            <span>Tra cứu tiến trình</span>
          </button>
          <button className={cx('actionCard')}>
            <i className="fas fa-chart-bar"></i>
            <span>Báo cáo thống kê</span>
          </button>
          <button className={cx('actionCard')}>
            <i className="fas fa-cog"></i>
            <span>Cấu hình hệ thống</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardDenounce;