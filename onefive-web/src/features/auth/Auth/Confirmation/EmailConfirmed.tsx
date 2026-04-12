'use client';
import { Button } from '@/components/base/buttons/button';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import LetterCercle from '@/icons/LetterCercle.svg';
import { useRouter } from 'next/navigation';

const Header = () => {
  return (
    <>
      <Image src={LetterCercle} alt={''} width={56} height={56} />
      <div className="text-gray-900 text-3xl font-semibold mt-6">Email confirmed</div>
    </>
  );
};

const Body = () => {
  const router = useRouter();
  return (
    <>
      <div className="text-center text-base font-normal mt-3">
        Your email has been confirmed. You can now use your account.
      </div>
      <Button
        className="h-11 w-[380px] mt-8 text-base font-semibold"
        color="secondary"
        onClick={() => {
          router.push('/feed');
        }}
      >
        Continue
      </Button>
    </>
  );
};

const Footer = ({ displayClickToResend }: { displayClickToResend?: boolean }) => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-3">
      {displayClickToResend && (
        <div className="text-sm font-normal text-gray-600 hover:underline cursor-pointer mt-8">
          <span className="text-primary-700 text-sm font-semibold">Click to resend</span>
        </div>
      )}
      <div
        className="flex items-center gap-2 text-gray-600 text-sm font-semibold hover:underline cursor-pointer"
        onClick={() => {
          router.push('/signin');
        }}
      >
        <ArrowLeft width={20} height={20} />
        Back to log in
      </div>
    </div>
  );
};

const EmailConfirmed = ({ params: _params }: { params: { token: string } }) => {
  const confirm = 'confirm';

  if (confirm === 'confirm') {
    return (
      <div className="bg-gray-25 h-screen w-screen flex flex-col items-center pt-24">
        <Header />
        <Body />
        <Footer displayClickToResend />
      </div>
    );
  }
};

export default EmailConfirmed;
