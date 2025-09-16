// pages/Home/Home.js - Simple Home Page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import { useAuth } from '../../hooks';
import config from '../../config';
import styles from './Home.module.scss';
import images from '../../assets/images';

const cx = classNames.bind(styles);

function Home() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(loginForm.email, loginForm.password);
    if (result.success) {
      navigate(config.routes.dashboard);
    }
  };

  return (
    <div 
      className={cx('home')}
      style={{
        backgroundImage: `url(${images.trongdong})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '1500px 1500px',
        backgroundPosition: 'center',
        backgroundColor: '#fd0000ff',
      }}
    >
       <link 
                rel="stylesheet" 
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            />
      {/* Header với Logo */}
      <div className={cx('header-section')}>
        <div className={cx('container')}>
          <div className={cx('logo-section')}>
            <div className={cx('national-emblem')}>
              <img src={images.cand} alt="Công an hiệu" className={cx('emblem-img')} />
            </div>
            <div className={cx('title-group')}>
              <div className={cx('subtitle')}>BỘ CÔNG AN</div>
              <div className={cx('motto')}>CÔNG AN TỈNH ĐẮK LẮK</div>
              <h2 className={cx('main-title')}>
                Hệ thống quản lý dữ liệu dùng chung
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Form đăng nhập */}
      <div className={cx('login-section')}>
        <div className={cx('login-card')}>
          <h2>Đăng nhập hệ thống</h2>
          
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
                <i class="fa-regular fa-envelope"></i> Tài khoản
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={loginForm.email}
                onChange={handleChange}
                className={cx('input')}
                placeholder="Nhập email đăng nhập"
                required
              />
            </div>

            <div className={cx('form-group')}>
              <label htmlFor="password" className={cx('label')}>
                <i class="fa-solid fa-lock"></i> Mật khẩu
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginForm.password}
                onChange={handleChange}
                className={cx('input')}
                placeholder="Nhập mật khẩu"
                required
              />
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
                <span className={cx('login')}>
                  <i class="fa-solid fa-arrow-right-to-bracket"></i> Đăng nhập
                  </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;