import { ProgressFooter } from './components/ProgressFooter';
import { ReaderLayout } from './components/ReaderLayout';
import { TopBar } from './components/TopBar';

const MotionReader = lazy(() => import('./motion-reader/MotionReader'));

export default function App() {
  if (new URLSearchParams(window.location.search).get('experience') === 'motion') {
    return <Suspense fallback={<p role="status">읽을 문장을 준비하고 있어요.</p>}><MotionReader /></Suspense>;
  }
  return <LegacyReader />;
}

function LegacyReader() {
  return (
    <div className="grid h-full grid-rows-[60px_minmax(0,1fr)_48px] bg-[#f2f1ec] text-[#20231f]">
      <a href="?experience=motion" className="fixed bottom-16 right-4 z-50 rounded-full bg-[#263e36] px-4 py-3 text-sm text-white shadow-lg">✦ 움직이는 글 읽어보기</a>
      <a href="/library" className="fixed bottom-16 left-4 z-50 rounded-full bg-[#263e36] px-4 py-3 text-sm text-white shadow-lg">서재로 돌아가기</a>
      <TopBar />
      <ReaderLayout />
      <ProgressFooter />
    </div>
  );
}
import { lazy, Suspense } from 'react';
