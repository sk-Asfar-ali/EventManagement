# Attendance Module (`src/attendance`)

## Overview
This module handles event attendance in the backend.

It supports:

1. **Mark attendance**
2. **Get attendance summary by event**
3. **Get attendance summary by user**
4. **Update attendance status** (Organizer only)

---

## Files in this module

- `attendance.controller.ts`  
  Exposes REST APIs for attendance.
- `attendance.service.ts`  
  Contains all business logic and DB operations.
- `attendance.entity.ts`  
  TypeORM entity for attendance table.
- `attendance.module.ts`  
  Registers controller, service, and repositories.

---

## Main Business Rules

### 1) Mark Attendance
`markAttendance(userId, eventId, isPresent?)`

Checks:
- Event exists
- User exists
- User is registered for that event
- Event date is today

Then:
- Creates attendance if not present
- Updates attendance if already present
- Sets `isPresent` (default is `true` if not provided)

---

### 2) Get Attendance by Event
`getEventAttendance(eventId)`

Returns:
- `totalRegistered`
- `totalPresent`
- `totalAbsent`
- `users` list with attendance status

---

### 3) Get Attendance by User
`getUserAttendance(userId)`

Returns:
- `eventsAttended`
- `eventsMissed`
- `attendancePercentage`

---

### 4) Update Attendance (Organizer only)
`updateAttendance(attendanceId, status, requesterId)`

Rules:
- Requires authenticated user
- Requires organizer role
- Only event organizer can update attendance for that event
- Updates `isPresent` to `true` or `false`

---

## API Endpoints

Base route: `/attendance`

### Mark attendance
- **POST** `/attendance/mark-attendance`
- Body:
```json
{
  "userId": 2,
  "eventId": 1,
  "isPresent": true
}
```

### Get attendance by event
- **GET** `/attendance/event/:eventId`
- Example: `/attendance/event/1`

### Get attendance by user
- **GET** `/attendance/user/:userId`
- Example: `/attendance/user/2`

### Update attendance (Organizer only)
- **PATCH** `/attendance/:attendanceId`
- Headers:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Body:
```json
{
  "status": false
}
```

---

## How to Run

From project root:

```powershell
cd "c:\Users\rahul\Documents\EventManagement\back-end\event-management-backend"
npm install
npm run start:dev
```

Server usually runs at:

- `http://localhost:3000`

---

## Manual Testing (Postman)

### 1) Mark attendance
- `POST http://localhost:3000/attendance/mark-attendance`
```json
{
  "userId": 2,
  "eventId": 1
}
```

### 2) Event summary
- `GET http://localhost:3000/attendance/event/1`

### 3) User summary
- `GET http://localhost:3000/attendance/user/2`

### 4) Update status (Organizer token required)
- `PATCH http://localhost:3000/attendance/1`
```json
{
  "status": false
}
```

---

## Common Errors and Fixes

### `ER_BAD_FIELD_ERROR: Unknown column ...`
Cause: wrong DB column name in query (`eventId` vs `event_id`, etc.).  
Fix: use correct mapped entity fields or relation-based joins.

### `localhost refused to connect`
Cause: app not running or wrong port.  
Fix: run `npm run start:dev` and verify startup logs.

### `status false not updating`
Cause: fallback logic like `isPresent || true`.  
Fix: use `isPresent ?? true` and assign boolean directly.

### Non-organizer can update
Cause: missing/incorrect guard/role or service-level check.  
Fix: keep `JwtAuthGuard + RolesGuard + Roles(Role.ORGANIZER)` and verify organizer in service.

---

## Notes
- This module depends on **Users**, **Events**, and **Registration** data.
- Ensure DB and `.env` are correctly configured before testing.
- Keep all attendance-related changes inside `src/attendance`.