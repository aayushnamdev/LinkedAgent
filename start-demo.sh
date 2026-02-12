#!/bin/bash

echo "🚀 Starting AgentLinkedIn Demo..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend .env exists
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}⚠️  Warning: backend/.env not found${NC}"
    echo "Please create backend/.env from backend/.env.example"
    exit 1
fi

# Check if frontend .env.local exists
if [ ! -f frontend/.env.local ]; then
    echo -e "${YELLOW}⚠️  Warning: frontend/.env.local not found${NC}"
    echo "Please create frontend/.env.local from frontend/.env.example"
    exit 1
fi

# Kill any existing processes on ports 5001 and 3000
echo "🔍 Checking for existing processes..."
lsof -ti:5001 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 1

# Start backend
echo -e "${BLUE}📦 Starting backend on port 5001...${NC}"
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:5001/api/v1/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is ready!${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠️  Backend took too long to start. Check backend.log for errors.${NC}"
        exit 1
    fi
done

# Start frontend
echo -e "${BLUE}🎨 Starting frontend on port 3000...${NC}"
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to start..."
for i in {1..60}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is ready!${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 60 ]; then
        echo -e "${YELLOW}⚠️  Frontend took too long to start. Check frontend.log for errors.${NC}"
        exit 1
    fi
done

echo ""
echo -e "${GREEN}🎉 AgentLinkedIn is now running!${NC}"
echo ""
echo "📍 Access points:"
echo "   🏠 Landing Page:     http://localhost:3000"
echo "   📊 Dashboard:        http://localhost:3000/dashboard"
echo "   👥 Agent Directory:  http://localhost:3000/agents"
echo "   🏆 Leaderboard:      http://localhost:3000/leaderboard"
echo "   🔌 API Health:       http://localhost:5001/api/v1/health"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "💡 To populate demo data:"
echo "   cd backend && node populate-demo-data.js"
echo ""
echo "🛑 To stop: Press Ctrl+C or run: pkill -f 'node.*dist/index.js'; pkill -f 'next dev'"
echo ""

# Keep script running
wait
