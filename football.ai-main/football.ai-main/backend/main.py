# Help me create a Cedar chat component
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import fitz  # PyMuPDF
import io
import base64
import os
from typing import List, Dict, Any
from pydantic import BaseModel
import uuid
from datetime import datetime
from dotenv import load_dotenv
from google import genai
from google.genai import types
import json

# Load environment variables
load_dotenv()
API_KEY = os.getenv("GENAI_API_KEY")
if not API_KEY:
    raise ValueError("GENAI_API_KEY not found in .env file!")

# Initialize Gemini client
client = genai.Client(api_key=API_KEY)

# Setup Google Search grounding
grounding_tool = types.Tool(google_search=types.GoogleSearch())
config = types.GenerateContentConfig(tools=[grounding_tool])

# FastAPI setup
app = FastAPI(title="PDF Editor API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("processed", exist_ok=True)
os.makedirs("static", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Pydantic models
class AnnotationData(BaseModel):
    id: str
    type: str
    x: float
    y: float
    width: float = 0
    height: float = 0
    text: str = ""
    color: str = "#000000"
    size: int = 2
    page: int = 0
    points: List[Dict[str, float]] = []

class PDFEditRequest(BaseModel):
    file_id: str
    annotations: List[AnnotationData]
    page: int = 0

class NFLQuestionRequest(BaseModel):
    question: str

class QuarterbackStatsRequest(BaseModel):
    game_id: str
    away_team: str
    home_team: str
    league: str = "nfl"

class GameSummaryRequest(BaseModel):
    game_id: str
    away_team: str
    home_team: str
    league: str = "nfl"

class GameDetailsRequest(BaseModel):
    game_id: str
    away_team: str
    home_team: str
    league: str = "nfl"

# Cedar Chat Models
class ChatMessage(BaseModel):
    id: str
    role: str  # "user" or "assistant"
    content: str
    timestamp: str
    session_id: str

class ChatRequest(BaseModel):
    message: str
    session_id: str = None
    context: str = "general"  # "general", "nfl", "pdf", etc.

class ChatResponse(BaseModel):
    message: ChatMessage
    session_id: str
    status: str = "success"

# File storage in memory
file_storage = {}

# Cedar Chat storage
chat_sessions = {}  # session_id -> list of ChatMessage

# Cedar Chat helper functions
def create_chat_session() -> str:
    """Create a new chat session and return session ID"""
    session_id = str(uuid.uuid4())
    chat_sessions[session_id] = []
    return session_id

def add_message_to_session(session_id: str, role: str, content: str) -> ChatMessage:
    """Add a message to a chat session"""
    if session_id not in chat_sessions:
        chat_sessions[session_id] = []
    
    message = ChatMessage(
        id=str(uuid.uuid4()),
        role=role,
        content=content,
        timestamp=datetime.now().isoformat(),
        session_id=session_id
    )
    
    chat_sessions[session_id].append(message)
    return message

def get_chat_history(session_id: str) -> List[ChatMessage]:
    """Get chat history for a session"""
    return chat_sessions.get(session_id, [])

def clear_chat_session(session_id: str) -> bool:
    """Clear all messages from a chat session"""
    if session_id in chat_sessions:
        chat_sessions[session_id] = []
        return True
    return False

def cedar_chat_response(user_message: str, session_id: str, context: str = "general") -> str:
    """Generate AI response using Gemini for Cedar chat"""
    # Get recent chat history for context
    history = get_chat_history(session_id)
    recent_messages = history[-10:]  # Last 10 messages for context
    
    # Build context-aware prompt
    if context == "nfl":
        system_prompt = """You are Cedar, an NFL expert assistant specializing in detailed statistical analysis and data-driven insights. 

FORMATTING RULES:
- Use # for headers instead of **bold text**
- Use • for bullet points instead of * asterisks
- Use numbered lists (1., 2., 3.) for sequential information
- Use **bold** only for key statistics and important numbers
- Never use standalone asterisks (*) for bullet points

DATA FOCUS REQUIREMENTS:
- Always include specific statistics, records, and numerical data
- Provide current season stats, career milestones, and historical comparisons
- Include percentages, rankings, and performance metrics
- Mention specific games, dates, and achievements
- Use concrete numbers rather than general statements

IMPORTANT: Always provide concrete, factual information with specific data points. Never use phrases like "information not available", "would require further search", "assume they are", or any placeholder text."""
    elif context == "pdf":
        system_prompt = """You are Cedar, a PDF editing assistant. Help users with PDF annotation, editing, and document management.

FORMATTING RULES:
- Use # for headers instead of **bold text**
- Use • for bullet points instead of * asterisks
- Use numbered lists (1., 2., 3.) for sequential information

IMPORTANT: Always provide concrete, actionable information. Never use phrases like "information not available", "would require further search", or any placeholder text."""
    else:
        system_prompt = """You are Cedar, a helpful AI assistant focused on providing detailed, data-rich responses.

FORMATTING RULES:
- Use # for headers instead of **bold text**
- Use • for bullet points instead of * asterisks
- Use numbered lists (1., 2., 3.) for sequential information
- Use **bold** only for key statistics and important numbers
- Never use standalone asterisks (*) for bullet points

DATA FOCUS REQUIREMENTS:
- Always include specific statistics, metrics, and numerical data when relevant
- Provide concrete examples and specific details
- Include percentages, rankings, and performance indicators where applicable
- Use concrete numbers rather than general statements

IMPORTANT: Always provide concrete, factual information. Never use phrases like "information not available", "would require further search", "assume they are", "for this report we'll assume", or any placeholder text."""
    
    # Build conversation context
    conversation_context = ""
    for msg in recent_messages:
        conversation_context += f"{msg.role}: {msg.content}\n"
    
    prompt = f"""{system_prompt}

RESPONSE GUIDELINES:
- Provide direct, factual answers with specific data points
- Use clear, confident language with concrete numbers
- Avoid disclaimers about data availability
- Include statistics, percentages, rankings, and metrics
- Use proper formatting: # for headers, • for bullets, **bold** for key stats
- Never include phrases like "information not available" or "would require further search"
- Focus on quantifiable information and measurable outcomes

Conversation history:
{conversation_context}

User: {user_message}
Cedar:"""
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=config
        )
        return response.text.strip()
    except Exception as e:
        return f"I apologize, but I'm having trouble processing your request right now. Error: {str(e)}"

# Helper: hex color to RGB tuple
def hex_to_rgb(hex_color: str):
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i+2], 16)/255 for i in (0, 2, 4))

# Load existing PDFs safely
def load_existing_files():
    uploads_dir = "uploads"
    if not os.path.exists(uploads_dir):
        return
    
    for filename in os.listdir(uploads_dir):
        if not filename.lower().endswith(".pdf"):
            continue
        
        file_id = filename.split("_")[0]
        file_path = os.path.join(uploads_dir, filename)
        try:
            pdf_doc = fitz.open(file_path)
            page_rect = pdf_doc[0].rect
            
            file_info = {
                "file_id": file_id,
                "filename": filename,
                "file_path": file_path,
                "total_pages": pdf_doc.page_count,
                "page_size": {"width": page_rect.width, "height": page_rect.height},
                "created_at": datetime.fromtimestamp(os.path.getctime(file_path)).isoformat()
            }
            
            file_storage[file_id] = file_info
            pdf_doc.close()
            print(f"Loaded existing file: {file_id}")
        except Exception as e:
            print(f"Skipping invalid PDF {filename}: {e}")

# Load existing files at startup
load_existing_files()

# ====================== Gemini NFL functions ======================
def ask_nfl_expert(question: str) -> str:
    prompt = (
        "You are an NFL expert analyst. Provide detailed, accurate insights.\n\n"
        f"User question: {question}"
    )
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=config
    )
    return response.text

def get_quarterback_stats(game_id: str, away_team: str, home_team: str, league: str = "nfl") -> Dict[str, Any]:
    prompt = (
        f"You are an NFL expert analyst. For {away_team} vs {home_team} (Game ID: {game_id}), "
        "provide quarterback stats (completion %, passing yards, completions, attempts) in JSON format. "
        "Return zeros if not available."
    )
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=config
        )
        stats_data = json.loads(response.text)
        return stats_data
    except Exception:
        # Return default empty stats
        return {
            "away_team": {"quarterback_name": "Unknown", "completion_percentage": 0.0, "passing_yards": 0, "completions": 0, "attempts": 0},
            "home_team": {"quarterback_name": "Unknown", "completion_percentage": 0.0, "passing_yards": 0, "completions": 0, "attempts": 0}
        }

# ====================== API Endpoints ======================
@app.get("/")
async def root():
    return {"message": "PDF Editor API is running!"}

@app.get("/debug/files")
async def debug_files():
    return {"loaded_files": list(file_storage.keys()), "file_count": len(file_storage)}

@app.post("/ask-nfl-expert")
async def ask_nfl_expert_endpoint(request: NFLQuestionRequest):
    try:
        answer = ask_nfl_expert(request.question)
        return {"answer": answer, "question": request.question}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/quarterback-stats")
async def get_quarterback_stats_endpoint(request: QuarterbackStatsRequest):
    try:
        stats = get_quarterback_stats(request.game_id, request.away_team, request.home_team, request.league)
        return {"game_id": request.game_id, "away_team": request.away_team, "home_team": request.home_team, "league": request.league, "quarterback_stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_game_summary(game_id: str, away_team: str, home_team: str, league: str = "nfl") -> Dict[str, Any]:
    """
    Get comprehensive game summary using Gemini AI.
    """
    prompt = (
        f"You are an NFL expert analyst. For the game between {away_team} and {home_team} (Game ID: {game_id}, League: {league.upper()}), "
        "please provide a comprehensive game summary including player statistics, team performance, and key moments. "
        "Return the data in JSON format with the following structure:\n"
        "{\n"
        '  "gameInfo": {\n'
        '    "gameId": "' + game_id + '",\n'
        '    "awayTeam": "' + away_team + '",\n'
        '    "homeTeam": "' + home_team + '",\n'
        '    "league": "' + league + '"\n'
        "  },\n"
        '  "awayTeam": {\n'
        '    "score": 0,\n'
        '    "stats": {\n'
        '      "totalYards": 0,\n'
        '      "passingYards": 0,\n'
        '      "rushingYards": 0,\n'
        '      "turnovers": 0,\n'
        '      "timeOfPossession": "00:00",\n'
        '      "firstDowns": 0,\n'
        '      "penalties": 0,\n'
        '      "penaltyYards": 0\n'
        "    }\n"
        "  },\n"
        '  "homeTeam": {\n'
        '    "score": 0,\n'
        '    "stats": {\n'
        '      "totalYards": 0,\n'
        '      "passingYards": 0,\n'
        '      "rushingYards": 0,\n'
        '      "turnovers": 0,\n'
        '      "timeOfPossession": "00:00",\n'
        '      "firstDowns": 0,\n'
        '      "penalties": 0,\n'
        '      "penaltyYards": 0\n'
        "    }\n"
        "  },\n"
        '  "players": [\n'
        '    {\n'
        '      "id": "player-1",\n'
        '      "name": "Player Name",\n'
        '      "position": "QB",\n'
        '      "team": "' + away_team + '",\n'
        '      "jersey": "12",\n'
        '      "gameStats": {\n'
        '        "passingYards": 0,\n'
        '        "passingTDs": 0,\n'
        '        "rushingYards": 0,\n'
        '        "tackles": 0\n'
        "      }\n"
        "    }\n"
        "  ]\n"
        "}\n"
        "If the game hasn't started yet or data is not available, return zeros for all statistics."
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=config
        )
        
        # Try to parse the JSON response
        import json
        try:
            summary_data = json.loads(response.text)
            return summary_data
        except json.JSONDecodeError:
            # If JSON parsing fails, return a structured response
            return {
                "gameInfo": {
                    "gameId": game_id,
                    "awayTeam": away_team,
                    "homeTeam": home_team,
                    "league": league
                },
                "awayTeam": {
                    "score": 0,
                    "stats": {
                        "totalYards": 0,
                        "passingYards": 0,
                        "rushingYards": 0,
                        "turnovers": 0,
                        "timeOfPossession": "00:00",
                        "firstDowns": 0,
                        "penalties": 0,
                        "penaltyYards": 0
                    }
                },
                "homeTeam": {
                    "score": 0,
                    "stats": {
                        "totalYards": 0,
                        "passingYards": 0,
                        "rushingYards": 0,
                        "turnovers": 0,
                        "timeOfPossession": "00:00",
                        "firstDowns": 0,
                        "penalties": 0,
                        "penaltyYards": 0
                    }
                },
                "players": []
            }
    except Exception as e:
        print(f"Error getting game summary: {e}")
        return {
            "gameInfo": {
                "gameId": game_id,
                "awayTeam": away_team,
                "homeTeam": home_team,
                "league": league
            },
            "awayTeam": {"score": 0, "stats": {}},
            "homeTeam": {"score": 0, "stats": {}},
            "players": []
        }

def get_game_details(game_id: str, away_team: str, home_team: str, league: str = "nfl") -> Dict[str, Any]:
    """
    Get detailed game information using Gemini AI.
    """
    prompt = (
        f"You are an NFL expert analyst. For the game between {away_team} and {home_team} (Game ID: {game_id}, League: {league.upper()}), "
        "please provide detailed game information including play-by-play highlights, key moments, and comprehensive statistics. "
        "Return the data in JSON format with the following structure:\n"
        "{\n"
        '  "gameId": "' + game_id + '",\n'
        '  "competitions": [\n'
        '    {\n'
        '      "competitors": [\n'
        '        {\n'
        '          "homeAway": "away",\n'
        '          "score": "0",\n'
        '          "statistics": [\n'
        '            {\n'
        '              "label": "Total Yards",\n'
        '              "stats": [{"label": "Total Yards", "value": "0"}]\n'
        "            }\n"
        "          ]\n"
        "        },\n"
        '        {\n'
        '          "homeAway": "home",\n'
        '          "score": "0",\n'
        '          "statistics": [\n'
        '            {\n'
        '              "label": "Total Yards",\n'
        '              "stats": [{"label": "Total Yards", "value": "0"}]\n'
        "            }\n"
        "          ]\n"
        "        }\n"
        "      ]\n"
        "    }\n"
        "  ],\n"
        '  "status": {\n'
        '    "type": {\n'
        '      "name": "STATUS_SCHEDULED"\n'
        "    }\n"
        "  }\n"
        "}\n"
        "If the game hasn't started yet or data is not available, return zeros for all statistics."
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=config
        )
        
        # Try to parse the JSON response
        import json
        try:
            details_data = json.loads(response.text)
            return details_data
        except json.JSONDecodeError:
            # If JSON parsing fails, return a structured response
            return {
                "gameId": game_id,
                "competitions": [{
                    "competitors": [
                        {
                            "homeAway": "away",
                            "score": "0",
                            "statistics": [{"label": "Total Yards", "stats": [{"label": "Total Yards", "value": "0"}]}]
                        },
                        {
                            "homeAway": "home", 
                            "score": "0",
                            "statistics": [{"label": "Total Yards", "stats": [{"label": "Total Yards", "value": "0"}]}]
                        }
                    ]
                }],
                "status": {"type": {"name": "STATUS_SCHEDULED"}}
            }
    except Exception as e:
        print(f"Error getting game details: {e}")
        return {
            "gameId": game_id,
            "competitions": [{"competitors": []}],
            "status": {"type": {"name": "STATUS_SCHEDULED"}}
        }

@app.post("/game-summary")
async def get_game_summary_endpoint(request: GameSummaryRequest):
    """Get comprehensive game summary using Gemini AI"""
    try:
        summary = get_game_summary(request.game_id, request.away_team, request.home_team, request.league)
        return {
            "game_id": request.game_id,
            "away_team": request.away_team,
            "home_team": request.home_team,
            "league": request.league,
            "game_summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting game summary: {str(e)}")

@app.post("/game-details")
async def get_game_details_endpoint(request: GameDetailsRequest):
    """Get detailed game information using Gemini AI"""
    try:
        details = get_game_details(request.game_id, request.away_team, request.home_team, request.league)
        return {
            "game_id": request.game_id,
            "away_team": request.away_team,
            "home_team": request.home_team,
            "league": request.league,
            "game_details": details
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting game details: {str(e)}")

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    file_id = str(uuid.uuid4())
    file_path = f"uploads/{file_id}_{file.filename}"
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    try:
        pdf_doc = fitz.open(stream=content, filetype="pdf")
        page_rect = pdf_doc[0].rect
        file_info = {
            "file_id": file_id,
            "filename": file.filename,
            "file_path": file_path,
            "total_pages": pdf_doc.page_count,
            "page_size": {"width": page_rect.width, "height": page_rect.height},
            "created_at": datetime.now().isoformat()
        }
        file_storage[file_id] = file_info
        
        # Generate page previews
        page_images = []
        for page_num in range(pdf_doc.page_count):
            page = pdf_doc[page_num]
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
            img_base64 = base64.b64encode(pix.tobytes("png")).decode()
            page_images.append(img_base64)
        
        pdf_doc.close()
        return JSONResponse({
            "file_id": file_id,
            "filename": file.filename,
            "total_pages": file_info["total_pages"],
            "page_size": file_info["page_size"],
            "page_images": page_images,
            "message": "PDF uploaded successfully"
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid PDF: {e}")

@app.get("/pdf-info/{file_id}")
async def get_pdf_info(file_id: str):
    if file_id not in file_storage:
        raise HTTPException(status_code=404, detail="File not found")
    return file_storage[file_id]

@app.post("/add-annotations")
async def add_annotations(request: PDFEditRequest):
    if request.file_id not in file_storage:
        raise HTTPException(status_code=404, detail="File not found")
    file_info = file_storage[request.file_id]
    
    try:
        pdf_doc = fitz.open(file_info["file_path"])
        if request.page >= pdf_doc.page_count:
            raise HTTPException(status_code=400, detail="Page number out of range")
        
        page = pdf_doc[request.page]
        for annotation in request.annotations:
            color_rgb = hex_to_rgb(annotation.color)
            if annotation.type == "text":
                page.insert_text(fitz.Point(annotation.x, annotation.y), annotation.text, fontsize=annotation.size, color=color_rgb)
            elif annotation.type == "rectangle":
                page.draw_rect(fitz.Rect(annotation.x, annotation.y, annotation.x+annotation.width, annotation.y+annotation.height), color=color_rgb, width=annotation.size)
            elif annotation.type == "circle":
                center = fitz.Point(annotation.x + annotation.width/2, annotation.y + annotation.height/2)
                radius = annotation.width / 2
                page.draw_circle(center, radius, color=color_rgb, width=annotation.size)
            elif annotation.type == "drawing" and len(annotation.points) > 1:
                points = [fitz.Point(p["x"], p["y"]) for p in annotation.points]
                page.draw_polyline(points, color=color_rgb, width=annotation.size)
        
        output_path = f"processed/{request.file_id}_edited.pdf"
        pdf_doc.save(output_path)
        pdf_doc.close()
        return {"message": "Annotations added successfully", "output_path": output_path}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/download-pdf/{file_id}")
async def download_pdf(file_id: str):
    if file_id not in file_storage:
        raise HTTPException(status_code=404, detail="File not found")
    output_path = f"processed/{file_id}_edited.pdf"
    if not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="Edited PDF not found")
    return FileResponse(output_path, filename=f"edited_{file_storage[file_id]['filename']}", media_type="application/pdf")

@app.delete("/pdf/{file_id}")
async def delete_pdf(file_id: str):
    if file_id not in file_storage:
        raise HTTPException(status_code=404, detail="File not found")
    file_info = file_storage[file_id]
    
    for path in [file_info["file_path"], f"processed/{file_id}_edited.pdf", f"processed/{file_id}_final.pdf"]:
        if os.path.exists(path):
            os.remove(path)
    
    del file_storage[file_id]
    return {"message": "PDF deleted successfully"}

# ====================== Cedar Chat API Endpoints ======================
@app.post("/chat", response_model=ChatResponse)
async def cedar_chat(request: ChatRequest):
    """Main Cedar chat endpoint"""
    try:
        # Create session if not provided
        session_id = request.session_id or create_chat_session()
        
        # Add user message to session
        user_message = add_message_to_session(session_id, "user", request.message)
        
        # Generate AI response
        ai_response = cedar_chat_response(request.message, session_id, request.context)
        
        # Add AI response to session
        assistant_message = add_message_to_session(session_id, "assistant", ai_response)
        
        return ChatResponse(
            message=assistant_message,
            session_id=session_id,
            status="success"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@app.get("/chat-history/{session_id}")
async def get_chat_history_endpoint(session_id: str):
    """Get chat history for a session"""
    try:
        history = get_chat_history(session_id)
        return {
            "session_id": session_id,
            "messages": history,
            "message_count": len(history)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat history: {str(e)}")

@app.post("/chat/new-session")
async def create_new_chat_session():
    """Create a new chat session"""
    try:
        session_id = create_chat_session()
        return {
            "session_id": session_id,
            "message": "New chat session created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating session: {str(e)}")

@app.delete("/chat/{session_id}")
async def clear_chat_session_endpoint(session_id: str):
    """Clear all messages from a chat session"""
    try:
        success = clear_chat_session(session_id)
        if success:
            return {"message": "Chat session cleared successfully", "session_id": session_id}
        else:
            raise HTTPException(status_code=404, detail="Session not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing session: {str(e)}")

@app.get("/chat/sessions")
async def list_chat_sessions():
    """List all active chat sessions"""
    try:
        sessions = []
        for session_id, messages in chat_sessions.items():
            sessions.append({
                "session_id": session_id,
                "message_count": len(messages),
                "last_message_time": messages[-1].timestamp if messages else None
            })
        return {"sessions": sessions, "total_sessions": len(sessions)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing sessions: {str(e)}")

# ====================== Run server ======================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
