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
  Compass,
  ExternalLink,
  Github,
  Globe,
  GraduationCap,
  Heart,
  LayoutDashboard,
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
  UserCheck,
  Users,
  DollarSign,
  BarChart2,
  PlayCircle,
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

const normalizeUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const TagInput = ({
  label,
  tags = [],
  onChange,
  placeholder = 'Add an item...',
  icon: Icon,
  helperText,
  badgeColor = 'blue',
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

  const colorStyles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
  };

  const selectedStyle = colorStyles[badgeColor] || colorStyles.blue;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {Icon && <Icon size={14} className="text-slate-500 dark:text-coffee-400" />}
          {label}
        </label>
        {tags.length > 0 && (
          <span className="text-[11px] font-medium text-slate-600 dark:text-coffee-400">
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
          className="flex-1 rounded-xl border border-slate-300 bg-coffee-50 px-3.5 py-2.5 text-sm text-coffee-900 placeholder-slate-400 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-800"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="flex items-center gap-1 rounded-xl bg-coffee-200 px-3.5 py-2.5 text-xs font-semibold text-coffee-700 transition hover:bg-coffee-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-600 dark:text-coffee-400">{helperText}</p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {tags.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${selectedStyle}`}
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="rounded p-0.5 text-current opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-coffee-50/10"
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

const TagChip = ({ text, color = 'blue' }) => {
  const styles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/60',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60',
  };
  return (
    <span
      className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm transition-transform duration-150 hover:-translate-y-0.5 ${styles[color] || styles.blue}`}
    >
      {text}
    </span>
  );
};

const InfoItem = ({ icon: Icon, label, value, isLink, href }) => {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-coffee-200 bg-coffee-100/50 p-3.5 transition hover:border-slate-200 dark:border-slate-800/80 dark:bg-slate-800/30 dark:hover:border-slate-700/80">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-coffee-50 text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400">
        <Icon size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-coffee-400">
          {label}
        </p>
        {isLink && href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 break-all text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            <span>{value}</span>
            <ExternalLink size={12} className="shrink-0" />
          </a>
        ) : (
          <p className="mt-0.5 break-words text-sm font-semibold text-slate-800 dark:text-slate-200">
            {value}
          </p>
        )}
      </div>
    </div>
  );
};

const ProfileSkeleton = () => (
  <div className="mx-auto max-w-5xl space-y-6 animate-pulse">
    <div className="h-56 rounded-3xl bg-slate-200 dark:bg-slate-800" />
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 md:col-span-1" />
      <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 md:col-span-2" />
    </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
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
        { label: 'Users', path: '#', icon: '👥' },
        { label: 'Courses', path: '#', icon: '📖' },
        { category: 'Financial' },
        { label: 'Mentors', path: '#', icon: '🧑‍🏫' },
        { label: 'Revenue', path: '#', icon: '💰' },
        { category: 'Account' },
        { label: 'Settings', path: '/admin/profile', icon: '⚙️' },
      ]
    : isInstructor
    ? [
        { label: 'Overview', path: '/instructor/dashboard', icon: Home },
        { category: 'Management' },
        { label: 'My Students', path: '#', icon: '👥' },
        { label: 'Courses', path: '#', icon: '📖' },
        { category: 'Engagement' },
        { label: 'Sessions', path: '#', icon: '📅' },
        { label: 'Analytics', path: '#', icon: '📊' },
        { category: 'Account' },
        { label: 'Profile', path: '/instructor/profile', icon: '👤' },
      ]
    : [
        { label: 'Overview', path: '/student/dashboard', icon: Home },
        { category: 'Learning' },
        { label: 'My Courses', path: '#', icon: '📖' },
        { label: 'Learning', path: '#', icon: '🎓' },
        { category: 'Engagement' },
        { label: 'Assignments', path: '#', icon: '📝' },
        { label: 'Calendar', path: '#', icon: '📅' },
        { category: 'Account' },
        { label: 'Profile', path: '/student/profile', icon: '👤' },
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
    fetchProfile();
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

  const initials = userData?.name
    ? userData.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const profileImage = userData?.profileImage || authUser?.profileImage || '';

  const socialLinks = profileData?.socialLinks || {};
  const hasLinkedIn = Boolean(socialLinks.linkedin && socialLinks.linkedin.trim());
  const hasGithub = isStudent && Boolean(socialLinks.github && socialLinks.github.trim());
  const hasWebsite = Boolean(socialLinks.website && socialLinks.website.trim());
  const hasAnySocialLinks = hasLinkedIn || hasGithub || hasWebsite;

  const skillsList = Array.isArray(profileData?.skills) ? profileData.skills : [];
  const interestsList = Array.isArray(profileData?.interests) ? profileData.interests : [];
  const learningGoalsList = Array.isArray(profileData?.learningGoals)
    ? profileData.learningGoals
    : [];
  const expertiseList = Array.isArray(profileData?.expertise) ? profileData.expertise : [];

  const hasSkills = isStudent && skillsList.length > 0;
  const hasInterests = isStudent && interestsList.length > 0;
  const hasGoals = isStudent && learningGoalsList.length > 0;
  const hasExpertise = isInstructor && expertiseList.length > 0;

  const isProfileEmpty =
    !profileData?.bio &&
    !profileData?.phone &&
    !profileData?.location &&
    !hasSkills &&
    !hasInterests &&
    !hasGoals &&
    !hasExpertise &&
    !hasAnySocialLinks &&
    (isStudent ? !profileData?.education && !profileData?.dateOfBirth : true) &&
    (isInstructor
      ? !profileData?.designation && !profileData?.qualification && !profileData?.experience
      : true);

  const inputClass =
    'w-full rounded-xl border border-slate-300 bg-coffee-50 px-3.5 py-2.5 text-sm text-coffee-900 placeholder-slate-400 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-800';

  const labelClass =
    'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300';

  return (
    <DashboardLayout sidebarItems={sidebarItems} roleTitle={roleTitle}>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
                {role} Profile
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Profile & Account Settings
            </h1>
            <p className="text-xs text-slate-500 dark:text-coffee-400">
              Manage your personal information, role-specific attributes, and online presence.
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
                    className="inline-flex items-center gap-1.5 rounded-xl border border-coffee-200 bg-coffee-50 px-4 py-2 text-xs font-semibold text-coffee-700 shadow-sm transition hover:bg-coffee-100 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <X size={15} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="profile-edit-form"
                    disabled={saving || uploadingImage}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
                >
                  <Pencil size={15} />
                  Edit Profile
                </button>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle size={18} className="shrink-0 text-red-600 dark:text-red-400" />
            <p className="flex-1">{error}</p>
            <button
              onClick={() => setError('')}
              className="rounded p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="flex-1">{success}</p>
            <button
              onClick={() => setSuccess('')}
              className="rounded p-1 text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {loading ? (
          <ProfileSkeleton />
        ) : !isEditing ? (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-coffee-200/80 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 p-6 text-white shadow-xl shadow-slate-900/10 dark:border-slate-800 sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-indigo-600/15 blur-3xl" />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="relative group shrink-0 self-start sm:self-center">
                  <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/20 bg-slate-800 text-3xl font-bold shadow-lg">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={userData?.name || 'User'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-white">{initials}</span>
                    )}
                  </div>

                  <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed"
                    title="Upload profile image"
                  >
                    {uploadingImage ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Camera size={15} />
                    )}
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

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl truncate">
                      {userData?.name || 'Your Name'}
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 border border-blue-400/30 px-2.5 py-0.5 text-xs font-semibold text-blue-300">
                      {role === 'Admin' ? (
                        <Shield size={12} />
                      ) : role === 'Instructor' ? (
                        <Award size={12} />
                      ) : (
                        <GraduationCap size={12} />
                      )}
                      {role}
                    </span>
                  </div>

                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-300 truncate">
                    <Mail size={14} className="shrink-0 text-coffee-400" />
                    {userData?.email}
                  </p>

                  {isInstructor && profileData?.designation && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                      <Briefcase size={13} className="shrink-0" />
                      {profileData.designation}
                    </p>
                  )}

                  {isStudent && profileData?.education && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-blue-300">
                      <GraduationCap size={13} className="shrink-0" />
                      {profileData.education}
                    </p>
                  )}

                  {profileData?.location && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-coffee-400">
                      <MapPin size={13} className="shrink-0" />
                      {profileData.location}
                    </p>
                  )}
                </div>
              </div>

              {profileData?.bio && (
                <div className="relative mt-6 border-t border-white/10 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-coffee-400">
                    About
                  </p>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-200">
                    {profileData.bio}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-5">
                <div className="rounded-2xl border border-coffee-200/80 bg-coffee-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-5 flex items-center gap-2.5 border-b border-coffee-200 pb-4 dark:border-slate-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                      <User size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {isInstructor ? 'Professional Information' : 'Personal Details'}
                      </h3>
                      <p className="text-[11px] text-coffee-400">
                        {isInstructor ? 'Instructor qualifications & contact' : 'Contact & identity'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <InfoItem icon={Mail} label="Email Address" value={userData?.email} />
                    <InfoItem icon={Phone} label="Phone Number" value={profileData?.phone} />
                    <InfoItem icon={MapPin} label="Location" value={profileData?.location} />

                    {isStudent && (
                      <>
                        <InfoItem
                          icon={GraduationCap}
                          label="Education"
                          value={profileData?.education}
                        />
                        <InfoItem
                          icon={Calendar}
                          label="Date of Birth"
                          value={formatDisplayDate(profileData?.dateOfBirth)}
                        />
                      </>
                    )}

                    {isInstructor && (
                      <>
                        <InfoItem
                          icon={Briefcase}
                          label="Designation"
                          value={profileData?.designation}
                        />
                        <InfoItem
                          icon={GraduationCap}
                          label="Qualification"
                          value={profileData?.qualification}
                        />
                        <InfoItem
                          icon={Clock}
                          label="Experience"
                          value={profileData?.experience}
                        />
                      </>
                    )}

                    {isAdmin && (
                      <>
                        <InfoItem
                          icon={Shield}
                          label="Account Status"
                          value={userData?.accountStatus || 'Active'}
                        />
                        <InfoItem
                          icon={Clock}
                          label="Member Since"
                          value={formatDisplayDate(userData?.createdAt)}
                        />
                      </>
                    )}
                  </div>
                </div>

                {hasAnySocialLinks && (
                  <div className="rounded-2xl border border-coffee-200/80 bg-coffee-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-center gap-2.5 border-b border-coffee-200 pb-3 dark:border-slate-800">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                        <Globe size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          Social & Web Links
                        </h3>
                        <p className="text-[11px] text-coffee-400">Online presence and profiles</p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {hasLinkedIn && (
                        <a
                          href={normalizeUrl(socialLinks.linkedin)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-xl border border-coffee-200 bg-coffee-100/70 p-3 text-xs font-semibold text-coffee-700 transition hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-blue-900/50 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Linkedin size={16} className="text-[#0A66C2] shrink-0" />
                            <span className="truncate">LinkedIn</span>
                          </div>
                          <ExternalLink size={13} className="text-coffee-400 shrink-0" />
                        </a>
                      )}

                      {hasGithub && (
                        <a
                          href={normalizeUrl(socialLinks.github)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-xl border border-coffee-200 bg-coffee-100/70 p-3 text-xs font-semibold text-coffee-700 transition hover:border-slate-300 hover:bg-coffee-200 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Github size={16} className="text-slate-900 dark:text-white shrink-0" />
                            <span className="truncate">GitHub</span>
                          </div>
                          <ExternalLink size={13} className="text-coffee-400 shrink-0" />
                        </a>
                      )}

                      {hasWebsite && (
                        <a
                          href={normalizeUrl(socialLinks.website)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-xl border border-coffee-200 bg-coffee-100/70 p-3 text-xs font-semibold text-coffee-700 transition hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-emerald-900/50 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Globe size={16} className="text-emerald-600 shrink-0" />
                            <span className="truncate">Personal Website</span>
                          </div>
                          <ExternalLink size={13} className="text-coffee-400 shrink-0" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6 lg:col-span-7">
                {hasExpertise && (
                  <div className="rounded-2xl border border-coffee-200/80 bg-coffee-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-center justify-between border-b border-coffee-200 pb-3 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                          <Award size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Areas of Expertise
                          </h3>
                          <p className="text-[11px] text-coffee-400">
                            Teaching subjects & specializations
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {expertiseList.length}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {expertiseList.map((item, idx) => (
                        <TagChip key={`${item}-${idx}`} text={item} color="amber" />
                      ))}
                    </div>
                  </div>
                )}

                {hasSkills && (
                  <div className="rounded-2xl border border-coffee-200/80 bg-coffee-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-center justify-between border-b border-coffee-200 pb-3 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                          <Sparkles size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Skills & Capabilities
                          </h3>
                          <p className="text-[11px] text-coffee-400">Technical & practical skills</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {skillsList.length}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {skillsList.map((skill, idx) => (
                        <TagChip key={`${skill}-${idx}`} text={skill} color="blue" />
                      ))}
                    </div>
                  </div>
                )}

                {hasInterests && (
                  <div className="rounded-2xl border border-coffee-200/80 bg-coffee-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-center justify-between border-b border-coffee-200 pb-3 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                          <Heart size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Interests & Passions
                          </h3>
                          <p className="text-[11px] text-coffee-400">Topics of curiosity and focus</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                        {interestsList.length}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {interestsList.map((interest, idx) => (
                        <TagChip key={`${interest}-${idx}`} text={interest} color="purple" />
                      ))}
                    </div>
                  </div>
                )}

                {hasGoals && (
                  <div className="rounded-2xl border border-coffee-200/80 bg-coffee-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-center justify-between border-b border-coffee-200 pb-3 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                          <Target size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Learning Goals
                          </h3>
                          <p className="text-[11px] text-coffee-400">Target milestones & objectives</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {learningGoalsList.length}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {learningGoalsList.map((goal, idx) => (
                        <div
                          key={`${goal}-${idx}`}
                          className="flex items-start gap-3 rounded-xl border border-emerald-100/70 bg-emerald-50/40 p-3 text-xs font-semibold text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
                        >
                          <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white dark:bg-emerald-600">
                            <Check size={10} />
                          </div>
                          <span>{goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isProfileEmpty && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-coffee-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                      <Compass size={24} />
                    </div>
                    <h4 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                      Profile details not filled yet
                    </h4>
                    <p className="mx-auto mt-1 max-w-md text-xs text-slate-500 dark:text-coffee-400">
                      {isStudent
                        ? 'Complete your profile by adding your bio, education, skills, interests, and learning goals.'
                        : isInstructor
                        ? 'Complete your instructor profile with your designation, qualifications, experience, and areas of expertise.'
                        : 'Your administrator profile is active.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      <Pencil size={13} />
                      Complete Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <form id="profile-edit-form" onSubmit={handleSaveProfile} className="space-y-6">
            <div className="rounded-2xl border border-coffee-200/80 bg-coffee-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <div className="mb-6 flex items-center gap-3 border-b border-coffee-200 pb-4 dark:border-slate-800">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  <User size={19} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Basic Information
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-coffee-400">
                    Your account display name and registered email.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. john@example.com"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {!isAdmin && (
              <div className="rounded-2xl border border-coffee-200/80 bg-coffee-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="mb-6 flex items-center gap-3 border-b border-coffee-200 pb-4 dark:border-slate-800">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                    {isInstructor ? <Briefcase size={19} /> : <GraduationCap size={19} />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {isInstructor ? 'Instructor Details' : 'Student Profile'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-coffee-400">
                      Fields specific to your role on the platform.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Bio / Introduction</label>
                    <textarea
                      name="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Write a brief overview about yourself..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, Country"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {isStudent && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Date of Birth</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Education</label>
                        <input
                          type="text"
                          name="education"
                          value={formData.education}
                          onChange={handleInputChange}
                          placeholder="e.g. B.S. in Computer Science"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  )}

                  {isInstructor && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                      <div>
                        <label className={labelClass}>Designation</label>
                        <input
                          type="text"
                          name="designation"
                          value={formData.designation}
                          onChange={handleInputChange}
                          placeholder="e.g. Senior Software Engineer"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Qualification</label>
                        <input
                          type="text"
                          name="qualification"
                          value={formData.qualification}
                          onChange={handleInputChange}
                          placeholder="e.g. M.S. Software Engineering"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Experience</label>
                        <input
                          type="text"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          placeholder="e.g. 7+ years in Web Development"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isAdmin && (
              <div className="rounded-2xl border border-coffee-200/80 bg-coffee-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="mb-6 flex items-center gap-3 border-b border-coffee-200 pb-4 dark:border-slate-800">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                    <Sparkles size={19} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {isInstructor ? 'Expertise' : 'Skills & Learning Focus'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-coffee-400">
                      Type an item and press Enter or click Add to save tag.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {isInstructor && (
                    <TagInput
                      label="Areas of Expertise"
                      tags={formData.expertise}
                      onChange={(newTags) =>
                        setFormData((prev) => ({ ...prev, expertise: newTags }))
                      }
                      placeholder="e.g. React, Node.js, Cloud Architecture..."
                      icon={Award}
                      badgeColor="amber"
                      helperText="Specify the technical subjects, languages, or tools you teach."
                    />
                  )}

                  {isStudent && (
                    <>
                      <TagInput
                        label="Skills"
                        tags={formData.skills}
                        onChange={(newTags) =>
                          setFormData((prev) => ({ ...prev, skills: newTags }))
                        }
                        placeholder="e.g. JavaScript, Python, CSS..."
                        icon={Sparkles}
                        badgeColor="blue"
                        helperText="Add technical and practical skills you are proficient in."
                      />

                      <TagInput
                        label="Interests"
                        tags={formData.interests}
                        onChange={(newTags) =>
                          setFormData((prev) => ({ ...prev, interests: newTags }))
                        }
                        placeholder="e.g. Machine Learning, Mobile Development, UI Design..."
                        icon={Heart}
                        badgeColor="purple"
                        helperText="Topics and fields you enjoy learning about."
                      />

                      <TagInput
                        label="Learning Goals"
                        tags={formData.learningGoals}
                        onChange={(newTags) =>
                          setFormData((prev) => ({ ...prev, learningGoals: newTags }))
                        }
                        placeholder="e.g. Master Backend Development, Build a Fullstack App..."
                        icon={Target}
                        badgeColor="emerald"
                        helperText="Milestones you aim to achieve in your learning journey."
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            {!isAdmin && (
              <div className="rounded-2xl border border-coffee-200/80 bg-coffee-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="mb-6 flex items-center gap-3 border-b border-coffee-200 pb-4 dark:border-slate-800">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                    <Globe size={19} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Social & Portfolio Links
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-coffee-400">
                      Add links to your professional profiles and website.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>LinkedIn URL</label>
                    <div className="relative">
                      <Linkedin
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-coffee-400"
                      />
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.socialLinks.linkedin}
                        onChange={handleSocialLinkChange}
                        placeholder="https://linkedin.com/in/username"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  {isStudent && (
                    <div>
                      <label className={labelClass}>GitHub URL</label>
                      <div className="relative">
                        <Github
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-coffee-400"
                        />
                        <input
                          type="url"
                          name="github"
                          value={formData.socialLinks.github}
                          onChange={handleSocialLinkChange}
                          placeholder="https://github.com/username"
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </div>
                  )}

                  <div className={isStudent ? 'sm:col-span-2' : ''}>
                    <label className={labelClass}>Personal Website / Portfolio</label>
                    <div className="relative">
                      <Globe
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-coffee-400"
                      />
                      <input
                        type="url"
                        name="website"
                        value={formData.socialLinks.website}
                        onChange={handleSocialLinkChange}
                        placeholder="https://example.com"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="rounded-xl border border-slate-300 bg-coffee-50 px-5 py-2.5 text-xs font-semibold text-coffee-700 shadow-sm transition hover:bg-coffee-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfileSettings;
