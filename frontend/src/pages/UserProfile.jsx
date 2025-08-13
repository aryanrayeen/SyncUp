import React, { useState, useEffect } from 'react';
import { User, Edit, Save, X, Camera, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFitnessStore } from '../store/fitnessStore';

const UserProfile = () => {
  const { user, updateUserProfile } = useAuthStore();
  const { userInfo, updateUserInfo, fetchUserInfo, isLoading } = useFitnessStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    bio: 'Fitness enthusiast and health conscious individual',
    weight: 0,
    height: 0,
    age: 0,
    bmi: 0
  });

  // Load user info when component mounts
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // Update form data when userInfo or user changes
  useEffect(() => {
    if (userInfo) {
      setFormData(prev => ({
        ...prev,
        name: user?.name || prev.name, // Use updated name from auth store
        email: user?.email || prev.email, // Use updated email from auth store
        phone: user?.phone || prev.phone, // Use updated phone from auth store
        location: user?.location || prev.location, // Use updated location from auth store
        weight: userInfo.weight || 0,
        height: userInfo.height || 0,
        age: userInfo.age || 0,
        bmi: userInfo.bmi || 0
      }));
    }
  }, [userInfo, user]);

  const handleSave = async () => {
    try {
      // Check if profile data has changed and update user profile if needed
      const profileChanged = 
        formData.name !== user?.name ||
        formData.email !== user?.email ||
        formData.phone !== user?.phone ||
        formData.location !== user?.location;

      if (profileChanged) {
        console.log('Updating user profile:', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location
        });
        await updateUserProfile({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location
        });
      }

      // Always update fitness data
      const updatedData = {
        weight: formData.weight,
        height: formData.height,
        age: formData.age,
        caloriesIntake: userInfo?.caloriesIntake || 2000,
        exerciseMinutes: userInfo?.exerciseMinutes || 30,
        monthlyBudget: userInfo?.monthlyBudget || 5000
      };
      
      console.log('Saving fitness data:', updatedData);
      const result = await updateUserInfo(updatedData);
      
      if (result) {
        console.log('Profile updated successfully, new data:', result);
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData(prev => ({
      ...prev,
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      weight: userInfo?.weight || 0,
      height: userInfo?.height || 0,
      age: userInfo?.age || 0,
      bmi: userInfo?.bmi || 0
    }));
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-base-content">Profile</h1>
        <p className="text-base-content/70 mt-2">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                  <User className="w-16 h-16 text-primary-content" />
                </div>
                <button className="absolute bottom-2 right-2 btn btn-circle btn-sm btn-primary">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-2xl font-bold">{formData.name}</h2>
              <p className="text-base-content/70">{formData.bio}</p>
              <div className="divider"></div>
              <div className="stats stats-vertical shadow">
                <div className="stat">
                  <div className="stat-title">Member Since</div>
                  <div className="stat-value text-lg">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Goals Completed</div>
                  <div className="stat-value text-lg">{userInfo?.goalsCompleted || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary btn-sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="btn btn-success btn-sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn btn-error btn-sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Full Name</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="input input-bordered"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-base-100 rounded-lg">
                      <User className="w-4 h-4" />
                      <span>{formData.name}</span>
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      className="input input-bordered"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-base-100 rounded-lg">
                      <Mail className="w-4 h-4" />
                      <span>{formData.email}</span>
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Phone</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-base-100 rounded-lg">
                      <Phone className="w-4 h-4" />
                      <span>{formData.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Location</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder="Enter location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-base-100 rounded-lg">
                      <MapPin className="w-4 h-4" />
                      <span>{formData.location || 'Not provided'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Health Stats */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h3 className="text-xl font-bold mb-4">Health Statistics</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Weight (kg)</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      className="input input-bordered"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value) || 0})}
                    />
                  ) : (
                    <div className="text-center p-3 bg-base-100 rounded-lg">
                      <div className="text-2xl font-bold">{formData.weight}</div>
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Height (cm)</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      className="input input-bordered"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: parseInt(e.target.value) || 0})}
                    />
                  ) : (
                    <div className="text-center p-3 bg-base-100 rounded-lg">
                      <div className="text-2xl font-bold">{formData.height}</div>
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Age</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      className="input input-bordered"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                    />
                  ) : (
                    <div className="text-center p-3 bg-base-100 rounded-lg">
                      <div className="text-2xl font-bold">{formData.age}</div>
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">BMI</span>
                  </label>
                  <div className="text-center p-3 bg-base-100 rounded-lg">
                    <div className="text-2xl font-bold text-success">{formData.bmi}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
