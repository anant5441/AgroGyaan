import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User, Trash2, Image, XCircle, Volume2, VolumeX } from "lucide-react";
// const BASE_URL = "http://localhost:8000"; // Update with your backend URL
const BASE_URL = "https://agrogyaan-b-ai.onrender.com"

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      type: "bot",
      content: "Hello! I'm your AI farming assistant. How can I help you today? You can ask me about crop diseases, weather conditions, or any other farming queries. You can also upload images of crops for analysis.",
      timestamp: new Date(),
      isStreaming: false,
      audioAvailable: false,
      audioData: null,
      audioLanguage: "en"
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState(null);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  // Auto scroll when messages update and focus input when opened
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isOpen]);

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.match('image.*')) {
        alert('Please select an image file');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image smaller than 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const playAudio = async (audioData, messageId) => {
    try {
      // Stop currently playing audio
      if (currentlyPlayingAudio) {
        stopAudio();
      }

      // Decode base64 audio data
      const audioBlob = base64ToBlob(audioData, 'audio/mp3');
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      setCurrentlyPlayingAudio(messageId);

      audio.onended = () => {
        setCurrentlyPlayingAudio(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        console.error('Error playing audio');
        setCurrentlyPlayingAudio(null);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setCurrentlyPlayingAudio(null);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setCurrentlyPlayingAudio(null);
  };

  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
  };

  const generateAudioForMessage = async (messageId, messageText, language = "en") => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${BASE_URL}/api/generate-audio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text: messageText,
          language: language
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === "success" && data.audio_data) {
        // Update the message with audio data
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId
              ? { 
                  ...msg, 
                  audioAvailable: true, 
                  audioData: data.audio_data,
                  audioLanguage: data.audio_language || language
                }
              : msg
          )
        );
        
        // Auto-play the audio
        await playAudio(data.audio_data, messageId);
      } else {
        alert(data.message || "Failed to generate audio");
      }
      
    } catch (error) {
      console.error("Error generating audio:", error);
      alert("Failed to generate audio. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedImage) || isLoading) return;

    const newMessage = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      image: imagePreview,
      timestamp: new Date(),
      isStreaming: false,
      audioAvailable: false,
      audioData: null
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      let endpoint = BASE_URL + "/api/chat";
      let body;
      let headers = {};

      if (selectedImage) {
        // Use image endpoint with FormData
        endpoint = BASE_URL + "/api/chat-with-image";
        const formData = new FormData();
        
        if (message.trim()) {
          formData.append("query", message);
        }
        formData.append("image", selectedImage);
        
        body = formData;
        // Don't set Content-Type header for FormData - browser will set it with boundary
      } else {
        // Use text-only endpoint with JSON
        endpoint = BASE_URL + "/api/chat";
        body = JSON.stringify({ query: message });
        headers = {
          "Content-Type": "application/json",
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: body,
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
        audioAvailable: data.audio_available || false,
        audioData: data.audio_data || null,
        audioLanguage: data.audio_language || "en"
      };

      setMessages((prev) => [...prev, botMessage]);
      
      const responseText = data.answer || data.error || "No response received";
      
      // Stream the text response
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
      
      // Mark streaming as complete and update audio status
      setMessages(prev =>
        prev.map(msg =>
          msg.id === botMessageId
            ? { 
                ...msg, 
                isStreaming: false,
                audioAvailable: data.audio_available || false,
                audioData: data.audio_data || null,
                audioLanguage: data.audio_language || "en"
              }
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
        audioAvailable: false,
        audioData: null
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      removeImage(); // Clear image after sending
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    // Stop any playing audio when clearing conversation
    stopAudio();
    
    setMessages([
      {
        id: "1",
        type: "bot",
        content: "Hello! I'm your AI farming assistant. How can I help you today? You can ask me about crop diseases, weather conditions, market prices, or any other farming queries. You can also upload images of crops for analysis.",
        timestamp: new Date(),
        isStreaming: false,
        audioAvailable: false,
        audioData: null,
        audioLanguage: "en"
      },
    ]);
    setIsLoading(false);
    removeImage();
  };

  const handleClose = () => {
    // Stop any playing audio when closing
    stopAudio();
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
    } else {
      // Stop audio when closing
      stopAudio();
    }
  };

  // Enhanced Message component with audio controls
  const Message = ({ msg }) => {
    const isPlaying = currentlyPlayingAudio === msg.id;
    
    const handleAudioPlay = () => {
      if (isPlaying) {
        stopAudio();
      } else {
        if (msg.audioAvailable && msg.audioData) {
          playAudio(msg.audioData, msg.id);
        } else if (msg.type === "bot") {
          // Generate audio on demand for bot messages without audio
          generateAudioForMessage(msg.id, msg.content, "en");
        }
      }
    };

    const getLanguageName = (code) => {
      const languages = {
        'en': 'English',
        'hi': 'Hindi',
        'es': 'Spanish',
        'fr': 'French',
        'bn': 'Bengali',
        'ta': 'Tamil',
        'te': 'Telugu',
        'mr': 'Marathi',
        'gu': 'Gujarati',
        'kn': 'Kannada',
        'ml': 'Malayalam',
        'pa': 'Punjabi'
      };
      return languages[code] || code;
    };

    return (
      <div
        className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-[85%] p-3 rounded-lg text-sm break-words shadow-sm ${
            msg.type === "user"
              ? "bg-green-600 text-white rounded-br-none"
              : "bg-white text-gray-800 border border-green-100 rounded-bl-none"
          }`}
          style={{
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}
        >
          <div className="flex items-start space-x-2">
            {msg.type === "bot" && (
              <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
            )}
            {msg.type === "user" && (
              <User className="h-4 w-4 mt-0.5 flex-shrink-0 text-white" />
            )}
            <div className="flex-1 min-w-0">
              {/* Display image if present */}
              {msg.image && (
                <div className="mb-2 relative">
                  <img 
                    src={msg.image} 
                    alt="Uploaded preview" 
                    className="max-w-full h-auto rounded-md max-h-48 object-cover border border-green-200"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    📎 Image attached
                  </div>
                </div>
              )}
              <div className="break-words whitespace-pre-wrap overflow-hidden">
                {msg.content}
                {msg.isStreaming && (
                  <span className="inline-block w-2 h-4 bg-green-500 ml-0.5 animate-pulse"></span>
                )}
              </div>

              {/* Audio controls for bot messages */}
              {msg.type === "bot" && !msg.isStreaming && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-green-100">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleAudioPlay}
                      disabled={isLoading}
                      className={`p-1 rounded-full transition-colors ${
                        isPlaying 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      } disabled:bg-gray-100 disabled:text-gray-400`}
                      title={isPlaying ? "Stop audio" : "Play audio"}
                      aria-label={isPlaying ? "Stop audio" : "Play audio"}
                    >
                      {isPlaying ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                    </button>
                    <span className="text-xs text-gray-500">
                      {msg.audioAvailable 
                        ? `Audio available`
                        : "Click to generate audio"
                      }
                    </span>
                  </div>
                  {isPlaying && (
                    <div className="flex space-x-1">
                      <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="w-1 h-1 bg-green-600 rounded-full animate-pulse"></span>
                    </div>
                  )}
                </div>
              )}
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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg z-50 transition-all duration-300 hover:scale-110 flex items-center justify-center text-white group"
        aria-label="Open chat"
      >
        {/* Ping animation that runs for 5 seconds when site loads */}
        <div 
          className="absolute inset-0 rounded-full border-2 border-green-300 border-opacity-30"
          style={{ 
            animation: 'ping 2s ease-in-out 4',
            animationFillMode: 'forwards'
          }}
        />
        
        <div className="relative z-10">
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </div>
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
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button 
                onClick={handleClose}
                className="p-1 rounded-md hover:bg-green-500 transition-colors"
                title="Close chat"
                aria-label="Close chat"
                disabled={isLoading}
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
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span className="text-sm text-gray-600">Analyzing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-green-100 bg-white">
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-3 relative inline-block">
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Selected preview" 
                      className="h-20 w-20 object-cover rounded-md border-2 border-green-300 shadow-sm"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                      aria-label="Remove image"
                      disabled={isLoading}
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                {/* Image Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="bg-green-100 hover:bg-green-200 disabled:bg-gray-100 transition-colors text-green-700 p-2 rounded-md disabled:cursor-not-allowed border border-green-200 shadow-sm"
                  aria-label="Upload image"
                  title="Upload image"
                >
                  <Image className="h-4 w-4" />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                  aria-label="Select image file"
                  disabled={isLoading}
                />

                {/* Text Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    selectedImage
                      ? "Add a question with your image..."
                      : "Ask about farming or upload crop image..."
                  }
                  className="
                    flex-1 px-4 py-2 text-sm rounded-md
                    border border-green-300
                    bg-gradient-to-r from-green-50 to-white
                    text-gray-900 placeholder:text-gray-500
                    shadow-inner transition-all duration-300
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400
                    focus:from-green-100 focus:to-white

                    dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900
                    dark:text-gray-100 dark:placeholder:text-gray-400
                    dark:border-green-700 dark:focus:ring-green-400 dark:focus:border-green-500
                  "
                  aria-label="Type your message"
                  disabled={isLoading}
                />



                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={(!message.trim() && !selectedImage) || isLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 transition-colors text-white p-2 rounded-md disabled:cursor-not-allowed shadow-sm"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {selectedImage ? "Image ready for analysis • Press Enter to send" : "Press Enter to send • Available 24/7"}
              </p>
              <p className="text-xs text-green-600 mt-1 text-center">
                💡 Tip: Ask for "audio" or "speech" to hear responses in multiple languages
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}