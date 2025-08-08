
export interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  voices: SpeechSynthesisVoice[];
  speak: (options: { text: string; voice: SpeechSynthesisVoice | null; rate: number; pitch: number; volume: number; }) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
}
