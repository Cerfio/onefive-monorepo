'use client';

import { MessageCircle, Sparkles } from 'lucide-react';
import { getCookie } from 'cookies-next';
import { Card } from '@/components/base/card/card';
import { Button } from '@/components/base/buttons/button';
import { AuthGate } from '@/components/seo/AuthGate';

export function PostPrivateSection({
  postId: _postId,
}: {
  postId: string;
}) {
  const isAuth = !!getCookie('is_authenticated');

  const handleRequestAuth = () => {
    window.location.href = '/signup';
  };

  return (
    <>
      <div className="mt-6">
        <Card className="overflow-hidden p-0 bg-card rounded-xl border shadow-sm">
          <div className="border-b border-gray-100 px-6 pt-6 pb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-violet-600" />
              <h2 className="text-lg font-semibold text-[#101828]">Commentaires</h2>
            </div>
          </div>
          <div className="p-6">
            <AuthGate
              onRequestAuth={handleRequestAuth}
              label="Connectez-vous pour voir les commentaires"
            >
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex gap-4 rounded-lg border border-gray-100 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500">
                      <span className="text-sm font-bold text-white">?</span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded bg-gray-200" />
                      <div className="h-2 w-full rounded bg-gray-100" />
                      <div className="h-2 w-2/3 rounded bg-gray-50" />
                    </div>
                  </div>
                ))}
              </div>
            </AuthGate>
          </div>
        </Card>
      </div>

      {!isAuth && (
        <div className="mt-10 flex flex-col items-center gap-6 rounded-2xl border border-violet-100 bg-gradient-to-b from-violet-50 to-white p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#101828]">
            Rejoignez la conversation
          </h2>
          <p className="max-w-md text-[#475467]">
            Connectez-vous pour réagir, commenter et participer aux échanges
            de la communauté Onefive.
          </p>
          <div className="flex gap-3">
            <Button
              className="bg-violet-600 px-8 hover:bg-violet-700"
              size="lg"
              onClick={handleRequestAuth}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Créer mon compte
            </Button>
            <Button color="secondary" size="lg" onClick={handleRequestAuth}>
              Se connecter
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            Gratuit — Rejoignez 5 000+ founders
          </p>
        </div>
      )}

    </>
  );
}
