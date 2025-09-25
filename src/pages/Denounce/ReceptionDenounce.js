import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import directusService from '../../api/directus.js';
import Input from '../../components/Input/Input.js';
import Button from '../../components/Button/Button.js';
import Table from '../../components/Table/Table.js';
import styles from './Denounce.module.scss';

const cx = classNames.bind(styles);

const ReceptionDenounce = () => {
  // Data states - XỬ LÝ ĐƠN THƯ TỪ WEB CÔNG DÂN
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [classifyingDocuments, setClassifyingDocuments] = useState([]);
  const [assignedDocuments, setAssignedDocuments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Form states
  const [assignmentForm, setAssignmentForm] = useState({
    assigned_organization: '',
    priority_level: 'normal',
    processing_days: 30,
    officer_notes: '',
    notification_message: ''
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Load đơn thư chờ xử lý (status = 'moi')
  const loadPendingDocuments = async () => {
    setLoading(true);
    try {
      const result = await directusService.getCollection('don_thu', {
        fields: [
          'id', 'so_van_ban', 'tieu_de', 'ho_ten_nguoi_gui', 'so_dien_thoai',
          'dia_chi_chi_tiet', 'dia_chi_tinh_thanh', 'dia_chi_xa_phuong',
          'loai_don_thu', 'trich_dan', 'date_created', 'han_xu_ly', 'file_dinh_kem'
        ],
        filter: { status: { _eq: 'moi' } },
        sort: ['-date_created'],
        limit: 100
      });

      if (result.success) {
        setPendingDocuments(result.data);
      } else {
        setError('Không thể tải danh sách đơn thư chờ xử lý');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    }
    setLoading(false);
  };

  // Load đơn thư đang phân loại (status = 'dang_phan_loai')
  const loadClassifyingDocuments = async () => {
    try {
      const result = await directusService.getCollection('don_thu', {
        fields: [
          'id', 'so_van_ban', 'tieu_de', 'ho_ten_nguoi_gui', 'loai_don_thu',
          'date_created', 'date_updated', 'user_updated.first_name', 'user_updated.last_name'
        ],
        filter: { status: { _eq: 'dang_phan_loai' } },
        sort: ['-date_updated']
      });

      if (result.success) {
        setClassifyingDocuments(result.data);
      }
    } catch (err) {
      console.error('Lỗi tải đơn thư đang phân loại:', err);
    }
  };

  // Load đơn thư đã phân công (status = 'da_phan_cong')
  const loadAssignedDocuments = async () => {
    try {
      const result = await directusService.getCollection('don_thu', {
        fields: [
          'id', 'so_van_ban', 'tieu_de', 'ho_ten_nguoi_gui', 'loai_don_thu',
          'date_created', 'assigned_organization.ten_don_vi', 'assigned_priority',
          'processing_deadline', 'officer_notes'
        ],
        filter: { status: { _eq: 'da_phan_cong' } },
        sort: ['-date_updated']
      });

      if (result.success) {
        setAssignedDocuments(result.data);
      }
    } catch (err) {
      console.error('Lỗi tải đơn thư đã phân công:', err);
    }
  };

  // Load danh sách đơn vị
  const loadOrganizations = async () => {
    try {
      const result = await directusService.getCollection('don_vi_xu_ly', {
        fields: ['id', 'ma_don_vi', 'ten_don_vi', 'loai_xu_ly'],
        filter: { is_active: { _eq: true } },
        sort: ['ma_don_vi']
      });

      if (result.success) {
        setOrganizations(result.data);
      }
    } catch (err) {
      console.error('Lỗi tải đơn vị:', err);
    }
  };

  // Xem chi tiết đơn thư
  const viewDocument = async (document) => {
    setSelectedDocument(document);
    setShowDetailModal(true);

    // Chuyển trạng thái sang "đang phân loại" nếu là đơn thư mới
    if (document.status === 'moi') {
      try {
        await directusService.updateItem('don_thu', document.id, {
          status: 'dang_phan_loai'
        });
        // Refresh data
        loadPendingDocuments();
        loadClassifyingDocuments();
      } catch (err) {
        console.error('Lỗi cập nhật trạng thái:', err);
      }
    }
  };

  // Mở modal phân công
  const openAssignModal = (document) => {
    setSelectedDocument(document);
    setAssignmentForm({
      assigned_organization: '',
      priority_level: 'normal',
      processing_days: 30,
      officer_notes: '',
      notification_message: `Kính chào Anh/Chị,\n\nĐơn thư số ${document.so_van_ban} của Anh/Chị đã được tiếp nhận và sẽ được xử lý trong thời gian sớm nhất.\n\nXin cảm ơn!`
    });
    setShowAssignModal(true);
  };

  // Submit phân công
  const handleAssignment = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Tính ngày deadline
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + parseInt(assignmentForm.processing_days));

      // Cập nhật đơn thư
      const updateResult = await directusService.updateItem('don_thu', selectedDocument.id, {
        status: 'da_phan_cong',
        assigned_organization: assignmentForm.assigned_organization,
        assigned_priority: assignmentForm.priority_level,
        processing_deadline: deadline.toISOString().split('T')[0],
        officer_notes: assignmentForm.officer_notes
      });

      if (updateResult.success) {
        // Tạo workflow
        await directusService.createItem('luong_xu_ly', {
          document_id: selectedDocument.id,
          don_vi_nhan: assignmentForm.assigned_organization,
          trang_thai: 'chua_nhan',
          ngay_phan_cong: new Date().toISOString(),
          han_xu_ly: deadline.toISOString().split('T')[0],
          ghi_chu: assignmentForm.officer_notes
        });

        // Gửi thông báo cho công dân
        if (assignmentForm.notification_message.trim() && selectedDocument.so_dien_thoai) {
          await directusService.createItem('thong_bao', {
            loai_thong_bao: 'sms',
            noi_dung: assignmentForm.notification_message,
            so_dien_thoai: selectedDocument.so_dien_thoai,
            trang_thai: 'cho_gui'
          });
        }

        setSuccess('Đã phân công đơn thư thành công!');
        setShowAssignModal(false);
        
        // Refresh data
        loadClassifyingDocuments();
        loadAssignedDocuments();
      }
    } catch (err) {
      setError('Lỗi phân công: ' + err.message);
    }
    
    setSubmitting(false);
  };

  // Load data khi component mount
  useEffect(() => {
    loadPendingDocuments();
    loadClassifyingDocuments();
    loadAssignedDocuments();
    loadOrganizations();
  }, []);

  // Clear messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Table columns
  const getColumns = () => [
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
      key: 'tieu_de',
      title: 'Tiêu đề',
      sortable: true,
      render: (value) => (
        <div className={cx('documentTitle')} title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'ho_ten_nguoi_gui',
      title: 'Người gửi',
      sortable: true
    },
    {
      key: 'loai_don_thu',
      title: 'Loại',
      type: 'badge',
      getBadgeColor: (value) => {
        switch (value) {
          case 'khieu_nai': return 'blue';
          case 'to_cao': return 'red';
          case 'kien_nghi': return 'green';
          case 'phan_anh': return 'yellow';
          default: return 'gray';
        }
      },
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
      title: 'Ngày gửi',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('vi-VN')
    }
  ];

  return (
    <div className={cx('denouncePage')}>
      {/* Header */}
      <div className={cx('pageHeader')}>
        <div className={cx('headerContent')}>
          <h1 className={cx('pageTitle')}>
            <i className={cx('titleIcon', 'fas', 'fa-inbox')}></i>
            Tiếp nhận & Phân loại
          </h1>
          <p className={cx('pageSubtitle')}>
            Xử lý đơn thư từ web công dân - Phân loại, xác thực và phân công đơn vị xử lý
          </p>
        </div>
        
        <div className={cx('headerActions')}>
          <Button 
            onClick={() => {
              loadPendingDocuments();
              loadClassifyingDocuments();
              loadAssignedDocuments();
            }}
            variant="secondary"
            icon="fas fa-sync-alt"
            size="small"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className={cx('tabNavigation')}>
        <button
          className={cx('tabButton', { active: activeTab === 'pending' })}
          onClick={() => setActiveTab('pending')}
        >
          <i className="fas fa-clock"></i>
          Chờ xử lý ({pendingDocuments.length})
        </button>
        <button
          className={cx('tabButton', { active: activeTab === 'classifying' })}
          onClick={() => setActiveTab('classifying')}
        >
          <i className="fas fa-search"></i>
          Đang phân loại ({classifyingDocuments.length})
        </button>
        <button
          className={cx('tabButton', { active: activeTab === 'assigned' })}
          onClick={() => setActiveTab('assigned')}
        >
          <i className="fas fa-check"></i>
          Đã phân công ({assignedDocuments.length})
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className={cx('errorAlert')}>
          <div className={cx('alertIcon')}>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className={cx('alertContent')}>{error}</div>
          <button onClick={() => setError('')} className={cx('alertClose')}>×</button>
        </div>
      )}

      {success && (
        <div className={cx('successAlert')}>
          <div className={cx('alertIcon')}>
            <i className="fas fa-check-circle"></i>
          </div>
          <div className={cx('alertContent')}>{success}</div>
          <button onClick={() => setSuccess('')} className={cx('alertClose')}>×</button>
        </div>
      )}

      {/* Content */}
      {activeTab === 'pending' && (
        <div className={cx('card')}>
          <div className={cx('cardHeader')}>
            <h3 className={cx('cardTitle')}>
              <i className="fas fa-inbox"></i>
              Đơn thư chờ xử lý từ web công dân
            </h3>
          </div>
          
          <div className={cx('tableContainer')}>
            <Table
              data={pendingDocuments}
              columns={getColumns()}
              loading={loading}
              searchable={true}
              sortable={true}
              pagination={true}
              itemsPerPage={20}
              emptyMessage="Không có đơn thư chờ xử lý"
              actions={[
                {
                  icon: 'fas fa-eye',
                  title: 'Xem chi tiết',
                  onClick: (item) => viewDocument(item)
                },
                {
                  icon: 'fas fa-share',
                  title: 'Phân công xử lý',
                  onClick: (item) => openAssignModal(item)
                }
              ]}
            />
          </div>
        </div>
      )}

      {activeTab === 'classifying' && (
        <div className={cx('card')}>
          <div className={cx('cardHeader')}>
            <h3 className={cx('cardTitle')}>
              <i className="fas fa-search"></i>
              Đơn thư đang được phân loại
            </h3>
          </div>
          
          <div className={cx('tableContainer')}>
            <Table
              data={classifyingDocuments}
              columns={[
                ...getColumns(),
                {
                  key: 'user_updated',
                  title: 'Cán bộ xử lý',
                  render: (value, item) => 
                    item.user_updated ? 
                    `${item.user_updated.first_name} ${item.user_updated.last_name}` : 
                    'Hệ thống'
                }
              ]}
              loading={loading}
              searchable={true}
              sortable={true}
              pagination={true}
              itemsPerPage={20}
              emptyMessage="Không có đơn thư đang phân loại"
              actions={[
                {
                  icon: 'fas fa-eye',
                  title: 'Xem chi tiết',
                  onClick: (item) => viewDocument(item)
                },
                {
                  icon: 'fas fa-share',
                  title: 'Phân công xử lý',
                  onClick: (item) => openAssignModal(item)
                }
              ]}
            />
          </div>
        </div>
      )}

      {activeTab === 'assigned' && (
        <div className={cx('card')}>
          <div className={cx('cardHeader')}>
            <h3 className={cx('cardTitle')}>
              <i className="fas fa-check"></i>
              Đơn thư đã phân công xử lý
            </h3>
          </div>
          
          <div className={cx('tableContainer')}>
            <Table
              data={assignedDocuments}
              columns={[
                ...getColumns(),
                {
                  key: 'assigned_organization',
                  title: 'Đơn vị được giao',
                  render: (value, item) => item.assigned_organization?.ten_don_vi || '-'
                },
                {
                  key: 'processing_deadline',
                  title: 'Hạn xử lý',
                  render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '-'
                }
              ]}
              loading={loading}
              searchable={true}
              sortable={true}
              pagination={true}
              itemsPerPage={20}
              emptyMessage="Chưa có đơn thư được phân công"
              actions={[
                {
                  icon: 'fas fa-eye',
                  title: 'Xem chi tiết',
                  onClick: (item) => viewDocument(item)
                }
              ]}
            />
          </div>
        </div>
      )}

      {/* Modal phân công */}
      {showAssignModal && selectedDocument && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Phân công xử lý đơn thư: {selectedDocument.so_van_ban}</h3>
              <button onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <Input.Select
                label="Đơn vị xử lý"
                value={assignmentForm.assigned_organization}
                onChange={(e) => setAssignmentForm(prev => ({...prev, assigned_organization: e.target.value}))}
                options={organizations.map(org => ({
                  value: org.id,
                  label: `${org.ma_don_vi} - ${org.ten_don_vi}`
                }))}
                required
                fullWidth
              />

              <Input.Select
                label="Mức độ ưu tiên"
                value={assignmentForm.priority_level}
                onChange={(e) => {
                  const level = e.target.value;
                  const days = level === 'khan_cap' ? 15 : level === 'normal' ? 30 : 60;
                  setAssignmentForm(prev => ({...prev, priority_level: level, processing_days: days}));
                }}
                options={[
                  { value: 'khan_cap', label: 'Khẩn cấp (15 ngày)' },
                  { value: 'normal', label: 'Bình thường (30 ngày)' },
                  { value: 'khong_khan', label: 'Không khẩn (60 ngày)' }
                ]}
                required
                fullWidth
              />

              <Input.Textarea
                label="Ghi chú cán bộ"
                value={assignmentForm.officer_notes}
                onChange={(e) => setAssignmentForm(prev => ({...prev, officer_notes: e.target.value}))}
                rows={3}
                fullWidth
              />

              <Input.Textarea
                label="Tin nhắn thông báo cho công dân"
                value={assignmentForm.notification_message}
                onChange={(e) => setAssignmentForm(prev => ({...prev, notification_message: e.target.value}))}
                rows={4}
                fullWidth
              />
            </div>
            
            <div className="modal-footer">
              <Button 
                onClick={handleAssignment} 
                variant="primary" 
                loading={submitting}
              >
                Phân công xử lý
              </Button>
              <Button onClick={() => setShowAssignModal(false)}>
                Hủy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionDenounce;