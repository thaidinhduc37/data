import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { useAuth } from '../../hooks';
import styles from './Profile.module.scss';

const cx = classNames.bind(styles);

const Profile = () => {
  const { user, logout, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    description: ''
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setEditForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        description: user.description || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    console.log('Saving profile changes:', editForm);
    setIsEditing(false);
    // TODO: Implement actual API call to update profile
  };

  const handleCancel = () => {
    if (user) {
      setEditForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        description: user.description || ''
      });
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <div className={cx('loading')}>
        <div className={cx('spinner')}></div>
        <p>Đang tải thông tin người dùng...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={cx('not-logged-in')}>
        <h2>Vui lòng đăng nhập để xem profile</h2>
      </div>
    );
  }

  return (
    <div className={cx('profile')}>
      <div className={cx('container')}>
        <div className={cx('profile-card')}>
          
          {/* Header */}
          <div className={cx('header')}>
            <div className={cx('avatar-section')}>
              <div className={cx('avatar')}>
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="User Avatar" 
                    className={cx('avatar-image')}
                  />
                ) : (
                  <div className={cx('avatar-placeholder')}>
                    {((user.first_name || user.email || 'U').charAt(0) + 
                      (user.last_name || '').charAt(0)).toUpperCase()}
                  </div>
                )}
              </div>
              <button className={cx('change-avatar-btn')}>
                Đổi ảnh đại diện
              </button>
            </div>
            
            <div className={cx('user-info')}>
              <h1 className={cx('user-name')}>
                {user.first_name || user.last_name 
                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                  : user.email}
              </h1>
              <p className={cx('user-email')}>{user.email}</p>
              <div className={cx('user-meta')}>
                <span className={cx('role')}>
                  {user.role?.name || 'User'}
                </span>
                <span className={cx('status', { active: user.status === 'active' })}>
                  {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </div>
            </div>

            <div className={cx('actions')}>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className={cx('edit-btn')}
                >
                  Chỉnh sửa
                </button>
              ) : (
                <div className={cx('edit-actions')}>
                  <button 
                    onClick={handleSave}
                    className={cx('save-btn')}
                  >
                    Lưu
                  </button>
                  <button 
                    onClick={handleCancel}
                    className={cx('cancel-btn')}
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className={cx('details')}>
            <h3 className={cx('section-title')}>Thông tin cá nhân</h3>
            
            <div className={cx('form-grid')}>
              <div className={cx('form-group')}>
                <label className={cx('label')}>Họ</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={editForm.first_name}
                    onChange={handleInputChange}
                    className={cx('input')}
                    placeholder="Nhập họ"
                  />
                ) : (
                  <div className={cx('value')}>
                    {user.first_name || 'Chưa cập nhật'}
                  </div>
                )}
              </div>

              <div className={cx('form-group')}>
                <label className={cx('label')}>Tên</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={editForm.last_name}
                    onChange={handleInputChange}
                    className={cx('input')}
                    placeholder="Nhập tên"
                  />
                ) : (
                  <div className={cx('value')}>
                    {user.last_name || 'Chưa cập nhật'}
                  </div>
                )}
              </div>

              <div className={cx('form-group', 'full-width')}>
                <label className={cx('label')}>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    className={cx('input')}
                    placeholder="Nhập email"
                  />
                ) : (
                  <div className={cx('value')}>
                    {user.email}
                  </div>
                )}
              </div>

              <div className={cx('form-group', 'full-width')}>
                <label className={cx('label')}>Mô tả</label>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleInputChange}
                    className={cx('textarea')}
                    placeholder="Nhập mô tả về bản thân"
                    rows={4}
                  />
                ) : (
                  <div className={cx('value')}>
                    {user.description || 'Chưa có mô tả'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className={cx('system-info')}>
            <h3 className={cx('section-title')}>Thông tin hệ thống</h3>
            <div className={cx('info-grid')}>
              <div className={cx('info-item')}>
                <span className={cx('info-label')}>ID:</span>
                <span className={cx('info-value')}>{user.id}</span>
              </div>
              <div className={cx('info-item')}>
                <span className={cx('info-label')}>Ngày tạo:</span>
                <span className={cx('info-value')}>
                  {user.date_created ? new Date(user.date_created).toLocaleDateString('vi-VN') : 'Không rõ'}
                </span>
              </div>
              <div className={cx('info-item')}>
                <span className={cx('info-label')}>Lần cập nhật cuối:</span>
                <span className={cx('info-value')}>
                  {user.date_updated ? new Date(user.date_updated).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                </span>
              </div>
              <div className={cx('info-item')}>
                <span className={cx('info-label')}>Ngôn ngữ:</span>
                <span className={cx('info-value')}>{user.language || 'Mặc định'}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={cx('footer-actions')}>
            <button 
              onClick={handleLogout}
              className={cx('logout-btn')}
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Debug Info */}
        <div className={cx('debug-section')}>
          <details className={cx('debug-details')}>
            <summary className={cx('debug-summary')}>
              Thông tin debug (Raw User Data)
            </summary>
            <pre className={cx('debug-content')}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
};

export default Profile;