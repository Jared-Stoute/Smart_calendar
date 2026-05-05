import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from "react";
import { getToday } from "./api/calendar";
import jaredIcon from "./icons/owners/sol_icon.png";
import mandyIcon from "./icons/owners/pyder_icon.png";




async function getEvents() {
  const response = await fetch("http://localhost:8000/calendar/events");
  return response.json();
}

function App() {
  const [events, setEvents] = useState([]);
  const [today, setToday] = useState("");

  const [form, setForm] = useState({
    title: "",
    start: "",
    end: "",
    description: "",
    source: "local",
    category: "general",
    reminder: "none",
    owner: "jared" // default owner
  });

  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list"); // list, week, month
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  function openEventDetails(event) {
    setSelectedEvent(event);
  }

  function closeEventDetails() {
    setSelectedEvent(null);
  }


  // updates form fields
  function updateField(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  function startEditing(event) {
    setEditingId(event.id);

    setForm({
      title: event.title,
      start: event.start.slice(0, 16), // format for datetime-local
      end: event.end.slice(0, 16),
      description: event.description,
      source: event.source,
      category: event.category,
      reminder: event.reminder,
      owner: event.owner
    });
  }

  // submits the form to backend
  async function addEvent(e) {
    e.preventDefault();

    // validation
    if (new Date(form.end) <= new Date(form.start)) {
      setError("End time must be after start time.");
      return;
    }

    setError("");

    // If editing, send PUT instead of POST
    if (editingId) {
      const response = await fetch(`http://localhost:8000/calendar/events/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const updated = await response.json();

      setEvents(prev =>
        [...prev.map(e => (e.id === editingId ? updated : e))]
          .sort((a, b) => new Date(a.start) - new Date(b.start))
      );

      setEditingId(null);
    } else {
      // normal create
      const response = await fetch("http://localhost:8000/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const newEvent = await response.json();
      setEvents(prev => [...prev, newEvent].sort((a, b) => new Date(a.start) - new Date(b.start)));
    }

    // reset form
    setForm({
      title: "",
      start: "",
      end: "",
      description: "",
      source: "local",
      category: "general",
      owner: "jared",
    });
  }

  // Delete event //
  async function deleteEvent(id) {
  await fetch(`http://localhost:8000/calendar/events/${id}`, {
    method: "DELETE"
  });

  setEvents(prev => prev.filter(e => e.id !== id));
  }

  useEffect(() => {
    // Load today's info
    getToday()
      .then(data => {
        setToday(`Today is ${data.date} and you have ${data.events.length} events.`);
      })
      .catch(err => console.error("Today error:", err));

    // Load events
    getEvents()
      .then(data => {
        setEvents(data);
      })
      .catch(err => console.error("Events error:", err));
  }, []);

  function groupEventsByDay(events) {
    const groups = {};

    events.forEach(event => {
      const day = new Date(event.start).toLocaleDateString();
      if (!groups[day]) groups[day] = [];
      groups[day].push(event);
    });

    return groups;
  }

  function getCurrentWeek(date) {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); // Sunday start

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }

    return days;
  }

  function getWeekDays(currentDate) {
    const start = new Date(currentDate);
    const dayOfWeek = start.getDay(); // 0 = Sun, 1 = Mon, etc.

    // Move to Sunday of the current week
    start.setDate(start.getDate() - dayOfWeek);

    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }

    return days;
  }


  function getMonthDays(date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const days = [];

    for (let i = 0; i < first.getDay(); i++) {
      days.push(null);
    }

    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }

  const categoryColors = {
    general: "#cccccc",
    work: "#4da6ff",
    personal: "#ffa32c",
    health: "#66ffc4"
  };

  const categoryIcons = {
    general: "📌",
    work: "💼",
    personal: "🏠",
    health: "💊"
  };

  const ownerIcons = {
  jared: jaredIcon,
  mandy: mandyIcon
  };

  const ownerColors = {
    jared: "#0aff33",
    mandy: "#ff389b"
  };

  {/* Side Calendar */}
  function MiniMonthCalendar({ currentDate, setCurrentDate, events }) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Build grid
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    // Days with events
    const eventDates = new Set(
      events
        .filter(e => new Date(e.start).getMonth() === month)
        .map(e => new Date(e.start).getDate())
    );

    return (
      <div
        style={{
          width: "240px",
          padding: "12px",
          borderRight: "1px solid #444",
          background: "#111",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          position: "sticky",
          top: 0,
          height: "100vh"
        }}
      >
        {/* Month + navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "18px",
            fontWeight: "bold"
          }}
        >
          <button
            onClick={() =>
              setCurrentDate(new Date(year, month - 1, currentDate.getDate()))
            }
          >
            ←
          </button>

          {currentDate.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric"
          })}

          <button
            onClick={() =>
              setCurrentDate(new Date(year, month + 1, currentDate.getDate()))
            }
          >
            →
          </button>
        </div>

        {/* Weekday labels */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            textAlign: "center",
            opacity: 0.6,
            fontSize: "12px"
          }}
        >
          {["S", "M", "T", "W", "T", "F", "S"].map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "4px"
          }}
        >
          {days.map((d, i) => {
            if (!d)
              return <div key={i} style={{ height: "28px" }}></div>;

            const isToday =
              d === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            const hasEvents = eventDates.has(d);

            return (
              <div
                key={i}
                onClick={() =>
                  setCurrentDate(new Date(year, month, d))
                }
                style={{
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "4px",
                  cursor: "pointer",
                  background: isToday
                    ? "#0aff33"
                    : hasEvents
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                  color: isToday ? "#000" : "#fff",
                  fontWeight: isToday ? "bold" : "normal"
                }}
              >
                {d}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex"}}>

      {/* Left Sidebar */}
      <MiniMonthCalendar
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        events={events}
      />

      <div className="App" style={{ flex: 1, paddingLeft: "16px"}}>
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>{today}</p>

          {/* Event Loop */}
          <h2>Events</h2>

          <div style={{ marginBottom: "15px" }}>
            <button onClick={() => setView("list")}>List View</button>
            <button onClick={() => setView("day")}>Day</button>
            <button onClick={() => setView("week")}>Week View</button>
            <button onClick={() => setView("month")}>Month View</button>
            
          </div>

          <div style={{ marginBottom: "15px" }}>
            <button onClick={() => setFilter("all")}>All</button>
            <button onClick={() => setFilter("work")}>💼 Work</button>
            <button onClick={() => setFilter("personal")}>🏠 Personal</button>
            <button onClick={() => setFilter("health")}>💊 Health</button>
            <button onClick={() => setFilter("general")}>📌 General</button>
          </div>

          {view !== "list" && (
            <div style={{ marginBottom: "15px", display: "flex", justifyContent: "center", gap: "20px" }}>
              <button
                onClick={() => {
                  if (view === "week") {
                    const d = new Date(currentDate);
                    d.setDate(d.getDate() - 7);
                    setCurrentDate(d);
                  } else if (view === "month") {
                    const d = new Date(currentDate);
                    d.setMonth(d.getMonth() - 1);
                    setCurrentDate(d);
                  }
                }}
              >
                ◀ Previous
              </button>

              <strong>
                {view === "week" &&
                  `${getCurrentWeek(currentDate)[0].toLocaleDateString()} – ${getCurrentWeek(currentDate)[6].toLocaleDateString()}`}
                {view === "month" &&
                  `${currentDate.toLocaleString("default", { month: "long" })} ${currentDate.getFullYear()}`}
              </strong>

              <button
                onClick={() => {
                  if (view === "week") {
                    const d = new Date(currentDate);
                    d.setDate(d.getDate() + 7);
                    setCurrentDate(d);
                  } else if (view === "month") {
                    const d = new Date(currentDate);
                    d.setMonth(d.getMonth() + 1);
                    setCurrentDate(d);
                  }
                }}
              >
                Next ▶
              </button>
            </div>
          )}

          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: "15px", padding: "6px", width: "250px" }}
          />
          {events.length === 0 && <p>No events yet.</p>}



          {view === "list" && (
            <>
              {Object.entries(
                groupEventsByDay(
                  events
                    .filter(e => filter === "all" || e.category === filter)
                    .filter(e =>
                      e.title.toLowerCase().includes(search.toLowerCase()) ||
                      e.description.toLowerCase().includes(search.toLowerCase())
                    )
                )
                
              ).map(([day, dayEvents]) => (
                <div key={day} style={{ marginBottom: "20px" }}>
                  <h3>{day}</h3>

                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      style={{
                        borderLeft: `6px solid ${ownerColors[event.owner]}`,
                        paddingLeft: "10px",
                        marginBottom: "12px"
                      }}
                    >
                      <strong
                        style={{ cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => openEventDetails(event)}
                      >
                        <img
                          src={ownerIcons[event.owner]}
                          alt={event.owner}
                          style={{ width: "40px", height: "40px", marginRight: "4px" }}
                        />
                        {categoryIcons[event.category]} {event.title}


                        {event.reminder !== "none" && " ⏰"}
                      </strong>
                      <br />
                      {new Date(event.start).toLocaleString()} – {new Date(event.end).toLocaleString()}
                      <br />
                      <button onClick={() => startEditing(event)}>Edit</button>
                      <button onClick={() => deleteEvent(event.id)}>Delete</button>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

          {view === "day" && (
            <div
              style={{
                width: "100%",
                maxWidth: "700px",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "12px"
              }}
            >
              {/* Sticky Header */}
              <div
                style={{
                  position: "sticky",
                  top: 0,
                  background: "#111",
                  padding: "12px 0",
                  zIndex: 10,
                  borderBottom: "1px solid #444",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                {/* Navigation */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() =>
                      setCurrentDate(
                        new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          currentDate.getDate() - 1
                        )
                      )
                    }
                  >
                    ← Prev
                  </button>

                  <button onClick={() => setCurrentDate(new Date())}>Today</button>

                  <button
                    onClick={() =>
                      setCurrentDate(
                        new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          currentDate.getDate() + 1
                        )
                      )
                    }
                  >
                    Next →
                  </button>
                </div>

                {/* Date */}
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    opacity: 0.9
                  }}
                >
                  {currentDate.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric"
                  })}
                </div>
              </div>

              {/* Build list of hours that actually have events */}
              {(() => {
                const hoursWithEvents = Array.from({ length: 24 })
                  .map((_, hour) => {
                    const hourEvents = events.filter(e => {
                      const start = new Date(e.start);
                      return (
                        start.toLocaleDateString() === currentDate.toLocaleDateString() &&
                        start.getHours() === hour
                      );
                    });
                    return { hour, events: hourEvents };
                  })
                  .filter(h => h.events.length > 0);

                return (
                  <div
                    style={{
                      maxHeight: "70vh",
                      overflowY: "auto",
                      paddingRight: "6px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px"
                    }}
                  >
                    {hoursWithEvents.map(({ hour, events: hourEvents }) => {
                      const hourLabel = new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        currentDate.getDate(),
                        hour
                      ).toLocaleTimeString([], { hour: "numeric" });

                      return (
                        <div key={hour} style={{ display: "flex", gap: "12px" }}>
                          {/* Hour label */}
                          <div
                            style={{
                              width: "60px",
                              textAlign: "right",
                              opacity: 0.6,
                              paddingTop: "4px"
                            }}
                          >
                            {hourLabel}
                          </div>

                          {/* Events */}
                          <div
                            style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px"
                            }}
                          >
                            {hourEvents.map(event => (
                              <div
                                key={event.id}
                                style={{
                                  background: "rgba(255,255,255,0.05)",
                                  borderLeft: `6px solid ${ownerColors[event.owner]}`,
                                  padding: "10px 12px",
                                  borderRadius: "6px",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "6px",
                                  fontSize: "clamp(12px, 1.4vw, 16px)",
                                  lineHeight: "1.3"
                                }}
                              >
                                {/* Icon + title */}
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    flexWrap: "wrap"
                                  }}
                                >
                                  <img
                                    src={ownerIcons[event.owner]}
                                    alt={event.owner}
                                    style={{ width: "26px", height: "26px" }}
                                  />
                                  <span style={{ whiteSpace: "normal" }}>
                                    {categoryIcons[event.category]} {event.title}
                                  </span>
                                </div>

                                {/* Time */}
                                <div style={{ fontSize: "12px", opacity: 0.7 }}>
                                  {new Date(event.start).toLocaleTimeString([], {
                                    hour: "numeric",
                                    minute: "2-digit"
                                  })}
                                  {" – "}
                                  {new Date(event.end).toLocaleTimeString([], {
                                    hour: "numeric",
                                    minute: "2-digit"
                                  })}
                                </div>

                                {/* Description */}
                                {event.description && (
                                  <div style={{ fontSize: "12px", opacity: 0.8 }}>
                                    {event.description}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}


          
          {view === "week" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "8px",
                width: "100%",
                maxWidth: "900px",
                margin: "0 auto"
              }}
            >
              {/* Weekday headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div
                  key={d}
                  style={{
                    fontWeight: "bold",
                    textAlign: "center",
                    paddingBottom: "4px",
                    opacity: 0.8
                  }}
                >
                  {d}
                </div>
              ))}

              {/* Week days */}
              {getWeekDays(currentDate).map((day, i) => {
                const dayString = day.toLocaleDateString();

                const dayEvents = events
                  .filter(e => filter === "all" || e.category === filter)
                  .filter(e =>
                    e.title.toLowerCase().includes(search.toLowerCase()) ||
                    e.description.toLowerCase().includes(search.toLowerCase())
                  )
                  .filter(
                    e => new Date(e.start).toLocaleDateString() === dayString
                  );

                return (
                  <div
                    key={i}
                    style={{
                      minHeight: "120px",
                      height: "auto",
                      border: "1px solid #444",
                      padding: "8px",
                      borderRadius: "6px",
                      overflow: "visible",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      background: "rgba(255,255,255,0.02)"
                    }}
                  >
                    {/* Date + event count */}
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        opacity: 0.85,
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px"
                      }}
                    >
                      <span>{day.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}</span>
                      <span style={{ fontSize: "11px", opacity: 0.6 }}>
                        {dayEvents.length > 0 ? `${dayEvents.length} events` : ""}
                      </span>
                    </div>

                    {/* Events */}
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          borderLeft: `4px solid ${ownerColors[event.owner]}`,
                          padding: "6px 8px",
                          borderRadius: "4px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          fontSize: "clamp(11px, 1.3vw, 15px)",
                          lineHeight: "1.25"
                        }}
                      >
                        {/* Top row: icon + title */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            flexWrap: "wrap"
                          }}
                        >
                          <img
                            src={ownerIcons[event.owner]}
                            alt={event.owner}
                            style={{ width: "22px", height: "22px" }}
                          />
                          <span style={{ whiteSpace: "normal" }}>
                            {categoryIcons[event.category]} {event.title}
                          </span>
                        </div>

                        {/* Optional: Time display */}
                        <div style={{ fontSize: "11px", opacity: 0.7 }}>
                          {new Date(event.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                          {" – "}
                          {new Date(event.end).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}


          {view === "month" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "8px",
                width: "100%",
                maxWidth: "900px",
                margin: "0 auto"
              }}
            >
              {/* Weekday headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div
                  key={d}
                  style={{
                    fontWeight: "bold",
                    textAlign: "center",
                    paddingBottom: "4px",
                    opacity: 0.8
                  }}
                >
                  {d}
                </div>
              ))}

              {/* Month days */}
              {getMonthDays(currentDate).map((day, i) => {
                if (!day) {
                  return (
                    <div
                      key={i}
                      style={{
                        minHeight: "100px",
                        border: "1px solid #444",
                        borderRadius: "6px"
                      }}
                    ></div>
                  );
                }

                const dayString = day.toLocaleDateString();

                const dayEvents = events
                  .filter(e => filter === "all" || e.category === filter)
                  .filter(e =>
                    e.title.toLowerCase().includes(search.toLowerCase()) ||
                    e.description.toLowerCase().includes(search.toLowerCase())
                  )
                  .filter(
                    e => new Date(e.start).toLocaleDateString() === dayString
                  );

                return (
                  <div
                    key={i}
                    style={{
                      minHeight: "100px",
                      height: "auto",
                      border: "1px solid #444",
                      padding: "6px",
                      borderRadius: "6px",
                      overflow: "visible",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      background: "rgba(255,255,255,0.02)"
                    }}
                  >
                    {/* Date + event count */}
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        opacity: 0.8,
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "2px"
                      }}
                    >
                      <span>{day.getDate()}</span>
                      <span style={{ fontSize: "10px", opacity: 0.6 }}>
                        {dayEvents.length > 0 ? `${dayEvents.length} events` : ""}
                      </span>
                    </div>

                    {/* Events */}
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          borderLeft: `4px solid ${ownerColors[event.owner]}`,
                          padding: "4px 6px",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "clamp(10px, 1.3vw, 14px)",
                          lineHeight: "1.2"
                        }}
                      >
                        <img
                          src={ownerIcons[event.owner]}
                          alt={event.owner}
                          style={{ width: "20px", height: "20px" }}
                        />
                        <span style={{ whiteSpace: "normal" }}>
                          {categoryIcons[event.category]} {event.title}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}





          {/* the Add Event form */}
          <h2>Add Event</h2>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <form onSubmit={addEvent} style={{ display: "flex", flexDirection: "column", gap: "8px", width: "300px" }}>
            <input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={updateField}
              required
            />

            <input
              name="start"
              type="datetime-local"
              value={form.start}
              onChange={updateField}
              required
            />

            <input
              name="end"
              type="datetime-local"
              value={form.end}
              onChange={updateField}
              required
            />

            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={updateField}
            />

            <button type="submit">
              {editingId ? "Save Changes" : "Add Event"}
            </button>

            <select
              name="category"
              value={form.category}
              onChange={updateField}
            >
              <option value="general">📌 General</option>
              <option value="work">💼 Work</option>
              <option value="personal">🏠 Personal</option>
              <option value="health">💊 Health</option>
            </select>

            <select
              name="owner"
              value={form.owner}
              onChange={updateField}
            >
              <option value="jared">Jared</option>
              <option value="mandy">Mandy</option>
            </select>




            <select
              name="reminder"
              value={form.reminder}
              onChange={updateField}
            >
              <option value="none">No Reminder</option>
              <option value="5">5 minutes before</option>
              <option value="10">10 minutes before</option>
              <option value="30">30 minutes before</option>
              <option value="60">1 hour before</option>
              <option value="1440">1 day before</option>
            </select>
          </form>

          {selectedEvent && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000
              }}
            >
              <div
                style={{
                  background: "#222",
                  padding: "20px",
                  borderRadius: "8px",
                  width: "350px",
                  color: "white",
                  boxShadow: "0 0 10px black",
                  borderTop: `6px solid ${ownerColors[selectedEvent.owner]}`   // ⭐ NEW
                }}
              >

                <h2>
                  {categoryIcons[selectedEvent.category]} {selectedEvent.title}
                </h2>

                <p>
                  <strong>Start:</strong><br />
                  {new Date(selectedEvent.start).toLocaleString()}
                </p>

                <p>
                  <strong>End:</strong><br />
                  {new Date(selectedEvent.end).toLocaleString()}
                </p>

                {selectedEvent.description && (
                  <p>
                    <strong>Description:</strong><br />
                    {selectedEvent.description}
                  </p>
                )}

                <p>
                  <strong>Category:</strong> {selectedEvent.category}
                </p>

                <p>
                  <strong>Owner:</strong>
                  <img
                    src={ownerIcons[selectedEvent.owner]}
                    alt={selectedEvent.owner}
                    style={{ width: "40px", height: "40px", marginLeft: "6px" }}
                  />
                </p>


                {selectedEvent.reminder !== "none" && (
                  <p>
                    <strong>Reminder:</strong> {selectedEvent.reminder} minutes before
                  </p>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <button onClick={() => startEditing(selectedEvent)}>Edit</button>
                  <button onClick={() => deleteEvent(selectedEvent.id)}>Delete</button>
                  <button onClick={closeEventDetails}>Close</button>
                </div>
              </div>
            </div>
          )}

          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>

    </div>
  );
}

export default App;