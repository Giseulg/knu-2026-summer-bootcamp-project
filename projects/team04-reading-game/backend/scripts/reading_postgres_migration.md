# 읽기 DB를 PostgreSQL로 옮기는 방법

읽기 앱은 서버의 `READING_DATABASE_URL`이 설정되면 PostgreSQL을 사용합니다. 연결하기 전에 아래 절차로 스키마와 데이터를 준비하세요.

## 1. 읽기 DB 복사본 만들기

프로젝트의 `team04-reading-game` 폴더에서 PowerShell을 엽니다. 읽기 서버에 `SPO_READING_DB`를 설정했다면 아래 명령의 `reading.db` 자리에 실제 사용 중인 파일 경로를 넣습니다.

```powershell
$snapshot = "reading-snapshot-$(Get-Date -Format yyyyMMdd-HHmmss).db"
python -c "import sqlite3, sys; from pathlib import Path; from contextlib import closing; source = Path(sys.argv[1]).resolve(strict=True).as_uri() + '?mode=ro'; exec('with closing(sqlite3.connect(source, uri=True)) as db, closing(sqlite3.connect(sys.argv[2])) as copy:\n db.backup(copy)')" reading.db $snapshot
python backend/scripts/migrate_reading_sqlite.py $snapshot
```

마지막 명령은 SQLite에 문제가 없는지와 테이블별 개수를 출력합니다. 서버 연결 주소 없이 실행할 수 있습니다. `spokeeper.db`는 이전 EPUB 기능의 별도 DB입니다.

## 2. 빈 Supabase 테스트 DB 준비하기

Supabase 테스트 프로젝트의 SQL Editor에서 [reading_postgres_schema.sql](reading_postgres_schema.sql)을 실행합니다. SQL은 `reading` 스키마에 테이블 18개와 서재 목록용 뷰 하나를 만듭니다. `reading`을 Supabase Data API의 공개 스키마 목록에 추가하지 않습니다.

서버에서 Supabase의 **Connect** 메뉴에 나온 PostgreSQL 연결 주소를 `READING_DATABASE_URL` 환경 변수로 설정합니다. 초기 이전에는 스키마와 테이블을 만든 역할을 사용합니다. 평소 앱을 연결할 때는 읽기·쓰기에 필요한 권한만 가진 별도 DB 계정을 사용합니다. 서버가 IPv4로만 연결된다면 Session pooler를 선택합니다. 인증서와 호스트를 확인하도록 `sslmode=verify-full`과 프로젝트의 신뢰할 수 있는 CA 인증서를 설정합니다.

연결 주소에는 비밀번호가 들어갑니다. 서버에만 저장하고 프론트의 `VITE_...` 설정이나 Git에 넣지 않습니다.

## 3. 테스트 DB로 이전하기

```powershell
python -m pip install "psycopg[binary]"
python backend/scripts/migrate_reading_sqlite.py $snapshot --apply
```

스크립트는 대상 테이블에 행이 하나라도 있으면 이전을 중단합니다. 전체 작업은 한 번에 저장되며, 옮긴 행의 개수와 내용이 SQLite의 값과 일치하는지 확인합니다. 날짜는 같은 시각을 UTC로 비교하고, JSON은 내용으로 비교합니다. `library_books` 뷰는 테이블에서 자동으로 계산되므로 복사하지 않습니다. 메모 수정 번호는 이전한 마지막 번호 다음부터 발급합니다.

## 4. 읽기 서버 연결하기

1. `python -m pip install -r backend/requirements.txt`로 서버 의존성을 설치합니다.
2. Supabase의 Database Settings에서 받은 공개 CA 인증서를 `backend` 폴더에 저장합니다. `backend/.env`에 `READING_DATABASE_SSLROOTCERT=reading-supabase-ca.pem`처럼 파일 이름을 적습니다. `READING_DATABASE_URL`의 비밀번호에 예약 문자가 있다면 URL 인코딩합니다.
3. `team04-reading-game`에서 `python -m uvicorn backend.app.reading_app:app --host 127.0.0.1 --port 8000`을 실행합니다.
4. 프로젝트 루트의 `frontend`에서 `npm run dev:reading`을 실행합니다.

로컬 SQLite로 실행하려면 서버의 `READING_DATABASE_URL`을 비운 뒤 재시작합니다. PostgreSQL 설정이 있고 접속에 실패하면 서버가 시작 단계에서 오류를 표시합니다.

## 5. 확인할 것

FastAPI는 두 DB에서 같은 응답 형식을 사용합니다. 시연 계정의 진도·퀴즈 답안·보상 변경은 한 번에 하나씩 처리해, 동시에 들어온 요청이 서로의 상태를 덮어쓰지 않게 합니다.

앱을 테스트 DB에 연결한 뒤 기존 서재, 이어 읽기, 메모의 원문 링크, 퀴즈 답안, 캐릭터 보상, 탐색 공개 자료를 확인합니다. 운영 전환 시에는 저장을 잠시 멈추고 새 복사본을 만든 뒤, 비어 있는 실제 대상에 한 번 더 적용합니다. 전환 확인이 끝날 때까지 원본 SQLite와 복사본을 보관합니다.

현재 구조는 시연 계정 한 개의 기록을 보존합니다. 팀원별로 진도와 메모를 분리하려면 사용자 ID와 서버의 접근 권한 확인이 필요합니다.
