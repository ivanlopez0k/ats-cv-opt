import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/index.js';
import { JwtPayload } from '../types/index.js';

const accessOptions: SignOptions = {
  expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
};

const refreshOptions: SignOptions = {
  expiresIn: config.jwt.refreshExpiresIn as SignOptions['expiresIn'],
};

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.secret, accessOptions);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, refreshOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
};

export const verifyToken = (token: string): JwtPayload => {
  // Backwards compatible - tries access token secret first
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
};
