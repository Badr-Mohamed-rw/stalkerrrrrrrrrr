import * as THREE from 'three';

// ============= CONSTANTS =============
const MOVE_SPEED = 0.08;
const RUN_SPEED = 0.14;
const MOUSE_SENS = 0.002;
const PLAYER_HEIGHT = 1.7;
const GRAVITY = 0.01;
const JUMP_FORCE = 0.15;

// ============= MAP DATA - Pripyat =============
const MAP_SIZE = 200;

interface Building {
  x: number; z: number; w: number; d: number; h: number;
  color: number; type: string;
}

interface MapData {
  buildings: Building[];
  trees: { x: number; z: number }[];
  anomalies: { x: number; z: number; type: string }[];
  spawnPoints: { x: number; z: number }[];
}

function generatePripyatMap(): MapData {
  const buildings: Building[] = [];
  const trees: { x: number; z: number }[] = [];
  const anomalies: { x: number; z: number; type: string }[] = [];
  const spawnPoints: { x: number; z: number }[] = [];

  // Main apartment blocks (like the famous Pripyat buildings)
  const blockPositions = [
    { x: -40, z: -40, w: 20, d: 8, h: 15 },
    { x: -40, z: -20, w: 20, d: 8, h: 12 },
    { x: 30, z: -50, w: 15, d: 10, h: 18 },
    { x: 30, z: -25, w: 15, d: 10, h: 14 },
    { x: -60, z: 20, w: 25, d: 8, h: 16 },
    { x: 50, z: 30, w: 18, d: 12, h: 10 },
    { x: 0, z: 60, w: 30, d: 10, h: 8 },
    { x: -30, z: 50, w: 12, d: 12, h: 20 },
    { x: 60, z: -10, w: 10, d: 15, h: 12 },
    { x: -70, z: -60, w: 15, d: 8, h: 10 },
    { x: 70, z: -60, w: 12, d: 12, h: 14 },
    { x: -20, z: -70, w: 8, d: 8, h: 6 },
    { x: 20, z: 70, w: 10, d: 10, h: 8 },
    { x: -80, z: 0, w: 14, d: 8, h: 11 },
    { x: 80, z: 0, w: 14, d: 8, h: 11 },
  ];

  blockPositions.forEach(b => {
    buildings.push({
      ...b,
      color: 0x3a3a2a + Math.floor(Math.random() * 0x101010),
      type: 'building'
    });
  });

  // Small structures / shacks
  for (let i = 0; i < 20; i++) {
    const x = (Math.random() - 0.5) * 160;
    const z = (Math.random() - 0.5) * 160;
    const tooClose = buildings.some(b => 
      Math.abs(b.x - x) < b.w/2 + 5 && Math.abs(b.z - z) < b.d/2 + 5
    );
    if (!tooClose) {
      buildings.push({
        x, z,
        w: 3 + Math.random() * 4,
        d: 3 + Math.random() * 4,
        h: 2 + Math.random() * 3,
        color: 0x2a2a1a + Math.floor(Math.random() * 0x0a0a0a),
        type: 'shack'
      });
    }
  }

  // Walls and fences
  const walls = [
    { x: 0, z: -85, w: 170, d: 1, h: 3 },
    { x: 0, z: 85, w: 170, d: 1, h: 3 },
    { x: -85, z: 0, w: 1, d: 170, h: 3 },
    { x: 85, z: 0, w: 1, d: 170, h: 3 },
  ];
  walls.forEach(w => {
    buildings.push({ ...w, color: 0x4a4a3a, type: 'wall' });
  });

  // Trees (dead trees)
  for (let i = 0; i < 80; i++) {
    const x = (Math.random() - 0.5) * 160;
    const z = (Math.random() - 0.5) * 160;
    const tooClose = buildings.some(b => 
      Math.abs(b.x - x) < b.w/2 + 2 && Math.abs(b.z - z) < b.d/2 + 2
    );
    if (!tooClose) {
      trees.push({ x, z });
    }
  }

  // Anomalies
  for (let i = 0; i < 12; i++) {
    anomalies.push({
      x: (Math.random() - 0.5) * 140,
      z: (Math.random() - 0.5) * 140,
      type: ['fire', 'electric', 'gravity'][Math.floor(Math.random() * 3)]
    });
  }

  // Spawn points for mutants
  for (let i = 0; i < 15; i++) {
    spawnPoints.push({
      x: (Math.random() - 0.5) * 120,
      z: (Math.random() - 0.5) * 120
    });
  }

  return { buildings, trees, anomalies, spawnPoints };
}

// ============= PROCEDURAL TEXTURES =============
function createConcreteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#4a4a3a';
  ctx.fillRect(0, 0, 256, 256);
  
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const c = 40 + Math.random() * 40;
    ctx.fillStyle = `rgb(${c},${c},${c-10})`;
    ctx.fillRect(x, y, 1 + Math.random() * 3, 1 + Math.random() * 3);
  }
  
  // Cracks
  ctx.strokeStyle = '#2a2a1a';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    let x = Math.random() * 256;
    let y = Math.random() * 256;
    ctx.moveTo(x, y);
    for (let j = 0; j < 8; j++) {
      x += (Math.random() - 0.5) * 40;
      y += Math.random() * 30;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  
  // Stains
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 5 + Math.random() * 20;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, 'rgba(30,40,20,0.3)');
    gradient.addColorStop(1, 'rgba(30,40,20,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createGroundTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#3a3520';
  ctx.fillRect(0, 0, 512, 512);
  
  // Dirt patches
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const g = 30 + Math.random() * 30;
    ctx.fillStyle = `rgb(${g+10},${g+5},${g-10})`;
    ctx.fillRect(x, y, 1 + Math.random() * 4, 1 + Math.random() * 4);
  }
  
  // Dead grass
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.strokeStyle = `rgba(${60+Math.random()*30},${50+Math.random()*20},${20},0.5)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random()-0.5)*8, y - 3 - Math.random()*5);
    ctx.stroke();
  }
  
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(20, 20);
  return tex;
}

function createRustTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(0, 0, 128, 128);
  
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    const r = 60 + Math.random() * 40;
    const g = 30 + Math.random() * 30;
    ctx.fillStyle = `rgb(${r},${g},10)`;
    ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// ============= MUTANT CLASS =============
interface Mutant {
  mesh: THREE.Group;
  health: number;
  maxHealth: number;
  speed: number;
  type: 'dog' | 'bloodsucker' | 'zombie';
  state: 'idle' | 'chase' | 'attack' | 'dead';
  attackCooldown: number;
  animTime: number;
  targetPos: THREE.Vector3;
}

// ============= WEAPON SYSTEM =============
type WeaponType = 'knife' | 'pistol' | 'shotgun';

interface Weapon {
  type: WeaponType;
  damage: number;
  fireRate: number;
  ammo: number;
  maxAmmo: number;
  lastFire: number;
  mesh: THREE.Group;
  bobTime: number;
}

// ============= PARTICLE SYSTEM =============
interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

// ============= AUDIO SYSTEM =============
class AudioSystem {
  private ctx: AudioContext | null = null;
  private windNode: OscillatorNode | null = null;
  private windGain: GainNode | null = null;
  private geigerInterval: any = null;
  
  init() {
    if (this.ctx) return; // Already initialized
    try {
      this.ctx = new AudioContext();
      this.startWind();
    } catch(e) {
      console.log('Audio not available');
    }
  }
  
  private startWind() {
    if (!this.ctx) return;
    
    // Wind noise using filtered noise
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    filter.Q.value = 1;
    
    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0.05;
    
    noise.connect(filter);
    filter.connect(this.windGain);
    this.windGain.connect(this.ctx.destination);
    noise.start();
    
    // Modulate wind
    setInterval(() => {
      if (this.windGain && this.ctx) {
        const target = 0.03 + Math.random() * 0.04;
        this.windGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 2);
      }
    }, 3000);
  }
  
  playGeiger(intensity: number) {
    if (!this.ctx || intensity < 10) return;
    
    const rate = Math.floor(200 / intensity);
    if (this.geigerInterval) clearInterval(this.geigerInterval);
    
    this.geigerInterval = setInterval(() => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 2000 + Math.random() * 2000;
      gain.gain.value = 0.02;
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.02);
    }, Math.max(50, 500 - intensity * 4));
  }
  
  playShoot(type: string) {
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const noise = this.ctx.createBufferSource();
    
    // Create noise burst
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.02));
    }
    noise.buffer = buffer;
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = type === 'shotgun' ? 0.3 : 0.15;
    
    noise.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start();
    
    // Low thump
    osc.type = 'sine';
    osc.frequency.value = type === 'shotgun' ? 60 : 100;
    gain.gain.value = 0.2;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }
  
  playHit() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 150;
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }
  
  stopGeiger() {
    if (this.geigerInterval) {
      clearInterval(this.geigerInterval);
      this.geigerInterval = null;
    }
  }
}

// ============= MAIN GAME ENGINE =============
export class GameEngine {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;
  
  // Player
  private playerPos: THREE.Vector3;
  private playerVel: THREE.Vector3;
  private yaw: number = 0;
  private pitch: number = 0;
  private isGrounded: boolean = true;
  private isRunning: boolean = false;
  private health: number = 100;
  private radiation: number = 0;
  private stamina: number = 100;
  
  // Input
  private keys: Set<string> = new Set();
  private mouseLocked: boolean = false;
  
  // World
  private mapData: MapData;
  private buildingBoxes: THREE.Box3[] = [];
  private mutants: Mutant[] = [];
  private particles: Particle[] = [];
  
  // Weapons
  private weapons: Weapon[] = [];
  private currentWeapon: number = 0;
  
  // Atmosphere
  private fog!: THREE.FogExp2;
  private ambientLight!: THREE.AmbientLight;
  private flashlight!: THREE.SpotLight;
  private flashlightOn: boolean = true;
  
  // Animation
  private walkBobTime: number = 0;
  private headBob: number = 0;
  private breathTime: number = 0;
  
  // Audio
  private audio!: AudioSystem;
  
  // Atmospheric particles
  private rainParticles: THREE.Points | null = null;
  private dustParticles: THREE.Points | null = null;
  
  // Callbacks
  private onHealthChange: (h: number) => void = () => {};
  private onRadiationChange: (r: number) => void = () => {};
  private onStaminaChange: (s: number) => void = () => {};
  private onAmmoChange: (a: number, m: number) => void = () => {};
  private onWeaponChange: (w: string) => void = () => {};
  private onMessage: (msg: string) => void = () => {};
  private onDeath: () => void = () => {};
  private onMinimapUpdate: (data: any) => void = () => {};

  constructor(canvas: HTMLCanvasElement) {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.4;
    
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a05);
    
    // Skybox - dark cloudy sky
    this.createSkybox();
    
    // Fog
    this.fog = new THREE.FogExp2(0x1a1a0a, 0.015);
    this.scene.fog = this.fog;
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, PLAYER_HEIGHT, 0);
    
    // Clock
    this.clock = new THREE.Clock();
    
    // Player
    this.playerPos = new THREE.Vector3(0, PLAYER_HEIGHT, 0);
    this.playerVel = new THREE.Vector3();
    
    // Map
    this.mapData = generatePripyatMap();
    
    // Audio
    this.audio = new AudioSystem();
    
    // Build world
    this.buildWorld();
    this.setupLighting();
    this.createWeapons();
    this.spawnMutants();
    
    // Events
    this.setupEvents(canvas);
    
    // Start
    this.animate();
  }

  private buildWorld() {
    const concreteTex = createConcreteTexture();
    const groundTex = createGroundTexture();
    const rustTex = createRustTexture();
    
    // Ground
    const groundGeo = new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE, 50, 50);
    // Add some height variation
    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const h = Math.sin(x * 0.05) * 0.3 + Math.cos(y * 0.07) * 0.2 + Math.random() * 0.1;
      posAttr.setZ(i, h);
    }
    groundGeo.computeVertexNormals();
    
    const groundMat = new THREE.MeshStandardMaterial({ 
      map: groundTex, 
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Buildings
    this.mapData.buildings.forEach(b => {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
      
      // Create building material with windows
      const mat = new THREE.MeshStandardMaterial({
        map: concreteTex.clone(),
        roughness: 0.85,
        metalness: 0.1,
        color: b.color
      });
      
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(b.x, b.h / 2, b.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      
      // Add windows (dark holes)
      if (b.type === 'building') {
        const windowMat = new THREE.MeshBasicMaterial({ color: 0x0a0a05 });
        const floors = Math.floor(b.h / 3);
        const windowsPerFloor = Math.floor(b.w / 3);
        
        for (let f = 0; f < floors; f++) {
          for (let w = 0; w < windowsPerFloor; w++) {
            // Front face
            const winGeo = new THREE.PlaneGeometry(1.2, 1.5);
            const win = new THREE.Mesh(winGeo, windowMat);
            win.position.set(
              b.x - b.w/2 + 1.5 + w * 3,
              1.5 + f * 3,
              b.z + b.d/2 + 0.01
            );
            this.scene.add(win);
            
            // Back face
            const win2 = win.clone();
            win2.position.z = b.z - b.d/2 - 0.01;
            win2.rotation.y = Math.PI;
            this.scene.add(win2);
          }
        }
      }
      
      // Collision box
      const box = new THREE.Box3().setFromObject(mesh);
      this.buildingBoxes.push(box);
    });
    
    // Dead trees
    this.mapData.trees.forEach(t => {
      const trunkGeo = new THREE.CylinderGeometry(0.1, 0.2, 4 + Math.random() * 3, 6);
      const trunkMat = new THREE.MeshStandardMaterial({ 
        color: 0x2a1a0a, 
        roughness: 1 
      });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(t.x, 2, t.z);
      trunk.rotation.z = (Math.random() - 0.5) * 0.2;
      trunk.rotation.x = (Math.random() - 0.5) * 0.1;
      trunk.castShadow = true;
      this.scene.add(trunk);
      
      // Branches
      for (let i = 0; i < 3; i++) {
        const branchGeo = new THREE.CylinderGeometry(0.02, 0.06, 1.5 + Math.random(), 4);
        const branch = new THREE.Mesh(branchGeo, trunkMat);
        branch.position.set(
          t.x + (Math.random()-0.5) * 0.5,
          2.5 + i * 1 + Math.random(),
          t.z + (Math.random()-0.5) * 0.5
        );
        branch.rotation.z = (Math.random() - 0.5) * 1.5;
        branch.rotation.x = (Math.random() - 0.5) * 0.5;
        this.scene.add(branch);
      }
    });
    
    // Anomalies (visual effects)
    this.mapData.anomalies.forEach(a => {
      const anomGroup = new THREE.Group();
      
      if (a.type === 'fire') {
        // Fire anomaly - orange glow
        const light = new THREE.PointLight(0xff4400, 2, 8);
        light.position.set(a.x, 1, a.z);
        this.scene.add(light);
        
        const glowGeo = new THREE.SphereGeometry(0.5, 8, 8);
        const glowMat = new THREE.MeshBasicMaterial({ 
          color: 0xff6600, 
          transparent: true, 
          opacity: 0.6 
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.set(a.x, 0.5, a.z);
        this.scene.add(glow);
      } else if (a.type === 'electric') {
        const light = new THREE.PointLight(0x4444ff, 1.5, 6);
        light.position.set(a.x, 1.5, a.z);
        this.scene.add(light);
        
        const ringGeo = new THREE.TorusGeometry(0.8, 0.05, 8, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x6666ff });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(a.x, 1, a.z);
        ring.rotation.x = Math.PI / 2;
        this.scene.add(ring);
      } else {
        // Gravity anomaly
        const light = new THREE.PointLight(0x880088, 1, 5);
        light.position.set(a.x, 2, a.z);
        this.scene.add(light);
      }
    });
    
    // Abandoned vehicles
    for (let i = 0; i < 5; i++) {
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      this.createVehicle(x, z, rustTex);
    }
    
    // Power line poles
    for (let i = 0; i < 8; i++) {
      const x = -60 + i * 17;
      const z = -70 + Math.sin(i) * 5;
      this.createPowerPole(x, z);
    }
    
    // Concrete barriers
    for (let i = 0; i < 10; i++) {
      const x = (Math.random() - 0.5) * 120;
      const z = (Math.random() - 0.5) * 120;
      const barrierGeo = new THREE.BoxGeometry(2, 0.8, 0.4);
      const barrierMat = new THREE.MeshStandardMaterial({ 
        map: concreteTex.clone(), 
        color: 0x5a5a4a,
        roughness: 0.9 
      });
      const barrier = new THREE.Mesh(barrierGeo, barrierMat);
      barrier.position.set(x, 0.4, z);
      barrier.rotation.y = Math.random() * Math.PI;
      barrier.castShadow = true;
      this.scene.add(barrier);
      
      const box = new THREE.Box3().setFromObject(barrier);
      this.buildingBoxes.push(box);
    }
    
    // Debris/rubble piles
    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * 140;
      const z = (Math.random() - 0.5) * 140;
      const rubbleGeo = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.5, 0);
      const rubbleMat = new THREE.MeshStandardMaterial({ 
        color: 0x4a4a3a + Math.floor(Math.random() * 0x101010),
        roughness: 1 
      });
      const rubble = new THREE.Mesh(rubbleGeo, rubbleMat);
      rubble.position.set(x, 0.2, z);
      rubble.rotation.set(Math.random(), Math.random(), Math.random());
      rubble.castShadow = true;
      this.scene.add(rubble);
    }
    
    // Barrels
    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * 120;
      const z = (Math.random() - 0.5) * 120;
      const barrelGeo = new THREE.CylinderGeometry(0.3, 0.3, 1, 8);
      const barrelMat = new THREE.MeshStandardMaterial({ 
        map: rustTex, 
        color: 0x4a3a1a,
        roughness: 0.8 
      });
      const barrel = new THREE.Mesh(barrelGeo, barrelMat);
      barrel.position.set(x, 0.5, z);
      barrel.castShadow = true;
      this.scene.add(barrel);
      
      const box = new THREE.Box3().setFromObject(barrel);
      this.buildingBoxes.push(box);
    }
  }

  private createVehicle(x: number, z: number, rustTex: THREE.Texture) {
    const group = new THREE.Group();
    
    // Body
    const bodyGeo = new THREE.BoxGeometry(2, 1, 4);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      map: rustTex, 
      color: 0x3a3a2a,
      roughness: 0.9 
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.7;
    body.castShadow = true;
    group.add(body);
    
    // Cabin
    const cabinGeo = new THREE.BoxGeometry(1.8, 0.8, 2);
    const cabin = new THREE.Mesh(cabinGeo, bodyMat);
    cabin.position.y = 1.5;
    cabin.position.z = -0.3;
    cabin.castShadow = true;
    group.add(cabin);
    
    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const wheelPositions = [
      [-0.9, 0.3, 1.2], [0.9, 0.3, 1.2],
      [-0.9, 0.3, -1.2], [0.9, 0.3, -1.2]
    ];
    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(wx, wy, wz);
      wheel.rotation.z = Math.PI / 2;
      group.add(wheel);
    });
    
    group.position.set(x, 0, z);
    group.rotation.y = Math.random() * Math.PI * 2;
    this.scene.add(group);
    
    const box = new THREE.Box3().setFromObject(group);
    this.buildingBoxes.push(box);
  }

  private createPowerPole(x: number, z: number) {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x3a3a2a, roughness: 0.9 });
    
    // Main pole
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.15, 8, 6);
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(x, 4, z);
    pole.rotation.z = (Math.random() - 0.5) * 0.1;
    pole.castShadow = true;
    this.scene.add(pole);
    
    // Cross bar
    const crossGeo = new THREE.BoxGeometry(3, 0.1, 0.1);
    const cross = new THREE.Mesh(crossGeo, poleMat);
    cross.position.set(x, 7.5, z);
    this.scene.add(cross);
    
    // Wires (simple lines)
    const wireMat = new THREE.LineBasicMaterial({ color: 0x1a1a1a });
    for (let w = -1; w <= 1; w++) {
      const points = [
        new THREE.Vector3(x + w, 7.5, z),
        new THREE.Vector3(x + w + 8, 7 + Math.random(), z + (Math.random()-0.5) * 2),
      ];
      // Add sag
      const mid = new THREE.Vector3(
        (points[0].x + points[1].x) / 2,
        6 + Math.random(),
        (points[0].z + points[1].z) / 2
      );
      const curve = new THREE.QuadraticBezierCurve3(points[0], mid, points[1]);
      const wireGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(10));
      const wire = new THREE.Line(wireGeo, wireMat);
      this.scene.add(wire);
    }
    
    // Collision for pole
    const poleBox = new THREE.Box3(
      new THREE.Vector3(x - 0.2, 0, z - 0.2),
      new THREE.Vector3(x + 0.2, 8, z + 0.2)
    );
    this.buildingBoxes.push(poleBox);
  }

  private setupLighting() {
    // Dim ambient
    this.ambientLight = new THREE.AmbientLight(0x2a2a1a, 0.3);
    this.scene.add(this.ambientLight);
    
    // Directional (moon)
    const moonLight = new THREE.DirectionalLight(0x4444aa, 0.2);
    moonLight.position.set(50, 80, 30);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.camera.near = 0.5;
    moonLight.shadow.camera.far = 200;
    moonLight.shadow.camera.left = -100;
    moonLight.shadow.camera.right = 100;
    moonLight.shadow.camera.top = 100;
    moonLight.shadow.camera.bottom = -100;
    this.scene.add(moonLight);
    
    // Flashlight
    this.flashlight = new THREE.SpotLight(0xffeecc, 3, 40, Math.PI / 6, 0.3, 1);
    this.flashlight.castShadow = true;
    this.flashlight.shadow.mapSize.width = 1024;
    this.flashlight.shadow.mapSize.height = 1024;
    this.scene.add(this.flashlight);
    this.scene.add(this.flashlight.target);
    
    // Random point lights (fires, etc)
    const firePositions = [
      { x: -20, z: -30 },
      { x: 40, z: 20 },
      { x: -50, z: 50 },
    ];
    firePositions.forEach(p => {
      const light = new THREE.PointLight(0xff6622, 1.5, 15);
      light.position.set(p.x, 2, p.z);
      this.scene.add(light);
    });
    
    // Rain particles
    this.createRain();
    this.createDust();
  }
  
  private createRain() {
    const rainCount = 3000;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    
    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 80;
      rainPositions[i * 3 + 1] = Math.random() * 30;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    
    const rainMat = new THREE.PointsMaterial({
      color: 0x8888aa,
      size: 0.05,
      transparent: true,
      opacity: 0.4,
    });
    
    this.rainParticles = new THREE.Points(rainGeo, rainMat);
    this.scene.add(this.rainParticles);
  }
  
  private createDust() {
    const dustCount = 500;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 60;
      dustPositions[i * 3 + 1] = Math.random() * 5;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    
    const dustMat = new THREE.PointsMaterial({
      color: 0x886644,
      size: 0.08,
      transparent: true,
      opacity: 0.3,
    });
    
    this.dustParticles = new THREE.Points(dustGeo, dustMat);
    this.scene.add(this.dustParticles);
  }
  
  private createSkybox() {
    // Create a dark sky dome
    const skyGeo = new THREE.SphereGeometry(150, 32, 32);
    
    // Create sky texture procedurally
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 512;
    skyCanvas.height = 512;
    const ctx = skyCanvas.getContext('2d')!;
    
    // Dark gradient sky
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#050510');
    gradient.addColorStop(0.3, '#0a0a15');
    gradient.addColorStop(0.6, '#1a1510');
    gradient.addColorStop(1, '#1a1a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // Clouds
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const w = 50 + Math.random() * 100;
      const h = 10 + Math.random() * 30;
      const alpha = 0.02 + Math.random() * 0.05;
      ctx.fillStyle = `rgba(40,40,30,${alpha})`;
      ctx.beginPath();
      ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Dim stars
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 200;
      ctx.fillStyle = `rgba(200,200,180,${Math.random() * 0.3})`;
      ctx.fillRect(x, y, 1, 1);
    }
    
    const skyTex = new THREE.CanvasTexture(skyCanvas);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
    });
    
    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);
  }

  private createWeapons() {
    // Knife
    const knifeGroup = new THREE.Group();
    const bladeGeo = new THREE.BoxGeometry(0.02, 0.25, 0.04);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.9, roughness: 0.2 });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.12;
    knifeGroup.add(blade);
    const handleGeo = new THREE.BoxGeometry(0.03, 0.12, 0.03);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    knifeGroup.add(handle);
    knifeGroup.position.set(0.3, -0.3, -0.5);
    knifeGroup.rotation.set(0, 0, -0.3);
    
    this.weapons.push({
      type: 'knife',
      damage: 25,
      fireRate: 400,
      ammo: Infinity,
      maxAmmo: Infinity,
      lastFire: 0,
      mesh: knifeGroup,
      bobTime: 0
    });
    
    // Pistol
    const pistolGroup = new THREE.Group();
    // Barrel
    const barrelGeo = new THREE.BoxGeometry(0.03, 0.03, 0.2);
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.8, roughness: 0.3 });
    const barrel = new THREE.Mesh(barrelGeo, gunMat);
    barrel.position.z = -0.1;
    pistolGroup.add(barrel);
    // Body
    const bodyGeo = new THREE.BoxGeometry(0.035, 0.06, 0.15);
    const body = new THREE.Mesh(bodyGeo, gunMat);
    pistolGroup.add(body);
    // Grip
    const gripGeo = new THREE.BoxGeometry(0.03, 0.1, 0.04);
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.position.set(0, -0.07, 0.04);
    grip.rotation.x = 0.2;
    pistolGroup.add(grip);
    // Magazine
    const magGeo = new THREE.BoxGeometry(0.025, 0.06, 0.03);
    const mag = new THREE.Mesh(magGeo, gunMat);
    mag.position.set(0, -0.06, 0);
    pistolGroup.add(mag);
    
    pistolGroup.position.set(0.25, -0.25, -0.4);
    
    this.weapons.push({
      type: 'pistol',
      damage: 35,
      fireRate: 300,
      ammo: 48,
      maxAmmo: 48,
      lastFire: 0,
      mesh: pistolGroup,
      bobTime: 0
    });
    
    // Shotgun
    const shotgunGroup = new THREE.Group();
    const sBarrelGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
    const sBarrel = new THREE.Mesh(sBarrelGeo, gunMat);
    sBarrel.rotation.x = Math.PI / 2;
    sBarrel.position.z = -0.2;
    shotgunGroup.add(sBarrel);
    // Stock
    const stockGeo = new THREE.BoxGeometry(0.04, 0.05, 0.2);
    const stockMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a });
    const stock = new THREE.Mesh(stockGeo, stockMat);
    stock.position.z = 0.15;
    shotgunGroup.add(stock);
    // Pump
    const pumpGeo = new THREE.BoxGeometry(0.04, 0.04, 0.1);
    const pump = new THREE.Mesh(pumpGeo, stockMat);
    pump.position.set(0, -0.02, -0.05);
    shotgunGroup.add(pump);
    
    shotgunGroup.position.set(0.3, -0.3, -0.5);
    
    this.weapons.push({
      type: 'shotgun',
      damage: 80,
      fireRate: 800,
      ammo: 20,
      maxAmmo: 20,
      lastFire: 0,
      mesh: shotgunGroup,
      bobTime: 0
    });
    
    // Add current weapon to camera
    this.camera.add(this.weapons[0].mesh);
    this.scene.add(this.camera);
  }

  private createMutantMesh(type: 'dog' | 'bloodsucker' | 'zombie'): THREE.Group {
    const group = new THREE.Group();
    
    if (type === 'dog') {
      // Mutant dog
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 });
      
      // Body
      const bodyGeo = new THREE.BoxGeometry(0.5, 0.4, 1);
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.5;
      group.add(body);
      
      // Head
      const headGeo = new THREE.BoxGeometry(0.3, 0.3, 0.4);
      const head = new THREE.Mesh(headGeo, bodyMat);
      head.position.set(0, 0.6, -0.6);
      group.add(head);
      
      // Snout
      const snoutGeo = new THREE.BoxGeometry(0.15, 0.15, 0.2);
      const snout = new THREE.Mesh(snoutGeo, bodyMat);
      snout.position.set(0, 0.55, -0.85);
      group.add(snout);
      
      // Eyes (red glowing)
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const eyeGeo = new THREE.SphereGeometry(0.04, 6, 6);
      const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
      eye1.position.set(-0.1, 0.7, -0.75);
      group.add(eye1);
      const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
      eye2.position.set(0.1, 0.7, -0.75);
      group.add(eye2);
      
      // Legs
      const legGeo = new THREE.BoxGeometry(0.1, 0.4, 0.1);
      const legPositions = [[-0.2, 0.2, -0.3], [0.2, 0.2, -0.3], [-0.2, 0.2, 0.3], [0.2, 0.2, 0.3]];
      legPositions.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, bodyMat);
        leg.position.set(lx, ly, lz);
        group.add(leg);
      });
      
      // Tail
      const tailGeo = new THREE.BoxGeometry(0.05, 0.05, 0.3);
      const tail = new THREE.Mesh(tailGeo, bodyMat);
      tail.position.set(0, 0.6, 0.6);
      tail.rotation.x = -0.5;
      group.add(tail);
      
    } else if (type === 'bloodsucker') {
      // Bloodsucker - terrifying creature
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a1a2a, roughness: 0.7 });
      
      // Body (hunched)
      const bodyGeo = new THREE.BoxGeometry(0.6, 0.8, 0.5);
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.2;
      body.rotation.x = 0.3;
      group.add(body);
      
      // Head
      const headGeo = new THREE.BoxGeometry(0.35, 0.35, 0.4);
      const head = new THREE.Mesh(headGeo, bodyMat);
      head.position.set(0, 1.7, -0.2);
      group.add(head);
      
      // Tentacles (face)
      const tentMat = new THREE.MeshStandardMaterial({ color: 0x4a1a1a });
      for (let i = 0; i < 4; i++) {
        const tentGeo = new THREE.CylinderGeometry(0.02, 0.01, 0.4, 4);
        const tent = new THREE.Mesh(tentGeo, tentMat);
        tent.position.set(
          (i - 1.5) * 0.08,
          1.5,
          -0.4
        );
        tent.rotation.x = 0.5;
        group.add(tent);
      }
      
      // Eyes
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff2200 });
      const eyeGeo = new THREE.SphereGeometry(0.05, 6, 6);
      [-0.1, 0.1].forEach(ex => {
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.position.set(ex, 1.75, -0.38);
        group.add(eye);
      });
      
      // Arms (long claws)
      const armMat = new THREE.MeshStandardMaterial({ color: 0x2a1a1a });
      [-0.4, 0.4].forEach(ax => {
        const armGeo = new THREE.BoxGeometry(0.1, 0.7, 0.1);
        const arm = new THREE.Mesh(armGeo, armMat);
        arm.position.set(ax, 0.9, -0.1);
        arm.rotation.x = 0.3;
        group.add(arm);
        
        // Claws
        const clawGeo = new THREE.ConeGeometry(0.03, 0.15, 4);
        const claw = new THREE.Mesh(clawGeo, armMat);
        claw.position.set(ax, 0.5, -0.2);
        group.add(claw);
      });
      
      // Legs
      [-0.2, 0.2].forEach(lx => {
        const legGeo = new THREE.BoxGeometry(0.15, 0.8, 0.15);
        const leg = new THREE.Mesh(legGeo, bodyMat);
        leg.position.set(lx, 0.4, 0);
        group.add(leg);
      });
      
    } else {
      // Zombie
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3a4a3a, roughness: 0.9 });
      
      // Body
      const bodyGeo = new THREE.BoxGeometry(0.5, 0.7, 0.3);
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.2;
      group.add(body);
      
      // Head
      const headGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const head = new THREE.Mesh(headGeo, bodyMat);
      head.position.set(0, 1.7, 0);
      head.rotation.z = 0.2;
      group.add(head);
      
      // Eyes
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xaaff00 });
      const eyeGeo = new THREE.SphereGeometry(0.03, 6, 6);
      [-0.08, 0.08].forEach(ex => {
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.position.set(ex, 1.75, -0.15);
        group.add(eye);
      });
      
      // Arms (outstretched)
      [-0.35, 0.35].forEach(ax => {
        const armGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
        const arm = new THREE.Mesh(armGeo, bodyMat);
        arm.position.set(ax, 1.1, -0.2);
        arm.rotation.x = -0.8;
        group.add(arm);
      });
      
      // Legs
      [-0.12, 0.12].forEach(lx => {
        const legGeo = new THREE.BoxGeometry(0.12, 0.7, 0.12);
        const leg = new THREE.Mesh(legGeo, bodyMat);
        leg.position.set(lx, 0.4, 0);
        group.add(leg);
      });
    }
    
    return group;
  }

  private spawnMutants() {
    this.mapData.spawnPoints.forEach((sp, i) => {
      const types: ('dog' | 'bloodsucker' | 'zombie')[] = ['dog', 'bloodsucker', 'zombie'];
      const type = types[i % 3];
      const mesh = this.createMutantMesh(type);
      mesh.position.set(sp.x, 0, sp.z);
      this.scene.add(mesh);
      
      const health = type === 'dog' ? 40 : type === 'bloodsucker' ? 120 : 60;
      const speed = type === 'dog' ? 0.06 : type === 'bloodsucker' ? 0.04 : 0.025;
      
      this.mutants.push({
        mesh,
        health,
        maxHealth: health,
        speed,
        type,
        state: 'idle',
        attackCooldown: 0,
        animTime: Math.random() * 100,
        targetPos: new THREE.Vector3(sp.x + (Math.random()-0.5)*10, 0, sp.z + (Math.random()-0.5)*10)
      });
    });
  }

  private setupEvents(canvas: HTMLCanvasElement) {
    // Pointer lock
    canvas.addEventListener('click', () => {
      canvas.requestPointerLock();
    });
    
    document.addEventListener('pointerlockchange', () => {
      this.mouseLocked = document.pointerLockElement === canvas;
    });
    
    // Mouse move
    document.addEventListener('mousemove', (e) => {
      if (!this.mouseLocked) return;
      this.yaw -= e.movementX * MOUSE_SENS;
      this.pitch -= e.movementY * MOUSE_SENS;
      this.pitch = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, this.pitch));
    });
    
    // Mouse click (shoot)
    document.addEventListener('mousedown', (e) => {
      if (!this.mouseLocked) return;
      if (e.button === 0) this.shoot();
    });
    
    // Keyboard
    document.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      
      if (e.code === 'ShiftLeft') this.isRunning = true;
      
      // Weapon switch
      if (e.code === 'Digit1') this.switchWeapon(0);
      if (e.code === 'Digit2') this.switchWeapon(1);
      if (e.code === 'Digit3') this.switchWeapon(2);
      
      // Flashlight
      if (e.code === 'KeyL') {
        this.flashlightOn = !this.flashlightOn;
        this.flashlight.intensity = this.flashlightOn ? 3 : 0;
      }
      
      // Jump
      if (e.code === 'Space' && this.isGrounded) {
        this.playerVel.y = JUMP_FORCE;
        this.isGrounded = false;
      }
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      if (e.code === 'ShiftLeft') this.isRunning = false;
    });
    
    // Resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private switchWeapon(index: number) {
    if (index >= 0 && index < this.weapons.length) {
      this.camera.remove(this.weapons[this.currentWeapon].mesh);
      this.currentWeapon = index;
      this.camera.add(this.weapons[this.currentWeapon].mesh);
      this.onWeaponChange(this.weapons[this.currentWeapon].type);
      this.onAmmoChange(this.weapons[this.currentWeapon].ammo, this.weapons[this.currentWeapon].maxAmmo);
    }
  }

  private shoot() {
    const weapon = this.weapons[this.currentWeapon];
    const now = Date.now();
    
    if (now - weapon.lastFire < weapon.fireRate) return;
    if (weapon.ammo <= 0) return;
    
    weapon.lastFire = now;
    if (weapon.ammo !== Infinity) weapon.ammo--;
    this.onAmmoChange(weapon.ammo, weapon.maxAmmo);
    
    // Init audio on first interaction
    this.audio.init();
    
    // Muzzle flash
    if (weapon.type !== 'knife') {
      this.createMuzzleFlash();
      this.audio.playShoot(weapon.type);
    } else {
      this.audio.playHit();
    }
    
    // Weapon recoil animation
    weapon.bobTime = -0.5;
    
    // Raycast for hit detection
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    
    // Check mutant hits
    const range = weapon.type === 'knife' ? 3 : weapon.type === 'shotgun' ? 15 : 50;
    
    this.mutants.forEach(mutant => {
      if (mutant.state === 'dead') return;
      
      const dist = this.playerPos.distanceTo(mutant.mesh.position.clone().setY(this.playerPos.y));
      if (dist > range) return;
      
      // Simple hit check - is mutant in crosshair?
      const toMutant = mutant.mesh.position.clone().sub(this.playerPos).normalize();
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
      const dot = toMutant.dot(forward);
      
      const hitThreshold = weapon.type === 'shotgun' ? 0.85 : weapon.type === 'knife' ? 0.9 : 0.95;
      
      if (dot > hitThreshold) {
        const damage = weapon.type === 'shotgun' ? weapon.damage : weapon.damage * (1 - dist/range * 0.5);
        mutant.health -= damage;
        
        // Hit particles
        this.createBloodEffect(mutant.mesh.position.clone().add(new THREE.Vector3(0, 1, 0)));
        
        if (mutant.health <= 0) {
          mutant.state = 'dead';
          mutant.mesh.rotation.x = Math.PI / 2;
          mutant.mesh.position.y = 0.3;
          this.onMessage(`${mutant.type} убит!`);
        } else {
          mutant.state = 'chase';
        }
      }
    });
  }

  private createMuzzleFlash() {
    const flashGeo = new THREE.SphereGeometry(0.05, 4, 4);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const flash = new THREE.Mesh(flashGeo, flashMat);
    
    const weapon = this.weapons[this.currentWeapon];
    flash.position.copy(weapon.mesh.position);
    flash.position.z -= 0.2;
    this.camera.add(flash);
    
    setTimeout(() => {
      this.camera.remove(flash);
    }, 50);
  }

  private createBloodEffect(pos: THREE.Vector3) {
    for (let i = 0; i < 8; i++) {
      const geo = new THREE.SphereGeometry(0.03, 4, 4);
      const mat = new THREE.MeshBasicMaterial({ color: 0x880000 });
      const particle = new THREE.Mesh(geo, mat);
      particle.position.copy(pos);
      this.scene.add(particle);
      
      this.particles.push({
        mesh: particle,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          Math.random() * 0.1,
          (Math.random() - 0.5) * 0.1
        ),
        life: 1,
        maxLife: 1
      });
    }
  }

  private checkCollision(pos: THREE.Vector3): boolean {
    const playerBox = new THREE.Box3(
      new THREE.Vector3(pos.x - 0.3, pos.y - PLAYER_HEIGHT, pos.z - 0.3),
      new THREE.Vector3(pos.x + 0.3, pos.y + 0.1, pos.z + 0.3)
    );
    
    for (const box of this.buildingBoxes) {
      if (playerBox.intersectsBox(box)) return true;
    }
    
    // Map bounds
    if (Math.abs(pos.x) > MAP_SIZE/2 - 2 || Math.abs(pos.z) > MAP_SIZE/2 - 2) return true;
    
    return false;
  }

  private updatePlayer(delta: number) {
    // Movement direction
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    
    const speed = this.isRunning && this.stamina > 0 ? RUN_SPEED : MOVE_SPEED;
    const moveDir = new THREE.Vector3();
    
    if (this.keys.has('KeyW')) moveDir.add(forward);
    if (this.keys.has('KeyS')) moveDir.sub(forward);
    if (this.keys.has('KeyA')) moveDir.sub(right);
    if (this.keys.has('KeyD')) moveDir.add(right);
    
    if (moveDir.length() > 0) {
      moveDir.normalize().multiplyScalar(speed);
      
      // Stamina
      if (this.isRunning) {
        this.stamina = Math.max(0, this.stamina - delta * 20);
      }
      
      // Walk bob
      this.walkBobTime += delta * (this.isRunning ? 12 : 8);
    } else {
      this.walkBobTime *= 0.9;
    }
    
    // Regen stamina
    if (!this.isRunning) {
      this.stamina = Math.min(100, this.stamina + delta * 10);
    }
    this.onStaminaChange(this.stamina);
    
    // Apply movement with collision
    const newPos = this.playerPos.clone();
    newPos.x += moveDir.x;
    if (!this.checkCollision(newPos)) {
      this.playerPos.x = newPos.x;
    }
    
    newPos.copy(this.playerPos);
    newPos.z += moveDir.z;
    if (!this.checkCollision(newPos)) {
      this.playerPos.z = newPos.z;
    }
    
    // Gravity
    this.playerVel.y -= GRAVITY;
    this.playerPos.y += this.playerVel.y;
    
    if (this.playerPos.y <= PLAYER_HEIGHT) {
      this.playerPos.y = PLAYER_HEIGHT;
      this.playerVel.y = 0;
      this.isGrounded = true;
    }
    
    // Head bob
    const bobAmount = Math.sin(this.walkBobTime) * 0.03;
    const swayAmount = Math.cos(this.walkBobTime * 0.5) * 0.02;
    
    // Breathing
    this.breathTime += delta;
    const breathAmount = Math.sin(this.breathTime * 2) * 0.005;
    
    // Update camera
    this.camera.position.set(
      this.playerPos.x + swayAmount,
      this.playerPos.y + bobAmount + breathAmount,
      this.playerPos.z
    );
    
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
    
    // Flashlight follows camera
    this.flashlight.position.copy(this.camera.position);
    const flashTarget = new THREE.Vector3(0, 0, -10).applyQuaternion(this.camera.quaternion);
    this.flashlight.target.position.copy(this.camera.position).add(flashTarget);
    
    // Weapon bob
    const weapon = this.weapons[this.currentWeapon];
    const weaponBobX = Math.sin(this.walkBobTime) * 0.01;
    const weaponBobY = Math.abs(Math.cos(this.walkBobTime)) * 0.01;
    
    // Recoil recovery
    if (weapon.bobTime < 0) {
      weapon.bobTime += delta * 3;
      if (weapon.bobTime > 0) weapon.bobTime = 0;
    }
    
    weapon.mesh.position.x = weapon.mesh.position.x * 0.9 + 
      (weapon.type === 'knife' ? 0.3 : weapon.type === 'pistol' ? 0.25 : 0.3) * 0.1 + weaponBobX;
    weapon.mesh.position.y = weapon.mesh.position.y * 0.9 + 
      (weapon.type === 'knife' ? -0.3 : weapon.type === 'pistol' ? -0.25 : -0.3) * 0.1 + weaponBobY + weapon.bobTime * 0.1;
    
    // Radiation near anomalies
    let nearAnomaly = false;
    this.mapData.anomalies.forEach(a => {
      const dist = Math.sqrt(
        (this.playerPos.x - a.x) ** 2 + (this.playerPos.z - a.z) ** 2
      );
      if (dist < 5) {
        nearAnomaly = true;
        this.radiation = Math.min(100, this.radiation + delta * 5);
        
        // Anomaly damage
        if (dist < 2) {
          this.health = Math.max(0, this.health - delta * 10);
        }
      }
    });
    
    if (!nearAnomaly) {
      this.radiation = Math.max(0, this.radiation - delta * 0.5);
    }
    this.onRadiationChange(this.radiation);
    
    // Geiger counter
    if (this.radiation > 5) {
      this.audio.playGeiger(this.radiation);
    } else {
      this.audio.stopGeiger();
    }
    
    // Radiation damage
    if (this.radiation > 50) {
      this.health = Math.max(0, this.health - delta * (this.radiation / 100) * 3);
    }
    
    this.onHealthChange(this.health);
    
    if (this.health <= 0) {
      this.onDeath();
    }
  }

  private updateMutants(delta: number) {
    this.mutants.forEach(mutant => {
      if (mutant.state === 'dead') return;
      
      mutant.animTime += delta;
      
      const distToPlayer = mutant.mesh.position.distanceTo(this.playerPos);
      
      // State machine
      if (distToPlayer < 30) {
        mutant.state = 'chase';
      } else if (distToPlayer > 50) {
        mutant.state = 'idle';
      }
      
      if (mutant.state === 'chase') {
        // Move toward player
        const dir = this.playerPos.clone().sub(mutant.mesh.position).normalize();
        dir.y = 0;
        
        const newX = mutant.mesh.position.x + dir.x * mutant.speed;
        const newZ = mutant.mesh.position.z + dir.z * mutant.speed;
        
        // Simple collision check
        const testPos = new THREE.Vector3(newX, PLAYER_HEIGHT, newZ);
        if (!this.checkCollision(testPos)) {
          mutant.mesh.position.x = newX;
          mutant.mesh.position.z = newZ;
        }
        
        // Face player
        mutant.mesh.lookAt(this.playerPos.x, mutant.mesh.position.y, this.playerPos.z);
        
        // Walking animation
        if (mutant.type === 'dog') {
          mutant.mesh.position.y = Math.abs(Math.sin(mutant.animTime * 8)) * 0.1;
        } else {
          mutant.mesh.position.y = Math.abs(Math.sin(mutant.animTime * 4)) * 0.05;
          // Arm swing for zombie
          mutant.mesh.children.forEach((child, i) => {
            if (i > 4 && i < 7) {
              child.rotation.x = Math.sin(mutant.animTime * 3 + i) * 0.2;
            }
          });
        }
        
        // Attack
        if (distToPlayer < 2.5) {
          mutant.attackCooldown -= delta;
          if (mutant.attackCooldown <= 0) {
            const damage = mutant.type === 'dog' ? 8 : mutant.type === 'bloodsucker' ? 20 : 12;
            this.health = Math.max(0, this.health - damage);
            this.onHealthChange(this.health);
            mutant.attackCooldown = mutant.type === 'dog' ? 0.8 : 1.5;
            
            // Screen shake effect
            this.pitch += (Math.random() - 0.5) * 0.05;
            
            if (this.health <= 0) {
              this.onDeath();
            }
          }
        }
      } else if (mutant.state === 'idle') {
        // Wander
        const distToTarget = mutant.mesh.position.distanceTo(mutant.targetPos);
        if (distToTarget < 2) {
          mutant.targetPos.set(
            mutant.mesh.position.x + (Math.random() - 0.5) * 20,
            0,
            mutant.mesh.position.z + (Math.random() - 0.5) * 20
          );
        }
        
        const dir = mutant.targetPos.clone().sub(mutant.mesh.position).normalize();
        mutant.mesh.position.x += dir.x * mutant.speed * 0.3;
        mutant.mesh.position.z += dir.z * mutant.speed * 0.3;
        mutant.mesh.lookAt(mutant.targetPos.x, mutant.mesh.position.y, mutant.targetPos.z);
      }
    });
  }

  private updateParticles(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;
      
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
        continue;
      }
      
      p.mesh.position.add(p.velocity);
      p.velocity.y -= 0.005;
      p.mesh.scale.setScalar(p.life / p.maxLife);
    }
  }

  private updateAtmosphere(delta: number) {
    // Flickering lights
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.PointLight && obj.color.r > 0.5) {
        obj.intensity = 1 + Math.sin(Date.now() * 0.01 + obj.position.x) * 0.5;
      }
    });
    
    // Fog density variation
    this.fog.density = 0.015 + Math.sin(Date.now() * 0.001) * 0.003;
    
    // Update rain
    if (this.rainParticles) {
      this.rainParticles.position.x = this.playerPos.x;
      this.rainParticles.position.z = this.playerPos.z;
      
      const positions = this.rainParticles.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        let y = positions.getY(i);
        y -= 0.3;
        if (y < 0) y = 25 + Math.random() * 5;
        positions.setY(i, y);
      }
      positions.needsUpdate = true;
    }
    
    // Update dust
    if (this.dustParticles) {
      this.dustParticles.position.x = this.playerPos.x;
      this.dustParticles.position.z = this.playerPos.z;
      
      const positions = this.dustParticles.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        let x = positions.getX(i);
        let y = positions.getY(i);
        x += Math.sin(Date.now() * 0.001 + i) * 0.002;
        y += Math.sin(Date.now() * 0.002 + i * 0.5) * 0.001;
        positions.setX(i, x);
        positions.setY(i, y);
      }
      positions.needsUpdate = true;
    }
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    
    const delta = Math.min(this.clock.getDelta(), 0.05);
    
    if (this.mouseLocked) {
      this.updatePlayer(delta);
      this.updateMutants(delta);
      this.updateParticles(delta);
      this.updateAtmosphere(delta);
    }
    
    // Update minimap data
    this.onMinimapUpdate({
      playerPos: { x: this.playerPos.x, z: this.playerPos.z },
      playerRot: this.yaw,
      mutants: this.mutants.filter(m => m.state !== 'dead').map(m => ({
        x: m.mesh.position.x,
        z: m.mesh.position.z,
        type: m.type
      })),
      buildings: this.mapData.buildings.filter(b => b.type !== 'wall').map(b => ({
        x: b.x, z: b.z, w: b.w, d: b.d
      })),
      anomalies: this.mapData.anomalies
    });
    
    this.renderer.render(this.scene, this.camera);
  }

  // Public API
  setOnHealthChange(cb: (h: number) => void) { this.onHealthChange = cb; }
  setOnRadiationChange(cb: (r: number) => void) { this.onRadiationChange = cb; }
  setOnStaminaChange(cb: (s: number) => void) { this.onStaminaChange = cb; }
  setOnAmmoChange(cb: (a: number, m: number) => void) { this.onAmmoChange = cb; }
  setOnWeaponChange(cb: (w: string) => void) { this.onWeaponChange = cb; }
  setOnMessage(cb: (msg: string) => void) { this.onMessage = cb; }
  setOnDeath(cb: () => void) { this.onDeath = cb; }
  setOnMinimapUpdate(cb: (data: any) => void) { this.onMinimapUpdate = cb; }
  
  restart() {
    this.health = 100;
    this.radiation = 0;
    this.stamina = 100;
    this.playerPos.set(0, PLAYER_HEIGHT, 0);
    this.playerVel.set(0, 0, 0);
    this.yaw = 0;
    this.pitch = 0;
    
    // Respawn mutants
    this.mutants.forEach(m => {
      this.scene.remove(m.mesh);
    });
    this.mutants = [];
    this.spawnMutants();
    
    // Reset ammo
    this.weapons[1].ammo = 48;
    this.weapons[2].ammo = 20;
    
    this.onHealthChange(100);
    this.onRadiationChange(0);
    this.onStaminaChange(100);
  }
}
