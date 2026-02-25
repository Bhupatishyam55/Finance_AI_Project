"""
fraud_detection.py - PII Detection, Metadata Forensics, and Advanced NLP
"""
import re
import io
import os
import logging
import threading
from typing import List, Dict
from pypdf import PdfReader

# Configure logging
logger = logging.getLogger(__name__)

# ------------------------------------------------------------------
# spaCy LAZY LOADING (CRITICAL FOR RAILWAY)
# ------------------------------------------------------------------

_nlp = None
_nlp_lock = threading.Lock()

def get_nlp():
    """
    Lazily loads the spaCy model only when needed.
    Prevents Railway out-of-memory crashes during startup.
    """
    global _nlp
    if _nlp is None:
        with _nlp_lock:
            if _nlp is None:
                try:
                    import spacy
                    _nlp = spacy.load("en_core_web_sm")
                    logger.info("spaCy model loaded successfully")
                except Exception as e:
                    logger.warning(
                        f"spaCy model 'en_core_web_sm' not available: {e}. "
                        "Advanced entity extraction disabled."
                    )
                    _nlp = None
    return _nlp

# ------------------------------------------------------------------
# PII DETECTION (UNCHANGED)
# ------------------------------------------------------------------

def detect_pii(text: str) -> tuple:
    """Detects PAN and Aadhaar in text. Returns (detected_list, confidence).
    Confidence increases with number of PII types found.
    """
    detected = []

    if not text:
        return detected, 0.0

    if re.findall(r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b', text.upper()):
        detected.append("PAN_DETECTED")

    aadhaar_pattern = r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b'
    if re.findall(aadhaar_pattern, text):
        detected.append("AADHAAR_DETECTED")

    confidence = 0.75 if len(detected) == 1 else (0.95 if len(detected) > 1 else 0.0)
    return detected, confidence

# ------------------------------------------------------------------
# ADVANCED NLP ENTITY EXTRACTION (UNCHANGED LOGIC)
# ------------------------------------------------------------------

def extract_advanced_entities(text: str) -> Dict[str, List[str]]:
    """
    Uses spaCy NER to find Organizations, People, and Locations.
    This adds a layer of 'Advanced NLP' to the project for vendor/person verification.
    """
    entities = {"ORG": [], "PERSON": [], "GPE": []}
    if not text:
        return entities

    nlp = get_nlp()
    if not nlp:
        return entities

    doc = nlp(text)

    for ent in doc.ents:
        if ent.label_ in entities:
            entities[ent.label_].append(ent.text.strip())

    # Remove duplicates
    for key in entities:
        entities[key] = list(set(entities[key]))

    return entities

# ------------------------------------------------------------------
# METADATA ANALYSIS (UNCHANGED)
# ------------------------------------------------------------------

def analyze_metadata(file_bytes: bytes, extracted_text: str) -> tuple:
    """Compares hidden file year with visible text year.
    Returns (message, confidence) or (None, 0.0).
    """
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        meta = reader.metadata
        if not meta:
            return None, 0.0

        creation_date = str(meta.get('/CreationDate', ''))
        year_match = re.search(r'(\d{4})', creation_date)
        if year_match:
            pdf_year = int(year_match.group(1))
            text_years = [int(y) for y in re.findall(r'\b(20\d{2})\b', extracted_text)]
            if text_years and pdf_year > max(text_years):
                year_diff = pdf_year - max(text_years)
                confidence = 0.92 if year_diff >= 4 else 0.78
                return "METADATA_MISMATCH: Hidden year is later than document year", confidence

        creator = str(meta.get('/Creator', '')).lower()
        if 'canva' in creator:
            return "SUSPICIOUS_CREATOR_TOOL: Canva", 0.85

    except Exception:
        pass

    return None, 0.0
