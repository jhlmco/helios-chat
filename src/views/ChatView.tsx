import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { format } from 'date-fns';
import { useMessageStore } from '../store/messageStore';
import MessageBubble from '../components/chat/MessageBubble';
import TypingIndicator from '../components/chat/TypingIndicator';

const ChatView: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const { messages, isTyping, sendMessage } = useMessageStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (inputValue.trim() === '') return;
    
    await sendMessage(inputValue);
    setInputValue('');
  };

  const messagesByDate: { [date: string]: typeof messages } = {};
  
  messages.forEach((message) => {
    const date = format(new Date(message.timestamp), 'yyyy-MM-dd');
    if (!messagesByDate[date]) {
      messagesByDate[date] = [];
    }
    messagesByDate[date].push(message);
  });

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-slate-700 bg-slate-900 p-4 shadow-sm">
        <h1 className="text-xl font-semibold">Helios</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin bg-slate-800">
        {Object.keys(messagesByDate).length > 0 ? (
          Object.entries(messagesByDate).map(([date, dateMessages]) => (
            <div key={date} className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="text-xs bg-slate-700 text-slate-300 py-1 px-3 rounded-full">
                  {format(new Date(date), 'MMMM d, yyyy')}
                </div>
              </div>
              
              {dateMessages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <div className="text-xl mb-2">Welcome to Helios</div>
            <p className="text-center max-w-md">
              Start a conversation by typing a message below. The chat will respond using the AI model configured in your settings.
            </p>
          </div>
        )}
        
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-slate-700 bg-slate-900">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-800 text-slate-200 placeholder-slate-400"
          />
          <button
            type="submit"
            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            disabled={inputValue.trim() === ''}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;