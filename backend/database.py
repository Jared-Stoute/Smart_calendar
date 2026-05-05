from sqlmodel import SQLModel, create_engine

DATABASE_URL = "sqlite:///./smart_calendar.db"

engine = create_engine(
    DATABASE_URL,
    echo=True  # shows SQL in terminal, useful for debugging
)

def init_db():
    SQLModel.metadata.create_all(engine)