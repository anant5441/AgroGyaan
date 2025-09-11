import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User, Trash2 } from "lucide-react";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      type: "bot",
      content: "Hello! I'm your AI farming assistant. How can I help you today? You can ask me about crop diseases, weather conditions, market prices, or any other farming queries.",
      timestamp: new Date(),
      isStreaming: false,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll when messages update and focus input when opened
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const newMessage = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date(),
      isStreaming: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Create a bot message with empty content to start streaming
      const botMessageId = (Date.now() + 1).toString();
      const botMessage = {
        id: botMessageId,
        type: "bot",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, botMessage]);
      
      // Stream the response character by character
      const responseText = data.answer;
      for (let i = 0; i <= responseText.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 15));
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessageId
              ? { ...msg, content: responseText.slice(0, i) }
              : msg
          )
        );
      }
      
      // Mark streaming as complete
      setMessages(prev =>
        prev.map(msg =>
          msg.id === botMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
      
    } catch (error) {
      console.error("Error sending message:", error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "Sorry, I'm having trouble connecting to the AI service. Please try again later.",
        timestamp: new Date(),
        isStreaming: false,
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        id: "1",
        type: "bot",
        content: "Hello! I'm your AI farming assistant. How can I help you today? You can ask me about crop diseases, weather conditions, market prices, or any other farming queries.",
        timestamp: new Date(),
        isStreaming: false,
      },
    ]);
    setIsLoading(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    clearConversation();
  };

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    if (newState) {
      // Clear conversation only when opening fresh
      if (messages.length > 1) {
        clearConversation();
      }
    }
  };

  // Message component with streaming animation
  const Message = ({ msg }) => {
    return (
      <div
        className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-[75%] p-3 rounded-lg text-sm break-words whitespace-pre-wrap shadow-sm ${
            msg.type === "user"
              ? "bg-green-600 text-white rounded-br-none"
              : "bg-white text-gray-800 border border-green-100 rounded-bl-none"
          }`}
        >
          <div className="flex items-start space-x-2">
            {msg.type === "bot" && (
              <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
            )}
            {msg.type === "user" && (
              <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <span className="leading-relaxed">{msg.content}</span>
              {msg.isStreaming && <span className="inline-block w-1 h-4 bg-gray-400 animate-pulse ml-0.5"></span>}
            </div>
          </div>
          <p className={`text-xs mt-1 ${msg.type === "user" ? "text-green-100" : "text-gray-500"}`}>
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg z-50 transition-all duration-300 hover:scale-110 flex items-center justify-center text-white"
        aria-label="Open chat"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-96 sm:h-[550px] flex flex-col shadow-xl z-50 rounded-xl border border-green-200 overflow-hidden bg-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white flex flex-row justify-between items-center px-4 py-3">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">AI Farming Assistant</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={clearConversation}
                className="p-1 rounded-md hover:bg-green-500 transition-colors"
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button 
                onClick={handleClose}
                className="p-1 rounded-md hover:bg-green-500 transition-colors"
                title="Close chat"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages Container - Fixed height for proper scrolling */}
          <div className="flex flex-col flex-1 min-h-0">
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-green-50 to-white"
            >
              {messages.map((msg) => (
                <Message key={msg.id} msg={msg} />
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[75%] p-3 rounded-lg text-sm bg-white text-gray-800 border border-green-100 rounded-bl-none">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600 animate-pulse" />
                      <div className="flex space-x-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-green-100 bg-white">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about farming..."
                  className="flex-1 px-3 py-2 text-sm border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  aria-label="Type your message"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 transition-colors text-white p-2 rounded-md disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send • Available 24/7
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}