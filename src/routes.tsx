import { createBrowserRouter } from 'react-router-dom'
import { SiteLayout } from './components/layout/SiteLayout'
import { HomePage, AboutPage, LoveInActionPage, MonthlyChallengesPage, ScavengerHuntPage, FaqPage } from './pages/site/StaticPages'
import { CollectionPage, LoveNoteDetailPage, LoveNotesPage } from './pages/site/LoveNotesPages'
import { LoveNoteAdminPage } from './pages/admin/LoveNoteAdminPage'

export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/love-in-action', element: <LoveInActionPage /> },
      { path: '/faq', element: <FaqPage /> },
      { path: '/monthly-challenges', element: <MonthlyChallengesPage /> },
      { path: '/scavenger-hunt', element: <ScavengerHuntPage /> },
      { path: '/love-notes', element: <LoveNotesPage /> },
      { path: '/love-notes/:collectionId', element: <CollectionPage /> },
      { path: '/love-notes/:collectionId/:cardId', element: <LoveNoteDetailPage /> },
    ],
  },
  { path: '/admin/love-notes', element: <LoveNoteAdminPage /> },
])
