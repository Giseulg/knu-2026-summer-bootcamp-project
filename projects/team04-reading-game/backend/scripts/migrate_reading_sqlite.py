"""Copy a read-only SQLite snapshot into an empty reading PostgreSQL schema."""

import argparse
import hashlib
import json
import os
import sqlite3
import sys
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path


TABLES = (
    "books", "catalog_publications", "passages", "reading_progress", "questions",
    "book_analysis", "question_choices", "quiz_sessions", "session_questions", "quiz_attempts",
    "memos", "revisions", "revision_evidence", "preferences", "collectibles",
    "minigame_rewards", "clue_game_rewards", "revision_outcomes",
)
JSON_FIELDS = {
    ("questions", "aliases"), ("book_analysis", "result"), ("question_choices", "options"),
    ("preferences", "value"),
}
TIMESTAMPS = {"created_at", "published_at", "added_at", "started_at", "finished_at", "last_read_at", "earned_at"}


def convert(table, column, value):
    if value is None:
        return None
    if (table, column) in JSON_FIELDS:
        return json.loads(value)
    if column in TIMESTAMPS:
        parsed = datetime.fromisoformat(value)
        if parsed.utcoffset() is None:
            raise ValueError(f"{table}.{column}: timestamp has no timezone")
        return parsed.astimezone(timezone.utc)
    if (table, column) == ("catalog_publications", "in_library"):
        if value not in (0, 1):
            raise ValueError("catalog_publications.in_library: expected 0 or 1")
        return bool(value)
    return value


def read_snapshot(path):
    source_uri = Path(path).resolve(strict=True).as_uri() + "?mode=ro"
    with closing(sqlite3.connect(source_uri, uri=True)) as source:
        source.execute("BEGIN")
        if source.execute("PRAGMA quick_check").fetchall() != [("ok",)]:
            raise ValueError("SQLite integrity check failed")
        if source.execute("PRAGMA foreign_key_check").fetchone():
            raise ValueError("SQLite contains broken foreign key references")
        names = {row[0] for row in source.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        )}
        missing = set(TABLES) - names - {"catalog_publications"}
        # Queue leases are operational state. Published genre JSON is in book_analysis.
        unknown = names - set(TABLES) - {"genre_analysis_jobs"}
        if missing or unknown:
            raise ValueError(f"Unexpected SQLite schema: missing={sorted(missing)}, unknown={sorted(unknown)}")
        snapshot = {}
        for table in TABLES:
            if table not in names:
                snapshot[table] = ((), [])
                continue
            cursor = source.execute(f'SELECT * FROM "{table}"')
            columns = tuple(item[0] for item in cursor.description)
            snapshot[table] = (columns, [
                tuple(convert(table, column, value) for column, value in zip(columns, row))
                for row in cursor
            ])
    return snapshot


def digest(rows):
    def encode(value):
        if isinstance(value, datetime):
            return value.astimezone(timezone.utc).isoformat()
        raise TypeError(type(value).__name__)

    serialized = sorted(json.dumps(row, ensure_ascii=False, sort_keys=True, default=encode) for row in rows)
    return hashlib.sha256("\n".join(serialized).encode()).hexdigest()


def apply_snapshot(url, snapshot):
    import psycopg
    from psycopg import sql
    from psycopg.types.json import Jsonb

    def target(table):
        return sql.Identifier("reading", table)

    # The entire transfer and its verification succeed or roll back together.
    with psycopg.connect(url, connect_timeout=10) as conn, conn.cursor() as cursor:
        cursor.execute("SET LOCAL lock_timeout = '10s'")
        cursor.execute(sql.SQL("LOCK TABLE {} IN SHARE ROW EXCLUSIVE MODE").format(
            sql.SQL(", ").join(map(target, TABLES))
        ))
        for table, (columns, _) in snapshot.items():
            cursor.execute(sql.SQL("SELECT * FROM {} LIMIT 0").format(target(table)))
            actual = {column.name for column in cursor.description}
            if columns and set(columns) != actual:
                raise ValueError(f"PostgreSQL schema mismatch in {table}")
            cursor.execute(sql.SQL("SELECT 1 FROM {} LIMIT 1").format(target(table)))
            if cursor.fetchone():
                raise ValueError(f"Target is not empty: reading.{table}")

        for table, (columns, data) in snapshot.items():
            if not data:
                continue
            fields = sql.SQL(", ").join(map(sql.Identifier, columns))
            insert = sql.SQL("INSERT INTO {} ({}) VALUES ({})").format(
                target(table), fields, sql.SQL(", ").join(sql.Placeholder() for _ in columns)
            )
            json_indexes = {index for index, column in enumerate(columns) if (table, column) in JSON_FIELDS}
            cursor.executemany(insert, (
                tuple(Jsonb(value) if index in json_indexes else value for index, value in enumerate(row))
                for row in data
            ))
            cursor.execute(sql.SQL("SELECT {} FROM {}").format(fields, target(table)))
            copied = cursor.fetchall()
            if len(data) != len(copied) or digest(data) != digest(copied):
                raise ValueError(f"Copied data differs: reading.{table}")

        cursor.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM reading.revisions")
        next_id = max(1, cursor.fetchone()[0])
        cursor.execute(sql.SQL("ALTER TABLE reading.revisions ALTER COLUMN id RESTART WITH {}").format(
            sql.Literal(next_id)
        ))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("sqlite_snapshot", type=Path)
    parser.add_argument("--apply", action="store_true", help="write into the empty PostgreSQL target")
    args = parser.parse_args()
    try:
        snapshot = read_snapshot(args.sqlite_snapshot)
        for table, (_, data) in snapshot.items():
            print(f"{table}: {len(data)}")
        if args.apply:
            url = os.environ.get("READING_DATABASE_URL")
            if not url:
                raise ValueError("Set the server-only READING_DATABASE_URL before using --apply")
            apply_snapshot(url, snapshot)
            print("PostgreSQL import committed. Row counts and contents matched.")
        else:
            print("Read-only check complete. Use --apply to write into PostgreSQL.")
    except ImportError:
        print('Install the PostgreSQL driver with python -m pip install "psycopg[binary]".', file=sys.stderr)
        return 1
    except (ValueError, OSError, sqlite3.Error) as error:
        print(error, file=sys.stderr)
        return 1
    except Exception as error:
        # Avoid printing raw connection parameters or row contents from driver errors.
        status = getattr(error, "sqlstate", None)
        print(f"PostgreSQL import failed ({type(error).__name__}, SQLSTATE {status or 'unavailable'}).", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
