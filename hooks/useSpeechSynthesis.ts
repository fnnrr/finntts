
import { useState, useEffect, useCallback } from 'react';
import { UseSpeechSynthesisReturn } from '../types';

export const useSpeechSynthesis = (): UseSpeechSynthesisReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  const updateVoices = useCallback(() => {
    if (synth) {
      setVoices(synth.getVoices());
    }
  }, [synth]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      updateVoices();
      if (synth) {
        synth.addEventListener('voiceschanged', updateVoices);
      }
    }

    return () => {
      if (synth) {
        synth.removeEventListener('voiceschanged', updateVoices);
      }
    };
  }, [synth, updateVoices]);

  const speak = useCallback((options: { text: string; voice: SpeechSynthesisVoice | null; rate: number; pitch: number; volume: number; }) => {
    const { text, voice, rate, pitch, volume } = options;
    if (!isSupported || !synth || isSpeaking) return;

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
    };
    
    if (voice) {
      utterance.voice = voice;
    }
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    
    synth.speak(utterance);
  }, [isSupported, synth, isSpeaking]);

  const cancel = useCallback(() => {
    if (!isSupported || !synth) return;
    synth.cancel();
    setIsSpeaking(false);
  }, [isSupported, synth]);
  
  useEffect(() => {
    return () => {
      if (isSpeaking && synth) {
        synth.cancel();
      }
    };
  }, [isSpeaking, synth]);

  return { isSupported, isSpeaking, voices, speak, cancel };
};
