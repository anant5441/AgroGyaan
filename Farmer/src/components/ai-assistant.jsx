import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User, Trash2 } from "lucide-react";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      type: "bot",
      content:
        "Hello! I'm your AI farming assistant. How can I help you today? You can ask me about crop diseases, weather conditions, market prices, or any other farming queries.",
      timestamp: new Date(),
    },
  ]);

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

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: getAIResponse(message),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const getAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("disease") || lowerMessage.includes("pest")) {
      return "For disease identification, please describe the symptoms you're observing on your crops. Common signs include yellowing leaves, spots, wilting, or unusual growth patterns. I can help you identify the issue and suggest treatment options.";
    }

    if (lowerMessage.includes("weather") || lowerMessage.includes("rain")) {
      return "Weather is crucial for farming decisions. Based on current forecasts, I recommend checking soil moisture levels and planning irrigation accordingly. Would you like specific weather insights for your region?";
    }

    if (lowerMessage.includes("price") || lowerMessage.includes("market")) {
      return "Market prices fluctuate based on demand, supply, and seasonal factors. I can help you track current mandi rates and suggest optimal selling times. Which crop are you interested in?";
    }

    if (lowerMessage.includes("fertilizer") || lowerMessage.includes("nutrient")) {
      return "Proper nutrition is essential for healthy crops. The fertilizer requirements depend on your soil type, crop variety, and growth stage. I recommend a soil test to determine specific nutrient needs.";
    }

    if (lowerMessage.includes("soil") || lowerMessage.includes("crop")) {
      return "I can provide advice on soil preparation, crop rotation, and optimal planting times. What specific information are you looking for?";
    }

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      return "Hello! How can I assist with your farming needs today?";
    }

    return "Thank you for your question! I'm here to help with farming advice, crop management, market insights, and agricultural best practices. Could you provide more specific details about your query?";
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
        content:
          "Hello! I'm your AI farming assistant. How can I help you today? You can ask me about crop diseases, weather conditions, market prices, or any other farming queries.",
        timestamp: new Date(),
      },
    ]);
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
                <div
                  key={msg.id}
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
                      <span className="leading-relaxed">{msg.content}</span>
                    </div>
                    <p className={`text-xs mt-1 ${msg.type === "user" ? "text-green-100" : "text-gray-500"}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
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
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
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

export default AIAssistant;