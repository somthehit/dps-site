import { MetadataRoute } from 'next';
import { db } from '@/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dpscoop.com.np';

  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/downloads',
    '/gallery',
    '/notices',
    '/services',
    '/team',
    '/membership-request',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic Notice routes
  const noticeData = await db.query.notices.findMany({
    columns: {
      id: true,
      date: true,
    },
  });

  const noticeRoutes = noticeData.map((notice) => ({
    url: `${baseUrl}/notices/${notice.id}`,
    lastModified: new Date(notice.date),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Dynamic Service routes
  const serviceData = await db.query.services.findMany({
    columns: {
      category: true,
    },
  });

  const serviceRoutes = serviceData.map((service) => ({
    url: `${baseUrl}/services/${service.category}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...noticeRoutes, ...serviceRoutes];
}
