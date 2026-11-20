"""PostgreSQL connection for the reading API."""
from contextlib import contextmanager
from datetime import datetime, timezone
from urllib.parse import parse_qsl, unquote, urlsplit

from psycopg import ClientCursor, Error, connect
from psycopg.rows import dict_row
from psycopg.types.json import set_json_loads


def reading_row(cursor):
    make_dict = dict_row(cursor)

    def normalize(values):
        return make_dict([
            value.astimezone(timezone.utc).isoformat() if isinstance(value, datetime) else value
            for value in values
        ])

    return normalize


class ReadingPostgres:
    def __init__(self, url, root_certificate):
        try:
            address = urlsplit(url)
            if address.scheme not in ("postgres", "postgresql") or not address.hostname or address.fragment:
                raise ValueError
            options = dict(parse_qsl(address.query))
            self.connection = connect(
                host=address.hostname,
                port=address.port or 5432,
                dbname=unquote(address.path.lstrip("/")),
                user=unquote(address.username or ""),
                password=unquote(address.password or ""),
                sslmode="verify-full",
                sslrootcert=root_certificate or options.get("sslrootcert") or "system",
                connect_timeout=10,
                options="-c search_path=reading,pg_catalog",
                autocommit=True,
                cursor_factory=ClientCursor,
                row_factory=reading_row,
            )
        except (Error, ValueError):
            raise RuntimeError("Reading PostgreSQL connection failed. Check the URL, password and CA certificate.") from None

        # The shared API decodes stored JSON text from SQLite and PostgreSQL alike.
        set_json_loads(bytes.decode, self.connection)

    def execute(self, sql, params=()):
        return self.connection.execute(sql.replace("?", "%s"), params)

    def executemany(self, sql, params):
        with self.connection.cursor() as cursor:
            cursor.executemany(sql.replace("?", "%s"), params)

    @contextmanager
    def write_transaction(self):
        with self.connection.transaction():
            # The reading demo shares one profile. Match SQLite's single writer
            # so progress checks, attempts, and rewards commit in order.
            self.connection.execute("SELECT pg_advisory_xact_lock(731119, 4)")
            yield

    def close(self):
        self.connection.close()
