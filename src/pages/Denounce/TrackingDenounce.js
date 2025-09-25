import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import directusService from '../../api/directus.js';
import Button from '../../components/Button/Button.js';
import Table from '../../components/Table/Table.js';
import styles from './Denounce.module.scss';

const cx = classNames.bind(styles);

const TrackingDenounce = () => {
  const [searchData, setSearchData] = useState({
    nameSearch: '',
    phoneSearch: '',
    documentSearch: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  });

  const [searchResults, setSearchResults] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTimelineModal, setShowTimelineModal] = useState(false);

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'moi', label: 'Mới tiếp nhận' },
    { value: 'dang_xu_ly', label: 'Đang xử lý' },
    { value: 'hoan_thanh', label: 'Hoàn thành' },
    { value: 'qua_han', label: 'Quá hạn' }
  ];

  const handleSearch = async () => {
    const { nameSearch, phoneSearch, documentSearch } = searchData;
    
    if (!nameSearch.trim() && !phoneSearch.trim() && !documentSearch.trim()) {
      setError('Vui lòng nhập ít nhất một từ khóa tìm kiếm');
      return;
    }

    setLoading(true);
    setError('');
    setSearchResults([]);

    try {
      let filter = {};
      
      // Build search conditions
      const searchConditions = [];
      
      if (nameSearch.trim()) {
        searchConditions.push({ ho_ten_nguoi_gui: { _icontains: nameSearch.trim() } });
      }
      
      if (phoneSearch.trim()) {
        searchConditions.push({ so_dien_thoai: { _icontains: phoneSearch.trim() } });
      }
      
      if (documentSearch.trim()) {
        searchConditions.push({ so_van_ban: { _icontains: documentSearch.trim() } });
      }

      // Use OR condition for multiple search terms
      if (searchConditions.length > 1) {
        filter._or = searchConditions;
      } else {
        filter = searchConditions[0];
      }

      // Add date filters
      if (searchData.dateFrom) {
        filter.date_created = { _gte: searchData.dateFrom };
      }
      if (searchData.dateTo) {
        if (filter.date_created) {
          filter.date_created._lte = searchData.dateTo + 'T23:59:59';
        } else {
          filter.date_created = { _lte: searchData.dateTo + 'T23:59:59' };
        }
      }
      if (searchData.status) {
        filter.status = { _eq: searchData.status };
      }

      const result = await directusService.getCollection('don_thu', {
        fields: [
          'id', 'so_van_ban', 'tieu_de', 'ho_ten_nguoi_gui', 'so_dien_thoai',
          'dia_chi_chi_tiet', 'dia_chi_xa_phuong', 'dia_chi_tinh_thanh',
          'loai_don_thu', 'date_created', 'status', 'han_xu_ly',
          'assigned_organization.ten_don_vi'
        ],
        filter,
        sort: ['-date_created'],
        limit: 50
      });

      if (result.success && result.data.length > 0) {
        setSearchResults(result.data);
      } else {
        setError('Không tìm thấy kết quả phù hợp');
      }
    } catch (err) {
      setError('Lỗi tìm kiếm: ' + err.message);
    }
    
    setLoading(false);
  };

  const loadTimeline = async (document) => {
    setSelectedDocument(document);
    setLoading(true);
    
    try {
      const result = await directusService.getCollection('luong_xu_ly', {
        fields: [
          'id', 'trang_thai', 'ngay_phan_cong', 'ngay_nhan', 'ngay_hoan_thanh',
          'ghi_chu', 'ket_qua_xu_ly', 'don_vi_nhan.ten_don_vi', 'date_created'
        ],
        filter: { document_id: { _eq: document.id } },
        sort: ['date_created']
      });

      if (result.success) {
        const timeline = [
          {
            id: 'initial',
            trang_thai: 'Tiếp nhận từ web công dân',
            date_created: document.date_created,
            ghi_chu: 'Công dân gửi đơn thư qua website',
            icon: 'fas fa-upload',
            color: 'blue'
          },
          ...result.data.map(item => ({
            ...item,
            icon: getTimelineIcon(item.trang_thai),
            color: getTimelineColor(item.trang_thai)
          }))
        ];
        
        setTimelineData(timeline);
      }
    } catch (err) {
      setError('Lỗi tải timeline: ' + err.message);
    }
    
    setLoading(false);
    setShowTimelineModal(true);
  };

  const getTimelineIcon = (status) => {
    switch (status) {
      case 'chua_nhan': return 'fas fa-clock';
      case 'dang_xu_ly': return 'fas fa-cogs';
      case 'da_tra_loi': return 'fas fa-reply';
      case 'hoan_thanh': return 'fas fa-check-circle';
      default: return 'fas fa-circle';
    }
  };

  const getTimelineColor = (status) => {
    switch (status) {
      case 'hoan_thanh': return 'green';
      case 'dang_xu_ly': return 'yellow';
      case 'da_tra_loi': return 'blue';
      default: return 'gray';
    }
  };

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  const clearSearch = () => {
    setSearchData({
      nameSearch: '',
      phoneSearch: '',
      documentSearch: '',
      dateFrom: '',
      dateTo: '',
      status: ''
    });
    setSearchResults([]);
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Table columns
  const searchColumns = [
    {
      key: 'stt',
      title: 'STT',
      render: (value, item, index) => index + 1,
      sortable: false
    },
    {
      key: 'so_van_ban',
      title: 'Số văn bản',
      sortable: true
    },
    {
      key: 'ho_ten_nguoi_gui',
      title: 'Họ tên',
      sortable: true
    },
    {
      key: 'so_dien_thoai',
      title: 'Điện thoại',
      sortable: false
    },
    {
      key: 'dia_chi',
      title: 'Địa chỉ',
      render: (value, item) => {
        const parts = [
          item.dia_chi_chi_tiet,
          item.dia_chi_xa_phuong, 
          item.dia_chi_tinh_thanh
        ].filter(Boolean);
        return parts.join(', ') || '-';
      }
    },
    {
      key: 'loai_don_thu',
      title: 'Loại đơn thư',
      render: (value) => {
        const typeMap = {
          'khieu_nai': 'Khiếu nại',
          'to_cao': 'Tố cáo',
          'kien_nghi': 'Kiến nghị',
          'phan_anh': 'Phản ánh'
        };
        return typeMap[value] || value;
      }
    },
    {
      key: 'date_created',
      title: 'Ngày nộp',
      render: (value) => new Date(value).toLocaleDateString('vi-VN')
    },
    {
      key: 'status',
      title: 'Tình trạng',
      render: (value) => (
        <span className={cx('badge', value?.toLowerCase())}>
          {(() => {
            const statusMap = {
              'moi': 'Mới tiếp nhận',
              'dang_phan_loai': 'Đang phân loại',
              'da_phan_cong': 'Đã phân công',
              'dang_xu_ly': 'Đang xử lý',
              'da_tra_loi': 'Đã trả lời',
              'hoan_thanh': 'Hoàn thành',
              'qua_han': 'Quá hạn'
            };
            return statusMap[value] || 'Chờ xử lý';
          })()}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (value, item) => (
        <button
          className={cx('actionButton')}
          onClick={() => loadTimeline(item)}
          title="Xem timeline"
        >
          <i className="fas fa-history"></i>
          Xem timeline
        </button>
      ),
      sortable: false
    }
  ];

  return (
    <div className={cx('trackingPage')}>
      {/* Header */}
      <div className={cx('pageHeader')}>
        <div className={cx('headerContent')}>
          <h1 className={cx('pageTitle')}>
            <i className="fas fa-search"></i>
            Theo dõi & Tra cứu
          </h1>
          <p className={cx('pageSubtitle')}>
            Tra cứu tiến độ xử lý và timeline chi tiết của đơn thư
          </p>
        </div>
        
        <div className={cx('headerActions')}>
          <button onClick={clearSearch} className={cx('btn', 'secondary')}>
            <i className="fas fa-eraser"></i>
            Xóa tìm kiếm
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className={cx('searchSection')}>
        <div className={cx('searchTitle')}>
          <i className="fas fa-filter"></i>
          Tìm kiếm đơn thư
        </div>
        
        {/* Main Search Inputs */}
        <div className={cx('searchInputs')}>
          <div className={cx('searchGroup')}>
            <div className={cx('inputGroup')}>
              <label>Tìm theo họ tên</label>
              <input
                type="text"
                className={cx('searchInput')}
                value={searchData.nameSearch}
                onChange={(e) => handleInputChange('nameSearch', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập họ tên người gửi..."
              />
            </div>
          </div>

          <div className={cx('searchGroup')}>
            <div className={cx('inputGroup')}>
              <label>Tìm theo số điện thoại</label>
              <input
                type="text"
                className={cx('searchInput')}
                value={searchData.phoneSearch}
                onChange={(e) => handleInputChange('phoneSearch', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập số điện thoại..."
              />
            </div>
          </div>

          <div className={cx('searchGroup')}>
            <div className={cx('inputGroup')}>
              <label>Tìm theo số văn bản</label>
              <input
                type="text"
                className={cx('searchInput')}
                value={searchData.documentSearch}
                onChange={(e) => handleInputChange('documentSearch', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập số văn bản..."
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={cx('searchFilters')}>
          <div className={cx('filterGroup')}>
            <label>Từ ngày</label>
            <input
              type="date"
              className={cx('dateInput')}
              value={searchData.dateFrom}
              onChange={(e) => handleInputChange('dateFrom', e.target.value)}
            />
          </div>
          
          <div className={cx('filterGroup')}>
            <label>Đến ngày</label>
            <input
              type="date"
              className={cx('dateInput')}
              value={searchData.dateTo}
              onChange={(e) => handleInputChange('dateTo', e.target.value)}
            />
          </div>
          
          <div className={cx('filterGroup')}>
            <label>Trạng thái</label>
            <select 
              className={cx('statusSelect')}
              value={searchData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className={cx('searchActions')}>
            <button
              onClick={handleSearch}
              className={cx('btn', 'primary')}
              disabled={loading}
            >
              <i className="fas fa-search"></i>
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
            
            <button onClick={clearSearch} className={cx('btn', 'secondary')}>
              <i className="fas fa-times"></i>
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className={cx('alert', 'error')}>
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className={cx('resultsSection')}>
          <div className={cx('resultsHeader')}>
            <h3>
              <i className="fas fa-list"></i>
              Kết quả tìm kiếm ({searchResults.length} đơn thư)
            </h3>
          </div>
          
          <div className={cx('tableContainer')}>
            <Table
              data={searchResults}
              columns={searchColumns}
              loading={loading}
              searchable={false}
              sortable={true}
              pagination={true}
              itemsPerPage={15}
              emptyMessage="Không tìm thấy kết quả"
            />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && searchResults.length === 0 && !error && (
        <div className={cx('emptyState')}>
          <i className="fas fa-search"></i>
          <h3>Tra cứu tiến độ xử lý đơn thư</h3>
          <p>Nhập thông tin tìm kiếm để xem tình hình xử lý đơn thư của bạn</p>
        </div>
      )}

      {/* Timeline Modal */}
      {showTimelineModal && selectedDocument && (
        <div className="modal-overlay" onClick={() => setShowTimelineModal(false)}>
          <div className="modal-content timeline-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Timeline xử lý: {selectedDocument.so_van_ban}</h3>
              <button onClick={() => setShowTimelineModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className={cx('documentSummary')}>
                <h4>{selectedDocument.tieu_de}</h4>
                <div className={cx('summaryDetails')}>
                  <div className={cx('detailItem')}>
                    <strong>Người gửi:</strong> {selectedDocument.ho_ten_nguoi_gui}
                  </div>
                  <div className={cx('detailItem')}>
                    <strong>Ngày gửi:</strong> {new Date(selectedDocument.date_created).toLocaleDateString('vi-VN')}
                  </div>
                  <div className={cx('detailItem')}>
                    <strong>Loại:</strong> {selectedDocument.loai_don_thu}
                  </div>
                </div>
              </div>

              <div className="timeline">
                {timelineData.map((step, index) => (
                  <div key={step.id} className={`timeline-item ${step.color}`}>
                    <div className="timeline-marker">
                      <i className={step.icon}></i>
                    </div>
                    
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h5>{step.trang_thai}</h5>
                        <span className="timeline-date">
                          {new Date(step.date_created).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      
                      {step.don_vi_nhan && (
                        <p><strong>Đơn vị xử lý:</strong> {step.don_vi_nhan.ten_don_vi}</p>
                      )}
                      
                      {step.ghi_chu && (
                        <p><strong>Ghi chú:</strong> {step.ghi_chu}</p>
                      )}
                      
                      {step.ket_qua_xu_ly && (
                        <div className="result-content">
                          <strong>Kết quả:</strong>
                          <p>{step.ket_qua_xu_ly}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingDenounce;