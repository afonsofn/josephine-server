import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  CREDENTIALS_TAKEN,
  JWT_EXPIRE_TIME,
  DATABASE_REQUEST_FAILED,
} from './constants';

export const handleExceptions = (error: any): void => {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const field = error.meta?.target;
      const message = field
        ? `The '${field}' credential is already taken`
        : CREDENTIALS_TAKEN;

      throw new ForbiddenException(message);
    }

    throw new BadRequestException(DATABASE_REQUEST_FAILED);
  }

  throw error;
};

export const cookieAccessToken = (token: string, res: Response) => {
  const maxAge = extractTimeValue(JWT_EXPIRE_TIME);

  res.cookie('access_token', token, {
    maxAge,
    sameSite: true,
    secure: false,
  });

  return res.status(HttpStatus.OK).json({ message: 'Login successful' });
};

export const validatePassword = (password: string): boolean => {
  /**
   * At least 8 characters;
   * At least one uppercase and one lowercase letter;
   * At least one number;
   * At least one special character.
   */
  const isPasswordValid =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  return isPasswordValid.test(password);
};

export const validateEmail = (email: string): boolean => {
  /**
   * It must follow the standard email format;
   * It must allow letters, numbers, periods, hyphens and underscores;
   * The domain must contain at least one period and cannot begin or end with a period.
   */
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return isEmailValid.test(email);
};

const extractTimeValue = (str: string): number | null => {
  const timeUnits = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const match = str.match(/(\d+)([smhd])/);

  if (!match) return null;

  const [_, value, unit] = match;

  return timeUnits[unit] * parseInt(value);
};
