# 움직이는 글과 장면 퀴즈

실행: `npm ci`, `npm run dev`, `http://127.0.0.1:5173/?experience=motion`.
DB/API 키 없이 실행한다. 기존 EPUB 화면은 `/?`에 유지한다.

## 체험

1. 자동 모션을 켜면 화면의 문단을 차례로 한 번 움직인다. 페이지는 직접 넘긴다.
2. 단편 중 네 지점에 객관식 장면 놀이가 있다. 해당 화면의 ‘여기까지 읽었어요’를 누른 뒤 ‘잠깐 놀기’를 선택한다. 다른 화면을 확인한 것으로는 열리지 않는다.
3. 오답은 퀴즈 시각 영역의 균열·글자 낙하·우는 표정으로 반응한다. 약 1.8초 뒤 복원되며 감점은 없다. 재선택, 근거 확인, 건너뛰기가 가능하다.
4. 정답은 작은 글자 점프로 반응한다. 문제는 원문에 명시된 사실만 다루며 동기·문학 해석을 채점하지 않는다.
5. 효과 체크를 끄거나 기기 동작 줄이기/리더의 밑줄 모드를 사용하면 정적인 피드백을 표시한다. 원문·선택지·다음 페이지 버튼은 떨어뜨리지 않는다.

문항과 근거는 `src/motion-reader/quizzes.ts`에서 검수한 고정 데이터다. AI 자동 생성은 아니다. 현재 확인 상태는 브라우저 로컬 실험용이며 서버 권한 경계의 구현은 아니다.

## 기술 조사와 선택 (2026-11-17)

| 후보 | 소스/라이선스 확인 | 판단 |
|---|---|---|
| [Motion](https://github.com/motiondivision/motion) | MIT. 현재 설치 14.14.0. mini의 animate-elements와 WAAPI 제어 소스 확인 | 기존 의존성을 사용. 글자별 transform·중단·정리에 적합 |
| [Matter.js](https://github.com/liabru/matter-js) | MIT. Engine.js의 시간 업데이트·중력·충돌 처리 확인 | 실제 글자 간 충돌에는 유용하지만 짧게 떨어지고 돌아오는 연출에 물리 시뮬레이션은 불필요. 설치/복사 안 함 |
| [canvas-confetti](https://github.com/catdad/canvas-confetti) | ISC. confetti.js의 canvas/RAF/worker 처리 확인 | 종이 조각 효과에 적합하지만 글자와 퀴즈 카드의 반응에는 기존 Motion으로 충분. 설치/복사 안 함 |

균열 SVG와 표정·눈물 CSS는 직접 작성했다. Motion 외 후보 앱을 실행한 것은 아니다. 유료 API·새 실행 의존성 추가는 없다. Playwright는 개발용 테스트 의존성으로 추가했다.

## 검증 명령

```powershell
npm run build
npm run lint
node --test scripts/motion-reader.test.cjs
npx playwright test
```

Playwright는 설치된 Chrome의 별도 임시 프로필을 headless로 사용한다. 개인 Chrome 탭이나 로그인 프로필을 제어하지 않는다. 결과 그림은 `test-results/quiz-desktop.png`, `test-results/quiz-mobile.png`에 저장한다.

수동 확인: 아직 확인하지 않은 문제는 안 보여야 한다. 틀려도 원문과 현재 위치가 같아야 한다. 효과 도중 다음을 누르면 다음 화면에 낙하가 남으면 안 된다. 퀴즈를 건너뛰어도 마지막까지 읽을 수 있어야 한다.

2026-11-17 실행 결과: TypeScript/Vite 빌드와 oxlint 통과. 원문 보존·설정 복원·문항 근거/읽음 경계·재생 순서/중단·동작 줄이기 단위 테스트 6개 통과. 실제 headless Chrome E2E 3개 통과(오답→복원→정답과 근거 확인, 모바일 동작 줄이기/건너뛰기, 낙하 중 다음 화면 이동). 데스크톱/모바일 캡처를 열어 겹침과 가로 넘침을 확인했다. 이 결과는 재미·집중 향상의 사용자 평가를 대신하지 않는다. 기존 앱의 큰 기본 번들 경고는 남아 있다.
