export const metadata = {
  title: 'Authentication',
};

export default function Oauth2CallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
