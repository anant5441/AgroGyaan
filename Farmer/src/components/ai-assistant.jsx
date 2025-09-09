import { useState } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your AI farming assistant. How can I help you today? You can ask me about crop diseases, weather conditions, market prices, or any other farming queries.',
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getAIResponse(message),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);

    setMessage("");
  };

  const getAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('disease') || lowerMessage.includes('pest')) {
      return "For disease identification, please describe the symptoms you're observing on your crops. Common signs include yellowing leaves, spots, wilting, or unusual growth patterns. I can help you identify the issue and suggest treatment options.";
    }
    
    if (lowerMessage.includes('weather') || lowerMessage.includes('rain')) {
      return "Weather is crucial for farming decisions. Based on current forecasts, I recommend checking soil moisture levels and planning irrigation accordingly. Would you like specific weather insights for your region?";
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('market')) {
      return "Market prices fluctuate based on demand, supply, and seasonal factors. I can help you track current mandi rates and suggest optimal selling times. Which crop are you interested in?";
    }
    
    if (lowerMessage.includes('fertilizer') || lowerMessage.includes('nutrient')) {
      return "Proper nutrition is essential for healthy crops. The fertilizer requirements depend on your soil type, crop variety, and growth stage. I recommend a soil test to determine specific nutrient needs.";
    }
    
    return "Thank you for your question! I'm here to help with farming advice, crop management, market insights, and agricultural best practices. Could you provide more specific details about your query?";
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-primary hover:opacity-90 shadow-hover z-50 animate-float"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 h-96 shadow-hover z-50 animate-fade-in">
          <CardHeader className="pb-3 bg-gradient-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>AI Farming Assistant</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex flex-col h-full p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        msg.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {msg.type === 'bot' && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        {msg.type === 'user' && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        <span className="leading-relaxed">{msg.content}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about farming..."
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send • Available 24/7
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}