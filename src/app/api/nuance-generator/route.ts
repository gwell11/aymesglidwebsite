import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'info',
    message: 'AI Song Nuance Generator',
    description: 'Advanced AI tool for adding unique musical nuances to songs',
    features: [
      'AI-generated procedural sounds',
      '10+ audio effects (chorus, delay, reverb, distortion, etc.)',
      'Parameter control for creativity, density, and intensity',
      'Unique sound generation with no repetition',
      'Real-time audio processing'
    ],
    note: 'Full functionality available in local development version',
    localUrl: 'http://localhost:5001'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      error: 'Service temporarily unavailable',
      message: 'The AI Song Nuance Generator requires audio processing dependencies that are currently only available in the local development version.',
      localUrl: 'http://localhost:5001',
      status: 'redirect-to-local'
    }, { status: 503 });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Invalid request',
      message: 'Please check your request format'
    }, { status: 400 });
  }
}
