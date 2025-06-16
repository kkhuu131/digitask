import { useState } from 'react';
import { Send, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const handleSendMessage = async () => {
  if (!input.trim()) return;

  const newMessage: Message = {
    role: 'user',
    content: input.trim()
  };

  setMessages(prev => [...prev, newMessage]);
  setInput('');
  setIsLoading(true);

  try {
    const response = await fetch('/api/bokomon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: input.trim() }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response');
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: data.response
    }]);

    // Update rate limit info if available
    if (data.rateLimit) {
      setRateLimitInfo(data.rateLimit);
    }
  } catch (error) {
    console.error('Error:', error);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Sorry, I encountered an error. Please try again.'
    }]);
  } finally {
    setIsLoading(false);
  }
};

export function BokomonAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);

  return (
    <div className="fixed bottom-0 right-0 p-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full p-6 shadow-lg transition-all duration-200 flex items-center justify-center"
        >
          <img
            src="/bokomon-sprite.png"
            alt="Bokomon"
            className="w-8 h-8 object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </button>
        
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogTitle>Bokomon Assistant</DialogTitle>
              <DialogDescription>
                Ask me anything about Digimon or the DigiTask app!
              </DialogDescription>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[calc(80vh-8rem)]">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask Bokomon..."
                    className="flex-1 bg-muted rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                {rateLimitInfo && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {rateLimitInfo.remaining} messages remaining. Resets in {Math.ceil(rateLimitInfo.resetIn / 60)} minutes.
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
} 