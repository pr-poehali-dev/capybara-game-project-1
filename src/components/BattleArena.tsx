
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Типы для компонентов
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
  const [selectedAbility, setSelectedAbility] = useState<Ability | null>(null);
  
  const attackMonster = () => {
    if (!selectedAbility) {
      setBattleLogs(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          text: `Выберите способность для атаки!`, 
          isPlayerAction: false 
        }
      ]);
      return;
    }
    
    let damage = 0;
    let logText = '';
    
    // Различный урон в зависимости от типа способности
    if (selectedAbility.type === 'attack') {
      damage = Math.floor(Math.random() * 20) + 15; // от 15 до 35 урона
      logText = `${character.name} использует ${selectedAbility.name} и наносит ${damage} урона!`;
    } else if (selectedAbility.type === 'defense') {
      damage = Math.floor(Math.random() * 10) + 5; // от 5 до 15 урона
      logText = `${character.name} применяет ${selectedAbility.name}, защищаясь и нанося ${damage} урона!`;
    } else {
      damage = Math.floor(Math.random() * 5) + 5; // от 5 до 10 урона
      logText = `${character.name} использует поддерживающую способность ${selectedAbility.name} и наносит ${damage} урона!`;
    }
    
    const newHp = Math.max(0, currentMonster.hp - damage);
    
    // Добавляем лог атаки
    setBattleLogs(prev => [
      ...prev, 
      { 
        id: Date.now(), 
        text: logText, 
        isPlayerAction: true 
      }
    ]);
    
    // Обновляем HP монстра
    setCurrentMonster(prev => ({
      ...prev,
      hp: newHp
    }));
    
    // Сбрасываем выбранную способность
    setSelectedAbility(null);
    
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
              <div className="flex gap-2">
                <Badge variant="outline" className="border-amber-500">
                  {character.race}
                </Badge>
                <Badge variant="secondary" className="bg-amber-300">
                  {character.class}
                </Badge>
              </div>
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
            <Badge className="mt-2 bg-gradient-to-r from-amber-400 to-amber-600">
              Стихия: {character.element}
            </Badge>
            
            <div className="mt-4 w-full">
              <div className="flex justify-between mb-1">
                <span className="font-bold text-amber-700">HP</span>
                <span className="text-amber-700">∞</span>
              </div>
              <Progress value={100} className="h-2 bg-amber-100" indicatorClassName="bg-gradient-to-r from-amber-400 to-amber-600" />
            </div>
            
            {/* Способности персонажа */}
            <div className="mt-4 w-full">
              <h3 className="font-bold text-amber-800 mb-2">Способности</h3>
              <div className="grid grid-cols-1 gap-2">
                {character.abilities.map((ability, index) => (
                  <div 
                    key={index}
                    className={`p-2 rounded-lg border cursor-pointer transition-all
                      ${selectedAbility === ability 
                        ? 'border-amber-500 bg-amber-50 shadow' 
                        : 'border-gray-200 hover:border-amber-300'}`}
                    onClick={() => setSelectedAbility(ability)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{ability.name}</span>
                      <Badge className={
                        ability.type === 'attack' ? 'bg-red-500' : 
                        ability.type === 'defense' ? 'bg-blue-500' : 'bg-green-500'
                      }>
                        {ability.type === 'attack' ? 'Атака' : 
                         ability.type === 'defense' ? 'Защита' : 'Поддержка'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{ability.description}</p>
                  </div>
                ))}
              </div>
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
                disabled={!selectedAbility}
              >
                {selectedAbility 
                  ? `Использовать ${selectedAbility.name}` 
                  : 'Выберите способность'}
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
