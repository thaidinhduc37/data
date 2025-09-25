import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import directusService from '../../api/directus.js';
import Input from '../../components/Input/Input.js';
import Button from '../../components/Button/Button.js';
import Table from '../../components/Table/Table.js';
import styles from './Denounce.module.scss';

const cx = classNames.bind(styles);

const ProcessingDenounce = () => {
  // Data states
  const [assignedItems, setAssignedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  
  // Processing states
  const [processingData, setProcessingData] = useState({
    action_type: 'process', // 'process', 'transfer', 'reply', 'complete'
    response_content: '',
    attachments: [],
    notes: '',
    transfer_to: '',
    deadline_extension: '',
    result_summary: ''
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace', 'assigned'
  const [showModal, setShowModal] = useState(false);
  const [currentAction, setCurrentAction] = useState('process');

  // Action types
  const actionTypes = [
    { value: 'process', label: 'Xử lý', icon: 'fas fa-cogs' },
    { value: 'reply', label: 'Trả lời', icon: 'fas fa-reply' },
    { value: 'transfer', label: 'Chuyển tiếp', icon: 'fas fa-share' },
    { value: 'complete', label: 'Hoàn thành', icon: 'fas fa-check-circle' }
  ];

  // Load assigned workflow items for current user
  const loadAssignedItems = async () => {
    setLoading(true);
    try {
      const isAuth = await directusService.ensureAuthenticated();
      if (!isAuth) {
        setError('Cần đăng nhập để truy cập dữ liệu');
        setLoading(false);
        return;
      }

      // Get current user's organization workflows
      const result = await directusService.getCollection('luong_xu_ly', {
        fields: [
          'id', 'trang_thai', 'ngay_nhan', 'han_xu_ly', 'ghi_chu',
          'document_id.id', 'document_id.so_van_ban', 'document_id.tieu_de', 
          'document_id.trich_dan', 'document_id.ho_ten_nguoi_gui', 
          'document_id.loai_don_thu', 'document_id.file_dinh_kem',
          'document_id.so_dien_thoai', 'document_id.dia_chi_chi_tiet',
          'don_vi_gui.ten_don_vi', 'don_vi_nhan.ten_don_vi'
        ],
        filter: { 
          trang_thai: { _in: ['Chưa nhận', 'Đang xử lý'] }
        },
        sort: ['-ngay_nhan'],
        limit: 50
      });

      if (result.success) {
        setAssignedItems(result.data);
      }
    } catch (err) {
      setError('Lỗi tải danh sách công việc: ' + err.message);
    }
    setLoading(false);
  };

  // Load organizations for transfer
  const loadOrganizations = async () => {
    try {
      const result = await directusService.getCollection('don_vi_xu_ly', {
        fields: ['id', 'ma_don_vi', 'loai_xu_ly'],
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

  // Start processing an item
  const startProcessing = (item, action = 'process') => {
    setSelectedItem(item);
    setCurrentAction(action);
    setProcessingData({
      action_type: action,
      response_content: '',
      attachments: [],
      notes: item.ghi_chu || '',
      transfer_to: '',
      deadline_extension: '',
      result_summary: ''
    });
    setActiveTab('workspace');
    setShowModal(false);
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setProcessingData(prev => ({ ...prev, [field]: value }));
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setProcessingData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setProcessingData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Submit processing action
  const submitProcessing = async (e) => {
    e.preventDefault();
    
    if (!selectedItem) return;

    setSubmitting(true);
    setError('');

    try {
      // Prepare update data based on action type
      let updateData = {
        ghi_chu: processingData.notes
      };

      switch (processingData.action_type) {
        case 'process':
          updateData.trang_thai = 'Đang xử lý';
          break;
        
        case 'reply':
          updateData.ket_qua_xu_ly = processingData.response_content;
          updateData.trang_thai = 'Đang xử lý';
          break;
        
        case 'transfer':
          if (!processingData.transfer_to) {
            setError('Vui lòng chọn đơn vị chuyển tiếp');
            setSubmitting(false);
            return;
          }
          // Create new workflow step for transfer
          await directusService.createItem('luong_xu_ly', {
            document_id: selectedItem.document_id.id,
            don_vi_gui: selectedItem.don_vi_nhan?.id,
            don_vi_nhan: processingData.transfer_to,
            trang_thai: 'Chưa nhận',
            ngay_nhan: new Date().toISOString(),
            ghi_chu: `Chuyển tiếp: ${processingData.notes}`
          });
          updateData.trang_thai = 'Chuyển tiếp';
          break;
        
        case 'complete':
          updateData.trang_thai = 'Hoàn thành';
          updateData.ket_qua_xu_ly = processingData.result_summary;
          updateData.ngay_hoan_thanh = new Date().toISOString();
          break;
      }

      // Update current workflow
      const result = await directusService.updateItem('luong_xu_ly', selectedItem.id, updateData);

      if (result.success) {
        setSuccess(`${actionTypes.find(a => a.value === processingData.action_type)?.label} thành công!`);
        setSelectedItem(null);
        setActiveTab('assigned');
        loadAssignedItems();
      } else {
        setError('Lỗi cập nhật: ' + result.error);
      }
    } catch (err) {
      setError('Lỗi hệ thống: ' + err.message);
    }

    setSubmitting(false);
  };

  // Accept assigned item
  const acceptItem = async (item) => {
    try {
      const result = await directusService.updateItem('luong_xu_ly', item.id, {
        trang_thai: 'Đang xử lý',
        ngay_nhan: new Date().toISOString()
      });

      if (result.success) {
        setSuccess('Đã nhận xử lý đơn thư');
        loadAssignedItems();
      }
    } catch (err) {
      setError('Lỗi nhận việc: ' + err.message);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Load initial data
  useEffect(() => {
    loadAssignedItems();
    loadOrganizations();
  }, []);

  // Clear success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Table columns for assigned items
  const assignedColumns = [
    {
      key: 'stt',
      title: 'STT',
      render: (value, item, index) => index + 1,
      sortable: false
    },
    {
      key: 'document_id.so_van_ban',
      title: 'Số văn bản',
      sortable: true,
      render: (value, item) => item.document_id?.so_van_ban || '-'
    },
    {
      key: 'document_id.tieu_de',
      title: 'Tiêu đề',
      sortable: true,
      render: (value, item) => (
        <div className={cx('documentTitle')} title={item.document_id?.tieu_de}>
          {item.document_id?.tieu_de || '-'}
        </div>
      )
    },
    {
      key: 'document_id.loai_don_thu',
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
      render: (value, item) => {
        const typeMap = {
          'khieu_nai': 'Khiếu nại',
          'to_cao': 'Tố cáo', 
          'kien_nghi': 'Kiến nghị',
          'phan_anh': 'Phản ánh'
        };
        return typeMap[item.document_id?.loai_don_thu] || item.document_id?.loai_don_thu || '-';
      }
    },
    {
      key: 'trang_thai',
      title: 'Trạng thái',
      type: 'badge',
      getBadgeColor: (value) => {
        switch (value) {
          case 'Chưa nhận': return 'gray';
          case 'Đang xử lý': return 'yellow';
          case 'Hoàn thành': return 'green';
          default: return 'gray';
        }
      }
    },
    {
      key: 'ngay_nhan',
      title: 'Ngày nhận',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '-'
    },
    {
      key: 'han_xu_ly',
      title: 'Hạn xử lý',
      sortable: true,
      render: (value) => {
        if (!value) return '-';
        const deadline = new Date(value);
        const now = new Date();
        const isOverdue = deadline < now;
        
        return (
          <span className={cx('deadline', { overdue: isOverdue })}>
            {deadline.toLocaleDateString('vi-VN')}
            {isOverdue && <i className="fas fa-exclamation-triangle"></i>}
          </span>
        );
      }
    }
  ];

  return (
    <div className={cx('processingPage')}>
      {/* Header */}
      <div className={cx('pageHeader')}>
        <div className={cx('headerContent')}>
          <h1 className={cx('pageTitle')}>
            <i className={cx('titleIcon', 'fas', 'fa-cogs')}></i>
            Xử Lý Đơn Thư
          </h1>
          <p className={cx('pageSubtitle')}>
            Workspace xử lý, trả lời và chuyển tiếp đơn thư được phân công
          </p>
        </div>
        
        <div className={cx('headerActions')}>
          <Button 
            onClick={() => loadAssignedItems()}
            variant="secondary"
            icon="fas fa-sync-alt"
            size="small"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={cx('tabNavigation')}>
        <button
          className={cx('tabButton', { active: activeTab === 'assigned' })}
          onClick={() => setActiveTab('assigned')}
        >
          <i className="fas fa-inbox"></i>
          Công việc được giao ({assignedItems.length})
        </button>
        <button
          className={cx('tabButton', { active: activeTab === 'workspace' })}
          onClick={() => setActiveTab('workspace')}
          disabled={!selectedItem}
        >
          <i className="fas fa-edit"></i>
          Workspace xử lý
          {selectedItem && ` - ${selectedItem.document_id?.so_van_ban}`}
        </button>
      </div>

      {/* Alert Messages */}
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

      {/* Tab Content */}
      {activeTab === 'assigned' ? (
        /* Assigned Items Tab */
        <div className={cx('assignedSection')}>
          <div className={cx('sectionHeader')}>
            <h3 className={cx('sectionTitle')}>
              Danh sách công việc được phân công
            </h3>
          </div>

          <div className={cx('tableContainer')}>
            <Table
              data={assignedItems}
              columns={assignedColumns}
              loading={loading}
              searchable={true}
              sortable={true}
              pagination={true}
              itemsPerPage={20}
              emptyMessage="Không có công việc nào được phân công"
              actions={[
                {
                  icon: 'fas fa-check',
                  title: 'Nhận xử lý',
                  onClick: (item) => acceptItem(item),
                  condition: (item) => item.trang_thai === 'Chưa nhận'
                },
                {
                  icon: 'fas fa-edit',
                  title: 'Xử lý',
                  onClick: (item) => startProcessing(item, 'process'),
                  condition: (item) => item.trang_thai !== 'Hoàn thành'
                },
                {
                  icon: 'fas fa-eye',
                  title: 'Xem chi tiết',
                  onClick: (item) => startProcessing(item, 'view')
                }
              ]}
            />
          </div>
        </div>
      ) : (
        /* Workspace Tab */
        selectedItem && (
          <div className={cx('workspaceSection')}>
            {/* Document Info Panel */}
            <div className={cx('documentPanel')}>
              <div className={cx('panelHeader')}>
                <h3 className={cx('panelTitle')}>
                  <i className="fas fa-file-alt"></i>
                  Thông tin đơn thư: {selectedItem.document_id?.so_van_ban}
                </h3>
                <div className={cx('documentStatus', selectedItem.trang_thai?.toLowerCase().replace(' ', '_'))}>
                  {selectedItem.trang_thai}
                </div>
              </div>

              <div className={cx('documentInfo')}>
                <div className={cx('infoGrid')}>
                  <div className={cx('infoItem')}>
                    <label>Tiêu đề:</label>
                    <span>{selectedItem.document_id?.tieu_de}</span>
                  </div>
                  
                  <div className={cx('infoItem')}>
                    <label>Người gửi:</label>
                    <span>{selectedItem.document_id?.ho_ten_nguoi_gui}</span>
                  </div>
                  
                  <div className={cx('infoItem')}>
                    <label>Loại đơn thư:</label>
                    <span>{selectedItem.document_id?.loai_don_thu}</span>
                  </div>
                  
                  <div className={cx('infoItem')}>
                    <label>Số điện thoại:</label>
                    <span>{selectedItem.document_id?.so_dien_thoai || '-'}</span>
                  </div>
                  
                  <div className={cx('infoItem')}>
                    <label>Địa chỉ:</label>
                    <span>{selectedItem.document_id?.dia_chi_chi_tiet || '-'}</span>
                  </div>
                  
                  <div className={cx('infoItem')}>
                    <label>Hạn xử lý:</label>
                    <span>{selectedItem.han_xu_ly ? new Date(selectedItem.han_xu_ly).toLocaleDateString('vi-VN') : '-'}</span>
                  </div>
                </div>

                {selectedItem.document_id?.trich_dan && (
                  <div className={cx('documentContent')}>
                    <label>Nội dung trích dẫn:</label>
                    <div className={cx('contentText')}>
                      {selectedItem.document_id.trich_dan}
                    </div>
                  </div>
                )}

                {selectedItem.document_id?.file_dinh_kem && (
                  <div className={cx('attachmentSection')}>
                    <label>File đính kèm:</label>
                    <div className={cx('attachmentList')}>
                      <div className={cx('attachmentItem')}>
                        <i className="fas fa-file"></i>
                        <span>File đính kèm từ người gửi</span>
                        <Button variant="ghost" size="small" icon="fas fa-download">
                          Tải xuống
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Processing Actions Panel */}
            <div className={cx('actionsPanel')}>
              <div className={cx('panelHeader')}>
                <h3 className={cx('panelTitle')}>
                  <i className="fas fa-tools"></i>
                  Thao tác xử lý
                </h3>
              </div>

              <div className={cx('actionButtons')}>
                {actionTypes.map(action => (
                  <button
                    key={action.value}
                    className={cx('actionButton', { active: currentAction === action.value })}
                    onClick={() => {
                      setCurrentAction(action.value);
                      setProcessingData(prev => ({ ...prev, action_type: action.value }));
                    }}
                  >
                    <i className={action.icon}></i>
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Processing Form */}
              <form onSubmit={submitProcessing} className={cx('processingForm')}>
                {/* Common Notes Field */}
                <Input.Textarea
                  label="Ghi chú xử lý"
                  value={processingData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  fullWidth
                />

                {/* Action-specific fields */}
                {currentAction === 'reply' && (
                  <Input.Textarea
                    label="Nội dung trả lời"
                    value={processingData.response_content}
                    onChange={(e) => handleInputChange('response_content', e.target.value)}
                    rows={5}
                    placeholder="Nhập nội dung trả lời cho người gửi đơn thư..."
                    required
                    fullWidth
                  />
                )}

                {currentAction === 'transfer' && (
                  <Input.Select
                    label="Chuyển tiếp tới đơn vị"
                    value={processingData.transfer_to}
                    onChange={(e) => handleInputChange('transfer_to', e.target.value)}
                    options={organizations.map(org => ({ 
                      value: org.id, 
                      label: `${org.ma_don_vi} - ${org.loai_xu_ly}` 
                    }))}
                    required
                    fullWidth
                  />
                )}

                {currentAction === 'complete' && (
                  <Input.Textarea
                    label="Tóm tắt kết quả xử lý"
                    value={processingData.result_summary}
                    onChange={(e) => handleInputChange('result_summary', e.target.value)}
                    rows={4}
                    placeholder="Nhập tóm tắt kết quả xử lý đơn thư..."
                    required
                    fullWidth
                  />
                )}

                {/* File Attachments */}
                <div className={cx('fileSection')}>
                  <label>File đính kèm phản hồi:</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className={cx('fileInput')}
                  />
                  
                  {processingData.attachments.length > 0 && (
                    <div className={cx('attachmentList')}>
                      {processingData.attachments.map((file, index) => (
                        <div key={index} className={cx('attachmentItem')}>
                          <i className="fas fa-file"></i>
                          <span>{file.name} ({formatFileSize(file.size)})</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className={cx('removeAttachment')}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Actions */}
                <div className={cx('formActions')}>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    disabled={submitting}
                    icon={actionTypes.find(a => a.value === currentAction)?.icon}
                  >
                    {submitting ? 'Đang xử lý...' : actionTypes.find(a => a.value === currentAction)?.label}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setActiveTab('assigned')}
                  >
                    Quay lại danh sách
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default ProcessingDenounce;