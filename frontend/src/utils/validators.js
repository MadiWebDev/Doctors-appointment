import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const patientRegisterSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain uppercase, lowercase, number, and special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const doctorStep1Schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain uppercase, lowercase, number, and special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const doctorStep2Schema = z.object({
  licenseNumber: z.string().min(1, 'License number is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  experience: z.number().min(0, 'Experience must be a positive number'),
  hospitalAffiliation: z.string().min(1, 'Hospital affiliation is required'),
  consultationFee: z.number().min(0, 'Consultation fee must be a positive number'),
  bio: z.string().min(20, 'Bio must be at least 20 characters'),
  qualifications: z.string().min(1, 'Qualifications are required'),
});

// In your validators.js file
export const doctorStep3Schema = z.object({
  licenseDocument: z
    .any()
    .refine((files) => files && files.length > 0, {
      message: 'Please upload your license document',
    })
    .refine((files) => {
      if (!files || files.length === 0) return true;
      const file = files[0];
      return file.size <= 5 * 1024 * 1024;
    }, {
      message: 'File size must be less than 5MB',
    })
    .refine((files) => {
      if (!files || files.length === 0) return true;
      const file = files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      return validTypes.includes(file.type);
    }, {
      message: 'Please upload a PDF, JPG, or PNG file',
    }),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z
  .object({
    otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
    email: z.string().email('Invalid email address'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain uppercase, lowercase, number, and special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const bookAppointmentSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

export const medicalNotesSchema = z.object({
  medicalNotes: z.string().min(1, 'Medical notes are required'),
  prescription: z.string().optional(),
});

export const cancelSchema = z.object({
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
});
