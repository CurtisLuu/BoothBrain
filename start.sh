#!/bin/bash

echo "Starting Football AI Application..."
echo

echo "Starting Frontend (React)..."
cd frontend
npm start &
FRONTEND_PID=$!

echo
echo "Waiting 5 seconds for frontend to start..."
sleep 5

echo
echo "Starting Backend (Python)..."
cd ../backend
python main.py &
BACKEND_PID=$!

echo
echo "Application started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000"
echo
echo "Press Ctrl+C to stop all services..."

# Function to cleanup processes on exit
cleanup() {
    echo
    echo "Stopping services..."
    kill $FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    exit
}

# Trap Ctrl+C
trap cleanup INT

# Wait for processes
wait
