
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CharacterCreator from '@/components/CharacterCreator';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-6 text-center text-amber-800">Капибара против Монстров</h1>
        <p className="text-center mb-8 text-amber-700">Создай своего персонажа и сразись с монстрами!</p>
        
        <CharacterCreator />
      </div>
    </div>
  );
};

export default Index;
