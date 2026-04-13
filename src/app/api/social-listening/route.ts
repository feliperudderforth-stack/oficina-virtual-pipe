import { NextRequest, NextResponse } from 'next/server';
import { runSocialListeningAgent, DEFAULT_CONFIG } from '@/lib/social-listening/agent';
import { AgentConfig, Platform } from '@/types/social-listening';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, config } = body as {
      apiKey: string;
      config?: Partial<AgentConfig>;
    };

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Se requiere una API key de Anthropic' },
        { status: 400 }
      );
    }

    const execution = await runSocialListeningAgent(apiKey, config);

    return NextResponse.json(execution);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    agent: 'Social Listening Agent - Frávega',
    version: '1.0.0',
    defaultConfig: DEFAULT_CONFIG,
    availablePlatforms: ['twitter', 'instagram', 'tiktok', 'youtube', 'news', 'blogs'] as Platform[],
  });
}
