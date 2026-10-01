import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [health, setHealth] = useState(100);
  const [radiation, setRadiation] = useState(0);
  const [stamina, setStamina] = useState(100);
  const [ammo, setAmmo] = useState(48);
  const [maxAmmo, setMaxAmmo] = useState(48);
  const [weapon, setWeapon] = useState('pistol');
  const [message, setMessage] = useState('');
  const [isDead, setIsDead] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [minimapData, setMinimapData] = useState<any>(null);
  const [coords, setCoords] = useState({ x: 0, z: 0 });
  const messageTimeout = useRef<any>(null);

  const startGame = useCallback(() => {
    setShowMenu(false);
    if (canvasRef.current && !engineRef.current) {
      const engine = new GameEngine(canvasRef.current);
      engineRef.current = engine;
      
      // Init audio on user gesture
      try {
        const audioCtx = new AudioContext();
        audioCtx.resume();
      } catch(e) {}
      
      engine.setOnHealthChange(setHealth);
      engine.setOnRadiationChange(setRadiation);
      engine.setOnStaminaChange(setStamina);
      engine.setOnAmmoChange((a, m) => { setAmmo(a); setMaxAmmo(m); });
      engine.setOnWeaponChange(setWeapon);
      engine.setOnMessage((msg) => {
        setMessage(msg);
        if (messageTimeout.current) clearTimeout(messageTimeout.current);
        messageTimeout.current = setTimeout(() => setMessage(''), 3000);
      });
      engine.setOnDeath(() => setIsDead(true));
      engine.setOnMinimapUpdate((data: any) => {
        setMinimapData(data);
        if (data.playerPos) {
          setCoords({ x: Math.round(data.playerPos.x), z: Math.round(data.playerPos.z) });
        }
      });
    }
  }, []);

  const restartGame = useCallback(() => {
    setIsDead(false);
    if (engineRef.current) {
      engineRef.current.restart();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimeout.current) clearTimeout(messageTimeout.current);
    };
  }, []);

  const weaponNames: Record<string, string> = {
    knife: 'НОЖ',
    pistol: 'ПИСТОЛЕТ',
    shotgun: 'ДРОБОВИК'
  };

  const weaponIcons: Record<string, string> = {
    knife: '🔪',
    pistol: '🔫',
    shotgun: '💥'
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Game Canvas */}
      <canvas 
        ref={canvasRef} 
        id="game-canvas"
        className="absolute inset-0 w-full h-full"
      />

      {/* Start Menu */}
      {showMenu && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center"
             style={{
               background: 'linear-gradient(180deg, #0a0a05 0%, #1a1a0a 30%, #0d1a0d 60%, #0a0a05 100%)',
             }}>
          <div className="absolute inset-0 opacity-20"
               style={{
                 backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(50,80,50,0.1) 2px, rgba(50,80,50,0.1) 4px)`,
               }}
          ></div>
          <div className="absolute inset-0"
               style={{
                 background: 'radial-gradient(ellipse at 30% 70%, rgba(80,60,0,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(0,60,0,0.1) 0%, transparent 50%)',
               }}
          ></div>
          <div className="text-center relative z-10">
            <h1 className="text-6xl font-bold text-amber-500 mb-2 tracking-wider" 
                style={{ fontFamily: 'Courier New, monospace', textShadow: '0 0 20px rgba(200,150,0,0.5), 0 0 60px rgba(200,150,0,0.2)' }}>
              S.T.A.L.K.E.R.
            </h1>
            <p className="text-xl text-amber-700 mb-8 tracking-widest">ЗОНА ОТЧУЖДЕНИЯ</p>
            
            <div className="space-y-4 mb-8">
              <div className="text-gray-400 text-sm space-y-1">
                <p>🎮 <span className="text-gray-300">WASD</span> - Движение</p>
                <p>🖱️ <span className="text-gray-300">Мышь</span> - Обзор</p>
                <p>🔫 <span className="text-gray-300">ЛКМ</span> - Стрелять / Атака</p>
                <p>⚡ <span className="text-gray-300">1-3</span> - Смена оружия</p>
                <p>🔦 <span className="text-gray-300">L</span> - Фонарик</p>
                <p>🏃 <span className="text-gray-300">Shift</span> - Бег</p>
                <p>⬆️ <span className="text-gray-300">Пробел</span> - Прыжок</p>
              </div>
            </div>
            
            <button
              onClick={startGame}
              className="px-8 py-3 bg-amber-900/50 border border-amber-600 text-amber-400 
                         hover:bg-amber-800/50 hover:text-amber-300 transition-all duration-300
                         text-lg tracking-wider cursor-pointer"
              style={{ fontFamily: 'Courier New, monospace' }}
            >
              ВОЙТИ В ЗОНУ
            </button>
            
            <p className="text-gray-600 text-xs mt-4">Нажмите для захвата курсора</p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 text-green-900 text-xs font-mono">
            <p>☢ ЗОНА ОТЧУЖДЕНИЯ</p>
            <p>ПРИПЯТЬ СЕКТОР-7</p>
          </div>
          <div className="absolute bottom-4 right-4 text-red-900 text-xs font-mono">
            <p>⚠ ВНИМАНИЕ: АНОМАЛИИ</p>
            <p>УРОВЕНЬ УГРОЗЫ: ВЫСОКИЙ</p>
          </div>
        </div>
      )}

      {/* Death Screen */}
      {isDead && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-950/80">
          <h1 className="text-5xl font-bold text-red-500 mb-4" style={{ fontFamily: 'Courier New' }}>
            ВЫ ПОГИБЛИ
          </h1>
          <p className="text-red-400 mb-8">Зона забрала ещё одну жизнь...</p>
          <button
            onClick={restartGame}
            className="px-6 py-2 bg-red-900/50 border border-red-600 text-red-400 
                       hover:bg-red-800/50 transition-all cursor-pointer"
            style={{ fontFamily: 'Courier New' }}
          >
            ВОЗРОДИТЬСЯ
          </button>
        </div>
      )}

      {/* HUD - Only show when playing */}
      {!showMenu && !isDead && (
        <>
          {/* Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="relative w-6 h-6">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-green-400/70"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-green-400/70"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-2 bg-green-400/70"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-0.5 w-2 bg-green-400/70"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full border border-green-400/50"></div>
            </div>
          </div>

          {/* Bottom HUD */}
          <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
            <div className="flex justify-between items-end p-4">
              {/* Health & Radiation */}
              <div className="space-y-2">
                {/* Health */}
                <div className="flex items-center gap-2">
                  <span className="text-red-500 text-sm font-mono w-6">❤</span>
                  <div className="w-40 h-3 bg-gray-900/80 border border-gray-700 relative">
                    <div 
                      className="h-full transition-all duration-300"
                      style={{ 
                        width: `${health}%`,
                        background: health > 50 ? 'linear-gradient(90deg, #22c55e, #16a34a)' :
                                   health > 25 ? 'linear-gradient(90deg, #eab308, #ca8a04)' :
                                   'linear-gradient(90deg, #ef4444, #dc2626)'
                      }}
                    ></div>
                    <span className="absolute right-1 top-0 text-[10px] text-white font-mono leading-3">
                      {Math.round(health)}
                    </span>
                  </div>
                </div>
                
                {/* Radiation */}
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 text-sm font-mono w-6">☢</span>
                  <div className="w-40 h-3 bg-gray-900/80 border border-gray-700 relative">
                    <div 
                      className="h-full transition-all duration-300 bg-gradient-to-r from-yellow-600 to-yellow-400"
                      style={{ width: `${radiation}%` }}
                    ></div>
                    <span className="absolute right-1 top-0 text-[10px] text-white font-mono leading-3">
                      {Math.round(radiation)}
                    </span>
                  </div>
                </div>
                
                {/* Stamina */}
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 text-sm font-mono w-6">⚡</span>
                  <div className="w-40 h-3 bg-gray-900/80 border border-gray-700 relative">
                    <div 
                      className="h-full transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-400"
                      style={{ width: `${stamina}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Weapon & Ammo */}
              <div className="text-right">
                <div className="text-amber-400 text-sm font-mono mb-1">
                  {weaponIcons[weapon]} {weaponNames[weapon]}
                </div>
                <div className="text-2xl font-mono text-white">
                  {ammo === Infinity ? '∞' : ammo}
                  <span className="text-gray-500 text-sm"> / {maxAmmo === Infinity ? '∞' : maxAmmo}</span>
                </div>
                <div className="flex gap-1 mt-1 justify-end">
                  {[1,2,3].map(i => (
                    <div key={i} className={`w-6 h-6 border text-xs flex items-center justify-center font-mono
                      ${(weapon === ['knife','pistol','shotgun'][i-1]) 
                        ? 'border-amber-500 text-amber-400 bg-amber-900/30' 
                        : 'border-gray-700 text-gray-600'}`}>
                      {i}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Compass & Coordinates */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <div className="bg-black/60 border border-gray-800 px-3 py-2 font-mono text-xs">
              <div className="text-green-600">
                ☢ КООРД: [{coords.x}, {coords.z}]
              </div>
              <div className="text-amber-700 mt-1">
                СЕКТОР: ПРИПЯТЬ-7
              </div>
              <div className="text-gray-600 mt-1">
                {new Date().toLocaleTimeString('ru-RU')}
              </div>
            </div>
          </div>

          {/* Minimap */}
          <div className="absolute top-4 right-4 z-20 pointer-events-none">
            <div className="w-36 h-36 bg-black/70 border border-green-900 relative overflow-hidden">
              <canvas 
                ref={(el) => {
                  if (el && minimapData) {
                    const ctx = el.getContext('2d');
                    if (!ctx) return;
                    ctx.clearRect(0, 0, 144, 144);
                    
                    const scale = 0.7;
                    const cx = 72, cy = 72;
                    
                    // Buildings
                    ctx.fillStyle = '#333322';
                    minimapData.buildings?.forEach((b: any) => {
                      const rx = (b.x - minimapData.playerPos.x) * scale + cx;
                      const ry = (b.z - minimapData.playerPos.z) * scale + cy;
                      ctx.fillRect(rx - b.w*scale/2, ry - b.d*scale/2, b.w*scale, b.d*scale);
                    });
                    
                    // Anomalies
                    ctx.fillStyle = '#ff440066';
                    minimapData.anomalies?.forEach((a: any) => {
                      const rx = (a.x - minimapData.playerPos.x) * scale + cx;
                      const ry = (a.z - minimapData.playerPos.z) * scale + cy;
                      ctx.beginPath();
                      ctx.arc(rx, ry, 3, 0, Math.PI * 2);
                      ctx.fill();
                    });
                    
                    // Mutants
                    minimapData.mutants?.forEach((m: any) => {
                      const rx = (m.x - minimapData.playerPos.x) * scale + cx;
                      const ry = (m.z - minimapData.playerPos.z) * scale + cy;
                      ctx.fillStyle = m.type === 'bloodsucker' ? '#ff0000' : 
                                     m.type === 'dog' ? '#ff8800' : '#88ff00';
                      ctx.beginPath();
                      ctx.arc(rx, ry, 2, 0, Math.PI * 2);
                      ctx.fill();
                    });
                    
                    // Player
                    ctx.fillStyle = '#00ff00';
                    ctx.beginPath();
                    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Player direction
                    ctx.strokeStyle = '#00ff00';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(
                      cx - Math.sin(minimapData.playerRot) * 8,
                      cy - Math.cos(minimapData.playerRot) * 8
                    );
                    ctx.stroke();
                  }
                }}
                width={144} 
                height={144}
                className="w-full h-full"
              />
              <div className="absolute top-1 left-1 text-[8px] text-green-700 font-mono">MAP</div>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
              <div className="text-amber-400 font-mono text-lg animate-pulse"
                   style={{ textShadow: '0 0 10px rgba(200,150,0,0.5)' }}>
                {message}
              </div>
            </div>
          )}

          {/* Radiation warning */}
          {radiation > 30 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
              <div className="text-yellow-500 font-mono text-sm animate-pulse">
                ☢ ВНИМАНИЕ: ВЫСОКИЙ УРОВЕНЬ РАДИАЦИИ ☢
              </div>
            </div>
          )}

          {/* Vignette effect */}
          <div className="absolute inset-0 pointer-events-none z-10"
               style={{
                 background: `radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)`,
               }}
          ></div>

          {/* Low health red overlay */}
          {health < 30 && (
            <div className="absolute inset-0 pointer-events-none z-10 animate-pulse"
                 style={{
                   background: `radial-gradient(ellipse at center, transparent 30%, rgba(150,0,0,${0.3 * (1 - health/30)}) 100%)`,
                 }}
            ></div>
          )}

          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none z-10 opacity-5"
               style={{
                 backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
               }}
          ></div>

          {/* Controls hint */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <p className="text-gray-600 text-[10px] font-mono">
              ЛКМ - кликните для захвата мыши | ESC - освободить курсор
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
