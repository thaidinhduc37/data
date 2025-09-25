import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import directusService from '../../api/directus.js';
import Input from '../../components/Input/Input.js';
import Button from '../../components/Button/Button.js';
import Table from '../../components/Table/Table.js';
import styles from './Denounce.module.scss';
import * as XLSX from 'xlsx';

const cx = classNames.bind(styles);

const ReportsDenounce = () => {
  const [filterData, setFilterData] = useState({
    reportType: 'tong_hop',
    dateFrom: '',
    dateTo: '',
    organization: '',
    documentType: '',
    status: ''
  });

  const [reportData, setReportData] = useState([]);
  const [kpiData, setKpiData] = useState({
    totalDocuments: 0,
    completedDocuments: 0,
    processingDocuments: 0,
    overdueDocuments: 0,
    averageProcessingDays: 0
  });

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const reportTypes = [
    { value: 'tong_hop', label: 'Báo cáo tổng hợp' },
    { value: 'chi_tiet', label: 'Báo cáo chi tiết' },
    { value: 'don_vi', label: 'Theo đơn vị' },
    { value: 'hieu_suat', label: 'Hiệu suất xử lý' },
    { value: 'qua_han', label: 'Đơn thư quá hạn' }
  ];

  const documentTypeOptions = [
    { value: '', label: 'Tất cả loại' },
    { value: 'khieu_nai', label: 'Khiếu nại' },
    { value: 'to_cao', label: 'Tố cáo' },
    { value: 'kien_nghi', label: 'Kiến nghị' },
    { value: 'phan_anh', label: 'Phản ánh' }
  ];

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'moi', label: 'Mới tiếp nhận' },
    { value: 'dang_xu_ly', label: 'Đang xử lý' },
    { value: 'da_tra_loi', label: 'Đã trả lời' },
    { value: 'hoan_thanh', label: 'Hoàn thành' },
    { value: 'qua_han', label: 'Quá hạn' }
  ];

  // Load organizations
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

  // Generate report
  const generateReport = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Build filters
      let dateFilter = {};
      if (filterData.dateFrom) {
        dateFilter.date_created = { _gte: filterData.dateFrom };
      }
      if (filterData.dateTo) {
        if (dateFilter.date_created) {
          dateFilter.date_created._lte = filterData.dateTo + 'T23:59:59';
        } else {
          dateFilter.date_created = { _lte: filterData.dateTo + 'T23:59:59' };
        }
      }

      if (filterData.documentType) {
        dateFilter.loai_don_thu = { _eq: filterData.documentType };
      }

      if (filterData.status) {
        dateFilter.status = { _eq: filterData.status };
      }

      // Load documents
      const documentsResult = await directusService.getCollection('don_thu', {
        fields: [
          'id', 'so_van_ban', 'tieu_de', 'ho_ten_nguoi_gui', 'loai_don_thu',
          'date_created', 'han_xu_ly', 'status', 'assigned_organization.ten_don_vi',
          'assigned_priority', 'dia_chi_chi_tiet', 'dia_chi_xa_phuong', 'dia_chi_tinh_thanh'
        ],
        filter: dateFilter,
        sort: ['-date_created']
      });

      if (documentsResult.success) {
        const documents = documentsResult.data;
        
        // Load workflow data
        const workflowResult = await directusService.getCollection('luong_xu_ly', {
          fields: [
            'id', 'document_id', 'trang_thai', 'ngay_phan_cong', 'ngay_nhan',
            'ngay_hoan_thanh', 'han_xu_ly', 'don_vi_nhan.ten_don_vi', 'don_vi_nhan.ma_don_vi'
          ],
          filter: filterData.organization ? { don_vi_nhan: { _eq: filterData.organization } } : {},
          sort: ['-ngay_phan_cong']
        });

        // Process data based on report type
        await processReportData(documents, workflowResult.success ? workflowResult.data : []);
        
      } else {
        setError('Không có dữ liệu trong khoảng thời gian đã chọn');
      }
    } catch (err) {
      setError('Lỗi tạo báo cáo: ' + err.message);
    }
    
    setLoading(false);
  };

  // Process report data based on type
  const processReportData = async (documents, workflows) => {
    switch (filterData.reportType) {
      case 'tong_hop':
        await processSummaryReport(documents, workflows);
        break;
      case 'chi_tiet':
        await processDetailReport(documents, workflows);
        break;
      case 'don_vi':
        await processOrganizationReport(documents, workflows);
        break;
      case 'hieu_suat':
        await processPerformanceReport(documents, workflows);
        break;
      case 'qua_han':
        await processOverdueReport(documents, workflows);
        break;
    }
  };

  // Process summary report
  const processSummaryReport = async (documents, workflows) => {
    const summary = {
      totalDocuments: documents.length,
      completedDocuments: workflows.filter(w => w.trang_thai === 'hoan_thanh').length,
      processingDocuments: workflows.filter(w => w.trang_thai === 'dang_xu_ly').length,
      overdueDocuments: 0,
      averageProcessingDays: 0
    };

    // Calculate overdue
    const now = new Date();
    summary.overdueDocuments = workflows.filter(w => {
      if (w.han_xu_ly && w.trang_thai !== 'hoan_thanh') {
        return new Date(w.han_xu_ly) < now;
      }
      return false;
    }).length;

    // Calculate average processing time
    const completedWorkflows = workflows.filter(w => w.trang_thai === 'hoan_thanh' && w.ngay_phan_cong && w.ngay_hoan_thanh);
    if (completedWorkflows.length > 0) {
      const totalDays = completedWorkflows.reduce((sum, w) => {
        const start = new Date(w.ngay_phan_cong);
        const end = new Date(w.ngay_hoan_thanh);
        return sum + Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      }, 0);
      summary.averageProcessingDays = Math.round(totalDays / completedWorkflows.length);
    }

    setKpiData(summary);

    // Create table data
    const tableData = documents.map((doc, index) => {
      const docWorkflow = workflows.find(w => w.document_id === doc.id);
      const address = [doc.dia_chi_chi_tiet, doc.dia_chi_xa_phuong, doc.dia_chi_tinh_thanh].filter(Boolean).join(', ');
      
      return {
        stt: index + 1,
        so_van_ban: doc.so_van_ban,
        tieu_de: doc.tieu_de,
        ho_ten_nguoi_gui: doc.ho_ten_nguoi_gui,
        dia_chi: address || '-',
        loai_don_thu: doc.loai_don_thu,
        date_created: doc.date_created,
        status: doc.status,
        don_vi_xu_ly: doc.assigned_organization?.ten_don_vi || 'Chưa phân công',
        han_xu_ly: docWorkflow?.han_xu_ly || doc.han_xu_ly
      };
    });

    setReportData(tableData);
  };

  // Process organization report
  const processOrganizationReport = async (documents, workflows) => {
    const orgStats = {};
    
    workflows.forEach(workflow => {
      const orgName = workflow.don_vi_nhan?.ten_don_vi || 'Chưa phân công';
      const orgCode = workflow.don_vi_nhan?.ma_don_vi || '-';
      
      if (!orgStats[orgName]) {
        orgStats[orgName] = {
          stt: Object.keys(orgStats).length + 1,
          ma_don_vi: orgCode,
          ten_don_vi: orgName,
          tong_nhan: 0,
          dang_xu_ly: 0,
          hoan_thanh: 0,
          qua_han: 0,
          ty_le_hoan_thanh: 0
        };
      }
      
      orgStats[orgName].tong_nhan++;
      
      if (workflow.trang_thai === 'hoan_thanh') {
        orgStats[orgName].hoan_thanh++;
      } else if (workflow.trang_thai === 'dang_xu_ly') {
        orgStats[orgName].dang_xu_ly++;
      }
      
      // Check overdue
      if (workflow.han_xu_ly && workflow.trang_thai !== 'hoan_thanh') {
        const deadline = new Date(workflow.han_xu_ly);
        const now = new Date();
        if (deadline < now) {
          orgStats[orgName].qua_han++;
        }
      }
    });

    // Calculate completion rate
    Object.values(orgStats).forEach(org => {
      org.ty_le_hoan_thanh = org.tong_nhan > 0 ? Math.round((org.hoan_thanh / org.tong_nhan) * 100) : 0;
    });

    setReportData(Object.values(orgStats));
  };

  // Process performance report
  const processPerformanceReport = async (documents, workflows) => {
    const performanceData = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Group by month for the last 12 months
    for (let i = 11; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12;
      const year = month > currentMonth ? currentYear - 1 : currentYear;
      
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      
      const monthDocs = documents.filter(doc => {
        const docDate = new Date(doc.date_created);
        return docDate >= monthStart && docDate <= monthEnd;
      });

      const monthWorkflows = workflows.filter(w => {
        const wDate = new Date(w.ngay_phan_cong || w.date_created);
        return wDate >= monthStart && wDate <= monthEnd;
      });

      performanceData.push({
        stt: performanceData.length + 1,
        thang_nam: `${String(month + 1).padStart(2, '0')}/${year}`,
        tiep_nhan: monthDocs.length,
        hoan_thanh: monthWorkflows.filter(w => w.trang_thai === 'hoan_thanh').length,
        qua_han: monthWorkflows.filter(w => {
          if (w.han_xu_ly && w.trang_thai !== 'hoan_thanh') {
            return new Date(w.han_xu_ly) < new Date();
          }
          return false;
        }).length,
        ty_le_hoan_thanh: monthDocs.length > 0 ? 
          Math.round((monthWorkflows.filter(w => w.trang_thai === 'hoan_thanh').length / monthDocs.length) * 100) : 0
      });
    }

    setReportData(performanceData);
  };

  // Process overdue report
  const processOverdueReport = async (documents, workflows) => {
    const now = new Date();
    const overdueWorkflows = workflows.filter(w => {
      if (w.han_xu_ly && w.trang_thai !== 'hoan_thanh') {
        return new Date(w.han_xu_ly) < now;
      }
      return false;
    });

    const overdueData = overdueWorkflows.map((workflow, index) => {
      const doc = documents.find(d => d.id === workflow.document_id);
      const overdueDays = Math.ceil((now - new Date(workflow.han_xu_ly)) / (1000 * 60 * 60 * 24));
      
      return {
        stt: index + 1,
        so_van_ban: doc?.so_van_ban || '-',
        tieu_de: doc?.tieu_de || '-',
        ho_ten_nguoi_gui: doc?.ho_ten_nguoi_gui || '-',
        don_vi_xu_ly: workflow.don_vi_nhan?.ten_don_vi || '-',
        han_xu_ly: workflow.han_xu_ly,
        so_ngay_qua_han: overdueDays,
        trang_thai: workflow.trang_thai
      };
    });

    setReportData(overdueData);
  };

  // Process detail report
  const processDetailReport = async (documents, workflows) => {
    const detailData = [];
    
    documents.forEach(doc => {
      const docWorkflows = workflows.filter(w => w.document_id === doc.id);
      const address = [doc.dia_chi_chi_tiet, doc.dia_chi_xa_phuong, doc.dia_chi_tinh_thanh].filter(Boolean).join(', ');
      
      if (docWorkflows.length > 0) {
        docWorkflows.forEach((workflow, index) => {
          detailData.push({
            stt: detailData.length + 1,
            so_van_ban: index === 0 ? doc.so_van_ban : '',
            tieu_de: index === 0 ? doc.tieu_de : '',
            ho_ten_nguoi_gui: index === 0 ? doc.ho_ten_nguoi_gui : '',
            dia_chi: index === 0 ? address : '',
            don_vi_xu_ly: workflow.don_vi_nhan?.ten_don_vi || '-',
            trang_thai: workflow.trang_thai,
            ngay_nhan: workflow.ngay_nhan,
            ngay_hoan_thanh: workflow.ngay_hoan_thanh,
            so_ngay_xu_ly: workflow.ngay_nhan && workflow.ngay_hoan_thanh ? 
              Math.ceil((new Date(workflow.ngay_hoan_thanh) - new Date(workflow.ngay_nhan)) / (1000 * 60 * 60 * 24)) : null
          });
        });
      } else {
        detailData.push({
          stt: detailData.length + 1,
          so_van_ban: doc.so_van_ban,
          tieu_de: doc.tieu_de,
          ho_ten_nguoi_gui: doc.ho_ten_nguoi_gui,
          dia_chi: address,
          don_vi_xu_ly: 'Chưa phân công',
          trang_thai: doc.status,
          ngay_nhan: null,
          ngay_hoan_thanh: null,
          so_ngay_xu_ly: null
        });
      }
    });

    setReportData(detailData);
  };

  // Export to Excel
  const exportToExcel = async () => {
    if (!reportData.length) {
      setError('Không có dữ liệu để xuất');
      return;
    }

    setExporting(true);
    try {
      const fileName = `Bao_cao_${filterData.reportType}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const ws = XLSX.utils.json_to_sheet(reportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Báo cáo");
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      setError('Lỗi xuất Excel: ' + error.message);
    }
    setExporting(false);
  };

  // Set current month
  const setCurrentMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setFilterData(prev => ({
      ...prev,
      dateFrom: firstDay.toISOString().slice(0, 10),
      dateTo: lastDay.toISOString().slice(0, 10)
    }));
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFilterData(prev => ({ ...prev, [field]: value }));
  };

  // Load initial data
  useEffect(() => {
    loadOrganizations();
    setCurrentMonth();
  }, []);

  // Get table columns based on report type
  const getTableColumns = () => {
    const baseColumns = [
      { key: 'stt', title: 'STT', sortable: false }
    ];

    switch (filterData.reportType) {
      case 'tong_hop':
        return [
          ...baseColumns,
          { key: 'so_van_ban', title: 'Số văn bản', sortable: true },
          { key: 'ho_ten_nguoi_gui', title: 'Người gửi' },
          { key: 'dia_chi', title: 'Địa chỉ' },
          { key: 'loai_don_thu', title: 'Loại', render: (value) => {
            const typeMap = {
              'khieu_nai': 'Khiếu nại',
              'to_cao': 'Tố cáo', 
              'kien_nghi': 'Kiến nghị',
              'phan_anh': 'Phản ánh'
            };
            return typeMap[value] || value;
          }},
          { key: 'status', title: 'Trạng thái' },
          { key: 'don_vi_xu_ly', title: 'Đơn vị xử lý' },
          { key: 'date_created', title: 'Ngày tiếp nhận', render: (value) => new Date(value).toLocaleDateString('vi-VN') }
        ];

      case 'don_vi':
        return [
          ...baseColumns,
          { key: 'ma_don_vi', title: 'Mã đơn vị' },
          { key: 'ten_don_vi', title: 'Tên đơn vị' },
          { key: 'tong_nhan', title: 'Tổng nhận', sortable: true },
          { key: 'hoan_thanh', title: 'Hoàn thành', sortable: true },
          { key: 'dang_xu_ly', title: 'Đang xử lý', sortable: true },
          { key: 'qua_han', title: 'Quá hạn', sortable: true },
          { key: 'ty_le_hoan_thanh', title: 'Tỷ lệ HT (%)', render: (value) => `${value}%` }
        ];

      case 'hieu_suat':
        return [
          ...baseColumns,
          { key: 'thang_nam', title: 'Tháng/Năm' },
          { key: 'tiep_nhan', title: 'Tiếp nhận', sortable: true },
          { key: 'hoan_thanh', title: 'Hoàn thành', sortable: true },
          { key: 'qua_han', title: 'Quá hạn', sortable: true },
          { key: 'ty_le_hoan_thanh', title: 'Tỷ lệ HT (%)', render: (value) => `${value}%` }
        ];

      case 'qua_han':
        return [
          ...baseColumns,
          { key: 'so_van_ban', title: 'Số văn bản' },
          { key: 'tieu_de', title: 'Tiêu đề' },
          { key: 'don_vi_xu_ly', title: 'Đơn vị xử lý' },
          { key: 'han_xu_ly', title: 'Hạn xử lý', render: (value) => new Date(value).toLocaleDateString('vi-VN') },
          { key: 'so_ngay_qua_han', title: 'Số ngày quá hạn', render: (value) => `${value} ngày` },
          { key: 'trang_thai', title: 'Trạng thái' }
        ];

      default: // chi_tiet
        return [
          ...baseColumns,
          { key: 'so_van_ban', title: 'Số văn bản' },
          { key: 'ho_ten_nguoi_gui', title: 'Người gửi' },
          { key: 'dia_chi', title: 'Địa chỉ' },
          { key: 'don_vi_xu_ly', title: 'Đơn vị xử lý' },
          { key: 'trang_thai', title: 'Trạng thái' },
          { key: 'ngay_nhan', title: 'Ngày nhận', render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '-' },
          { key: 'so_ngay_xu_ly', title: 'Số ngày xử lý', render: (value) => value ? `${value} ngày` : '-' }
        ];
    }
  };

  return (
    <div className={cx('denouncePage')}>
      {/* Header */}
      <div className={cx('pageHeader')}>
        <div className={cx('headerContent')}>
          <h1 className={cx('pageTitle')}>
            <i className={cx('titleIcon', 'fas', 'fa-chart-bar')}></i>
            Báo cáo & Quản trị
          </h1>
          <p className={cx('pageSubtitle')}>
            Dashboard KPI, báo cáo định kỳ và phân tích xu hướng xử lý đơn thư
          </p>
        </div>
        
        <div className={cx('headerActions')}>
          <button 
            onClick={exportToExcel}
            className="btn"
            disabled={!reportData.length || exporting}
          >
            <i className="fas fa-file-excel"></i>
            {exporting ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={cx('tabNavigation')}>
        <button
          className={cx('tabButton', { active: activeTab === 'dashboard' })}
          onClick={() => setActiveTab('dashboard')}
        >
          <i className="fas fa-tachometer-alt"></i>
          Dashboard KPI
        </button>
        <button
          className={cx('tabButton', { active: activeTab === 'reports' })}
          onClick={() => setActiveTab('reports')}
        >
          <i className="fas fa-chart-line"></i>
          Báo cáo chi tiết
        </button>
      </div>

      {/* Filter Section */}
      <div className={cx('filterSection')}>
        <div className={cx('filterTitle')}>
          <i className="fas fa-filter"></i>
          Bộ lọc báo cáo
        </div>
        
        <div className={cx('formRow', 'compact')}>
          <div className={cx('formGroup', 'medium')}>
            <label className={cx('formLabel')}>Loại báo cáo</label>
            <select 
              className={cx('formSelect')}
              value={filterData.reportType}
              onChange={(e) => handleInputChange('reportType', e.target.value)}
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className={cx('formGroup', 'medium')}>
            <label className={cx('formLabel')}>Từ ngày</label>
            <input
              type="date"
              className={cx('formInput')}
              value={filterData.dateFrom}
              onChange={(e) => handleInputChange('dateFrom', e.target.value)}
            />
          </div>
          
          <div className={cx('formGroup', 'medium')}>
            <label className={cx('formLabel')}>Đến ngày</label>
            <input
              type="date"
              className={cx('formInput')}
              value={filterData.dateTo}
              onChange={(e) => handleInputChange('dateTo', e.target.value)}
            />
          </div>

          <div className={cx('formGroup', 'medium')}>
            <label className={cx('formLabel')}>Đơn vị</label>
            <select 
              className={cx('formSelect')}
              value={filterData.organization}
              onChange={(e) => handleInputChange('organization', e.target.value)}
            >
              <option value="">Tất cả đơn vị</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>
                  {org.ma_don_vi} - {org.ten_don_vi}
                </option>
              ))}
            </select>
          </div>
          
          <div className={cx('formGroup', 'small')}>
            <label className={cx('formLabel')}>Loại</label>
            <select 
              className={cx('formSelect')}
              value={filterData.documentType}
              onChange={(e) => handleInputChange('documentType', e.target.value)}
            >
              {documentTypeOptions.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={cx('formActions')}>
          <button onClick={generateReport} className="btn" disabled={loading}>
            <i className="fas fa-chart-line"></i>
            {loading ? 'Đang tạo...' : 'Tạo báo cáo'}
          </button>
          
          <button onClick={setCurrentMonth} className="btn">
            <i className="fas fa-calendar"></i>
            Tháng hiện tại
          </button>
        </div>
      </div>

      {/* Alert */}
      {error && (
        <div className={cx('errorAlert')}>
          <div className={cx('alertIcon')}>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className={cx('alertContent')}>{error}</div>
          <button onClick={() => setError('')} className={cx('alertClose')}>×</button>
        </div>
      )}

      {/* Content */}
      {activeTab === 'dashboard' && kpiData.totalDocuments > 0 && (
        <div className={cx('statsGrid')}>
          <div className={cx('statCard', 'blue')}>
            <div className={cx('statIcon')}>
              <i className="fas fa-file-alt"></i>
            </div>
            <div className={cx('statContent')}>
              <div className={cx('statValue')}>{kpiData.totalDocuments}</div>
              <div className={cx('statLabel')}>Tổng đơn thư</div>
            </div>
          </div>

          <div className={cx('statCard', 'green')}>
            <div className={cx('statIcon')}>
              <i className="fas fa-check-circle"></i>
            </div>
            <div className={cx('statContent')}>
              <div className={cx('statValue')}>{kpiData.completedDocuments}</div>
              <div className={cx('statLabel')}>Hoàn thành</div>
            </div>
          </div>

          <div className={cx('statCard', 'yellow')}>
            <div className={cx('statIcon')}>
              <i className="fas fa-cogs"></i>
            </div>
            <div className={cx('statContent')}>
              <div className={cx('statValue')}>{kpiData.processingDocuments}</div>
              <div className={cx('statLabel')}>Đang xử lý</div>
            </div>
          </div>

          <div className={cx('statCard', 'red')}>
            <div className={cx('statIcon')}>
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className={cx('statContent')}>
              <div className={cx('statValue')}>{kpiData.overdueDocuments}</div>
              <div className={cx('statLabel')}>Quá hạn</div>
            </div>
          </div>

          <div className={cx('statCard', 'purple')}>
            <div className={cx('statIcon')}>
              <i className="fas fa-clock"></i>
            </div>
            <div className={cx('statContent')}>
              <div className={cx('statValue')}>{kpiData.averageProcessingDays}</div>
              <div className={cx('statLabel')}>Ngày TB xử lý</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && reportData.length > 0 && (
        <div className={cx('card')}>
          <div className={cx('cardHeader')}>
            <h3 className={cx('cardTitle')}>
              <i className="fas fa-table"></i>
              {reportTypes.find(t => t.value === filterData.reportType)?.label} ({reportData.length} bản ghi)
            </h3>
          </div>
          
          <div className={cx('tableContainer')}>
            <Table
              data={reportData}
              columns={getTableColumns()}
              loading={loading}
              searchable={true}
              sortable={true}
              pagination={true}
              itemsPerPage={25}
              emptyMessage="Không có dữ liệu báo cáo"
            />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && reportData.length === 0 && (
        <div className={cx('emptyState')}>
          <i className="fas fa-chart-line"></i>
          <h3>Chưa có dữ liệu báo cáo</h3>
          <p>Chọn bộ lọc và nhấn "Tạo báo cáo" để xem kết quả</p>
        </div>
      )}
    </div>
  );
};

export default ReportsDenounce;