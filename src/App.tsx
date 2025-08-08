
import React, { useState, useEffect } from 'react';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { PlayIcon } from './components/icons/PlayIcon';
import { StopIcon } from './components/icons/StopIcon';
import { DownloadIcon } from './components/icons/DownloadIcon';

// Helper component for sliders, defined outside the App component to prevent re-creation on re-renders.
interface ControlSliderProps {
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
}

const ControlSlider: React.FC<ControlSliderProps> = ({ label, value, onChange, min = 0, max = 2, step = 0.1 }) => (
  <div className="flex flex-col space-y-2">
    <label htmlFor={label} className="text-sm font-medium text-zinc-400">
      {label} <span className="text-white font-bold">{value.toFixed(1)}</span>
    </label>
    <input
      id={label}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
    />
  </div>
);

// Helper component for voice selector, defined outside the App component.
interface VoiceSelectorProps {
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ isSupported, voices, selectedVoice, onVoiceChange }) => {
  if (!isSupported) {
    return <p className="text-center text-red-500">Speech synthesis not supported in this browser.</p>;
  }

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="voice" className="text-sm font-medium text-zinc-400">
        Voice
      </label>
      <select
        id="voice"
        value={selectedVoice?.name || ''}
        onChange={onVoiceChange}
        disabled={voices.length === 0}
        className="w-full p-3 bg-zinc-700/80 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
      >
        {voices.length > 0 ? (
          voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {`${voice.name} (${voice.lang})`}
            </option>
          ))
        ) : (
          <option value="">Loading voices...</option>
        )}
      </select>
    </div>
  );
};


const App: React.FC = () => {
  const [text, setText] = useState<string>("Hello, world! This is a modern text-to-speech synthesizer. Try typing something new, even a very long text!");
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const { isSupported, isSpeaking, voices, speak, cancel } = useSpeechSynthesis();

  useEffect(() => {
    if (voices.length > 0 && !voice) {
      // Set a default voice once they are loaded for better user experience.
      const defaultVoice = voices.find(v => v.default) || voices[0];
      setVoice(defaultVoice);
    }
  }, [voices, voice]);

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVoice = voices.find((v) => v.name === e.target.value);
    setVoice(selectedVoice || null);
  };

  const handleSpeak = () => {
    if (text.trim() !== '') {
      speak({ text, voice, rate, pitch, volume });
    }
  };
  
  const handleDownload = async () => {
    if (text.trim() === '') return;

    setIsDownloading(true);
    setDownloadError(null);

    const CHUNK_SIZE = 200; // Max characters per API request
    const chunks: string[] = [];
    
    // Split text into chunks, trying to preserve full words.
    let remainingText = text.trim();
    while (remainingText.length > 0) {
      if (remainingText.length <= CHUNK_SIZE) {
        chunks.push(remainingText);
        break;
      }
      
      let splitPos = remainingText.lastIndexOf(' ', CHUNK_SIZE);
      if (splitPos === -1) { // If a single word is longer than CHUNK_SIZE
        splitPos = CHUNK_SIZE;
      }
      
      chunks.push(remainingText.substring(0, splitPos));
      remainingText = remainingText.substring(splitPos).trim();
    }

    const lang = voice ? voice.lang.split('-')[0] : 'en';

    try {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (chunk.trim() === '') continue;

        const encodedText = encodeURIComponent(chunk);
        // The original Google Translate URL is the target.
        const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodedText}&tl=${lang}`;
        
        // We wrap it with a CORS proxy to bypass browser security restrictions.
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`Network response was not ok for chunk ${i + 1}. Status: ${response.status}`);
        
        const blob = await response.blob();
        // Check if the response is an error page from Google, which might be HTML.
        if (blob.type.includes('html')) {
          throw new Error(`Received an error page for chunk ${i + 1}. The API may have rejected the request.`);
        }

        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = chunks.length > 1 ? `speech_part_${i + 1}.mp3` : 'speech.mp3';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);

        // Add a small delay between downloads to prevent issues.
        if (chunks.length > 1 && i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      setDownloadError(`Download failed: ${message}`);
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-500 mb-8 text-center">
        Text-To-Speech Synthesizer
      </h1>
      <div className="w-full max-w-2xl mx-auto bg-zinc-800/50 backdrop-blur-lg border border-zinc-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 transform transition-all">
        
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (downloadError) setDownloadError(null);
            }}
            className="w-full h-96 p-4 bg-zinc-900/70 border border-zinc-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
            placeholder="Enter text here..."
            aria-label="Text to synthesize"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <VoiceSelector
            isSupported={isSupported}
            voices={voices}
            selectedVoice={voice}
            onVoiceChange={handleVoiceChange}
          />
          <div className="grid grid-cols-1 gap-4">
            <ControlSlider label="Rate" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} />
            <ControlSlider label="Pitch" value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))} />
            <ControlSlider label="Volume" value={volume} max={1} onChange={(e) => setVolume(parseFloat(e.target.value))} />
          </div>
        </div>
        
        {downloadError && (
            <div className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg text-sm border border-red-500/30">
                <p>{downloadError}</p>
            </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-zinc-700/80">
          <button
            onClick={handleSpeak}
            disabled={isSpeaking || !isSupported || text.trim() === ''}
            className="flex-1 sm:flex-none flex items-center justify-center min-w-[140px] px-4 py-3 font-semibold rounded-lg transition-all duration-300 bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 shadow-lg hover:shadow-blue-500/40 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {isSpeaking ? (
              <><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Speaking...</>
            ) : (
              <><PlayIcon className="mr-2"/>Speak</>
            )}
          </button>
          <button
            onClick={cancel}
            disabled={!isSpeaking || !isSupported}
            className="flex-1 sm:flex-none flex items-center justify-center min-w-[140px] px-4 py-3 font-semibold rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <StopIcon className="mr-2"/>Stop
          </button>
          <button
            onClick={handleDownload}
            disabled={isSpeaking || isDownloading || !isSupported || text.trim() === ''}
            title={'Download as MP3'}
            className="flex-1 sm:flex-none flex items-center justify-center min-w-[140px] px-4 py-3 font-semibold rounded-lg transition-all duration-300 bg-blue-800 hover:bg-blue-700 shadow-lg hover:shadow-blue-800/40 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {isDownloading ? (
              <><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Downloading...</>
            ) : (
              <><DownloadIcon className="mr-2"/>Download</>
            )}
          </button>
        </div>
      </div>

       <footer className="text-center mt-8 text-zinc-500 text-sm max-w-2xl mx-auto px-4">
          <p>Live speech is powered by the browser's Web Speech API.</p>
          <p>Download functionality uses a separate service; voice may differ from live preview. Long text will be downloaded as multiple audio files.</p>
       </footer>
    </div>
  );
};

export default App;
