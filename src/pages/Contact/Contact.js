import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import Table from '../../components/Table/Table';
import directusService from '../../api/directus';
import styles from './Contact.module.scss';
import * as XLSX from 'xlsx';

const cx = classNames.bind(styles);

const Contact = () => {
  const [pageData, setPageData] = useState(null);
  const [contactData, setContactData] = useState([]);
  const [donViData, setDonViData] = useState([]);
  const [canBoData, setCanBoData] = useState([]);
  const [selectedDonVi, setSelectedDonVi] = useState(null);
  const [currentView, setCurrentView] = useState('donvi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Columns cho bảng Đơn vị với responsive design
  const donViColumns = [
    {
      key: 'stt',
      title: 'STT',
      render: (value, item, index) => index + 1,
      sortable: false
    },
    {
      key: 'ma_don_vi',
      title: 'Mã Đơn Vị',
      sortable: true
    },
    {
      key: 'ten_don_vi',
      title: 'Tên Đơn Vị',
      sortable: true,
      render: (value, item) => (
        <span 
          className={cx('unitName')}
          title={value}
        >
          {value}
        </span>
      )
    },
    {
      key: 'dia_chi_chi_tiet',
      title: 'Địa Chỉ',
      render: (value, item) => {
        const address = [item.dia_chi_chi_tiet, item.dia_chi_cap_xa, item.dia_chi_cap_tinh]
          .filter(Boolean).join(', ');
        return (
          <div className={cx('addressCell')} title={address}>
            {address || '-'}
          </div>
        );
      }
    },
    {
      key: 'so_dien_thoai',
      title: 'SĐT',
      render: (value) => {
        if (!value) return '-';
        return (
          <a href={`tel:${value}`} className={cx('phoneLink')}>
            {value}
          </a>
        );
      }
    }
  ];

  // Columns cho bảng Cán bộ với responsive design
  const canBoColumns = [
    {
      key: 'stt',
      title: 'STT',
      render: (value, item, index) => index + 1,
      sortable: false
    },
    {
      key: 'id_canbo',
      title: 'Mã',
      sortable: true
    },
    {
      key: 'ten_can_bo',
      title: 'Tên Cán Bộ',
      sortable: true,
      render: (value, item) => (
        <span className={cx('staffName')}>
          {value}
        </span>
      )
    },
    {
      key: 'ngay_sinh',
      title: 'Ngày Sinh',
      render: (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('vi-VN');
      }
    },
    {
      key: 'que_quan',
      title: 'Quê Quán',
      sortable: true,
      render: (value) => (
        <div className={cx('addressCell')} title={value}>
          {value || '-'}
        </div>
      )
    },
    {
      key: 'cap_bac',
      title: 'Cấp Bậc',
      type: 'badge',
      getBadgeColor: (value) => {
        if (!value) return 'gray';
        if (value.includes('úy')) return 'blue';
        if (value.includes('tá')) return 'green';
        if (value.includes('tướng')) return 'yellow';
        return 'gray';
      },
      render: (value) => value || '-'
    },
    {
      key: 'chuc_vu',
      title: 'Chức Vụ',
      sortable: true,
      render: (value) => (
        <div className={cx('positionCell')} title={value}>
          {value || '-'}
        </div>
      )
    }
  ];

  // Actions cho bảng đơn vị
  const donViActions = [
    {
      icon: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <i className="fas fa-users"></i>
          <span>Chi tiết</span>
        </span>
      ),
      title: 'Xem chi tiết cán bộ',
      onClick: (item) => fetchCanBoData(item)
    }
  ];

  // Fetch Can Bo data
  const fetchCanBoData = async (donVi) => {
    try {
      setLoading(true);
      setError('');
      setSearchTerm(''); // Reset search when viewing specific unit
      setSearchResults([]);

      const canBoResult = await directusService.getCollection('can_bo', {
        filter: { ma_don_vi: { _eq: donVi.id } },
        sort: ['ten_can_bo'],
        limit: 100
      });
      
      if (canBoResult.success) {
        setCanBoData(canBoResult.data);
        setSelectedDonVi(donVi);
        setCurrentView('canbo');
      } else {
        setCanBoData([]);
        setSelectedDonVi(donVi);
        setCurrentView('canbo');
      }

    } catch (err) {
      setError(`Lỗi tải dữ liệu cán bộ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = (term) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    const currentData = currentView === 'canbo' ? canBoData : donViData;
    const results = currentData.filter(item => {
      const searchFields = currentView === 'canbo' 
        ? ['ten_can_bo', 'id_canbo', 'que_quan', 'cap_bac', 'chuc_vu']
        : ['ten_don_vi', 'ma_don_vi', 'dia_chi_chi_tiet', 'dia_chi_cap_xa', 'dia_chi_cap_tinh'];
      
      return searchFields.some(field => 
        item[field]?.toLowerCase().includes(term.toLowerCase())
      );
    });

    setSearchResults(results);
  };

  // Load data
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const isAuth = await directusService.ensureAuthenticated();
      if (!isAuth) {
        setError('Cần đăng nhập để truy cập dữ liệu');
        setLoading(false);
        return;
      }

      // Page data
      const pageResult = await directusService.getPageBySlug('contact');
      if (pageResult.success) {
        setPageData(pageResult.data);
      }

      // Contact data
      const collections = ['contacts', 'lien_he', 'thong_tin_lien_he'];
      for (const collection of collections) {
        const result = await directusService.getCollection(collection);
        if (result.success && result.data.length > 0) {
          setContactData(result.data.map(item => 
            directusService.filterVisibleFields(item)
          ));
          break;
        }
      }

      // Don vi data
      const donViResult = await directusService.getDonVi();
      if (donViResult.success) {
        setDonViData(donViResult.data);
      }

    } catch (err) {
      setError(`Lỗi tải dữ liệu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Go back
  const goBackToDonVi = () => {
    setCurrentView('donvi');
    setSelectedDonVi(null);
    setCanBoData([]);
    setSearchTerm('');
    setSearchResults([]);
  };

  // Render contact info
  const renderFieldValue = (key, value) => {
    if (!value) return '-';
    if (typeof value === 'string' && value.includes('@')) {
      return <a href={`mailto:${value}`} className={cx('emailLink')}>{value}</a>;
    }
    if (typeof value === 'string' && value.startsWith('http')) {
      return <a href={value} target="_blank" rel="noopener noreferrer" className={cx('webLink')}>{value}</a>;
    }
    if (typeof value === 'string' && /^[\d\s\-\+\(\)]+$/.test(value) && value.length >= 8) {
      return <a href={`tel:${value.replace(/\s/g, '')}`} className={cx('phoneLink')}>{value}</a>;
    }
    return <span className={cx('textValue')}>{value.toString()}</span>;
  };

  const formatFieldName = (key) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Stats
  const getStats = (data) => {
    return {
      total: data.length,
      hasCapBac: data.filter(d => d.cap_bac).length,
      hasChucVu: data.filter(d => d.chuc_vu).length
    };
  };

  // Export Excel function
  const handleExport = () => {
    const dataToExport = getDisplayData();
    
    if (!dataToExport.length) {
      alert('Không có dữ liệu để xuất');
      return;
    }

    try {
      let exportData;
      let fileName;

      if (currentView === 'canbo') {
        exportData = dataToExport.map((item, index) => ({
          'STT': index + 1,
          'Mã Cán Bộ': item.id_canbo || '',
          'Tên Cán Bộ': item.ten_can_bo || '',
          'Ngày Sinh': item.ngay_sinh ? new Date(item.ngay_sinh).toLocaleDateString('vi-VN') : '',
          'Quê Quán': item.que_quan || '',
          'Cấp Bậc': item.cap_bac || '',
          'Chức Vụ': item.chuc_vu || ''
        }));
        fileName = `Danh_sach_can_bo_${selectedDonVi?.ten_don_vi?.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      } else {
        exportData = dataToExport.map((item, index) => ({
          'STT': index + 1,
          'Mã Đơn Vị': item.ma_don_vi || '',
          'Tên Đơn Vị': item.ten_don_vi || '',
          'Địa Chỉ': [item.dia_chi_chi_tiet, item.dia_chi_cap_xa, item.dia_chi_cap_tinh].filter(Boolean).join(', ') || '',
          'SĐT': item.so_dien_thoai || ''
        }));
        fileName = `Danh_sach_don_vi_${searchTerm ? `tim_kiem_${searchTerm}_` : ''}${new Date().toISOString().slice(0, 10)}.xlsx`;
      }

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Danh sách");
      XLSX.writeFile(wb, fileName);
      
    } catch (error) {
      console.error('Lỗi xuất Excel:', error);
      alert('Có lỗi khi xuất Excel');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Determine which data to show
  const getDisplayData = () => {
    if (searchTerm && searchResults.length >= 0) {
      return searchResults;
    }
    return currentView === 'canbo' ? canBoData : donViData;
  };

  const currentData = getDisplayData();
  const stats = currentView === 'canbo' ? getStats(canBoData) : { total: donViData.length };

  return (
    <div className={cx('contactPage')}>
      {/* Header - Compact version */}
      <div className={cx('pageHeader')}>
        <div className={cx('headerContent')}>
          <h1 className={cx('pageTitle')}>
            <div className={cx('titleIcon')}>
              <i className="fas fa-address-book"></i>
            </div>
            {currentView === 'canbo' 
              ? `Cán bộ - ${selectedDonVi?.ten_don_vi}` 
              : 'Thông tin liên hệ'
            }
          </h1>
          <p className={cx('pageSubtitle')}>
            {currentView === 'canbo' 
              ? `Danh sách cán bộ thuộc đơn vị ${selectedDonVi?.ten_don_vi}`
              : 'Thông tin đơn vị và cán bộ trong hệ thống'
            }
          </p>
        </div>
        
        {/* Export Button */}
        <div className={cx('headerActions')}>
          <button 
            onClick={handleExport}
            className={cx('exportBtn')}
            disabled={!getDisplayData().length}
          >
            <i className="fas fa-file-excel"></i> Xuất Excel
          </button>
        </div>
      </div>

      {/* Breadcrumb và tìm kiếm */}
      {currentView === 'canbo' && (
        <div className={cx('controlSection')}>
          <div className={cx('controlContent')}>
            <button onClick={goBackToDonVi} className={cx('backButton')}>
              <i className="fas fa-arrow-left"></i>
              Quay về danh sách đơn vị
            </button>
          </div>
        </div>
      )}

      {/* Search Section */}
      {(donViData.length > 0 || canBoData.length > 0) && (
        <div className={cx('controlSection')}>
          <div className={cx('sectionTitle')}>
            Tìm kiếm {currentView === 'canbo' ? 'cán bộ' : 'đơn vị'}
          </div>
          <div className={cx('controlContent')}>
            <div className={cx('searchContainer')}>
              <div className={cx('searchIcon')}>
                <i className="fas fa-search"></i>
              </div>
              <input
                type="text"
                placeholder={`Nhập ${currentView === 'canbo' ? 'tên cán bộ, mã, quê quán, cấp bậc...' : 'tên đơn vị, mã, địa chỉ...'} để tìm kiếm`}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className={cx('searchInput')}
              />
              {searchTerm && (
                <button 
                  onClick={() => handleSearch('')}
                  className={cx('clearButton')}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            {searchTerm && (
              <div className={cx('searchInfo')}>
                Tìm kiếm: "<strong>{searchTerm}</strong>" - Có <strong>{searchResults.length}</strong> kết quả
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className={cx('errorAlert')}>
          <div className={cx('alertIcon')}>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className={cx('alertContent')}>{error}</div>
          <button onClick={() => setError('')} className={cx('alertClose')}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Contact Info */}
      {currentView === 'donvi' && contactData.length > 0 && (
        <div className={cx('controlSection')}>
          <div className={cx('sectionTitle')}>Thông tin liên hệ</div>
          <div className={cx('controlContent')}>
            <div className={cx('contactGrid')}>
              {contactData.map((item, index) => (
                <div key={index} className={cx('contactCard')}>
                  {Object.entries(item).map(([key, value]) => {
                    if (!value || ['status', 'sort'].includes(key)) return null;
                    return (
                      <div key={key} className={cx('contactItem')}>
                        <span className={cx('contactLabel')}>{formatFieldName(key)}:</span>
                        <span className={cx('contactValue')}>{renderFieldValue(key, value)}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {currentData.length > 0 && (
        <div className={cx('resultsSection')}>
          {/* Stats Bar */}
          <div className={cx('statsBar')}>
            <div className={cx('statsGroup')}>
              <div className={cx('statItem')}>
                <span className={cx('statLabel')}>
                  {searchTerm ? 'Kết quả:' : 'Tổng số:'}
                </span>
                <span className={cx('statValue')}>{currentData.length}</span>
              </div>
              {currentView === 'canbo' && !searchTerm && (
                <>
                  <div className={cx('statItem')}>
                    <span className={cx('statLabel')}>Có cấp bậc:</span>
                    <span className={cx('statValue', 'blue')}>{stats.hasCapBac}</span>
                  </div>
                  <div className={cx('statItem')}>
                    <span className={cx('statLabel')}>Có chức vụ:</span>
                    <span className={cx('statValue', 'green')}>{stats.hasChucVu}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className={cx('tableContainer')}>
            <Table
              data={currentData}
              columns={currentView === 'canbo' ? canBoColumns : donViColumns}
              actions={currentView === 'donvi' ? donViActions : []}
              loading={loading}
              searchable={false} // Disable Table's built-in search since we have custom search
              sortable={true}
              pagination={true}
              itemsPerPage={20}
              emptyMessage={searchTerm ? `Không tìm thấy kết quả cho "${searchTerm}"` : "Không có dữ liệu"}
            />
          </div>
        </div>
      )}

      {/* Empty States */}
      {!loading && currentData.length === 0 && !searchTerm && (
        <div className={cx('emptyState')}>
          {currentView === 'donvi' ? (
            <>
              <div className={cx('emptyIcon')}>
                <i className="fas fa-building"></i>
              </div>
              <h3>Chưa có dữ liệu</h3>
              <p>Hệ thống chưa có thông tin liên hệ hoặc đơn vị để hiển thị</p>
            </>
          ) : (
            <>
              <div className={cx('emptyIcon')}>
                <i className="fas fa-users"></i>
              </div>
              <h3>Chưa có cán bộ</h3>
              <p>Đơn vị "{selectedDonVi?.ten_don_vi}" chưa có cán bộ nào</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Contact;