📅 Smart Calendar (WIP)
A smart calendar application featuring daily, weekly, and monthly views, event management (create/edit/delete), color‑coded categories, and an integrated to‑do/chore list. The goal of this project is to provide a clean, modern scheduling tool that is easy to use, visually clear, and extensible. Future plans include syncing with Google Calendar and Apple Calendar, reminders, and improved UI components.

This project uses a Python backend and a React frontend, with a focus on clarity, usability, and modular design.

🚀 Features
Multiple calendar views  
Daily, weekly, and monthly layouts for flexible scheduling.

Event management  
Create, edit, and delete events with ease.

Color‑coded categories  
Assign colors to event types for quick visual scanning.

To‑Do / Chore list  
Built‑in task management alongside your calendar.

Clean, modern UI  
Designed for readability and ease of use.

Extensible architecture  
Built to support future integrations and features.

🛠️ Tech Stack
Backend
Python

FastAPI (or Flask, depending on your implementation)

SQLite (local development)

Frontend
React

JavaScript

CSS Modules / Styled Components (depending on your setup)

📦 Installation & Setup
1. Clone the repository
bash
git clone https://github.com/Jared-Stoute/smart-calendar.git
cd smart-calendar
2. Backend Setup
Create and activate a virtual environment:

bash
python -m venv venv
venv\Scripts\activate
Install dependencies:

bash
pip install -r requirements.txt
Run the backend:

bash
uvicorn main:app --reload
(Adjust the entrypoint if your backend uses a different file.)

3. Frontend Setup
Navigate to the frontend folder:

bash
cd frontend
Install dependencies:

bash
npm install
Run the development server:

bash
npm start
🧭 Roadmap
Planned features and improvements:

🔄 Google Calendar sync

🍎 Apple Calendar sync

🔔 Reminder notifications

🖼️ UI redesign and improved layout

📱 Mobile‑friendly responsive design

👥 Shared calendars / family mode

🗂️ Drag‑and‑drop event editing

🕒 Time‑blocking mode

📸 Screenshots (Coming Soon)
Screenshots will be added as the UI evolves.

📌 Status
This project is currently a Work in Progress (WIP).
Core features are being built out, and the architecture is designed to support future expansion.

🤝 Contributions
This is a personal project, but suggestions and feedback are welcome.

📄 License
To be added.