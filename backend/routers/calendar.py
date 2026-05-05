from fastapi import APIRouter
from sqlmodel import Session, select
from database import engine
from datetime import date
from models.event import Event, EventCreate


router = APIRouter(
    prefix="/calendar",
    tags=["calendar"]
)

@router.get("/today")
def get_today():
    return {
        "date": str(date.today()),
        "events": []
    }

@router.get("/events")
def get_events():
    with Session(engine) as session:
        events = session.exec(select(Event)).all()
        return events

@router.post("/events")
def create_event(event: EventCreate):
    new_event = Event(**event.dict())
    with Session(engine) as session:
        session.add(new_event)
        session.commit()
        session.refresh(new_event)
        return new_event

@router.delete("/events/{event_id}")
def delete_event(event_id: int):
    with Session(engine) as session:
        event = session.get(Event, event_id)
        if not event:
            return {"error": "Event not found"}
        session.delete(event)
        session.commit()
        return {"status": "deleted"}
    
@router.put("/events/{event_id}")
def update_event(event_id: int, data: EventCreate):
    with Session(engine) as session:
        event = session.get(Event, event_id)
        if not event:
            return {"error": "Event not found"}

        for key, value in data.dict().items():
            setattr(event, key, value)

        session.add(event)
        session.commit()
        session.refresh(event)
        return event