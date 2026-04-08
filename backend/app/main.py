from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.vitals import router as vitals_router

app = FastAPI(title="Health Monitor API", version="1.0.0", redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vitals_router)


@app.get("/")
def root():
    return {"status": "Health Monitor API running"}


@app.get("/health")
def health():
    return {"status": "ok"}
