// routes/index.js - Router Configuration
import config from '../config';

// Import page components
// Main pages (public)
import Home from '../pages/Home/Home.js';
import Blogs from '../pages/Blogs/Blogs.js';
import Contact from '../pages/Contact/Contact.js';
import Address from '../pages/Address/Address.js';

// Authentication
import Login from '../pages/Auth/Login.js';
import Register from '../pages/Auth/Register.js';

// Posts management (private - cần admin access)
import Posts from '../pages/Posts/Posts.js';
import PostsCreate from '../pages/Posts/PostsCreate.js';
import PostsEdit from '../pages/Posts/PostsEdit.js';
import PostsView from '../pages/Posts/PostsView.js';

import DashboardDenounce from '../pages/Denounce/DashboardDenounce.js';
import ProcessingDenounce from '../pages/Denounce/ProcessingDenounce.js';
import ReceptionDenounce from '../pages/Denounce/ReceptionDenounce.js';
import ReportsDenounce from '../pages/Denounce/ReportsDenounce.js';
import TrackingDenounce from '../pages/Denounce/TrackingDenounce.js';


import Schedule from '../pages/Schedule/Schedule.js';
import TimeOff from '../pages/Schedule/TimeOff.js';
import Plans from '../pages/Schedule/Plans.js';
import Guard from '../pages/Schedule/Guard.js';

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
  { path: config.routes.address, component: Address },
  { path: config.routes.register, component: Register },
  
  // Posts management (chỉ admin)
  { path: config.routes.posts, component: Posts },
  { path: config.routes.postsCreate, component: PostsCreate },
  { path: config.routes.postsEdit, component: PostsEdit },
  { path: config.routes.postsView, component: PostsView },

  // Schedule denounce
  { path: config.routes.dashboarddenounce, component: DashboardDenounce },
  { path: config.routes.processingdenounce, component: ProcessingDenounce },
  { path: config.routes.receptiondenounce, component: ReceptionDenounce },
  { path: config.routes.reportsdenounce, component: ReportsDenounce },
  { path: config.routes.trackingdenounce, component: TrackingDenounce },



 // Schedule management
  { path: config.routes.schedule, component: Schedule },
  { path: config.routes.timeoff, component: TimeOff },
  { path: config.routes.plans, component: Plans },
  {path: config.routes.guard, component: Guard },
  
  // Collections management
  { path: config.routes.collections, component: Collections },
  { path: config.routes.collectionsView, component: CollectionsView },
  
  // Settings
  { path: config.routes.settings, component: Settings },
  { path: config.routes.profile, component: Profile },
];

export { publicRoutes, privateRoutes };