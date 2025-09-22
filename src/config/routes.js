// config/routes.js - Routes Configuration
const routes = {
  // Main pages - theo Directus structure
  home: '/',
  dashboard: '/trang-chu',
  blogs: '/blogs',
  contact: '/contact',
  address: '/address',
  posts: '/posts',
  
  // Posts management (có sub-routes)
  posts: '/posts',
  postsCreate: '/posts/create',
  postsEdit: '/posts/:id/edit',
  postsView: '/posts/:id',

  // Posts management (có sub-routes)
  schedule: '/schedule',
  timeoff: '/schedule/timeoff',
  plan: '/schedule/plan',
  guard: '/schedule/guard',
 
  
  // Authentication
  login: '/login',
  register: '/register',
  logout: '/logout',
  
  // Admin/Management
  dashboard: '/dashboard',
  collections: '/collections',
  collectionsView: '/collections/:collection',
  
  // Settings
  settings: '/settings',
  profile: '/profile',
};

export default routes;