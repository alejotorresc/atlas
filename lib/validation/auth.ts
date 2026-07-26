import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Correo invalido'),
  password: z.string().min(1, 'La contrasena es requerida'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z.string().min(1, 'El nombre es requerido'),
    email: z.string().email('Correo invalido'),
    password: z.string().min(8, 'Minimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contrasena'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contrasenas no coinciden',
    path: ['confirmPassword'],
  });
export type SignupInput = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Correo invalido'),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Minimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contrasena'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contrasenas no coinciden',
    path: ['confirmPassword'],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
