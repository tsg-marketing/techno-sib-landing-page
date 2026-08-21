import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { buildSpec, SPEC_TITLES, type SpecType } from '@/lib/landingSpec';

const SpecPage = () => {
  const [tab, setTab] = useState<SpecType>('wolves');
  const spec = useMemo(() => buildSpec(tab), [tab]);

  const downloadTxt = (type: SpecType) => {
    const content = buildSpec(type);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'wolves' ? 'landing-volchki.txt' : 'landing-blokorezki.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(spec);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white py-6 sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-1">Техническое описание лендинга</h1>
          <p className="text-sm text-slate-300">
            Служебная страница. Данные для переноса на другой домен.
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 mb-6">
          {(Object.keys(SPEC_TITLES) as SpecType[]).map((key) => (
            <Button
              key={key}
              variant={tab === key ? 'default' : 'outline'}
              onClick={() => setTab(key)}
              className={tab === key ? 'bg-slate-900 hover:bg-slate-800 text-white' : ''}
            >
              {SPEC_TITLES[key]}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Button onClick={() => downloadTxt('wolves')} className="gap-2 bg-orange-600 hover:bg-orange-700 text-white">
            <Icon name="Download" size={18} />
            Скачать TXT — Волчки
          </Button>
          <Button onClick={() => downloadTxt('blockcutters')} className="gap-2 bg-orange-600 hover:bg-orange-700 text-white">
            <Icon name="Download" size={18} />
            Скачать TXT — Блокорезки
          </Button>
          <Button variant="outline" onClick={copyToClipboard} className="gap-2">
            <Icon name="Copy" size={18} />
            Скопировать открытый документ
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-100 text-sm font-medium text-slate-700">
            {SPEC_TITLES[tab]}
          </div>
          <pre className="p-4 md:p-6 text-xs md:text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono text-slate-800">
            {spec}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default SpecPage;
