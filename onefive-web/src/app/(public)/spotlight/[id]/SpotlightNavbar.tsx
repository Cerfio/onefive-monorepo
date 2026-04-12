'use client';

import { getCookie } from 'cookies-next';
import Navbar from '@/components/navbar';
import Image from 'next/image';
import Link from 'next/link';
import OnefiveLogo from '@/assets/images/onefiveLogo.png';

export function SpotlightNavbar() {
  const isAuth = !!getCookie('is_authenticated');

  if (isAuth) {
    return <Navbar />;
  }

  return (
    <nav className="flex items-center justify-between px-4 py-3 sm:px-6">
      <Link href="/" className="flex items-center gap-2">
        <Image width={32} height={36} src={OnefiveLogo} alt="Onefive" />
        <span className="text-lg font-semibold text-[#101828]">Onefive</span>
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href="/signin"
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-gray-50"
        >
          Se connecter
        </Link>
        <Link
          href="/signup"
          className="rounded-lg bg-[#5E6AD2] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4F5ABF]"
        >
          S&apos;inscrire
        </Link>
      </div>
    </nav>
  );
}
