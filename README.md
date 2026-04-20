# Feed Formulation System

This repository contains the complete Feed Formulation System, now split into a modern decoupled architecture.

## Project Structure

* **`/backend`**: The Python FastAPI backend. Contains the AI logic (Groq integration), database schemas, formulation optimizer, and API routes.
* **`/frontend`**: The React + Vite frontend application. A responsive Single Page Application (SPA) providing a rich diagnostic dashboard and formulation interface.

## How to Run

### 1. Start the Backend
Open a terminal and run:
```bash
cd backend
source venv/bin/activate  # On Windows use: venv\Scripts\activate
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`.

### 2. Start the Frontend
Open a separate terminal and run:
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.
