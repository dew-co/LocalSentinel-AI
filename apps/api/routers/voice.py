from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/voice", tags=["voice"])


@router.get("/status")
def voice_status():
    return {
        "browserSpeechRecognition": True,
        "serverTranscription": False,
        "serverSpeechSynthesis": False,
        "wakeWord": False,
        "multilingual": False,
        "message": "MVP voice uses browser speech recognition and browser speech synthesis. Whisper/Piper integration is reserved for a future local server module.",
    }


@router.get("/engines")
def voice_engines():
    return {
        "speechToText": {
            "active": "browser",
            "browser": True,
            "whisperCpp": {"available": False, "enabled": False, "notes": "Future local offline STT engine."},
        },
        "textToSpeech": {
            "active": "browser",
            "browser": True,
            "piper": {"available": False, "enabled": False, "notes": "Future local offline TTS engine."},
            "coqui": {"available": False, "enabled": False, "notes": "Future local offline TTS option."},
        },
        "wakeWord": {"available": False, "enabled": False, "notes": "Only enable after explicit user opt-in."},
    }


@router.get("/settings/defaults")
def voice_settings_defaults():
    return {
        "voiceMode": True,
        "assistantTone": "friendly",
        "responseLength": "balanced",
        "storeVoiceSummaries": True,
        "wakeWord": False,
        "multilingualVoice": False,
    }
