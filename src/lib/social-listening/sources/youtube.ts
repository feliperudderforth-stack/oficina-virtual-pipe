import { SocialMention, SourceFetchResult } from '@/types/social-listening';

const MOCK_YOUTUBE: SocialMention[] = [
  {
    id: 'yt-001',
    platform: 'youtube',
    author: 'TechArgentina TV',
    authorFollowers: 456000,
    content: 'REVIEW COMPLETO: Los 5 mejores electrodomésticos de Frávega 2026 | Precio, calidad y servicio post-venta analizado a fondo. ¿Vale la pena comprar acá?',
    url: 'https://youtube.com/watch?v=yt001',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    engagement: { likes: 12000, shares: 2300, comments: 1890, views: 345000 },
    sentiment: 'positivo',
    topics: ['review', 'electrodomésticos', 'top-5', 'post-venta'],
    reach: 456000,
    mediaUrls: ['https://example.com/yt-review-thumb.jpg'],
  },
  {
    id: 'yt-002',
    platform: 'youtube',
    author: 'Derecho del Consumidor AR',
    authorFollowers: 123000,
    content: 'Cómo reclamar a Frávega cuando no te entregan tu producto | Guía paso a paso para hacer valer tus derechos como consumidor argentino',
    url: 'https://youtube.com/watch?v=yt002',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    engagement: { likes: 8900, shares: 4500, comments: 2300, views: 234000 },
    sentiment: 'negativo',
    topics: ['reclamos', 'derechos-consumidor', 'entregas', 'tutorial'],
    reach: 123000,
  },
  {
    id: 'yt-003',
    platform: 'youtube',
    author: 'Hogar Moderno',
    authorFollowers: 678000,
    content: 'HAUL DE FRÁVEGA: Equipamos la casa nueva con $2.000.000 en electrodomésticos | Todo lo que compramos y nuestra experiencia',
    url: 'https://youtube.com/watch?v=yt003',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    engagement: { likes: 23000, shares: 5600, comments: 3400, views: 567000 },
    sentiment: 'muy_positivo',
    topics: ['haul', 'equipamiento', 'experiencia-compra'],
    reach: 678000,
    mediaUrls: ['https://example.com/haul-thumb.jpg'],
  },
];

export async function fetchYouTubeMentions(keywords: string[]): Promise<SourceFetchResult> {
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    platform: 'youtube',
    mentions: MOCK_YOUTUBE,
    fetchedAt: new Date().toISOString(),
    success: true,
  };
}
