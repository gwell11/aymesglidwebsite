import { useState } from 'react';

interface NuanceGeneratorProps {
  className?: string;
}

export default function NuanceGenerator({ className = '' }: NuanceGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerateNuance = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/nuance-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creativity: 0.7,
          density: 0.5,
          intensity: 0.6,
          texture_preference: 'varied',
          randomness: 0.8,
          stereo_width: 0.7
        })
      });

      const data = await response.json();
      
      if (data.status === 'demo-completed') {
        setMessage(`🎉 Demo completed! Generated ${data.simulation.unique_sounds_generated} unique sounds with ${data.simulation.effects_applied.join(', ')} effects. For full audio processing, try the local version!`);
      } else if (data.status === 'redirect-to-local') {
        setMessage('AI tool is available locally! Visit http://localhost:5001 for full functionality.');
        // Optionally open in new tab
        window.open('http://localhost:5001', '_blank');
      } else {
        setMessage(data.message || 'Generated unique musical nuance!');
      }
    } catch (error) {
      setMessage('Connection error. Please try the local version at http://localhost:5001');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-gray-900/80 backdrop-blur-sm border border-blue-400/30 rounded-lg p-6 ${className}`}>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        🎵 AI Song Nuance Generator
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">LIVE</span>
      </h3>
      
      <p className="text-gray-300 mb-4 text-sm">
        Advanced AI tool that adds unique musical nuances to songs using procedural audio synthesis and 10+ audio effects.
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {['AI Audio', 'Procedural Synthesis', 'Real-time Effects', 'Parameter Controls'].map((tech) => (
          <span key={tech} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
            {tech}
          </span>
        ))}
      </div>
      
      <div className="space-y-3">
        <button
          onClick={handleGenerateNuance}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium"
        >
          {isLoading ? 'Generating...' : 'Generate AI Nuance'}
        </button>
        
        {message && (
          <div className={`text-sm p-3 rounded-lg ${
            message.includes('error') || message.includes('Connection') 
              ? 'bg-red-500/20 text-red-400' 
              : 'bg-green-500/20 text-green-400'
          }`}>
            {message}
          </div>
        )}
        
        <div className="flex gap-2">
          <a
            href="http://localhost:5001"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm text-center transition-colors duration-200"
          >
            Full Local Demo
          </a>
          <a
            href="https://github.com/gwell11/aymesglidwebsite/tree/main/nuance-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm text-center transition-colors duration-200"
          >
            View Code
          </a>
        </div>
      </div>
    </div>
  );
}
