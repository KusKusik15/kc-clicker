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
    }
};

// ============ СПИСОК УЛУЧШЕНИЙ ============
const UPGRADES = [
    {
        id: 'clickPower',
        name: '💪 Сила клика',
        desc: '+1 монета за клик',
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
        name: '🤖 Автоклик',
        desc: '+1 монета в секунду',
        baseCost: 500,
        costMult: 1.8,
        maxLevel: 100,
        apply: () => {}
    }
];

// ============ НАСТРОЙКИ БАЛАНСА ============
const ENERGY_REGEN_SEC = 30;

// ============ СОХРАНЕНИЕ ============
function save() {
    localStorage.setItem('kc_clicker', JSON.stringify(state));
}

function load() {
    const data = localStorage.getItem('kc_clicker');
    if (data) {
        try { Object.assign(state, JSON.parse(data)); } catch (e) {}
    }
}

// ============ ЦЕНА УЛУЧШЕНИЯ ============
function getUpgradeCost(up) {
    const level = state.upgrades[up.id] || 0;
    return Math.floor(up.baseCost * Math.pow(up.costMult, level));
}

// ============ ПОКУПКА ============
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
    if (state.energy < 1) {
        showEnergyModal();
        return;
    }

    state.energy -= 1;
    state.coins += state.clickPower;

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

// ============ МОДАЛКА ЭНЕРГИИ ============
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

// ============ ВОССТАНОВЛЕНИЕ ЭНЕРГИИ ============
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

// ============ АВТОКЛИК ============
setInterval(() => {
    const level = state.upgrades.autoClick || 0;
    if (level > 0) {
        state.coins += level;
        render();
    }
}, 1000);

// ============ АВТОСОХРАНЕНИЕ ============
setInterval(save, 5000);

// ============ ИНИЦИАЛИЗАЦИЯ ============
load();
render();
document.getElementById('tapButton').addEventListener('click', tap);
updateRegenTimer();
