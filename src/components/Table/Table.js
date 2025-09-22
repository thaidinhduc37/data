import React, { useState, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './Table.module.scss';

const cx = classNames.bind(styles);

// Component Table có thể tái sử dụng
const Table = ({ 
  data = [], 
  columns = [], 
  loading = false,
  pagination = true,
  searchable = true,
  sortable = true,
  selectable = false,
  actions = [],
  onRowClick = null,
  className = '',
  emptyMessage = 'Không có dữ liệu',
  itemsPerPage = 10
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Xử lý sắp xếp
  const handleSort = useCallback((key) => {
    if (!sortable) return;
    
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, [sortable]);

  // Xử lý tìm kiếm
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(item =>
      columns.some(col => {
        const value = getNestedValue(item, col.key);
        return String(value || '').toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns]);

  // Xử lý sắp xếp dữ liệu
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = getNestedValue(a, sortConfig.key);
      const bVal = getNestedValue(b, sortConfig.key);

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Tính toán pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = pagination 
    ? sortedData.slice(startIndex, startIndex + itemsPerPage)
    : sortedData;

  // Hàm lấy giá trị nested object
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((o, p) => o?.[p], obj);
  };

  // Xử lý chọn hàng
  const handleSelectRow = (rowIndex) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowIndex)) {
      newSelected.delete(rowIndex);
    } else {
      newSelected.add(rowIndex);
    }
    setSelectedRows(newSelected);
  };

  // Chọn tất cả
  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((_, index) => index)));
    }
  };

  // Xử lý edit inline
  const handleEditCell = (rowIndex, colKey, currentValue) => {
    setEditingCell(`${rowIndex}-${colKey}`);
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    // Gọi callback để lưu dữ liệu
    // onCellEdit?.(editingCell, editValue);
    setEditingCell(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Render nội dung ô
  const renderCellContent = (item, column, rowIndex) => {
    const cellKey = `${rowIndex}-${column.key}`;
    const value = getNestedValue(item, column.key);
    
    // Tính toán index thực tế cho STT khi có pagination
    const actualIndex = pagination ? startIndex + rowIndex : rowIndex;

    // Nếu đang edit ô này
    if (editingCell === cellKey && column.editable) {
      return (
        <div className={cx('editCell')}>
          <input
            type={column.inputType || 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={cx('editInput')}
            autoFocus
          />
          <button onClick={saveEdit} className={cx('editBtn', 'saveBtn')}>
            ✓
          </button>
          <button onClick={cancelEdit} className={cx('editBtn', 'cancelBtn')}>
            ✕
          </button>
        </div>
      );
    }

    // Render theo type của column
    switch (column.type) {
      case 'link':
        return (
          <a 
            href={column.linkUrl ? column.linkUrl(item) : `#${value}`}
            className={cx('link')}
            onClick={(e) => {
              if (column.onClick) {
                e.preventDefault();
                column.onClick(item, value);
              }
            }}
          >
            {column.render ? column.render(value, item) : value}
          </a>
        );

      case 'button':
        return (
          <button
            onClick={() => column.onClick?.(item, rowIndex)}
            className={cx('btn', {
              'btnDanger': column.variant === 'danger',
              'btnPrimary': column.variant !== 'danger'
            })}
          >
            {column.label || value}
          </button>
        );

      case 'input':
        return (
          <input
            type={column.inputType || 'text'}
            value={value || ''}
            onChange={(e) => column.onChange?.(item, e.target.value, rowIndex)}
            className={cx('input')}
            placeholder={column.placeholder}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => column.onChange?.(item, e.target.value, rowIndex)}
            className={cx('select')}
          >
            {column.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => column.onChange?.(item, e.target.checked, rowIndex)}
            className={cx('checkbox')}
          />
        );

      case 'badge':
        const badgeColor = column.getBadgeColor?.(value) || 'gray';
        return (
          <span className={cx('badge', `badge${badgeColor.charAt(0).toUpperCase() + badgeColor.slice(1)}`)}>
            {column.render ? column.render(value, item) : value}
          </span>
        );

      case 'actions':
        return (
          <div className={cx('actionsCell')}>
            {column.actions?.map((action, actionIndex) => (
              <button
                key={actionIndex}
                onClick={() => action.onClick(item, rowIndex)}
                className={cx('actionBtn', action.className)}
                title={action.title}
              >
                {action.icon}
              </button>
            ))}
          </div>
        );

      default:
        // Text hoặc custom render
        const displayValue = column.render ? column.render(value, item, actualIndex) : value;
        
        if (column.editable) {
          return (
            <div 
              className={cx('editableCell')}
              onClick={() => handleEditCell(rowIndex, column.key, value)}
            >
              {displayValue}
            </div>
          );
        }
        
        return displayValue;
    }
  };

  // Render pagination
  const renderPagination = () => {
    if (!pagination || totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className={cx('pagination')}>
        <div className={cx('paginationInfo')}>
          Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedData.length)} 
          trong tổng số {sortedData.length} bản ghi
        </div>
        
        <div className={cx('paginationControls')}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={cx('paginationBtn', { disabled: currentPage === 1 })}
          >
            Trước
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className={cx('paginationBtn')}
              >
                1
              </button>
              {startPage > 2 && <span className={cx('paginationDots')}>...</span>}
            </>
          )}

          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={cx('paginationBtn', { active: currentPage === number })}
            >
              {number}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className={cx('paginationDots')}>...</span>}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={cx('paginationBtn')}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={cx('paginationBtn', { disabled: currentPage === totalPages })}
          >
            Sau
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={cx('loading')}>
        <div className={cx('spinner')}></div>
      </div>
    );
  }

  return (
    <div className={cx('tableContainer', className)}>
      {/* Header với tìm kiếm */}
      {searchable && (
        <div className={cx('searchContainer')}>
          <div className={cx('searchWrapper')}>
            <span className={cx('searchIcon')}>🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cx('searchInput')}
            />
          </div>
        </div>
      )}

      {/* Bảng */}
      <div className={cx('tableWrapper')}>
        <table className={cx('table')}>
          <thead className={cx('tableHead')}>
            <tr>
              {selectable && (
                <th className={cx('selectColumn')}>
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className={cx('checkbox')}
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cx('tableHeader', {
                    'sortable': sortable && column.sortable !== false
                  })}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className={cx('headerContent')}>
                    {column.title}
                    {sortable && column.sortable !== false && sortConfig.key === column.key && (
                      <span className={cx('sortIcon')}>
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}

              {actions.length > 0 && (
                <th className={cx('actionsHeader')}>
                  Thao tác
                </th>
              )}
            </tr>
          </thead>

          <tbody className={cx('tableBody')}>
            {paginatedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  className={cx('emptyCell')}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cx('tableRow', {
                    'clickable': !!onRowClick,
                    'selected': selectedRows.has(rowIndex)
                  })}
                  onClick={() => onRowClick?.(item, rowIndex)}
                >
                  {selectable && (
                    <td className={cx('tableCell')}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowIndex)}
                        onChange={() => handleSelectRow(rowIndex)}
                        onClick={(e) => e.stopPropagation()}
                        className={cx('checkbox')}
                      />
                    </td>
                  )}

                  {columns.map((column) => (
                    <td key={column.key} className={cx('tableCell')}>
                      {renderCellContent(item, column, rowIndex)}
                    </td>
                  ))}

                  {actions.length > 0 && (
                    <td className={cx('tableCell')}>
                      <div className={cx('actionsCell')}>
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(item, rowIndex);
                            }}
                            className={cx('actionBtn', action.className)}
                            title={action.title}
                          >
                            {action.icon}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default Table;

/* 
Cách sử dụng component:

const columns = [
  { 
    key: 'name', 
    title: 'Tên', 
    sortable: true,
    editable: true 
  },
  { 
    key: 'email', 
    title: 'Email', 
    type: 'link',
    onClick: (item, value) => console.log('Email clicked:', value)
  },
  {
    key: 'status',
    title: 'Trạng thái',
    type: 'badge',
    getBadgeColor: (value) => value === 'active' ? 'green' : 'red',
    render: (value) => value === 'active' ? 'Hoạt động' : 'Không hoạt động'
  },
  {
    key: 'actions',
    title: 'Thao tác',
    type: 'actions',
    actions: [
      {
        icon: <Edit size={16} />,
        onClick: (item) => console.log('Edit:', item),
        title: 'Chỉnh sửa'
      },
      {
        icon: <Trash2 size={16} />,
        onClick: (item) => console.log('Delete:', item),
        title: 'Xóa',
        className: 'text-red-600'
      }
    ]
  }
];

const actions = [
  {
    icon: <Eye size={16} />,
    onClick: (item) => console.log('View:', item),
    title: 'Xem chi tiết'
  }
];

<Table
  data={data}
  columns={columns}
  actions={actions}
  searchable={true}
  sortable={true}
  selectable={true}
  pagination={true}
  onRowClick={(item) => console.log('Row clicked:', item)}
/>
*/