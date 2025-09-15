// pages/Auth/Register.js - Register Page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import config from '../../config';
import styles from './Auth.module.scss';

const cx = classNames.bind(styles);

function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Vui lòng nhập họ';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Vui lòng nhập tên';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate registration
    setTimeout(() => {
      setIsSubmitting(false);
      alert('🎉 Đăng ký thành công! Vui lòng liên hệ admin để kích hoạt tài khoản.');
      navigate(config.routes.login);
    }, 2000);
  };

  return (
    <div className={cx('register')}>
      <div className={cx('container')}>
        <div className={cx('register-card')}>
          <div className={cx('header')}>
            <div className={cx('logo')}>
              🚀 {config.app.name}
            </div>
            <h1 className={cx('title')}>Đăng ký</h1>
            <p className={cx('subtitle')}>
              Tạo tài khoản mới để truy cập vào hệ thống quản lý nội dung.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={cx('form')}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className={cx('form-group')}>
                <label htmlFor="firstName" className={cx('label')}>
                  👤 Họ *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={cx('input', { error: errors.firstName })}
                  placeholder="Nguyễn"
                />
                {errors.firstName && (
                  <span className={cx('error-text')}>{errors.firstName}</span>
                )}
              </div>

              <div className={cx('form-group')}>
                <label htmlFor="lastName" className={cx('label')}>
                  👤 Tên *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={cx('input', { error: errors.lastName })}
                  placeholder="Văn A"
                />
                {errors.lastName && (
                  <span className={cx('error-text')}>{errors.lastName}</span>
                )}
              </div>
            </div>

            <div className={cx('form-group')}>
              <label htmlFor="email" className={cx('label')}>
                📧 Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={cx('input', { error: errors.email })}
                placeholder="user@example.com"
              />
              {errors.email && (
                <span className={cx('error-text')}>{errors.email}</span>
              )}
            </div>

            <div className={cx('form-group')}>
              <label htmlFor="password" className={cx('label')}>
                🔒 Mật khẩu *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={cx('input', { error: errors.password })}
                placeholder="Tối thiểu 6 ký tự"
              />
              {errors.password && (
                <span className={cx('error-text')}>{errors.password}</span>
              )}
            </div>

            <div className={cx('form-group')}>
              <label htmlFor="confirmPassword" className={cx('label')}>
                🔒 Xác nhận mật khẩu *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={cx('input', { error: errors.confirmPassword })}
                placeholder="Nhập lại mật khẩu"
              />
              {errors.confirmPassword && (
                <span className={cx('error-text')}>{errors.confirmPassword}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={cx('submit-btn', { loading: isSubmitting })}
            >
              {isSubmitting ? (
                <>
                  <span className={cx('spinner')}></span>
                  Đang đăng ký...
                </>
              ) : (
                <>
                  ✨ Đăng ký tài khoản
                </>
              )}
            </button>
          </form>

          <div className={cx('footer')}>
            <p>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => navigate(config.routes.login)}
                className={cx('register-link')}
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>

          <div className={cx('info-section')}>
            <div className={cx('alert', 'info')}>
              <span className={cx('alert-icon')}>ℹ️</span>
              <div className={cx('alert-content')}>
                <strong>Lưu ý:</strong>
                <p>Tài khoản mới cần được admin phê duyệt trước khi có thể sử dụng.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;