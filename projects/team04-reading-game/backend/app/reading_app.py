"""Standalone entry point for the reading UI when EPUB services aren't configured."""
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .reading import init_reading_db, router


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_reading_db()
    yield


app = FastAPI(title="SpoKeeper Reading", lifespan=lifespan)
app.include_router(router)
