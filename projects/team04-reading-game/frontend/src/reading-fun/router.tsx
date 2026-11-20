/**
 * 라우트 표: IA 문서 "라우트 표 (Vite + React SPA)" 기준.
 * 페이지 단위는 라우트, 팝업·시트는 페이지 내부 상태.
 */
import { createBrowserRouter } from 'react-router'
import { lazy, Suspense } from 'react'
import { FullscreenLayout } from '@/layouts/FullscreenLayout'
import { OnboardingGuard } from '@/layouts/OnboardingGuard'
import { TabLayout } from '@/layouts/TabLayout'
import { ExploreDetailPage } from '@/pages/explore/ExploreDetailPage'
import { ExplorePage } from '@/pages/explore/ExplorePage'
import { GraphPage } from '@/pages/graph/GraphPage'
import { LibraryPage } from '@/pages/library/LibraryPage'
import { MyPage } from '@/pages/my/MyPage'
import { MySettingsPage } from '@/pages/my/MySettingsPage'
import { MyCharactersPage, MyDataPage, MyInterestsPage } from '@/pages/my/MySubPages'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { NoteDetailPage } from '@/pages/notes/NoteDetailPage'
import { NotesPage } from '@/pages/notes/NotesPage'
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage'
import { QuizPage } from '@/pages/quiz/QuizPage'
import { ReaderPage } from '@/pages/reader/ReaderPage'
import { VillagePage } from '@/pages/village/VillagePage'

const MotionReader = lazy(() => import('../motion-reader/MotionReader'))

export const router = createBrowserRouter([
  {
    element: <FullscreenLayout />,
    children: [{ path: '/onboarding', element: <OnboardingPage /> }],
  },
  {
    element: <OnboardingGuard />,
    children: [
      {
        // 탭바 노출
        element: <TabLayout />,
        children: [
          { path: '/', element: <VillagePage /> },
          { path: '/library', element: <LibraryPage /> },
          { path: '/library/rain', element: <Suspense fallback={<p role="status">원문을 불러오는 중…</p>}><MotionReader embedded /></Suspense> },
          { path: '/explore', element: <ExplorePage /> },
          { path: '/explore/:characterId', element: <ExploreDetailPage /> },
          { path: '/my', element: <MyPage /> },
          { path: '/my/characters', element: <MyCharactersPage /> },
          { path: '/my/interests', element: <MyInterestsPage /> },
          { path: '/my/settings', element: <MySettingsPage /> },
          { path: '/my/data', element: <MyDataPage /> },
        ],
      },
      {
        // 탭바 숨김
        path: '/library/:bookId',
        element: <FullscreenLayout />,
        children: [
          { path: 'read', element: <ReaderPage /> },
          { path: 'graph', element: <GraphPage /> },
          { path: 'quiz', element: <QuizPage /> },
          { path: 'notes', element: <NotesPage /> },
          { path: 'notes/:noteId', element: <NoteDetailPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
