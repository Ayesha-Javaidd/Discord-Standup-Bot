# Frontend Integration Prompt: Discord Check-in Admin Dashboard

## Project Overview
You are building an admin dashboard for a Discord check-in bot system. The backend is a FastAPI service with a MySQL database, and all configuration and data management is done via REST APIs secured with an `X-API-KEY` header.

The dashboard should allow admins to:
- Manage check-ins (create, edit, delete, schedule)
- Manage questions for each check-in
- Manage users for each check-in
- View and export user responses by day/check-in
- See analytics (response rates, mood averages, etc.)

**Tech stack:**  
- React (TypeScript)
- Tailwind CSS
- API integration via fetch/axios (your choice)
- All endpoints require `X-API-KEY` in headers

---

## API Endpoints

### Authentication
All endpoints require:  
`X-API-KEY: your-strong-api-key` in the request headers.

---

### Checkins
- **List all checkins**
  - `GET /checkins/`
  - **Response:**
    ```json
    [
      {
        "id": 1,
        "name": "Daily Standup",
        "channel_id": "1234567890",
        "schedule_time": "09:00:00",
        "post_time": "09:30:00",
        "created_at": "...",
        "updated_at": "..."
      },
      ...
    ]
    ```

- **Get a checkin with questions and users**
  - `GET /checkins/{checkin_id}/full`
  - **Response:**
    ```json
    {
      "checkin": { ...checkin fields... },
      "questions": [ { ...question fields... }, ... ],
      "users": [ { ...user fields... }, ... ]
    }
    ```

- **Create a checkin**
  - `POST /checkins/`
  - **Body:**
    ```json
    {
      "name": "Daily Standup",
      "channel_id": "1234567890",
      "schedule_time": "09:00:00",
      "post_time": "09:30:00"
    }
    ```

- **Update a checkin**
  - `PUT /checkins/{checkin_id}`
  - **Body:** same as create

- **Delete a checkin**
  - `DELETE /checkins/{checkin_id}`

---

### Questions
- **List questions for a checkin**
  - `GET /questions/?checkin_id={checkin_id}`

- **Create a question**
  - `POST /questions/?checkin_id={checkin_id}`
  - **Body:**
    ```json
    {
      "question_text": "How are you feeling today?",
      "order": 1
    }
    ```

- **Update a question**
  - `PUT /questions/{question_id}`
  - **Body:** same as create

- **Delete a question**
  - `DELETE /questions/{question_id}`

---

### Users
- **List all users**
  - `GET /users/`

- **Get a user**
  - `GET /users/{user_id}`

- **Create a user**
  - `POST /users/`
  - **Body:**
    ```json
    {
      "discord_id": "123456789",
      "username": "johndoe",
      "display_name": "John",
      "avatar_url": "https://cdn.discordapp.com/avatars/..."
    }
    ```

- **Update a user**
  - `PUT /users/{user_id}`

- **Delete a user**
  - `DELETE /users/{user_id}`

- **Add user to checkin**
  - `POST /users/add_to_checkin/`
  - **Body:**
    ```json
    {
      "user_id": 1,
      "checkin_id": 2
    }
    ```

- **Remove user from checkin**
  - `DELETE /users/remove_from_checkin/?user_id=1&checkin_id=2`

- **List users for a checkin**
  - `GET /users/by_checkin/{checkin_id}`

---

### Responses
- **List responses (optionally filter by checkin and date)**
  - `GET /responses/?checkin_id=1&response_date=2024-07-16`
  - **Response:**
    ```json
    [
      {
        "id": 1,
        "checkin_id": 1,
        "user_id": 2,
        "question_id": 3,
        "response_text": "I'm good!",
        "response_date": "2024-07-16T09:01:00",
        "created_at": "2024-07-16T09:01:00",
        "user": { ...user fields... },
        "question": { ...question fields... }
      },
      ...
    ]
    ```

- **Export responses**
  - (Frontend can fetch and format as CSV/Excel)

---

## Data Models (Summary)
- **Checkin:**  
  `id, name, channel_id, schedule_time, post_time, created_at, updated_at`
- **Question:**  
  `id, checkin_id, question_text, order, created_at`
- **User:**  
  `id, discord_id, username, display_name, avatar_url, created_at, updated_at`
- **Response:**  
  `id, checkin_id, user_id, question_id, response_text, response_date, created_at`

---

## UI Suggestions
- **Sidebar:** Navigation for Checkins, Users, Responses, Analytics
- **Checkin Management:** List, create, edit, delete checkins; manage questions and users per checkin
- **User Management:** List, search, add/remove users; assign to checkins
- **Responses:** Filter by checkin/date, view/export responses
- **Analytics:** Charts for response rates, mood averages, etc.
- **Auth:** Simple API key input (store in localStorage/sessionStorage)

---

## API Usage Example (with fetch)
```typescript
const apiKey = localStorage.getItem('apiKey');
const res = await fetch('http://localhost:8000/checkins/', {
  headers: { 'X-API-KEY': apiKey }
});
const checkins = await res.json();
```

---

**If you need more details on any endpoint, data structure, or want example request/response payloads, let me know!** 