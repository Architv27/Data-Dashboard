# Data Dashboard

Welcome to the **Data Dashboard**! This project is a comprehensive dashboard application designed for fintech businesses to manage products, analyze sales data, and gain valuable insights through interactive charts and tables. The application comprises a **frontend** built with React and a **backend** developed using FastAPI.

## Table of Contents

- [Project Structure](#project-structure)
- [Python Requirements](#python-requirements)
- [Setup Steps](#setup-steps)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Running the Application](#running-the-application)
  - [Starting the Backend Server](#starting-the-backend-server)
  - [Starting the Frontend Application](#starting-the-frontend-application)
- [Usage](#usage)
  - [Product Management](#product-management)
  - [Exporting Data](#exporting-data)
  - [Help & Support](#help--support)
- [License](#license)
- [Contact](#contact)
- [Troubleshooting](#troubleshooting)

---

## Project Structure

data-dashboard/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── UserReviews.tsx
│   │   │   ├── HelpSection.tsx
│   │   │   └── ...other components
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   ├── App.css
│   │   └── ...other files
│   ├── .env
│   ├── package.json
│   └── ...other configuration files
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── crud.py
│   │   └── ...other backend files
│   ├── requirements.txt
│   ├── .env
│   └── ...other configuration files
├── README.md
└── ...other root files

---

## Python Requirements

Ensure all Python dependencies are installed for the backend. These are listed below and should be included in your `requirements.txt` file located in the `backend` directory.

```plaintext
annotated-types==0.7.0
anyio==4.6.0
click==8.1.7
colorama==0.4.6
exceptiongroup==1.2.2
fastapi==0.115.0
greenlet==3.1.1
h11==0.14.0
idna==3.10
psycopg2-binary==2.9.9
pydantic==2.9.2
pydantic-core==2.23.4
sniffio==1.3.1
SQLAlchemy==2.0.35
starlette==0.38.6
typing-extensions==4.12.2
uvicorn==0.31.0

```plaintext
Setup Steps

cd backend
python -m venv venv
venv\Scripts\activate
pip install
pip install --upgrade pip
pip install -r requirements.txt
cd ..

cd ..
cd frontend
npm install --legacy-peer-deps
npm run dev