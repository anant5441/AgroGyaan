import React, { useState, useEffect, useRef, use } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Send, Search, MoreVertical, MessageCircle, Plus, Users } from 'lucide-react';

// Firebase imports
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  doc,
  setDoc
} from 'firebase/firestore';

const BaseURL = "http://127.0.0.1:5002"

const Messages = () => {
  const [selectedFarmer, setSelectedFarmer] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [currentUser, setcurrentUser] = useState({
    id: 'temp',
    displayName: 'Demo Farmer',
    email: 'demo@agrogyan.com'
  });
const [farmersList,setFarmerList] = useState([
    {
      id: 1,
      name: "Ramesh Patel",
      role: "Farmer"
    },
    {
      id: 2,
      name: "Priya Sharma",
      role: "Farmer"
    },
    {
      id: 3,
      name: "Kumar Singh",
      role: "Farmer"
    }
  ])


  useEffect(() => {
    let stored = window.sessionStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setcurrentUser(parsed);
      } catch (err) {
        console.error('Invalid JSON in sessionStorage:', err);
      }
    }else
      return
    

    const fetchData = async () => {
      // Placeholder for any initial data fetching if needed
      if(currentUser.id === "temp") return
      let URL = BaseURL + "/api/users/my-rooms?user_id=" + encodeURIComponent(currentUser["id"]);
      console.log(currentUser)
      console.log(URL)
      try {
        const response = await fetch(URL);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log(data.rooms);
        setFarmerList(data?.rooms)
        return data;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);


  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';

    try {
      // If it's a Firestore timestamp
      if (timestamp instanceof Timestamp) {
        return timestamp.toDate().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      // If it's a regular Date object
      if (timestamp instanceof Date) {
        return timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      return 'Just now';
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Just now';
    }
  };

  // Fetch real-time messages from Firestore subcollection
  useEffect(() => {
    if (farmersList[selectedFarmer]) {
      const farmer = farmersList[selectedFarmer];
      const roomId = farmer.id.toString();

      // Reference to messages subcollection within a room document
      const messagesRef = collection(db, "rooms", roomId, "messages");

      // Query messages ordered by creation time
      const q = query(
        messagesRef,
        orderBy("createdAt", "asc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          messagesData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt
          });
        });
        setMessages(messagesData);
      }, (error) => {
        console.error("Error fetching messages:", error);
      });

      return () => unsubscribe();
    }
  }, [selectedFarmer]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();

    if (!newMessage.trim() || !farmersList[selectedFarmer]) return;

    try {
      const farmer = farmersList[selectedFarmer];
      const roomId = farmer.id.toString();

      // First, create/update the room document with participants array
      const roomRef = doc(db, "rooms", roomId);
      await setDoc(roomRef, {
        participants: [currentUser.uid, `farmer_${farmer.id}`],
        participantDetails: {
          [currentUser.uid]: {
            name: currentUser.displayName,
            type: 'buyer'
          },
          [`farmer_${farmer.id}`]: {
            name: farmer.name,
            role: farmer.role,
            type: 'farmer'
          }
        },
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true }); // merge: true will update if exists, create if not

      // Then add the message to the messages subcollection
      const messagesRef = collection(db, "rooms", roomId, "messages");
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        senderType: 'buyer'
      });

      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      alert('Failed to send message. Please try again.');
    }
  };

  const quickTemplates = [
    "What's the price?",
    "Do you deliver to my area?",
    "Can I see quality certificate?",
    "What's the minimum order?",
    "Any bulk discounts?"
  ];

  const handleQuickTemplate = (template) => {
    setNewMessage(template);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  const handleSelectFarmerForNewChat = (index) => {
    setSelectedFarmer(index);
    setShowNewChatModal(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Messages</h1>
            <p className="text-muted-foreground">Connect directly with farmers</p>
          </div>
          <div className="text-sm text-muted-foreground">
            Welcome, {currentUser.displayName}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
          {/* Farmers List */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <CardTitle className="text-lg">Farmers</CardTitle>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search farmers..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative">
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {farmersList.map((farmer, index) => (
                  <div
                    key={farmer.id}
                    onClick={() => setSelectedFarmer(index)}
                    className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${selectedFarmer === index ? 'bg-muted border-r-2 border-primary' : ''
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-lg">
                        👨‍🌾
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{farmer.name}</div>
                        <p className="text-xs text-muted-foreground">{farmer.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* New Chat Floating Button */}
              <div className="absolute bottom-4 right-4 z-10">
                <Button
                  onClick={handleNewChat}
                  className="w-14 h-14 rounded-full bg-gradient-primary hover:shadow-glow transition-all duration-300 shadow-lg"
                  size="icon"
                >
                  <Plus className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-lg">
                    👨‍🌾
                  </div>
                  <div>
                    <h3 className="font-semibold">{farmersList[selectedFarmer]?.name || 'Select a farmer'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {farmersList[selectedFarmer] ? farmersList[selectedFarmer].role : 'Choose a farmer to start chatting'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Container */}
              <div
                ref={messagesContainerRef}
                className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[400px]"
                style={{
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {!farmersList[selectedFarmer] ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Select a farmer to start chatting</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${message.senderId === currentUser.uid
                            ? 'bg-gradient-primary text-primary-foreground'
                            : 'bg-muted'
                          }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${message.senderId === currentUser.uid
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                          }`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <Separator />

              {/* Quick Templates */}
              {farmersList[selectedFarmer] && (
                <>
                  <div className="p-4 border-b">
                    <p className="text-sm font-medium mb-2">Quick replies:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickTemplates.map((template, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleQuickTemplate(template)}
                        >
                          {template}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your message..."
                        className="resize-none min-h-0 h-10 flex-1"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        rows={1}
                      />
                      <Button
                        onClick={handleSendMessage}
                        className="bg-gradient-primary hover:shadow-glow flex-shrink-0"
                        disabled={!newMessage.trim() || !farmersList[selectedFarmer]}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Start New Chat</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Select a farmer to start a conversation
              </p>
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-3">
                {farmersList.map((farmer, index) => (
                  <div
                    key={farmer.id}
                    onClick={() => handleSelectFarmerForNewChat(index)}
                    className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-lg">
                        👨‍🌾
                      </div>

                      <div className="flex-1">
                        <div className="font-medium">{farmer.name}</div>
                        <p className="text-sm text-muted-foreground">{farmer.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowNewChatModal(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </DashboardLayout>
  );
};

export default Messages;