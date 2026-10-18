import React, { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, Save, Lock, Shield, User, Image as ImageIcon } from 'lucide-react';
import type { ProfileData, SocialLinks } from '../../types/portfolio.ts';

interface ProfileEditorProps {
  profile: ProfileData;
  socials: SocialLinks;
  authToken: string;
  onProfileUpdated: (profile: ProfileData) => void;
  onSocialsUpdated: (socials: SocialLinks) => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  profile,
  socials,
  authToken,
  onProfileUpdated,
  onSocialsUpdated,
}) => {
  const [profileForm, setProfileForm] = useState<ProfileData>(profile);
  const [socialsForm, setSocialsForm] = useState<SocialLinks>(socials);
  
  const [newTool, setNewTool] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSocials, setSavingSocials] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [socialsMsg, setSocialsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  // Sync internal form state whenever parent props update
  React.useEffect(() => {
    setProfileForm(profile);
  }, [profile]);

  React.useEffect(() => {
    setSocialsForm(socials);
  }, [socials]);

  // File upload helper
  const uploadFile = async (file: File): Promise<string> => {
    const body = new FormData();
    body.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Upload failed');
    }
    return data.url;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setProfileMsg(null);
    try {
      const url = await uploadFile(file);
      const updatedProfile = { ...profileForm, avatarImage: url };
      setProfileForm(updatedProfile);
      
      // Auto-save immediately to database so media never reverts
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updatedProfile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save avatar');
      onProfileUpdated(data.profile);
      setProfileMsg({ type: 'success', text: 'Avatar uploaded and permanently saved!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Avatar upload failed' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    setProfileMsg(null);
    try {
      const url = await uploadFile(file);
      const updatedProfile = { ...profileForm, heroFeaturedImage: url };
      setProfileForm(updatedProfile);

      // Auto-save immediately to database so media never reverts
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updatedProfile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save artwork');
      onProfileUpdated(data.profile);
      setProfileMsg({ type: 'success', text: 'Featured artwork uploaded and permanently saved!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Artwork upload failed' });
    } finally {
      setUploadingHero(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      onProfileUpdated(data.profile);
      setProfileMsg({ type: 'success', text: 'Profile and About Me updated successfully!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSocials(true);
    setSocialsMsg(null);
    try {
      const res = await fetch('/api/admin/socials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(socialsForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update social channels');
      onSocialsUpdated(data.socials);
      setSocialsMsg({ type: 'success', text: 'Contact & social links updated successfully!' });
    } catch (err: any) {
      setSocialsMsg({ type: 'error', text: err.message });
    } finally {
      setSavingSocials(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSavingPassword(true);
    setPasswordMsg(null);
    try {
      const res = await fetch('/api/admin/security', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      setPasswordMsg({ type: 'success', text: 'Admin password changed successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  const addTool = () => {
    if (!newTool.trim()) return;
    if (!profileForm.tools.includes(newTool.trim())) {
      setProfileForm({
        ...profileForm,
        tools: [...profileForm.tools, newTool.trim()],
      });
    }
    setNewTool('');
  };

  const removeTool = (toolName: string) => {
    setProfileForm({
      ...profileForm,
      tools: profileForm.tools.filter((t) => t !== toolName),
    });
  };

  return (
    <div className="space-y-12">
      {/* 1. Profile & Visual Artworks Editor */}
      <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" />
              <span>Artist Profile & Visual Media</span>
            </h3>
            <p className="text-xs text-slate-400">
              Customize the hero title, featured artwork, profile picture, and bio.
            </p>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>

        {profileMsg && (
          <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            profileMsg.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border border-rose-800 text-rose-300'
          }`}>
            {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{profileMsg.text}</span>
          </div>
        )}

        {/* Media Preview & Upload Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Avatar Picture */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide block">
              Profile Picture / Avatar
            </span>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                <img src={profileForm.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}</span>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} className="hidden" />
                </label>
                <input
                  type="text"
                  value={profileForm.avatarImage}
                  onChange={(e) => setProfileForm({ ...profileForm, avatarImage: e.target.value })}
                  placeholder="Or paste image URL..."
                  className="w-full px-2.5 py-1 text-xs rounded bg-slate-900 border border-slate-700 text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Hero Featured Artwork */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide block">
              Hero Featured 2D Artwork
            </span>
            <div className="flex items-center gap-4">
              <div className="w-28 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                <img src={profileForm.heroFeaturedImage} alt="Hero Art" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-2 flex-1">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold shadow">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingHero ? 'Uploading...' : 'Upload Featured Art'}</span>
                  <input type="file" accept="image/*" onChange={handleHeroUpload} disabled={uploadingHero} className="hidden" />
                </label>
                <input
                  type="text"
                  value={profileForm.heroFeaturedImage}
                  onChange={(e) => setProfileForm({ ...profileForm, heroFeaturedImage: e.target.value })}
                  placeholder="Or paste artwork URL..."
                  className="w-full px-2.5 py-1 text-xs rounded bg-slate-900 border border-slate-700 text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Text Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Artist Full Name</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Professional Title</label>
            <input
              type="text"
              value={profileForm.title}
              onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Hero Headline</label>
          <input
            type="text"
            value={profileForm.heroHeadline}
            onChange={(e) => setProfileForm({ ...profileForm, heroHeadline: e.target.value })}
            className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Hero Bio</label>
            <textarea
              rows={3}
              value={profileForm.heroBio}
              onChange={(e) => setProfileForm({ ...profileForm, heroBio: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Hero Sub-Bio</label>
            <textarea
              rows={3}
              value={profileForm.heroSubBio}
              onChange={(e) => setProfileForm({ ...profileForm, heroSubBio: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100"
            />
          </div>
        </div>

        {/* About Section Paragraphs */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wide block">
            About Me Paragraphs (Official Bio)
          </label>
          <textarea
            rows={2}
            value={profileForm.aboutBio1}
            onChange={(e) => setProfileForm({ ...profileForm, aboutBio1: e.target.value })}
            className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100"
          />
          <textarea
            rows={2}
            value={profileForm.aboutBio2}
            onChange={(e) => setProfileForm({ ...profileForm, aboutBio2: e.target.value })}
            className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100"
          />
          <textarea
            rows={2}
            value={profileForm.aboutBio3}
            onChange={(e) => setProfileForm({ ...profileForm, aboutBio3: e.target.value })}
            className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100"
          />
        </div>

        {/* Tools & Software List */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wide block">
            Software and Creative Tools List
          </label>
          <div className="flex flex-wrap gap-2">
            {profileForm.tools.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
              >
                <span>{t}</span>
                <button
                  type="button"
                  onClick={() => removeTool(t)}
                  className="text-slate-500 hover:text-rose-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={newTool}
              onChange={(e) => setNewTool(e.target.value)}
              placeholder="Add another tool..."
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100"
            />
            <button
              type="button"
              onClick={addTool}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-200"
            >
              Add
            </button>
          </div>
        </div>
      </form>

      {/* 2. Contact & Social Channels Editor */}
      <form onSubmit={handleSaveSocials} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span>Contact Info & Social Links</span>
            </h3>
            <p className="text-xs text-slate-400">
              Update direct email, WhatsApp phone number, and social profiles.
            </p>
          </div>

          <button
            type="submit"
            disabled={savingSocials}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{savingSocials ? 'Saving...' : 'Save Contact Links'}</span>
          </button>
        </div>

        {socialsMsg && (
          <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            socialsMsg.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border border-rose-800 text-rose-300'
          }`}>
            {socialsMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{socialsMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Email Address</label>
            <input
              type="email"
              value={socialsForm.email}
              onChange={(e) => setSocialsForm({ ...socialsForm, email: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">WhatsApp</label>
            <input
              type="text"
              value={socialsForm.whatsapp}
              onChange={(e) => setSocialsForm({ ...socialsForm, whatsapp: e.target.value })}
              placeholder="+880 1XXXXXXXXX"
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">YouTube Channel</label>
            <input
              type="text"
              value={socialsForm.youtube}
              onChange={(e) => setSocialsForm({ ...socialsForm, youtube: e.target.value })}
              placeholder="https://youtube.com/@channel"
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">LinkedIn Profile</label>
            <input
              type="text"
              value={socialsForm.linkedin}
              onChange={(e) => setSocialsForm({ ...socialsForm, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Facebook Profile / Page</label>
            <input
              type="text"
              value={socialsForm.facebook}
              onChange={(e) => setSocialsForm({ ...socialsForm, facebook: e.target.value })}
              placeholder="https://facebook.com/username"
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Behance / ArtStation (Optional)</label>
            <input
              type="text"
              value={socialsForm.behance || ''}
              onChange={(e) => setSocialsForm({ ...socialsForm, behance: e.target.value })}
              placeholder="https://behance.net/username"
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100"
            />
          </div>
        </div>
      </form>

      {/* 3. Security & Password Settings */}
      <form onSubmit={handleSavePassword} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            <span>Admin Authentication & Password</span>
          </h3>
          <p className="text-xs text-slate-400">
            Change your password to protect the portfolio dashboard.
          </p>
        </div>

        {passwordMsg && (
          <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            passwordMsg.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border border-rose-800 text-rose-300'
          }`}>
            {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={savingPassword}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
        >
          {savingPassword ? 'Updating Password...' : 'Update Admin Password'}
        </button>
      </form>
    </div>
  );
};
