import { useEffect, useMemo, useState } from 'react';
import type { PracticeQuestion } from '../types';

function buildSpeechText(question: PracticeQuestion, includeOptions: boolean) {
  if (!includeOptions) {
    return question.prompt;
  }

  const optionsText = question.options
    .map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`)
    .join('. ');

  return `${question.prompt}. ${optionsText}`;
}

export function useQuestionAudio() {
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const isSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window;

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
      window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const frenchVoice = useMemo(
    () => voices.find((voice) => voice.lang.toLowerCase().startsWith('fr')),
    [voices],
  );

  function stop() {
    if (!isSupported) {
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingKey(null);
  }

  function speak(question: PracticeQuestion, includeOptions = false) {
    if (!isSupported) {
      return;
    }

    stop();

    const utterance = new SpeechSynthesisUtterance(
      buildSpeechText(question, includeOptions),
    );
    utterance.lang = 'fr-FR';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    if (frenchVoice) {
      utterance.voice = frenchVoice;
    }

    utterance.onstart = () => {
      setSpeakingKey(question.id);
    };
    utterance.onend = () => {
      setSpeakingKey(null);
    };
    utterance.onerror = () => {
      setSpeakingKey(null);
    };

    window.speechSynthesis.speak(utterance);
  }

  return {
    isSupported,
    speakingKey,
    speak,
    stop,
  };
}
