// components/Button/Button.js
import React from 'react';
import classNames from 'classnames/bind';
import styles from './Button.module.scss';

const cx = classNames.bind(styles);

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className,
  ...props
}) => {
  const buttonClasses = cx('button', {
    [`button--${variant}`]: variant,
    [`button--${size}`]: size,
    'button--disabled': disabled,
    'button--loading': loading,
    'button--full-width': fullWidth,
    'button--icon-only': icon && !children,
    [`button--icon-${iconPosition}`]: icon && children
  }, className);

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className={cx('button__spinner')}>
          <i className="fas fa-spinner fa-spin"></i>
        </span>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className={cx('button__icon', 'button__icon--left')}>
          <i className={icon}></i>
        </span>
      )}
      
      {children && (
        <span className={cx('button__text')}>
          {children}
        </span>
      )}
      
      {icon && iconPosition === 'right' && !loading && (
        <span className={cx('button__icon', 'button__icon--right')}>
          <i className={icon}></i>
        </span>
      )}
    </button>
  );
};

export default Button;