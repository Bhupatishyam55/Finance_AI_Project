# vector_store.py
import os
import json
import threading
import faiss
import numpy as np

# ------------------------------------------------------------------
# MEMORY SAFETY (IMPORTANT FOR RAILWAY)
# ------------------------------------------------------------------

# Limit CPU threads to reduce RAM usage
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"

# Lazy-loaded model (DO NOT load or import at startup)
_model = None
_model_lock = threading.Lock()

def get_model():
    """
    Lazily loads the SentenceTransformer model.
    Torch is imported ONLY when this function is called.
    """
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                from sentence_transformers import SentenceTransformer
                _model = SentenceTransformer(
                    "sentence-transformers/all-MiniLM-L6-v2",
                    device="cpu"
                )
    return _model

# ------------------------------------------------------------------
# PATHS (UNCHANGED)
# ------------------------------------------------------------------

INDEX_PATH = "docs.index"
HASH_PATH = "hash.json"

# ------------------------------------------------------------------
# FAISS INDEX HANDLING (UNCHANGED LOGIC)
# ------------------------------------------------------------------

def get_faiss_index():
    """
    Helper to load the FAISS index or create a fresh one if missing.
    Ensures the system doesn't crash after a reset or on first deployment.
    """
    dimension = 384
    if os.path.exists(INDEX_PATH):
        try:
            return faiss.read_index(INDEX_PATH)
        except Exception as e:
            print(f"Index corrupted or empty, recreating: {e}")

    # Create a fresh index using Inner Product (for Cosine Similarity)
    index = faiss.IndexFlatIP(dimension)
    faiss.write_index(index, INDEX_PATH)
    return index

# ------------------------------------------------------------------
# DUPLICATE SEARCH (UNCHANGED LOGIC)
# ------------------------------------------------------------------

def search_duplicate(text: str, img_hash: str):
    """
    Requirement: The Duplicate Hunter.
    Checks for exact visual matches via pHash and semantic matches via FAISS vectors.
    """

    # 1. Check Image Hash Database (Visual Match)
    if os.path.exists(HASH_PATH):
        try:
            with open(HASH_PATH, "r") as f:
                hashes = json.load(f)
                if img_hash and img_hash in hashes:
                    return True, 1.0
        except Exception:
            pass

    # 2. Check Vector Similarity (Semantic Match)
    index = get_faiss_index()
    if index.ntotal == 0:
        return False, 0.0

    # Convert text to vector and normalize for Cosine Similarity
    model = get_model()
    vector = model.encode([text])
    faiss.normalize_L2(vector)

    # Search for nearest neighbor
    D, I = index.search(vector, 1)

    # Threshold for duplicate detection: 0.90 (90% similarity)
    if D[0][0] >= 0.90:
        return True, float(D[0][0])

    return False, 0.0

# ------------------------------------------------------------------
# ADD TO INDEX (UNCHANGED LOGIC)
# ------------------------------------------------------------------

def add_to_index(text: str, img_hash: str):
    """
    Stores the document's vector and image hash to the local database.
    This allows future uploads to be compared against this document.
    """

    # Update Hash JSON (Visual fingerprinting)
    hashes = {}
    if os.path.exists(HASH_PATH):
        try:
            with open(HASH_PATH, "r") as f:
                hashes = json.load(f)
        except Exception:
            hashes = {}

    if img_hash:
        hashes[img_hash] = True
        with open(HASH_PATH, "w") as f:
            json.dump(hashes, f)

    # Update FAISS Index (Semantic fingerprinting)
    model = get_model()
    vector = model.encode([text])
    faiss.normalize_L2(vector)

    index = get_faiss_index()
    index.add(vector)

    # Save updated index
    faiss.write_index(index, INDEX_PATH)
