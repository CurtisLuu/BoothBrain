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
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from io import BytesIO

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

class PDFGeminiRequest(BaseModel):
    file_id: str
    text: str
    prompt: str = ""

class PDFGenerationRequest(BaseModel):
    file_id: str
    edited_text: str
    filename: str = "edited_document.pdf"

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
    
    print(f"Uploaded file: {file.filename} with ID: {file_id}")
    
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
        
        print(f"Stored file info for ID: {file_id}")
        print(f"Total files in storage: {len(file_storage)}")
        
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

@app.get("/list-files")
async def list_files():
    """List all files in storage for debugging"""
    return {
        "files": file_storage,
        "count": len(file_storage)
    }

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

@app.post("/process-pdf-gemini")
async def process_pdf_with_gemini(request: PDFGeminiRequest):
    """Process PDF text with Gemini AI for analysis"""
    try:
        # Check if file exists
        if request.file_id not in file_storage:
            raise HTTPException(status_code=404, detail="PDF file not found")
        
        file_info = file_storage[request.file_id]
        
        # Prepare the prompt for Gemini
        base_prompt = f"""You are an AI assistant analyzing a PDF document. Please provide a helpful and detailed response to the user's question.

**Document Information:**
- Filename: {file_info.get('filename', 'Unknown')}
- File ID: {request.file_id}
- Total Pages: {file_info.get('total_pages', 'Unknown')}

**Document Content:**
{request.text}

**User's Question/Request:**
{request.prompt if request.prompt else "Please provide a comprehensive analysis of this document, including key insights, main topics, and important information."}

**Instructions:**
- Answer the user's question directly and helpfully
- If it's a resume, highlight key skills, experiences, and achievements
- If it's a technical document, explain the main concepts and findings
- If it's a general document, provide insights and key takeaways
- Be specific and reference actual content from the document
- Format your response clearly with bullet points or sections as appropriate

Please provide a detailed, helpful response:"""
        
        # Use Gemini to analyze the text
        try:
            print(f"Calling Gemini API with prompt length: {len(base_prompt)}")
            print(f"User question: {request.prompt}")
            
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=base_prompt,
                config=config
            )
            
            analysis = response.text if hasattr(response, 'text') else str(response)
            print(f"Gemini response length: {len(analysis)}")
            
            return {
                "file_id": request.file_id,
                "analysis": analysis,
                "timestamp": datetime.now().isoformat(),
                "status": "success"
            }
            
        except Exception as gemini_error:
            print(f"Gemini API error: {gemini_error}")
            print(f"Error type: {type(gemini_error)}")
            
            # Try without Google Search grounding
            try:
                print("Retrying without Google Search grounding...")
                simple_config = types.GenerateContentConfig()
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=base_prompt,
                    config=simple_config
                )
                
                analysis = response.text if hasattr(response, 'text') else str(response)
                print(f"Gemini response (no grounding): {len(analysis)}")
                
                return {
                    "file_id": request.file_id,
                    "analysis": analysis,
                    "timestamp": datetime.now().isoformat(),
                    "status": "success_no_grounding"
                }
                
            except Exception as simple_error:
                print(f"Simple Gemini API error: {simple_error}")
                
                # Fallback analysis
                analysis = f"""**PDF Text Analysis**

**Document:** {file_info.get('filename', 'Unknown')}
**File ID:** {request.file_id}

**Text Summary:**
The document contains {len(request.text.split())} words and {len(request.text.split('.'))} sentences.

**Key Observations:**
- Text length: {len(request.text)} characters
- Estimated reading time: {len(request.text.split()) // 200} minutes
- Document appears to be a {file_info.get('total_pages', 'multi')}-page document

**Note:** Gemini AI analysis is temporarily unavailable. This is a basic analysis of the text structure.

**Original Request:** {request.prompt if request.prompt else 'General analysis requested'}"""
                
                return {
                    "file_id": request.file_id,
                    "analysis": analysis,
                    "timestamp": datetime.now().isoformat(),
                    "status": "fallback",
                    "error": "Gemini API temporarily unavailable"
                }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF with Gemini: {str(e)}")

@app.post("/generate-pdf")
async def generate_pdf(request: PDFGenerationRequest):
    """Generate a PDF from edited text"""
    try:
        if request.file_id not in file_storage:
            raise HTTPException(status_code=404, detail="PDF file not found")
        
        file_info = file_storage[request.file_id]
        original_filename = file_info.get('filename', 'document.pdf')
        
        # Create PDF in memory
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        
        # Get styles
        styles = getSampleStyleSheet()
        
        # Create custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30,
            alignment=1,  # Center alignment
            textColor=colors.darkblue
        )
        
        body_style = ParagraphStyle(
            'CustomBody',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=12,
            leading=14
        )
        
        # Build the PDF content
        story = []
        
        # Add title
        title = f"Edited Document - {original_filename}"
        story.append(Paragraph(title, title_style))
        story.append(Spacer(1, 20))
        
        # Add metadata
        metadata = f"<b>Original File:</b> {original_filename}<br/>"
        metadata += f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}<br/>"
        metadata += f"<b>File ID:</b> {request.file_id}<br/>"
        story.append(Paragraph(metadata, body_style))
        story.append(Spacer(1, 20))
        
        # Add edited text
        story.append(Paragraph("<b>Edited Content:</b>", body_style))
        story.append(Spacer(1, 10))
        
        # Split text into paragraphs and add them
        paragraphs = request.edited_text.split('\n\n')
        for para in paragraphs:
            if para.strip():
                # Clean up the text for PDF
                clean_para = para.strip().replace('\n', '<br/>')
                story.append(Paragraph(clean_para, body_style))
                story.append(Spacer(1, 6))
        
        # Build PDF
        doc.build(story)
        
        # Get PDF content
        pdf_content = buffer.getvalue()
        buffer.close()
        
        # Convert to base64 for JSON response
        pdf_base64 = base64.b64encode(pdf_content).decode()
        
        return {
            "file_id": request.file_id,
            "filename": request.filename,
            "pdf_data": f"data:application/pdf;base64,{pdf_base64}",
            "size_bytes": len(pdf_content),
            "timestamp": datetime.now().isoformat(),
            "status": "success"
        }
        
    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")

@app.get("/pdf-preview/{file_id}")
async def get_pdf_preview(file_id: str):
    """Get PDF preview images"""
    try:
        if file_id not in file_storage:
            raise HTTPException(status_code=404, detail="PDF file not found")
        
        file_info = file_storage[file_id]
        file_path = file_info["file_path"]
        
        print(f"Generating preview for file_id: {file_id}")
        print(f"File path: {file_path}")
        
        # Generate preview images using PyMuPDF
        pdf_doc = fitz.open(file_path)
        preview_images = []
        total_pages = pdf_doc.page_count
        
        # Limit to first 3 pages for preview
        max_pages = min(3, total_pages)
        
        print(f"Processing {max_pages} pages out of {total_pages} total pages")
        
        for page_num in range(max_pages):
            page = pdf_doc[page_num]
            # Convert page to image
            mat = fitz.Matrix(2.0, 2.0)  # 2x zoom for better quality
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")
            
            # Convert to base64 for JSON response
            import base64
            img_base64 = base64.b64encode(img_data).decode()
            preview_images.append({
                "page_number": page_num + 1,
                "image_data": f"data:image/png;base64,{img_base64}"
            })
            print(f"Generated preview for page {page_num + 1}")
        
        pdf_doc.close()
        
        print(f"Successfully generated {len(preview_images)} preview images")
        
        return {
            "file_id": file_id,
            "preview_images": preview_images,
            "total_pages": total_pages,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Error generating PDF preview: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating PDF preview: {str(e)}")

@app.post("/extract-pdf-text")
async def extract_pdf_text(request: dict):
    """Extract text from a PDF file"""
    try:
        file_id = request.get("file_id")
        if not file_id:
            raise HTTPException(status_code=400, detail="file_id is required")
        
        print(f"Extracting text for file_id: {file_id}")
        print(f"Available files in storage: {list(file_storage.keys())}")
            
        if file_id not in file_storage:
            raise HTTPException(status_code=404, detail=f"PDF file not found. Available files: {list(file_storage.keys())}")
        
        file_info = file_storage[file_id]
        file_path = file_info["file_path"]
        
        print(f"Extracting text from: {file_path}")
        
        # Extract text using PyMuPDF
        pdf_doc = fitz.open(file_path)
        extracted_text = ""
        total_pages = pdf_doc.page_count
        
        for page_num in range(total_pages):
            page = pdf_doc[page_num]
            text = page.get_text()
            extracted_text += f"\n--- Page {page_num + 1} ---\n{text}\n"
        
        pdf_doc.close()
        
        print(f"Extracted {len(extracted_text)} characters from {total_pages} pages")
        
        return {
            "file_id": file_id,
            "extracted_text": extracted_text,
            "total_pages": total_pages,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Error extracting text: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error extracting text: {str(e)}")

# ====================== Run server ======================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
