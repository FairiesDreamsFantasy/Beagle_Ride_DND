/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Compass as CompassIcon, 
  Sparkles, 
  MapPin, 
  Dog,
  Keyboard
} from 'lucide-react';
import { soundEngine, SFX_VOICES, BGM_VOICES } from '../../Sound/index';
import KeyboardCommandsModal from '../Modal/Keyboard_Commands/index';
import { Position, HandState, GameSettings, BeagleId, RiderId } from '../../../types';
import { BeagleRegistry, CharacterInteractionEngine } from '../../Registry/Character/index';
import { RiderRegistry } from '../../Registry/Character/Rider/index';
import { GameConfig } from '../../Registry/Config/index';
import { TrigLUT } from '../../Engine/Mathematics/LUT/Trig';
import { MovementEngine } from '../../Engine/index';
import { PhysicsEngine } from '../../Engine/Science/Physics/index';
import { GraphicalRendererEngine } from '../../Engine/Science/Graphical_Renderer/index';
import { accessibilityGeneral } from '../../Accessibility/index';
import { WorldRegistry } from '../../Registry/Building_Blocks/World/index';
import { MenuBar } from '../../Components/Menu_Bar/index';
import { generateTempleMaze, type TempleMazeData } from './templeMaze';
import { HardwareVirtualization, cpuUnit, ramUnit } from '../../Hardware_Virtualization/index';
import { VisualsModule, type VisualPipelineMode } from '../../Visuals/index';
import { VisualAnimation2D } from '../../Visuals/Animations/2-D/index';
import { VisualAnimation3D, type ProjectedPoint2D } from '../../Visuals/Animations/3-D/index';
import { VisualAnimationPolygons } from '../../Visuals/Animations/Polygons/index';
import { VisualAnimationGeometry } from '../../Visuals/Animations/Geometry/index';
import { VisualAnimationEngine } from '../../Visuals/Animations/Engine/index';
import { VisualAnimationColorPalette } from '../../Visuals/Animations/Color_Palette/index';
import { InGameAIVisualsEngine, type VisualAIState } from '../../AI/in-Game/Category/Visuals/index';

const FOV_SCALE = 130;
const VIRTUAL_WIDTH = 320;
const VIRTUAL_HEIGHT = 180;
const PORTAL_OVERLAY_COLORS: Record<'FOYER' | 'GARDEN' | 'PORCH' | 'TEMPLE', string> = {
  FOYER: '#34D399',
  GARDEN: '#F59E0B',
  PORCH: '#FBBF24',
  TEMPLE: '#60A5FA'
};
const BEAGLE_EXTRA_APPEARANCE: Record<BeagleId, { skin: string; decoration: string; height: number; headRadius: number }> = {
  JETTA: { skin: '#FFDFC4', decoration: '#F59E0B', height: 42, headRadius: 20 },
  ELSA: { skin: '#FFF176', decoration: '#CD7F32', height: 45, headRadius: 20 },
  THELMA: { skin: '#FFCDD2', decoration: '#FFEB3B', height: 52, headRadius: 22 },
  TINA: { skin: '#E1F5FE', decoration: '#FF9800', height: 42, headRadius: 20 }
};

function getBeagleSpecsById(id: BeagleId) {
  return BeagleRegistry.find(b => b.id === id) || BeagleRegistry[0];
}

function getRiderSpecsById(id: RiderId) {
  return RiderRegistry.find(r => r.id === id) || RiderRegistry[0];
}

interface PlayAreaProps {
  onBack: () => void;
  selectedBeagle: BeagleId;
  selectedRider: RiderId;
  settings: GameSettings;
  onUpdateSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  key?: string;
}

export default function PlayArea({ onBack: _onBack, selectedBeagle, selectedRider, settings, onUpdateSettings: setSettings }: PlayAreaProps) {
  const barkBeagle = () => {
    const state = stateRef.current;
    const specs = getBeagleSpecsById(state.selectedBeagle);
    const res = CharacterInteractionEngine.evaluateBark(specs);
    state.barkTimer = res.durationFrames;
    soundEngine.playSfx(res.sfxId, state.room === 'TEMPLE' ? 'TEMPLE' : (state.room === 'FOYER' ? 'HALLWAY' : 'NONE'), state.room, res.pitchModifier);
    if (state.settings.barkNotificationsEnabled) {
      speak(res.text);
    }
  };

  const petBeagle = () => {
    const state = stateRef.current;
    const specs = getBeagleSpecsById(state.selectedBeagle);
    state.handState = 'PETTING';
    const res = CharacterInteractionEngine.evaluatePetting(specs);
    state.petTimer = res.durationFrames;
    soundEngine.playSfx(res.sfxId, state.room === 'TEMPLE' ? 'TEMPLE' : (state.room === 'FOYER' ? 'HALLWAY' : 'NONE'), state.room, res.pitchMultiplier);
    if (state.settings.pettingDescriptionsEnabled) {
      speak(res.text);
    }
  };

  const graspCollar = () => {
    const state = stateRef.current;
    const specs = getBeagleSpecsById(state.selectedBeagle);
    const res = CharacterInteractionEngine.evaluateCollarGrasp(specs, state.handState);
    state.handState = res.nextHandState;
    soundEngine.playSfx(res.sfxId, state.room === 'TEMPLE' ? 'TEMPLE' : (state.room === 'FOYER' ? 'HALLWAY' : 'NONE'), state.room);
    if (state.settings.collarGraspDescriptionsEnabled) {
      speak(res.text);
    }
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const viewportSizeRef = useRef<{ width: number; height: number }>({ width: 640, height: 360 });
  const lastInputTimeRef = useRef<number>(performance.now());

  const handleTakeScreenshot = useCallback((format: 'png' | 'jpg') => {
    const canvas = canvasRef.current || document.querySelector('canvas');
    if (!canvas) return;
    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const ext = format === 'jpg' ? 'jpg' : 'png';
    const dataUrl = canvas.toDataURL(mimeType, 0.95);
    const link = document.createElement('a');
    link.download = `Beagle_Ride_DND_Screenshot.${ext}`;
    link.href = dataUrl;
    link.click();
  }, []);
  
  // Display status states (synchronized periodically from core loop)
  const [uiPosition, setUiPosition] = useState<Position>({
    x: 400,
    y: 400,
    direction: 'NORTH',
    angle: 0
  });
  const [uiJumpZ, setUiJumpZ] = useState(0);
  const [uiHandState, setUiHandState] = useState<HandState>('DEFAULT');

  // Update UI display status with integer change-detection to minimize React reconciliation overhead
  const lastSyncedState = useRef({ x: 400, y: 400, angle: 0, jumpZ: 0, handState: 'DEFAULT' as HandState });
  const syncUiState = () => {
    const state = stateRef.current;
    const last = lastSyncedState.current;
    const rx = Math.round(state.x);
    const ry = Math.round(state.y);
    const rAngle = Math.round(state.currentAngle);

    if (last.x !== rx || last.y !== ry || last.angle !== rAngle) {
      last.x = rx;
      last.y = ry;
      last.angle = rAngle;
      setUiPosition({
        x: rx,
        y: ry,
        direction: getDirectionName(state.targetAngle) as Position['direction'],
        angle: rAngle
      });
    }
    const rJump = Math.round(state.jumpZ);
    if (last.jumpZ !== rJump) {
      last.jumpZ = rJump;
      setUiJumpZ(rJump);
    }
    if (last.handState !== state.handState) {
      last.handState = state.handState;
      setUiHandState(state.handState);
    }
  };
  const [currentRoom, setCurrentRoom] = useState<'FOYER' | 'GARDEN' | 'PORCH' | 'TEMPLE'>('FOYER');
  const [isLeaning, setIsLeaning] = useState(false);
  const [isKeyboardModalOpen, setIsKeyboardModalOpen] = useState(false);
  const [visualMode, setVisualMode] = useState<VisualPipelineMode>(VisualsModule.defaultPipelineMode);

  // Lazy one-time Temple maze bitfield allocation (~48.6 KiB, never regenerated on React re-renders)
  const templeMazeRef = useRef<TempleMazeData | null>(null);
  if (!templeMazeRef.current) {
    templeMazeRef.current = generateTempleMaze();
  }

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
    templeMaze: templeMazeRef.current,
    selectedBeagle: selectedBeagle,
    selectedRider: selectedRider,
    viewMode: settings.viewMode,
    visualMode: VisualsModule.defaultPipelineMode as VisualPipelineMode,
    settings: {
      ...settings,
      selectedBeagle: selectedBeagle,
      selectedRider: selectedRider
    }
  });

  // Keep refs synchronized to prevent stale closures in event handlers and rAF loop
  useEffect(() => {
    stateRef.current.settings = settings;
    stateRef.current.selectedBeagle = settings.selectedBeagle;
    stateRef.current.selectedRider = settings.selectedRider;
    stateRef.current.viewMode = settings.viewMode;
  }, [settings]);

  useEffect(() => {
    stateRef.current.isLeaning = isLeaning;
  }, [isLeaning]);

  useEffect(() => {
    stateRef.current.visualMode = visualMode;
  }, [visualMode]);

  // Pure built-in accessibility speech synthesizer
  const speak = (text: string, force = false) => {
    if (!stateRef.current.settings.ttsEnabled && !force) return;
    accessibilityGeneral.speak(text, force);
  };

  // Keyboard events
  useEffect(() => {
    const state = stateRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      lastInputTimeRef.current = performance.now();
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
                accessibilityGeneral.speak(speechText, true);
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
        case 'T': {
          const nextViewMode = state.viewMode === 'POV' ? 'RIDER' : 'POV';
          state.viewMode = nextViewMode;
          setSettings(prev => ({ ...prev, viewMode: nextViewMode }));
          speak(`View switched to ${nextViewMode === 'POV' ? 'Scientific POV' : 'Rider View'}.`);
          break;
        }
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
    if (currentRoom === 'GARDEN' && !settings.isMuted) {
      soundEngine.startBGM(settings.activeBgmVoice);
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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const containerEl = canvasContainerRef.current;
    const measureContainer = () => {
      if (!containerEl) return;
      const rect = containerEl.getBoundingClientRect();
      if (rect.width >= 120 && rect.height >= 90) {
        const w = Math.floor(rect.width);
        const h = Math.floor(rect.height);
        if (Math.abs(w - viewportSizeRef.current.width) >= 2 || Math.abs(h - viewportSizeRef.current.height) >= 2) {
          viewportSizeRef.current.width = w;
          viewportSizeRef.current.height = h;
        }
      }
    };
    measureContainer();

    let resizeObserver: ResizeObserver | null = null;
    if (containerEl && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        measureContainer();
      });
      resizeObserver.observe(containerEl);
    }
    window.addEventListener('resize', measureContainer);

    const initialViewport = HardwareVirtualization.videoCard.computeViewport(
      viewportSizeRef.current.width,
      viewportSizeRef.current.height
    );
    let renderWidth = initialViewport.renderWidth;
    let renderHeight = initialViewport.renderHeight;
    canvas.width = renderWidth;
    canvas.height = renderHeight;

    // Allocate ONE page-aligned RAM slab upfront (~512 KiB) shared across ALL window sizes with 0 heap growth
    const maxSlabBytes = VisualAnimationEngine.WebAssembly.computePageAlignedBytes(129600, 4);
    const framebufferSlab = ramUnit.acquire(maxSlabBytes);

    const bindFramebufferView = (w: number, h: number) => {
      const pixelCount = Math.min(w * h, Math.floor(framebufferSlab.byteLength / 4));
      const byteLength = pixelCount * 4;
      const clampedView = new Uint8ClampedArray(framebufferSlab, 0, byteLength);
      const image = new ImageData(clampedView, w, h);
      const u32View = new Uint32Array(framebufferSlab, 0, pixelCount);
      return { imgData: image, data32: u32View };
    };

    let { imgData, data32 } = bindFramebufferView(renderWidth, renderHeight);

    // Offscreen dirty-flagged world cache canvas: skips idle raycast + 512 KiB putImageData transfer when pose is unchanged
    const worldCacheCanvas = document.createElement('canvas');
    worldCacheCanvas.width = renderWidth;
    worldCacheCanvas.height = renderHeight;
    const worldCacheCtx = worldCacheCanvas.getContext('2d');
    let worldCacheValid = false;
    let cachedX = NaN;
    let cachedY = NaN;
    let cachedAngle = NaN;
    let cachedWalkBob = NaN;
    let cachedJumpZ = NaN;
    let cachedRoom = '';
    let cachedVisualMode = '';
    let cachedEyeHeight = NaN;
    let cachedRenderWidth = -1;
    let cachedRenderHeight = -1;

    // Pre-allocated zero-GC scratch structures reused across all frames
    const volLightScratch = { diffuse: 0.7, specular: 0.2, rim: 0.1 };
    const depthSimScratch = { scaleX: 1.0, scaleY: 1.0, zShift: 0 };
    const aiVisualScratch: VisualAIState = {
      earFlopFrequencyHz: 1.2,
      eyeBlinkPeriodFrames: 180,
      tailWagAmplitudeDeg: 8,
      furSheenFactor: 0.7,
      reinsTensionRatio: 0.4
    };
    const projLeftBase: ProjectedPoint2D = { screenX: 0, screenY: 0, depth: 0, isVisible: false };
    const projLeftTop: ProjectedPoint2D = { screenX: 0, screenY: 0, depth: 0, isVisible: false };
    const projRightBase: ProjectedPoint2D = { screenX: 0, screenY: 0, depth: 0, isVisible: false };
    const projRightTop: ProjectedPoint2D = { screenX: 0, screenY: 0, depth: 0, isVisible: false };

    // Constant volumetric sun light & Fairy-Rider verified triangle geometry
    const centerX = VIRTUAL_WIDTH / 2;
    VisualAnimation3D.evaluateVolumetricLightInto(volLightScratch, -0.35, -0.68, 0.64);
    const highlightMult = 1.0 + volLightScratch.diffuse * 0.14 + volLightScratch.specular * 0.16;
    const shadowMult = 0.74 + volLightScratch.rim * 0.10;
    const tiaraSimColor = VisualAnimation3D.shadeHexColor('#FFD700', highlightMult);
    const shoulderPuffSimColor = VisualAnimation3D.shadeHexColor('#F06292', highlightMult);

    const fairyLeftTri = [
      { x: centerX - 45, y: VIRTUAL_HEIGHT - 5 },
      { x: centerX - 35, y: VIRTUAL_HEIGHT - 5 },
      { x: centerX - 40, y: VIRTUAL_HEIGHT - 15 }
    ];
    const fairyRightTri = [
      { x: centerX + 35, y: VIRTUAL_HEIGHT - 5 },
      { x: centerX + 45, y: VIRTUAL_HEIGHT - 5 },
      { x: centerX + 40, y: VIRTUAL_HEIGHT - 15 }
    ];
    const fairyLeftTriValid = Math.abs(VisualAnimationPolygons.computeSignedArea2D(fairyLeftTri)) > 0;
    const fairyRightTriValid = Math.abs(VisualAnimationPolygons.computeSignedArea2D(fairyRightTri)) > 0;

    // Dynamic registry resolution & cached Character CanvasGradients
    let cachedBeagleSpecs = getBeagleSpecsById(stateRef.current.selectedBeagle);
    let cachedRiderSpecs = getRiderSpecsById(stateRef.current.selectedRider);
    let charCacheKey = '';
    let cachedBodyGrad: CanvasGradient | string = '#FFFFFF';
    let cachedSaddleGrad: CanvasGradient | string = '#FF5722';
    let cachedCollarGrad: CanvasGradient | string = '#1E40AF';
    let cachedHeadGrad: CanvasGradient | string = '#FFFFFF';
    let cachedLegGrad: CanvasGradient | string = cachedRiderSpecs.primaryColor;

    let isRunning = true;
    let animFrameId: number;
    let lastFrameTime = performance.now();
    let lastRamSweepTime = performance.now();
    let wasActivelyMoving = false;
    let lastWallHitTime = 0;

    const foyerData = WorldRegistry.rooms.FOYER;
    const gardenData = WorldRegistry.rooms.GARDEN;
    const porchData = WorldRegistry.rooms.PORCH;
    const doorMinX = foyerData.doorCenterX - foyerData.doorHalfWidth;
    const doorMaxX = foyerData.doorCenterX + foyerData.doorHalfWidth;

    const updateAndDraw = () => {
      if (!isRunning) return;

      const now = performance.now();
      const idleDuration = now - lastInputTimeRef.current;
      const currentMinInterval = idleDuration > 400 ? 66.6 : 13.5;

      const elapsed = now - lastFrameTime;
      if (elapsed < currentMinInterval) {
        animFrameId = requestAnimationFrame(updateAndDraw);
        return;
      }
      lastFrameTime = now;
      // Normalized frame delta (1.0 = 60Hz 16.6667ms; clamped to [0.25, 3.0] to prevent spiral-of-death)
      const rawDtScale = elapsed / (1000 / 60);
      const dtScale = rawDtScale < 0.25 ? 0.25 : (rawDtScale > 3.0 ? 3.0 : rawDtScale);

      if (now - lastRamSweepTime > 10000) {
        lastRamSweepTime = now;
        HardwareVirtualization.sweepRAM();
      }

      const frameWorkStart = now;
      const viewport = HardwareVirtualization.beginFrame(
        frameWorkStart,
        viewportSizeRef.current.width,
        viewportSizeRef.current.height
      );

      if (viewport.renderWidth !== renderWidth || viewport.renderHeight !== renderHeight) {
        renderWidth = viewport.renderWidth;
        renderHeight = viewport.renderHeight;
        canvas.width = renderWidth;
        canvas.height = renderHeight;
        worldCacheCanvas.width = renderWidth;
        worldCacheCanvas.height = renderHeight;
        worldCacheValid = false;
        const rebound = bindFramebufferView(renderWidth, renderHeight);
        imgData = rebound.imgData;
        data32 = rebound.data32;
      }

      const state = stateRef.current;
      const currentRoomData = WorldRegistry.rooms[state.room] || foyerData;

      if (state.settings.paused) {
        animFrameId = requestAnimationFrame(updateAndDraw);
        return;
      }

      // Resolve current character specs dynamically from stateRef
      if (cachedBeagleSpecs.id !== state.selectedBeagle) {
        cachedBeagleSpecs = getBeagleSpecsById(state.selectedBeagle);
      }
      if (cachedRiderSpecs.id !== state.selectedRider) {
        cachedRiderSpecs = getRiderSpecsById(state.selectedRider);
      }

      // 1. Interpolate current yaw angle smoothly towards target cardinal direction (frame-rate independent)
      let diff = state.targetAngle - state.currentAngle;
      while (diff < -180) diff += 360;
      while (diff > 180) diff -= 360;
      const isTurning = Math.abs(diff) >= 1e-3;
      if (isTurning || state.isMovingForward || state.isMovingBackward || state.jumpZ > 0 || state.isBursting) {
        lastInputTimeRef.current = now;
      }
      if (!isTurning) {
        state.currentAngle = state.targetAngle;
      } else {
        const turnAlpha = 1 - Math.pow(1 - 0.14, dtScale);
        state.currentAngle += diff * turnAlpha;
      }

      // Normalize currentAngle to 0-360
      state.currentAngle = ((state.currentAngle % 360) + 360) % 360;

      // 2. Physics & movement velocity updates (scaled by dtScale so movement & audio cadence never slow down)
      let speedValue = (state.isShiftPressed ? GameConfig.physics.gallopSpeed : GameConfig.physics.trotSpeed) * dtScale;
      if (state.isBursting) {
        speedValue = GameConfig.physics.burstSpeed * dtScale;
      }

      let moved = false;
      let walkBob = 0;

      if (state.isBursting) {
        state.burstTimer -= dtScale;
        if (state.burstTimer <= 0) {
          state.isBursting = false;
          state.burstTimer = 0;
        }
      }

      if (state.isMovingForward || state.isBursting) {
        const dirX = TrigLUT.sin(state.currentAngle);
        const dirY = -TrigLUT.cos(state.currentAngle);

        const nextX = state.x + dirX * speedValue;
        const nextY = state.y + dirY * speedValue;

        const res = MovementEngine.tryMove({
          currentX: state.x,
          currentY: state.y,
          nextX,
          nextY,
          room: state.room,
          templeMaze: state.templeMaze
        });
        if (res.allowed) {
          if (res.transition) {
            state.room = res.transition;
            state.x = res.rx;
            state.y = res.ry;
            moved = true;
            state.isBursting = false;
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
          if (now - lastWallHitTime >= 350) {
            lastWallHitTime = now;
            soundEngine.playSfx(9, state.room === 'TEMPLE' ? 'TEMPLE' : (state.room === 'FOYER' ? 'HALLWAY' : 'NONE'), state.room);
            speak(WorldRegistry.rooms[state.room].wallHitText);
          }
        }
      }

      if (state.isMovingBackward) {
        const dirX = TrigLUT.sin(state.currentAngle);
        const dirY = -TrigLUT.cos(state.currentAngle);

        const nextX = state.x - dirX * speedValue;
        const nextY = state.y - dirY * speedValue;

        const res = MovementEngine.tryMove({
          currentX: state.x,
          currentY: state.y,
          nextX,
          nextY,
          room: state.room,
          templeMaze: state.templeMaze
        });
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
          if (now - lastWallHitTime >= 350) {
            lastWallHitTime = now;
            soundEngine.playSfx(9, state.room === 'TEMPLE' ? 'TEMPLE' : (state.room === 'FOYER' ? 'HALLWAY' : 'NONE'), state.room);
            speak(WorldRegistry.rooms[state.room].wallHitText);
          }
        }
      }

      // Bobbing & sample-accurate step/gallop audio via PhysicsEngine
      if (moved) {
        const isGalloping = state.isShiftPressed;
        const stride = PhysicsEngine.evaluateStride(state.bobFrame, isGalloping, dtScale);
        state.bobFrame = stride.nextBobFrame;
        walkBob = stride.walkBob;

        const currentReverb = state.room === 'TEMPLE' ? 'TEMPLE' : (state.room === 'FOYER' ? 'HALLWAY' : 'NONE');

        if (isGalloping) {
          if (stride.gallopCycleAdvanced) {
            soundEngine.playGallopCycle(currentReverb, state.room);
          }
        } else if (stride.isStepTransition) {
          soundEngine.playSfx(stride.isLeftFoot ? 1 : 2, currentReverb, state.room);
        }
      } else {
        state.bobFrame = 0;
      }

      // 3. Jump physics arc via PhysicsEngine
      if (state.jumpZ > 0) {
        const jumpRes = PhysicsEngine.evaluateJumpArc(state.jumpZ, state.jumpVelocity, GameConfig.physics.gravity, dtScale);
        state.jumpZ = jumpRes.nextZ;
        state.jumpVelocity = jumpRes.nextVelocity;

        if (jumpRes.hasLanded) {
          const landReverb = state.room === 'TEMPLE' ? 'TEMPLE' : (state.room === 'FOYER' ? 'HALLWAY' : 'NONE');
          soundEngine.playSfx(4, landReverb, state.room);
          if (state.settings.jumpNotificationsEnabled) {
            if (state.room === 'TEMPLE') {
              speak("Landed paddingly on chiseled temple flooring.");
            } else {
              speak("Landed paddingly on royal checked floor.");
            }
          }
        }
      }

      if (state.barkTimer > 0) state.barkTimer = Math.max(0, state.barkTimer - dtScale);
      if (state.petTimer > 0) {
        state.petTimer = Math.max(0, state.petTimer - dtScale);
        if (state.petTimer === 0) {
          state.handState = 'DEFAULT';
        }
      }

      const isActivelyMoving = moved || isTurning || state.jumpZ > 0;

      // Sync React HUD state at ~7.5 Hz during movement, or immediately when settling / state toggles
      state.frameCounter++;
      if ((wasActivelyMoving && !isActivelyMoving) || ((state.frameCounter & 7) === 0)) {
        cpuUnit.schedule(syncUiState);
      }
      wasActivelyMoving = isActivelyMoving;

      // --- 4. Mode-7 2.5D Perspective Floor and Ceiling Renderer ---
      const cosLook = TrigLUT.cos(state.currentAngle);
      const sinLook = TrigLUT.sin(state.currentAngle);
      const spriteScale = VisualAnimationGeometry.computeUniformSpriteFitScale(renderWidth, renderHeight, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      const riderEyeHeight = cachedRiderSpecs.eyeHeight + (state.jumpZ * 0.45);

      const isWorldUnchanged =
        worldCacheValid &&
        cachedRoom === state.room &&
        cachedVisualMode === state.visualMode &&
        cachedRenderWidth === renderWidth &&
        cachedRenderHeight === renderHeight &&
        Math.abs(cachedX - state.x) < 1e-4 &&
        Math.abs(cachedY - state.y) < 1e-4 &&
        Math.abs(cachedAngle - state.currentAngle) < 1e-4 &&
        Math.abs(cachedWalkBob - walkBob) < 1e-4 &&
        Math.abs(cachedJumpZ - state.jumpZ) < 1e-4 &&
        Math.abs(cachedEyeHeight - riderEyeHeight) < 1e-4;

      const didRasterizeWorld = !(isWorldUnchanged && worldCacheCtx);
      if (!didRasterizeWorld && worldCacheCtx) {
        ctx.drawImage(worldCacheCanvas, 0, 0);
      } else {
        const horizon = VisualAnimationGeometry.computeHorizonRow(
          renderHeight,
          -walkBob + (state.jumpZ * 1.5),
          renderHeight / VIRTUAL_HEIGHT
        );
        const safeHorizon = horizon === 0 ? 1 : horizon;
        const useDepthFog = state.visualMode !== '2D_CLASSIC';

        GraphicalRendererEngine.renderWorldScanlines32({
          data32,
          renderWidth,
          renderHeight,
          horizon,
          safeHorizon,
          worldX: state.x,
          worldY: state.y,
          cosLook,
          sinLook,
          fovScale: FOV_SCALE,
          riderEyeHeight,
          ceilingHeight: currentRoomData.ceilingHeight,
          room: state.room,
          useDepthFog,
          templeMaze: state.templeMaze
        });

        const drawPortalOverlay = (targetCtx: CanvasRenderingContext2D) => {
          if (state.visualMode !== 'HYBRID_2D_3D') return;
          const focalPx = FOV_SCALE * (renderHeight / VIRTUAL_HEIGHT);
          let portalY = -1;
          const portalColor = PORTAL_OVERLAY_COLORS[state.room];
          if (state.room === 'FOYER') portalY = 0;
          else if (state.room === 'GARDEN') portalY = gardenData.height;
          else if (state.room === 'PORCH') portalY = porchData.height;

          if (portalY >= 0) {
            VisualAnimation3D.projectPerspectiveInto(projLeftBase, doorMinX, portalY, 0, state.x, state.y, riderEyeHeight, state.currentAngle, focalPx, renderWidth, renderHeight, horizon);
            VisualAnimation3D.projectPerspectiveInto(projLeftTop, doorMinX, portalY, 12, state.x, state.y, riderEyeHeight, state.currentAngle, focalPx, renderWidth, renderHeight, horizon);
            VisualAnimation3D.projectPerspectiveInto(projRightBase, doorMaxX, portalY, 0, state.x, state.y, riderEyeHeight, state.currentAngle, focalPx, renderWidth, renderHeight, horizon);
            VisualAnimation3D.projectPerspectiveInto(projRightTop, doorMaxX, portalY, 12, state.x, state.y, riderEyeHeight, state.currentAngle, focalPx, renderWidth, renderHeight, horizon);

            if (projLeftBase.depth > 2 && projRightBase.depth > 2 && (projLeftBase.isVisible || projRightBase.isVisible)) {
              targetCtx.save();
              targetCtx.strokeStyle = portalColor;
              targetCtx.globalAlpha = 0.28;
              targetCtx.lineWidth = Math.max(1.5, renderHeight / 150);
              targetCtx.beginPath();
              targetCtx.moveTo(projLeftBase.screenX, projLeftBase.screenY);
              targetCtx.lineTo(projLeftTop.screenX, projLeftTop.screenY);
              targetCtx.lineTo(projRightTop.screenX, projRightTop.screenY);
              targetCtx.lineTo(projRightBase.screenX, projRightBase.screenY);
              targetCtx.stroke();
              targetCtx.restore();
            }
          }
        };

        // Direct single blit while moving/turning/jumping; populate offscreen cache when stationary
        if (!isActivelyMoving && worldCacheCtx) {
          worldCacheCtx.putImageData(imgData, 0, 0);
          drawPortalOverlay(worldCacheCtx);
          ctx.drawImage(worldCacheCanvas, 0, 0);
          worldCacheValid = true;
          cachedX = state.x;
          cachedY = state.y;
          cachedAngle = state.currentAngle;
          cachedWalkBob = walkBob;
          cachedJumpZ = state.jumpZ;
          cachedRoom = state.room;
          cachedVisualMode = state.visualMode;
          cachedEyeHeight = riderEyeHeight;
          cachedRenderWidth = renderWidth;
          cachedRenderHeight = renderHeight;
        } else {
          ctx.putImageData(imgData, 0, 0);
          drawPortalOverlay(ctx);
          worldCacheValid = false;
        }
      }

      // --- 5. Draw Beagle & Rider Sprite Overlays (Simulated 3-D Volumetric + 2-D Layer) ---
      ctx.save();
      ctx.translate(renderWidth / 2, 0);
      ctx.scale(spriteScale, spriteScale);
      ctx.translate(-VIRTUAL_WIDTH / 2, 0);

      if (state.visualMode !== '2D_CLASSIC') {
        VisualAnimation2D.calculateDepthForeshorteningInto(depthSimScratch, state.bobFrame, state.isLeaning);
        ctx.translate(centerX, VIRTUAL_HEIGHT);
        ctx.scale(depthSimScratch.scaleX, depthSimScratch.scaleY);
        ctx.translate(-centerX, -VIRTUAL_HEIGHT + depthSimScratch.zShift * 0.25);
      }

      const aiVisual = InGameAIVisualsEngine.evaluateCanineVisualStateInto(
        aiVisualScratch,
        cachedBeagleSpecs,
        moved,
        state.barkTimer > 0,
        state.petTimer > 0
      );

      const paletteEntry = VisualAnimationColorPalette.beaglePalette[state.selectedBeagle] || VisualAnimationColorPalette.beaglePalette.JETTA;
      const extraAppearance = BEAGLE_EXTRA_APPEARANCE[state.selectedBeagle] || BEAGLE_EXTRA_APPEARANCE.JETTA;
      const leanOffset = state.isLeaning ? 12 : 0;
      const baseHeadY = VIRTUAL_HEIGHT - extraAppearance.height - (walkBob * 0.95) + (state.jumpZ * 1.12) + leanOffset;
      const useSim3D = state.visualMode !== '2D_CLASSIC';

      const coatColor = paletteEntry.coat;
      const saddleColor = paletteEntry.saddle;
      const skinColor = extraAppearance.skin;
      const earColor = paletteEntry.ear;
      const eyeColor = paletteEntry.eye;
      const collarColor = paletteEntry.collar;
      const decorationColor = extraAppearance.decoration;
      const headRadius = extraAppearance.headRadius;

      const nextCharCacheKey = `${state.selectedBeagle}|${state.selectedRider}|${useSim3D ? 1 : 0}`;
      if (charCacheKey !== nextCharCacheKey) {
        charCacheKey = nextCharCacheKey;
        if (useSim3D) {
          const bodyGrad = ctx.createRadialGradient(centerX - 16, VIRTUAL_HEIGHT - 18, 6, centerX, VIRTUAL_HEIGHT + 8, 68);
          bodyGrad.addColorStop(0, VisualAnimation3D.shadeHexColor(coatColor, highlightMult));
          bodyGrad.addColorStop(0.55, coatColor);
          bodyGrad.addColorStop(1, VisualAnimation3D.shadeHexColor(coatColor, shadowMult));
          cachedBodyGrad = bodyGrad;

          const saddleGrad = ctx.createRadialGradient(centerX - 8, VIRTUAL_HEIGHT - 6, 3, centerX, VIRTUAL_HEIGHT + 6, 32);
          saddleGrad.addColorStop(0, VisualAnimation3D.shadeHexColor(saddleColor, highlightMult));
          saddleGrad.addColorStop(0.65, saddleColor);
          saddleGrad.addColorStop(1, VisualAnimation3D.shadeHexColor(saddleColor, shadowMult));
          cachedSaddleGrad = saddleGrad;

          const collarGrad = ctx.createLinearGradient(centerX - 25, 7, centerX + 25, 21);
          collarGrad.addColorStop(0, VisualAnimation3D.shadeHexColor(collarColor, shadowMult));
          collarGrad.addColorStop(0.45, VisualAnimation3D.shadeHexColor(collarColor, highlightMult));
          collarGrad.addColorStop(1, VisualAnimation3D.shadeHexColor(collarColor, shadowMult));
          cachedCollarGrad = collarGrad;

          const headGrad = ctx.createRadialGradient(centerX - 6, -16, 3, centerX, -10, headRadius + 2);
          headGrad.addColorStop(0, VisualAnimation3D.shadeHexColor(coatColor, highlightMult));
          headGrad.addColorStop(0.65, coatColor);
          headGrad.addColorStop(1, VisualAnimation3D.shadeHexColor(coatColor, shadowMult));
          cachedHeadGrad = headGrad;

          const legGrad = ctx.createLinearGradient(centerX - 55, VIRTUAL_HEIGHT - 20, centerX + 55, VIRTUAL_HEIGHT + 35);
          legGrad.addColorStop(0, VisualAnimation3D.shadeHexColor(cachedRiderSpecs.primaryColor, highlightMult));
          legGrad.addColorStop(0.5, cachedRiderSpecs.primaryColor);
          legGrad.addColorStop(1, VisualAnimation3D.shadeHexColor(cachedRiderSpecs.primaryColor, shadowMult));
          cachedLegGrad = legGrad;
        } else {
          cachedBodyGrad = coatColor;
          cachedSaddleGrad = saddleColor;
          cachedCollarGrad = collarColor;
          cachedHeadGrad = coatColor;
          cachedLegGrad = cachedRiderSpecs.primaryColor;
        }
      }

      // A. Main body shoulders/back segment
      ctx.fillStyle = cachedBodyGrad;
      ctx.strokeStyle = state.selectedBeagle === 'ELSA' ? '#E6EE9C' : '#E0DCD8';
      ctx.beginPath();
      ctx.arc(centerX - 35, VIRTUAL_HEIGHT + 5, 45, 0, Math.PI * 2);
      ctx.arc(centerX + 35, VIRTUAL_HEIGHT + 5, 45, 0, Math.PI * 2);
      ctx.arc(centerX, VIRTUAL_HEIGHT + 10, 50, 0, Math.PI * 2);
      ctx.fill();

      // Saddle mark
      ctx.fillStyle = cachedSaddleGrad;
      ctx.beginPath();
      ctx.ellipse(centerX, VIRTUAL_HEIGHT + 5, 30, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      // Neck skin peeking
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.ellipse(centerX, baseHeadY + 5, 12, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // B. Collar (drawn inside baseHeadY-translated space so cached collarGrad aligns identically)
      ctx.save();
      ctx.translate(0, baseHeadY);
      ctx.fillStyle = cachedCollarGrad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(centerX, 14, 25, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = decorationColor;
      ctx.stroke();
      ctx.restore();

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

      // C. Head (drawn inside baseHeadY-translated space so cached headGrad aligns identically)
      ctx.save();
      ctx.translate(0, baseHeadY);
      ctx.fillStyle = cachedHeadGrad;
      ctx.beginPath();
      // Thelma's head is slightly wider
      ctx.arc(centerX, -10, headRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Thelma's Tiara
      if (state.selectedBeagle === 'THELMA') {
        ctx.fillStyle = useSim3D ? tiaraSimColor : '#FFD700'; // Gold
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
      const leftEarBob = VisualAnimation2D.calculateEarBob(state.bobFrame, aiVisual.earFlopFrequencyHz, 2.0);
      ctx.beginPath();
      ctx.ellipse(centerX - 22, baseHeadY - 2 + leftEarBob, 11, 20, Math.PI / 10, 0, Math.PI * 2);
      ctx.fill();

      const rightEarBob = -leftEarBob;
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
      const isTinaPetting = state.selectedBeagle === 'TINA' && state.petTimer > 0;
      const tailBob = VisualAnimation2D.calculateTailSwing(state.bobFrame, isTinaPetting, aiVisual.tailWagAmplitudeDeg * 0.35);
      ctx.moveTo(centerX, VIRTUAL_HEIGHT + 10);
      ctx.quadraticCurveTo(centerX + 15 + tailBob, VIRTUAL_HEIGHT - 15, centerX + 20 + tailBob, VIRTUAL_HEIGHT - 45);
      ctx.stroke();

      // Tail tip (White or dynamic)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(centerX + 20 + tailBob, VIRTUAL_HEIGHT - 45, 4, 0, Math.PI * 2);
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
      const handBobY = VisualAnimation2D.calculateHandBob(state.bobFrame, 1.2);
      const riderSkinColor = cachedRiderSpecs.skinColor;

      // Draw Rider's legs "molded into fur" - ONLY in RIDER mode
      if (state.viewMode === 'RIDER') {
        ctx.fillStyle = cachedLegGrad;
        ctx.beginPath();
        // Left leg
        ctx.ellipse(centerX - 40, VIRTUAL_HEIGHT + 10, 15, 30, Math.PI / 6, 0, Math.PI * 2);
        // Right leg
        ctx.ellipse(centerX + 40, VIRTUAL_HEIGHT + 10, 15, 30, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Fairy-Rider's green triangles (verified via Shoelace CCW winding geometry)
        if (cachedRiderSpecs.hasTrianglesOnLegs) {
          ctx.fillStyle = '#4CAF50';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 0.5;
          if (fairyLeftTriValid) {
            ctx.beginPath();
            ctx.moveTo(fairyLeftTri[0].x, fairyLeftTri[0].y);
            ctx.lineTo(fairyLeftTri[1].x, fairyLeftTri[1].y);
            ctx.lineTo(fairyLeftTri[2].x, fairyLeftTri[2].y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
          if (fairyRightTriValid) {
            ctx.beginPath();
            ctx.moveTo(fairyRightTri[0].x, fairyRightTri[0].y);
            ctx.lineTo(fairyRightTri[1].x, fairyRightTri[1].y);
            ctx.lineTo(fairyRightTri[2].x, fairyRightTri[2].y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        }

        // Mary's Puffy shoulders and dress logic
        if (cachedRiderSpecs.hasPuffyShoulders) {
          ctx.fillStyle = useSim3D ? shoulderPuffSimColor : '#F06292';
          ctx.beginPath();
          ctx.arc(centerX - 50, VIRTUAL_HEIGHT - 20, 12, 0, Math.PI * 2);
          ctx.arc(centerX + 50, VIRTUAL_HEIGHT - 20, 12, 0, Math.PI * 2);
          ctx.fill();

          // White Apron
          ctx.fillStyle = '#FAFAFA';
          ctx.beginPath();
          ctx.ellipse(centerX, VIRTUAL_HEIGHT + 20, 30, 20, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (state.handState === 'PETTING') {
        ctx.fillStyle = riderSkinColor;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.0;

        ctx.beginPath();
        ctx.arc(centerX - 24 + handBobY, baseHeadY - 14, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX + 24 - handBobY, baseHeadY - 14, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FF3366';
        ctx.font = '10px Courier New';
        ctx.fillText('💖', centerX - 25, baseHeadY - 36 + (state.petTimer % 10));
        ctx.fillText('💖', centerX + 25, baseHeadY - 42 + (state.petTimer % 8));
      } else if (state.handState === 'GRASPING') {
        ctx.fillStyle = riderSkinColor;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.0;

        ctx.beginPath();
        ctx.roundRect(centerX - 12, baseHeadY + 12 + handBobY, 8, 8, 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.roundRect(centerX + 4, baseHeadY + 12 + handBobY, 8, 8, 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#FF3366';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - 8, baseHeadY + 14 + handBobY);
        ctx.lineTo(centerX - 22, VIRTUAL_HEIGHT);
        ctx.moveTo(centerX + 8, baseHeadY + 14 + handBobY);
        ctx.lineTo(centerX + 22, VIRTUAL_HEIGHT);
        ctx.stroke();
      } else {
        ctx.fillStyle = riderSkinColor;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.0;

        ctx.beginPath();
        ctx.arc(centerX - 35, baseHeadY + 28, 6, 0, Math.PI * 2);
        ctx.arc(centerX + 35, baseHeadY + 28, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 99, 132, 0.45)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(centerX - 35, baseHeadY + 28);
        ctx.bezierCurveTo(centerX - 20, baseHeadY + 18, centerX - 12, baseHeadY + 14, centerX - 12, baseHeadY + 14);
        ctx.moveTo(centerX + 35, baseHeadY + 28);
        ctx.bezierCurveTo(centerX + 20, baseHeadY + 18, centerX + 12, baseHeadY + 14, centerX + 12, baseHeadY + 14);
        ctx.stroke();
      }

      ctx.restore();
      VisualAnimationEngine.resetFrameTemporaries();
      HardwareVirtualization.endFrame(performance.now() - frameWorkStart, didRasterizeWorld);

      animFrameId = requestAnimationFrame(updateAndDraw);
    };

    animFrameId = requestAnimationFrame(updateAndDraw);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animFrameId);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', measureContainer);
      ramUnit.release(framebufferSlab);
    };
  }, []); // Stable mount lifecycle: reads live settings via stateRef without rebuilding canvas/RAM slab

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      
      {/* 1. Header Area with exact specified content */}
      <header className="bg-slate-950 border-b border-slate-800 py-3 px-6 flex justify-between items-center shadow-md relative z-10">
        <div className="flex items-center gap-3">
          <Dog className="w-8 h-8 text-pink-400" />
          <h1 className="text-sm font-bold tracking-wider leading-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-indigo-400">
            Beagle Ride<br />D&D
          </h1>
        </div>

        {/* Display Current Cardinal Compass Dial */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-full px-4 py-1">
          <CompassIcon className="w-4 h-4 text-emerald-400" />
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
          
          {/* Compass Strip overlay (controlled by View -> Compass toggle) */}
          {settings.compassEnabled && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <CompassIcon className="w-5 h-5 text-pink-400" />
                <div className="font-mono text-xs">
                  <span className="text-slate-500">Angle:</span> <span className="text-slate-200">{Math.round(uiPosition.angle)}°</span>
                </div>
              </div>

              {/* Simulated moving horizontal navigation tape */}
              <div className="relative w-48 h-6 bg-slate-900 border border-slate-800 rounded-md overflow-hidden flex items-center justify-center font-mono">
                <div 
                  className="absolute flex gap-12 text-xxs font-bold text-slate-500"
                  style={{ 
                    transform: `translateX(${-((uiPosition.angle % 360) / 360) * 120 + 40}px)`,
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
          )}

          <MenuBar settings={settings} onUpdateSettings={setSettings} onTakeScreenshot={handleTakeScreenshot} />
          <div id="HUD_Controls" className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-end gap-3 shadow-lg mb-4">
            <button
              onClick={() => {
                const modes = VisualsModule.supportedModes;
                const next = modes[(modes.indexOf(visualMode) + 1) % modes.length];
                setVisualMode(next);
                soundEngine.playSfx(12);
                const label = next === 'HYBRID_2D_3D' ? 'Hybrid 2-D and 3-D' : (next === 'SIMULATED_3D' ? 'Simulated 3-D' : '2-D Classic');
                speak(`Visual pipeline set to ${label}.`);
              }}
              className="cursor-pointer px-3 py-1.5 rounded-md text-xs font-mono flex items-center gap-1.5 border border-indigo-500/40 bg-slate-900 text-indigo-300 hover:border-indigo-400 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {visualMode === 'HYBRID_2D_3D' ? '2-D + 3-D' : (visualMode === 'SIMULATED_3D' ? 'Sim 3-D' : '2-D Classic')}
            </button>
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
          <div className="bg-slate-950/80 border-2 border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center relative group shadow-2xl overflow-hidden">
            
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

            {/* HTML5 canvas dynamically sized to ANY screen via ResizeObserver + HardwareVirtualization */}
            <div ref={canvasContainerRef} className="w-full min-h-[260px] h-[52vh] lg:h-[60vh] flex items-center justify-center">
              <canvas
                ref={canvasRef}
                style={{
                  backgroundColor: '#000000',
                  imageRendering: 'pixelated',
                }}
                className="w-full h-full rounded-lg shadow-xl border-4 border-slate-950"
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
