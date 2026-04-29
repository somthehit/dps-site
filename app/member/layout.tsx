export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth is handled client-side in the page component
  // to support sessionStorage fallback for email confirmation flow
  return <>{children}</>;
}
