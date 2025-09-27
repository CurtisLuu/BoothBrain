#!/usr/bin/env python3
"""
Test script to verify all PDF processing solutions
"""

import requests
import json

def test_backend_original():
    """Test the original PyMuPDF backend"""
    print("🔧 Testing Original Backend (PyMuPDF)...")
    try:
        response = requests.get("http://localhost:8000", timeout=5)
        if response.status_code == 200:
            print("✅ Original backend is running")
            return True
        else:
            print("❌ Original backend not responding")
            return False
    except Exception as e:
        print(f"❌ Original backend error: {e}")
        return False

def test_backend_alternative():
    """Test the alternative pdf2image backend"""
    print("\n🔧 Testing Alternative Backend (pdf2image)...")
    try:
        response = requests.get("http://localhost:8001", timeout=5)
        if response.status_code == 200:
            print("✅ Alternative backend is running")
            return True
        else:
            print("❌ Alternative backend not responding")
            return False
    except Exception as e:
        print(f"❌ Alternative backend error: {e}")
        return False

def test_frontend():
    """Test if frontend is running"""
    print("\n🔧 Testing Frontend...")
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is running")
            return True
        else:
            print("❌ Frontend not responding")
            return False
    except Exception as e:
        print(f"❌ Frontend error: {e}")
        return False

def main():
    print("🚀 PDF Editor Solutions Test")
    print("=" * 50)
    
    # Test all components
    frontend_ok = test_frontend()
    backend_orig_ok = test_backend_original()
    backend_alt_ok = test_backend_alternative()
    
    print("\n📊 Results Summary:")
    print(f"Frontend (React): {'✅ Running' if frontend_ok else '❌ Not Running'}")
    print(f"Backend Original (PyMuPDF): {'✅ Running' if backend_orig_ok else '❌ Not Running'}")
    print(f"Backend Alternative (pdf2image): {'✅ Running' if backend_alt_ok else '❌ Not Running'}")
    
    print("\n🎯 Recommended Usage:")
    if frontend_ok:
        print("1. ✅ Use PDF.js Editor (Frontend-only) - Most reliable")
        print("   - No backend required")
        print("   - Works with any PDF file")
        print("   - No 'orphaned object' errors")
    else:
        print("1. ❌ Start frontend with: npm start")
    
    if backend_alt_ok:
        print("2. ✅ Use Alternative Backend (pdf2image) - More reliable than PyMuPDF")
        print("   - Start with: python backend/start_alt.py")
    elif backend_orig_ok:
        print("2. ⚠️  Use Original Backend (PyMuPDF) - May have issues with some PDFs")
        print("   - Start with: python backend/main.py")
    else:
        print("2. ❌ No backends running")
    
    print("\n🔧 To start backends:")
    print("   Original: cd backend && python main.py")
    print("   Alternative: cd backend && python start_alt.py")

if __name__ == "__main__":
    main()
