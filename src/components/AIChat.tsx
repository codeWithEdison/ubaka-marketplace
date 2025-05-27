import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Minimize2, Maximize2, Zap } from 'lucide-react';
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const loadingMessages = [
  "✨ Analyzing your request...",
  "🧠 Gathering knowledge...",
  "⚡ Crafting the perfect response...",
  "🎯 Almost ready...",
  "✅ Finalizing thoughts..."
];

export default function AmazingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today? ✨',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen && !isMinimized) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);
    setLoadingMessageIndex(0);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: window.location.pathname
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get response from AI');
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Backdrop blur when chat is open */}
      {isOpen && !isMinimized && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300" />
      )}
      
      <div className="fixed bottom-6 right-6 z-50" ref={chatRef}>
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-75 blur-lg group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center h-full">
              <MessageCircle className="h-7 w-7 text-white drop-shadow-lg" />
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-colors duration-300" />
          </button>
        ) : (
          <div className={`
            flex flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl 
            shadow-2xl border border-white/20 dark:border-gray-700/30 transition-all duration-500 ease-out
            ${isMinimized 
              ? "w-80 h-16 hover:shadow-lg" 
              : "w-[480px] h-[640px] hover:shadow-purple-500/10"
            }
          `}>
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 dark:border-gray-700/30 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                   UBAKA  AI Assistant
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Online & Ready
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 dark:bg-gray-800/50 dark:hover:bg-gray-700/60 flex items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-full bg-white/20 hover:bg-red-500/20 dark:bg-gray-800/50 dark:hover:bg-red-500/20 flex items-center justify-center transition-all duration-200 hover:scale-105 group"
                >
                  <X className="h-4 w-4 group-hover:text-red-500" />
                </button>
              </div>
            </div>
            
            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-300/50 scrollbar-track-transparent"
                >
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex w-full animate-in slide-in-from-bottom-4 duration-500 ${
                        message.role === 'user' ? "justify-end" : "justify-start"
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-end gap-2 max-w-[85%]">
                        {message.role === 'assistant' && (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg flex-shrink-0">
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                        )}
                        
                        <div className="flex flex-col">
                          <div
                            className={`
                              rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl
                              ${message.role === 'user'
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md"
                                : "bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white rounded-bl-md border border-white/20 dark:border-gray-700/30"
                              }
                            `}
                          >
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({ node, ...props }) => (
                                    <p {...props} className="my-2 leading-relaxed" />
                                  ),
                                  strong: ({ node, ...props }) => (
                                    <strong {...props} className="font-semibold text-purple-600 dark:text-purple-400" />
                                  ),
                                  ul: ({ node, ...props }) => (
                                    <ul {...props} className="list-disc pl-4 my-2 space-y-1" />
                                  ),
                                  ol: ({ node, ...props }) => (
                                    <ol {...props} className="list-decimal pl-4 my-2 space-y-1" />
                                  ),
                                  li: ({ node, ...props }) => (
                                    <li {...props} className="my-1" />
                                  ),
                                  a: ({ node, ...props }) => (
                                    <a {...props} className="text-purple-600 dark:text-purple-400 hover:underline" target="_blank" rel="noopener noreferrer" />
                                  ),
                                  code: ({ node, ...props }) => (
                                    <code {...props} className="bg-purple-100 dark:bg-purple-900/30 px-1 rounded text-sm" />
                                  ),
                                  pre: ({ node, ...props }) => (
                                    <pre {...props} className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded my-2 overflow-x-auto" />
                                  ),
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                          <span className={`text-xs text-gray-500 dark:text-gray-400 mt-1 px-2 ${
                            message.role === 'user' ? 'text-right' : 'text-left'
                          }`}>
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        
                        {message.role === 'user' && (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                            <span className="text-white text-sm font-medium">U</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start animate-in slide-in-from-bottom-4 duration-300">
                      <div className="flex items-end gap-2 max-w-[85%]">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                          <Sparkles className="h-4 w-4 text-white animate-pulse" />
                        </div>
                        <div className="bg-white/70 dark:bg-gray-800/70 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
                          <div className="flex items-center gap-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-100" />
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-300 animate-pulse">
                              {loadingMessages[loadingMessageIndex]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 dark:border-gray-700/30 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 rounded-b-2xl">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
                        placeholder="Ask me anything magical... ✨"
                        className="w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white shadow-inner"
                        disabled={isLoading}
                      />
                      {isTyping && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" />
                            <div className="w-1 h-1 bg-pink-500 rounded-full animate-pulse delay-100" />
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-200" />
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading || !input.trim()}
                      className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100"
                    >
                      <Send className="h-5 w-5 text-white" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-center mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Powered by UBAKA AI Engineers 
                    </p>
                  </div> 
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}