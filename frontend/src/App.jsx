import React, { useEffect, useState } from 'react';
import { api } from './api.js';

const CIRC = 2 * Math.PI * 115;

function fmt(s) {
  const m = Math.floor(s / 60), r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export default function App() {
  const [phase, setPhase] = useState('work'); // work | break
  const [remain, setRemain] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [err, setErr] = useState('');

  const total = (phase === 'work' ? 25 : 5) * 60;
  const offset = CIRC * (1 - remain / total);

  const refresh = () => {
    api.get('/sessions/today').then(setStats).catch(e => setErr(e.message));
    api.get('/sessions/recent').then(setRecent).catch(() => {});
  };

  useEffect(refresh, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setRemain(r => r - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  // bitiş kontrolü
  useEffect(() => {
    if (!running || remain > 0) return;
    setRunning(false);

    const type = phase === 'work' ? 'WORK' : 'BREAK';
    const minutes = phase === 'work' ? 25 : 5;

    api.post('/sessions', { type, minutes })
      .then(() => {
        beep();
        refresh();
      })
      .catch(e => { setErr('Oturum kaydedilemedi: ' + e.message); beep(); });

    // faz değişimi
    const nextPhase = phase === 'work' ? 'break' : 'work';
    const nextMins = (nextPhase === 'work' ? 25 : 5) * 60;
    setPhase(nextPhase);
    setRemain(nextMins);
    setRunning(true); // otomatik zincir
  }, [remain, running, phase]);

  const switchPhase = (p) => {
    setPhase(p);
    setRemain((p === 'work' ? 25 : 5) * 60);
    setRunning(false);
  };

  const label = phase === 'work' ? 'Çalışma 🍅' : 'Mola ☕';

  return (
    <div className="app">
      <h1>🍅 Pomodoro v2</h1>
      <p className="lead">Tamamlanan fazlar Java REST API'ye (H2) yazılır; günlük istatistik sunucudan gelir.</p>

      {err && <div className="err">{err}</div>}

      <div className="layout">
        <div className="panel timer-panel">
          <div className="tabs">
            <button className={phase === 'work' ? 'active' : ''} onClick={() => switchPhase('work')}>Çalışma</button>
            <button className={phase === 'break' ? 'active' : ''} onClick={() => switchPhase('break')}>Mola</button>
          </div>

          <div className="ring" data-phase={phase}>
            <svg width="260" height="260" viewBox="0 0 260 260">
              <circle cx="130" cy="130" r="115" fill="none" stroke="#334155" strokeWidth="10" />
              <circle cx="130" cy="130" r="115" fill="none"
                stroke={phase === 'work' ? '#22c55e' : '#38bdf8'}
                strokeWidth="10" strokeLinecap="round"
                strokeDasharray={CIRC} strokeDashoffset={offset}
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
            </svg>
            <div className="clock"><b>{fmt(Math.max(remain, 0))}</b><span>{label}</span></div>
          </div>

          <div className="controls">
            <button className="btn primary" onClick={() => setRunning(r => !r)}>
              {running ? 'Duraklat' : 'Başla'}
            </button>
            <button className="btn ghost" onClick={() => switchPhase(phase)}>Sıfırla</button>
          </div>
          <p className="small">Bir faz bittiğinde sonraki faz otomatik başlar ve oturum sunucuya işlenir.</p>
        </div>

        <div className="side">
          <div className="panel">
            <h2>📅 Bugün (API)</h2>
            {stats ? (
              <div className="statgrid">
                <div><b>{stats.workCount}</b><span>pomodoro</span></div>
                <div><b>{stats.workMinutes}</b><span>dk çalışma</span></div>
                <div><b>{stats.breakCount}</b><span>mola</span></div>
                <div><b>{stats.breakMinutes}</b><span>dk mola</span></div>
              </div>
            ) : <div className="muted">Yükleniyor…</div>}
          </div>

          <div className="panel">
            <h2>🕘 Son oturumlar</h2>
            <ul className="list">
              {recent.map(s => (
                <li key={s.id}>
                  <span className={`pill ${s.type === 'WORK' ? 'w' : 'b'}`}>{s.type === 'WORK' ? 'Çalışma' : 'Mola'}</span>
                  <span>{s.minutes} dk</span>
                  <span className="muted">{(s.finishedAt || '').slice(11, 16)} · {(s.finishedAt || '').slice(0, 10)}</span>
                </li>
              ))}
              {recent.length === 0 && <li className="muted">Henüz oturum yok — ilk pomodoronu başlat!</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, .25, .5].forEach((t, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 660 + i * 110;
      g.gain.setValueAtTime(.15, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + t + .2);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + .22);
    });
  } catch (e) { /* sessiz */ }
}
