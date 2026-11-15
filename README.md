# Budget Buddy

Budget Buddy is a full-stack app to track **expenses** and **budgets**, with an **AI Insight** feature that summarizes your spending based on a selected prompt.

- **Frontend**: React (Create React App) + Bootstrap
- **Backend**: Django REST API (custom JWT auth)
- **Database**: PostgreSQL (recommended via Docker Compose)

## Features

- **Authentication**: Sign up / Login (JWT stored in `localStorage`)
- **Expenses**
  - Add expense
  - View expense history
  - Filter by date range
  - Edit / Delete an expense
- **Budgets**
  - Create budget by category
  - View budgets list
  - Edit / Delete a budget
  - Show month-to-date **expense total per budget category**
- **AI Insight**
  - Dropdown prompts + **Other** (custom prompt textbox)
  - Sends request to backend using the `prompt` key and returns a summary for the currently filtered expenses

## Repository structure

- `client/budget-buddy/`: React frontend
- `server/`: Django backend
  - `server/budget_buddy/`: Django project
  - `server/api/`: API app (models, endpoints)
- `docker-compose.yml`: PostgreSQL container (and a MongoDB container image; MongoDB is not used by the Django app currently)

## Prerequisites

- **Node.js**: 18+ recommended
- **Python**: 3.11+ recommended
- **Docker Desktop** (recommended) OR a local PostgreSQL install

## Quick start (recommended)

### 1) Start PostgreSQL (Docker)

From the repo root:

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` with:

- **DB**: `mydb`
- **User**: `user`
- **Password**: `password`

These match the default Django settings in `server/budget_buddy/settings.py`.

### 2) Backend (Django)

Create and activate a virtual environment (example):

```bash
python -m venv .venv
.\.venv\Scripts\activate
```

Install dependencies (minimum required):

```bash
pip install django djangorestframework psycopg[binary] pyjwt django-cors-headers requests
```

Run migrations and start the server:

```bash
cd server
python manage.py migrate
python manage.py runserver
```

Backend will run at `http://localhost:8000/` and the API base URL is:

- `http://localhost:8000/api/`

### 3) Frontend (React)

In a new terminal:

```bash
cd client/budget-buddy
npm install
npm start
```

Frontend will run at `http://localhost:3000/`.

## Environment / configuration

### OpenAI API key (AI Insight)

The backend reads the OpenAI key from `server/budget_buddy/settings.py`:

- `OPENAI_API_KEY = ''`

Set it before using AI Insight. For development, you can place it there directly.

If the key is missing, the endpoint returns:

- `success: false` with message **"OpenAI API key not configured."**

### API base URL (frontend)

The frontend uses Axios base URL configured in:

- `client/budget-buddy/src/axiosConfig.js`

Default:

- `http://localhost:8000/api/`

## API endpoints

All endpoints are under the `/api/` prefix (see `server/budget_buddy/urls.py` and `server/api/urls.py`).

### Auth

- `POST /api/signup/`
  - body: `{ "username": "...", "password": "..." }`
- `POST /api/login/`
  - body: `{ "username": "...", "password": "..." }`
  - returns: `{ "token": "..." }`

### Expenses

- `POST /api/add-expense/`
  - body: `{ "amount": "...", "description": "...", "category": "...", "date": "YYYY-MM-DD" }`
- `GET /api/expenses/`
- `PUT /api/expenses/<expense_id>/`
- `DELETE /api/expenses/<expense_id>/`

### Budgets

- `POST /api/add-budget/`
  - body: `{ "amount": "...", "category": "...", "source": "...", "date": "YYYY-MM-DD" }`
- `GET /api/budgets/`
- `PUT /api/budgets/<budget_id>/`
- `DELETE /api/budgets/<budget_id>/`

### Category expense totals (for budgets)

- `GET /api/category-expense-total/?category=<category>`
  - returns month-to-date total expenses for that category

### AI Insight

- `POST /api/openai-expense-summary/`
  - body: `{ "expenses": [...], "prompt": "..." }`
  - `prompt` is the selected dropdown question, or the typed “Other” text.

## How the AI prompt UI works

In the Expense History page (`client/budget-buddy/src/history.js`):

- Dropdown includes:
  - "Are my expenses increasing or decreasing over time?"
  - "Which category has shown the biggest change over the past month?"
  - "On which day of the week do I spend the most?"
  - "Which type of expense is most frequent?"
  - "Other"
- If **Other** is selected, a textbox appears.
- When you click **AI Insight**, the request is sent with:
  - `prompt: <selectedOrCustomPrompt>`

## Troubleshooting

- **401 errors / redirected to login**: token is missing/expired; login again.
- **DB errors**: ensure Docker Postgres is running and the credentials in `server/budget_buddy/settings.py` match your DB.
- **AI Insight fails**: set `OPENAI_API_KEY` on the backend.

