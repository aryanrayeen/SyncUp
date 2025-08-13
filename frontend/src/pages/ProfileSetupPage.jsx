import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import api from '../lib/axios';

const ProfileSetupPage = () => {
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    caloriesIntake: '',
    exerciseMinutes: '',
    monthlyBudget: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { markProfileAsComplete } = useProfileStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Submitting profile data...', formData);
      const response = await api.post(
        '/user-info',
        {
          age: parseInt(formData.age),
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          caloriesIntake: parseInt(formData.caloriesIntake),
          exerciseMinutes: parseInt(formData.exerciseMinutes),
          monthlyBudget: parseFloat(formData.monthlyBudget)
        }
      );

      console.log('Profile setup response:', response.data);

      if (response.status === 201 || response.status === 200) {
        console.log('Profile setup successful, updating profile state...');
        // Mark profile as complete in the store
        markProfileAsComplete();
        
        console.log('Profile state updated, navigating to dashboard...');
        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl justify-center mb-6">
            Welcome, {user?.name}! 👋
          </h2>
          <p className="text-center text-base-content/70 mb-6">
            Let's set up your profile to personalize your fitness and wellness journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Age</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="input input-bordered"
                  required
                  min="1"
                  max="150"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Height (cm)</span>
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="input input-bordered"
                  required
                  min="50"
                  max="300"
                  step="0.1"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Weight (kg)</span>
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="input input-bordered"
                required
                min="10"
                max="500"
                step="0.1"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Daily Calorie Target</span>
              </label>
              <input
                type="number"
                name="caloriesIntake"
                value={formData.caloriesIntake}
                onChange={handleChange}
                className="input input-bordered"
                required
                min="800"
                max="5000"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Daily Exercise Target (minutes)</span>
              </label>
              <input
                type="number"
                name="exerciseMinutes"
                value={formData.exerciseMinutes}
                onChange={handleChange}
                className="input input-bordered"
                required
                min="0"
                max="480"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Monthly Budget ($)</span>
              </label>
              <input
                type="number"
                name="monthlyBudget"
                value={formData.monthlyBudget}
                onChange={handleChange}
                className="input input-bordered"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-control mt-6">
              <button 
                type="submit" 
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
