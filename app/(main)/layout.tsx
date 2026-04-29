import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { getSiteSettings, getActiveSocialLinks } from "@/lib/data/site-config";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, socialLinks] = await Promise.all([
    getSiteSettings(),
    getActiveSocialLinks(),
  ]);

  return (
    <>
      <Navbar settings={settings} socialLinks={socialLinks} />
      {children}
      <Footer settings={settings} socialLinks={socialLinks} />
    </>
  );
}
