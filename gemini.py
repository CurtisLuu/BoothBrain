# nfl_gemini.py
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables from .env
load_dotenv()
API_KEY = os.getenv("GENAI_API_KEY")

if not API_KEY:
    raise ValueError("GENAI_API_KEY not found in .env file!")

# Initialize Gemini client
client = genai.Client(api_key=API_KEY)

# Setup Google Search grounding
grounding_tool = types.Tool(
    google_search=types.GoogleSearch()
)
config = types.GenerateContentConfig(
    tools=[grounding_tool]
)

def ask_nfl_expert(question: str) -> str:
    """
    Ask Gemini a question as an NFL expert.
    """
    prompt = (
        "You are an NFL expert analyst. "
        "Always provide detailed, accurate, and up-to-date NFL insights, stats, and stories. "
        "Explain player performances, team strategies, and recent news as if you were a professional sports commentator.\n\n"
        f"User question: {question}"
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=config
    )

    return response.text

# Interactive loop
if __name__ == "__main__":
    print("🏈 NFL Expert Gemini Bot (type 'exit' to quit)")
    while True:
        question = input("\nYour question: ")
        if question.lower() in ["exit", "quit"]:
            print("Goodbye!")
            break
        try:
            answer = ask_nfl_expert(question)
            print(f"\nGemini: {answer}")
        except Exception as e:
            print(f"Error: {e}")
