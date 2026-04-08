from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.vitals import router as vitals_router
from app.api.auth import router as auth_router
from app.api.patients import router as patients_router

app = FastAPI(title="Health Monitor API", version="2.0.0", redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(patients_router)
app.include_router(vitals_router)


@app.get("/")
def root():
    return {"status": "Health Monitor API running", "version": "2.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}
