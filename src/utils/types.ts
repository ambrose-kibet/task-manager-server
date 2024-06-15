import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: Role;
}

export type TokenPayload = {
  userId: string;
};

export interface VerificationTokenPayload {
  email: string;
}

export interface PasswordResetTokenPayload {
  email: string;
  token: string;
}

export type TaskSummary = {
  id: number;
  title: string;
};

export type TasksByDate = {
  date: Date;
  tasks: TaskSummary[];
};

export type TaskPerDay = {
  id: number;
  title: string;
  isCompleted: Date | null;
  createdAt: Date;
};
