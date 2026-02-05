import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface Chat {
  _id: string;
  participants: Array<{ _id: string; name: string; avatar?: string; userId: string }>;
  lastMessage?: string;
  lastMessageAt?: string;
}

export function Messages() {
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await fetch('https://localitybay-backend.onrender.com/api/chat/my-chats', {
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
    } finally {
      setLoading(false);
    }
  };

  const currentUserId = localStorage.getItem('userId');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Your Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : chats.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No conversations yet</p>
              <p className="text-sm text-gray-500 mt-2">Start chatting with people from your area!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => {
                const otherParticipant = chat.participants.find(p => p._id !== currentUserId);
                return (
                  <div
                    key={chat._id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => navigate(`/chat/${chat._id}`)}
                  >
                    <Avatar>
                      <AvatarImage src={otherParticipant?.avatar} />
                      <AvatarFallback>{otherParticipant?.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{otherParticipant?.name}</h4>
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage || 'Start a conversation'}
                      </p>
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
      </Card>
    </div>
  );
}