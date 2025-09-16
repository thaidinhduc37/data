import routes from './routes.js'
const config = {
routes,
  directus: {
    url: process.env.REACT_APP_DIRECTUS_URL || 'https://data.o.io',
    apiUrl: process.env.REACT_APP_DIRECTUS_API_URL || 'https://data.o.io',
    email: process.env.REACT_APP_DIRECTUS_EMAIL || '',
    password: process.env.REACT_APP_DIRECTUS_PASSWORD || ''
  },
  app: {
    name: process.env.REACT_APP_APP_NAME || 'Hệ thông quản lý dữ liệu dùng chung',
    version: process.env.REACT_APP_APP_VERSION || '1.0.0'
  },
  dev: {
    debug: process.env.REACT_APP_DEBUG === 'true' || process.env.NODE_ENV === 'development'
  }
};

// Helper functions
export const getCredentials = () => ({
  email: config.directus.email,
  password: config.directus.password
});

export const validateConfig = () => {
  const errors = [];
  if (!config.directus.url) {
    errors.push('REACT_APP_DIRECTUS_URL is required');
  }
  return errors.length === 0;
};

export default config;