from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import re

from app.deps import get_current_user
from app.db import get_db
from app.models import ToolLog, User
from app.schemas import ToolRequest, ToolResponse
from app.services.ai_provider import AIProviderError, detect_ai_text, humanize_text as ai_humanize_text, paraphrase_text as ai_paraphrase_text

router = APIRouter(prefix="/api/v1/tools", tags=["tools"])


def split_words(text: str) -> list[str]:
    return [w for w in text.strip().split() if w]


def split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [p.strip() for p in parts if p.strip()]


def detector_output(text: str) -> str:
    words = split_words(text.lower())
    if not words:
        return "Please provide text for analysis."

    sentences = split_sentences(text)
    ai_markers = [
        "optimize",
        "leverage",
        "therefore",
        "furthermore",
        "utilize",
        "objective",
        "in conclusion",
        "moreover",
        "additionally",
        "robust",
        "streamline",
        "enhance",
    ]
    lower = text.lower()
    hits = sum(1 for marker in ai_markers if marker in lower)
    avg_word_length = sum(len(word) for word in words) / len(words)

    unique_ratio = len(set(words)) / max(len(words), 1)
    punctuation_density = (lower.count(",") + lower.count(";")) / max(len(sentences), 1)
    sentence_lengths = [len(split_words(s)) for s in sentences] or [0]
    length_span = max(sentence_lengths) - min(sentence_lengths)

    score = 18
    score += hits * 8
    score += max(0, int((avg_word_length - 4.8) * 9))
    score += 8 if punctuation_density > 1.2 else 0
    score += 7 if unique_ratio < 0.62 else 0
    score += 7 if length_span < 6 else 0
    score = max(5, min(97, score))

    confidence = "High" if score >= 75 else "Medium" if score >= 50 else "Low"
    return (
        "AI Detection Report\n\n"
        f"AI likelihood: {score}%\n"
        f"Human likelihood: {100 - score}%\n\n"
        f"Confidence: {confidence}\n"
        f"Signals found: {hits} marker patterns\n"
        f"Average word length: {avg_word_length:.2f}\n"
        f"Vocabulary diversity: {unique_ratio:.2f}\n"
        f"Sentence variation span: {length_span} words"
    )


def paraphraser_output(text: str) -> str:
    sentences = split_sentences(text)
    if not sentences:
        return "Paraphrased Output\n\nPlease provide text to paraphrase."

    replacements = {
        "very": "highly",
        "important": "critical",
        "good": "strong",
        "make": "create",
        "show": "demonstrate",
        "use": "apply",
        "help": "assist",
        "big": "significant",
        "small": "limited",
        "problem": "challenge",
        "solution": "approach",
        "because": "since",
        "so": "therefore",
    }

    rewritten: list[str] = []
    for i, sentence in enumerate(sentences):
        transformed = sentence
        for source, target in replacements.items():
            transformed = re.sub(rf"\b{source}\b", target, transformed, flags=re.IGNORECASE)

        # Introduce structural change so output is not a near copy.
        if "," in transformed and i % 2 == 0:
            parts = [p.strip() for p in transformed.split(",") if p.strip()]
            if len(parts) >= 2:
                tail = re.sub(r"[.!?]+$", "", parts[-1]).strip()
                head = re.sub(r"[.!?]+$", "", ", ".join(parts[:-1])).strip().lower()
                ending = "." if transformed.strip().endswith(".") else ""
                transformed = f"{tail}, while {head}{ending}"

        if i % 3 == 0 and not transformed.lower().startswith("in summary"):
            transformed = f"In summary, {transformed[0].lower() + transformed[1:] if len(transformed) > 1 else transformed}"

        rewritten.append(transformed)

    return f"Paraphrased Output\n\n{' '.join(rewritten)}"


def humanizer_output(text: str) -> str:
    sentences = split_sentences(text)
    if not sentences:
        return "Humanized Output\n\nPlease provide text to humanize."

    output = text
    output = re.sub(r"\bobjective\b", "goal", output, flags=re.IGNORECASE)
    output = re.sub(r"\butilize\b", "use", output, flags=re.IGNORECASE)
    output = re.sub(r"\btherefore\b", "so", output, flags=re.IGNORECASE)
    output = re.sub(r"\bfurthermore\b", "also", output, flags=re.IGNORECASE)
    output = re.sub(r"\bin order to\b", "to", output, flags=re.IGNORECASE)
    output = re.sub(r"\bhowever\b", "but", output, flags=re.IGNORECASE)
    output = re.sub(r"\bdemonstrate\b", "show", output, flags=re.IGNORECASE)

    contractions = {
        r"\bdo not\b": "don't",
        r"\bcannot\b": "can't",
        r"\bit is\b": "it's",
        r"\bthat is\b": "that's",
        r"\bwe are\b": "we're",
        r"\bthey are\b": "they're",
    }
    for pattern, replacement in contractions.items():
        output = re.sub(pattern, replacement, output, flags=re.IGNORECASE)

    # Add sentence rhythm for more human tone.
    lines = split_sentences(output)
    varied: list[str] = []
    for i, line in enumerate(lines):
        line = line.strip()
        if i % 2 == 1 and not line.lower().startswith("also"):
            line = f"Also, {line[0].lower() + line[1:] if len(line) > 1 else line}"
        varied.append(line)

    output = " ".join(varied)
    return f"Humanized Output\n\n{output}"


def save_log(db: Session, user: User, tool_name: str, input_text: str, output_text: str) -> None:
    log = ToolLog(user_id=user.id, tool_name=tool_name, input_text=input_text, output_text=output_text)
    db.add(log)
    db.commit()


@router.post("/detect", response_model=ToolResponse)
def detect_text(
    payload: ToolRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        output = detect_ai_text(payload.text)
    except AIProviderError:
        output = detector_output(payload.text)
    save_log(db, user, "detector", payload.text, output)
    return ToolResponse(output=output)


@router.post("/paraphrase", response_model=ToolResponse)
def paraphrase_text(
    payload: ToolRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        output = ai_paraphrase_text(payload.text)
    except AIProviderError:
        output = paraphraser_output(payload.text)
    save_log(db, user, "paraphraser", payload.text, output)
    return ToolResponse(output=output)


@router.post("/humanize", response_model=ToolResponse)
def humanize_text(
    payload: ToolRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        output = ai_humanize_text(payload.text)
    except AIProviderError:
        output = humanizer_output(payload.text)
    save_log(db, user, "humanizer", payload.text, output)
    return ToolResponse(output=output)
