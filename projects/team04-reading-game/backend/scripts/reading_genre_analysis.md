# 장르별 AI 분석 실행 안내

책을 등록하면 FastAPI가 DB에 원문과 분석 작업을 저장한다. 별도 워커가 작업을 가져와 OpenAI로 분석하고, 결과가 검증되면 DB에 저장한다. React는 사용자가 읽음으로 확정한 범위의 결과를 표시한다. 워커가 분석하는 동안 본문을 읽을 수 있다.

## 설정

1. Supabase 테스트 프로젝트에서는 [reading_genre_migration.sql](reading_genre_migration.sql)을 적용한다. 기존 `reading` 스키마에 분석 상태 테이블을 추가하고, 분석 결과는 기존 `book_analysis.result` JSONB에 저장한다. 스키마가 없는 새 프로젝트라면 먼저 [reading_postgres_schema.sql](reading_postgres_schema.sql)을 적용한다. 로컬 SQLite에서는 앱을 시작할 때 작업 테이블이 만들어진다.
2. `team04-reading-game` 폴더에서 `python -m pip install -r backend/requirements.txt`를 실행한다.
3. `backend/.env`에 `OPENAI_API_KEY`와 Structured Outputs를 지원하는 `READING_OPENAI_MODEL`을 설정한다. 테스트에는 전송이 허용된 원문을 사용한다. OpenAI에 보내는 내용은 원문 구간과 분석에 필요한 발췌·메모이며, 별도 저장을 요청하는 API 옵션은 끈다.
4. [루트 실행 안내](../../../../README.md)에 따라 FastAPI와 프론트를 시작한다. 같은 `team04-reading-game` 폴더를 연 세 번째 터미널에서 워커를 실행한다.

```powershell
python -m backend.scripts.run_genre_worker
```

`--once`를 넣으면 작업 한 건을 처리하고 종료한다. 키나 모델명을 확인할 수 없으면 워커가 시작 오류를 표시한다. 워커가 꺼져 있으면 요청은 DB에 대기 상태로 남는다. 분석 화면의 **분석 다시 요청**은 실패한 작업을 다시 대기열에 넣는다.

## 사용 흐름

1. 서재에서 UTF-8 TXT 하나를 등록하고 소설, 시, CS 서적, 논문 중 장르를 선택한다. 기존 활동 JSON을 같이 올리면 작성된 활동을 사용한다.
2. 읽기 화면에서 **여기까지 읽음**을 누른 뒤 장르 분석을 연다. 인물·상징 관계도, 시어·심상 사전, CS 개념 흐름도, 논문 논리 구조도 중 알맞은 화면이 열린다.
3. 잠깐 놀기에는 읽은 범위의 선택형 수수께끼가 나온다. 완독하면 세 가지 단서를 맞추는 최종 수수께끼가 열린다. 풀이에 성공하면 장르별 캐릭터를 얻는다. 캐릭터 프로필은 생성하고, 화면과 마을에서는 기존 픽셀 스프라이트를 장르별 대표 이미지로 사용한다.

기존 책을 새 분석에 넣을 때는 지급된 캐릭터와 책 분류를 먼저 확인하고 대상만 지정한다. `--category`는 담당자가 해당 책의 장르를 확인한 경우에 쓴다.

```powershell
python -m backend.scripts.run_genre_worker --enqueue BOOK_ID --category cs_book
```

분석 도중 실패하면 새 결과 전체를 공개하지 않는다. 읽은 범위는 서버에서 확인하고, 여러 인용을 사용하는 항목은 필요한 인용 중 가장 늦은 위치까지 읽어야 열린다. 논문 전체 흐름과 최종 수수께끼는 완독한 뒤 공개한다. 기존에 수동으로 만든 완독 활동과 보상 ID는 유지한다.

## 현재 범위

한 번에 원문을 최대 32구간으로 나누어 분석한다. 구간당 최대 12,000자이며 한도를 넘는 책은 분석에 실패할 수 있다. 원문 읽기는 계속할 수 있다. 이전 스크립트는 이미 공개된 분석 JSON을 함께 복사한다. 실행 중인 작업 상태는 옮기지 않으므로 필요할 때 다시 등록한다.
