import { Header } from '@/components/ui/header';
import { BottomNav } from '@/components/ui/bottom-nav';
import { DigestList } from '@/components/digest/digest-list';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-background safe-top safe-bottom">
      <Header />
      <div className="container mx-auto px-4 pb-20 pt-4">
        <DigestList userId={user.id} />
      </div>
      <BottomNav />
    </main>
  );
}
