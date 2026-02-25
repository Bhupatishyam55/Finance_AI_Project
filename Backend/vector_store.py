# vector_store.py
import os
import json
import hashlib
import logging
import threading
import faiss
import numpy as np

# Configure logging
logger = logging.getLogger(__name__)

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
SHA256_PATH = "sha256.json"

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
# DUPLICATE SEARCH — 3-LAYER DETECTION
# ------------------------------------------------------------------

def search_duplicate(text: str, img_hash: str, sha256_hash: str = ""):
    """
    Requirement: The Duplicate Hunter.
    Layer 0: SHA-256 exact byte-level match (fastest — catches re-uploads of identical files).
    Layer 1: pHash visual match (catches identical images/scanned pages).
    Layer 2: Semantic vector similarity via FAISS (catches same content, different format/scan).
    """

    # Layer 0 — SHA-256 exact match
    if sha256_hash and os.path.exists(SHA256_PATH):
        try:
            with open(SHA256_PATH, "r") as f:
                sha_db = json.load(f)
                if sha256_hash in sha_db:
                    logger.info(f"Duplicate detected via SHA-256: {sha256_hash}")
                    return True, 1.0
        except (IOError, json.JSONDecodeError) as e:
            logger.warning(f"Failed to read sha256 file: {e}")

    # Layer 1 — pHash visual match
    if os.path.exists(HASH_PATH):
        try:
            with open(HASH_PATH, "r") as f:
                hashes = json.load(f)
                if img_hash and img_hash in hashes:
                    logger.info(f"Duplicate detected via pHash: {img_hash}")
                    return True, 1.0
        except (IOError, json.JSONDecodeError) as e:
            logger.warning(f"Failed to read hash file: {e}")

    # Layer 2 — Semantic vector similarity
    # Skip if text is too short to be meaningful (e.g., OCR returned nothing)
    if not text or len(text.strip()) < 20:
        return False, 0.0

    index = get_faiss_index()
    if index.ntotal == 0:
        return False, 0.0

    # Convert text to vector and normalize for Cosine Similarity
    model = get_model()
    vector = model.encode([text])
    faiss.normalize_L2(vector)

    # Search for nearest neighbor
    D, I = index.search(vector, 1)

    # Threshold: 0.85 (lowered from 0.90 to improve recall for scanned docs)
    if D[0][0] >= 0.85:
        logger.info(f"Duplicate detected via semantic similarity: {D[0][0]:.4f}")
        return True, float(D[0][0])

    return False, 0.0

# ------------------------------------------------------------------
# ADD TO INDEX (UNCHANGED LOGIC + SHA-256)
# ------------------------------------------------------------------

def add_to_index(text: str, img_hash: str, sha256_hash: str = ""):
    """
    Stores the document's vector, image hash, and SHA-256 hash to the local database.
    This allows future uploads to be compared against this document.
    """

    # Update SHA-256 JSON (byte-level fingerprint)
    if sha256_hash:
        sha_db = {}
        if os.path.exists(SHA256_PATH):
            try:
                with open(SHA256_PATH, "r") as f:
                    sha_db = json.load(f)
            except (IOError, json.JSONDecodeError) as e:
                logger.warning(f"Failed to read sha256 file, starting fresh: {e}")
                sha_db = {}
        sha_db[sha256_hash] = True
        with open(SHA256_PATH, "w") as f:
            json.dump(sha_db, f)

    # Update Hash JSON (Visual fingerprinting)
    hashes = {}
    if os.path.exists(HASH_PATH):
        try:
            with open(HASH_PATH, "r") as f:
                hashes = json.load(f)
        except (IOError, json.JSONDecodeError) as e:
            logger.warning(f"Failed to read hash file, starting fresh: {e}")
            hashes = {}

    if img_hash:
        hashes[img_hash] = True
        with open(HASH_PATH, "w") as f:
            json.dump(hashes, f)

    # Update FAISS Index (Semantic fingerprinting) — only if meaningful text
    if text and len(text.strip()) >= 20:
        model = get_model()
        vector = model.encode([text])
        faiss.normalize_L2(vector)

        index = get_faiss_index()
        index.add(vector)

        # Save updated index
        faiss.write_index(index, INDEX_PATH)
