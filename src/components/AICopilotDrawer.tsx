import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Mic,
  MicOff,
  User,
  Bot,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: `Hello! I am **Aether Copilot**, your real-time service operations intelligence engine.
I have access to live technician telemetry, open work orders, parts inventory, and SOP manuals across the fleet.

How can I assist your dispatch team today?`,
      timestamp: '09:00 AM',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      setInput(initialPrompt);
      sendMessage(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (userPrompt?: string) => {
    const textToSend = userPrompt || input;
    if (!textToSend.trim() || loading) return;

    const newMsg: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const modelMsg: Message = {
        role: 'model',
        content: data.reply || 'No response received.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: 'Unable to reach the Gemini server endpoint right now. Please verify server connectivity.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const voiceTranscription = 'Technician Maya Chen just finished inspecting the commercial boiler pilot. Restored full operation for Presidio Hotels.';
      setInput(voiceTranscription);
    }, 2200);
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-slate-950 border-l border-slate-800 shadow-2xl z-50 flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Aether Copilot</h3>
            <div className="text-[11px] text-cyan-400 font-mono">Autonomous Fleet AI Assistant</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  isUser
                    ? 'bg-cyan-600 text-slate-950 font-bold'
                    : 'bg-slate-800 text-cyan-300 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-1 relative group ${
                  isUser
                    ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/30 rounded-tr-none'
                    : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line font-normal">{msg.content}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => copyToClipboard(msg.content, idx)}
                      className="opacity-0 group-hover:opacity-100 hover:text-slate-300 transition-opacity"
                      title="Copy response"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center text-xs border border-slate-700">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Aether Copilot is reasoning with live fleet context...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-900 bg-slate-950/60 overflow-x-auto flex items-center gap-2 text-xs">
        {[
          'Who is closest to Job #103?',
          'Summarize open jobs for Apex BioLabs',
          'SOP for Siemens VFD F0002 fault',
        ].map((q, i) => (
          <button
            key={i}
            onClick={() => sendMessage(q)}
            className="text-[11px] text-slate-400 hover:text-cyan-300 whitespace-nowrap bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/90 space-y-2">
        {isRecording && (
          <div className="text-[11px] text-amber-400 flex items-center gap-2 animate-pulse px-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Listening to voice dictation memo...</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSimulateVoice}
            className={`p-2 rounded-lg border transition-colors ${
              isRecording
                ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Voice Memo / Dictation"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask Copilot or issue fleet dispatch directives..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="p-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg disabled:opacity-40 transition-colors font-semibold"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
