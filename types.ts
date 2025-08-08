
export interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  voices: SpeechSynthesisVoice[];
  speak: (options: { text: string; voice: SpeechSynthesisVoice | null; rate: number; pitch: number; volume: number; }) => void;
  cancel: () => void;
}
