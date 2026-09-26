* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: -apple-system, 'Segoe UI', Arial, sans-serif;
    background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
    color: #fff;
    min-height: 100vh;
    overflow-x: hidden;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

#app { max-width: 480px; margin: 0 auto; padding: 16px; }

header {
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
}

.balance {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 34px;
    font-weight: 800;
    color: #ffd700;
    margin-bottom: 10px;
    text-shadow: 0 0 20px rgba(255,215,0,.4);
}

.coin-svg {
    width: 34px;
    height: 34px;
    filter: drop-shadow(0 2px 6px rgba(255,215,0,.6));
}

.stats {
    display: flex;
    justify-content: space-around;
    font-size: 13px;
    color: #aaa;
}

main {
    display: flex;
    justify-content: center;
    margin: 24px 0;
}

#tapButton {
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #4a4a8a 0%, #1a1a3a 70%);
    border: 4px solid #5b5bff;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: transform .08s, box-shadow .2s;
    box-shadow:
        0 0 50px rgba(91,91,255,.5),
        inset 0 0 50px rgba(91,91,255,.2);
    position: relative;
    overflow: hidden;
}

#tapButton::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(255,215,0,.15) 0%, transparent 60%);
    pointer-events: none;
}

#tapButton:active {
    transform: scale(.94);
    box-shadow:
        0 0 80px rgba(255,215,0,.7),
        inset 0 0 60px rgba(255,215,0,.3);
}

.coin-big-svg {
    width: 170px;
    height: 170px;
    pointer-events: none;
    filter: drop-shadow(0 0 25px rgba(255,215,0,.7));
    animation: coinPulse 3s ease-in-out infinite;
}

@keyframes coinPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.04); }
}

.tap-hint {
    font-size: 12px;
    letter-spacing: 4px;
    color: #888;
    margin-top: -4px;
    pointer-events: none;
    font-weight: 600;
}

#upgrades {
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 16px;
    padding: 16px;
}

#upgrades h2 {
    font-size: 15px;
    margin-bottom: 12px;
    color: #ccc;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.upgrade {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 10px;
    margin-bottom: 8px;
    transition: .15s;
}

.upgrade:hover { background: rgba(255,255,255,.06); }
.upgrade.disabled { opacity: .4; }

.upgrade-info { flex: 1; }
.upgrade-name { font-size: 14px; font-weight: 600; }
.upgrade-desc { font-size: 11px; color: #888; margin-top: 2px; }

.upgrade-buy {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border: none;
    color: #fff;
    padding: 8px 14px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;
}

.upgrade-buy:active { transform: scale(.95); }

.floating {
    position: fixed;
    pointer-events: none;
    font-size: 26px;
    font-weight: 800;
    color: #ffd700;
    text-shadow: 0 0 12px rgba(255,215,0,.8);
    animation: floatUp 1s ease-out forwards;
    z-index: 999;
}

@keyframes floatUp {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    100% { transform: translate(-50%, -180%) scale(1.6); opacity: 0; }
}

/* ============ МОДАЛКА ЭНЕРГИИ ============ */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.85);
    backdrop-filter: blur(6px);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    animation: fadeIn .2s;
}

.modal-overlay.show { display: flex; }

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.modal {
    background: linear-gradient(180deg, #1e1e2e 0%, #15151f 100%);
    border: 1px solid rgba(255,255,255,.15);
    border-radius: 20px;
    padding: 24px;
    width: 100%;
    max-width: 340px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,.8);
    animation: modalPop .3s cubic-bezier(.34,1.56,.64,1);
}

@keyframes modalPop {
    from { transform: scale(.85); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

.modal-icon {
    font-size: 60px;
    margin-bottom: 8px;
    filter: drop-shadow(0 0 20px rgba(255,215,0,.6));
    animation: boltShake 1.5s infinite;
}

@keyframes boltShake {
    0%, 90%, 100% { transform: rotate(0); }
    92% { transform: rotate(-8deg); }
    94% { transform: rotate(8deg); }
    96% { transform: rotate(-5deg); }
    98% { transform: rotate(5deg); }
}

.modal h3 {
    font-size: 20px;
    color: #fff;
    margin-bottom: 10px;
}

.modal p {
    font-size: 13px;
    color: #999;
    line-height: 1.5;
    margin-bottom: 20px;
}

.modal-btn-primary {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    border: none;
    border-radius: 12px;
    color: #fff;
    font-weight: 800;
    font-size: 15px;
    cursor: pointer;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    transition: .15s;
    box-shadow: 0 6px 20px rgba(245,158,11,.35);
}

.modal-btn-primary:active { transform: scale(.97); }

.modal-btn-sub {
    font-size: 11px;
    font-weight: 500;
    opacity: .85;
}

.modal-btn-secondary {
    width: 100%;
    padding: 12px;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 12px;
    color: #aaa;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    margin-bottom: 12px;
}

.modal-btn-secondary:active { transform: scale(.97); }

.modal-timer {
    font-size: 11px;
    color: #666;
}
