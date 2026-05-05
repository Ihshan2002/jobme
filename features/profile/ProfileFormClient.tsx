'use client';

import { useState } from 'react';
import { updateProfile } from './actions';
import { toast } from 'sonner';
import { FileUp, Save, CheckCircle2, User, Phone, BookOpen, Briefcase, FileText } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export function ProfileFormClient({ initialProfile }: { initialProfile: any }) {
  const [formData, setFormData] = useState({
    full_name: initialProfile?.full_name || '',
    phone: initialProfile?.phone || '',
    bio: initialProfile?.bio || '',
    skills: initialProfile?.skills ? initialProfile.skills.join(', ') : '',
    experience: initialProfile?.experience || '',
    education: initialProfile?.education || '',
    resume_url: initialProfile?.resume_url || ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${initialProfile.id}-${Math.random()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, resume_url: publicUrl }));
      
      // Auto save after upload
      await updateProfile({ resume_url: publicUrl });
      toast.success('Resume uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error uploading file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const skillsArray = formData.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
      
      const payload = {
        ...formData,
        skills: skillsArray,
      };

      const res = await updateProfile(payload);
      if (res.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(res.error || "Failed to update profile.");
      }
    } catch (e: any) {
      toast.error(e.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
               <User size={12} /> Full Name
            </label>
            <input 
              type="text" 
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="w-full h-10 px-3 text-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded focus:ring-1 focus:ring-blue-500 outline-none font-medium"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
               <Phone size={12} /> Phone Number
            </label>
            <input 
              type="text" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full h-10 px-3 text-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded focus:ring-1 focus:ring-blue-500 outline-none font-medium"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
             <FileText size={12} /> Professional Bio
          </label>
          <textarea 
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            className="w-full h-24 p-3 text-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded focus:ring-1 focus:ring-blue-500 outline-none font-medium resize-none"
            placeholder="A short summary of your professional background and goals..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
             <Briefcase size={12} /> Skills (Comma separated)
          </label>
          <input 
            type="text" 
            value={formData.skills}
            onChange={(e) => setFormData({...formData, skills: e.target.value})}
            className="w-full h-10 px-3 text-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded focus:ring-1 focus:ring-blue-500 outline-none font-medium"
            placeholder="React, TypeScript, Node.js"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
               <Briefcase size={12} /> Work Experience
            </label>
            <textarea 
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
              className="w-full h-24 p-3 text-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded focus:ring-1 focus:ring-blue-500 outline-none font-medium resize-none"
              placeholder="Describe your past roles and achievements..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
               <BookOpen size={12} /> Education
            </label>
            <textarea 
              value={formData.education}
              onChange={(e) => setFormData({...formData, education: e.target.value})}
              className="w-full h-24 p-3 text-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded focus:ring-1 focus:ring-blue-500 outline-none font-medium resize-none"
              placeholder="Degrees, certifications, and universities..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
             <FileUp size={12} /> Resume / CV (PDF Only)
          </label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded text-xs font-bold uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
              <FileUp size={14} />
              {isUploading ? 'Uploading...' : 'Choose File'}
              <input 
                type="file" 
                accept=".pdf" 
                className="hidden" 
                onChange={handleUpload}
                disabled={isUploading}
              />
            </label>
            {formData.resume_url && (
              <a 
                href={formData.resume_url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest"
              >
                <CheckCircle2 size={14} /> Resume Uploaded
              </a>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Save size={14} />
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
