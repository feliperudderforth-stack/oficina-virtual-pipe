import { SocialMention, SourceFetchResult } from '@/types/social-listening';

const MOCK_NEWS: SocialMention[] = [
  {
    id: 'nw-001',
    platform: 'news',
    author: 'iProfesional',
    authorFollowers: 0,
    content: 'Frávega apuesta por la omnicanalidad: la cadena de electrodomésticos invierte $500 millones en su plataforma digital y logística para competir con MercadoLibre. La estrategia incluye retiro en tienda en 2 horas y envío express en CABA.',
    url: 'https://iprofesional.com/tecnologia/fravega-omnicanalidad-2026',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    engagement: { likes: 234, shares: 567, comments: 89 },
    sentiment: 'positivo',
    topics: ['omnicanalidad', 'inversión', 'logística', 'estrategia-digital'],
    reach: 2500000,
  },
  {
    id: 'nw-002',
    platform: 'news',
    author: 'Infobae Economía',
    authorFollowers: 0,
    content: 'Crisis en el sector retail: Frávega y Garbarino enfrentan caída del 15% en ventas durante el primer trimestre. La inflación y las restricciones a las importaciones impactan en el stock y los precios.',
    url: 'https://infobae.com/economia/retail-crisis-q1-2026',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    engagement: { likes: 1200, shares: 890, comments: 456 },
    sentiment: 'negativo',
    topics: ['crisis-retail', 'ventas', 'inflación', 'importaciones'],
    reach: 15000000,
  },
  {
    id: 'nw-003',
    platform: 'news',
    author: 'La Nación Tecnología',
    authorFollowers: 0,
    content: 'Frávega lanza programa de trade-in para celulares y notebooks usados. Los clientes pueden entregar su dispositivo usado y obtener hasta un 30% de descuento en equipos nuevos. Una estrategia que busca fidelizar clientes en un mercado competitivo.',
    url: 'https://lanacion.com.ar/tecnologia/fravega-trade-in',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    engagement: { likes: 456, shares: 234, comments: 123 },
    sentiment: 'positivo',
    topics: ['trade-in', 'programa-fidelización', 'celulares', 'notebooks'],
    reach: 8000000,
  },
  {
    id: 'nw-004',
    platform: 'news',
    author: 'Ámbito Financiero',
    authorFollowers: 0,
    content: 'Defensa del Consumidor multó a Frávega por $50 millones debido a incumplimientos en los plazos de entrega durante el último CyberMonday. La empresa tiene 30 días para apelar.',
    url: 'https://ambito.com/negocios/defensa-consumidor-multa-fravega',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    engagement: { likes: 3400, shares: 2100, comments: 890 },
    sentiment: 'muy_negativo',
    topics: ['multa', 'defensa-consumidor', 'cybermonday', 'entregas'],
    reach: 5000000,
  },
  {
    id: 'nw-005',
    platform: 'blogs',
    author: 'BlogElectro Argentina',
    authorFollowers: 0,
    content: 'Análisis comparativo: ¿Dónde conviene comprar electrodomésticos en Argentina? Frávega vs Garbarino vs MercadoLibre vs Samsung Store. Frávega destaca en financiación pero pierde en variedad de productos.',
    url: 'https://blogelectro.com.ar/comparativa-retailers-2026',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    engagement: { likes: 89, shares: 45, comments: 34 },
    sentiment: 'neutro',
    topics: ['comparativa', 'retailers', 'financiación', 'variedad'],
    reach: 150000,
  },
];

export async function fetchNewsMentions(keywords: string[]): Promise<SourceFetchResult> {
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    platform: 'news',
    mentions: MOCK_NEWS,
    fetchedAt: new Date().toISOString(),
    success: true,
  };
}
