# SpoKeeper — Frontend (React + FastAPI 서빙 담당)

스포일러 없이 읽는 리딩 컴패니언. 사용자가 읽은 경계선까지의 정보만 보여준다.
계약(`graph_json`·`reminders`) 소비 전용 — FE는 계약이 이미 스포일러 안전하다고 신뢰한다.

## 스택
React 19 + TS · Vite · TanStack Query · Zustand · Tailwind v4 · React Router · MSW

## 실행

Node.js 22.22 이상이 필요합니다.

```bash
npm install
npm run dev        # mock 모드 (VITE_USE_MOCK=true, 기본)
npm run build      # 타입체크 + 프로덕션 번들
```

## 화면과 데이터

- `/`에서 읽기의 재미 UI를 시작합니다. 서재(`/library`)에서 EPUB을 선택하거나 움직이는 글 체험을 열 수 있습니다.
- `/library/rain`에서 마을과 같은 상단 상태 표시줄·하단 탭을 유지한 채 움직이는 글과 문장 단서 수집을 사용합니다. `/epub`은 EPUB 리더, `/?experience=motion`은 기존 단독 체험 주소입니다.
- 새 UI의 텍스트 서재, 메모, 퀴즈, 캐릭터는 브라우저의 데모 데이터를 사용합니다.

## EPUB mock ↔ 실서버 스위치
- `.env`의 `VITE_USE_MOCK=true` → MOCKS.md 픽스처 사용 (BE 없이 개발).
- `VITE_USE_MOCK=false` → `/api`를 FastAPI(:8000)로 프록시 (vite.config.ts).
  ```bash
  VITE_USE_MOCK=false npm run dev   # backend uvicorn 먼저 실행
  ```

## 구조
```
src/
  api/        types(계약) · mock(픽스처) · client(mock↔실서버) · hooks(Query)
  components/ Header · ReaderView · Footer · SlideOverPanel
              · RelationshipPanel/Graph/List · ReminderPanel · SettingsPanel
  lib/        mergeEdges((source,label) 병합) · constants(청크경계)
  store.ts    Zustand (spoilerSafe/panel/offset/boundary)
```

## 데모 상태 (offset별 관계도)
- `offset 150` → 빈 그래프 (읽은 청크 없음)
- `offset 215` → c1: 개체3·관계2
- `offset 380` → c1+c2+c3: 개체5·관계5 (윤 팀장 — 압박 조사 — 민우/서현 병합)
