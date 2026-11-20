"""Run the reading analysis queue. Start from team04-reading-game."""
import argparse
from contextlib import closing
import os
from time import sleep

from backend.app.genre_analysis import GENRES, openai_parser
from backend.app.genre_jobs import enqueue, jobs_enabled, run_one
from backend.app.reading import now, open_db, write_transaction

def main():
    args_parser = argparse.ArgumentParser(description=__doc__)
    mode = args_parser.add_mutually_exclusive_group()
    mode.add_argument("--once", action="store_true", help="Process one queued analysis and exit.")
    mode.add_argument("--enqueue", metavar="BOOK_ID", help="Queue a selected existing book.")
    args_parser.add_argument("--category", choices=GENRES, help="Explicitly classify the selected existing book.")
    args = args_parser.parse_args()
    if args.category and not args.enqueue:
        args_parser.error("--category requires --enqueue")
    if args.enqueue:
        with closing(open_db()) as conn, write_transaction(conn):
            if not jobs_enabled(conn):
                args_parser.error("Apply the genre analysis migration first.")
            book = conn.execute("SELECT category FROM books WHERE id = ?", (args.enqueue,)).fetchone()
            if not book or (args.category or book["category"]) not in GENRES:
                args_parser.error("Select an existing book with a supported genre.")
            if not enqueue(conn, args.enqueue, now()):
                args_parser.error("This book already has a queued, running or ready analysis.")
            if args.category and args.category != book["category"]:
                conn.execute("UPDATE books SET category = ? WHERE id = ?", (args.category, args.enqueue))
        return
    if not os.getenv("OPENAI_API_KEY") or not os.getenv("READING_OPENAI_MODEL"):
        args_parser.error("Set OPENAI_API_KEY and READING_OPENAI_MODEL in backend/.env.")
    parse = openai_parser()
    if args.once:
        run_one(parse)
        return
    while True:
        if not run_one(parse):
            sleep(2)

if __name__ == "__main__":
    main()
