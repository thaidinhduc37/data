// routes/index.js - Router Configuration
import config from '../config';

// Import page components
// Main pages (public)
import Home from '../pages/Home/Home.js';
import Blogs from '../pages/Blogs/Blogs.js';
import Contact from '../pages/Contact/Contact.js';
import About from '../pages/About/About.js';

// Authentication
import Login from '../pages/Auth/Login.js';
import Register from '../pages/Auth/Register.js';

// Posts management (private - cần admin access)
import Posts from '../pages/Posts/Posts.js';
import PostsCreate from '../pages/Posts/PostsCreate.js';
import PostsEdit from '../pages/Posts/PostsEdit.js';
import PostsView from '../pages/Posts/PostsView.js';

// Admin/Management
import Dashboard from '../pages/Home/Dashboard.js';
import Collections from '../pages/Private/Collections.js';
import CollectionsView from '../pages/Private/CollectionsView.js';
import Settings from '../pages/Private/Settings.js';
import Profile from '../pages/Private/Profile.js';

// Public routes - không cần đăng nhập
const publicRoutes = [
  { path: config.routes.home, component: Home },
  
  
  { path: config.routes.login, component: Login },
  
];

// Private routes - cần đăng nhập
const privateRoutes = [
  { path: config.routes.dashboard, component: Dashboard },
  { path: config.routes.blogs, component: Blogs },
  { path: config.routes.contact, component: Contact },
  { path: config.routes.about, component: About },
  { path: config.routes.register, component: Register },
  
  // Posts management (chỉ admin)
  { path: config.routes.posts, component: Posts },
  { path: config.routes.postsCreate, component: PostsCreate },
  { path: config.routes.postsEdit, component: PostsEdit },
  { path: config.routes.postsView, component: PostsView },
  
  // Collections management
  { path: config.routes.collections, component: Collections },
  { path: config.routes.collectionsView, component: CollectionsView },
  
  // Settings
  { path: config.routes.settings, component: Settings },
  { path: config.routes.profile, component: Profile },
];

export { publicRoutes, privateRoutes };