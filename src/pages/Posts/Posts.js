// pages/Posts/Posts.js - Posts Management Page (Fixed infinite loop)
import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import * as XLSX from 'xlsx';
import { usePosts } from '../../hooks';
import { Button, Card, Input } from '../../components';
import styles from './Posts.module.scss';

const cx = classNames.bind(styles);

function Posts() {
  const { posts, loading, error, fetchPosts, searchPosts, deletePost } = usePosts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  // Chỉ fetch posts 1 lần khi component mount
  useEffect(() => {
    fetchPosts();
  }, []); // Empty dependency array - chỉ chạy 1 lần

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearching(true);
      try {
        await searchPosts(searchTerm);
      } finally {
        setIsSearching(false);
      }
    } else {
      fetchPosts();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchPosts();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa văn bản này?')) {
      await deletePost(id);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filterStatus === 'all') return true;
    return post.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { label: 'Đã phát hành', color: 'success' },
      draft: { label: 'Bản nháp', color: 'warning' },
      archived: { label: 'Lưu trữ', color: 'secondary' }
    };

    const config = statusConfig[status] || { label: status, color: 'secondary' };
    return (
      <span className={cx('status-badge', `status-badge--${config.color}`)}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Export functions
  const getStatusText = (status) => {
    const statusMap = {
      published: 'Đã phát hành',
      draft: 'Bản nháp', 
      archived: 'Lưu trữ'
    };
    return statusMap[status] || status;
  };

  const formatDateForExcel = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const exportToExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = filteredPosts.map((post, index) => ({
        'STT': index + 1,
        'Tiêu đề': post.title || 'Chưa có tiêu đề',
        'Trạng thái': getStatusText(post.status),
        'Nội dung tóm tắt': post.excerpt || (post.content ? post.content.substring(0, 200) + '...' : 'Chưa có nội dung'),
        'Ngày tạo': formatDateForExcel(post.date_created),
        'Ngày cập nhật': formatDateForExcel(post.date_updated),
        'Tác giả': post.user_created?.first_name || 'N/A',
        'Slug': post.slug || '',
        'ID': post.id
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 5 },   // STT
        { wch: 40 },  // Tiêu đề
        { wch: 12 },  // Trạng thái
        { wch: 50 },  // Nội dung tóm tắt
        { wch: 12 },  // Ngày tạo
        { wch: 12 },  // Ngày cập nhật
        { wch: 15 },  // Tác giả
        { wch: 20 },  // Slug
        { wch: 10 }   // ID
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Văn bản pháp quy');

      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `van_ban_phap_quy_${dateStr}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      // Show success message (you can replace this with your notification system)
      alert(`Đã xuất thành công ${filteredPosts.length} văn bản ra file Excel: ${filename}`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Có lỗi xảy ra khi xuất file Excel. Vui lòng thử lại.');
    }
  };

  const exportToDocx = () => {
    try {
      // Create HTML content for DOCX
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Danh sách văn bản pháp quy</title>
          <style>
            body { font-family: 'Times New Roman', serif; margin: 20px; }
            h1 { text-align: center; color: #2c3e50; margin-bottom: 30px; }
            .meta-info { text-align: center; margin-bottom: 20px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .status-published { color: #27ae60; font-weight: bold; }
            .status-draft { color: #f39c12; font-weight: bold; }
            .status-archived { color: #7f8c8d; font-weight: bold; }
            .post-content { margin: 20px 0; page-break-inside: avoid; }
            .post-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
            .post-meta { font-size: 12px; color: #666; margin-bottom: 10px; }
            .post-text { line-height: 1.6; }
          </style>
        </head>
        <body>
          <h1>DANH SÁCH VĂN BẢN PHÁP QUY</h1>
          <div class="meta-info">
            <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
            <p>Tổng số văn bản: ${filteredPosts.length}</p>
          </div>
      `;

      // Add summary table
      htmlContent += `
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tiêu đề</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Tác giả</th>
            </tr>
          </thead>
          <tbody>
      `;

      filteredPosts.forEach((post, index) => {
        const statusClass = `status-${post.status}`;
        htmlContent += `
          <tr>
            <td>${index + 1}</td>
            <td>${post.title || 'Chưa có tiêu đề'}</td>
            <td class="${statusClass}">${getStatusText(post.status)}</td>
            <td>${formatDate(post.date_created)}</td>
            <td>${post.user_created?.first_name || 'N/A'}</td>
          </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
      `;

      // Add detailed content for each post
      htmlContent += '<h2>NỘI DUNG CHI TIẾT</h2>';
      
      filteredPosts.forEach((post, index) => {
        htmlContent += `
          <div class="post-content">
            <div class="post-title">${index + 1}. ${post.title || 'Chưa có tiêu đề'}</div>
            <div class="post-meta">
              Trạng thái: ${getStatusText(post.status)} | 
              Ngày tạo: ${formatDate(post.date_created)} | 
              Tác giả: ${post.user_created?.first_name || 'N/A'}
            </div>
            <div class="post-text">
              ${post.content || post.excerpt || 'Chưa có nội dung'}
            </div>
          </div>
        `;
      });

      htmlContent += `
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([htmlContent], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `van_ban_phap_quy_${dateStr}.docx`;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(`Đã xuất thành công ${filteredPosts.length} văn bản ra file Word: ${filename}`);
    } catch (error) {
      console.error('Error exporting to DOCX:', error);
      alert('Có lỗi xảy ra khi xuất file Word. Vui lòng thử lại.');
    }
  };

  if (error) {
    return (
      <div className={cx('posts-page')}>
        <Card variant="bordered" className={cx('error-card')}>
          <div className={cx('error-content')}>
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Lỗi khi tải dữ liệu</h3>
            <p>{error}</p>
            <Button onClick={() => fetchPosts()} variant="primary">
              Thử lại
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cx('posts-page')}>
      {/* FontAwesome CDN */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* Header */}
      <div className={cx('page-header')}>
        <div className={cx('header-content')}>
          <h1>
            <i className="fas fa-file-alt"></i>
            Quản lý văn bản
          </h1>
          <p>Quản lý các văn bản pháp quy và tài liệu</p>
        </div>
        <div className={cx('header-actions')}>
          <Button 
            variant="secondary" 
            icon="fas fa-file-excel"
            onClick={exportToExcel}
            disabled={loading || filteredPosts.length === 0}
          >
            Xuất Excel
          </Button>
          <Button 
            variant="secondary" 
            icon="fas fa-file-word"
            onClick={exportToDocx}
            disabled={loading || filteredPosts.length === 0}
          >
            Xuất Word
          </Button>
          <Button variant="primary" icon="fas fa-plus">
            Tạo văn bản mới
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className={cx('search-card')}>
        <form onSubmit={handleSearch} className={cx('search-form')}>
          <div className={cx('search-inputs')}>
            <Input
              placeholder="Tìm kiếm theo tiêu đề, nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="fas fa-search"
              className={cx('search-input')}
            />
            <Input.Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'published', label: 'Đã phát hành' },
                { value: 'draft', label: 'Bản nháp' },
                { value: 'archived', label: 'Lưu trữ' }
              ]}
              className={cx('filter-select')}
            />
          </div>
          <div className={cx('search-actions')}>
            <Button 
              type="submit" 
              variant="primary"
              loading={isSearching}
              icon="fas fa-search"
            >
              Tìm kiếm
            </Button>
            {searchTerm && (
              <Button 
                type="button" 
                variant="secondary"
                onClick={handleClearSearch}
                icon="fas fa-times"
              >
                Xóa
              </Button>
            )}
            <Button 
              variant="outline"
              icon="fas fa-download"
              onClick={exportToExcel}
              disabled={loading || filteredPosts.length === 0}
              title="Xuất danh sách ra Excel"
            >
              Excel
            </Button>
          </div>
        </form>
      </Card>

      {/* Posts List */}
      <div className={cx('posts-grid')}>
        {loading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className={cx('post-card', 'post-card--loading')}>
              <div className={cx('skeleton-header')}></div>
              <div className={cx('skeleton-content')}>
                <div className={cx('skeleton-line')}></div>
                <div className={cx('skeleton-line')}></div>
                <div className={cx('skeleton-line', 'skeleton-line--short')}></div>
              </div>
            </Card>
          ))
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <Card 
              key={post.id} 
              hoverable 
              className={cx('post-card')}
            >
              <div className={cx('post-header')}>
                <h3 className={cx('post-title')}>
                  {post.title || 'Chưa có tiêu đề'}
                </h3>
                {getStatusBadge(post.status)}
              </div>
              
              <div className={cx('post-content')}>
                <p className={cx('post-excerpt')}>
                  {post.excerpt || post.content?.substring(0, 150) + '...' || 'Chưa có nội dung'}
                </p>
                
                <div className={cx('post-meta')}>
                  <div className={cx('meta-item')}>
                    <i className="fas fa-calendar"></i>
                    <span>Tạo: {formatDate(post.date_created)}</span>
                  </div>
                  
                  {post.date_updated && (
                    <div className={cx('meta-item')}>
                      <i className="fas fa-edit"></i>
                      <span>Sửa: {formatDate(post.date_updated)}</span>
                    </div>
                  )}
                  
                  {post.user_created && (
                    <div className={cx('meta-item')}>
                      <i className="fas fa-user"></i>
                      <span>Tác giả: {post.user_created.first_name || 'N/A'}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={cx('post-actions')}>
                <Button 
                  size="small" 
                  variant="secondary"
                  icon="fas fa-eye"
                >
                  Xem
                </Button>
                <Button 
                  size="small" 
                  variant="primary"
                  icon="fas fa-edit"
                >
                  Sửa
                </Button>
                {post.status === 'draft' && (
                  <Button 
                    size="small" 
                    variant="success"
                    icon="fas fa-check"
                  >
                    Phát hành
                  </Button>
                )}
                <Button 
                  size="small" 
                  variant="danger"
                  icon="fas fa-trash"
                  onClick={() => handleDelete(post.id)}
                >
                  Xóa
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className={cx('empty-state')}>
            <div className={cx('empty-content')}>
              <i className="fas fa-file-alt"></i>
              <h3>Chưa có văn bản nào</h3>
              <p>
                {searchTerm 
                  ? `Không tìm thấy văn bản nào với từ khóa "${searchTerm}"`
                  : 'Bắt đầu tạo văn bản đầu tiên của bạn'
                }
              </p>
              <Button variant="primary" icon="fas fa-plus">
                Tạo văn bản mới
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Stats Footer */}
      {!loading && filteredPosts.length > 0 && (
        <Card className={cx('stats-footer')}>
          <div className={cx('stats-content')}>
            <div className={cx('stat-item')}>
              <span className={cx('stat-value')}>{filteredPosts.length}</span>
              <span className={cx('stat-label')}>Tổng số văn bản</span>
            </div>
            <div className={cx('stat-item')}>
              <span className={cx('stat-value')}>
                {filteredPosts.filter(p => p.status === 'published').length}
              </span>
              <span className={cx('stat-label')}>Đã phát hành</span>
            </div>
            <div className={cx('stat-item')}>
              <span className={cx('stat-value')}>
                {filteredPosts.filter(p => p.status === 'draft').length}
              </span>
              <span className={cx('stat-label')}>Bản nháp</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default Posts;