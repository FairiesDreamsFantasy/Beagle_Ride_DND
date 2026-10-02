/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PlayArea from './System/UI/Play_Area/index';
import BeagleSelectionScreen from './System/UI/Beagle_Selection_Screen/index';
import { CharacterSelectionScreen } from './System/UI/Character_Selection_Screen/index';
import { LandingPage } from './System/UI/Landing_Page/index';
import { GameState, BeagleId, RiderId, GameSettings } from './types';
import { soundEngine } from './System/Sound/index';
import { DefaultGameSettings } from './System/Registry/Config/index';

/**
 * App.tsx Application Entry Point & Core Router
 */
export const AppSecurityMetadata = Object.freeze({
  isProtected: true,
  protectionFactor: 'Standard',
  mandate: 'Full Core Engine',
  version: '1.0.0'
});

export default function App() {
  const [gameState, setGameState] = useState<GameState>('LANDING');
  const [selectedBeagle, setSelectedBeagle] = useState<BeagleId>('JETTA');
  const [selectedRider, setSelectedRider] = useState<RiderId>('FAIRY_RIDER');
  const [settings, setSettings] = useState<GameSettings>({
    ...DefaultGameSettings,
    selectedBeagle: 'JETTA',
    selectedRider: 'FAIRY_RIDER'
  });

  // Keep settings synced with character selections
  const updateSettingsWithCharacters = (beagleId: BeagleId, riderId: RiderId) => {
    setSettings(prev => ({
      ...prev,
      selectedBeagle: beagleId,
      selectedRider: riderId
    }));
  };

  return (
    <AnimatePresence mode="wait">
      {gameState === 'LANDING' && (
        <LandingPage 
          onStart={() => setGameState('CHARACTER_SELECTION')}
        />
      )}

      {gameState === 'CHARACTER_SELECTION' && (
        <motion.div
          key="character-selection"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="min-h-screen"
        >
          <CharacterSelectionScreen 
            selectedRiderId={selectedRider}
            onSelect={(id) => {
              setSelectedRider(id);
              updateSettingsWithCharacters(selectedBeagle, id);
              soundEngine.playSfx(13);
            }}
            onNext={() => {
              soundEngine.playSfx(12);
              setGameState('BEAGLE_SELECTION');
            }}
          />
        </motion.div>
      )}

      {gameState === 'BEAGLE_SELECTION' && (
        <motion.div
          key="selection"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen"
        >
          <BeagleSelectionScreen onSelect={(id) => {
            setSelectedBeagle(id);
            updateSettingsWithCharacters(id, selectedRider);
            setGameState('PLAYING');
          }} />
        </motion.div>
      )}

      {gameState === 'PLAYING' && (
        <PlayArea 
          key="play" 
          selectedBeagle={selectedBeagle}
          selectedRider={selectedRider}
          settings={settings}
          onUpdateSettings={setSettings}
          onBack={() => setGameState('LANDING')} 
        />
      )}
    </AnimatePresence>
  );
}
