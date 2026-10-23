/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  Compass as CompassIcon, 
  Sparkles, 
  Maximize2, 
  MapPin, 
  AudioLines,
  Dog,
  Keyboard,
  Info
} from 'lucide-react';
import { soundEngine, SFX_VOICES, BGM_VOICES } from '../../Sound/index';
import KeyboardCommandsModal from '../Modal/Keyboard_Commands/index';
import { Position, HandState, GameSettings, BeagleId, RiderId, BeagleSpecs, RiderSpecs } from '../../../types';
import { BeagleRegistry, CharacterInteractionEngine } from '../../Registry/Character/index';
import { RiderRegistry } from '../../Registry/Character/Rider/index';
import { DefaultGameSettings, GameConfig } from '../../Registry/Config/index';
import { MovementEngine, PhysicsEngine } from '../../Engine/index';
import { accessibilityGeneral } from '../../Accessibility/index';
import { WorldRegistry } from '../../Registry/Building_Blocks/World/index';
import { MenuBar } from '../../Components/Menu_Bar/index';
import { generateTempleMaze, isTempleWallAt, TempleMazeData } from './templeMaze';

interface PlayAreaProps {
  onBack: () => void;
  selectedBeagle: BeagleId;
  selectedRider: RiderId;
  settings: GameSettings;
  onUpdateSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  key?: string;
}

export default function PlayArea({ onBack, selectedBeagle, selectedRider, settings, onUpdateSettings: setSettings }: PlayAreaProps) {
  const currentBeagleSpecs = BeagleRegistry.find(b => b.id === selectedBeagle) || BeagleRegistry[0];
  const currentRiderSpecs = RiderRegistry.find(r => r.id === selectedRider) || RiderRegistry[0];

  const barkBeagle = () => {
    const state = stateRef.current;
    const res = CharacterInteractionEngine.evaluateBark(currentBeagleSpecs);
    state.barkTimer = res.durationFrames;
    soundEngine.playSfx(res.sfxId, state.room === 'TEMPLE' ? 'TEMPLE' : (state.room === 'FOYER' ? 'HALLWAY' : 'NONE'), state.room, res.pitchModifier);
    if (state.settings.barkNotificationsEnabled) {
      speak(res.text);
    }
  };

  const petBeagle = () => {
    const state = stateRef.current;
    state.handState = 'PETTING';
    const res = CharacterInteractionEngine.evaluatePetting(currentBeagleSpecs);
    state.petTimer = res.durationFrames;
    soundEngine.playSfx(res.sfxId, state.room === 'TEMPLE' ? 'TEMPLE' : (state.room === 'FOYER' ? 'HALLWAY' : 'NONE'), state.room, res.pitchMultiplier);
    if (state.settings.pettingDescriptionsEnabled) {
      speak(res.text);
    }
  };

  const graspCollar = () => {
    const state = stateRef.current;
    const res = CharacterInteractionEngine.evaluateCollarGrasp(currentBeagleSpecs, state.handState);
    state.handState = res.nextHandState;
    soundEngine.playSfx(res.sfxId, state.room === 'TEMPLE' ? 'TEMPLE' : (state.room === 'FOYER' ? 'HALLWAY' : 'NONE'), state.room);
    if (state.settings.collarGraspDescriptionsEnabled) {
      speak(res.text);
    }
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Display status states (synchronized periodically from core loop)
  const [uiPosition, setUiPosition] = useState<Position>({
    x: 400,
    y: 400,
    direction: 'NORTH',
    angle: 0
  });
  const [uiJumpZ, setUiJumpZ] = useState(0);
  const [uiHandState, setUiHandState] = useState<HandState>('DEFAULT');
  const [uiBarking, setUiBarking] = useState(false);
  const [uiViewMode, setUiViewMode] = useState<'POV' | 'RIDER'>('POV');

  // Update UI display status periodically (every few frames) to reduce React overhead
  const syncUiState = () => {
    const state = stateRef.current;
    setUiPosition({
      x: state.x,
      y: state.y,
      direction: getDirectionName(state.targetAngle) as any,
      angle: state.targetAngle
    });
    setUiJumpZ(state.jumpZ);
    setUiHandState(state.handState);
    setUiBarking(state.barkTimer > 0);
    setUiViewMode(state.viewMode);
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentRoom, setCurrentRoom] = useState<'FOYER' | 'GARDEN' | 'PORCH' | 'TEMPLE'>('FOYER');
  const [isLeaning, setIsLeaning] = useState(false);
  const [isKeyboardModalOpen, setIsKeyboardModalOpen] = useState(false);

  // Core physics & game state referenced inside requestAnimationFrame loop to prevent react lag
  const stateRef = useRef({
    frameCounter: 0,
    x: 400,
    y: 400,
    targetAngle: 0,
    currentAngle: 0,
    isMovingForward: false,
    isMovingBackward: false,
    isShiftPressed: false,
    upKeyStartTime: 0,
    isBursting: false,
    burstTimer: 0,
    isLeaning: false,
    jumpZ: 0,
    jumpVelocity: 0,
    bobFrame: 0,
    handState: 'DEFAULT' as HandState,
    barkTimer: 0,
    petTimer: 0,
    collarTimer: 0,
    lastZPressTime: 0,
    lastAPressTimes: [] as number[],
    room: 'FOYER' as 'FOYER' | 'GARDEN' | 'PORCH' | 'TEMPLE',
    templeMaze: generateTempleMaze(),
    selectedBeagle: selectedBeagle,
    selectedRider: selectedRider,
    viewMode: 'POV' as 'POV' | 'RIDER',
    settings: {
      ...DefaultGameSettings,
      selectedBeagle: selectedBeagle,
      selectedRider: selectedRider
    }
  });

  // Keep refs synchronized to prevent stale closures in event handlers
  useEffect(() => {
    stateRef.current.settings = settings;
    stateRef.current.selectedBeagle = settings.selectedBeagle;
  }, [settings]);

  useEffect(() => {
    stateRef.current.isLeaning = isLeaning;
  }, [isLeaning]);

  // Pure built-in accessibility speech synthesizer
  const speak = (text: string, force = false) => {
    if (!stateRef.current.settings.ttsEnabled && !force) return;
    accessibilityGeneral.speak(text, force);
  };

  // Keyboard events
  useEffect(() => {
    const state = stateRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is in menu bar or any input
      if (document.activeElement?.closest('#Menu_Bar') || ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) {
        return;
      }

      // Safely resume AudioContext on key press
      soundEngine.resume();

      // Screen-reader standard: Pressing Control immediately silences speech
      if (e.key === 'Control') {
        accessibilityGeneral.silence();
        return;
      }

      if (e.key === 'Shift') {
        state.isShiftPressed = true;
      }

      if (e.repeat) {
        e.preventDefault();
        return;
      }
      const key = e.key.toLowerCase();

      // Shift-Z-Z double tap toggles TTS on/off
      if (e.key === 'z' || e.key === 'Z') {
        if (e.shiftKey) {
          const now = Date.now();
          if (now - state.lastZPressTime < 1000) {
            setSettings(prev => {
              const newVal = !prev.ttsEnabled;
              // Play double beep chime to acknowledge state switch
              if (newVal) {
                soundEngine.playSfx(12);
              } else {
                soundEngine.playSfx(1);
              }
              setTimeout(() => {
                const speechText = newVal ? "Voice assistance enabled." : "Voice assistance disabled.";
                if (window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                  const mutt = new SpeechSynthesisUtterance(speechText);
                  window.speechSynthesis.speak(mutt);
                }
              }, 150);
              return { ...prev, ttsEnabled: newVal };
            });
            state.lastZPressTime = 0;
            e.preventDefault();
            return;
          } else {
            state.lastZPressTime = now;
          }
        }
      }

      // Handle other main gameplay keys
      switch (e.key) {
        case 'ArrowUp':
          if (!state.isMovingForward) {
            state.upKeyStartTime = Date.now();
          }
          state.isMovingForward = true;
          e.preventDefault();
          break;
        case 'ArrowDown':
          state.isMovingBackward = true;
          e.preventDefault();
          break;
        case 'ArrowLeft': {
          // Turn left to previous cardinal direction
          state.targetAngle = (state.targetAngle - 90 + 360) % 360;
          if (state.settings.turningTonesEnabled) {
            soundEngine.playSfx(12, state.room === 'TEMPLE' ? 'TEMPLE' : (state.room === 'FOYER' ? 'HALLWAY' : 'NONE'), state.room);
          }
          const rawDir = getDirectionName(state.targetAngle);
          speak(rawDir.charAt(0).toUpperCase() + rawDir.slice(1).toLowerCase());
          e.preventDefault();
          break;
        }
        case 'ArrowRight': {
          // Turn right to next cardinal direction
          state.targetAngle = (state.targetAngle + 90) % 360;
          if (state.settings.turningTonesEnabled) {
            soundEngine.playSfx(12, state.room === 'TEMPLE' ? 'TEMPLE' : (state.room === 'FOYER' ? 'HALLWAY' : 'NONE'), state.room);
          }
          const rawDir = getDirectionName(state.targetAngle);
          speak(rawDir.charAt(0).toUpperCase() + rawDir.slice(1).toLowerCase());
          e.preventDefault();
          break;
        }
        case ' ': // Space jump
          if (state.jumpZ === 0) {
            state.jumpZ = 0.01;
            state.jumpVelocity = GameConfig.physics.jumpInitialVelocity;
            soundEngine.playSfx(3, state.room === 'TEMPLE' ? 'TEMPLE' : (state.room === 'FOYER' ? 'HALLWAY' : 'NONE'), state.room); // Swoosh
          }
          e.preventDefault();
          break;
        case '!': { // Shift-1
          const nextVal = !state.settings.barkNotificationsEnabled;
          setSettings(prev => ({ ...prev, barkNotificationsEnabled: nextVal }));
          soundEngine.playSfx(12, state.room === 'TEMPLE' ? 'TEMPLE' : (state.room === 'FOYER' ? 'HALLWAY' : 'NONE'), state.room);
          speak(`Bark notification is now ${nextVal ? 'on' : 'off'}.`, true);
          e.preventDefault();
          break;
        }
        case '@': { // Shift-2
          const nextVal = !state.settings.jumpNotificationsEnabled;
          setSettings(prev => ({ ...prev, jumpNotificationsEnabled: nextVal }));
          soundEngine.playSfx(12, state.room === 'TEMPLE' ? 'TEMPLE' : (state.room === 'FOYER' ? 'HALLWAY' : 'NONE'), state.room);
          speak(`Jump notification is now ${nextVal ? 'on' : 'off'}.`, true);
          e.preventDefault();
          break;
        }
        case '&': { // Shift-7
          const nextVal = !state.settings.paused;
          setSettings(prev => ({ ...prev, paused: nextVal }));
          soundEngine.playSfx(12);
          speak(nextVal ? "Game Paused." : "Game Resumed.");
          e.preventDefault();
          break;
        }
        case '1':
        case '2':
        case '7':
          // Explicitly removed these as single-key commands per user request
          e.preventDefault();
          break;
        case 'l':
        case 'L': {
          const nextVal = !state.isLeaning;
          state.isLeaning = nextVal;
          setIsLeaning(nextVal);
          // Refined single tone lean sound
          soundEngine.playSfx(13);
          if (state.settings.leaningDescriptionsEnabled) {
            speak(nextVal ? "Leaning forward." : "Returned to upright position.");
          }
          e.preventDefault();
          break;
        }
        case 'a':
        case 'A': {
          const now = Date.now();
          state.lastAPressTimes.push(now);
          if (state.lastAPressTimes.length > 3) {
            state.lastAPressTimes.shift();
          }
          if (state.lastAPressTimes.length === 3) {
            const first = state.lastAPressTimes[0];
            const last = state.lastAPressTimes[2];
            if (last - first < 1000) {
              state.lastAPressTimes = [];
              const placeName = state.room === 'FOYER' ? 'Foyer' : (state.room === 'GARDEN' ? 'Garden' : (state.room === 'PORCH' ? 'Front Porch' : 'Temple of Hayana'));
              const direction = getDirectionName(state.targetAngle);
              const dirTitleCase = direction.charAt(0).toUpperCase() + direction.slice(1).toLowerCase();
              speak(`You are at ${Math.round(state.x)}, ${Math.round(state.y)} of ${placeName}, facing ${dirTitleCase}.`, true);
            }
          }
          e.preventDefault();
          break;
        }
        case 's':
        case 'S':
          barkBeagle();
          break;
        case 'p':
        case 'P':
          petBeagle();
          break;
        case 'c':
        case 'C':
          graspCollar();
          break;
        case 't':
        case 'T':
          state.viewMode = state.viewMode === 'POV' ? 'RIDER' : 'POV';
          speak(`View switched to ${state.viewMode === 'POV' ? 'Scientific POV' : 'Rider View'}.`);
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Ignore if focus is in menu bar or any input
      if (document.activeElement?.closest('#Menu_Bar') || ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) {
        return;
      }

      const state = stateRef.current;
      if (e.key === 'Shift') {
        state.isShiftPressed = false;
      }
      switch (e.key) {
        case 'ArrowUp':
          if (state.isMovingForward) {
            const duration = Date.now() - state.upKeyStartTime;
            if (duration < 200) { // Short tap threshold
              state.isBursting = true;
              state.burstTimer = 12; // 12 frames of precision burst
            }
          }
          state.isMovingForward = false;
          e.preventDefault();
          break;
        case 'ArrowDown':
          state.isMovingBackward = false;
          e.preventDefault();
          break;
        default:
          break;
      }
    };

    const handleWindowClick = () => {
      soundEngine.resume();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('click', handleWindowClick);

    speak(
      "Simulation initialized. RidePOV Active.",
      true
    );

    // Set up volume and master status
    soundEngine.setVolume(settings.volume);
    soundEngine.setMute(settings.isMuted);
    // soundEngine.startBGM(settings.activeBgmVoice); // Default BGM disabled: background music is not needed yet.

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('click', handleWindowClick);
      soundEngine.stopBGM();
    };
  }, []);

  // Update volume and instruments dynamically
  useEffect(() => {
    soundEngine.updateRoomAcoustics(currentRoom);
    soundEngine.setVolume(settings.volume);
    soundEngine.setMute(settings.isMuted);
    if (currentRoom === 'GARDEN') {
      if (!settings.isMuted) {
        soundEngine.startBGM(settings.activeBgmVoice);
      }
    } else {
      soundEngine.stopBGM();
    }
  }, [settings.volume, settings.isMuted, currentRoom, settings.activeBgmVoice]);

  const changeBgmTrack = (id: number) => {
    setSettings(prev => {
      const updated = { ...prev, activeBgmVoice: id };
      soundEngine.stopBGM();
      if (!updated.isMuted && currentRoom === 'GARDEN') {
        soundEngine.startBGM(id);
      }
      return updated;
    });
    soundEngine.playSfx(12);
    const placeWord = currentRoom === 'GARDEN' ? 'playing in Garden' : 'selected; music is silent';
    speak(`Synthesizer background music changed to track ${id + 1}: ${BGM_VOICES[id].name} (${placeWord})`);
  };

  const triggerSfxDemo = (id: number) => {
    soundEngine.playSfx(id);
    setSettings(prev => ({ ...prev, activeSfxVoice: id }));
    speak(`Synth voice ${id + 1}: ${SFX_VOICES[id].name}.`);
  };

  function getDirectionName(deg: number): string {
    const norm = ((deg % 360) + 360) % 360;
    if (norm === 0) return 'NORTH';
    if (norm === 90) return 'EAST';
    if (norm === 180) return 'SOUTH';
    if (norm === 270) return 'WEST';
    return 'NORTH';
  }

  // Animation and rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use 320x180 resolution for a beautiful authentic 2D pixelation scaling
    const renderWidth = 320;
    const renderHeight = 180;
    canvas.width = renderWidth;
    canvas.height = renderHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    let animFrameId: number;

    const floorTileSize = 40; // 40 feet tiles

    const updateAndDraw = () => {
      if (!isRunning) return;

      const state = stateRef.current;
      const currentRoomData = (WorldRegistry.rooms as any)[state.room];
      const currentSizeX = currentRoomData.width;
      const currentSizeY = currentRoomData.height;
      const foyerData = WorldRegistry.rooms.FOYER;
      const porchData = WorldRegistry.rooms.PORCH;

      if (state.settings.paused) {
        animFrameId = requestAnimationFrame(updateAndDraw);
        return;
      }

      // 1. Interpolate current yaw angle smoothly towards target cardinal direction
      let diff = state.targetAngle - state.currentAngle;
      while (diff < -180) diff += 360;
      while (diff > 180) diff -= 360;
      state.currentAngle += diff * 0.14; // Fluid panning

      // Normalize currentAngle to 0-360
      state.currentAngle = ((state.currentAngle % 360) + 360) % 360;

      // 2. Physics & movement velocity updates
      const rad = (state.currentAngle * Math.PI) / 180;
      let speedValue = state.isShiftPressed ? GameConfig.physics.gallopSpeed : GameConfig.physics.trotSpeed; // High-Fidelity Gallop vs Trot
      if (state.isBursting) {
        speedValue = GameConfig.physics.burstSpeed; // Precision navigation burst
      }

      let moved = false;
      let walkBob = 0;

      // Handle burst decay
      if (state.isBursting) {
        state.burstTimer--;
        if (state.burstTimer <= 0) {
          state.isBursting = false;
        }
      }

      // Check room bounds and portal transitions via MovementEngine (CCD + precision room measurements)
      const tryMove = (nx: number, ny: number) => {
        return MovementEngine.tryMove({
          currentX: state.x,
          currentY: state.y,
          nextX: nx,
          nextY: ny,
          room: state.room,
          templeMaze: state.templeMaze
        });
      };

      if (state.isMovingForward || state.isBursting) {
        const dirX = Math.sin(rad);
        const dirY = -Math.cos(rad);

        const nextX = state.x + dirX * speedValue;
        const nextY = state.y + dirY * speedValue;

        const res = tryMove(nextX, nextY);
        if (res.allowed) {
          if (res.transition) {
            state.room = res.transition;
            state.x = res.rx;
            state.y = res.ry;
            moved = true;
            state.isBursting = false; // Cancel burst on portal
            setCurrentRoom(res.transition);
            soundEngine.playSfx(14, res.transition === 'TEMPLE' ? 'TEMPLE' : (res.transition === 'FOYER' ? 'HALLWAY' : 'NONE'), res.transition);
            const transitionText = WorldRegistry.rooms[state.room].portalTexts[res.transition] || `Entered ${WorldRegistry.rooms[state.room].name}.`;
            speak(transitionText);
          } else {
            state.x = nextX;
            state.y = nextY;
            moved = true;
          }
        } else {
          state.isMovingForward = false;
          state.isBursting = false;
          soundEngine.playSfx(9, state.room === 'TEMPLE' ? 'TEMPLE' : (state.room === 'FOYER' ? 'HALLWAY' : 'NONE'), state.room);
          speak(WorldRegistry.rooms[state.room].wallHitText);
        }
      }

      if (state.isMovingBackward) {
        const dirX = Math.sin(rad);
        const dirY = -Math.cos(rad);

        const nextX = state.x - dirX * speedValue;
        const nextY = state.y - dirY * speedValue;

        const res = tryMove(nextX, nextY);
        if (res.allowed) {
          if (res.transition) {
            state.room = res.transition;
            state.x = res.rx;
            state.y = res.ry;
            moved = true;
            setCurrentRoom(res.transition);
            soundEngine.playSfx(14, res.transition === 'TEMPLE' ? 'TEMPLE' : (res.transition === 'FOYER' ? 'HALLWAY' : 'NONE'), res.transition);
            const transitionText = WorldRegistry.rooms[state.room].portalTexts.BACK || `Entered ${WorldRegistry.rooms[state.room].name}.`;
            speak(transitionText);
          } else {
            state.x = nextX;
            state.y = nextY;
            moved = true;
          }
        } else {
          state.isMovingBackward = false;
          soundEngine.playSfx(9, state.room === 'TEMPLE' ? 'TEMPLE' : (state.room === 'FOYER' ? 'HALLWAY' : 'NONE'), state.room);
          speak(WorldRegistry.rooms[state.room].wallHitText);
        }
      }

      // Bobbing calculations when trotting or galloping via PhysicsEngine
      if (moved) {
        const isGalloping = state.isShiftPressed;
        const stride = PhysicsEngine.evaluateStride(state.bobFrame, isGalloping);
        state.bobFrame = stride.nextBobFrame;
        walkBob = stride.walkBob;
        
        const getReverbProfile = (room: string) => {
          if (room === 'TEMPLE') return 'TEMPLE' as const;
          if (room === 'FOYER') return 'HALLWAY' as const;
          return 'NONE' as const;
        };
        const currentReverb = getReverbProfile(state.room);

        if (isGalloping) {
          // Gallop: trigger rapid 4-beat groupings at key intervals (calibrated to 400ms cycle)
          // Integrated High-Fidelity Gallop Scuff (SFX 17)
          if (stride.gallopCycleAdvanced) {
            soundEngine.playSfx(17, currentReverb, state.room); // Scuff impact
            soundEngine.playSfx(1, currentReverb, state.room);
            setTimeout(() => {
              if (stateRef.current.isMovingForward || stateRef.current.isMovingBackward || stateRef.current.isBursting) {
                soundEngine.playSfx(2, currentReverb, state.room);
                soundEngine.playSfx(17, currentReverb, state.room);
              }
            }, 60);
            setTimeout(() => {
              if (stateRef.current.isMovingForward || stateRef.current.isMovingBackward || stateRef.current.isBursting) {
                soundEngine.playSfx(1, currentReverb, state.room);
              }
            }, 120);
            setTimeout(() => {
              if (stateRef.current.isMovingForward || stateRef.current.isMovingBackward || stateRef.current.isBursting) {
                soundEngine.playSfx(2, currentReverb, state.room);
                soundEngine.playSfx(17, currentReverb, state.room);
              }
            }, 180);
          }
        } else if (stride.isStepTransition) {
          // Trot: steady alternating footsteps on stride transitions
          soundEngine.playSfx(stride.isLeftFoot ? 1 : 2, currentReverb, state.room);
        }
      } else {
        // Gentle settle
        state.bobFrame = 0;
      }

      // 3. Jump physics arc via PhysicsEngine
      if (state.jumpZ > 0) {
        const jumpRes = PhysicsEngine.evaluateJumpArc(state.jumpZ, state.jumpVelocity, GameConfig.physics.gravity);
        state.jumpZ = jumpRes.nextZ;
        state.jumpVelocity = jumpRes.nextVelocity;

        if (jumpRes.hasLanded) {
          const getReverbProfile = (room: string) => {
            if (room === 'TEMPLE') return 'TEMPLE' as const;
            if (room === 'FOYER') return 'HALLWAY' as const;
            return 'NONE' as const;
          };
          
          soundEngine.playSfx(4, getReverbProfile(state.room), state.room); // Soft padded landing thud
          if (state.settings.jumpNotificationsEnabled) {
            if (state.room === 'TEMPLE') {
              speak("Landed paddingly on chiseled temple flooring.");
            } else {
              speak("Landed paddingly on royal checked floor.");
            }
          }
        }
      }

      // Decent counters
      if (state.barkTimer > 0) state.barkTimer--;
      if (state.petTimer > 0) {
        state.petTimer--;
        if (state.petTimer === 0) {
          state.handState = 'DEFAULT';
        }
      }

      // Sync display state to triggers periodically to save CPU
      state.frameCounter++;
      if (state.frameCounter % 4 === 0) {
        syncUiState();
      }

      // --- 4. High-Fidelity 2.5D Perspective Scanning Floor and Ceiling Renderer ---
      // Utilizing mathematical virtualization and treating screen size as an optimized tool.
      const imgData = ctx.createImageData(renderWidth, renderHeight);
      const data32 = new Uint32Array(imgData.data.buffer);

      const lookRad = (state.currentAngle * Math.PI) / 180;
      const fov_scale = 130; // High-precision focal scale
      const cosLook = Math.cos(lookRad);
      const sinLook = Math.sin(lookRad);
      
      const horizon_offset = -walkBob + (state.jumpZ * 1.5); // Dynamic camera bounce tool
      const horizon = Math.floor(renderHeight / 2) + Math.floor(horizon_offset);

      // Rider's vertical elevation tool (shoulder height + jump height)
      const baseEyeHeight = currentRiderSpecs.eyeHeight;
      const riderEyeHeight = baseEyeHeight + (state.jumpZ * 0.45);

      for (let sy = 0; sy < renderHeight; sy++) {
        const dy = sy - horizon;
        if (dy === 0) continue; 

        const isFloor = sy > horizon;
        const ceilingHeightVal = state.room === 'TEMPLE' ? 15 : (state.room === 'PORCH' ? 9 : 30);
        const h = isFloor ? riderEyeHeight : (ceilingHeightVal - riderEyeHeight);
        const distance = (h * fov_scale) / Math.abs(dy);

        // Mathematical projection vectors
        const lookX = sinLook * distance;
        const lookY = -cosLook * distance;
        const spanX = cosLook * distance * 0.95;
        const spanY = sinLook * distance * 0.95;

        const worldX = state.x + lookX;
        const worldY = state.y + lookY;

        // Horizontal scanline optimization (Standard Definition tool)
        for (let sx = 0; sx < renderWidth; sx++) {
          const t = (sx - renderWidth / 2) / (renderWidth / 2);
          const rx = worldX + t * spanX;
          const ry = worldY + t * spanY;

          let color32 = 0xFF0B0B0B; 

          const isDoorGap = rx >= 395 && rx <= 405;

          // Boundary tiles collision zone (Outer black tiled walls)
          if (state.room === 'FOYER') {
            // Foyer room layout
            if (rx < 0 || rx > foyerData.width || ry < 0 || ry > foyerData.height) {
              // Out of bounds: could be looking into the Garden through north door
              if (ry < 0 && isDoorGap) {
                // Peek into Garden's grass floor/sky
                if (isFloor) {
                  const tx_g = Math.floor(rx / 20);
                  const ty_g = Math.floor(ry / 20);
                  const isAltGrass = (tx_g + ty_g) % 2 === 0;
                  color32 = isAltGrass ? 0xFF2D8A4E : 0xFF3CB063;
                } else {
                  // Beautiful Garden blue sky peeking in distance
                  if (sy > horizon - 20) {
                    color32 = 0xFFF2C299; // Cute light pastel blue
                  } else {
                    color32 = 0xFF0D0D0D; // Top lintel of door frame
                  }
                }
              } else if (ry > foyerData.height && isDoorGap) {
                // Peek into Front Porch's cedar wood deck floor through south door
                if (isFloor) {
                  const isPlankLine = Math.floor((ry - foyerData.height) / 10) % 2 === 0;
                  color32 = isPlankLine ? 0xFF1A222D : 0xFF0F141C;
                } else {
                  color32 = 0xFF0D0D0D; // Top lintel of door frame
                }
              } else {
                // Render foyer grand black wall borders
                const borderX = Math.abs(rx % 15) < 0.6;
                const borderY = Math.abs(ry % 15) < 0.6;
                color32 = (borderX || borderY) ? 0xFF242424 : 0xFF0D0D0D;
              }
            } else {
              // Inside Foyer
              if (isFloor) {
                const tx = Math.floor(rx / floorTileSize);
                const ty = Math.floor(ry / floorTileSize);
                const isBlueTile = (tx + ty) % 2 === 0;
                const borderX = Math.abs(rx % floorTileSize) < 1.2;
                const borderY = Math.abs(ry % floorTileSize) < 1.2;
                if (isBlueTile) {
                  color32 = (borderX || borderY) ? 0xFF9E5C1E : 0xFFCE8836;
                } else {
                  color32 = (borderX || borderY) ? 0xFF045F3C : 0xFF0BB174;
                }
              } else {
                const tx = Math.floor(rx / 80);
                const ty = Math.floor(ry / 80);
                const panelAlt = (tx + ty) % 2 === 0;
                color32 = panelAlt ? 0xFFE0EAEF : 0xFFCCE0EC;
              }
            }
          } else if (state.room === 'GARDEN') {
            // Garden room layout
            if (rx < 0 || rx > foyerData.width || ry < 0 || ry > foyerData.height) {
              // Out of bounds: could be looking back into Foyer through south door (ry > 800)
              if (ry > foyerData.height && isDoorGap) {
                if (isFloor) {
                  const tx_f = Math.floor(rx / floorTileSize);
                  const ty_f = Math.floor(ry / floorTileSize);
                  const isBlueTile = (tx_f + ty_f) % 2 === 0;
                  if (isBlueTile) {
                    color32 = 0xFFCE8836;
                  } else {
                    color32 = 0xFF0BB174;
                  }
                } else {
                  // Peeking into foyer champagne ceiling/wall through doorway
                  color32 = 0xFF0D0D0D;
                }
              } else {
                // Dense evergreen hedge boundary walls
                const tx_h = Math.floor(rx / 15);
                const ty_h = Math.floor(ry / 15);
                const isAltHedge = (tx_h + ty_h) % 2 === 0;
                color32 = isAltHedge ? 0xFF143B20 : 0xFF1B4E2B;
              }
            } else {
              // Inside Garden
              if (isFloor) {
                const tx = Math.floor(rx / 20);
                const ty = Math.floor(ry / 20);
                const isAltGrass = (tx + ty) % 2 === 0;
                
                // Scatter flowers procedurally via sinus mapping
                const seed = Math.sin(tx * 12.9898 + ty * 78.233) * 43758.5453;
                const hasFlower = (seed - Math.floor(seed)) < 0.05;
                if (hasFlower) {
                  const isPink = seed < 0.4;
                  color32 = isPink ? 0xFFC286FF : 0xFF8AE3FF; // Pink or gold flower spots
                } else {
                  color32 = isAltGrass ? 0xFF2D8A4E : 0xFF3CB063;
                }
              } else {
                // Outdoor sky: morning vertical gradient transitioning nicely
                const skyFactor = sy / horizon;
                const r_color = Math.floor(100 + (140 * skyFactor));
                const g_color = Math.floor(140 + (90 * skyFactor));
                const b_color = Math.floor(220 + (35 * skyFactor));
                color32 = 0xFF000000 | (b_color << 16) | (g_color << 8) | r_color;
              }
            }
          } else if (state.room === 'TEMPLE') {
            // Temple of Hayana: Size X [0, 2000], Y [0, 2000]
            const hitWall = isTempleWallAt(rx, ry, state.templeMaze);
            
            if (hitWall) {
              // High-contrast chiseled grey stone wall bricks (12-inch thick walls)
              const stoneX = Math.floor(rx / 15);
              const stoneY = Math.floor(ry / 15);
              const isStoneBorder = Math.abs(rx % 15) < 0.6 || Math.abs(ry % 15) < 0.6;
              if (isStoneBorder) {
                color32 = 0xFF14171D; // Dark joint shadow
              } else {
                // Procedural chiseled granite variation
                const stoneSeed = Math.sin(stoneX * 12.9898 + stoneY * 78.233) * 43758.5453;
                const seedFrac = stoneSeed - Math.floor(stoneSeed);
                if (seedFrac < 0.15) {
                  color32 = 0xFF2D3C34; // Mossy Granite
                } else if (seedFrac < 0.5) {
                  color32 = 0xFF3D4756; // Ash Slate Granite
                } else {
                  color32 = 0xFF4A5567; // Bright Granite
                }
              }
            } else {
              // Inside corridors or open temple chambers of Temple of Hayana
              if (isFloor) {
                // Solid stone tile flooring
                const tx = Math.floor(rx / 20);
                const ty = Math.floor(ry / 20);
                const isAltTile = (tx + ty) % 2 === 0;
                const borderX = Math.abs(rx % 20) < 1.0;
                const borderY = Math.abs(ry % 20) < 1.0;
                
                if (borderX || borderY) {
                  color32 = 0xFF14171B; // Joints
                } else {
                  color32 = isAltTile ? 0xFF2D333C : 0xFF21252B; // Dark solid flooring tiles
                }
              } else {
                // 15 feet high ceiling slabs
                const tx = Math.floor(rx / 40);
                const ty = Math.floor(ry / 40);
                const isAltCeil = (tx + ty) % 2 === 0;
                const borderX = Math.abs(rx % 40) < 1.2;
                const borderY = Math.abs(ry % 40) < 1.2;
                if (borderX || borderY) {
                  color32 = 0xFF101317;
                } else {
                  color32 = isAltCeil ? 0xFF1F252C : 0xFF171B20;
                }
              }
            }
          } else {
            // Front Porch room layout (state.room === 'PORCH')
            // Size: X [0, 800], Y [0, 200]
            if (rx < 0 || rx > porchData.width || ry < 0 || ry > porchData.height) {
              // Out of bounds: could be looking north back into Foyer through north door (ry < 0)
              if (ry < 0 && isDoorGap) {
                if (isFloor) {
                  // Foyer beautiful tiling
                  const tx_f = Math.floor(rx / floorTileSize);
                  const ty_f = Math.floor(ry / floorTileSize);
                  const isBlueTile = (tx_f + ty_f) % 2 === 0;
                  color32 = isBlueTile ? 0xFFCE8836 : 0xFF0BB174;
                } else {
                  color32 = 0xFF0D0D0D; // Top lintel of door frame
                }
              } else if (ry > porchData.height && rx >= 395 && rx <= 405) {
                // Peek south through centered gate on Front Porch into the Temple of Hayana!
                if (isFloor) {
                  // Temple's solid slate tiles
                  const tx_t = Math.floor(rx / 20);
                  const ty_t = Math.floor(ry / 20);
                  const isAltTile = (tx_t + ty_t) % 2 === 0;
                  color32 = isAltTile ? 0xFF2D333C : 0xFF21252B;
                } else {
                  // Glowing blue/gold magical gate portal lintel
                  if (sy > horizon - 30) {
                    color32 = 0xFFFFC04D; // Beautiful warm shining golden gate frame halo glow
                  } else {
                    color32 = 0xFF0D0D0D; // Top door lintel
                  }
                }
              } else {
                // outer boundaries of Front Porch: Columns and railings
                // white fluted columns every 160 feet
                const modX = Math.abs(rx % 160);
                const isColumn = modX < 12;
                if (isColumn) {
                  color32 = 0xFFDFEFFF; // Sturdy white ivory column
                } else {
                  // Repeating dark wrought-iron railings in-between columns
                  const isRailing = Math.abs(rx % 15) < 1.2;
                  if (isRailing) {
                    color32 = 0xFF121212; // Midnight wrought-iron baluster
                  } else {
                    // Soft outdoor mist behind railing
                    if (isFloor) {
                      color32 = 0xFF1E3A24; // Soft midnight garden silhouette grass
                    } else {
                      // Dreamy warm dark evening twilight gradient
                      const skyFactor = sy / horizon;
                      const r_color = Math.floor(35 + (20 * skyFactor));
                      const g_color = Math.floor(25 + (15 * skyFactor));
                      const b_color = Math.floor(55 + (25 * skyFactor));
                      color32 = 0xFF000000 | (b_color << 16) | (g_color << 8) | r_color;
                    }
                  }
                }
              }
            } else {
              // Inside Front Porch
              if (isFloor) {
                // Dark cedar wooden deck planks running horizontally
                const isPlankLine = Math.floor(ry / 10) % 2 === 0;
                color32 = isPlankLine ? 0xFF1A222D : 0xFF0F141C;
              } else {
                // Overhead cedar wooden ceiling with cozy fluted light patterns
                const isLanternArea = Math.floor(rx / 120) % 2 === 0 && Math.abs(rx % 120 - 60) < 10 && Math.abs(ry - 100) < 10;
                if (isLanternArea) {
                  color32 = 0xFF7FEFFF; // Warm golden lantern light
                } else {
                  // Cedar wood ceiling grain planks
                  const isCeilingPlank = Math.floor(ry / 15) % 2 === 0;
                  color32 = isCeilingPlank ? 0xFF141C25 : 0xFF0A0F15;
                }
              }
            }
          }

          data32[sy * renderWidth + sx] = color32;
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // --- 5. Draw Female Beagle Sprite Overlays ---
      // Anchored dynamically to bottom center, bobbing coordinates on active trot
      const centerX = renderWidth / 2;
      const leanOffset = state.isLeaning ? 12 : 0;
      const beagleHeight = state.selectedBeagle === 'THELMA' ? 52 : (state.selectedBeagle === 'ELSA' ? 45 : 42);
      const baseHeadY = renderHeight - beagleHeight - (walkBob * 0.95) + (state.jumpZ * 1.12) + leanOffset;

      // Dynamic Colors for Jetta vs Elsa vs Thelma
      let coatColor = '#FFFFFF';
      let saddleColor = '#FF5722';
      let skinColor = '#FFDFC4';
      let earColor = '#FF5722';
      let eyeColor = '#1E3A8A';
      let collarColor = '#1E40AF';
      let decorationColor = '#F59E0B';

      if (state.selectedBeagle === 'ELSA') {
        coatColor = '#FFEB3B';
        saddleColor = '#FF4081';
        skinColor = '#FFF176';
        earColor = '#FF9800';
        eyeColor = '#4B0082';
        collarColor = '#795548';
        decorationColor = '#CD7F32';
      } else if (state.selectedBeagle === 'THELMA') {
        coatColor = '#D32F2F'; // Red
        saddleColor = '#FFFFFF'; // White saddle
        skinColor = '#FFCDD2'; // Light red/pinkish skin
        earColor = '#5D4037'; // Dark-brown
        eyeColor = '#8BC34A'; // Light green
        collarColor = '#9C27B0'; // Purple
        decorationColor = '#FFEB3B'; // Yellow
      } else if (state.selectedBeagle === 'TINA') {
        coatColor = '#B3E5FC'; // Light-Blue
        saddleColor = '#C2185B'; // Dark-Pink
        skinColor = '#E1F5FE'; // Light-Blue skin peeking
        earColor = '#0D47A1'; // Dark-Blue
        eyeColor = '#1B5E20'; // Dark-Green
        collarColor = '#4CAF50'; // Green
        decorationColor = '#FF9800'; // Orange
      }

      // A. Main body shoulders/back segment
      ctx.fillStyle = coatColor;
      ctx.strokeStyle = state.selectedBeagle === 'ELSA' ? '#E6EE9C' : '#E0DCD8';
      ctx.beginPath();
      ctx.arc(centerX - 35, renderHeight + 5, 45, 0, Math.PI * 2);
      ctx.arc(centerX + 35, renderHeight + 5, 45, 0, Math.PI * 2);
      ctx.arc(centerX, renderHeight + 10, 50, 0, Math.PI * 2);
      ctx.fill();

      // Saddle mark
      ctx.fillStyle = saddleColor;
      ctx.beginPath();
      ctx.ellipse(centerX, renderHeight + 5, 30, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      // Neck skin peeking
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.ellipse(centerX, baseHeadY + 5, 12, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // B. Collar
      ctx.fillStyle = collarColor; 
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(centerX, baseHeadY + 14, 25, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = decorationColor;
      ctx.stroke();

      // Collar decorations
      ctx.fillStyle = decorationColor;
      for (let i = -3; i <= 3; i++) {
        const offset = i * 6;
        ctx.beginPath();
        if (state.selectedBeagle === 'ELSA') {
          // Bronze stars (simplified as tiny diamonds/crosses)
          ctx.moveTo(centerX + offset, baseHeadY + 12);
          ctx.lineTo(centerX + offset + 2, baseHeadY + 14);
          ctx.lineTo(centerX + offset, baseHeadY + 16);
          ctx.lineTo(centerX + offset - 2, baseHeadY + 14);
        } else if (state.selectedBeagle === 'THELMA') {
          // Yellow vertical diamonds
          ctx.moveTo(centerX + offset, baseHeadY + 11);
          ctx.lineTo(centerX + offset + 1.5, baseHeadY + 14);
          ctx.lineTo(centerX + offset, baseHeadY + 17);
          ctx.lineTo(centerX + offset - 1.5, baseHeadY + 14);
        } else if (state.selectedBeagle === 'TINA') {
          // Vertical orange ovals
          ctx.ellipse(centerX + offset, baseHeadY + 14, 1.2, 2.5, 0, 0, Math.PI * 2);
        } else {
          // Yellow circles (Jetta)
          ctx.arc(centerX + offset, baseHeadY + 14, 2.0, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      // Elsa's and Thelma's Mane
      if (state.selectedBeagle === 'ELSA' || state.selectedBeagle === 'THELMA') {
        ctx.fillStyle = state.selectedBeagle === 'ELSA' ? '#FBC02D' : '#FFFFFF'; // Dark yellow vs White
        ctx.beginPath();
        // Thelma's mane is thicker (15 inches vs 12)
        const maneRadiusX = state.selectedBeagle === 'THELMA' ? 15 : 12;
        const maneRadiusY = state.selectedBeagle === 'THELMA' ? 20 : 16;
        ctx.ellipse(centerX, baseHeadY - 18, maneRadiusX, maneRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // C. Head
      ctx.fillStyle = coatColor;
      ctx.beginPath();
      // Thelma's head is slightly wider
      const headRadius = state.selectedBeagle === 'THELMA' ? 22 : 20;
      ctx.arc(centerX, baseHeadY - 10, headRadius, 0, Math.PI * 2);
      ctx.fill();

      // Thelma's Tiara
      if (state.selectedBeagle === 'THELMA') {
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.beginPath();
        ctx.moveTo(centerX - 12, baseHeadY - 28);
        ctx.lineTo(centerX - 6, baseHeadY - 36);
        ctx.lineTo(centerX, baseHeadY - 40);
        ctx.lineTo(centerX + 6, baseHeadY - 36);
        ctx.lineTo(centerX + 12, baseHeadY - 28);
        ctx.fill();
        
        // Green Gem
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(centerX, baseHeadY - 34, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Side markings
      ctx.fillStyle = saddleColor;
      ctx.beginPath();
      ctx.ellipse(centerX - 12, baseHeadY - 12, 11, 14, Math.PI / 12, 0, Math.PI * 2);
      ctx.ellipse(centerX + 12, baseHeadY - 12, 11, 14, -Math.PI / 12, 0, Math.PI * 2);
      ctx.fill();

      // D. Ears
      ctx.fillStyle = earColor;
      const leftEarBob = Math.sin(state.bobFrame * 1.5) * 2;
      ctx.beginPath();
      ctx.ellipse(centerX - 22, baseHeadY - 2 + leftEarBob, 11, 20, Math.PI / 10, 0, Math.PI * 2);
      ctx.fill();

      const rightEarBob = -Math.sin(state.bobFrame * 1.5) * 2;
      ctx.beginPath();
      ctx.ellipse(centerX + 22, baseHeadY - 2 + rightEarBob, 11, 20, -Math.PI / 10, 0, Math.PI * 2);
      ctx.fill();

      // Tina's indigo ear tips
      if (state.selectedBeagle === 'TINA') {
        ctx.fillStyle = '#303F9F'; // Indigo tips
        ctx.beginPath();
        ctx.ellipse(centerX - 22, baseHeadY + 10 + leftEarBob, 8, 8, Math.PI / 10, 0, Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX + 22, baseHeadY + 10 + rightEarBob, 8, 8, -Math.PI / 10, 0, Math.PI);
        ctx.fill();

        // Tina's Earrings
        ctx.strokeStyle = '#B71C1C'; // Red gold
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX - 28, baseHeadY + 5 + leftEarBob, 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX + 28, baseHeadY + 5 + rightEarBob, 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // D2. Tail: stands at a quarter-pipe curve upward
      ctx.strokeStyle = coatColor;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      // Tina wags her tail with delight when petted
      const isTinaPetting = state.selectedBeagle === 'TINA' && state.petTimer > 0;
      const tailBob = isTinaPetting 
        ? Math.sin(state.bobFrame * 8) * 15 // Intense wag
        : Math.sin(state.bobFrame * 2) * 3;
      ctx.moveTo(centerX, renderHeight + 10);
      ctx.quadraticCurveTo(centerX + 15 + tailBob, renderHeight - 15, centerX + 20 + tailBob, renderHeight - 45);
      ctx.stroke();

      // Tail tip (White or dynamic)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(centerX + 20 + tailBob, renderHeight - 45, 4, 0, Math.PI * 2);
      ctx.fill();

      // E. Facial Features
      const isInteractionActive = state.petTimer > 0;
      const isTina = state.selectedBeagle === 'TINA';
      
      if (isInteractionActive && !isTina) {
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(centerX, baseHeadY - 2, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = eyeColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX - 8, baseHeadY - 2, 4, Math.PI, 0, false);
        ctx.arc(centerX + 8, baseHeadY - 2, 4, Math.PI, 0, false);
        ctx.stroke();

        ctx.fillStyle = saddleColor;
        ctx.beginPath();
        ctx.arc(centerX, baseHeadY + 3, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 99, 132, 0.4)';
        ctx.beginPath();
        ctx.arc(centerX - 13, baseHeadY + 4, 3, 0, Math.PI * 2);
        ctx.arc(centerX + 13, baseHeadY + 4, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = saddleColor;
        ctx.beginPath();
        ctx.ellipse(centerX, baseHeadY + 5, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(centerX - 14, baseHeadY - 4, 2.5, 0, Math.PI * 2);
        ctx.arc(centerX + 14, baseHeadY - 4, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // F. Bark speech bubble visual feedback
      if (state.barkTimer > 0) {
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(centerX - 50, baseHeadY - 55, 100, 24, 6);
        ctx.fill();
        ctx.stroke();

        // Little bubble tag
        ctx.beginPath();
        ctx.moveTo(centerX - 10, baseHeadY - 31);
        ctx.lineTo(centerX, baseHeadY - 24);
        ctx.lineTo(centerX + 10, baseHeadY - 31);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#D91B5C'; // Fancy text color
        ctx.font = 'bold 9px Menlo, Courier, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🐾 BOW-WOW! 🐾', centerX, baseHeadY - 39);
      }

      // G. Player's hands and Rider Visuals
      const handBobY = Math.sin(state.bobFrame * 2) * 1.2;
      
      // Dynamic Rider properties
      const riderSkinColor = currentRiderSpecs.skinColor;
      const riderPrimaryColor = currentRiderSpecs.primaryColor;

      // Draw Rider's legs "molded into fur" - ONLY in RIDER mode
      if (state.viewMode === 'RIDER') {
        ctx.fillStyle = riderPrimaryColor;
        ctx.beginPath();
        // Left leg
        ctx.ellipse(centerX - 40, renderHeight + 10, 15, 30, Math.PI / 6, 0, Math.PI * 2);
        // Right leg
        ctx.ellipse(centerX + 40, renderHeight + 10, 15, 30, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Fairy-Rider's green triangles
        if (currentRiderSpecs.hasTrianglesOnLegs) {
          ctx.fillStyle = '#4CAF50';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 0.5;
          // Simple triangles on legs
          ctx.beginPath();
          ctx.moveTo(centerX - 45, renderHeight - 5);
          ctx.lineTo(centerX - 40, renderHeight - 15);
          ctx.lineTo(centerX - 35, renderHeight - 5);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(centerX + 45, renderHeight - 5);
          ctx.lineTo(centerX + 40, renderHeight - 15);
          ctx.lineTo(centerX + 35, renderHeight - 5);
          ctx.fill();
          ctx.stroke();
        }

        // Mary's Puffy shoulders and dress logic
        if (currentRiderSpecs.hasPuffyShoulders) {
          // Puffy shoulder puffs
          ctx.fillStyle = '#F06292';
          ctx.beginPath();
          ctx.arc(centerX - 50, renderHeight - 20, 12, 0, Math.PI * 2);
          ctx.arc(centerX + 50, renderHeight - 20, 12, 0, Math.PI * 2);
          ctx.fill();

          // White Apron
          ctx.fillStyle = '#FAFAFA';
          ctx.beginPath();
          ctx.ellipse(centerX, renderHeight + 20, 30, 20, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (state.handState === 'PETTING') {
        // Draw hands petting
        ctx.fillStyle = riderSkinColor;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.0;

        // Left Hand petting
        ctx.beginPath();
        ctx.arc(centerX - 24 + handBobY, baseHeadY - 14, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Right Hand petting
        ctx.beginPath();
        ctx.arc(centerX + 24 - handBobY, baseHeadY - 14, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Heart sparks rising up!
        ctx.fillStyle = '#FF3366';
        ctx.font = '10px Courier New';
        ctx.fillText('💖', centerX - 25, baseHeadY - 36 + (state.petTimer % 10));
        ctx.fillText('💖', centerX + 25, baseHeadY - 42 + (state.petTimer % 8));
      } else if (state.handState === 'GRASPING') {
        // Draw hands clenching collar
        ctx.fillStyle = riderSkinColor;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.0;

        // Left fist holding collar
        ctx.beginPath();
        ctx.roundRect(centerX - 12, baseHeadY + 12 + handBobY, 8, 8, 2);
        ctx.fill();
        ctx.stroke();

        // Right fist holding collar
        ctx.beginPath();
        ctx.roundRect(centerX + 4, baseHeadY + 12 + handBobY, 8, 8, 2);
        ctx.fill();
        ctx.stroke();

        // Rein line indicator
        ctx.strokeStyle = '#FF3366';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - 8, baseHeadY + 14 + handBobY);
        ctx.lineTo(centerX - 22, renderHeight);
        ctx.moveTo(centerX + 8, baseHeadY + 14 + handBobY);
        ctx.lineTo(centerX + 22, renderHeight);
        ctx.stroke();
      } else {
        // Default Grasping/Reins Position
        ctx.fillStyle = riderSkinColor;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.0;

        // Hands relaxed resting on the sides of her neck
        ctx.beginPath();
        ctx.arc(centerX - 35, baseHeadY + 28, 6, 0, Math.PI * 2);
        ctx.arc(centerX + 35, baseHeadY + 28, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Simple thin rein cords
        ctx.strokeStyle = 'rgba(255, 99, 132, 0.45)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(centerX - 35, baseHeadY + 28);
        ctx.bezierCurveTo(centerX - 20, baseHeadY + 18, centerX - 12, baseHeadY + 14, centerX - 12, baseHeadY + 14);
        ctx.moveTo(centerX + 35, baseHeadY + 28);
        ctx.bezierCurveTo(centerX + 20, baseHeadY + 18, centerX + 12, baseHeadY + 14, centerX + 12, baseHeadY + 14);
        ctx.stroke();
      }

      animFrameId = requestAnimationFrame(updateAndDraw);
    };

    animFrameId = requestAnimationFrame(updateAndDraw);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animFrameId);
    };
  }, [settings.ttsEnabled]); // Re-bind slightly when TTS is modified

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      
      {/* 1. Header Area with exact specified content */}
      <header className="bg-slate-950 border-b border-slate-800 py-3 px-6 flex justify-between items-center shadow-md relative z-10">
        <div className="flex items-center gap-3">
          <Dog className="w-8 h-8 text-pink-400" />
          <h1 className="text-sm font-bold tracking-wider leading-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-indigo-400"><a href="">
            Beagle Ride<br />D&D</a>
          </h1>
        </div>

        {/* Display Current Cardinal Compass Dial */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-full px-4 py-1">
          <CompassIcon className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
            COMPASS HEADING: <span className="text-pink-400">{uiPosition.direction}</span>
          </span>
        </div>

        {/* Action Controls Header */}
        <div className="flex items-center gap-3">
          {/* Action controls moved to Menu_Bar below */}
        </div>
      </header>

      {/* 2. Main Play Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch relative z-10">
        
        {/* Playfield Frame (Left 3 columns) */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-4">
          
          {/* Compass Strip overlay */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <CompassIcon className="w-5 h-5 text-pink-400" />
              <div className="font-mono text-xs">
                <span className="text-slate-500">Angle:</span> <span className="text-slate-200">{Math.round(stateRef.current.currentAngle)}°</span>
              </div>
            </div>

            {/* Simulated moving horizontal navigation tape */}
            <div className="relative w-48 h-6 bg-slate-900 border border-slate-800 rounded-md overflow-hidden flex items-center justify-center font-mono">
              <div 
                className="absolute flex gap-12 transition-all duration-75 text-xxs font-bold text-slate-500"
                style={{ 
                  transform: `translateX(${-((stateRef.current.currentAngle % 360) / 360) * 120 + 40}px)`,
                  whiteSpace: 'nowrap'
                }}
              >
                <span className={uiPosition.direction === 'NORTH' ? 'text-pink-400' : ''}>N</span>
                <span className={uiPosition.direction === 'EAST' ? 'text-pink-400' : ''}>E</span>
                <span className={uiPosition.direction === 'SOUTH' ? 'text-pink-400' : ''}>S</span>
                <span className={uiPosition.direction === 'WEST' ? 'text-pink-400' : ''}>W</span>
                <span className={uiPosition.direction === 'NORTH' ? 'text-pink-400' : ''}>N</span>
              </div>
              <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500 left-1/2 -translate-x-1/2"></div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-400">X:</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-300 font-bold">{Math.round(uiPosition.x)}ft</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-400">Y:</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-300 font-bold">{Math.round(uiPosition.y)}ft</span>
              </div>
            </div>
          </div>

          <MenuBar settings={settings} onUpdateSettings={setSettings} />
          <div id="HUD_Controls" className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-end gap-3 shadow-lg mb-4">
            <button
              onClick={() => setIsKeyboardModalOpen(true)}
              className="cursor-pointer px-3 py-1.5 rounded-md text-xs font-mono flex items-center gap-1.5 border border-slate-800 bg-slate-800 text-slate-400 hover:border-slate-600 transition-all"
            >
              <Keyboard className="w-3.5 h-3.5" />
              Commands
            </button>
          </div>

          <div id="HUD" className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4 shadow-inner">
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase">Location</span>
                  <span className="text-xs font-mono text-pink-400">{currentRoom}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase">Coordinates</span>
                  <span className="text-xs font-mono text-emerald-400">{Math.round(uiPosition.x)}X, {Math.round(uiPosition.y)}Y</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase">Heading</span>
                  <span className="text-xs font-mono text-indigo-400">{uiPosition.direction}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase">Status</span>
                  <span className="text-xs font-mono text-slate-300">
                    {uiHandState} {isLeaning ? '(LEANING)' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Interactive Canvas Wrapper */}
          <div className="bg-slate-950/80 border-2 border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center relative group shadow-2xl backdrop-blur-sm overflow-hidden">
            
            {settings.paused && (
              <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-md flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-4xl font-black text-white tracking-widest uppercase mb-2">Paused</h2>
                  <p className="text-pink-400 font-mono text-sm uppercase tracking-widest">Shift-7 to Resume</p>
                </div>
              </div>
            )}
            {/* Height Elevation Indicator */}
            {uiJumpZ > 0 && (
              <div className="absolute top-8 left-8 bg-pink-500/90 text-white font-mono text-xxs px-3 py-1 rounded-full flex items-center gap-1.5 animate-bounce shadow-md">
                <Sparkles className="w-3 h-3" />
                JUMPING: {Math.round(uiJumpZ)}ft ELEVATED
              </div>
            )}

            {/* HTML5 canvas requested strictly by spec */}
            <div className="w-full flex justify-center">
              <canvas
                ref={canvasRef}
                style={{
                  backgroundColor: '#000000',
                  borderWidth: '3px',
                  borderColor: '#000000',
                  imageRendering: 'pixelated',
                }}
                className="w-full max-w-4xl rounded-lg shadow-xl border-4 border-slate-950 aspect-video object-contain"
                aria-label="Beagle Ride D&D Game View"
                role="img"
              />
            </div>
          </div>

          {/* Quick HUD controller bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={barkBeagle}
              className="cursor-pointer bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white py-2.5 px-3 rounded-xl border border-pink-500/40 text-xs font-semibold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              🐕 Bark (S)
            </button>
            <button
              onClick={petBeagle}
              className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-emerald-300 py-2.5 px-3 rounded-xl border border-slate-700 text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5"
            >
              💖 Pet Beagle (P)
            </button>
            <button
              onClick={graspCollar}
              className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-pink-300 py-2.5 px-3 rounded-xl border border-slate-700 text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5"
            >
              ⚓ Hold Collar (C)
            </button>
            <button
              onClick={() => {
                if (stateRef.current.jumpZ === 0) {
                  stateRef.current.jumpZ = 0.01;
                  stateRef.current.jumpVelocity = GameConfig.physics.jumpInitialVelocity;
                  soundEngine.playSfx(3);
                }
              }}
              className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-indigo-300 py-2.5 px-3 rounded-xl border border-slate-700 text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5"
            >
              🚀 Jump (Space)
            </button>
          </div>
        </div>
      </main>

      <KeyboardCommandsModal isOpen={isKeyboardModalOpen} onClose={() => setIsKeyboardModalOpen(false)} />

      {/* Decorative environment branding floor coordinates at bottom */}
      <footer className="bg-slate-950 py-3 text-center border-t border-slate-800/60 relative z-10">
        <p className="text-xxs font-mono text-slate-500 tracking-wider uppercase">
          ESTABLISHED IN {currentRoom === 'FOYER' ? 'HOUSE/FOYER' : (currentRoom === 'GARDEN' ? 'HOUSE/GARDEN' : (currentRoom === 'PORCH' ? 'HOUSE/FRONT_PORCH' : 'LEVELS/TEMPLE_OF_HAYANA'))} &bull; {currentRoom === 'FOYER' ? 'FOYER' : (currentRoom === 'GARDEN' ? 'GARDEN' : (currentRoom === 'PORCH' ? 'FRONT PORCH' : 'TEMPLE OF HAYANA'))} SURFACE AREA: {currentRoom === 'TEMPLE' ? '2000 X 2000 FT' : (currentRoom === 'PORCH' ? '800 X 200 FT' : '800 X 800 FT')} &bull; {currentRoom === 'FOYER' ? 'CEILING HEIGHT: 30 FT' : (currentRoom === 'GARDEN' ? 'OPEN SUNNY SKY' : (currentRoom === 'PORCH' ? 'CEILING HEIGHT: 9 FT' : 'CEILING HEIGHT: 15 FT (REVERBERANT)'))}
        </p>
      </footer>
    </div>
  );
}
