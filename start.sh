#!/bin/bash

echo "Starting Football AI Application..."

echo ""
echo "Starting Backend Server..."
cd backend
pip install -r requirements.txt
python app.py &
BACKEND_PID=$!
cd ..

echo ""
echo "Starting Frontend Development Server..."
cd frontend
npm install
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "Both servers are starting..."
echo "Backend will be available at: http://localhost:5000"
echo "Frontend will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for processes
wait