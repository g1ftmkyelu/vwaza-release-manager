import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthPayload } from '@shared/types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password_hash: z.string().min(8, 'Password must be at least 8 characters.'),
});

const Login: React.FC = () => {
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
 
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/artist/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<AuthPayload>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: AuthPayload) => {
    try {
      const loggedInUser = await login(data);

    } catch (error) {
 
    }
  };

  return (
    <Card className="p-8 space-y-6">
      <h2 className="text-3xl font-bold text-center text-lime-light glow-text-lime">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
          {isLoading ? <LoadingSpinner size="sm" /> : 'Login'}
        </Button>
      </form>
      <p className="text-center text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-lime-accent hover:underline">
          Register here
        </Link>
      </p>
    </Card>
  );
};

export default Login;