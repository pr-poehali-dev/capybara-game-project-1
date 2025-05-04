
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

// Типы для компонентов
type AbilityEffect = {
  type: 'damage' | 'dot' | 'stun' | 'heal' | 'buff' | 'debuff' | 'aoe';
  value: number;
  duration?: number;
};

type Ability = {
  name: string;
  description: string;
  type: 'attack' | 'defense' | 'support' | 'ultimate';
  element?: string;
  effect?: AbilityEffect;
  cooldown?: number;
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
  maxHp: number;
  attack: number;
  description: string;
  imageUrl: string;
  status?: {
    stunned?: boolean;
    dotDamage?: number;
    dotTurns?: number;
    debuff?: number;
  };
};

type BattleLog = {
  id: number;
  text: string;
  isPlayerAction: boolean;
  isSpecial?: boolean;
};

type BattleArenaProps = {
  character: Character;
  monster: Monster;
  onReset: () => void;
};

const getEffectDescription = (effect: AbilityEffect): string => {
  switch (effect.type) {
    case 'damage':
      return `наносит ${effect.value} урона`;
    case 'dot':
      return `наносит ${effect.value} урона каждый ход в течение ${effect.duration} ходов`;
    case 'stun':
      return `оглушает противника на ${effect.duration} ходов`;
    case 'heal':
      return `восстанавливает ${effect.value} единиц здоровья`;
    case 'buff':
      return `усиливает атаки на ${effect.value}% на ${effect.duration} ходов`;
    case 'debuff':
      return `снижает защиту противника на ${effect.value}% на ${effect.duration} ходов`;
    case 'aoe':
      return `наносит ${effect.value} урона по площади`;
    default:
      return 'производит неизвестный эффект';
  }
};

// Функция для генерации капибарской ультра-способности
const generateUltimateAbility = (character: Character): Ability => {
  // Выбираем базу для названия в зависимости от элемента
  const elementBasedNames: Record<string, string[]> = {
    'огонь': ['Огненная ярость', 'Извержение вулкана', 'Инферно'],
    'вода': ['Цунами', 'Ледяной шторм', 'Водоворот забвения'],
    'земля': ['Тектонический разлом', 'Метеоритный дождь', 'Каменная лавина'],
    'воздух': ['Ураганный вихрь', 'Грозовая буря', 'Смерч'],
    'молния': ['Шок и трепет', 'Гнев небес', 'Тысяча вольт'],
    'тьма': ['Вечная тьма', 'Поглощение душ', 'Теневое царство'],
    'свет': ['Божественное сияние', 'Луч возмездия', 'Очищающий свет'],
    'природа': ['Гнев природы', 'Цветение смерти', 'Зов предков']
  };

  // Выбираем элемент или используем стандартный
  const elementLower = character.element.toLowerCase();
  const namesArray = elementBasedNames[elementLower] || ['Супер-удар капибары', 'Гнев капибары', 'Капибариное возмездие'];
  
  const name = namesArray[Math.floor(Math.random() * namesArray.length)];
  const classEffect = character.class.toLowerCase() === 'маг' ? 'aoe' : 
                      character.class.toLowerCase() === 'целитель' ? 'heal' : 'damage';
  
  // Гораздо больший урон или эффект для ультимейта
  const ultimateEffect: AbilityEffect = {
    type: classEffect,
    value: classEffect === 'damage' ? 50 + Math.floor(Math.random() * 30) : 30,
    duration: classEffect === 'dot' || classEffect === 'stun' ? 3 : undefined
  };
  
  return {
    name,
    description: `Легендарная техника ${character.race} ${character.class}! ${getEffectDescription(ultimateEffect)}`,
    type: 'ultimate',
    element: elementLower,
    effect: ultimateEffect,
    cooldown: 2
  };
};

const BattleArena = ({ character, monster, onReset }: BattleArenaProps) => {
  const [currentMonster, setCurrentMonster] = useState<Monster>({
    ...monster,
    maxHp: monster.hp,
    status: {}
  });
  
  const [battleLogs, setBattleLogs] = useState<BattleLog[]>([
    { id: 1, text: `Битва началась! ${character.name} против ${monster.name}!`, isPlayerAction: false }
  ]);
  
  const [isMonsterDefeated, setIsMonsterDefeated] = useState(false);
  const [selectedAbility, setSelectedAbility] = useState<Ability | null>(null);
  const [ultimateAvailable, setUltimateAvailable] = useState(false);
  const [ultimateAbility, setUltimateAbility] = useState<Ability | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  
  // Проверяем возможность активации ультимейта
  useEffect(() => {
    const hpPercentage = (currentMonster.hp / currentMonster.maxHp) * 100;
    
    if (!isMonsterDefeated && hpPercentage <= 30 && !ultimateAvailable && !ultimateAbility) {
      // Генерируем ультимейт
      const ultimate = generateUltimateAbility(character);
      setUltimateAbility(ultimate);
      setUltimateAvailable(true);
      
      setBattleLogs(prev => [
        ...prev,
        {
          id: Date.now(),
          text: `⚡⚡⚡ ${character.name} чувствует прилив сил! Разблокирована ультимативная способность: ${ultimate.name}! ⚡⚡⚡`,
          isPlayerAction: false,
          isSpecial: true
        }
      ]);
    }
  }, [currentMonster.hp, currentMonster.maxHp, isMonsterDefeated, character]);
  
  const applyStatusEffects = () => {
    if (!currentMonster.status) return;
    
    let newHp = currentMonster.hp;
    let statusText = '';
    
    // Применяем damage over time
    if (currentMonster.status.dotDamage && currentMonster.status.dotTurns) {
      newHp -= currentMonster.status.dotDamage;
      statusText += `${currentMonster.name} получает ${currentMonster.status.dotDamage} урона от продолжительного эффекта. `;
      
      // Уменьшаем оставшиеся ходы эффекта
      currentMonster.status.dotTurns -= 1;
      if (currentMonster.status.dotTurns <= 0) {
        statusText += 'Эффект продолжительного урона заканчивается. ';
        currentMonster.status.dotDamage = 0;
        currentMonster.status.dotTurns = 0;
      }
    }
    
    if (statusText) {
      setBattleLogs(prev => [
        ...prev,
        {
          id: Date.now(),
          text: statusText,
          isPlayerAction: false
        }
      ]);
    }
    
    if (newHp <= 0) {
      newHp = 0;
      setIsMonsterDefeated(true);
      setBattleLogs(prev => [
        ...prev,
        {
          id: Date.now(),
          text: `${character.name} побеждает ${currentMonster.name} с помощью продолжительного эффекта!`,
          isPlayerAction: false
        }
      ]);
    }
    
    setCurrentMonster(prev => ({
      ...prev,
      hp: newHp
    }));
  };
  
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
    
    // Увеличиваем счетчик ходов
    setTurnCount(prev => prev + 1);
    
    let damage = 0;
    let logText = '';
    const ability = selectedAbility;
    const isUltimate = ability.type === 'ultimate';
    
    if (ability.effect) {
      switch (ability.effect.type) {
        case 'damage':
          damage = ability.effect.value;
          logText = `${character.name} использует ${ability.name} и наносит ${damage} урона!`;
          break;
        case 'dot':
          damage = Math.floor(ability.effect.value / 2); // Начальный урон
          setCurrentMonster(prev => ({
            ...prev,
            status: {
              ...prev.status,
              dotDamage: ability.effect.value,
              dotTurns: ability.effect.duration || 3
            }
          }));
          logText = `${character.name} использует ${ability.name}, нанося ${damage} урона и накладывая эффект ${getEffectDescription(ability.effect)}!`;
          break;
        case 'stun':
          damage = Math.floor(Math.random() * 10) + 5;
          setCurrentMonster(prev => ({
            ...prev,
            status: {
              ...prev.status,
              stunned: true
            }
          }));
          logText = `${character.name} использует ${ability.name}, оглушая ${currentMonster.name} на ${ability.effect.duration} ходов и нанося ${damage} урона!`;
          break;
        case 'debuff':
          damage = Math.floor(Math.random() * 8) + 3;
          setCurrentMonster(prev => ({
            ...prev,
            status: {
              ...prev.status,
              debuff: ability.effect.value
            }
          }));
          logText = `${character.name} использует ${ability.name}, ослабляя защиту ${currentMonster.name} на ${ability.effect.value}% и нанося ${damage} урона!`;
          break;
        case 'aoe':
          damage = ability.effect.value;
          logText = `${character.name} использует мощную АОЕ способность ${ability.name}, нанося ${damage} урона по большой области!`;
          break;
        default:
          // Стандартное поведение для других типов
          if (ability.type === 'attack') {
            damage = Math.floor(Math.random() * 20) + 15; // от 15 до 35 урона
            logText = `${character.name} использует ${ability.name} и наносит ${damage} урона!`;
          } else if (ability.type === 'defense') {
            damage = Math.floor(Math.random() * 10) + 5; // от 5 до 15 урона
            logText = `${character.name} применяет ${ability.name}, защищаясь и нанося ${damage} урона!`;
          } else {
            damage = Math.floor(Math.random() * 5) + 5; // от 5 до 10 урона
            logText = `${character.name} использует поддерживающую способность ${ability.name} и наносит ${damage} урона!`;
          }
      }
    } else {
      // Стандартное поведение для способностей без эффекта
      if (ability.type === 'attack') {
        damage = Math.floor(Math.random() * 20) + 15; // от 15 до 35 урона
        logText = `${character.name} использует ${ability.name} и наносит ${damage} урона!`;
      } else if (ability.type === 'defense') {
        damage = Math.floor(Math.random() * 10) + 5; // от 5 до 15 урона
        logText = `${character.name} применяет ${ability.name}, защищаясь и нанося ${damage} урона!`;
      } else if (ability.type === 'ultimate') {
        damage = Math.floor(Math.random() * 30) + 40; // от 40 до 70 урона для ультимейта без эффекта
        logText = `${character.name} активирует УЛЬТИМАТИВНУЮ способность ${ability.name} и наносит ${damage} ОГРОМНОГО урона!`;
      } else {
        damage = Math.floor(Math.random() * 5) + 5; // от 5 до 10 урона
        logText = `${character.name} использует поддерживающую способность ${ability.name} и наносит ${damage} урона!`;
      }
    }
    
    // Для ультимейта добавляем визуальные эффекты в лог
    if (isUltimate) {
      logText = `⚡🔥 ${logText} 🔥⚡`;
      setUltimateAvailable(false); // Использовали ультимейт
    }
    
    const newHp = Math.max(0, currentMonster.hp - damage);
    
    // Добавляем лог атаки
    setBattleLogs(prev => [
      ...prev, 
      { 
        id: Date.now(), 
        text: logText, 
        isPlayerAction: true,
        isSpecial: isUltimate
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
    
    // Применяем эффекты статусов после хода
    setTimeout(() => {
      applyStatusEffects();
    }, 300);
    
    // Монстр атакует в ответ, если не оглушен
    setTimeout(() => {
      if (currentMonster.status?.stunned) {
        setBattleLogs(prev => [
          ...prev, 
          { 
            id: Date.now() + 2, 
            text: `${currentMonster.name} оглушен и не может атаковать!`, 
            isPlayerAction: false 
          }
        ]);
        
        // Снимаем оглушение
        setCurrentMonster(prev => ({
          ...prev,
          status: {
            ...prev.status,
            stunned: false
          }
        }));
      } else {
        setBattleLogs(prev => [
          ...prev, 
          { 
            id: Date.now() + 2, 
            text: `${currentMonster.name} пытается атаковать ${character.name}, но безуспешно!`, 
            isPlayerAction: false 
          }
        ]);
      }
    }, 800);
  };
  
  const generateNewMonster = () => {
    const newMonster = { ...monster };
    newMonster.hp = Math.floor(Math.random() * 50) + 100; // Новый монстр с 100-150 HP
    newMonster.maxHp = newMonster.hp;
    newMonster.name = `${monster.name.split(' ')[0]} ${Math.floor(Math.random() * 100)}`;
    
    setCurrentMonster({
      ...newMonster,
      status: {}
    });
    setIsMonsterDefeated(false);
    setUltimateAvailable(false);
    setUltimateAbility(null);
    setTurnCount(0);
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
                
                {/* Ультимативная способность */}
                {ultimateAbility && (
                  <div 
                    className={`p-2 rounded-lg border cursor-pointer transition-all
                      ${selectedAbility === ultimateAbility 
                        ? 'border-amber-500 bg-amber-50 shadow' 
                        : 'border-amber-500 hover:border-amber-600'}
                      ${ultimateAvailable 
                        ? 'bg-gradient-to-r from-amber-50 to-yellow-50 animate-pulse' 
                        : 'opacity-50 cursor-not-allowed'}`}
                    onClick={() => ultimateAvailable ? setSelectedAbility(ultimateAbility) : null}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-800">{ultimateAbility.name}</span>
                      <Badge className="bg-purple-600">УЛЬТИМЕЙТ</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{ultimateAbility.description}</p>
                    {!ultimateAvailable && (
                      <div className="flex items-center mt-1 text-xs text-amber-700">
                        <AlertCircle size={12} className="mr-1" />
                        <span>Уже использовано</span>
                      </div>
                    )}
                  </div>
                )}
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
                <span className="text-red-700">{currentMonster.hp} / {currentMonster.maxHp}</span>
              </div>
              <Progress 
                value={(currentMonster.hp / currentMonster.maxHp) * 100} 
                className="h-2 bg-red-100" 
                indicatorClassName="bg-gradient-to-r from-red-400 to-red-600" 
              />
            </div>
            
            {/* Статусы монстра */}
            {currentMonster.status && (
              <div className="mt-3 w-full">
                {currentMonster.status.stunned && (
                  <Badge className="bg-blue-500 mr-1">Оглушен</Badge>
                )}
                {currentMonster.status.dotDamage && currentMonster.status.dotTurns && (
                  <Badge className="bg-green-600 mr-1">
                    Урон {currentMonster.status.dotDamage}/ход ({currentMonster.status.dotTurns} ходов)
                  </Badge>
                )}
                {currentMonster.status.debuff && (
                  <Badge className="bg-purple-500">Защита -{currentMonster.status.debuff}%</Badge>
                )}
              </div>
            )}
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
                log.isSpecial
                  ? 'bg-gradient-to-r from-amber-100 to-yellow-100 border-l-4 border-yellow-500 font-medium text-amber-800'
                  : log.isPlayerAction 
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
                className={`${
                  selectedAbility?.type === 'ultimate'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600'
                    : 'bg-amber-600 hover:bg-amber-700'
                } text-white px-8`}
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
