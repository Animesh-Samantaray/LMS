import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import studentService from '../../services/student.service';
import instructorService from '../../services/instructor.service';
import adminService from '../../services/admin.service';
import {
  Home,
  AlertCircle,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  Camera,
  CheckCircle2,
  ExternalLink,
  Github,
  Globe,
  GraduationCap,
  Heart,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Save,
  Settings,
  Sparkles,
  Target,
  User,
  Users,
  X,
  Shield,
  Clock,
  Check,
} from 'lucide-react';

const formatDisplayDate = (dateString) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const TagInput = ({
  label,
  tags = [],
  onChange,
  placeholder = 'Add an item...',
  icon: Icon,
  helperText,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const items = trimmed
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const updated = [...tags];
    items.forEach((item) => {
      if (!updated.includes(item)) {
        updated.push(item);
      }
    });

    onChange(updated);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (indexToRemove) => {
    const updated = tags.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)]">
          {Icon && <Icon size={14} className="text-[var(--lms-accent)]" />}
          {label}
        </label>
        {tags.length > 0 && (
          <span className="text-[10px] font-semibold text-[var(--lms-text-muted)]">
            {tags.length} {tags.length === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 lms-input text-xs sm:text-sm"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="lms-btn-secondary flex items-center gap-1 text-xs py-2 px-3.5 disabled:opacity-50"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      {helperText && (
        <p className="text-[11px] text-[var(--lms-text-muted)]">{helperText}</p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)]"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="opacity-70 hover:opacity-100 hover:text-rose-500 transition-colors"
                title={`Remove ${tag}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const TagChip = ({ text }) => (
  <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] transition-transform hover:-translate-y-0.5">
    {text}
  </span>
);

const InfoItem = ({ icon: Icon, label, value, isLink, href }) => {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)]">
      <div className="w-9 h-9 rounded-xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">
          {label}
        </p>
        {isLink && href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[var(--lms-accent)] hover:underline truncate"
          >
            <span>{value}</span>
            <ExternalLink size={12} className="shrink-0" />
          </a>
        ) : (
          <p className="mt-0.5 text-xs sm:text-sm font-semibold text-[var(--lms-text-primary)] break-words">
            {value}
          </p>
        )}
      </div>
    </div>
  );
};

const ProfileSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-52 rounded-2xl bg-[var(--lms-surface)] border border-[var(--lms-border)]" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-64 rounded-2xl bg-[var(--lms-surface)] border border-[var(--lms-border)] md:col-span-1" />
      <div className="h-64 rounded-2xl bg-[var(--lms-surface)] border border-[var(--lms-border)] md:col-span-2" />
    </div>
  </div>
);

const ProfileSettings = () => {
  const { user: authUser, setUser: setAuthUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileData, setProfileData] = useState(null);
  const [userData, setUserData] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    location: '',
    dateOfBirth: '',
    education: '',
    interests: [],
    skills: [],
    learningGoals: [],
    expertise: [],
    qualification: '',
    experience: '',
    designation: '',
    socialLinks: {
      linkedin: '',
      github: '',
      website: '',
    },
  });

  const role = userData?.role || authUser?.role || 'Student';
  const isStudent = role === 'Student';
  const isInstructor = role === 'Instructor';
  const isAdmin = role === 'Admin';

  const roleTitle = isAdmin ? 'ADMIN' : isInstructor ? 'MENTOR' : 'STUDENT';

            const sidebarItems = isAdmin
    ? [
        { label: 'Overview', path: '/admin/dashboard', icon: Home },
        { category: 'Administration' },
        { label: 'Approve Users', path: '#', icon: '\u2705' },
        { label: 'Manage Users', path: '#', icon: '\uD83D\uDC65' },
        { label: 'Manager List', path: '#', icon: '\uD83D\uDCCB' },
        { label: 'Groups', path: '#', icon: '\uD83C\uDFD8\uFE0F' },
        { category: 'Management' },
        { label: 'Approve Courses', path: '#', icon: '\uD83C\uDF93' },
        { label: 'Assign Courses', path: '#', icon: '\u2795' },
        { label: 'Grace Timers', path: '#', icon: '\u23F1\uFE0F' },
        { category: 'Engagement' },
        { label: 'Group messages', path: '#', icon: '\uD83D\uDCAC' },
        { label: 'Support Queries', path: '#', icon: '\u2753' },
        { label: 'Certificates', path: '#', icon: '\uD83C\uDF96\uFE0F' },
        { category: 'Account' },
        { label: 'Settings', path: '/admin/profile', icon: '\u2699\uFE0F' }
      ]
    : isInstructor
    ? [
        { label: 'Overview', path: '/instructor/dashboard', icon: Home },
        { category: 'Manager' },
        { label: 'View Students', path: '#', icon: '\uD83D\uDC65' },
        { label: 'Course Progress', path: '#', icon: '\uD83D\uDCD6' },
        { label: 'Exam Progress', path: '#', icon: '\uD83D\uDCDD' },
        { label: 'Certificates', path: '#', icon: '\uD83C\uDF96\uFE0F' },
        { category: 'Account' },
        { label: 'Settings', path: '/instructor/profile', icon: '\u2699\uFE0F' }
  ]
    : [
        { label: 'Overview', path: '/student/dashboard', icon: Home },
        { category: 'Learning' },
        { label: 'My Courses', path: '#', icon: '\uD83D\uDCD6' },
        { label: 'Mock Test', path: '#', icon: '\uD83D\uDCC4' },
        { label: 'Practice Arena', path: '#', icon: '\uD83C\uDFAF' },
        { label: 'Exams', path: '#', icon: '\uD83D\uDCDD' },
        { label: 'Weekly Contests', path: '#', icon: '\uD83C\uDFC6' },
        { label: 'Certificates', path: '#', icon: '\uD83C\uDF96\uFE0F' },
        { category: 'Engagement' },
        { label: 'My Groups', path: '#', icon: '\uD83D\uDC65' },
        { label: 'My Reviews', path: '#', icon: '\u2B50' },
        { label: 'Messages', path: '#', icon: '\uD83D\uDCAC' },
        { label: 'Calendar', path: '#', icon: '\uD83D\uDCC5' },
        { category: 'Account' },
        { label: 'Settings', path: '/student/profile', icon: '\u2699\uFE0F' }
      ];

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');

      let response;
      if (isStudent) {
        response = await studentService.getStudentProfile();
      } else if (isInstructor) {
        response = await instructorService.getInstructorProfile();
      } else {
        response = await adminService.getAdminProfile();
      }

      const fetchedUser = response?.user || authUser || {};
      const fetchedProfile = response?.profile || {};

      setUserData(fetchedUser);
      setProfileData(fetchedProfile);

      setFormData({
        name: fetchedUser.name || '',
        email: fetchedUser.email || '',
        bio: fetchedProfile.bio || '',
        phone: fetchedProfile.phone || '',
        location: fetchedProfile.location || '',
        dateOfBirth: formatDateForInput(fetchedProfile.dateOfBirth),
        education: fetchedProfile.education || '',
        interests: Array.isArray(fetchedProfile.interests) ? [...fetchedProfile.interests] : [],
        skills: Array.isArray(fetchedProfile.skills) ? [...fetchedProfile.skills] : [],
        learningGoals: Array.isArray(fetchedProfile.learningGoals)
          ? [...fetchedProfile.learningGoals]
          : [],
        expertise: Array.isArray(fetchedProfile.expertise) ? [...fetchedProfile.expertise] : [],
        qualification: fetchedProfile.qualification || '',
        experience: fetchedProfile.experience || '',
        designation: fetchedProfile.designation || '',
        socialLinks: {
          linkedin: fetchedProfile.socialLinks?.linkedin || '',
          github: fetchedProfile.socialLinks?.github || '',
          website: fetchedProfile.socialLinks?.website || '',
        },
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError(err.message || 'Failed to load profile data from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser && authUser.role) {
      fetchProfile();
    }
  }, [authUser?.role]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value,
      },
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, GIF, or WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size exceeds 5 MB. Please choose a smaller image.');
      return;
    }

    try {
      setUploadingImage(true);
      setError('');

      const body = new FormData();
      body.append('profileImage', file);

      let response;
      if (isStudent) {
        response = await studentService.uploadStudentProfileImage(body);
      } else if (isInstructor) {
        response = await instructorService.uploadInstructorProfileImage(body);
      } else {
        response = await adminService.uploadAdminProfileImage(body);
      }

      if (response?.profileImage) {
        const updatedImageUrl = response.profileImage;
        setUserData((prev) => ({ ...prev, profileImage: updatedImageUrl }));
        if (setAuthUser) {
          setAuthUser((prev) => ({ ...prev, profileImage: updatedImageUrl }));
        }
        setSuccess('Profile image updated successfully.');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload profile image.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      let response;

      if (isStudent) {
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          bio: formData.bio.trim(),
          phone: formData.phone.trim(),
          dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth : null,
          location: formData.location.trim(),
          education: formData.education.trim(),
          interests: formData.interests,
          skills: formData.skills,
          learningGoals: formData.learningGoals,
          socialLinks: {
            linkedin: formData.socialLinks.linkedin.trim(),
            github: formData.socialLinks.github.trim(),
            website: formData.socialLinks.website.trim(),
          },
        };
        response = await studentService.updateStudentProfile(payload);
      } else if (isInstructor) {
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          bio: formData.bio.trim(),
          phone: formData.phone.trim(),
          location: formData.location.trim(),
          expertise: formData.expertise,
          qualification: formData.qualification.trim(),
          experience: formData.experience.trim(),
          designation: formData.designation.trim(),
          socialLinks: {
            linkedin: formData.socialLinks.linkedin.trim(),
            website: formData.socialLinks.website.trim(),
          },
        };
        response = await instructorService.updateInstructorProfile(payload);
      } else {
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
        };
        response = await adminService.updateAdminProfile(payload);
      }

      const updatedUser = response?.user || {
        ...userData,
        name: formData.name,
        email: formData.email,
      };
      const updatedProfile = response?.profile || profileData;

      setUserData(updatedUser);
      setProfileData(updatedProfile);

      if (setAuthUser) {
        setAuthUser((prev) => ({
          ...prev,
          ...updatedUser,
        }));
      }

      setIsEditing(false);
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (userData && profileData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        bio: profileData.bio || '',
        phone: profileData.phone || '',
        location: profileData.location || '',
        dateOfBirth: formatDateForInput(profileData.dateOfBirth),
        education: profileData.education || '',
        interests: Array.isArray(profileData.interests) ? [...profileData.interests] : [],
        skills: Array.isArray(profileData.skills) ? [...profileData.skills] : [],
        learningGoals: Array.isArray(profileData.learningGoals)
          ? [...profileData.learningGoals]
          : [],
        expertise: Array.isArray(profileData.expertise) ? [...profileData.expertise] : [],
        qualification: profileData.qualification || '',
        experience: profileData.experience || '',
        designation: profileData.designation || '',
        socialLinks: {
          linkedin: profileData.socialLinks?.linkedin || '',
          github: profileData.socialLinks?.github || '',
          website: profileData.socialLinks?.website || '',
        },
      });
    }
    setIsEditing(false);
    setError('');
  };

  const getInitials = (name) => {
    return name
      ? name
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : 'U';
  };

  const profileImage = userData?.profileImage || authUser?.profileImage || '';
  const socialLinks = profileData?.socialLinks || {};
  const hasLinkedIn = Boolean(socialLinks.linkedin && socialLinks.linkedin.trim());
  const hasGithub = isStudent && Boolean(socialLinks.github && socialLinks.github.trim());
  const hasWebsite = Boolean(socialLinks.website && socialLinks.website.trim());

  const skillsList = Array.isArray(profileData?.skills) ? profileData.skills : [];
  const interestsList = Array.isArray(profileData?.interests) ? profileData.interests : [];
  const learningGoalsList = Array.isArray(profileData?.learningGoals)
    ? profileData.learningGoals
    : [];
  const expertiseList = Array.isArray(profileData?.expertise) ? profileData.expertise : [];

  return (
    <DashboardLayout sidebarItems={sidebarItems} roleTitle={roleTitle}>
      <div className="space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="lms-badge">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--lms-accent)]"></span>
                {role} Profile
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--lms-text-primary)]">
              Account & Profile Settings
            </h1>
            <p className="text-xs text-[var(--lms-text-secondary)]">
              Manage your personal credentials, biography, and professional credentials.
            </p>
          </div>

          {!loading && (
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="lms-btn-secondary flex items-center gap-1.5 text-xs py-2 px-3.5"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="profile-edit-form"
                    disabled={saving || uploadingImage}
                    className="lms-btn-primary flex items-center gap-1.5 text-xs py-2 px-4 shadow-md"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="lms-btn-primary flex items-center gap-2 text-xs py-2 px-4 shadow-md"
                >
                  <Pencil size={14} />
                  Edit Profile
                </button>
              )}
            </div>
          )}
        </div>

        
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs sm:text-sm flex items-center justify-between gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="p-1 hover:opacity-80">
              <X size={14} />
            </button>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs sm:text-sm flex items-center justify-between gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess('')} className="p-1 hover:opacity-80">
              <X size={14} />
            </button>
          </div>
        )}

        {loading ? (
          <ProfileSkeleton />
        ) : !isEditing ? (
          


          <div className="space-y-6">
            
            <div className="lms-glass-hero p-6 sm:p-8 text-white relative">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 z-10 relative">
                
                <div className="relative group shrink-0 self-start sm:self-center">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/20 border-2 border-white/30 backdrop-blur-xl flex items-center justify-center text-3xl font-black text-white shadow-xl overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt={userData?.name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(userData?.name)
                    )}
                  </div>

                  <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[var(--lms-accent)] hover:bg-[var(--lms-accent-hover)] text-white flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-110 active:scale-95 border-2 border-white"
                    title="Upload profile image"
                  >
                    {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>

                
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight truncate">
                      {userData?.name || 'Your Name'}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                      {role === 'Admin' ? <Shield size={12} /> : role === 'Instructor' ? <Award size={12} /> : <GraduationCap size={12} />}
                      {role}
                    </span>
                  </div>

                  <p className="flex items-center gap-1.5 text-xs sm:text-sm text-white/80 font-medium">
                    <Mail size={14} />
                    {userData?.email}
                  </p>

                  {isInstructor && profileData?.designation && (
                    <p className="flex items-center gap-1.5 text-xs text-amber-200 font-semibold">
                      <Briefcase size={13} />
                      {profileData.designation}
                    </p>
                  )}

                  {isStudent && profileData?.education && (
                    <p className="flex items-center gap-1.5 text-xs text-blue-200 font-semibold">
                      <GraduationCap size={13} />
                      {profileData.education}
                    </p>
                  )}

                  {profileData?.location && (
                    <p className="flex items-center gap-1.5 text-xs text-white/70">
                      <MapPin size={13} />
                      {profileData.location}
                    </p>
                  )}
                </div>
              </div>

              
              {profileData?.bio && (
                <div className="mt-6 pt-5 border-t border-white/15 z-10 relative">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">About</p>
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed whitespace-pre-line">
                    {profileData.bio}
                  </p>
                </div>
              )}
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="lms-glass-card p-6 space-y-4 md:col-span-1">
                <h3 className="text-sm font-bold text-[var(--lms-text-primary)] flex items-center gap-2">
                  <User size={16} className="text-[var(--lms-accent)]" />
                  Contact Details
                </h3>

                <div className="space-y-3">
                  <InfoItem icon={Mail} label="Email Address" value={userData?.email} />
                  <InfoItem icon={Phone} label="Phone Number" value={profileData?.phone} />
                  <InfoItem icon={MapPin} label="Location" value={profileData?.location} />
                  {isStudent && profileData?.dateOfBirth && (
                    <InfoItem
                      icon={Calendar}
                      label="Date of Birth"
                      value={formatDisplayDate(profileData?.dateOfBirth)}
                    />
                  )}
                </div>

                
                {(hasLinkedIn || hasGithub || hasWebsite) && (
                  <div className="pt-4 border-t border-[var(--lms-border)] space-y-2.5">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">
                      Social & Online Profiles
                    </h4>
                    <div className="space-y-2">
                      {hasLinkedIn && (
                        <InfoItem
                          icon={Linkedin}
                          label="LinkedIn"
                          value={socialLinks.linkedin}
                          isLink
                          href={socialLinks.linkedin}
                        />
                      )}
                      {hasGithub && (
                        <InfoItem
                          icon={Github}
                          label="GitHub"
                          value={socialLinks.github}
                          isLink
                          href={socialLinks.github}
                        />
                      )}
                      {hasWebsite && (
                        <InfoItem
                          icon={Globe}
                          label="Portfolio / Website"
                          value={socialLinks.website}
                          isLink
                          href={socialLinks.website}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              
              <div className="lms-glass-card p-6 space-y-5 md:col-span-2">
                <h3 className="text-sm font-bold text-[var(--lms-text-primary)] flex items-center gap-2">
                  <Award size={16} className="text-[var(--lms-accent)]" />
                  {isInstructor ? 'Professional Background & Expertise' : 'Learning Goals & Skills'}
                </h3>

                
                {isInstructor && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profileData?.qualification && (
                      <InfoItem icon={GraduationCap} label="Qualification" value={profileData.qualification} />
                    )}
                    {profileData?.experience && (
                      <InfoItem icon={Briefcase} label="Years of Experience" value={profileData.experience} />
                    )}
                  </div>
                )}

                
                {isStudent && profileData?.education && (
                  <InfoItem icon={GraduationCap} label="Highest Education" value={profileData.education} />
                )}

                
                {isInstructor && (
                  <div className="space-y-2 pt-2 border-t border-[var(--lms-border)]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">
                      Areas of Expertise
                    </p>
                    {expertiseList.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {expertiseList.map((item, idx) => (
                          <TagChip key={idx} text={item} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--lms-text-secondary)] italic">No expertise areas listed yet.</p>
                    )}
                  </div>
                )}

                
                {isStudent && (
                  <>
                    <div className="space-y-2 pt-2 border-t border-[var(--lms-border)]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">
                        Current Skills
                      </p>
                      {skillsList.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {skillsList.map((item, idx) => (
                            <TagChip key={idx} text={item} />
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--lms-text-secondary)] italic">No skills listed yet.</p>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[var(--lms-border)]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">
                        Learning Goals
                      </p>
                      {learningGoalsList.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {learningGoalsList.map((item, idx) => (
                            <TagChip key={idx} text={item} />
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--lms-text-secondary)] italic">No learning goals listed yet.</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          


          <form id="profile-edit-form" onSubmit={handleSaveProfile} className="space-y-6">
            <div className="lms-glass-card p-6 sm:p-8 space-y-6">
              <h3 className="text-base font-bold text-[var(--lms-text-primary)] border-b border-[var(--lms-border)] pb-3">
                Basic Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full lms-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full lms-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)] mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full lms-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)] mb-1.5">
                    Location / City
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="New York, USA"
                    className="w-full lms-input"
                  />
                </div>
              </div>

              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)] mb-1.5">
                  Bio / About You
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Share a brief overview of your background, experience, and interests..."
                  className="w-full lms-input resize-y"
                />
              </div>

              
              {isInstructor && (
                <div className="pt-4 border-t border-[var(--lms-border)] space-y-4">
                  <h4 className="text-sm font-bold text-[var(--lms-text-primary)]">
                    Instructor Credentials & Designation
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)] mb-1.5">
                        Designation
                      </label>
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleInputChange}
                        placeholder="e.g. Senior Cloud Architect"
                        className="w-full lms-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)] mb-1.5">
                        Qualification
                      </label>
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        placeholder="e.g. M.S. in Computer Science"
                        className="w-full lms-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)] mb-1.5">
                        Years Experience
                      </label>
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        placeholder="e.g. 8+ years"
                        className="w-full lms-input"
                      />
                    </div>
                  </div>

                  <TagInput
                    label="Areas of Expertise"
                    tags={formData.expertise}
                    onChange={(tags) => setFormData((prev) => ({ ...prev, expertise: tags }))}
                    placeholder="e.g. React, Node.js, Cloud Architecture"
                    helperText="Type an item and press Enter or comma to add."
                  />
                </div>
              )}

              
              {isStudent && (
                <div className="pt-4 border-t border-[var(--lms-border)] space-y-4">
                  <h4 className="text-sm font-bold text-[var(--lms-text-primary)]">
                    Education & Learning Preferences
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)] mb-1.5">
                        Highest Education
                      </label>
                      <input
                        type="text"
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        placeholder="e.g. B.Tech Computer Science"
                        className="w-full lms-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)] mb-1.5">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full lms-input"
                      />
                    </div>
                  </div>

                  <TagInput
                    label="Current Skills"
                    tags={formData.skills}
                    onChange={(tags) => setFormData((prev) => ({ ...prev, skills: tags }))}
                    placeholder="e.g. JavaScript, Python, UI Design"
                  />

                  <TagInput
                    label="Learning Goals"
                    tags={formData.learningGoals}
                    onChange={(tags) => setFormData((prev) => ({ ...prev, learningGoals: tags }))}
                    placeholder="e.g. Master Full Stack Development, Pass AWS Certification"
                  />
                </div>
              )}

              
              <div className="pt-4 border-t border-[var(--lms-border)] space-y-4">
                <h4 className="text-sm font-bold text-[var(--lms-text-primary)]">
                  Social & Portfolio Links
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)] mb-1.5">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.socialLinks.linkedin}
                      onChange={handleSocialLinkChange}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full lms-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)] mb-1.5">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      name="github"
                      value={formData.socialLinks.github}
                      onChange={handleSocialLinkChange}
                      placeholder="https://github.com/..."
                      className="w-full lms-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)] mb-1.5">
                      Portfolio / Website URL
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.socialLinks.website}
                      onChange={handleSocialLinkChange}
                      placeholder="https://yourdomain.com"
                      className="w-full lms-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfileSettings;
