
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import BattleArena from '@/components/BattleArena';

// Типы для нашего приложения
type Ability = {
  name: string;
  description: string;
  type: 'attack' | 'defense' | 'support';
  element?: string;
};

type Character = {
  name: string;
  race: string;
  class: string;
  element: string;
  description: string;
  avatarUrl: string;
  abilities: Ability[];
};

type Monster = {
  name: string;
  hp: number;
  attack: number;
  description: string;
  imageUrl: string;
};

const capibaraAvatars = [
  {
    id: 1,
    url: 'https://cdn.poehali.dev/files/62af6a7c-8a6a-4434-89ca-4264db9a216d.jpg',
    description: 'Капибара-Бэтмен в солнечных очках'
  },
  {
    id: 2,
    url: 'https://cdn.poehali.dev/files/dff72a8e-25b7-49c9-adb7-3ac593f71747.jpeg',
    description: 'Серьезная круглая капибара'
  },
  {
    id: 3,
    url: 'https://cdn.poehali.dev/files/982fcb8c-1f49-4adb-ba1a-1a5cda5eb92e.jpg',
    description: 'Маленькая капибара на пне'
  }
];

// Функция для генерации способностей на основе класса и стихии
const generateAbilities = (characterClass: string, element: string): Ability[] => {
  const abilities: Ability[] = [];
  const classLower = characterClass.toLowerCase();
  const elementLower = element.toLowerCase();
  
  // Словарь базовых способностей по классам
  const classAbilities: Record<string, Partial<Ability>[]> = {
    'маг': [
      {name: 'Магическая стрела', type: 'attack', description: 'Выпускает мощный снаряд чистой магической энергии'},
      {name: 'Магический щит', type: 'defense', description: 'Создаёт барьер, защищающий от магических атак'},
      {name: 'Телекинез', type: 'support', description: 'Перемещает предметы силой мысли'},
    ],
    'воин': [
      {name: 'Мощный удар', type: 'attack', description: 'Наносит сокрушительный удар, игнорирующий часть брони противника'},
      {name: 'Стойка защиты', type: 'defense', description: 'Принимает защитную стойку, уменьшающую получаемый урон'},
      {name: 'Боевой клич', type: 'support', description: 'Воодушевляет союзников, увеличивая их силу атаки'},
    ],
    'лучник': [
      {name: 'Точный выстрел', type: 'attack', description: 'Поражает уязвимую точку противника с большого расстояния'},
      {name: 'Маневр уклонения', type: 'defense', description: 'Быстро уклоняется от атаки, избегая урона'},
      {name: 'Меткий глаз', type: 'support', description: 'Выявляет слабые места противников, усиливая атаки союзников'},
    ],
    'разбойник': [
      {name: 'Удар в спину', type: 'attack', description: 'Наносит внезапный урон незамеченным противникам'},
      {name: 'Дымовая завеса', type: 'defense', description: 'Создаёт облако дыма, затрудняющее атаки врагов'},
      {name: 'Карманная кража', type: 'support', description: 'Может незаметно украсть предмет у противника во время боя'},
    ],
    'целитель': [
      {name: 'Лечебное касание', type: 'support', description: 'Восстанавливает здоровье раненому союзнику'},
      {name: 'Очищение', type: 'support', description: 'Снимает негативные эффекты с цели'},
      {name: 'Световой удар', type: 'attack', description: 'Концентрирует силу света для атаки нежити и тёмных существ'},
    ]
  };
  
  // Словарь стихийных модификаторов
  const elementModifiers: Record<string, Partial<Ability>[]> = {
    'огонь': [
      {name: 'Огненный шар', type: 'attack', description: 'Запускает сгусток пламени, наносящий урон по площади'},
      {name: 'Огненная аура', type: 'defense', description: 'Окружает владельца огненным щитом, обжигающим атакующих'},
    ],
    'вода': [
      {name: 'Водяная струя', type: 'attack', description: 'Создаёт мощный поток воды, сбивающий противников с ног'},
      {name: 'Ледяной покров', type: 'defense', description: 'Замораживает поверхность вокруг, замедляя врагов'},
    ],
    'земля': [
      {name: 'Каменная хватка', type: 'attack', description: 'Призывает каменные руки из земли, удерживающие противника'},
      {name: 'Каменная кожа', type: 'defense', description: 'Покрывает тело защитным слоем камня, уменьшая получаемый урон'},
    ],
    'воздух': [
      {name: 'Шквал', type: 'attack', description: 'Вызывает мощный порыв ветра, отбрасывающий противников'},
      {name: 'Воздушный щит', type: 'defense', description: 'Создаёт вихрь, отклоняющий снаряды и атаки'},
    ],
    'тьма': [
      {name: 'Теневой удар', type: 'attack', description: 'Атакует силами тьмы, игнорируя часть защиты противника'},
      {name: 'Теневая форма', type: 'defense', description: 'Превращает тело в тень, позволяя атакам проходить сквозь него'},
    ],
    'свет': [
      {name: 'Луч света', type: 'attack', description: 'Направляет луч яркого света, наносящий урон тёмным существам'},
      {name: 'Сияющий барьер', type: 'defense', description: 'Создаёт купол света, защищающий от злых сил'},
    ],
    'природа': [
      {name: 'Опутывающие лозы', type: 'attack', description: 'Вызывает растения, опутывающие и удерживающие противника'},
      {name: 'Регенерация', type: 'support', description: 'Ускоряет естественное восстановление организма'},
    ],
    'молния': [
      {name: 'Разряд молнии', type: 'attack', description: 'Бьёт противника мощным электрическим разрядом'},
      {name: 'Электрический щит', type: 'defense', description: 'Создаёт поле статического электричества, поражающее атакующих'},
    ]
  };
  
  // Генератор уникальных способностей для нестандартных вводов
  const generateUniqueAbility = (characterClass: string, element: string): Ability => {
    // Комбинируем класс и стихию для создания уникальной способности
    const adjectives = ['мощный', 'таинственный', 'древний', 'мистический', 'скрытый', 'разрушительный', 'священный'];
    const actions = ['удар', 'взрыв', 'поток', 'вихрь', 'волна', 'призыв', 'печать', 'разлом'];
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    return {
      name: `${adj.charAt(0).toUpperCase() + adj.slice(1)} ${action} ${element}`,
      description: `Уникальная техника ${characterClass}, объединяющая силу ${element} с мастерством владельца`,
      type: Math.random() > 0.6 ? 'attack' : (Math.random() > 0.5 ? 'defense' : 'support'),
      element: elementLower
    };
  };
  
  // Проверяем наличие класса в словаре
  let classAbilitiesList = classAbilities[classLower] || [];
  if (classAbilitiesList.length === 0) {
    // Если класс не найден, генерируем случайные базовые способности
    classAbilitiesList = [
      {name: `Мастерство ${characterClass}`, type: 'attack', description: `Особая техника атаки, доступная только ${characterClass}`},
      {name: `Защитная техника ${characterClass}`, type: 'defense', description: 'Уникальный способ защиты, основанный на тренировках'},
      {name: `Фирменный приём ${characterClass}`, type: 'support', description: 'Особый навык, передающийся от учителя к ученику'},
    ];
  }
  
  // Добавляем базовые способности класса
  for (const abilityData of classAbilitiesList) {
    abilities.push({
      ...abilityData,
      element: elementLower,
      name: abilityData.name || '',
      description: abilityData.description || '',
      type: abilityData.type as 'attack' | 'defense' | 'support',
    });
  }
  
  // Добавляем способности стихии
  let elementAbilitiesList = elementModifiers[elementLower] || [];
  if (elementAbilitiesList.length === 0) {
    // Если стихия не найдена, генерируем уникальные способности для этой стихии
    elementAbilitiesList = [
      {name: `Власть над ${element}`, type: 'attack', description: `Контролирует силы ${element} для нанесения урона`},
      {name: `Защита ${element}`, type: 'defense', description: `Использует энергию ${element} для создания защитного барьера`}
    ];
  }
  
  for (const abilityData of elementAbilitiesList) {
    abilities.push({
      ...abilityData,
      element: elementLower,
      name: abilityData.name || '',
      description: abilityData.description || '',
      type: abilityData.type as 'attack' | 'defense' | 'support',
    });
  }
  
  // Добавляем одну уникальную комбинированную способность
  abilities.push(generateUniqueAbility(characterClass, element));
  
  // Возвращаем до 5 случайных способностей из сгенерированных
  return abilities
    .sort(() => 0.5 - Math.random())
    .slice(0, 5)
    .map((ability, index) => ({
      ...ability,
      name: ability.name.charAt(0).toUpperCase() + ability.name.slice(1),
    }));
};

// Функция для генерации случайного монстра
const generateMonster = (): Monster => {
  const monsterTypes = [
    'Слизень', 'Огр', 'Дракон', 'Зомби', 'Вампир', 
    'Оборотень', 'Скелет', 'Призрак', 'Гоблин', 'Тролль'
  ];
  
  const type = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
  const hp = Math.floor(Math.random() * 50) + 50; // от 50 до 100 HP
  const attack = Math.floor(Math.random() * 10) + 5; // от 5 до 15 атаки
  
  return {
    name: `${type} ${Math.floor(Math.random() * 100)}`,
    hp,
    attack,
    description: `Злобный ${type.toLowerCase()}, жаждущий победы над капибарами.`,
    imageUrl: `https://source.unsplash.com/random/200x200/?monster,${type.toLowerCase()}`
  };
};

const CharacterCreator = () => {
  const [character, setCharacter] = useState<Character>({
    name: '',
    race: '',
    class: '',
    element: '',
    description: '',
    avatarUrl: '',
    abilities: []
  });
  
  const [monster, setMonster] = useState<Monster | null>(null);
  const [gameState, setGameState] = useState<'creation' | 'battle'>('creation');
  const [abilitiesGenerated, setAbilitiesGenerated] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCharacter(prev => ({ ...prev, [name]: value }));
    
    // Сбрасываем сгенерированные способности при изменении класса или стихии
    if (name === 'class' || name === 'element') {
      setAbilitiesGenerated(false);
    }
  };

  const selectAvatar = (url: string) => {
    setCharacter(prev => ({ ...prev, avatarUrl: url }));
  };
  
  const generateCharacterAbilities = () => {
    if (!character.class || !character.element) {
      alert('Пожалуйста, укажите класс и стихию персонажа');
      return;
    }
    
    const abilities = generateAbilities(character.class, character.element);
    setCharacter(prev => ({ ...prev, abilities }));
    setAbilitiesGenerated(true);
  };

  const createCharacter = () => {
    if (!character.name || !character.race) {
      alert('Пожалуйста, заполните имя и расу персонажа');
      return;
    }
    
    if (character.race.toLowerCase() === 'капибара' && !character.avatarUrl) {
      alert('Выберите аватарку для вашей капибары');
      return;
    }
    
    if (!character.class || !character.element) {
      alert('Пожалуйста, укажите класс и стихию персонажа');
      return;
    }
    
    if (!abilitiesGenerated) {
      alert('Пожалуйста, сгенерируйте способности для вашего персонажа');
      return;
    }
    
    // Создаем монстра для битвы
    setMonster(generateMonster());
    setGameState('battle');
  };

  const resetGame = () => {
    setCharacter({
      name: '',
      race: '',
      class: '',
      element: '',
      description: '',
      avatarUrl: '',
      abilities: []
    });
    setMonster(null);
    setGameState('creation');
    setAbilitiesGenerated(false);
  };

  return (
    <>
      {gameState === 'creation' ? (
        <Card className="shadow-lg border-amber-200">
          <CardHeader className="bg-amber-100">
            <CardTitle className="text-2xl text-amber-800">Создание персонажа</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя персонажа</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Введите имя" 
                value={character.name}
                onChange={handleInputChange}
                className="border-amber-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="race">Раса персонажа</Label>
              <Input 
                id="race" 
                name="race" 
                placeholder="Введите расу (например, капибара)" 
                value={character.race}
                onChange={handleInputChange}
                className="border-amber-200"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class">Класс персонажа</Label>
                <Input 
                  id="class" 
                  name="class" 
                  placeholder="Маг, воин, или свой класс" 
                  value={character.class}
                  onChange={handleInputChange}
                  className="border-amber-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="element">Стихия персонажа</Label>
                <Input 
                  id="element" 
                  name="element" 
                  placeholder="Огонь, вода, или своя стихия" 
                  value={character.element}
                  onChange={handleInputChange}
                  className="border-amber-200"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Описание персонажа</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Опишите вашего персонажа" 
                value={character.description}
                onChange={handleInputChange}
                className="min-h-24 border-amber-200"
              />
            </div>
            
            {character.race.toLowerCase() === 'капибара' && (
              <div className="space-y-3">
                <Label>Выберите аватарку для капибары</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {capibaraAvatars.map(avatar => (
                    <div 
                      key={avatar.id} 
                      className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all
                        ${character.avatarUrl === avatar.url 
                          ? 'border-amber-500 scale-105 shadow-md' 
                          : 'border-transparent hover:border-amber-300'}`}
                      onClick={() => selectAvatar(avatar.url)}
                    >
                      <img 
                        src={avatar.url} 
                        alt={avatar.description} 
                        className="w-full h-48 object-cover"
                      />
                      <p className="text-sm p-2 text-center bg-amber-50">{avatar.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {character.class && character.element && (
              <div className="space-y-3 p-4 bg-amber-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <Label>Способности персонажа</Label>
                  <Button
                    onClick={generateCharacterAbilities}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    size="sm"
                  >
                    Сгенерировать способности
                  </Button>
                </div>
                
                {abilitiesGenerated && character.abilities.length > 0 && (
                  <div className="space-y-3 mt-3">
                    {character.abilities.map((ability, index) => (
                      <div 
                        key={index} 
                        className="p-3 bg-white rounded-lg shadow border border-amber-100"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-amber-800">{ability.name}</h3>
                          <Badge className={
                            ability.type === 'attack' ? 'bg-red-500' : 
                            ability.type === 'defense' ? 'bg-blue-500' : 'bg-green-500'
                          }>
                            {ability.type === 'attack' ? 'Атака' : 
                             ability.type === 'defense' ? 'Защита' : 'Поддержка'}
                          </Badge>
                        </div>
                        <p className="text-gray-700">{ability.description}</p>
                        {ability.element && (
                          <Badge variant="outline" className="mt-2 border-amber-300">
                            Стихия: {ability.element}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
          </CardContent>
          <CardFooter className="flex justify-center bg-amber-50 py-4">
            <Button 
              onClick={createCharacter}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8"
              disabled={!abilitiesGenerated}
            >
              Создать персонажа и начать битву
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <BattleArena 
          character={character} 
          monster={monster!} 
          onReset={resetGame} 
        />
      )}
    </>
  );
};

export default CharacterCreator;
