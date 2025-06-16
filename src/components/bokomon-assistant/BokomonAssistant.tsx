import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';
import { X, Send } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface RateLimitInfo {
  remaining: number;
  resetIn: number;
}

export const BokomonAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Check if we're in development (where the API is available)
      const isDevelopment = import.meta.env.DEV;
      
      if (!isDevelopment) {
        // In production, show a message that Bokomon is not available
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Sorry! Bokomon is currently only available in development mode. The AI assistant feature requires server-side processing that isn\'t available in the current deployment setup.' 
        }]);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/bokomon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      setRateLimit(data.rateLimit);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again!' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.ceil(seconds / 60);
    return `${minutes}m`;
  };

  return (
    <div className="fixed bottom-16 sm:bottom-4 right-4 z-50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-yellow-400 hover:bg-yellow-500 text-white rounded-full p-6 shadow-lg dark:bg-yellow-500 dark:hover:bg-yellow-600 relative overflow-hidden"
          >
            <img 
              src="/assets/digimon/bokomon.png" 
              alt="Bokomon" 
              className="w-8 h-8 object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
              style={{ 
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.3))'
              }} 
            />
          </motion.button>
        </DialogTrigger>
        <DialogContent className="fixed bottom-0 right-0 sm:bottom-20 sm:right-4 w-full sm:w-96 h-[80vh] sm:h-[600px] bg-white dark:bg-gray-800 rounded-t-lg sm:rounded-lg shadow-xl p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/digimon/bokomon.png" 
                alt="Bokomon" 
                className="w-12 h-12 object-contain"
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.5))',
                  imageRendering: 'pixelated',
                }}
              />
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Bokomon</h2>
                {rateLimit && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {rateLimit.remaining} messages left • Resets in {formatTime(rateLimit.resetIn)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-4 pr-2">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <img 
                      src="/assets/digimon/bokomon.png" 
                      alt="Bokomon" 
                      className="w-8 h-8 object-contain mr-2 flex-shrink-0"
                      style={{
                        filter: 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.3))',
                        imageRendering: 'pixelated',
                      }}
                    />
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 dark:bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <img 
                    src="/assets/digimon/bokomon.png" 
                    alt="Bokomon" 
                    className="w-8 h-8 object-contain mr-2 flex-shrink-0"
                    style={{
                      filter: 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.3))',
                      imageRendering: 'pixelated',
                    }}
                  />
                  <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg p-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Bokomon anything..."
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              disabled={isLoading || (rateLimit?.remaining === 0)}
            />
            <button
              type="submit"
              disabled={isLoading || (rateLimit?.remaining === 0)}
              className="btn-primary text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 