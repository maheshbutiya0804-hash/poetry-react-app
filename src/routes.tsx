import { createBrowserRouter } from 'react-router-dom'
import { AppShell, AdminShell } from './components/app/AppShell'
import LandingPage from './pages/LandingPage'
import * as U from './pages/user/Pages'
import * as A from './pages/admin/Pages'

export const router = createBrowserRouter([
  { element: <AppShell />, children: [
    { path: '/', element: <LandingPage /> },
    { path: '/landing-secondary', element: <U.LandingSecondaryPage /> },
    { path: '/search', element: <U.SearchPage /> },
    { path: '/categories', element: <U.CategoriesPage /> },
    { path: '/category/:slug', element: <U.CategoryPage /> },
    { path: '/sign-up', element: <U.SignUpPage /> }, { path: '/sign-in', element: <U.SignInPage /> },
    { path: '/change-password', element: <U.ChangePasswordPage /> }, { path: '/reset-password', element: <U.ResetPasswordPage /> },
    { path: '/dashboard', element: <U.DashboardPage /> },
    { path: '/card/:id/front', element: <U.CardFrontPage /> }, { path: '/card/:id/back', element: <U.CardBackPage /> },
    { path: '/card/:id/front-locked', element: <U.CardFrontLockedPage /> }, { path: '/card/:id/back-locked', element: <U.CardBackLockedPage /> },
    { path: '/card/:id/order', element: <U.OrderCardPage /> }, { path: '/library', element: <U.LibraryPage /> },
    { path: '/profile', element: <U.ProfilePage /> }, { path: '/forum', element: <U.ForumPage /> },
    { path: '/forum/new', element: <U.AddForumPostPage /> }, { path: '/forum/post/:id', element: <U.ForumPostPage /> },
    { path: '/poetry-requests', element: <U.PoetryRequestsPage /> }, { path: '/poetry-requests/new', element: <U.AddPoetryRequestPage /> },
    { path: '/poetry-requests/:id', element: <U.PoetryRequestDetailPage /> }, { path: '/orders', element: <U.OrdersPage /> },
    { path: '/orders/:id', element: <U.OrderDetailPage /> }
  ]},
  { path: '/admin', element: <AdminShell />, children: [
    { index: true, element: <A.AdminDashboard /> }, { path: 'cards', element: <A.AdminCards /> },
    { path: 'cards/new', element: <A.AdminCreateCard /> }, { path: 'cards/new/back', element: <A.AdminCreateCardBack /> },
    { path: 'cards/bulk-upload', element: <A.AdminBulkUpload /> }, { path: 'cards/bulk-upload/review', element: <A.AdminBulkUploadReview /> },
    { path: 'users', element: <A.AdminUsers /> }, { path: 'subscriptions', element: <A.AdminSubscriptions /> },
    { path: 'poetry-requests', element: <A.AdminPoetryRequests /> }, { path: 'poetry-requests/:id', element: <A.AdminPoetryRequestDetail /> },
    { path: 'orders', element: <A.AdminOrders /> }, { path: 'orders/:id', element: <A.AdminOrderDetail /> },
    { path: 'notifications', element: <A.AdminNotifications /> }, { path: 'community', element: <A.AdminCommunity /> },
    { path: 'community/:id', element: <A.AdminCommunityReview /> }, { path: 'settings', element: <A.AdminSettings /> }
  ]}
])
