/**
 * Validation schemas for user-related API requests
 */
import { z } from 'zod';

// Schema for user profile data
export const userProfileSchema = z.object({
  userId: z.string().uuid(),
});

// Schema for updating user profile
export const updateUserProfileSchema = z.object({
  userId: z.string().uuid(),
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

// Schema for user registration
export const userRegistrationSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Schema for user login
export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Schema for password reset request
export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

// Schema for password reset
export const passwordResetSchema = z.object({
  token: z.string(),
  password: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Schema for updating user role
export const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['USER', 'AGENT', 'OPERATOR', 'ADMIN']),
});
