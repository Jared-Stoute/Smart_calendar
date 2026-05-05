from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import calendar
from database import init_db



app = FastAPI()

init_db()  # Initialize the database tables 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(calendar.router)

@app.get("/")
def root():
    return {"message": "Backend is running!"}