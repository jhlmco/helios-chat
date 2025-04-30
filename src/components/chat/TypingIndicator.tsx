import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex mb-4 justify-start">
      <div className="bg-slate-700 shadow-sm p-3 rounded-lg border border-slate-600 rounded-bl-none">
        <div className="typing-indicator flex items-center h-6">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;