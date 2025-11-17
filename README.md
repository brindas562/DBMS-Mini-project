# EventHub — Full‑Stack Website for `events` MySQL DB

A minimal full‑stack app (Express + MySQL + React + Vite) for the schema in `miniproject_10.sql`. Browse events, view details, login, and book tickets. Clean UI via Pico.css.

## Prerequisites
- MySQL 8+
- Node.js 18+ and npm
- macOS zsh commands below

## 1) Load the Database
```zsh
# Launch MySQL shell then run the SQL file
mysql -u root -p < miniproject_10.sql
# This creates database `events` and seeds sample data
```

## 2) Configure Backend
```zsh
cp server/.env.example server/.env
# edit server/.env with your MySQL creds, e.g.
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=events
# PORT=4000
# CLIENT_ORIGIN=http://localhost:5173
```

## 3) Install and Run (Dev)
Open two terminals:
```zsh
# Terminal A — Backend
cd "${PWD}/server"
npm install
npm run dev

# Terminal B — Frontend
cd "${PWD}/client"
npm install
npm run dev
```
- API: `http://localhost:4000`
- Web: `http://localhost:5173`

Login with a seeded user (demo): `alice@mail.com` / `pass123`.

## 4) Production Build
```zsh
# Build frontend
cd client && npm run build
# Serve with any static server or configure Express static hosting if desired
```

## API Overview
- `GET /api/events` — list events with venue, avg rating, total revenue
- `GET /api/events/:id` — event detail (tickets, sponsors, staff, feedback)
- `POST /api/login` — demo login (uses plaintext seed passwords)
- `POST /api/logout` — clear session cookie
- `GET /api/me` — current user profile
- `GET /api/bookings/me` — current user bookings
- `POST /api/bookings` — create booking for a ticket `{ ticketId }`

Notes:
- DB triggers in the SQL handle ticket availability after booking.
- For real auth, replace demo login + cookie with proper JWT + hashed passwords.

## Project Structure
```
server/           # Express API
  src/
    index.js      # app entry
    db.js         # MySQL pool
    routes/
      events.js   # events list & detail
      users.js    # login/logout/me
      bookings.js # create + list bookings
client/           # React + Vite UI
  src/
    pages/        # Home, EventDetail, MyBookings, Login
    App.jsx       # routes + nav
```

## Security Caveats
- Seed data stores plaintext passwords. Do not use in production.
- Add input validation and stronger auth if you extend this.