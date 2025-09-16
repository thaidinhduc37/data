// components/Card/Card.js
import React from 'react';
import classNames from 'classnames/bind';
import styles from './Card.module.scss';

const cx = classNames.bind(styles);

const Card = ({
  children,
  title,
  subtitle,
  icon,
  variant = 'default',
  padding = 'normal',
  hoverable = false,
  clickable = false,
  loading = false,
  className,
  headerActions,
  footer,
  onClick,
  ...props
}) => {
  const cardClasses = cx('card', {
    [`card--${variant}`]: variant !== 'default',
    [`card--${padding}`]: padding !== 'normal',
    'card--hoverable': hoverable,
    'card--clickable': clickable,
    'card--loading': loading
  }, className);

  const hasHeader = title || subtitle || icon || headerActions;

  return (
    <div
      className={cardClasses}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {loading && (
        <div className={cx('card__loading')}>
          <div className={cx('card__spinner')}>
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        </div>
      )}

      {hasHeader && (
        <div className={cx('card__header')}>
          <div className={cx('card__header-content')}>
            {icon && (
              <div className={cx('card__icon')}>
                <i className={icon}></i>
              </div>
            )}
            <div className={cx('card__title-group')}>
              {title && (
                <h3 className={cx('card__title')}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className={cx('card__subtitle')}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {headerActions && (
            <div className={cx('card__actions')}>
              {headerActions}
            </div>
          )}
        </div>
      )}

      <div className={cx('card__content')}>
        {children}
      </div>

      {footer && (
        <div className={cx('card__footer')}>
          {footer}
        </div>
      )}
    </div>
  );
};

// Card variants
const StatCard = ({ 
  value, 
  label, 
  icon, 
  trend, 
  trendType = 'neutral',
  color = 'blue',
  ...props 
}) => (
  <Card
    variant="stat"
    className={cx(`card--stat-${color}`)}
    {...props}
  >
    <div className={cx('stat-card')}>
      {icon && (
        <div className={cx('stat-card__icon', `stat-card__icon--${color}`)}>
          <i className={icon}></i>
        </div>
      )}
      
      <div className={cx('stat-card__content')}>
        <div className={cx('stat-card__value')}>
          {value}
        </div>
        <div className={cx('stat-card__label')}>
          {label}
        </div>
        
        {trend && (
          <div className={cx('stat-card__trend', `stat-card__trend--${trendType}`)}>
            <i className={`fas fa-arrow-${trendType === 'positive' ? 'up' : trendType === 'negative' ? 'down' : 'right'}`}></i>
            {trend}
          </div>
        )}
      </div>
    </div>
  </Card>
);

Card.Stat = StatCard;

export default Card;