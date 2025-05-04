
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Типы для компонентов
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

type BattleLog = {
  id: number;
  text: string;
  isPlayerAction: boolean;
};

type BattleArenaProps = {
  character: Character;
  monster: Monster;
  onReset: () => void;
};

const BattleArena = ({ character, monster, onReset }: BattleArenaProps) => {
  const [currentMonster, setCurrentMonster] = useState<Monster>(monster);
  const [battleLogs, setBattleLogs] = useState<BattleLog[]>([
    { id: 1, text: `Битва началась! ${character.name} против ${monster.name}!`, isPlayerAction: false }
  ]);
  const [isMonsterDefeated, setIsMonsterDefeated] = useState(false);
  
  const attackMonster = () => {
    const damage = Math.floor(Math.random() * 20) + 10; // от 10 до 30 урона
    const newHp = Math.max(0, currentMonster.hp - damage);
    
    // Добавляем лог атаки
    setBattleLogs(prev => [
      ...prev, 
      { 
        id: Date.now(), 
        text: `${character.name} атакует ${currentMonster.name} и наносит ${damage} урона!`, 
        isPlayerAction: true 
      }
    ]);
    
    // Обновляем HP монстра
    setCurrentMonster(prev => ({
      ...prev,
      hp: newHp
    }));
    
    // Проверяем, победили ли монстра
    if (newHp === 0) {
      setBattleLogs(prev => [
        ...prev, 
        { 
          id: Date.now() + 1, 
          text: `${character.name} побеждает ${currentMonster.name}!`, 
          isPlayerAction: false 
        }
      ]);
      setIsMonsterDefeated(true);
      return;
    }
    
    // Монстр атакует в ответ
    setTimeout(() => {
      setBattleLogs(prev => [
        ...prev, 
        { 
          id: Date.now() + 2, 
          text: `${currentMonster.name} пытается атаковать ${character.name}, но безуспешно!`, 
          isPlayerAction: false 
        }
      ]);
    }, 500);
  };
  
  const generateNewMonster = () => {
    const newMonster = { ...monster };
    newMonster.hp = Math.floor(Math.random() * 50) + 100; // Новый монстр с 100-150 HP
    newMonster.name = `${monster.name.split(' ')[0]} ${Math.floor(Math.random() * 100)}`;
    
    setCurrentMonster(newMonster);
    setIsMonsterDefeated(false);
    setBattleLogs([
      { id: Date.now(), text: `Появляется новый враг: ${newMonster.name}!`, isPlayerAction: false }
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Карточка персонажа */}
        <Card className="shadow-lg border-amber-200">
          <CardHeader className="bg-amber-100">
            <CardTitle className="flex justify-between items-center">
              <span>{character.name}</span>
              <span className="text-sm font-normal">Раса: {character.race}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="mb-4 w-48 h-48 overflow-hidden rounded-full border-4 border-amber-300">
              {character.race.toLowerCase() === 'капибара' ? (
                <img 
                  src={character.avatarUrl} 
                  alt={character.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src={`https://source.unsplash.com/random/200x200/?${character.race.toLowerCase()}`} 
                  alt={character.name} 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <p className="text-center italic">{character.description || 'Непобедимый герой!'}</p>
            <div className="mt-4 w-full">
              <div className="flex justify-between mb-1">
                <span className="font-bold text-amber-700">HP</span>
                <span className="text-amber-700">∞</span>
              </div>
              <Progress value={100} className="h-2 bg-amber-100" indicatorClassName="bg-gradient-to-r from-amber-400 to-amber-600" />
            </div>
          </CardContent>
        </Card>
        
        {/* Карточка монстра */}
        <Card className={`shadow-lg ${isMonsterDefeated ? 'border-red-300 opacity-60' : 'border-red-200'}`}>
          <CardHeader className="bg-red-100">
            <CardTitle className="flex justify-between items-center">
              <span>{currentMonster.name}</span>
              <span className="text-sm font-normal">Злобный монстр</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="mb-4 w-48 h-48 overflow-hidden rounded-full border-4 border-red-300">
              <img 
                src={currentMonster.imageUrl} 
                alt={currentMonster.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-center italic">{currentMonster.description}</p>
            <div className="mt-4 w-full">
              <div className="flex justify-between mb-1">
                <span className="font-bold text-red-700">HP</span>
                <span className="text-red-700">{currentMonster.hp} / {monster.hp}</span>
              </div>
              <Progress 
                value={(currentMonster.hp / monster.hp) * 100} 
                className="h-2 bg-red-100" 
                indicatorClassName="bg-gradient-to-r from-red-400 to-red-600" 
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Боевые логи и кнопки действий */}
      <Card className="shadow-lg border-amber-200">
        <CardHeader className="bg-amber-100 py-3">
          <CardTitle className="text-lg">Боевые логи</CardTitle>
        </CardHeader>
        <CardContent className="max-h-60 overflow-y-auto p-4 bg-amber-50">
          {battleLogs.map(log => (
            <div 
              key={log.id} 
              className={`mb-2 p-2 rounded ${
                log.isPlayerAction 
                  ? 'bg-amber-100 border-l-4 border-amber-500' 
                  : 'bg-gray-100 border-l-4 border-gray-400'
              }`}
            >
              {log.text}
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex gap-4 justify-center bg-amber-50 py-4">
          {isMonsterDefeated ? (
            <>
              <Button 
                onClick={generateNewMonster}
                className="bg-amber-600 hover:bg-amber-700 text-white px-8"
              >
                Сразиться с новым монстром
              </Button>
              <Button
                onClick={onReset}
                variant="outline"
                className="border-amber-600 text-amber-700 hover:bg-amber-100"
              >
                Создать нового персонажа
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={attackMonster}
                className="bg-amber-600 hover:bg-amber-700 text-white px-8"
              >
                Атаковать монстра
              </Button>
              <Button
                onClick={onReset}
                variant="outline"
                className="border-amber-600 text-amber-700 hover:bg-amber-100"
              >
                Отступить и создать нового персонажа
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default BattleArena;
