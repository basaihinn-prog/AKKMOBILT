import React, { useState } from 'react';
import { Sparkles, Send, Brain, Bot, HelpCircle } from 'lucide-react';
import { ChatMessage } from '../types';

interface AIPredictionsProps {
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  userInput: string;
  setUserInput: (val: string) => void;
  aiTyping: boolean;
  setAiTyping: (val: boolean) => void;
  onSendMessage: (msg?: string) => Promise<void>;
}

export default function AIPredictions({
  chatMessages,
  userInput,
  setUserInput,
  aiTyping,
  onSendMessage
}: AIPredictionsProps) {
  const [quickPrompts] = useState([
    'Analyze gross margins and total system-wide sales',
    'Which branch has low stock levels? Recommend stock balancing steps',
    'Draft a Gold-Tier campaign text message to boost accessories sales',
    'What is our highest selling device, and what are its core specifications?'
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ai-predictions-component">
      {/* Quick Prompts Panel */}
      <div className="lg:col-span-4 bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-900 pb-3">
          <Brain className="w-5 h-5 text-pink-400" />
          <h4 className="font-extrabold text-sm font-mono text-slate-100 uppercase tracking-wider">AKK Brain Copilot</h4>
        </div>
        <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
          The AKK Mobile Enterprise Intelligence Engine is synced directly to our active branches (Yangon, Mandalay, Naypyitaw), financial general ledgers, and CRM directories.
        </p>

        <div className="space-y-2.5 pt-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Suggested Inquiries</span>
          <div className="space-y-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSendMessage(p)}
                disabled={aiTyping}
                className="w-full text-left text-[11px] bg-slate-950 hover:bg-slate-900 disabled:opacity-50 text-slate-300 hover:text-pink-300 font-mono p-3 rounded-xl border border-slate-900 hover:border-pink-500/20 transition-all flex items-start space-x-2"
              >
                <HelpCircle className="w-3.5 h-3.5 text-pink-500/60 shrink-0 mt-0.5" />
                <span>{p}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Conversation Engine */}
      <div className="lg:col-span-8 bg-slate-900/20 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between h-[520px]">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`p-2.5 rounded-lg shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-pink-500/10 border border-pink-500/20 text-pink-400'
                }`}
              >
                {msg.sender === 'user' ? (
                  <span className="font-bold text-xs font-mono">OP</span>
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs font-mono leading-relaxed whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-slate-900/60 text-slate-200 rounded-tr-none border border-slate-800'
                    : 'bg-slate-950 text-slate-300 rounded-tl-none border border-slate-900'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {aiTyping && (
            <div className="flex items-start space-x-3">
              <div className="p-2.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-950 border border-slate-900 px-4 py-3.5 rounded-2xl rounded-tl-none text-xs font-mono text-slate-400 flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-spin" />
                <span className="animate-pulse">Consulting branch databases & financial ledgers...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Dock */}
        <div className="border-t border-slate-900/80 pt-4 mt-4">
          <div className="flex items-center space-x-2.5">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSendMessage();
              }}
              placeholder="Ask for multi-branch balance strategy, VIP campaign copy, or financial audit..."
              disabled={aiTyping}
              className="flex-1 bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-pink-500/30 font-mono placeholder:text-slate-600 disabled:opacity-50"
            />
            <button
              onClick={() => onSendMessage()}
              disabled={aiTyping || !userInput.trim()}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black p-3 rounded-xl transition shadow-lg shadow-pink-500/10 shrink-0"
              title="Query AI Assistant"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
