
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BattleArena from '@/components/BattleArena';

// Типы для нашего приложения
type Character = {
  name: string;
  race: string;
  description: string;
  avatarUrl: string;
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
    description: '',
    avatarUrl: ''
  });
  
  const [monster, setMonster] = useState<Monster | null>(null);
  const [gameState, setGameState] = useState<'creation' | 'battle'>('creation');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCharacter(prev => ({ ...prev, [name]: value }));
  };

  const selectAvatar = (url: string) => {
    setCharacter(prev => ({ ...prev, avatarUrl: url }));
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
    
    // Создаем монстра для битвы
    setMonster(generateMonster());
    setGameState('battle');
  };

  const resetGame = () => {
    setCharacter({
      name: '',
      race: '',
      description: '',
      avatarUrl: ''
    });
    setMonster(null);
    setGameState('creation');
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
            
          </CardContent>
          <CardFooter className="flex justify-center bg-amber-50 py-4">
            <Button 
              onClick={createCharacter}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8"
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
