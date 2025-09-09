import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  // Auto scroll when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: getAIResponse(message),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);

    setMessage("");
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

   return (
    <div className="min-h-screen bg-gray-50">
      {/* Green Header Section */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <Bot className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold">AI Farming Assistant</h1>
            </div>
            <nav>
              <ul className="flex space-x-6">
                <li className="hover:text-green-100 cursor-pointer transition">Home</li>
                <li className="hover:text-green-100 cursor-pointer transition">Features</li>
                <li className="hover:text-green-100 cursor-pointer transition">About</li>
                <li className="hover:text-green-100 cursor-pointer transition">Contact</li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">Welcome to AI Farming Assistant</h2>
          <p className="text-gray-600 mb-4">
            Our AI-powered assistant helps farmers make informed decisions about crop management, 
            weather conditions, market prices, and more. Get personalized recommendations for your farming needs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-green-700 mb-2">Crop Disease Detection</h3>
              <p className="text-sm text-gray-600">Identify plant diseases early and get treatment recommendations.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="font-semibold text-green-700 mb-2">Weather Insights</h3>
              <p className="text-sm text-gray-600">Get localized weather forecasts and farming recommendations.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-green-700 mb-2">Market Prices</h3>
              <p className="text-sm text-gray-600">Track current market rates and get optimal selling time suggestions.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">How It Works</h2>
          <ol className="list-decimal pl-5 space-y-3 text-gray-600">
            <li>Click the chat button in the bottom right corner to open the AI assistant</li>
            <li>Ask questions about crop diseases, weather, market prices, or farming techniques</li>
            <li>Receive instant, AI-powered responses tailored to your farming needs</li>
            <li>Use the clear conversation button to start a new conversation anytime</li>
          </ol>
        </div>
      </main>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg z-50 transition-all duration-300 hover:scale-110 flex items-center justify-center text-white"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[420px] h-[550px] flex flex-col shadow-xl z-50 rounded-xl border border-green-200 overflow-hidden bg-white">
          {/* Header */}
          <div className="pb-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-xl flex flex-row justify-between items-center px-4 py-3">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">AI Farming Assistant</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={clearConversation}
                className="p-1 rounded-md hover:bg-green-500 transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button 
                onClick={handleClose}
                className="p-1 rounded-md hover:bg-green-500 transition-colors"
                title="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex flex-col flex-1 p-0 bg-gradient-to-b from-green-50 to-white">
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
              style={{ maxHeight: '400px' }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
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
            <div className="p-4 border-t border-green-100 bg-white rounded-b-xl">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about farming..."
                  className="flex-1 px-3 py-2 text-sm border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="bg-green-600 hover:bg-green-700 transition-colors text-white p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default AIAssistant;