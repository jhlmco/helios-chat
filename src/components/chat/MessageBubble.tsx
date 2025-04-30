import React from 'react';
import classNames from 'classnames';
import { format } from 'date-fns';
import { marked } from 'marked';
import { Message } from '../../types';
import { useSettingsStore } from '../../store/settingsStore';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { openai, gemini } = useSettingsStore();
  const isUser = message.sender === 'user';
  
  const getModelName = () => {
    if (!message.apiType) return null;
    return message.apiType === 'openai' ? openai.model : gemini.model;
  };
  
  return (
    <div
      className={classNames(
        'flex mb-4 message-in',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={classNames(
          'max-w-[80%] md:max-w-[70%] rounded-lg p-3 shadow-sm',
          isUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-slate-700 text-slate-200 border border-slate-600 rounded-bl-none'
        )}
      >
        <div 
          className="text-sm md:text-base prose dark:prose-invert max-w-none prose-sm prose-p:my-1 prose-headings:my-2 prose-pre:my-1 prose-ul:my-1"
          dangerouslySetInnerHTML={{ 
            __html: isUser ? message.text : marked(message.text, { breaks: true }) 
          }}
        />
        <div className="flex items-center justify-between mt-1">
          <div
            className={classNames(
              'text-xs',
              isUser ? 'text-blue-100' : 'text-slate-400'
            )}
          >
            {format(new Date(message.timestamp), 'h:mm a')}
          </div>
          {!isUser && message.apiType && (
            <div className="text-xs text-slate-400">
              {message.apiType} {getModelName() && `• ${getModelName()}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;