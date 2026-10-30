from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import CORS_ORIGINS, UPLOAD_DIR
from .routers import admin_catalog, admin_inquiries, admin_site, auth, public

app = FastAPI(title="Audio4Design API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (public.router, auth.router, admin_catalog.router, admin_inquiries.router, admin_site.router):
    app.include_router(router)

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
