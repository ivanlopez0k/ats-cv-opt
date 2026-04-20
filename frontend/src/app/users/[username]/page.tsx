import { User, FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUserProfile, getUserCVs } from '@/lib/server/data';
import { CVActions } from './CVActions';
import Link from 'next/link';

/**
 * User Profile Page - Server Component
 * Renders user data server-side and embeds client islands for interactivity
 */
interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;

  // Fetch data on server
  const profile = await getUserProfile(username);
  const cvs = await getUserCVs(username);

  // Handle not found
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
          {/* Profile Header - Server Rendered */}
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

          {/* Public CVs - Server Rendered */}
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
                    {/* Client Island for interactive actions */}
                    <CVActions cv={cv} />
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

/**
 * Generate static metadata for the page
 */
export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  const profile = await getUserProfile(username);
  
  if (!profile) {
    return { title: 'Usuario no encontrado' };
  }

  return {
    title: `${profile.name || profile.username} (@${profile.username}) | CVMaster`,
    description: `Perfil público de ${profile.name || profile.username} en CVMaster. ${profile.publicCVsCount} CVs publicados.`,
  };
}