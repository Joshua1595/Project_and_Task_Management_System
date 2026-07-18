import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  User, KeyRound, Mail, Lock, CheckCircle, 
  UploadCloud, ShieldAlert, Image as ImageIcon 
} from 'lucide-react';
import { motion } from 'motion/react';

export default function ProfilePage() {
  const { user, updateUserContext } = useAuth();
  
  // Basic info form state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileImage, setProfileImage] = useState(user?.profile_image || '');
  const [infoSuccess, setInfoSuccess] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);

  // Password reset state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  // Drag and drop state
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoSuccess(false);
    setInfoError(null);

    try {
      const updated = await api.updateUser(user.id, {
        full_name: fullName,
        email,
        profile_image: profileImage
      });
      updateUserContext(updated);
      setInfoSuccess(true);
    } catch (err: any) {
      setInfoError(err.message || 'Failed to update profile info');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess(false);
    setPassError(null);

    if (password !== confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }

    try {
      await api.updateUser(user.id, { password });
      setPassSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassError(err.message || 'Failed to update password');
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG/JPG)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to downscale/resize the image (max 250x250) for lightweight DB storage
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setProfileImage(compressedBase64);
          setInfoSuccess(false);

          api.updateUser(user.id, { profile_image: compressedBase64 })
            .then(updated => {
              updateUserContext(updated);
              setInfoSuccess(true);
            })
            .catch(err => {
              setInfoError(err.message || 'Failed to upload photo');
            });
        }
      };
      img.onerror = () => {
        setInfoError('Failed to process image data');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setInfoError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8 font-sans text-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card & Photo Uploader */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-2xs text-center flex flex-col items-center">
            <div className="relative group">
              <img 
                src={profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'} 
                alt={user.full_name} 
                className="h-28 w-28 rounded-3xl object-cover border-4 border-slate-50 shadow-md group-hover:opacity-90 transition-opacity"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-xs font-bold">
                Change Photo
              </div>
            </div>

            <h3 className="font-extrabold text-lg text-slate-900 mt-4 leading-tight">{user.full_name}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{user.role}</p>

            <div className="w-full border-t border-slate-100 my-4 pt-4 text-xs text-slate-500 space-y-1.5 text-left">
              <p className="flex justify-between">
                <span>Account ID:</span>
                <span className="font-bold text-slate-700">{user.id}</span>
              </p>
              <p className="flex justify-between">
                <span>Created At:</span>
                <span className="font-bold text-slate-700">
                  {new Date(user.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </span>
              </p>
            </div>
          </div>

          {/* Usability Guidelines Compliant Drag-and-Drop Uploader */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-2xs">
            <h4 className="font-bold text-sm text-slate-900 mb-3">Upload Profile Picture</h4>
            
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                dragActive 
                  ? 'border-indigo-600 bg-indigo-50/40' 
                  : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <input 
                id="profile-file-input"
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                className="hidden"
                accept="image/*"
              />
              <UploadCloud className={`h-8 w-8 ${dragActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <div>
                <p className="text-xs font-bold text-slate-800">Drag & drop photo here</p>
                <p className="text-xxs text-slate-500 mt-0.5">or click to browse your folders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile details & Password reset Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Details Form */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-150 shadow-2xs">
            <h3 className="font-extrabold text-lg text-slate-900 mb-6 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-indigo-600" />
              Profile Details
            </h3>

            {infoSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700 text-sm flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                <span>Your profile details have been saved successfully.</span>
              </div>
            )}

            {infoError && (
              <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100 text-red-700 text-sm flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />
                <span>{infoError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="p-fullname" className="block text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    id="p-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="p-email" className="block text-sm font-semibold text-slate-700">Email Address</label>
                  <input
                    id="p-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="p-image-url" className="block text-sm font-semibold text-slate-700">Avatar URL</label>
                <div className="mt-1.5 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <input
                    id="p-image-url"
                    type="text"
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 border border-slate-250 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  id="profile-details-submit-btn"
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 shadow-xs cursor-pointer transition-all"
                >
                  Save Profile Info
                </button>
              </div>
            </form>
          </div>

          {/* Password Reset Form */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-150 shadow-2xs">
            <h3 className="font-extrabold text-lg text-slate-900 mb-6 flex items-center">
              <KeyRound className="h-5 w-5 mr-2 text-indigo-600" />
              Security & Password
            </h3>

            {passSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700 text-sm flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                <span>Your login password has been changed successfully.</span>
              </div>
            )}

            {passError && (
              <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100 text-red-700 text-sm flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="p-newpass" className="block text-sm font-semibold text-slate-700">New Password</label>
                  <div className="mt-1.5 relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4.5 w-4.5" />
                    </div>
                    <input
                      id="p-newpass"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 border border-slate-250 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="p-confpass" className="block text-sm font-semibold text-slate-700">Confirm Password</label>
                  <div className="mt-1.5 relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4.5 w-4.5" />
                    </div>
                    <input
                      id="p-confpass"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 border border-slate-250 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  id="profile-password-submit-btn"
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 shadow-xs cursor-pointer transition-all"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
