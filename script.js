// ============ СОСТОЯНИЕ ИГРЫ ============
const state = {
    coins: 0,
    clickPower: 1,
    maxEnergy: 1000,
    energy: 1000,
    upgrades: {
        clickPower: 0,
        maxEnergy: 0,
        autoClick: 0
    },
    dailyStreak: 0,
    lastDailyClaim: 0,
    clicksSinceCaptcha: 0,
    lastSaveTime: Date.now()
};

// ============ КОНСТАНТЫ ============
const UPGRADES = [
    {
        id: 'clickPower',
        name: '💪 Сила клика',
        desc: '+1 монета за клик (тратит +1 энергии)',
        baseCost: 100,
        costMult: 1.5,
        maxLevel: 100,
        apply: (s) => s.clickPower += 1
    },
    {
        id: 'maxEnergy',
        name: '⚡ Резерв энергии',
        desc: '+500 к максимуму',
        baseCost: 200,
        costMult: 1.6,
        maxLevel: 50,
        apply: (s) => { s.maxEnergy += 500; s.energy += 500; }
    },
    {
        id: 'autoClick',
        name: '🤖 Автоклик (офлайн)',
        desc: '+1 монета/час офлайн',
        baseCost: 500,
        costMult: 1.8,
        maxLevel: 100,
        apply: () => {}
    }
];

const ENERGY_REGEN_SEC = 30;
const WITHDRAW_THRESHOLD = 100000;
const DAY_MS = 24 * 60 * 60 * 1000;
const OFFLINE_MAX_HOURS = 92;
const CAPTCHA_EVERY = 300;

const DAILY_REWARDS = [500, 1000, 2000, 3500, 5500, 8000, 12000];

// ============ СОХРАНЕНИЕ ============
function save() {
    state.lastSaveTime = Date.now();
    localStorage.setItem('kc_clicker', JSON.stringify(state));
}

function load() {
    const data = localStorage.getItem('kc_clicker');
    if (data) {
        try { Object.assign(state, JSON.parse(data)); } catch (e) {}
    }
}

// ============ УЛУЧШЕНИЯ ============
function getUpgradeCost(up) {
    const level = state.upgrades[up.id] || 0;
    return Math.floor(up.baseCost * Math.pow(up.costMult, level));
}

function buyUpgrade(up) {
    const cost = getUpgradeCost(up);
    const level = state.upgrades[up.id] || 0;

    if (level >= up.maxLevel) return;
    if (state.coins < cost) return;

    state.coins -= cost;
    state.upgrades[up.id] = level + 1;
    up.apply(state);

    save();
    render();
}

// ============ РЕНДЕР ============
function render() {
    document.getElementById('coins').textContent = formatNumber(state.coins);
    document.getElementById('energy').textContent = Math.floor(state.energy);
    document.getElementById('maxEnergy').textContent = state.maxEnergy;
    document.getElementById('clickPower').textContent = state.clickPower;

    const list = document.getElementById('upgradesList');
    list.innerHTML = '';

    for (const up of UPGRADES) {
        const level = state.upgrades[up.id] || 0;
        const cost = getUpgradeCost(up);
        const canBuy = state.coins >= cost && level < up.maxLevel;

        const el = document.createElement('div');
        el.className = 'upgrade' + (canBuy ? '' : ' disabled');
        el.innerHTML =
            '<div class="upgrade-info">' +
                '<div class="upgrade-name">' + up.name + ' (ур. ' + level + ')</div>' +
                '<div class="upgrade-desc">' + up.desc + '</div>' +
            '</div>' +
            '<button class="upgrade-buy">' + (level >= up.maxLevel ? 'MAX' : formatNumber(cost) + ' G') + '</button>';

        if (canBuy) {
            el.querySelector('.upgrade-buy').onclick = () => buyUpgrade(up);
        }

        list.appendChild(el);
    }

    const dot = document.getElementById('dailyDot');
    if (canClaimDaily()) dot.classList.add('show');
    else dot.classList.remove('show');

    const wBtn = document.getElementById('withdrawBtn');
    wBtn.disabled = state.coins < WITHDRAW_THRESHOLD;
}

// ============ ФОРМАТ ЧИСЕЛ ============
function formatNumber(n) {
    if (n < 1000) return Math.floor(n).toString();
    if (n < 1e6) return (n / 1e3).toFixed(1) + 'K';
    if (n < 1e9) return (n / 1e6).toFixed(1) + 'M';
    if (n < 1e12) return (n / 1e9).toFixed(1) + 'B';
    return (n / 1e12).toFixed(1) + 'T';
}

// ============ КЛИК ============
function tap(e) {
    // Капча
    if (state.clicksSinceCaptcha >= CAPTCHA_EVERY) {
        showCaptcha();
        return;
    }

    // Энергия: тратится = clickPower
    if (state.energy < state.clickPower) {
        showEnergyModal();
        return;
    }

    state.energy -= state.clickPower;
    state.coins += state.clickPower;
    state.clicksSinceCaptcha += 1;

    const float = document.createElement('div');
    float.className = 'floating';
    float.textContent = '+' + state.clickPower;
    const rect = e.currentTarget.getBoundingClientRect();
    float.style.left = (e.clientX || rect.left + rect.width / 2) + 'px';
    float.style.top = (e.clientY || rect.top + rect.height / 2) + 'px';
    document.body.appendChild(float);
    setTimeout(() => float.remove(), 1000);

    save();
    render();
}

// ============ ЭНЕРГИЯ ============
function showEnergyModal() {
    document.getElementById('energyModal').classList.add('show');
    updateRegenTimer();
}

function hideEnergyModal() {
    document.getElementById('energyModal').classList.remove('show');
}

document.getElementById('watchAdBtn').onclick = () => {
    state.energy = state.maxEnergy;
    save();
    render();
    hideEnergyModal();
    alert('Энергия восстановлена! (Позже здесь будет настоящая реклама)');
};

document.getElementById('closeModalBtn').onclick = hideEnergyModal;

document.getElementById('energyModal').addEventListener('click', (e) => {
    if (e.target.id === 'energyModal') hideEnergyModal();
});

// ============ ТАЙМЕР ЭНЕРГИИ ============
let lastRegenTime = Date.now();

function updateRegenTimer() {
    const el = document.getElementById('regenTimer');
    if (!el) return;

    if (state.energy >= state.maxEnergy) {
        el.textContent = '—';
        return;
    }

    const elapsed = (Date.now() - lastRegenTime) / 1000;
    const remaining = Math.max(0, Math.ceil(ENERGY_REGEN_SEC - elapsed));
    el.textContent = remaining + 'с';
}

setInterval(() => {
    if (state.energy >= state.maxEnergy) {
        lastRegenTime = Date.now();
        return;
    }

    const elapsed = (Date.now() - lastRegenTime) / 1000;

    if (elapsed >= ENERGY_REGEN_SEC) {
        const gain = Math.floor(elapsed / ENERGY_REGEN_SEC);
        state.energy = Math.min(state.maxEnergy, state.energy + gain);
        lastRegenTime = Date.now();
        save();
        render();
    }

    updateRegenTimer();
}, 500);

// ============ ЕЖЕДНЕВНЫЙ БОНУС ============
function canClaimDaily() {
    return (Date.now() - (state.lastDailyClaim || 0)) >= DAY_MS;
}

function getDailyStreak() {
    if (!state.lastDailyClaim) return 1;
    const daysPassed = Math.floor((Date.now() - state.lastDailyClaim) / DAY_MS);
    if (daysPassed === 1) return Math.min(state.dailyStreak + 1, 7);
    if (daysPassed === 0) return state.dailyStreak || 1;
    return 1;
}

function showDailyModal() {
    const streak = getDailyStreak();
    const canClaim = canClaimDaily();
    const currentDay = canClaim ? streak : (state.dailyStreak || 1);

    document.getElementById('dailyTitle').textContent =
        canClaim ? 'Забрать бонус!' : 'Уже получен!';
    document.getElementById('dailyDesc').textContent =
        canClaim ? 'Заходи каждый день — награда растёт!' : 'Возвращайся завтра за новым бонусом';

    const daysContainer = document.getElementById('dailyDays');
    daysContainer.innerHTML = '';

    for (let i = 0; i < 7; i++) {
        const dayNum = i + 1;
        const el = document.createElement('div');
        el.className = 'daily-day';

        if (canClaim && dayNum === currentDay) el.classList.add('active');
        if (!canClaim && dayNum <= (state.dailyStreak || 1)) el.classList.add('done');

        el.innerHTML =
            '<div class="daily-day-num">День ' + dayNum + '</div>' +
            '<div class="daily-day-amount">' + DAILY_REWARDS[i] + '</div>';

        daysContainer.appendChild(el);
    }

    const amount = DAILY_REWARDS[Math.min(currentDay - 1, 6)];
    document.getElementById('dailyAmount').textContent = amount;

    const claimBtn = document.getElementById('claimDailyBtn');
    claimBtn.style.display = canClaim ? 'flex' : 'none';

    document.getElementById('dailyModal').classList.add('show');
}

function hideDailyModal() {
    document.getElementById('dailyModal').classList.remove('show');
}

document.getElementById('dailyBtn').onclick = showDailyModal;

document.getElementById('claimDailyBtn').onclick = () => {
    if (!canClaimDaily()) return;

    const streak = getDailyStreak();
    const amount = DAILY_REWARDS[Math.min(streak - 1, 6)];

    state.coins += amount;
    state.dailyStreak = streak;
    state.lastDailyClaim = Date.now();

    save();
    render();
    hideDailyModal();

    alert('🎁 Бонус получен: +' + amount + ' G\n\nСтрик: День ' + streak + '/7');
};

document.getElementById('closeDailyBtn').onclick = hideDailyModal;

document.getElementById('dailyModal').addEventListener('click', (e) => {
    if (e.target.id === 'dailyModal') hideDailyModal();
});

// ============ ОФФЛАЙН-АВТОКЛИК ============
function checkOfflineIncome() {
    const autoLevel = state.upgrades.autoClick || 0;
    if (autoLevel <= 0) return;

    const now = Date.now();
    const lastSave = state.lastSaveTime || now;
    const elapsedMs = now - lastSave;
    const elapsedHours = elapsedMs / (1000 * 60 * 60);

    // Ограничиваем максимум 92 часа
    const hours = Math.min(elapsedHours, OFFLINE_MAX_HOURS);

    // 1 монета за час за каждый уровень автоклика
    const earned = Math.floor(autoLevel * hours);

    // Только если прошло больше 1 минуты офлайна и есть что забрать
    if (earned > 0 && elapsedMs > 60 * 1000) {
        document.getElementById('offlineAmount').textContent = formatNumber(earned);
        document.getElementById('offlineModal').classList.add('show');

        document.getElementById('claimOfflineBtn').onclick = () => {
            state.coins += earned;
            save();
            render();
            document.getElementById('offlineModal').classList.remove('show');
        };
    }
}

// ============ КАПЧА ============
let captchaAnswer = 0;

function showCaptcha() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const useAdd = Math.random() > 0.5;

    let question, answer;

    if (useAdd) {
        question = 'Сколько будет ' + a + ' + ' + b + '?';
        answer = a + b;
    } else {
        const big = Math.max(a, b);
        const small = Math.min(a, b);
        question = 'Сколько будет ' + big + ' − ' + small + '?';
        answer = big - small;
    }

    captchaAnswer = answer;

    document.getElementById('captchaQuestion').textContent = question;
    document.getElementById('captchaError').textContent = '';

    // 4 варианта ответа: правильный + 3 случайных
    const variants = new Set([answer]);
    while (variants.size < 4) {
        const delta = Math.floor(Math.random() * 10) - 5;
        if (delta !== 0) variants.add(answer + delta);
    }

    const answers = Array.from(variants).sort(() => Math.random() - 0.5);

    const container = document.getElementById('captchaAnswers');
    container.innerHTML = '';

    for (const num of answers) {
        const btn = document.createElement('button');
        btn.textContent = num;
        btn.onclick = () => {
            if (num === captchaAnswer) {
                btn.classList.add('correct');
                state.clicksSinceCaptcha = 0;
                save();
                setTimeout(() => {
                    document.getElementById('captchaModal').classList.remove('show');
                }, 400);
            } else {
                btn.classList.add('wrong');
                document.getElementById('captchaError').textContent = 'Неверно! Попробуй ещё.';
                // Показать новую капчу через 1.5 сек
                setTimeout(() => {
                    showCaptcha();
                }, 1500);
            }
        };
        container.appendChild(btn);
    }

    document.getElementById('captchaModal').classList.add('show');
}

// ============ ВЫВОД ============
document.getElementById('withdrawBtn').onclick = () => {
    if (state.coins < WITHDRAW_THRESHOLD) return;
    document.getElementById('withdrawModal').classList.add('show');
};

document.getElementById('closeWithdrawBtn').onclick = () => {
    document.getElementById('withdrawModal').classList.remove('show');
};

document.getElementById('withdrawModal').addEventListener('click', (e) => {
    if (e.target.id === 'withdrawModal') document.getElementById('withdrawModal').classList.remove('show');
});

// ============ АВТОСОХРАНЕНИЕ ============
setInterval(save, 5000);

// ============ ИНИЦИАЛИЗАЦИЯ ============
load();

// Проверка оффлайн-дохода — до рендера
setTimeout(checkOfflineIncome, 500);

render();
document.getElementById('tapButton').addEventListener('click', tap);
updateRegenTimer();
