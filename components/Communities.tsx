import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Users, Search, Plus, MapPin, Crown, Shield } from 'lucide-react';

interface Community {
  _id: string;
  name: string;
  description: string;
  category: string;
  avatar?: string;
  location: { city: string; state: string };
  memberCount: number;
  createdBy: { name: string; userId: string; avatar?: string };
  isPublic: boolean;
  tags: string[];
}

export function Communities() {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = ['Photography', 'Food & Dining', 'Technology', 'Health & Fitness', 'Travel', 'Music', 'Sports', 'Art'];

  useEffect(() => {
    fetchCommunities();
  }, [search, selectedCategory]);

  const fetchCommunities = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await fetch(`https://localitybay-backend.onrender.com/api/communities?${params}`);
      const data = await response.json();
      
      if (data.status) {
        setCommunities(data.data.communities);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinCommunity = async (communityId: string) => {
    try {
      const response = await fetch(`https://localitybay-backend.onrender.com/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        fetchCommunities(); // Refresh list
      }
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Communities</h1>
        <Button onClick={() => navigate('/create-community')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Community
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search communities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Badge
              variant={selectedCategory === '' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory('')}
            >
              All
            </Badge>
            {categories.map(category => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {communities.map(community => (
          <Card key={community._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={community.avatar} />
                  <AvatarFallback>{community.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{community.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-3 w-3" />
                    {community.location.city}, {community.location.state}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">{community.description}</p>
              
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary">{community.category}</Badge>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="h-3 w-3" />
                  {community.memberCount} members
                </div>
              </div>

              {community.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap mb-3">
                  {community.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={community.createdBy.avatar} />
                    <AvatarFallback>{community.createdBy.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600">by {community.createdBy.name}</span>
                </div>
                <Button size="sm" onClick={() => joinCommunity(community._id)}>
                  Join
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {communities.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No communities found</h3>
            <p className="text-gray-600">Try adjusting your search or create a new community</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}