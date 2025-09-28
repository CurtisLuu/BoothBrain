import uvicorn
import os

if __name__ == "__main__":
    # Ensure the UPLOAD_DIR exists
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    uvicorn.run("main_alt:app", host="0.0.0.0", port=8001, reload=True)
