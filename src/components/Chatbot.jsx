import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageCircle, X, Send, Bot, Minimize2, Maximize2,
  Sparkles, ThumbsUp, ThumbsDown, Download, Trash2, Search,
  Copy
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// KNOWLEDGE BASE
// ============================================
const knowledgeBase = [
  // General
  {
    keywords: ['what is academic hub', 'about', 'project overview'],
    response: '📚 Academic Hub is a centralized learning resource management system for university departments. It supports role-based access (Admin, Faculty, CR, Student) and organizes content by Department → Semester → Subject → Unit.'
  },
  {
    keywords: ['features', 'what can i do'],
    response: '🚀 Features include:\n• Upload/download materials\n• Discussion Forum\n• Bookmarks\n• Analytics dashboard\n• Notifications\n• Role-based access control\n• Department management'
  },
  // User Roles
  {
    keywords: ['admin role', 'what can admin do'],
    response: '🔑 Admin has full control:\n• Manage users, departments, semesters, subjects\n• Approve/reject materials\n• View all analytics\n• Manage system settings'
  },
  {
    keywords: ['faculty role', 'what can faculty do'],
    response: '👨‍🏫 Faculty can:\n• Upload materials (auto-approved)\n• Review and approve CR uploads\n• View analytics\n• Participate in forum'
  },
  {
    keywords: ['cr role', 'class representative'],
    response: '👔 CR can:\n• Upload materials (needs admin approval)\n• Track upload status\n• Participate in forum'
  },
  {
    keywords: ['student role', 'what can student do'],
    response: '🎓 Students can:\n• Browse and download materials\n• Bookmark resources\n• Ask questions in forum\n• View personal analytics'
  },
  // Materials
  {
    keywords: ['upload material', 'how to upload', 'add material'],
    response: '📤 To upload:\n1. Go to Upload Material\n2. Select Department, Semester, Subject, Unit\n3. Enter title and description\n4. Choose file (PDF, DOC, PPT, JPG, PNG - max 10MB)\n5. Click Upload\n\n✅ Faculty/Admin auto-approved\n⏳ CR needs approval'
  },
  {
    keywords: ['download material', 'how to download'],
    response: '📥 To download:\n1. Go to Browse Materials\n2. Use filters to find the material\n3. Click Download button\n4. File saves to your device'
  },
  {
    keywords: ['approval workflow', 'pending approval'],
    response: '✅ Approval Workflow:\n• CR uploads → Pending\n• Admin/Faculty review → Approve or Reject\n• Approved materials become visible to students\n• Uploader gets notification'
  },
  // Departments
  {
    keywords: ['departments', 'academic structure'],
    response: '🏛️ Departments: MCA, MBA, Chemistry, English, Journalism, MA Economics. Each has 4 semesters with subjects and units.'
  },
  {
    keywords: ['semesters', 'how many semesters'],
    response: '📚 4 semesters per department. Sem 1-3: 6 subjects each (5 units per subject). Sem 4: 3 subjects + Major Project.'
  },
  {
    keywords: ['subjects', 'subject list'],
    response: '📘 Subjects vary by semester. Example MCA Sem 1: Programming Fundamentals, Digital Logic, Discrete Maths, Communication Skills, Web Technologies, DBMS.'
  },
  // Forum
  {
    keywords: ['forum', 'discussion forum', 'ask question'],
    response: '💬 Forum:\n• Ask questions with title and content\n• Reply to others\n• Like helpful answers\n• Get notifications on replies'
  },
  // Bookmarks
  {
    keywords: ['bookmark', 'bookmarks', 'save material'],
    response: '⭐ To bookmark:\n1. Browse Materials\n2. Click the star icon on any material\n3. Add optional note\n4. View all bookmarks in Bookmarks section'
  },
  // Analytics
  {
    keywords: ['analytics', 'stats', 'dashboard'],
    response: '📊 Analytics shows:\n• Material views and downloads\n• User activity\n• Department statistics\n• Real-time trends\n• Role-specific data'
  },
  // Registration
  {
    keywords: ['register', 'registration', 'sign up'],
    response: '📝 To register as student:\n1. Login page → Click Student role card\n2. Fill name, email, password\n3. Get 6-digit verification code\n4. Enter code to verify\n5. Login with email and password'
  },
  // Login
  {
    keywords: ['login', 'sign in', 'log in'],
    response: '🔐 Login options:\n• Admin/Faculty/CR: select role, auto-filled email, enter password\n• Student: use Student Login link, enter your own email and password\n\nDemo: admin@academichub.com / admin123'
  },
  // Password
  {
    keywords: ['forgot password', 'reset password', 'change password'],
    response: '🔐 To reset password:\n1. Login page → Forgot Password\n2. Enter your email\n3. Check inbox for reset link\n4. Follow link to set new password'
  },
  // Notifications
  {
    keywords: ['notification', 'notifications', 'bell'],
    response: '🔔 Notifications alert you about:\n• New uploads\n• Material approvals/rejections\n• Forum replies\n• System announcements\n\nClick bell icon in sidebar to view.'
  },
  // Support
  {
    keywords: ['help', 'support', 'troubleshoot'],
    response: '🆘 For help:\n• Use this chatbot\n• Check Discussion Forum\n• Contact admin\n• See common issues in FAQ'
  },
  // Tech
  {
    keywords: ['technology', 'tech stack', 'built with'],
    response: '🛠️ Tech Stack:\n• Frontend: React 18, Tailwind CSS, React Router\n• Backend: Node.js, Express\n• Database: MongoDB\n• Auth: JWT\n• File upload: Multer'
  },
  // Greetings
  {
    keywords: ['hello', 'hi', 'hey', 'greetings'],
    response: '👋 Hello! Welcome to Academic Hub. How can I help you today?'
  },
  {
    keywords: ['thanks', 'thank you', 'appreciate'],
    response: '🙌 You\'re welcome! Happy learning with Academic Hub! 😊'
  },
  {
    keywords: ['bye', 'goodbye', 'see you'],
    response: '👋 Goodbye! Come back anytime. Keep learning! 📚✨'
  }
];

// ============================================
// CONTEXT SUGGESTIONS
// ============================================
const getContextSuggestions = (path) => {
  const map = {
    '/dashboard': [
      { label: '📊 Dashboard stats', value: 'What does the dashboard show?' }
    ],
    '/materials': [
      { label: '🔍 Search materials', value: 'How to search for materials?' },
      { label: '📥 Download', value: 'How to download materials?' }
    ],
    '/upload': [
      { label: '📤 Upload guide', value: 'How to upload materials?' },
      { label: '📋 File types', value: 'What file types are supported?' }
    ],
    '/forum': [
      { label: '💬 Ask question', value: 'How to ask a question?' },
      { label: '📝 Reply', value: 'How to reply to a question?' }
    ],
    '/bookmarks': [
      { label: '⭐ View bookmarks', value: 'How to view my bookmarks?' }
    ],
    '/analytics': [
      { label: '📊 View stats', value: 'What analytics are available?' }
    ]
  };
  return map[path] || [];
};

// ============================================
// CHATBOT COMPONENT
// ============================================
const Chatbot = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('chatMessages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 1,
        text: '👋 Hello! I\'m your Academic Hub assistant. Ask me anything about the platform!',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        feedback: null
      }
    ];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = messages.filter(msg =>
        msg.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages([]);
    }
  }, [searchTerm, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const findBestResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase().trim();
    if (!lowerInput || lowerInput.length < 2) {
      return '🤔 Could you please be more specific? I can help with uploads, downloads, departments, user roles, forum, bookmarks, analytics, registration, and more.';
    }

    let bestMatch = null;
    let bestScore = 0;

    for (const item of knowledgeBase) {
      let score = 0;
      for (const keyword of item.keywords) {
        if (lowerInput.includes(keyword)) {
          score += 3;
        }
        const words = keyword.split(' ');
        const matchCount = words.filter(w => w.length > 2 && lowerInput.includes(w)).length;
        if (matchCount > 0) {
          score += matchCount / words.length;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }

    if (bestMatch && bestScore > 0.5) {
      return bestMatch.response;
    }

    return '🤔 I\'m not sure about that. Try asking about upload, download, departments, roles, forum, bookmarks, analytics, or registration.';
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
      feedback: null
    };
    setMessages(prev => [...prev, userMessage]);

    const userInput = input;
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = findBestResponse(userInput);
      const botMessage = {
        id: messages.length + 2,
        text: response,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        feedback: null
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 500 + Math.random() * 600);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFeedback = (messageId, type) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, feedback: msg.feedback === type ? null : type }
          : msg
      )
    );
    toast.success(`Feedback ${type === 'like' ? '👍' : '👎'} recorded!`);
  };

  const exportConversation = () => {
    const text = messages
      .map(msg => `${msg.sender === 'user' ? '👤 User' : '🤖 Bot'}: ${msg.text}`)
      .join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Conversation exported!');
  };

  const clearConversation = () => {
    if (!confirm('Clear all messages?')) return;
    setMessages([
      {
        id: 1,
        text: '👋 Conversation cleared! How can I help you today?',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        feedback: null
      }
    ]);
    toast.success('Conversation cleared');
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const contextSuggestions = getContextSuggestions(currentPath);
  const quickReplies = [
    { label: '📤 Upload', value: 'How to upload material?' },
    { label: '📥 Download', value: 'How to download material?' },
    { label: '📚 Departments', value: 'What departments are available?' },
    { label: '👤 Roles', value: 'Explain user roles' },
    { label: '⭐ Bookmarks', value: 'How to use bookmarks?' },
    { label: '💬 Forum', value: 'How to use the forum?' },
    { label: '📊 Analytics', value: 'What is analytics?' },
    { label: '🔐 Password', value: 'How to reset password?' }
  ];

  const displayMessages = searchTerm.trim() ? filteredMessages : messages;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 z-50 group"
        aria-label="Open Chatbot"
      >
        <div className="relative">
          <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
          <Sparkles size={14} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
        </div>
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          {messages.filter(m => m.sender === 'bot' && !m.read).length || 1}
        </span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 flex flex-col ${
        isMinimized ? 'w-80 h-14' : 'w-80 sm:w-96 h-[560px] max-h-[80vh]'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl p-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <span className="font-semibold text-sm">Academic Assistant</span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Live</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            title="Search messages"
          >
            <Search size={16} />
          </button>
          <button
            onClick={exportConversation}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            title="Export conversation"
          >
            <Download size={16} />
          </button>
          <button
            onClick={clearConversation}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            title="Clear conversation"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300"
            autoFocus
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          )}
        </div>
      )}

      {/* Messages Area */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {displayMessages.length === 0 && searchTerm.trim() ? (
              <div className="text-center text-gray-400 text-sm py-8">
                No messages found matching "{searchTerm}"
              </div>
            ) : (
              displayMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn group`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    <div className={`flex items-center gap-2 mt-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-between'}`}>
                      <span className={`text-[10px] ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                        {formatTime(msg.timestamp)}
                      </span>
                      {msg.sender === 'bot' && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleFeedback(msg.id, 'like')}
                            className={`text-[10px] hover:scale-110 transition-transform ${
                              msg.feedback === 'like' ? 'text-green-400' : 'text-gray-400 hover:text-green-400'
                            }`}
                            title="Like"
                          >
                            <ThumbsUp size={12} />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, 'dislike')}
                            className={`text-[10px] hover:scale-110 transition-transform ${
                              msg.feedback === 'dislike' ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                            }`}
                            title="Dislike"
                          >
                            <ThumbsDown size={12} />
                          </button>
                          <button
                            onClick={() => copyMessage(msg.text)}
                            className="text-[10px] text-gray-400 hover:text-gray-600 hover:scale-110 transition-transform"
                            title="Copy"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-none p-3 max-w-[85%]">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Context Suggestions */}
          {contextSuggestions.length > 0 && (
            <div className="px-3 py-1 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <p className="text-[10px] text-gray-400 mb-1">💡 Suggestions for this page:</p>
              <div className="flex flex-wrap gap-1.5">
                {contextSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(s.value);
                      setTimeout(() => sendMessage(), 100);
                    }}
                    className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Replies */}
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              {quickReplies.map((qr, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(qr.value);
                    setTimeout(() => sendMessage(), 100);
                  }}
                  className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full transition-colors hover:scale-105"
                >
                  {qr.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-shrink-0 bg-white dark:bg-gray-800 rounded-b-2xl">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about Academic Hub..."
              className="flex-1 input-field text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
              aria-label="Chat input"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;