// src/pages/Contact.js - Enhanced with Can Bo Management
import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import directusService from '../../api/directus';
import styles from './Contact.module.scss';

const cx = classNames.bind(styles);

const Contact = () => {
  const [pageData, setPageData] = useState(null);
  const [contactData, setContactData] = useState([]);
  const [donViData, setDonViData] = useState([]);
  const [canBoData, setCanBoData] = useState([]);
  const [selectedDonVi, setSelectedDonVi] = useState(null);
  const [currentView, setCurrentView] = useState('donvi');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  
  const LoginForm = () => {
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState(null);

    const handleLogin = async (e) => {
      e.preventDefault();
      
      if (!loginData.email || !loginData.password) {
        setLoginError('Vui lòng nhập đầy đủ email và mật khẩu');
        return;
      }

      try {
        setLoginLoading(true);
        setLoginError(null);

        const result = await directusService.login(loginData.email, loginData.password);
        
        if (result.success) {
          setNeedsLogin(false);
          fetchData();
        } else {
          setLoginError(result.error || 'Đăng nhập thất bại');
        }
      } catch (err) {
        setLoginError(err.message || 'Có lỗi xảy ra');
      } finally {
        setLoginLoading(false);
      }
    };

    return (
      <div className={cx('loginContainer')}>
        <div className={cx('loginCard')}>
          <form onSubmit={handleLogin} className={cx('loginForm')}>
            <div className={cx('loginHeader')}>
              <h2 className={cx('loginTitle')}>Đăng nhập hệ thống</h2>
              <p className={cx('loginSubtitle')}>Vui lòng đăng nhập để xem thông tin liên hệ</p>
            </div>

            {loginError && (
              <div className={cx('loginError')}>
                {loginError}
              </div>
            )}

            <div className={cx('formGroup')}>
              <label className={cx('formLabel')}>Email</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                className={cx('formInput')}
                placeholder="admin@o.io"
                required
                disabled={loginLoading}
              />
            </div>

            <div className={cx('formGroup')}>
              <label className={cx('formLabel')}>Mật khẩu</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                className={cx('formInput')}
                placeholder="Nhập mật khẩu"
                required
                disabled={loginLoading}
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className={cx('loginButton')}
            >
              {loginLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    );
  };

  // Fetch Can Bo data for selected Don Vi
  const fetchCanBoData = async (donVi) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching Can Bo for Don Vi:', donVi.ten_don_vi, 'with ID:', donVi.id);
      
      // Use correct collection name: can_bo (with underscore)
      // Filter by ten_donvi = donvi.id (foreign key relationship)
      console.log('Trying collection: can_bo');
      try {
        const canBoResult = await directusService.getCollection('can_bo', {
          filter: {
            ma_don_vi: { _eq: donVi.id }  // Use donvi.id instead of donvi.ten_don_vi
          },
          sort: ['ten_can_bo'],
          limit: 100
        });
        
        if (canBoResult.success) {
          console.log('Can Bo data loaded:', canBoResult.data);
          setCanBoData(canBoResult.data);
          setSelectedDonVi(donVi);
          setCurrentView('canbo');
        } else if (canBoResult.error === 'Authentication required' || canBoResult.error === 'Authentication failed - please login again') {
          console.log('Authentication required for canbo data');
          setNeedsLogin(true);
          return;
        } else if (canBoResult.error && canBoResult.error.includes('403')) {
          // Handle permission error specifically
          console.log('Permission denied for can_bo collection');
          setError(`Không có quyền truy cập dữ liệu cán bộ. Vui lòng liên hệ quản trị viên để cấp quyền cho collection 'can_bo'.`);
        } else {
          // No data found or other error
          console.log('No Can Bo data found or accessible');
          setCanBoData([]);
          setSelectedDonVi(donVi);
          setCurrentView('canbo');
        }
      } catch (err) {
        console.error('Fetch Can Bo error:', err);
        if (err.message.includes('403') || err.message.includes('Forbidden')) {
          setError(`Không có quyền truy cập collection 'can_bo'. Tài khoản hiện tại chưa được cấp quyền xem thông tin cán bộ.`);
        } else {
          setError(`Lỗi tải dữ liệu cán bộ: ${err.message}`);
        }
      }

    } catch (err) {
      console.error('Fetch Can Bo error:', err);
      if (err.message.includes('403') || err.message.includes('Forbidden')) {
        setError(`Không có quyền truy cập dữ liệu cán bộ. Tài khoản hiện tại chưa được cấp quyền xem thông tin cán bộ.`);
      } else {
        setError(`Lỗi tải dữ liệu cán bộ: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setNeedsLogin(false);
      
      console.log('Checking authentication...');
      const isAuthenticated = await directusService.ensureAuthenticated();
      if (!isAuthenticated) {
        console.log('Not authenticated, showing login form');
        setNeedsLogin(true);
        setLoading(false);
        return;
      }
      
      console.log('Authenticated, fetching data...');
      
      // Try to get Contact page data
      const pageResult = await directusService.getPageBySlug('contact');
      if (pageResult.success) {
        setPageData(pageResult.data);
        console.log('Page data loaded:', pageResult.data);
      }

      // Try to get contact information
      const collections = ['contacts', 'lien_he', 'thong_tin_lien_he'];
      for (const collection of collections) {
        console.log(`Trying collection: ${collection}`);
        const result = await directusService.getCollection(collection);
        if (result.success && result.data.length > 0) {
          console.log(`Contact: Found data in ${collection}:`, result.data);
          const visibleData = result.data.map(item => 
            directusService.filterVisibleFields(item)
          );
          setContactData(visibleData);
          break;
        }
      }

      // Get department/unit data
      const donViResult = await directusService.getDonVi();
      if (donViResult.success && donViResult.data.length > 0) {
        console.log('DonVi data loaded:', donViResult.data);
        setDonViData(donViResult.data);
      } else if (donViResult.error === 'Authentication required' || donViResult.error === 'Authentication failed - please login again') {
        console.log('Authentication required for donvi data');
        setNeedsLogin(true);
        setLoading(false);
        return;
      }

    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Lỗi tải dữ liệu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Go back to Don Vi list
  const goBackToDonVi = () => {
    setCurrentView('donvi');
    setSelectedDonVi(null);
    setCanBoData([]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Render field value based on its type
  const renderFieldValue = (key, value) => {
    if (!value) return '-';

    // Handle different data types
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return JSON.stringify(value);
    }

    // Handle URLs
    if (typeof value === 'string' && (value.startsWith('http') || value.includes('@'))) {
      if (value.includes('@')) {
        return <a href={`mailto:${value}`}>{value}</a>;
      }
      return <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>;
    }

    // Handle phone numbers
    if (typeof value === 'string' && /^[\d\s\-\+\(\)]+$/.test(value) && value.length >= 8) {
      return <a href={`tel:${value.replace(/\s/g, '')}`}>{value}</a>;
    }

    return value.toString();
  };

  // Format field name for display
  const formatFieldName = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  };

  // Render contact data as cards
  const renderContactSection = (title, data) => {
    if (!data || data.length === 0) return null;

    return (
      <div className={cx('section')}>
        <h3 className={cx('sectionTitle')}>{title}</h3>
        <div className={cx('contactGrid')}>
          {data.map((item, index) => (
            <div key={index} className={cx('contactCard')}>
              {Object.entries(item).map(([key, value]) => {
                if (!value || ['status', 'sort'].includes(key)) return null;
                
                return (
                  <div key={key} className={cx('contactItem')}>
                    <span className={cx('contactLabel')}>
                      {formatFieldName(key)}:
                    </span>
                    <span className={cx('contactValue')}>
                      {renderFieldValue(key, value)}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Don Vi data as table with action buttons
  const renderDonViTable = (data) => {
    if (!data || data.length === 0) return null;

    return (
      <div className={cx('section')}>
        <div className={cx('sectionHeader')}>
          <h3 className={cx('sectionTitle')}>Danh sách đơn vị</h3>
          <p className={cx('sectionDescription')}>
            Click "Xem cán bộ" để xem danh sách cán bộ của từng đơn vị
          </p>
        </div>
        <div className={cx('tableContainer')}>
          <table className={cx('table')}>
            <thead className={cx('tableHeader')}>
              <tr>
                <th className={cx('tableHeaderCell')}>STT</th>
                <th className={cx('tableHeaderCell')}>Mã đơn vị</th>
                <th className={cx('tableHeaderCell')}>Tên đơn vị</th>
                <th className={cx('tableHeaderCell')}>Địa chỉ</th>
                <th className={cx('tableHeaderCell')}>Số điện thoại</th>
                <th className={cx('tableHeaderCell')}>Thao tác</th>
              </tr>
            </thead>
            <tbody className={cx('tableBody')}>
              {data.map((item, index) => (
                <tr key={index} className={cx('tableRow')}>
                  <td className={cx('tableCell')}>{index + 1}</td>
                  <td className={cx('tableCell')}>
                    <div className={cx('cellContent')}>
                      <span className={cx('cellValue')}>
                        {item.ma_don_vi || item.id || '-'}
                      </span>
                    </div>
                  </td>
                  <td className={cx('tableCell')}>
                    <div className={cx('cellContent')}>
                      <span className={cx('cellValue')}>
                        {item.ten_don_vi || item.name || '-'}
                      </span>
                    </div>
                  </td>
                  <td className={cx('tableCell')}>
                    <div className={cx('cellContent')}>
                      <span className={cx('cellValue')}>
                        {[item.dia_chi_chi_tiet, item.dia_chi_cap_xa, item.dia_chi_cap_tinh]
                          .filter(Boolean)
                          .join(', ') || '-'}
                      </span>
                    </div>
                  </td>
                  <td className={cx('tableCell')}>
                    <div className={cx('cellContent')}>
                      <span className={cx('cellValue')}>
                        {renderFieldValue('phone', item.so_dien_thoai)}
                      </span>
                    </div>
                  </td>
                  <td className={cx('tableCell')}>
                    <button
                      onClick={() => fetchCanBoData(item)}
                      className={cx('actionButton')}
                      title={`Xem cán bộ của ${item.ten_don_vi}`}
                    >
                      Xem cán bộ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Can Bo table
  const renderCanBoTable = (data, donVi) => {
    if (!data || data.length === 0) {
      return (
        <div className={cx('section')}>
          <div className={cx('breadcrumb')}>
            <button onClick={goBackToDonVi} className={cx('breadcrumbLink')}>
              ← Danh sách đơn vị
            </button>
            <span className={cx('breadcrumbSeparator')}>/</span>
            <span className={cx('breadcrumbCurrent')}>Cán bộ - {donVi.ten_don_vi}</span>
          </div>
          <div className={cx('emptyState')}>
            <div className={cx('emptyIcon')}>👤</div>
            <h3 className={cx('emptyTitle')}>Chưa có cán bộ</h3>
            <p className={cx('emptyMessage')}>
              Đơn vị "{donVi.ten_don_vi}" chưa có cán bộ nào trong hệ thống.
            </p>
            <button onClick={goBackToDonVi} className={cx('emptyBackButton')}>
              ← Quay về danh sách đơn vị
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={cx('section')}>
        <div className={cx('breadcrumb')}>
          <button onClick={goBackToDonVi} className={cx('breadcrumbLink')}>
            ← Danh sách đơn vị
          </button>
          <span className={cx('breadcrumbSeparator')}>/</span>
          <span className={cx('breadcrumbCurrent')}>Cán bộ - {donVi.ten_don_vi}</span>
        </div>
        
        <div className={cx('tableContainer')}>
          <table className={cx('table')}>
            <thead className={cx('tableHeader')}>
              <tr>
                <th className={cx('tableHeaderCell')}>STT</th>
                <th className={cx('tableHeaderCell')}>Số hiệu</th>
                <th className={cx('tableHeaderCell')}>Tên cán bộ</th>
                <th className={cx('tableHeaderCell')}>Ngày sinh</th>
                <th className={cx('tableHeaderCell')}>Quê quán</th>
                <th className={cx('tableHeaderCell')}>Cấp bậc</th>
                <th className={cx('tableHeaderCell')}>Chức vụ</th>
              </tr>
            </thead>
            <tbody className={cx('tableBody')}>
              {data.map((item, index) => (
                <tr key={index} className={cx('tableRow')}>
                  <td className={cx('tableCell')}>{index + 1}</td>
                  <td className={cx('tableCell')}>
                    <div className={cx('cellContent')}>
                      <span className={cx('cellValue', 'highlight')}>
                        {item.id_canbo || item.ma_can_bo || item.id || '-'}
                      </span>
                    </div>
                  </td>
                  <td className={cx('tableCell')}>
                    <div className={cx('cellContent')}>
                      <span className={cx('cellValue', 'name')}>
                        {item.ten_can_bo || item.ho_ten || item.name || '-'}
                      </span>
                    </div>
                  </td>
                  <td className={cx('tableCell')}>
                    <div className={cx('cellContent')}>
                      <span className={cx('cellValue')}>
                        {item.ngay_sinh ? new Date(item.ngay_sinh).toLocaleDateString('vi-VN') : '-'}
                      </span>
                    </div>
                  </td>
                  <td className={cx('tableCell')}>
                    <div className={cx('cellContent')}>
                      <span className={cx('cellValue')}>
                        {item.que_quan || '-'}
                      </span>
                    </div>
                  </td>
                  <td className={cx('tableCell')}>
                    <div className={cx('cellContent')}>
                      <span className={cx('cellValue', 'badge')}>
                        {item.cap_bac || '-'}
                      </span>
                    </div>
                  </td>
                  <td className={cx('tableCell')}>
                    <div className={cx('cellContent')}>
                      <span className={cx('cellValue', 'position')}>
                        {item.chuc_vu || '-'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Bottom back button */}
        <div className={cx('tableFooter')}>
          <button onClick={goBackToDonVi} className={cx('footerBackButton')}>
            ← Quay về danh sách đơn vị
          </button>
        </div>
      </div>
    );
  };

  // Show login form if needed
  if (needsLogin) {
    return <LoginForm />;
  }

  if (loading) {
    return (
      <div className={cx('loading')}>
        <div className={cx('loadingContent')}>
          <div className={cx('spinner')}></div>
          <p className={cx('loadingText')}>
            {currentView === 'canbo' ? 'Đang tải danh sách cán bộ...' : 'Đang tải thông tin liên hệ...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cx('error')}>
        <div className={cx('errorContent')}>
          <div className={cx('errorIcon')}>⚠️</div>
          <h2 className={cx('errorTitle')}>Lỗi tải dữ liệu</h2>
          <p className={cx('errorMessage')}>{error}</p>
          {currentView === 'canbo' && (
            <button onClick={goBackToDonVi} className={cx('errorButton')}>
              Quay về danh sách đơn vị
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cx('container')}>
      <div className={cx('content')}>
        {/* Page Header */}
        <div className={cx('header')}>
         
          
          <h1 className={cx('title')}>
            {currentView === 'canbo' 
              ? `Cán bộ - ${selectedDonVi?.ten_don_vi}` 
              : 'Thông tin liên hệ'
            }
          </h1>
          
          {/* Only show subtitle for donvi view and only if no custom page content */}
          {currentView === 'donvi' && !pageData?.content && (
            <p className={cx('subtitle')}>
              Thông tin đơn vị và cán bộ trong hệ thống
            </p>
          )}
          
          {/* Show page content only for donvi view */}
          {pageData?.content && currentView === 'donvi' && (
            <div 
              className={cx('subtitle')}
              dangerouslySetInnerHTML={{ __html: pageData.content }}
            />
          )}
        </div>

        {/* Content Container */}
        <div className={cx('card')}>
          {currentView === 'donvi' && (
            <>
              {/* Contact Data */}
              {renderContactSection('Thông tin liên hệ', contactData)}

              {/* Department Data as Table with Action Buttons */}
              {renderDonViTable(donViData)}

              {/* Default content if no data */}
              {contactData.length === 0 && donViData.length === 0 && (
                <div className={cx('emptyState')}>
                  <div className={cx('emptyIcon')}>📋</div>
                  <h3 className={cx('emptyTitle')}>Chưa có dữ liệu</h3>
                  <p className={cx('emptyMessage')}>
                    Hệ thống chưa có thông tin liên hệ hoặc đơn vị để hiển thị.
                    <br />
                    Vui lòng kiểm tra cấu hình Directus.
                  </p>
                </div>
              )}
            </>
          )}

          {currentView === 'canbo' && selectedDonVi && (
            <>
              {/* Can Bo Table */}
              {renderCanBoTable(canBoData, selectedDonVi)}
            </>
          )}

        </div>

        {/* Footer */}
        <div className={cx('footer')}>
          <p>Dữ liệu được đồng bộ từ hệ thống quản lý nội dung Directus</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;