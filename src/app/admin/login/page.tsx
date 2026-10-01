'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { ApprovalHeroLogo } from '@/components/brand/ApprovalHeroLogo';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setError('');
    try {
      await adminApi.login(data.email, data.password);
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-midnight">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ApprovalHeroLogo height={44} onDark />
          </div>
          <p className="text-ice-blue text-sm">Approval Hero Content Management</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-8">
          <div className="mb-4">
            <label className="block text-ice-blue text-sm mb-1">Email</label>
            <input {...register('email')} type="email" className="input-field bg-white/10 border-white/20 text-white placeholder:text-white/30" placeholder="admin@approvalhero.ca" />
          </div>
          <div className="mb-6">
            <label className="block text-ice-blue text-sm mb-1">Password</label>
            <input {...register('password')} type="password" className="input-field bg-white/10 border-white/20 text-white" />
          </div>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
