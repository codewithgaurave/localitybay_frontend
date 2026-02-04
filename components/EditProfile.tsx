import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants/routes";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Checkbox } from "./ui/checkbox";
import { Upload, X, Shield, Plus, ArrowLeft } from "lucide-react";



export function EditProfile() {
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    name: authUser?.name || "",
    userId: authUser?.userId || "",
    dateOfBirth: authUser?.dateOfBirth ? new Date(authUser.dateOfBirth).toISOString().split('T')[0] : "",
    photo: authUser?.avatar || "",
    bio: authUser?.bio || "",
    phone: authUser?.phone || "",
    location: authUser?.location?.city || ""
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    authUser?.interests || []
  );

  const [customInterest, setCustomInterest] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(
    authUser?.photos || []
  );
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const availableInterests = [
    "Photography",
    "Travel",
    "Coding",
    "Hiking",
    "Coffee",
    "Art",
    "Music",
    "Reading",
    "Gaming",
    "Fitness",
    "Cooking",
    "Dancing",
    "Sports",
    "Movies",
    "Fashion",
    "Tech",
    "Business",
    "Nature",
    "Languages",
    "Volunteering",
    "Pets",
    "Cars",
    "Food",
    "Wine",
  ];

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const addCustomInterest = () => {
    if (
      customInterest.trim() &&
      !selectedInterests.includes(customInterest.trim())
    ) {
      setSelectedInterests((prev) => [...prev, customInterest.trim()]);
      setCustomInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setSelectedInterests((prev) => prev.filter((i) => i !== interest));
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const imageUrl = await uploadImageToCloudinary(file);
      setProfile(prev => ({ ...prev, photo: imageUrl }));
    } catch (error) {
      console.error('Avatar upload failed:', error);
      alert('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      const imageUrl = await uploadImageToCloudinary(file);
      setUploadedPhotos(prev => [...prev, imageUrl]);
    } catch (error) {
      console.error('Photo upload failed:', error);
      alert('Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    // Simple fallback: convert to base64 or use object URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      const updateData = {
        name: profile.name,
        userId: profile.userId,
        dateOfBirth: profile.dateOfBirth,
        bio: profile.bio,
        phone: profile.phone,
        interests: selectedInterests,
        avatar: profile.photo,
        photos: uploadedPhotos,
        location: {
          city: profile.location,
          address: profile.location,
          coordinates: [0, 0] as [number, number]
        }
      };
      
      console.log('Updating profile:', updateData);
      await updateUser(updateData);
      
      alert('Profile updated successfully!');
      navigate(ROUTES.PROFILE);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Urbanist', sans-serif" }}
    >
      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-blue-100/50 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.PROFILE)}
            className="p-2 hover:bg-blue-50 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-blue-600" />
          </Button>
          <h1 className="text-lg font-bold text-gray-900">Edit Profile</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.PROFILE)}
            className="text-blue-600 hover:bg-blue-50"
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Seamless Card Layout */}
      <div className="bg-white">
        {/* Profile Picture and Basic Info */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={profile.photo} alt={profile.name} />
                  <AvatarFallback className="text-lg">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={isUploadingAvatar}
                  />
                  <Button variant="outline" size="sm" disabled={isUploadingAvatar} asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                    </span>
                  </Button>
                </label>
              </div>

            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <Input
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  User ID
                </label>
                <Input
                  value={profile.userId}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, userId: e.target.value }))
                  }
                  placeholder="Enter your user ID"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your unique identifier (e.g., @username)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Date of Birth
                </label>
                <Input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      dateOfBirth: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Bio
                </label>
                <Input
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Tell us about yourself"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone
                </label>
                <Input
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <Input
                  value={profile.location}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, location: e.target.value }))
                  }
                  placeholder="Enter your city"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Interests Section */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Interests
          </h2>
          <div className="space-y-4">
            {/* Selected Interests */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Selected Interests
              </label>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-lg bg-muted/50">
                {selectedInterests.map((interest) => (
                  <Badge
                    key={interest}
                    variant="default"
                    className="flex items-center space-x-1"
                  >
                    <span>{interest}</span>
                    <button
                      onClick={() => removeInterest(interest)}
                      className="ml-1 hover:bg-white/20 rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {selectedInterests.length === 0 && (
                  <span className="text-muted-foreground text-sm">
                    No interests selected
                  </span>
                )}
              </div>
            </div>

            {/* Available Interests */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Available Interests
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                {availableInterests.map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest}
                      checked={selectedInterests.includes(interest)}
                      onCheckedChange={() => handleInterestToggle(interest)}
                    />
                    <label
                      htmlFor={interest}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {interest}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Interest */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Add Custom Interest
              </label>
              <div className="flex space-x-2">
                <Input
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  placeholder="Enter a custom interest..."
                  onKeyPress={(e) => e.key === "Enter" && addCustomInterest()}
                />
                <Button onClick={addCustomInterest} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Photo Gallery
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedPhotos.map((photo, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* Upload new photo */}
            <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={isUploadingPhoto}
              />
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Section */}
        <div className="p-6">
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => navigate(ROUTES.PROFILE)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
