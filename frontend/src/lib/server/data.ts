/**
 * Server-side data fetchers for Next.js Server Components
 * These functions run on the server and fetch data from the API
 */

import { notFound } from 'next/navigation';
import type { CV, User } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/**
 * Server-side axios instance - no auth needed for public data
 * For protected routes, use server actions instead
 */
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    // Important for Server Components - cache by default
    cache: 'force-cache',
  });

  if (!response.ok) {
    if (response.status === 404) {
      return notFound() as never;
    }
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.data as T;
}

/**
 * Get user profile by username (public data)
 */
export async function getUserProfile(username: string): Promise<UserProfileResponse | null> {
  try {
    const data = await fetchAPI<UserProfileResponse>(`/users/${username}`);
    return data;
  } catch (error) {
    console.error(`Error fetching user profile for ${username}:`, error);
    return null;
  }
}

/**
 * Get user's public CVs (public data)
 */
export async function getUserCVs(username: string): Promise<CV[]> {
  try {
    const data = await fetchAPI<CV[]>(`/users/${username}/cvs`);
    return data;
  } catch (error) {
    console.error(`Error fetching user CVs for ${username}:`, error);
    return [];
  }
}

/**
 * Get single CV detail (public data)
 */
export async function getCVDetail(id: string): Promise<CV | null> {
  try {
    const data = await fetchAPI<CV>(`/community/cvs/${id}`);
    return data;
  } catch (error) {
    console.error(`Error fetching CV ${id}:`, error);
    return null;
  }
}

// Type definitions for responses
export interface UserProfileResponse {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  isPremium: boolean;
  createdAt: string;
  publicCVsCount: number;
}
