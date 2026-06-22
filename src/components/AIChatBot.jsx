import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Trash2 } from 'lucide-react';

const QUICK_PROMPTS = [
  "I am trapped in a flood area",
  "Earthquake safety instructions",
  "Fallen powerline near main street",
  "How to give CPR first aid"
];

export default function AIChatBot({ backendUrl }) {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: `### Welcome to RescueLink AI emergency companion.

I can provide instant step-by-step survival guidance, emergency shelter suggestions, and first aid tips.

How can I help you stay safe today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput('');

    // Append user message
    const updatedMessages = [...messages, { role: 'user', content: text }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          history: updatedMessages.slice(-6).map(m => ({ role: m.role, content: m.content })) // send last few messages as context
        })
      });

      if (!response.ok) throw new Error("Failed to reach AI server");

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: `⚠️ **Connection Error**: I'm having trouble reaching the AI dispatcher backend.

**Here are general emergency guidelines**:
1. Move away from hazards.
2. In case of Flooding, move to a higher floor immediately.
3. In case of Fire, crawl under smoke and exit immediately.
4. Press the red **SOS button** to alert nearby volunteer teams.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'bot',
        content: "Chat history cleared. How can I assist you in staying safe?"
      }
    ]);
  };

  // Basic Markdown Renderer for client-side chat bubbles
  const renderMarkdown = (text) => {
    // Escape simple markdown headings, lists and bolding
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;
      
      // Bold **text**
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Headers ### or ##
      if (content.startsWith('### ')) {
        return <h4 key={idx} style={{ marginTop: '10px', color: 'var(--primary)' }}>{content.replace('### ', '')}</h4>;
      }
      if (content.startsWith('## ') || content.startsWith('# ')) {
        return <h3 key={idx} style={{ marginTop: '12px', color: 'var(--primary)' }}>{content.replace('## ', '').replace('# ', '')}</h3>;
      }
      // List items starting with "- "
      if (content.trim().startsWith('- ')) {
        return <li key={idx} style={{ marginLeft: '15px', marginBottom: '4px' }} dangerouslySetInnerHTML={{ __html: content.replace('- ', '') }}></li>;
      }
      // Check numbered items
      if (/^\d+\.\s/.test(content.trim())) {
        return <div key={idx} style={{ marginLeft: '15px', marginBottom: '4px' }} dangerouslySetInnerHTML={{ __html: content }}></div>;
      }

      return <p key={idx} style={{ marginBottom: '8px' }} dangerouslySetInnerHTML={{ __html: content }}></p>;
    });
  };

  return (
    <div className="glass-panel chat-container" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '10px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare className="text-info" size={22} />
          AI Emergency Agent
        </h3>
        
        <button 
          onClick={clearChat}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          title="Clear Chat"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="chat-history">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.role}`}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px' }}>
              {msg.role === 'bot' ? <Bot size={14} className="text-info" /> : <User size={14} className="text-secondary" />}
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                {msg.role === 'bot' ? 'RESCUELINK AGENT' : 'YOU'}
              </span>
            </div>
            <div>{renderMarkdown(msg.content)}</div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-bubble bot">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Bot size={14} className="text-info" />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RescueLink Agent is typing...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompt Selector */}
      <div className="quick-actions">
        {QUICK_PROMPTS.map((prompt, i) => (
          <button 
            key={i} 
            className="quick-action-btn"
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="chat-input-area">
        <input 
          type="text" 
          className="chat-input"
          placeholder="Ask a question or describe your situation..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
        />
        <button 
          className="btn btn-primary" 
          style={{ borderRadius: '8px', padding: '10px' }}
          onClick={() => handleSend()}
          disabled={isLoading}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
