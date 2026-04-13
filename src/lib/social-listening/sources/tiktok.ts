import { SocialMention, SourceFetchResult } from '@/types/social-listening';

const MOCK_TIKTOK: SocialMention[] = [
  {
    id: 'tt-001',
    platform: 'tiktok',
    author: '@tecnotips_ar',
    authorFollowers: 890000,
    content: '¡No vas a creer este hack! 🤯 Compré en Frávega con 3 cupones apilados y me ahorré $150.000 en una notebook. Te explico cómo #Frávega #HackDeCompras #TechArgentina',
    url: 'https://tiktok.com/@tecnotips_ar/video/tt001',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    engagement: { likes: 45000, shares: 12000, comments: 3400, views: 890000 },
    sentiment: 'muy_positivo',
    topics: ['cupones', 'ahorro', 'notebooks', 'hack-compras'],
    reach: 890000,
    mediaUrls: ['https://example.com/tiktok-hack.mp4'],
  },
  {
    id: 'tt-002',
    platform: 'tiktok',
    author: '@unboxing_argentina',
    authorFollowers: 345000,
    content: 'UNBOXING: Pedí un aire acondicionado en Frávega y llegó DESTRUIDO 💀 La caja toda rota, el equipo abollado. Ahora a hacer el reclamo... #Fail #Frávega #Unboxing',
    url: 'https://tiktok.com/@unboxing_argentina/video/tt002',
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    engagement: { likes: 78000, shares: 23000, comments: 8900, views: 1200000 },
    sentiment: 'muy_negativo',
    topics: ['envío-dañado', 'aire-acondicionado', 'reclamo', 'unboxing'],
    reach: 345000,
    mediaUrls: ['https://example.com/unboxing-fail.mp4'],
  },
  {
    id: 'tt-003',
    platform: 'tiktok',
    author: '@cocina_moderna_ar',
    authorFollowers: 567000,
    content: 'Mi cocina ANTES y DESPUÉS con productos de @fravega_oficial ✨ El horno empotrable es una JOYA. #Transformación #Cocina #Frávega #AntesYDespués',
    url: 'https://tiktok.com/@cocina_moderna_ar/video/tt003',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    engagement: { likes: 56000, shares: 8900, comments: 2300, views: 780000 },
    sentiment: 'muy_positivo',
    topics: ['transformación', 'cocina', 'horno', 'antes-después'],
    reach: 567000,
    mediaUrls: ['https://example.com/cocina-transform.mp4'],
  },
  {
    id: 'tt-004',
    platform: 'tiktok',
    author: '@comparador_precios',
    authorFollowers: 234000,
    content: 'Comparé precios de la misma TV en Frávega, Garbarino, Musimundo y MercadoLibre. ¿Quién gana? SPOILER: depende de las cuotas 🤔 #Comparativa #Precios',
    url: 'https://tiktok.com/@comparador_precios/video/tt004',
    timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    engagement: { likes: 34000, shares: 5600, comments: 4500, views: 456000 },
    sentiment: 'neutro',
    topics: ['comparativa', 'precios', 'competencia', 'cuotas'],
    reach: 234000,
  },
];

export async function fetchTikTokMentions(keywords: string[]): Promise<SourceFetchResult> {
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    platform: 'tiktok',
    mentions: MOCK_TIKTOK,
    fetchedAt: new Date().toISOString(),
    success: true,
  };
}
