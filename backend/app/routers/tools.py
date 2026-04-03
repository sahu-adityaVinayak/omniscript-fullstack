from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_current_user
from app.db import get_db
from app.models import ToolLog, User
from app.schemas import ToolRequest, ToolResponse
from app.services.ai_provider import AIProviderError, detect_ai_text, humanize_text as ai_humanize_text, paraphrase_text as ai_paraphrase_text

router = APIRouter(prefix="/api/v1/tools", tags=["tools"])


def split_words(text: str) -> list[str]:
    return [w for w in text.strip().split() if w]


def detector_output(text: str) -> str:
    words = split_words(text.lower())
    if not words:
        return "Please provide text for analysis."

    ai_markers = ["optimize", "leverage", "therefore", "furthermore", "utilize", "objective"]
    hits = sum(1 for marker in ai_markers if marker in text.lower())
    avg_word_length = sum(len(word) for word in words) / len(words)
    score = min(95, round(hits * 11 + avg_word_length * 4))
    return (
        "AI Detection Report\n\n"
        f"AI likelihood: {score}%\n"
        f"Human likelihood: {100 - score}%\n\n"
        f"Markers found: {hits}\n"
        f"Average word length: {avg_word_length:.2f}"
    )


def paraphraser_output(text: str) -> str:
    replacements = {
        "very": "highly",
        "important": "critical",
        "good": "strong",
        "make": "create",
        "show": "demonstrate",
    }

    output = text
    for source, target in replacements.items():
        output = output.replace(source, target).replace(source.capitalize(), target.capitalize())

    return f"Paraphrased Output\n\n{output}"


def humanizer_output(text: str) -> str:
    output = (
        text.replace("objective", "goal")
        .replace("Objective", "Goal")
        .replace("therefore", "so")
        .replace("Furthermore", "Also")
        .replace("furthermore", "also")
        .replace("utilize", "use")
    )
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
