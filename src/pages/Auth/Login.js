// pages/Auth/Login.js - Login Page
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import { useAuth } from '../../hooks';
import config from '../../config';
import styles from './Auth.module.scss';

const cx = classNames.bind(styles);

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn, isLoading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      const redirectTo = location.state?.from?.pathname || config.routes.dashboard;
      navigate(redirectTo, { replace: true });
    }
  }, [isLoggedIn, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Redirect after successful login
      const redirectTo = location.state?.from?.pathname || config.routes.dashboard;
      navigate(redirectTo, { replace: true });
    }
  };



  return (
    <div className={cx('login')}>
      <div className={cx('container')}>
        <div className={cx('login-card')}>
          <div className={cx('header')}>
            <div className={cx('logo')}>
              🚀 {config.app.name}
            </div>
            <h1 className={cx('title')}>Đăng nhập</h1>
            <p className={cx('subtitle')}>
              Chào mừng trở lại! Vui lòng đăng nhập vào tài khoản của bạn.
            </p>
          </div>

          {error && (
            <div className={cx('alert', 'error')}>
              <span className={cx('alert-icon')}>❌</span>
              <div className={cx('alert-content')}>
                <strong>Đăng nhập thất bại!</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className={cx('form')}>
            <div className={cx('form-group')}>
              <label htmlFor="email" className={cx('label')}>
                📧 Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={cx('input')}
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </div>

            <div className={cx('form-group')}>
              <label htmlFor="password" className={cx('label')}>
                🔒 Mật khẩu
              </label>
              <div className={cx('password-input')}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={cx('input')}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cx('password-toggle')}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className={cx('form-options')}>
              <label className={cx('checkbox')}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className={cx('checkmark')}></span>
                Ghi nhớ đăng nhập
              </label>

              <button type="button" className={cx('forgot-link')}>
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cx('submit-btn', { loading: isLoading })}
            >
              {isLoading ? (
                <>
                  <span className={cx('spinner')}></span>
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  🔑 Đăng nhập
                </>
              )}
            </button>
          </form>

          <div className={cx('divider')}>
            <span>hoặc</span>
          </div>

          <div className={cx('demo-section')}>
            <p className={cx('demo-text')}>
              Chưa có tài khoản? Vui lòng đăng ký hoặc liên hệ admin để được cấp quyền truy cập.
            </p>
          </div>

          <div className={cx('footer')}>
            <p>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => navigate(config.routes.register)}
                className={cx('register-link')}
              >
                Đăng ký ngay
              </button>
            </p>
          </div>

          <div className={cx('user-types')}>
            <h3 className={cx('user-types-title')}>👥 Phân quyền người dùng:</h3>
            <div className={cx('user-type-cards')}>
              <div className={cx('user-type-card')}>
                <div className={cx('user-type-icon')}>👑</div>
                <h4>Admin</h4>
                <p>Toàn quyền quản lý hệ thống</p>
              </div>
              <div className={cx('user-type-card')}>
                <div className={cx('user-type-icon')}>✍️</div>
                <h4>Editor</h4>
                <p>Quản lý nội dung và bài viết</p>
              </div>
              <div className={cx('user-type-card')}>
                <div className={cx('user-type-icon')}>👤</div>
                <h4>User</h4>
                <p>Xem và tương tác nội dung</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;