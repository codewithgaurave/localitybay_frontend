import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Send, ArrowLeft } from 'lucide-react';

interface Message {
  _id: string;
  sender: { _id: string; name: string; avatar?: string };
  content: string;
  timestamp: string;
}

interface Chat {
  _id: string;
  participants: Array<{ _id: string; name: string; avatar?: string }>;
  messages: Message[];
  lastMessage?: string;
  lastMessageAt?: string;
}

interface ChatProps {
  chatId?: string;
  onBack?: () => void;
}

export function Chat({ chatId, onBack }: ChatProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (chatId) {
      fetchChatMessages(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/chat/my-chats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.status) {
        setChats(data.data.chats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchChatMessages = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/chat/${id}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.status) {
        setSelectedChat(data.data.chat);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/chat/${selectedChat._id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: message })
      });

      if (response.ok) {
        setMessage('');
        fetchChatMessages(selectedChat._id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const createChat = async (participantId: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/chat/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ participantId })
      });

      const data = await response.json();
      if (data.status) {
        setSelectedChat(data.data.chat);
        fetchChats();
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  if (selectedChat) {
    const otherParticipant = selectedChat.participants.find(p => p._id !== localStorage.getItem('userId'));

    return (
      <div className="flex flex-col h-[600px]">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedChat(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={otherParticipant?.avatar} />
              <AvatarFallback>{otherParticipant?.name[0]}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-lg">{otherParticipant?.name}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {selectedChat.messages.map((msg) => {
              const isOwn = msg.sender._id === localStorage.getItem('userId');
              return (
                <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwn ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button onClick={sendMessage} disabled={loading || !message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent>
        {chats.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => {
              const otherParticipant = chat.participants.find(p => p._id !== localStorage.getItem('userId'));
              return (
                <div
                  key={chat._id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => setSelectedChat(chat)}
                >
                  <Avatar>
                    <AvatarImage src={otherParticipant?.avatar} />
                    <AvatarFallback>{otherParticipant?.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">{otherParticipant?.name}</h4>
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.lastMessageAt && (
                    <span className="text-xs text-gray-500">
                      {new Date(chat.lastMessageAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </div>
  );
}