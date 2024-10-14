@echo off

echo Installing backend dependencies...
cd backend
npm install
cd ..
cd frontend
npm install
cd ..

echo Starting backend and frontend servers...
cd frontend
npm run dev

pause
