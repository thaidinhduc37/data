// components/Input/Input.js
import React, { useState, forwardRef } from 'react';
import classNames from 'classnames/bind';
import styles from './Input.module.scss';

const cx = classNames.bind(styles);

const Input = forwardRef(({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  disabled = false,
  required = false,
  fullWidth = false,
  size = 'medium',
  variant = 'outlined',
  icon,
  iconPosition = 'left',
  showPasswordToggle = false,
  className,
  id,
  name,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasValue = value && value.length > 0;
  const inputType = (type === 'password' && showPassword) ? 'text' : type;
  
  const wrapperClasses = cx('input-wrapper', {
    [`input-wrapper--${variant}`]: variant !== 'outlined',
    [`input-wrapper--${size}`]: size !== 'medium',
    'input-wrapper--focused': focused,
    'input-wrapper--error': error,
    'input-wrapper--disabled': disabled,
    'input-wrapper--full-width': fullWidth,
    'input-wrapper--has-value': hasValue,
    'input-wrapper--with-icon': icon,
    [`input-wrapper--icon-${iconPosition}`]: icon
  }, className);

  const handleFocus = (e) => {
    setFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur && onBlur(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={inputId} className={cx('input-label')}>
          {label}
          {required && <span className={cx('input-required')}>*</span>}
        </label>
      )}
      
      <div className={cx('input-container')}>
        {icon && iconPosition === 'left' && (
          <div className={cx('input-icon', 'input-icon--left')}>
            <i className={icon}></i>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={inputType}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className={cx('input-field')}
          {...props}
        />
        
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            className={cx('input-password-toggle')}
            onClick={togglePasswordVisibility}
            disabled={disabled}
          >
            <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
          </button>
        )}
        
        {icon && iconPosition === 'right' && (
          <div className={cx('input-icon', 'input-icon--right')}>
            <i className={icon}></i>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div className={cx('input-helper')}>
          {error ? (
            <span className={cx('input-error')}>
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </span>
          ) : (
            <span className={cx('input-helper-text')}>
              {helperText}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Textarea component
const Textarea = forwardRef(({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  disabled = false,
  required = false,
  fullWidth = false,
  rows = 4,
  resize = 'vertical',
  className,
  id,
  name,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  
  const textareaId = id || name || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const hasValue = value && value.length > 0;
  
  const wrapperClasses = cx('textarea-wrapper', {
    'textarea-wrapper--focused': focused,
    'textarea-wrapper--error': error,
    'textarea-wrapper--disabled': disabled,
    'textarea-wrapper--full-width': fullWidth,
    'textarea-wrapper--has-value': hasValue,
    [`textarea-wrapper--resize-${resize}`]: resize !== 'vertical'
  }, className);

  const handleFocus = (e) => {
    setFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur && onBlur(e);
  };

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={textareaId} className={cx('textarea-label')}>
          {label}
          {required && <span className={cx('textarea-required')}>*</span>}
        </label>
      )}
      
      <div className={cx('textarea-container')}>
        <textarea
          ref={ref}
          id={textareaId}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          rows={rows}
          className={cx('textarea-field')}
          {...props}
        />
      </div>
      
      {(error || helperText) && (
        <div className={cx('textarea-helper')}>
          {error ? (
            <span className={cx('textarea-error')}>
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </span>
          ) : (
            <span className={cx('textarea-helper-text')}>
              {helperText}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Select component
const Select = forwardRef(({
  label,
  placeholder = 'Chọn một tùy chọn...',
  value,
  onChange,
  options = [],
  error,
  helperText,
  disabled = false,
  required = false,
  fullWidth = false,
  className,
  id,
  name,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  
  const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasValue = value && value.length > 0;
  
  const wrapperClasses = cx('select-wrapper', {
    'select-wrapper--focused': focused,
    'select-wrapper--error': error,
    'select-wrapper--disabled': disabled,
    'select-wrapper--full-width': fullWidth,
    'select-wrapper--has-value': hasValue
  }, className);

  const handleFocus = (e) => {
    setFocused(true);
  };

  const handleBlur = (e) => {
    setFocused(false);
  };

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={selectId} className={cx('select-label')}>
          {label}
          {required && <span className={cx('select-required')}>*</span>}
        </label>
      )}
      
      <div className={cx('select-container')}>
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className={cx('select-field')}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className={cx('select-arrow')}>
          <i className="fas fa-chevron-down"></i>
        </div>
      </div>
      
      {(error || helperText) && (
        <div className={cx('select-helper')}>
          {error ? (
            <span className={cx('select-error')}>
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </span>
          ) : (
            <span className={cx('select-helper-text')}>
              {helperText}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

Input.Textarea = Textarea;
Input.Select = Select;

export default Input;