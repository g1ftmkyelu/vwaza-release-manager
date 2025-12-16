import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserCreatePayload } from '@shared/types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.'),
  email: z.string().email('Invalid email address.'),
  password_hash: z.string().min(8, 'Password must be at least 8 characters.'),
  role: z.enum(['ARTIST', 'ADMIN'], { message: 'Role must be ARTIST or ADMIN.' }),
});

const Register: React.FC = () => {
  const { register: authRegister, isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/artist/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<UserCreatePayload>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'ARTIST', 
    },
  });

  const onSubmit = async (data: UserCreatePayload) => {
    try {
      await authRegister(data);
    } catch (error) {
      // error is handled by AuthContext and toast
    }
  };

  return (
    <Card className="p-8 space-y-6">
      <h2 className="text-3xl font-bold text-center text-lime-light glow-text-lime">Register</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Username"
          type="text"
          placeholder="yourname"
          {...register('username')}
          error={errors.username?.message}
          disabled={isLoading}
        />
        <Input
          label="Email"
          type="email"
          placeholder="your@email.com"
          {...register('email')}
          error={errors.email?.message}
          disabled={isLoading}
        />
        <Input
          label="Password"
          type="password"
          placeholder="********"
          {...register('password_hash')}
          error={errors.password_hash?.message}
          disabled={isLoading}
        />
        <div>
          <label htmlFor="role" className="block text-gray-300 text-sm font-bold mb-2">
            Role
          </label>
          <select
            id="role"
            {...register('role')}
            className="glass-input w-full p-2 rounded-md focus:outline-none"
            disabled={isLoading}
          >
            <option value="ARTIST">Artist</option>
            <option value="ADMIN">Admin</option>
          </select>
          {errors.role && <p className="text-red-500 text-xs italic mt-1">{errors.role.message}</p>}
        </div>
        <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
          {isLoading ? <LoadingSpinner size="sm" /> : 'Register'}
        </Button>
      </form>
      <p className="text-center text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-lime-accent hover:underline">
          Login here
        </Link>
      </p>
    </Card>
  );
};

export default Register;