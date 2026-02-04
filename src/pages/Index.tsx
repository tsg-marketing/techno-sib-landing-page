import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Index = () => {
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [agreed, setAgreed] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterCapacity, setFilterCapacity] = useState('all');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const brands = [
    'Fatosa',
    'TALSABELL',
    'MAINCA',
    'NIRO-TECH',
    'Omet',
    'HEBEI XIAOJIN',
    'DARIBO',
    'YES FOOD MACHINERY',
  ];

  const problems = [
    {
      icon: 'TrendingDown',
      title: 'Не вытягивает кг/ч',
      description: 'Срываются отгрузки и контракты',
    },
    {
      icon: 'Thermometer',
      title: 'Фарш перегревается',
      description: 'Брак и жалобы клиентов',
    },
    {
      icon: 'PackageX',
      title: 'Нет запчастей',
      description: 'Простой производственной линии',
    },
    {
      icon: 'Droplets',
      title: 'Сложная мойка',
      description: 'Санитарные риски и штрафы',
    },
    {
      icon: 'Zap',
      title: 'Не совпало по электрике',
      description: 'Переделки и доп. расходы',
    },
  ];

  const advantages = [
    {
      icon: 'Factory',
      text: 'Прямые поставки с заводов — фиксируем комплектацию и сроки',
    },
    {
      icon: 'Store',
      text: 'Демозалы МСК/НСК — покажем узлы и обслуживание',
    },
    {
      icon: 'Settings',
      text: 'Подбор под продукт — ножи/решётки/режимы',
    },
    {
      icon: 'Clock',
      text: 'Быстрые сроки — под ваш дедлайн',
    },
    {
      icon: 'Wrench',
      text: 'Сервис — пусконаладка, гарантия, запчасти',
    },
  ];

  const segments = [
    {
      icon: 'Building2',
      title: 'Мясокомбинаты и колбасные цеха',
      description: 'Производительность и снижение простоя',
    },
    {
      icon: 'Package',
      title: 'Полуфабрикаты',
      description: 'Стабильная структура фарша',
    },
    {
      icon: 'Sparkles',
      title: 'Новый цех',
      description: 'Подбор комплекта + требования к подключению',
    },
    {
      icon: 'Rocket',
      title: 'Экстренная замена',
      description: 'Быстрый подбор и запуск',
    },
  ];

  const equipment = [
    {
      brand: 'Fatosa',
      model: 'FW-300',
      capacity: '300 кг/ч',
      type: 'Волчок',
      description: 'Подходит для малых цехов и тестовых партий',
      image: 'https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/files/ae2da679-b284-4a5b-88ef-6348e86708f4.jpg',
    },
    {
      brand: 'TALSABELL',
      model: 'TB-1500',
      capacity: '1500 кг/ч',
      type: 'Волчок',
      description: 'Оптимален для средних производств',
      image: 'https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/files/7b013632-f614-4727-b6df-5b716a8b8008.jpg',
    },
    {
      brand: 'MAINCA',
      model: 'MC-3000',
      capacity: '3000 кг/ч',
      type: 'Куттер',
      description: 'Высокая производительность для крупных комбинатов',
      image: 'https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/files/b001e360-62cc-4ac3-b27b-6638fa567113.jpg',
    },
    {
      brand: 'NIRO-TECH',
      model: 'NT-5000',
      capacity: '5000 кг/ч',
      type: 'Куттер',
      description: 'Промышленная серия для непрерывного цикла',
      image: 'https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/files/ae2da679-b284-4a5b-88ef-6348e86708f4.jpg',
    },
    {
      brand: 'Omet',
      model: 'OM-800',
      capacity: '800 кг/ч',
      type: 'Волчок',
      description: 'Универсальное решение для цехов среднего масштаба',
      image: 'https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/files/7b013632-f614-4727-b6df-5b716a8b8008.jpg',
    },
    {
      brand: 'HEBEI XIAOJIN',
      model: 'HX-10000',
      capacity: '10000 кг/ч',
      type: 'Куттер',
      description: 'Максимальная производительность для крупных предприятий',
      image: 'https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/files/b001e360-62cc-4ac3-b27b-6638fa567113.jpg',
    },
  ];

  const videos = [
    {
      title: 'Разборка и мойка волчка',
      description: 'Как правильно обслуживать оборудование',
      thumbnail: 'https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/files/ae2da679-b284-4a5b-88ef-6348e86708f4.jpg',
    },
    {
      title: 'Работа под нагрузкой 3000 кг/ч',
      description: 'Тест на производительность',
      thumbnail: 'https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/files/7b013632-f614-4727-b6df-5b716a8b8008.jpg',
    },
    {
      title: 'Куттер: однородность фарша',
      description: 'Проверка качества готового продукта',
      thumbnail: 'https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/files/b001e360-62cc-4ac3-b27b-6638fa567113.jpg',
    },
  ];

  const filteredEquipment = equipment.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterCapacity !== 'all') {
      const capacity = parseInt(item.capacity);
      if (filterCapacity === 'small' && capacity > 1000) return false;
      if (filterCapacity === 'medium' && (capacity <= 1000 || capacity > 5000)) return false;
      if (filterCapacity === 'large' && capacity <= 5000) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-12">
              <div className="text-2xl font-bold">Техно-Сиб</div>
              <nav className="hidden lg:flex items-center gap-6">
                <button onClick={() => scrollToSection('equipment')} className="hover:text-accent transition-colors">
                  Оборудование
                </button>
                <button onClick={() => scrollToSection('advantages')} className="hover:text-accent transition-colors">
                  Преимущества
                </button>
                <button onClick={() => scrollToSection('catalog')} className="hover:text-accent transition-colors">
                  Модели
                </button>
                <button onClick={() => scrollToSection('videos')} className="hover:text-accent transition-colors">
                  Видео
                </button>
                <button onClick={() => scrollToSection('segments')} className="hover:text-accent transition-colors">
                  Квиз
                </button>
                <button onClick={() => scrollToSection('advantages')} className="hover:text-accent transition-colors">
                  Сервис
                </button>
                <button onClick={() => scrollToSection('contacts')} className="hover:text-accent transition-colors">
                  Контакты
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <div className="text-lg font-semibold">8-800-533-82-68</div>
                <div className="text-xs opacity-90">Демозалы: Москва и Новосибирск</div>
              </div>
              <Button variant="secondary" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                Получить КП за 24 часа
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url(https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/files/b001e360-62cc-4ac3-b27b-6638fa567113.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Промышленные волчки и куттеры 300–10 000 кг/ч — прямые поставки с заводов
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-95">
                Подбор под ваш продукт и план выпуска. Можно посмотреть оборудование в демозалах Москвы и Новосибирска.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle2" className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <p className="text-lg">Цена без лишних наценок: поставки напрямую от производителей</p>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle2" className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <p className="text-lg">Проверка перед покупкой: демонстрация узлов и разборки в шоуруме</p>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle2" className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <p className="text-lg">Снижаем риск простоя: пусконаладка, запчасти, техподдержка</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6">
                  Подобрать модель
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-6">
                  Записаться в демозал
                </Button>
              </div>
            </div>
            <Card className="bg-white shadow-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-6">Получить подбор и КП</h3>
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="hero-name" className="text-foreground">Имя *</Label>
                    <Input
                      id="hero-name"
                      placeholder="Ваше имя"
                      className="mt-2"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hero-phone" className="text-foreground">Телефон *</Label>
                    <Input
                      id="hero-phone"
                      type="tel"
                      placeholder="+7 (___) ___-__-__"
                      className="mt-2"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox id="hero-agree" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} />
                    <label htmlFor="hero-agree" className="text-sm text-muted-foreground cursor-pointer">
                      Я согласен с <a href="#" className="text-accent underline">политикой конфиденциальности</a>
                    </label>
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                    Отправить
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="equipment" className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Оборудование от производителей Европы и Китая</h2>
            <p className="text-xl text-muted-foreground">
              Волчки: Германия, Италия, Испания, Польша, Китай. Куттеры: 300–10 000 кг/ч.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {brands.map((brand, index) => (
              <Badge key={index} variant="outline" className="text-base px-6 py-3 hover-scale cursor-pointer border-2">
                {brand}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Где чаще всего теряют деньги при покупке волчка/куттера
              </h2>
              <div className="space-y-6 mb-8">
                {problems.map((problem, index) => (
                  <Card key={index} className="hover-scale cursor-pointer border-l-4 border-l-accent">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Icon name={problem.icon} className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-1">{problem.title}</h3>
                          <p className="text-muted-foreground">{problem.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-8">
                  <p className="text-xl font-semibold mb-6">Проверим подбор по вашему ТЗ за 1 рабочий день</p>
                  <form className="space-y-4">
                    <Input
                      placeholder="Ваше имя"
                      className="bg-white text-foreground"
                    />
                    <Input
                      type="tel"
                      placeholder="+7 (___) ___-__-__"
                      className="bg-white text-foreground"
                    />
                    <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                      Отправить
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="relative">
              <img
                src="https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/files/b001e360-62cc-4ac3-b27b-6638fa567113.jpg"
                alt="Производственный цех"
                className="rounded-lg shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="advantages" className="py-20 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Что вы получаете с "Техно-Сиб", кроме оборудования
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {advantages.map((advantage, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur border-white/20 hover-scale">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-lg bg-accent flex items-center justify-center mb-4">
                    <Icon name={advantage.icon} className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-lg">{advantage.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="bg-accent text-accent-foreground border-none">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">Нужен тендер?</h3>
                  <p className="text-lg">КП со спецификацией и альтернативами — за 24 часа</p>
                </div>
                <Button size="lg" variant="secondary" className="bg-white text-accent hover:bg-white/90 font-semibold px-8 py-6 whitespace-nowrap">
                  Запросить документы
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="segments" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Кому подходит наше оборудование</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {segments.map((segment, index) => (
              <Card key={index} className="hover-scale cursor-pointer border-t-4 border-t-accent">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Icon name={segment.icon} className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{segment.title}</h3>
                  <p className="text-muted-foreground">{segment.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6">
              Ответить на 8 вопросов и получить подбор
            </Button>
          </div>
        </div>
      </section>

      <section id="catalog" className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Модели волчков и куттеров</h2>
          </div>
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Тип оборудования" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="Волчок">Волчок</SelectItem>
                <SelectItem value="Куттер">Куттер</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCapacity} onValueChange={setFilterCapacity}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Производительность" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Любая</SelectItem>
                <SelectItem value="small">До 1000 кг/ч</SelectItem>
                <SelectItem value="medium">1000-5000 кг/ч</SelectItem>
                <SelectItem value="large">От 5000 кг/ч</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredEquipment.map((item, index) => (
              <Card key={index} className="overflow-hidden hover-scale">
                <img src={item.image} alt={item.model} className="w-full h-64 object-cover" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge className="mb-2">{item.type}</Badge>
                      <h3 className="font-bold text-xl">{item.brand} {item.model}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-accent">{item.capacity}</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-accent hover:bg-accent/90">Запросить КП</Button>
                    <Button variant="outline" className="flex-1">Сравнить</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Card className="inline-block bg-primary text-primary-foreground">
              <CardContent className="p-8">
                <p className="text-xl font-semibold mb-4">Подберём 2–3 варианта под продукт и бюджет</p>
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                  Получить консультацию
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="videos" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Видео: как выглядит оборудование и узлы вживую
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {videos.map((video, index) => (
              <Card key={index} className="overflow-hidden hover-scale cursor-pointer">
                <div className="relative group">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-64 object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                      <Icon name="Play" className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">{video.title}</h3>
                  <p className="text-muted-foreground">{video.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6">
              Записаться на демонстрацию
            </Button>
          </div>
        </div>
      </section>

      <section id="contacts" className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold mb-8">Контакты</h2>
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    <Icon name="Phone" className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Телефон</h3>
                    <p className="text-lg">8-800-533-82-68</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    <Icon name="MapPin" className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Демозалы</h3>
                    <p className="mb-2">
                      <span className="font-semibold">Москва:</span><br />
                      ш. Энтузиастов, д. 56, стр. 32, офис 115
                    </p>
                    <p>
                      <span className="font-semibold">Новосибирск:</span><br />
                      ул. Электрозаводская, 2 к1, офис 304, 314
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="bg-white shadow-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-6">Обратная связь</h3>
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="contact-name" className="text-foreground">Имя *</Label>
                    <Input id="contact-name" placeholder="Ваше имя" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="contact-phone" className="text-foreground">Телефон *</Label>
                    <Input id="contact-phone" type="tel" placeholder="+7 (___) ___-__-__" className="mt-2" />
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox id="contact-agree" />
                    <label htmlFor="contact-agree" className="text-sm text-muted-foreground cursor-pointer">
                      Я согласен с <a href="#" className="text-accent underline">политикой конфиденциальности</a>
                    </label>
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                    Отправить
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    Спасибо! Мы свяжемся с вами в ближайшее время
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="bg-primary/95 text-primary-foreground py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-semibold mb-2">Техно-Сиб</p>
          <p className="text-sm opacity-75">© 2024. Промышленное оборудование для мясопереработки</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
