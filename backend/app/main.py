import os
from fastapi.staticfiles import StaticFiles
from app.core.config import settings, MEDIA_DIR
from fastapi import FastAPI
from app.core.logging import logging
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
import uvicorn
from app.routes import user,hostel_routes

app = FastAPI(title="PG Hostel Application",docs_url="/api_v1/docs", redoc_url="/api_v1/redoc")

# Mount media files directory
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

app.include_router(user.router, prefix="/api/v1/newuserregister", tags=["Users"])
app.include_router(hostel_routes.router, prefix="/api/v1/hostels", tags=["HostelsList"])


@app.get("/")
async def root():
    return {"message": "Hi, I am FastApi-Pg-Hostel_management. Awesome - Your setup is done & working."}

@app.on_event("startup")
async def startup_event():
    logging.info("Application startup application...")

@app.on_event("shutdown")
async def shutdown_event():
    logging.info("Shutting down application...")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    uvicorn.run(app, host="0.0.0.0", port=8000)


@app.get("/health")
async def health_check():
    return {"status": "ok"}