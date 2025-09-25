import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import directusService from '../../api/directus.js';
import Table from '../../components/Table/Table.js';
import styles from './Address.module.scss';
import * as XLSX from 'xlsx';

const cx = classNames.bind(styles);

const Address = () => {
  // States cho dữ liệu
  const [provinces, setProvinces] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedProvinceInfo, setSelectedProvinceInfo] = useState(null);
  
  // States cho UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('province'); // 'province' hoặc 'search'
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Load danh sách tỉnh thành phố
  const loadProvinces = async () => {
    setLoading(true);
    setError('');
    try {
      const isAuth = await directusService.ensureAuthenticated();
      if (!isAuth) {
        setError('Cần đăng nhập để truy cập dữ liệu');
        setLoading(false);
        return;
      }

      const result = await directusService.getCollection('tinh_thanh_pho', {
        sort: ['ten_tinh'],
        fields: ['ma_tinh', 'ten_tinh']
      });

      if (result.success) {
        setProvinces(result.data);
      } else {
        setError('Không thể tải danh sách tỉnh thành phố: ' + result.error);
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    }
    setLoading(false);
  };

  // Load tất cả xã phường (để tìm kiếm toàn quốc)
  const loadAllDistricts = async () => {
    try {
      const isAuth = await directusService.ensureAuthenticated();
      if (!isAuth) return;

      console.log('Loading all districts...');
      const result = await directusService.getCollection('xa_phuong', {
        fields: ['ma_xa_phuong', 'ten_xa_phuong', 'cap_hanh_chinh', 'nghi_quyet', 'ma_tinh'],
        limit: -1 // Lấy tất cả, không giới hạn
      });

      if (result.success) {
        console.log('Loaded districts:', result.data.length);
        console.log('Sample districts:', result.data.slice(0, 5));
        
        // Kiểm tra các mã tỉnh khác nhau
        const uniqueProvinces = [...new Set(result.data.map(d => d.ma_tinh))];
        console.log('Unique province codes:', uniqueProvinces);
        
        setAllDistricts(result.data);
      }
    } catch (err) {
      console.error('Lỗi tải toàn bộ xã phường:', err);
    }
  };

  // Load xã phường theo tỉnh
  const loadDistrictsByProvince = async (provinceCode) => {
    if (!provinceCode) {
      setFilteredDistricts([]);
      return;
    }

    setLoading(true);
    try {
      const isAuth = await directusService.ensureAuthenticated();
      if (!isAuth) {
        setError('Cần đăng nhập để truy cập dữ liệu');
        setLoading(false);
        return;
      }

      const result = await directusService.getCollection('xa_phuong', {
        filter: { ma_tinh: provinceCode },
        sort: ['ten_xa_phuong'],
        fields: ['ma_xa_phuong', 'ten_xa_phuong', 'cap_hanh_chinh', 'nghi_quyet', 'ma_tinh']
      });

      if (result.success) {
        setFilteredDistricts(result.data);
      } else {
        setError('Không thể tải danh sách xã phường: ' + result.error);
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    }
    setLoading(false);
  };

  // Xử lý chọn tỉnh
  const handleProvinceChange = (provinceCode) => {
    setSelectedProvince(provinceCode);
    const provinceInfo = provinces.find(p => p.ma_tinh === provinceCode);
    setSelectedProvinceInfo(provinceInfo);
    loadDistrictsByProvince(provinceCode);
  };

  // Xử lý tìm kiếm toàn quốc
  const handleSearch = (term) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    const results = allDistricts.filter(district => 
      district.ten_xa_phuong?.toLowerCase().includes(term.toLowerCase())
    ).map(district => {
      const province = provinces.find(p => p.ma_tinh === district.ma_tinh);
      return {
        ...district,
        ten_tinh: province?.ten_tinh || 'Chưa xác định'
      };
    });

    setSearchResults(results);
  };

  // Load dữ liệu ban đầu
  useEffect(() => {
    const initData = async () => {
      await loadProvinces();
      await loadAllDistricts();
    };
    initData();
  }, []);

  // Load lại allDistricts sau khi provinces được tải
  useEffect(() => {
    if (provinces.length > 0 && allDistricts.length === 0) {
      loadAllDistricts();
    }
  }, [provinces]);

  // Columns cho bảng theo tỉnh
  const provinceDistrictColumns = [
    {
      key: 'stt',
      title: 'STT',
      render: (value, item, index) => index + 1,
      sortable: false
    },
    {
      key: 'ma_xa_phuong',
      title: 'Mã Xã/Phường',
      sortable: true
    },
    {
      key: 'ten_xa_phuong',
      title: 'Tên Xã/Phường',
      sortable: true,
      render: (value, item) => (
        <span 
          className={cx('districtName')}
          title={item.nghi_quyet ? `Nghị quyết: ${item.nghi_quyet}` : 'Chưa có nghị quyết'}
        >
          {value}
        </span>
      )
    },
    {
      key: 'cap_hanh_chinh',
      title: 'Cấp Hành Chính',
      type: 'badge',
      getBadgeColor: (value) => {
        switch (value?.toLowerCase()) {
          case 'xã': return 'green';
          case 'phường': return 'blue';
          case 'đặc khu': return 'yellow';
          default: return 'gray';
        }
      },
      render: (value) => value || 'Chưa xác định'
    }
  ];

  // Columns cho kết quả tìm kiếm toàn quốc
  const searchResultColumns = [
    {
      key: 'stt',
      title: 'STT',
      render: (value, item, index) => index + 1,
      sortable: false
    },
    {
      key: 'ten_xa_phuong',
      title: 'Tên Xã/Phường',
      sortable: true,
      render: (value, item) => (
        <span className={cx('districtName')}>{value}</span>
      )
    },
    {
      key: 'ten_tinh',
      title: 'Thuộc Tỉnh/TP',
      sortable: true,
      render: (value) => (
        <span className={cx('provinceName')}>{value}</span>
      )
    },
    {
      key: 'cap_hanh_chinh',
      title: 'Cấp Hành Chính',
      type: 'badge',
      getBadgeColor: (value) => {
        switch (value?.toLowerCase()) {
          case 'xã': return 'green';
          case 'phường': return 'blue';
          case 'đặc khu': return 'yellow';
          default: return 'gray';
        }
      },
      render: (value) => value || 'Chưa xác định'
    },
    {
      key: 'ma_xa_phuong',
      title: 'Mã',
      sortable: true
    }
  ];

  // Xuất Excel
  const handleExport = () => {
    const dataToExport = activeTab === 'search' ? searchResults : filteredDistricts;
    
    if (!dataToExport.length) {
      alert('Không có dữ liệu để xuất');
      return;
    }

    try {
      let exportData;
      let fileName;

      if (activeTab === 'search') {
        exportData = dataToExport.map((item, index) => ({
          'STT': index + 1,
          'Tên Xã/Phường': item.ten_xa_phuong,
          'Thuộc Tỉnh/TP': item.ten_tinh,
          'Cấp Hành Chính': item.cap_hanh_chinh || 'Chưa xác định',
          'Mã Xã/Phường': item.ma_xa_phuong,
          'Nghị Quyết': item.nghi_quyet || ''
        }));
        fileName = `Tim_kiem_xa_phuong_${searchTerm}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      } else {
        exportData = dataToExport.map((item, index) => ({
          'STT': index + 1,
          'Mã Xã/Phường': item.ma_xa_phuong,
          'Tên Xã/Phường': item.ten_xa_phuong,
          'Cấp Hành Chính': item.cap_hanh_chinh || 'Chưa xác định',
          'Nghị Quyết': item.nghi_quyet || ''
        }));
        fileName = `Danh_sach_xa_phuong_${selectedProvinceInfo?.ten_tinh?.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
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

  // Tính toán thống kê
  const getStats = (data) => {
    return {
      total: data.length,
      xa: data.filter(d => d.cap_hanh_chinh?.toLowerCase() === 'xã').length,
      phuong: data.filter(d => d.cap_hanh_chinh?.toLowerCase() === 'phường').length,
      dackhu: data.filter(d => d.cap_hanh_chinh?.toLowerCase() === 'đặc khu').length
    };
  };

  const currentData = activeTab === 'search' ? searchResults : filteredDistricts;
  const stats = getStats(currentData);

  return (
    <div className={cx('addressPage')}>
      {/* Header */}
      <div className={cx('pageHeader')}>
        <div className={cx('headerContent')}>
          <h1 className={cx('pageTitle')}>
            <div className={cx('titleIcon')}>🗺️</div>
            Hệ Thống Quản Lý Địa Giới Hành Chính
          </h1>
          <p className={cx('pageSubtitle')}>
            Tra cứu và quản lý thông tin địa giới hành chính cấp xã, phường, đặc khu toàn quốc
          </p>
        </div>
        
        <div className={cx('headerActions')}>
          <button 
            onClick={handleExport}
            className={cx('exportBtn')}
            disabled={!currentData.length}
          >
            📊 Xuất Excel
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={cx('tabNavigation')}>
        <button
          className={cx('tabButton', { active: activeTab === 'province' })}
          onClick={() => setActiveTab('province')}
        >
          📋 Theo Tỉnh/Thành Phố
        </button>
        <button
          className={cx('tabButton', { active: activeTab === 'search' })}
          onClick={() => setActiveTab('search')}
        >
          🔍 Tìm Kiếm Toàn Quốc
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className={cx('errorAlert')}>
          <div className={cx('alertIcon')}>⚠️</div>
          <div className={cx('alertContent')}>{error}</div>
          <button onClick={() => setError('')} className={cx('alertClose')}>×</button>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'province' ? (
        <>
          {/* Province Selection */}
          <div className={cx('controlSection')}>
            <div className={cx('sectionTitle')}>Chọn Tỉnh/Thành Phố</div>
            <div className={cx('controlContent')}>
              <select
                value={selectedProvince}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className={cx('provinceSelect')}
                disabled={loading}
              >
                <option value="">-- Chọn Tỉnh/Thành Phố --</option>
                {provinces.map(province => (
                  <option key={province.ma_tinh} value={province.ma_tinh}>
                    {province.ten_tinh}
                  </option>
                ))}
              </select>

              {selectedProvinceInfo && (
                <div className={cx('selectedInfo')}>
                  <span className={cx('infoLabel')}>Đã chọn:</span>
                  <span className={cx('infoValue')}>
                    <strong>{selectedProvinceInfo.ten_tinh}</strong> (Mã: {selectedProvinceInfo.ma_tinh})
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Search Section */}
          <div className={cx('controlSection')}>
            <div className={cx('sectionTitle')}>Tìm Kiếm Xã/Phường Toàn Quốc</div>
            <div className={cx('controlContent')}>
              <div className={cx('searchContainer')}>
                <div className={cx('searchIcon')}>🔍</div>
                <input
                  type="text"
                  placeholder="Nhập tên xã, phường, dặc khu để tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={cx('searchInput')}
                />
                {searchTerm && (
                  <button 
                    onClick={() => handleSearch('')}
                    className={cx('clearButton')}
                  >
                    ×
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
        </>
      )}

      {/* Results Section */}
      {currentData.length > 0 && (
        <div className={cx('resultsSection')}>
          {/* Statistics */}
          <div className={cx('statsBar')}>
            <div className={cx('statsGroup')}>
              <div className={cx('statItem')}>
                <span className={cx('statLabel')}>Tổng số:</span>
                <span className={cx('statValue')}>{stats.total}</span>
              </div>
              <div className={cx('statItem')}>
                <span className={cx('statLabel')}>Xã:</span>
                <span className={cx('statValue', 'green')}>{stats.xa}</span>
              </div>
              <div className={cx('statItem')}>
                <span className={cx('statLabel')}>Phường:</span>
                <span className={cx('statValue', 'blue')}>{stats.phuong}</span>
              </div>
              <div className={cx('statItem')}>
                <span className={cx('statLabel')}>Đặc khu:</span>
                <span className={cx('statValue', 'yellow')}>{stats.dackhu}</span>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className={cx('tableContainer')}>
            <Table
              data={currentData}
              columns={activeTab === 'search' ? searchResultColumns : provinceDistrictColumns}
              actions={[]}
              loading={loading}
              searchable={true}
              sortable={true}
              pagination={true}
              itemsPerPage={20}
              emptyMessage="Không có dữ liệu"
            />
          </div>
        </div>
      )}

      {/* Empty States */}
      {!loading && currentData.length === 0 && (
        <div className={cx('emptyState')}>
          {activeTab === 'province' ? (
            <>
              <div className={cx('emptyIcon')}>🏛️</div>
              <h3>Chọn Tỉnh/Thành Phố</h3>
              <p>Vui lòng chọn tỉnh thành phố để xem danh sách địa giới hành chính</p>
            </>
          ) : (
            <>
              <div className={cx('emptyIcon')}>🔍</div>
              <h3>{searchTerm ? 'Không tìm thấy kết quả' : 'Tìm Kiếm Địa Giới Hành Chính'}</h3>
              <p>
                {searchTerm 
                  ? `Không tìm thấy xã/phường nào với từ khóa "${searchTerm}"`
                  : 'Nhập tên xã, phường, đặc khu để tìm kiếm trong toàn quốc'
                }
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Address;