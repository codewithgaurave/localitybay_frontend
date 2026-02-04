import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Navigation, MapPin, Shield, Crown, X } from "lucide-react";

interface User {
  id: number;
  userId: string;
  name: string;
  age: number;
  distance: string;
  status: "online" | "offline";
  photo: string;
  interests: string[];
  verified: boolean;
  premium: boolean;
  bio?: string;
  profession?: string;
  location?: string;
  joinDate?: string;
  mutualFriends?: number;
  rating?: number;
  badges?: string[];
  lat?: number;
  lng?: number;
}

interface SimpleMapProps {
  users: User[];
  onUserClick: (user: User) => void;
  location: string;
  isFullScreen?: boolean;
  onClose?: () => void;
}

// Default coordinates for Delhi, India
const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };
const DEFAULT_ZOOM = 13;

export const SimpleMap: React.FC<SimpleMapProps> = ({
  users,
  onUserClick,
  location,
  isFullScreen,
  onClose,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  console.log('🗺️ SimpleMap received users:', users.length);
  console.log('🗺️ Users details:', users.map(u => ({ id: u.id, name: u.name })));

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    onUserClick(user);
  };

  const getUserOutlineClasses = (user: User) => {
    if (user.verified && user.premium) {
      return "ring-1 ring-gradient-to-r ring-from-blue-400 ring-to-yellow-400 border-2 border-white shadow-lg shadow-blue-300/20";
    } else if (user.verified) {
      return "ring-1 ring-blue-400 border-2 border-white shadow-lg shadow-blue-300/20";
    } else if (user.premium) {
      return "ring-1 ring-yellow-400 border-2 border-white shadow-lg shadow-yellow-300/20";
    }
    return "border-2 border-white shadow-lg ring-1 ring-blue-200";
  };

  if (!mapLoaded) {
    return (
      <div className="flex items-center justify-center h-64 sm:h-80 lg:h-96 bg-gray-100 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Map Background */}
      <div
        ref={mapRef}
        className="w-full h-full rounded-xl bg-gradient-to-br from-blue-50 to-green-50 relative overflow-hidden"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
          `,
        }}
      >
        {/* 5km radius circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-2 border-blue-400 border-dashed rounded-full opacity-30"></div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        ></div>

        {/* User markers */}
        {users.map((user, index) => {
          console.log(`📍 Rendering user ${index + 1}/${users.length}:`, user.name);
          
          // Generate more positions dynamically for all users
          const generatePosition = (index: number) => {
            const positions = [
              { top: "25%", left: "30%" },
              { top: "70%", right: "30%" },
              { top: "50%", left: "70%" },
              { top: "15%", left: "60%" },
              { top: "80%", left: "20%" },
              { top: "35%", left: "15%" },
              { top: "60%", left: "85%" },
              { top: "20%", left: "80%" },
              { top: "85%", left: "60%" },
              { top: "40%", left: "45%" },
              { top: "65%", left: "25%" },
              { top: "30%", left: "75%" },
              { top: "75%", left: "45%" },
              { top: "45%", left: "20%" },
              { top: "55%", left: "80%" },
              { top: "25%", left: "50%" },
              { top: "70%", left: "65%" },
              { top: "35%", left: "85%" },
              { top: "80%", left: "35%" },
              { top: "15%", left: "25%" },
              { top: "90%", left: "75%" },
              { top: "10%", left: "45%" },
              { top: "60%", left: "55%" },
              { top: "40%", left: "65%" },
              { top: "85%", left: "15%" }
            ];
            
            // If more users than positions, generate random positions
            if (index >= positions.length) {
              return {
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 80 + 10}%`
              };
            }
            
            return positions[index];
          };

          const position = generatePosition(index);

          return (
            <div
              key={user.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 active:scale-95"
              style={{
                ...position,
                animationDelay: `${index * 0.2}s`,
              }}
              onClick={() => handleUserClick(user)}
            >
              <div className="relative animate-fade-in">
                <Avatar
                  className={`h-6 w-6 sm:h-7 sm:w-7 transition-all duration-300 ${getUserOutlineClasses(
                    user
                  )} hover:shadow-lg`}
                >
                  <AvatarImage src={user.photo} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>

                {/* Status indicator */}
                <div
                  className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white shadow-sm ${
                    user.status === "online"
                      ? "bg-green-500 animate-pulse"
                      : "bg-gray-400"
                  }`}
                />

                {/* Verification badges - Made smaller */}
                {(user.verified || user.premium) && (
                  <div className="absolute -bottom-0.5 -right-0.5 flex space-x-0.5">
                    {user.verified && (
                      <Shield className="h-2 w-2 text-blue-500 bg-white rounded-full p-0.5 shadow-sm border border-blue-200" />
                    )}
                    {user.premium && (
                      <Crown className="h-2 w-2 text-yellow-500 bg-white rounded-full p-0.5 shadow-sm border border-yellow-200" />
                    )}
                  </div>
                )}

                {/* Click indicator */}
                <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping opacity-0 group-hover:opacity-100" />
              </div>

              {/* Message box above profile */}
              {user.bio && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2 min-w-32 max-w-40 border border-blue-100">
                  <div className="text-center">
                    <p className="text-xs text-gray-700 leading-tight">
                      {user.bio.length > 50
                        ? `${user.bio.substring(0, 50)}...`
                        : user.bio}
                    </p>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-white" />
                </div>
              )}

              {/* Quick preview tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2 min-w-32 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-blue-100">
                <div className="text-center">
                  <h4 className="font-semibold text-gray-800 text-xs">
                    {user.name}
                  </h4>
                  <p className="text-xs text-gray-600">Tap to view profile</p>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-white" />
              </div>
            </div>
          );
        })}

        {/* Map center indicator */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
      </div>

      {/* Map controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white shadow-lg"
          onClick={() => console.log("Zoom in")}
        >
          <Navigation className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white shadow-lg"
          onClick={() => console.log("Zoom out")}
        >
          <Navigation className="h-4 w-4 rotate-180" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white shadow-lg"
          onClick={() => console.log("Center map")}
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>

      {/* User info panel */}
      {selectedUser && (
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 max-w-sm border border-gray-200 shadow-lg z-10">
          <div className="flex items-center space-x-3">
            <Avatar
              className={`h-12 w-12 ${getUserOutlineClasses(selectedUser)}`}
            >
              <AvatarImage src={selectedUser.photo} alt={selectedUser.name} />
              <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-800 truncate">
                {selectedUser.name}, {selectedUser.age}
              </h4>
              <p className="text-sm text-gray-600 truncate">
                {selectedUser.userId}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600">
                    {selectedUser.distance}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      selectedUser.status === "online"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  />
                  <span className="text-xs text-gray-600">
                    {selectedUser.status === "online" ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setSelectedUser(null)}
              className="rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
