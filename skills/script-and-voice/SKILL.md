---
name: script-and-voice
description: Writes the hook, script and beats for a video in the locked style, generates the voiceover with Voice Studio, cleans and assembles it, and produces word timings every other department cuts to. Use when a video needs a script, hook, VO, voice clone, retake, breath cleanup, or word-level timings from an existing voice.
---

# Script and voice

Read the style first: `style.lock.json` → `script_voice` and `format.structure` (or `styles.py show <id> --section script_voice`).

## Script
1. Structure from `format.structure`; length inside `format.length_s`.
2. **Hook in the first 3 s** following `script_voice.hook_rule` (for ad stories: the ad's most famous moment, then the question).
3. One idea per line, short sentences in the style's `tone`. Mark beats (hook, setup, turns, numbers, quotes, payoff, CTA) as word indices in `src/data/beats.json`.
4. Every claim checked against a source; unconfirmed facts flagged in the reply and DELIVERY_NOTES.
5. Display spellings (digits, real names) vs spoken spellings ("nineteen eighty-three", "Teel" for Thiel) in `src/data/script.json`.
6. CTA exactly as the style's `script_voice.cta`.
7. Original audio from a source clip is never voiced: leave a timed gap.

## Voice
- Generate, clean, assemble and transcribe following `references/voice-studio-and-timings.md` (Voice Studio at 127.0.0.1:3900 from a browser tab; default clone `f61a9893` at 1.06 unless the style says otherwise; gentle breath reduction, never muting; clarity EQ chain; faster-whisper word timings; difflib alignment to display tokens).
- On-camera talent (talking-head styles): transcribe the take instead and keep its audio; never re-voice a person.
- Output: `src/media/vo.wav` and `src/data/words.json` `{duration, words:[{text,start,end}]}`; `wf(i) = round((start + voStart) * fps)`.

## Learn
Notes about voice, tone, pacing of delivery or CTA wording that should hold for future videos → `style-library log/set` on `script_voice`.
