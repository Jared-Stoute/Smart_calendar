export async function getToday() {
  const res = await fetch("http://localhost:8000/calendar/today");
  return res.json();
}