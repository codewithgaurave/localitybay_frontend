import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants/routes";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Shield,
  Crown,
  Edit,
  MessageCircle,
  Users,
  Calendar,
  Heart,
  UserPlus,
  Copy,
  Check,
  ArrowLeft,
  Award,
  Star,
  X,
  Zap,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Textarea } from "./ui/textarea";

interface UserData {
  _id: string;
  name: string;
  userId?: string;
  dateOfBirth?: string;
  avatar?: string;
  isVerified: boolean;
  isPremium?: boolean;
  badges?: string[];
  bio?: string;
  interests?: string[];
  message?: string;
  photos?: string[];
  location?: {
    city?: string;
  };
  phone?: string;
  email?: string;
  createdAt: string;
}

export function UserProfile() {
  const navigate = useNavigate();
  const { userId } = useParams(); // Get userId from URL params
  const { user: authUser } = useAuth();
  const isOwnProfile = !userId; // If no userId in URL, it's own profile
  const [profileUser, setProfileUser] = useState<UserData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string>("");
  const [showCommunitiesModal, setShowCommunitiesModal] = useState(false);
  const [showMeetupsModal, setShowMeetupsModal] = useState(false);
  const [copiedUserId, setCopiedUserId] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isPostingMessage, setIsPostingMessage] = useState(false);
  const [showMessageEdit, setShowMessageEdit] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Use profile user data (either own or other user's)
  const user = profileUser ? {
    id: profileUser._id,
    name: profileUser.name,
    userId: profileUser.userId,
    dateOfBirth: profileUser.dateOfBirth,
    photo: profileUser.avatar || "https://images.unsplash.com/photo-1494790108755-2616b5b65b75?w=200&h=200&fit=crop&crop=face",
    verified: profileUser.isVerified,
    premium: profileUser.isPremium,
    badges: profileUser.badges || ["Explorer", "Local Guide"],
    bio: profileUser.bio || "LocalityBay user exploring the community!",
    interests: profileUser.interests || ["Photography", "Travel", "Technology"],
    message: profileUser.message || "",
    photos: profileUser.photos || [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1501436513145-30f24e19fcc4?w=400&h=400&fit=crop",
    ],
    joinedCommunities: [
      { name: "Photography Enthusiasts", members: 1247, type: "permanent" },
      { name: "Local Hikers", members: 856, type: "permanent" },
      { name: "Tech Meetup Group", members: 342, type: "temporary" },
    ],
    hostedMeetups: [
      {
        name: "Weekend Photography Walk",
        date: "2024-07-20",
        attendees: 15,
        status: "completed",
      },
      {
        name: "Sunset Hike",
        date: "2024-07-15",
        attendees: 8,
        status: "completed",
      },
    ],
    location: profileUser.location?.city || "Delhi",
    phone: profileUser.phone,
    email: profileUser.email,
    joinDate: new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  } : null;

  // Set current message from user data
  React.useEffect(() => {
    if (user?.message) {
      setCurrentMessage(user.message);
    } else {
      setCurrentMessage(""); // Ensure empty string if no message
    }
  }, [user?.message]);

  // Fetch user profile data
  const fetchUserProfile = async (id: string) => {
    try {
      setIsLoadingProfile(true);
      const response = await fetch(`http://localhost:5000/api/users/${id}`);
      const data = await response.json();
      
      if (response.ok && data.status) {
        setProfileUser(data.data);
      } else {
        console.error('Failed to fetch user profile:', data.message);
        navigate(ROUTES.HOME);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      navigate(ROUTES.HOME);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Load profile data based on URL
  useEffect(() => {
    if (userId) {
      // Viewing another user's profile
      fetchUserProfile(userId);
    } else {
      // Own profile - use auth user data
      setProfileUser(authUser as UserData);
    }
  }, [userId, authUser]);

  // Force refresh user data
  const refreshUserData = () => {
    // Simple solution: reload to get fresh data
    if (localStorage.getItem('token')) {
      window.location.reload();
    }
  };

  if (!user || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{isLoadingProfile ? 'Loading profile...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  const handlePhotoClick = (photo: string) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(user.userId);
    setCopiedUserId(true);
    setTimeout(() => setCopiedUserId(false), 2000);
  };

  const toggleOnlineStatus = async () => {
    try {
      setIsUpdatingStatus(true);
      
      const response = await fetch('http://localhost:5000/api/messages/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isOnline: !isOnline })
      });
      
      const data = await response.json();
      
      if (response.ok && data.status) {
        setIsOnline(!isOnline);
        console.log(`Status updated to ${data.data.status}`);
      } else {
        console.error('Failed to update status:', data.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePostMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      setIsPostingMessage(true);
      
      const response = await fetch('http://localhost:5000/api/messages/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: newMessage.trim() })
      });
      
      const data = await response.json();
      
      if (response.ok && data.status) {
        // Update local state immediately
        setCurrentMessage(newMessage.trim());
        setNewMessage("");
        setShowMessageEdit(false);
        console.log('Message posted successfully');
      } else {
        console.error('Failed to post message:', data.message);
        alert('Failed to post message. Please try again.');
      }
    } catch (error) {
      console.error('Error posting message:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsPostingMessage(false);
    }
  };

  const handleClearMessage = async () => {
    try {
      setIsPostingMessage(true);
      
      const response = await fetch('http://localhost:5000/api/messages/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        // Update local state immediately
        setCurrentMessage("");
        setNewMessage("");
        setShowMessageEdit(false);
        console.log('Message cleared successfully');
      } else {
        alert('Failed to clear message. Please try again.');
      }
    } catch (error) {
      console.error('Error clearing message:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsPostingMessage(false);
    }
  };

  const handleFollow = async () => {
    if (!userId) return;
    
    try {
      setIsFollowLoading(true);
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      
      const response = await fetch(`http://localhost:5000/api/follow/${userId}/${endpoint}`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/chat/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ participantId: userId })
      });
      
      const data = await response.json();
      if (data.status) {
        // Navigate to chat or open chat modal
        navigate(`/chat/${data.data.chat._id}`);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  return (
    <>
      {/* Import Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen bg-gradient-to-br from-blue-500/5 via-white to-indigo-500/5"
        style={{ fontFamily: "'Urbanist', sans-serif" }}
      >
        {/* Header with Back Button */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-blue-100/50 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.HOME)}
              className="p-2 hover:bg-blue-50 rounded-full"
            >
              <ArrowLeft className="h-5 w-5 text-blue-600" />
            </Button>
            <h1
              className="text-lg"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                color: "#1f2937",
              }}
            >
              Profile
            </h1>
            <div className="w-9"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Main Profile Content */}
        <div className="pb-32">
          {/* Profile Header Section - Mobile Optimized */}
          <div className="bg-white p-4 mb-2">
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-20 w-20 border-3 border-white shadow-lg ring-4 ring-blue-100">
                  <AvatarImage src={user.photo} alt={user.name} />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    {user.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {user.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-1.5 shadow-lg">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                )}
                {user.premium && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1.5 shadow-lg">
                    <Crown className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>

              {/* Name and User ID */}
              <div className="flex-1 pt-1">
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  {user.name}
                </h1>
                <div className="flex items-center space-x-2 text-blue-600 mb-3">
                  <span className="text-sm font-medium">{user.userId}</span>
                  <button
                    onClick={copyUserId}
                    className="p-1 hover:bg-blue-50 rounded transition-colors"
                  >
                    {copiedUserId ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-gray-700 text-sm leading-relaxed mb-4 mt-2">
              {user.bio}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {isOwnProfile ? (
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={() => navigate(ROUTES.EDIT_PROFILE)}
                    className="px-6 rounded-lg flex-1"
                    style={{ backgroundColor: "#D3D3D3" }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    onClick={() => navigate(ROUTES.VERIFICATION)}
                    className="px-6 rounded-lg flex-1"
                    style={{ backgroundColor: "#87CEFA" }}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Get Verified
                  </Button>
                </div>
              ) : (
                <>
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg flex-1"
                    onClick={handleFollow}
                    disabled={isFollowLoading}
                  >
                    {isFollowLoading ? (
                      <div className="animate-spin h-4 w-4 border border-white border-t-transparent rounded-full mr-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    {isFollowLoading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow')}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-4"
                    onClick={handleStartChat}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Online/Offline Status Toggle */}
            {isOwnProfile && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {isOnline ? 'Online' : 'Offline'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isOnline ? 'Visible to other users' : 'Hidden from other users'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={toggleOnlineStatus}
                    disabled={isUpdatingStatus}
                    size="sm"
                    variant={isOnline ? "outline" : "default"}
                    className={`${isOnline ? 'border-red-200 text-red-600 hover:bg-red-50' : 'bg-green-500 hover:bg-green-600 text-white'} rounded-lg`}
                  >
                    {isUpdatingStatus ? (
                      <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                    ) : (
                      isOnline ? 'Go Offline' : 'Go Online'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Map Message Section */}
          {isOwnProfile && (
            <div className="bg-white p-4 mb-2">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Map Message
              </h3>
              
              {currentMessage ? (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-800 text-sm">"{currentMessage}"</p>
                    <p className="text-xs text-blue-600 mt-1">This message appears on your profile on the map</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setNewMessage(currentMessage);
                        setShowMessageEdit(true);
                      }}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={handleClearMessage}
                      disabled={isPostingMessage}
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      {isPostingMessage ? (
                        <div className="animate-spin h-3 w-3 border border-red-600 border-t-transparent rounded-full" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                    <p className="text-gray-600 text-sm">No message posted yet</p>
                    <p className="text-xs text-gray-500 mt-1">Post a message to display on your map profile</p>
                  </div>
                  <Button
                    onClick={() => setShowMessageEdit(true)}
                    size="sm"
                    className="w-full"
                  >
                    <MessageSquare className="h-3 w-3 mr-2" />
                    Post Message
                  </Button>
                </div>
              )}
              
              {/* Message Edit Form */}
              {showMessageEdit && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-3">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message (max 80 characters)"
                      maxLength={80}
                      className="min-h-16 resize-none"
                    />
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Message will appear on your map profile</span>
                      <span className={newMessage.length > 70 ? "text-orange-500" : "text-gray-500"}>
                        {newMessage.length}/80
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handlePostMessage}
                        disabled={!newMessage.trim() || isPostingMessage}
                        size="sm"
                        className="flex-1"
                      >
                        {isPostingMessage ? (
                          <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-2" />
                        ) : (
                          <MessageSquare className="h-3 w-3 mr-2" />
                        )}
                        {isPostingMessage ? 'Posting...' : 'Post'}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowMessageEdit(false);
                          setNewMessage("");
                        }}
                        size="sm"
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Badges */}
          <div className="bg-white p-4 mb-2">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.badges.map((badge: string) => (
                <Badge
                  key={badge}
                  variant="outline"
                  className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200 text-sm px-3 py-1"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {badge}
                </Badge>
              ))}
            </div>
          </div>

          {/* Interests Section */}
          <div className="bg-white p-4 mb-2">
            <h3 className="font-semibold text-gray-900 mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest: string) => (
                <span
                  key={interest}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  style={{ fontFamily: "'Quicksand', sans-serif" }}
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Photos Grid Section */}
          <div className="bg-white p-4 mb-2">
            <div className="grid grid-cols-3 gap-1">
              {user.photos.map((photo: string, index: number) => (
                <div
                  key={index}
                  className="aspect-square relative group cursor-pointer overflow-hidden rounded-lg"
                  onClick={() => handlePhotoClick(photo)}
                >
                  <ImageWithFallback
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Communities and Meetups Section */}
          <div className="bg-white p-4 mb-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowCommunitiesModal(true)}
                className="p-4 border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200 text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 rounded-full p-2">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      Joined Communities
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.joinedCommunities.length} joined
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowMeetupsModal(true)}
                className="p-4 border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200 text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-500 rounded-full p-2">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      Hosted Meetups
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.hostedMeetups.length} hosted
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Premium Upgrade Card - Separate Card */}
          {isOwnProfile && !user.premium && (
            <div className="bg-white p-4 mb-2">
              <button
                onClick={() => setShowPremiumModal(true)}
                className="w-full p-4 bg-gradient-to-r from-black to-gray-800 rounded-xl hover:from-gray-900 hover:to-black transition-all duration-500 text-left shadow-lg hover:shadow-2xl transform hover:scale-[1.02] relative overflow-hidden"
              >
                {/* Animated shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent transform -translate-x-full animate-pulse"></div>

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 animate-bounce">
                      <Crown className="h-4 w-4 text-black" />
                    </div>
                    <div>
                      <span className="font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent block">
                        Upgrade to Premium
                      </span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-red-400 text-sm line-through">
                          ₹500/month
                        </span>
                        <span className="text-green-400 font-bold text-sm">
                          ₹200/month
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                    60% OFF
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Photo Modal */}
        <Dialog open={showPhotoModal} onOpenChange={setShowPhotoModal}>
          <DialogContent className="max-w-[95vw] max-h-[90vh] p-0 border-0 bg-black/95">
            <DialogHeader className="sr-only">
              <DialogTitle>Photo View</DialogTitle>
              <DialogDescription>
                Full size view of the selected photo
              </DialogDescription>
            </DialogHeader>
            <div className="relative">
              <ImageWithFallback
                src={selectedPhoto}
                alt="Full size photo"
                className="w-full h-auto max-h-[90vh] object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Communities Modal */}
        <Dialog
          open={showCommunitiesModal}
          onOpenChange={setShowCommunitiesModal}
        >
          <DialogContent className="max-w-md bg-white border-gray-200 transition-all duration-300 hover:border-gray-300 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                Joined Communities
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                View all communities that {user.name} has joined
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {user.joinedCommunities.map((community: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100"
                >
                  <div>
                    <p className="font-semibold text-blue-900">
                      {community.name}
                    </p>
                    <p className="text-sm text-blue-600">
                      {community.members} members
                    </p>
                  </div>
                  <Badge
                    variant={
                      community.type === "permanent" ? "default" : "secondary"
                    }
                    className={
                      community.type === "permanent"
                        ? "bg-blue-500"
                        : "bg-blue-200 text-blue-800"
                    }
                  >
                    {community.type}
                  </Badge>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Meetups Modal */}
        <Dialog open={showMeetupsModal} onOpenChange={setShowMeetupsModal}>
          <DialogContent className="max-w-md bg-white border-gray-200 transition-all duration-300 hover:border-gray-300 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                Hosted Meetups
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                View all meetups that {user.name} has hosted
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {user.hostedMeetups.map((meetup: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-indigo-50 rounded-lg border border-indigo-100"
                >
                  <p className="font-semibold text-indigo-900">{meetup.name}</p>
                  <p className="text-sm text-indigo-600">
                    {new Date(meetup.date).toLocaleDateString()} •{" "}
                    {meetup.attendees} attendees
                  </p>
                  <Badge className="mt-2 bg-indigo-500">{meetup.status}</Badge>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Premium Upgrade Modal */}
        <Dialog open={showPremiumModal} onOpenChange={setShowPremiumModal}>
          <DialogContent className="max-w-md p-0 border-0 bg-transparent">
            <DialogHeader className="sr-only">
              <DialogTitle>Premium Upgrade</DialogTitle>
              <DialogDescription>Upgrade to premium features</DialogDescription>
            </DialogHeader>
            <div className="relative overflow-hidden bg-gradient-to-r from-black via-gray-900 to-black rounded-2xl p-6 shadow-2xl">
              {/* Close button */}
              <button
                onClick={() => setShowPremiumModal(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white z-20"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-yellow-400/20 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-45deg from-transparent via-yellow-400/10 to-transparent animate-bounce opacity-50"></div>

              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 animate-pulse">
                    <Crown className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                      Upgrade to Premium
                    </h3>
                    <p className="text-yellow-400/90 text-sm">
                      Just ₹200/month
                    </p>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-3 mb-3 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 rounded-xl">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    "Hide from map",
                    "Priority search",
                    "Advanced filters",
                    "Unlimited photos",
                    "Premium badge",
                    "Exclusive events",
                  ].map((benefit: string) => (
                    <div key={benefit} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-yellow-100">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
