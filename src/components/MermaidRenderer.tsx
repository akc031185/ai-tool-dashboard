import { useEffect, useRef } from 'react';

interface MermaidRendererProps {
  code: string;
}

export default function MermaidRenderer({ code }: MermaidRendererProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: 'default'
        });

        const raw = code?.trim() || '';
        const cleaned = raw.startsWith('```')
          ? raw.replace(/^```mermaid\s*/i, '').replace(/```$/, '').trim()
          : raw;

        const id = 'mermaid-' + Math.random().toString(36).slice(2);

        if (!ref.current) return;

        const { svg } = await mermaid.render(id, cleaned);

        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = `<div class="text-red-600 text-sm">Failed to render diagram</div>`;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code]);

  return <div className="w-full overflow-x-auto" ref={ref} />;
}
