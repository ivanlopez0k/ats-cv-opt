'use client';
import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, ThumbsUp, FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import apiClient from '@/lib/api';
import Link from 'next/link';
import type { CV } from '@/lib/types';

interface UserProfile {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  isPremium: boolean;
  createdAt: string;
  publicCVsCount: number;
}

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function UserProfilePage({ params }: PageProps) {
  const { username } = use(params);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', username],
    queryFn: async () => {
      const r = await apiClient.get(`/users/${username}`);
      return r.data.data as UserProfile;
    },
  });

  const { data: cvsData } = useQuery({
    queryKey: ['user-cvs', username],
    queryFn: async () => {
      const r = await apiClient.get(`/users/${username}/cvs`);
      return r.data.data as CV[];
    },
    enabled: !!profile,
  });

  const cvs = cvsData as CV[] | undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen container mx-auto px-4 py-8">
        <Skeleton className="h-48 w-full mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen container mx-auto px-4 py-8">
        <Card className="bg-card">
          <CardContent className="py-12 text-center">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Usuario no encontrado</h1>
            <p className="text-muted-foreground">El usuario "{username}" no existe</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 py-12">
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-8">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatarUrl || undefined} />
              <AvatarFallback className="text-2xl bg-foreground text-background">
                {profile.name?.[0] || profile.username[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{profile.name || profile.username}</h1>
              <p className="text-muted-foreground">@{profile.username}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {profile.publicCVsCount} CVs públicos
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Desde {new Date(profile.createdAt).toLocaleDateString('es-AR')}
                </span>
              </div>
            </div>
          </div>

          {/* Public CVs */}
          <h2 className="text-xl font-semibold text-foreground mb-4">CVs públicos ({profile.publicCVsCount})</h2>

          {cvs && cvs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cvs.map((cv) => (
                <Card key={cv.id} className="bg-card hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-foreground line-clamp-1">{cv.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {cv.targetJob && <span>{cv.targetJob}</span>}
                      {cv.targetJob && cv.targetIndustry && <span> · </span>}
                      {cv.targetIndustry && <span>{cv.targetIndustry}</span>}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <ThumbsUp className="h-4 w-4" />
                        {cv.upvotes}
                      </span>
                      <Link href={`/community/${cv.id}`}>
                        <Button variant="outline" size="sm">Ver CV</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card">
              <CardContent className="py-8 text-center text-muted-foreground">
                Este usuario no tiene CVs públicos todavía.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}