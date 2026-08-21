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

  const archives: Record<SpecType, { file: string; size: string }> = {
    wolves: { file: '/volchki-images.zip', size: '7,5 МБ' },
    blockcutters: { file: '/blokorezki-images.zip', size: '6,2 МБ' },
  };

  const firstAdvantage =
    tab === 'wolves'
      ? { label: 'Производительность от 300 до 10 000 кг/ч', url: 'https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/bucket/a656d1db-92e4-4e11-b350-30a9c05cd111.png' }
      : { label: 'Производительность до 6000 кг/ч', url: 'https://cdn.poehali.dev/files/daa3ea59-75d1-4975-b588-58e4e7333392.jpg' };

  const imageGroups = [
    {
      group: 'Преимущества нашего оборудования',
      items: [
        firstAdvantage,
        { label: 'Высокое качество реза', url: 'https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/bucket/bed77bb8-4a4c-4bac-988f-5c0eb703091a.png' },
        { label: 'Легкая разборка и мойка', url: 'https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/bucket/d79ae1f9-3f66-4af2-8599-343067d6212b.png' },
        { label: 'Простота в эксплуатации', url: 'https://cdn.poehali.dev/files/af41be1d-7065-4660-a7f1-6567210128a2.jpg' },
        { label: 'Пакет документов под тендер', url: 'https://cdn.poehali.dev/files/67e88add-8208-4a74-8b09-d961c8342aaa.jpg' },
        { label: 'Подбор комплекта для новых цехов', url: 'https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/bucket/b7d267bf-21c3-4d81-9728-4d84f23a82cf.png' },
        { label: 'Гарантия 12 месяцев', url: 'https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/bucket/8b769637-fd1d-4170-a2dd-0078dcb9bf0b.png' },
        { label: 'Доставка по всей России', url: 'https://cdn.poehali.dev/files/ab57a59c-7aaf-4ca3-8757-de0810a446c9.jpg' },
      ],
    },
    {
      group: 'Преимущества компании Техно-Сиб',
      items: [
        { label: 'Прямые поставки с заводов — фиксируем комплектацию и сроки', url: 'https://cdn.poehali.dev/files/7f8f0530-fd16-4245-8986-d11ddcdd92fc.jpg' },
        { label: 'Демозалы МСК/НСК — покажем узлы и обслуживание', url: 'https://cdn.poehali.dev/files/75a90c8e-cf4d-4083-9f9d-46ee193294e9.jpg' },
        { label: 'Подбор под продукт — ножи/решётки/режимы', url: 'https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/bucket/156dc279-0359-4b82-8825-de179146e9a8.png' },
        { label: 'Быстрые сроки — под ваш дедлайн', url: 'https://cdn.poehali.dev/files/a8fe2f0a-ce7b-4fa5-ae2b-61a7b321a961.jpg' },
        { label: 'Сервис — пусконаладка, гарантия, запчасти', url: 'https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/bucket/3c60481e-756f-404b-83d5-423798ead2f6.png' },
      ],
    },
    {
      group: 'Частые вопросы',
      items: [
        { label: 'Директор', url: 'https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/files/a58b4558-9697-4b42-845a-ab0e50aa74f2.jpg' },
        { label: 'Инженер', url: 'https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/files/9ec9ea66-abef-4e2e-a9bf-b82e196cbce2.jpg' },
        { label: 'Технолог', url: 'https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/files/4974227d-c3cb-40b4-94ce-7110037b6903.jpg' },
        { label: 'Закупщик', url: 'https://cdn.poehali.dev/files/f3a36fe9-687f-472f-8975-05956c9827c2.jpg' },
      ],
    },
  ];

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

        <div className="flex flex-wrap gap-3 mb-6">
          <a href="/volchki-images.zip" download>
            <Button variant="outline" className="gap-2">
              <Icon name="FileArchive" size={18} />
              Фото — Волчки (7,5 МБ)
            </Button>
          </a>
          <a href="/blokorezki-images.zip" download>
            <Button variant="outline" className="gap-2">
              <Icon name="FileArchive" size={18} />
              Фото — Блокорезки (6,2 МБ)
            </Button>
          </a>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm mb-6 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-slate-700">
                Изображения лендинга «{SPEC_TITLES[tab]}» — 17 файлов
              </div>
              <div className="text-xs text-slate-500">
                Имя каждого файла совпадает с подписью на лендинге
              </div>
            </div>
            <a href={archives[tab].file} download>
              <Button className="gap-2 bg-orange-600 hover:bg-orange-700 text-white">
                <Icon name="FileArchive" size={18} />
                Скачать архив ({archives[tab].size})
              </Button>
            </a>
          </div>
          <div className="p-4 md:p-6 space-y-8">
            {imageGroups.map((g) => (
              <div key={g.group}>
                <h3 className="text-sm font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-200">
                  {g.group} · {g.items.length} шт.
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {g.items.map((img) => (
                    <a
                      key={img.url}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <div className="aspect-[4/3] rounded-md overflow-hidden bg-slate-100 border border-slate-200 group-hover:border-orange-400 transition-colors">
                        <img
                          src={img.url}
                          alt={img.label}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="mt-2 text-xs text-slate-600 leading-snug group-hover:text-orange-600">
                        {img.label}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
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