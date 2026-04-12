import Image from 'next/image';
import FlagAUIcon from '@/flags/AU.svg';

export const SectionAbout = ({ currentUser: _currentUser }: { currentUser?: boolean }) => {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-72 text-gray-900 font-medium mb-2 md:mb-0">
        About me
      </div>
      <div className="flex flex-col">
        <div className="text-gray-600">
          I'm a Product Designer based in Melbourne, Australia. I specialise in
          UX/UI design, brand strategy, and Webflow development. I'm always
          striving to grow and learn something new and I don't take myself too
          seriously.
          <br />
          <br /> I'm passionate about helping startups grow, improve their
          customer experience, and to raise venture capital through good design.
        </div>
        <div className="text-primary-700 text-sm font-semibold mt-4">
          Read more
        </div>
        <div className="mt-11 grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="flex flex-col gap-2">
            <div className="text-gray-900 font-medium">Location</div>
            <div className="flex gap-2 items-center">
              {/* <
            width={20}
            height={20}
            title="Australia Flag"
          /> */}
              <Image
                src={FlagAUIcon}
                alt={'Australian Flag'}
                width={20}
                height={20}
              />
              <div className="text-gray-600 font-semibold">
                Melbourne, Australia
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-gray-900 font-medium">Website</div>
            <div className="text-primary-700 font-semibold">zahirmays.com</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-gray-900 font-medium">Portfolio</div>
            <div className="text-primary-700 font-semibold">@zahir</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-gray-900 font-medium">Email</div>
            <div className="text-primary-700 font-semibold">
              natali@naat.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
