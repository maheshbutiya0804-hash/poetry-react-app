import { createBrowserRouter } from 'react-router-dom'
import { SiteLayout } from './components/layout/SiteLayout'
import { HomePage, AboutPage, LoveInActionPage, MonthlyChallengesPage, ScavengerHuntPage, FaqPage } from './pages/site/StaticPages'
import { CollectionPage, LoveNoteDetailPage, LoveNotesPage } from './pages/site/LoveNotesPages'
import { ForgotPasswordPage, LoginPage, RegisterPage } from './pages/auth/AuthPages'
import { AdminLayout } from './admin/components/AdminLayout'
import { OverviewPage } from './admin/pages/OverviewPage'
import { CardsPage } from './admin/pages/CardsPage'
import { CreateCardPage } from './admin/pages/CreateCardPage'
import { UsersPage } from './admin/pages/UsersPage'
import { SubscriptionsPage } from './admin/pages/SubscriptionsPage'
import { UserDetailPage } from './admin/pages/UserDetailPage'
import { ChallengesPage } from './admin/pages/ChallengesPage'
import { CreateChallengePage } from './admin/pages/CreateChallengePage'
import { RequestsPage } from './admin/pages/RequestsPage'
import { OrdersPage } from './admin/pages/OrdersPage'
import { OrderDetailPage } from './admin/pages/OrderDetailPage'
import { NotificationsPage } from './admin/pages/NotificationsPage'
import { CommunityPage } from './admin/pages/CommunityPage'
import { SettingsPage } from './admin/pages/SettingsPage'
import { CollectionsPage } from './admin/pages/CollectionsPage'
import { CategoriesPage } from './admin/pages/CategoriesPage'
import { RequireAdmin } from './auth/RequireAdmin'
import { GuestOnly, RequireAuth } from './auth/RequireAuth'
import { ProfilePage } from './pages/user/ProfilePage'
import { UserOrdersPage } from './pages/user/OrdersPage'
import { SubscriptionCancelledPage, SubscriptionSuccessPage } from './pages/site/SubscriptionResultPages'

export const router = createBrowserRouter([
 {element:<SiteLayout/>,children:[{path:'/',element:<HomePage/>},{path:'/about',element:<AboutPage/>},{path:'/love-in-action',element:<LoveInActionPage/>},{path:'/faq',element:<FaqPage/>},{path:'/monthly-challenges',element:<MonthlyChallengesPage/>},{path:'/scavenger-hunt',element:<ScavengerHuntPage/>},{path:'/love-notes',element:<LoveNotesPage/>},{path:'/love-notes/:collectionId',element:<CollectionPage/>},{path:'/love-notes/:collectionId/:cardId',element:<LoveNoteDetailPage/>},{path:'/cards/:cardId',element:<LoveNoteDetailPage/>},{path:'/profile',element:<RequireAuth><ProfilePage/></RequireAuth>},{path:'/orders',element:<RequireAuth><UserOrdersPage/></RequireAuth>},{path:'/subscription/success',element:<SubscriptionSuccessPage/>},{path:'/subscription/cancelled',element:<SubscriptionCancelledPage/>}]},
 {path:'/login',element:<GuestOnly><LoginPage/></GuestOnly>},{path:'/register',element:<GuestOnly><RegisterPage/></GuestOnly>},{path:'/forgot-password',element:<ForgotPasswordPage/>},
 {path:'/admin',element:<RequireAdmin><AdminLayout/></RequireAdmin>,children:[{index:true,element:<OverviewPage/>},{path:'cards',element:<CardsPage/>},{path:'cards/new',element:<CreateCardPage/>},{path:'cards/:cardId/edit',element:<CreateCardPage/>},{path:'collections',element:<CollectionsPage/>},{path:'categories',element:<CategoriesPage/>},{path:'users',element:<UsersPage/>},{path:'users/:userId',element:<UserDetailPage/>},{path:'subscriptions',element:<SubscriptionsPage/>},{path:'requests',element:<RequestsPage/>},{path:'challenges',element:<ChallengesPage/>},{path:'challenges/create',element:<CreateChallengePage/>},{path:'orders',element:<OrdersPage/>},{path:'orders/:orderId',element:<OrderDetailPage/>},{path:'notifications',element:<NotificationsPage/>},{path:'community',element:<CommunityPage/>},{path:'settings',element:<SettingsPage/>}]}
])
