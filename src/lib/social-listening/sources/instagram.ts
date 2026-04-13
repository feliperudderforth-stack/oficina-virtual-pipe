import { SocialMention, SourceFetchResult } from '@/types/social-listening';

const MOCK_INSTAGRAM: SocialMention[] = [
  {
    id: 'ig-001',
    platform: 'instagram',
    author: '@homedeco_arg',
    authorFollowers: 156000,
    content: 'Renovamos toda la cocina con electrodomésticos de @fravegaonline 🏠✨ El combo heladera + horno + microondas quedó espectacular. Aprovechamos las 18 cuotas sin interés. #CocinaRenovada #Frávega #HomeDecor',
    url: 'https://instagram.com/p/ig001',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    engagement: { likes: 8900, shares: 234, comments: 456, views: 67000 },
    sentiment: 'muy_positivo',
    topics: ['cocina', 'electrodomésticos', 'cuotas', 'renovación'],
    reach: 156000,
    mediaUrls: ['https://example.com/kitchen-reno.jpg'],
  },
  {
    id: 'ig-002',
    platform: 'instagram',
    author: '@techreviews_ba',
    authorFollowers: 89000,
    content: 'Review completo del nuevo Samsung Galaxy que compramos en @fravegaonline. Precio competitivo pero el proceso de retiro en tienda fue caótico. 40 minutos de espera. #Review #Samsung #Frávega',
    url: 'https://instagram.com/p/ig002',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    engagement: { likes: 4500, shares: 178, comments: 312, views: 45000 },
    sentiment: 'neutro',
    topics: ['celulares', 'retiro-tienda', 'review', 'samsung'],
    reach: 89000,
    mediaUrls: ['https://example.com/samsung-review.jpg'],
  },
  {
    id: 'ig-003',
    platform: 'instagram',
    author: '@mamadecasa_tips',
    authorFollowers: 234000,
    content: 'Les cuento mi experiencia con el lavarropas automático de Frávega. Después de 6 meses de uso: EXCELENTE. Lava perfecto, gasta poca agua y electricidad. La mejor compra del año 💯 #LavarropasTips #Frávega',
    url: 'https://instagram.com/p/ig003',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    engagement: { likes: 12300, shares: 890, comments: 567, views: 134000 },
    sentiment: 'muy_positivo',
    topics: ['lavarropas', 'review-largo-plazo', 'ahorro-energía'],
    reach: 234000,
    mediaUrls: ['https://example.com/lavarropas.jpg'],
  },
  {
    id: 'ig-004',
    platform: 'instagram',
    author: '@gamer_zone_ar',
    authorFollowers: 67800,
    content: 'La sección gaming de Frávega online está bastante floja. Pocos modelos de consolas, accesorios limitados. Para gaming prefiero otros retailers. #Gaming #Argentina',
    url: 'https://instagram.com/p/ig004',
    timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    engagement: { likes: 2100, shares: 145, comments: 289, views: 23000 },
    sentiment: 'negativo',
    topics: ['gaming', 'catálogo', 'competencia'],
    reach: 67800,
  },
  {
    id: 'ig-005',
    platform: 'instagram',
    author: '@influencer_lifestyle_ba',
    authorFollowers: 456000,
    content: 'Colaboración con @fravegaonline 🤝 Equipamos el depto nuevo con TODO de Frávega. Smart TV, aire acondicionado, aspiradora robot... La experiencia de compra fue 10/10. Código de descuento LIFESTYLE15 🛒',
    url: 'https://instagram.com/p/ig005',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    engagement: { likes: 23400, shares: 1200, comments: 890, views: 312000 },
    sentiment: 'muy_positivo',
    topics: ['colaboración', 'influencer', 'descuento', 'equipamiento-hogar'],
    reach: 456000,
    mediaUrls: ['https://example.com/collab.jpg'],
  },
];

export async function fetchInstagramMentions(keywords: string[]): Promise<SourceFetchResult> {
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    platform: 'instagram',
    mentions: MOCK_INSTAGRAM,
    fetchedAt: new Date().toISOString(),
    success: true,
  };
}
