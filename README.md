# Data Dashboard

# Data Dashboard Project Summary

## Overview

The **Data Dashboard** is a comprehensive, full-stack application designed to empower fintech businesses with robust tools for managing products, analyzing sales data, and deriving actionable insights through interactive visualizations. By seamlessly integrating a responsive frontend with a powerful backend API, the dashboard offers real-time data management and dynamic analytics, tailored to meet the demanding needs of the fintech sector.

## Objectives

- **Streamline Product Management**: Enable users to efficiently add, edit, and delete fintech products through an intuitive interface.
- **Enhance Data Analysis**: Provide advanced analytical tools and interactive charts to monitor sales performance and identify trends.
- **Facilitate Data Export**: Allow users to export product data in CSV format for offline analysis and reporting.
- **Improve User Support**: Incorporate a comprehensive help section with detailed instructions and frequently asked questions to assist users in navigating the dashboard.

## Features

1. **Product Management**:
   - **Add Products**: Users can input detailed product information, including pricing, discounts, ratings, and links.
   - **Edit Products**: Modify existing product details with ease.
   - **Delete Products**: Remove obsolete or incorrect product entries securely.
   - **Interactive Tables**: Sort, filter, and search through products to quickly find specific items.

2. **Data Visualization**:
   - **Analytics Dashboard**: Interactive charts and graphs displaying sales metrics, trends, and performance indicators.
   - **Responsive Design**: Visualizations adapt seamlessly to various screen sizes, ensuring accessibility on desktops, tablets, and mobile devices.

3. **Export Functionality**:
   - **CSV Export**: Download product data as CSV files, facilitating offline analysis and integration with other tools.

4. **Help & Support**:
   - **Comprehensive Help Section**: Detailed guides on using the dashboard features.
   - **Frequently Asked Questions (FAQ)**: Quick answers to common user queries.

5. **Notifications**:
   - **Real-Time Alerts**: Was in-progress but due to time constraint will be implemented later.
## Technologies Used

- **Frontend**:
  - **React & TypeScript**: Building a dynamic and type-safe user interface.
  - **Ant Design**: Leveraging a robust UI component library for consistent and professional design.
  - **Recharts**: Implementing responsive and customizable charts for data visualization.
  - **Styled-Components**: Facilitating component-level styling with dynamic and reusable styles.
  - **Axios**: Managing HTTP requests for seamless communication with the backend API.
  - **react-csv**: Enabling efficient CSV export functionality.

- **Backend**:
  - **FastAPI**: Developing a high-performance, asynchronous API server.
  - **SQLAlchemy**: Managing database interactions with an ORM for scalability and maintainability.
  - **Uvicorn**: Serving the FastAPI application with optimal performance.
  - **MongoDB**: Utilizing a reliable and scalable relational database system.

## Architecture

The application follows a **client-server** architecture:

- **Frontend**: A React-based application that interacts with users, rendering dynamic content and handling user interactions. It communicates with the backend API to perform CRUD (Create, Read, Update, Delete) operations on product data and fetch analytical insights.

- **Backend**: A FastAPI server that exposes RESTful endpoints to manage product data and provide analytical data for the frontend. It interfaces with a PostgreSQL database to store and retrieve information, ensuring data integrity and security.


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