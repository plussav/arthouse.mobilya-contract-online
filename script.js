const fields = document.querySelectorAll('[data-save]');

// =====================================
// ЧИСЛО ПРОПИСЬЮ
// =====================================

function numberToWords(num) {
    num = Math.floor(Number(num));

    if (!Number.isFinite(num) || num < 0 || num > 999999999999) {
        return '';
    }

    if (num === 0) return 'ноль тенге';

    const onesM = [
        '', 'один', 'два', 'три', 'четыре',
        'пять', 'шесть', 'семь', 'восемь', 'девять'
    ];

    const onesF = [
        '', 'одна', 'две', 'три', 'четыре',
        'пять', 'шесть', 'семь', 'восемь', 'девять'
    ];

    const teens = [
        'десять', 'одиннадцать', 'двенадцать',
        'тринадцать', 'четырнадцать', 'пятнадцать',
        'шестнадцать', 'семнадцать', 'восемнадцать',
        'девятнадцать'
    ];

    const tens = [
        '', '', 'двадцать', 'тридцать', 'сорок',
        'пятьдесят', 'шестьдесят', 'семьдесят',
        'восемьдесят', 'девяносто'
    ];

    const hundreds = [
        '', 'сто', 'двести', 'триста', 'четыреста',
        'пятьсот', 'шестьсот', 'семьсот',
        'восемьсот', 'девятьсот'
    ];

    function group(n, feminine) {
        let result = [];

        if (n >= 100) {
            result.push(hundreds[Math.floor(n / 100)]);
        }

        n %= 100;

        if (n >= 10 && n <= 19) {
            result.push(teens[n - 10]);
        } else {
            if (n >= 20) {
                result.push(tens[Math.floor(n / 10)]);
            }

            n %= 10;

            if (n > 0) {
                result.push((feminine ? onesF : onesM)[n]);
            }
        }

        return result.join(' ');
    }

    function ending(n, forms) {
        const lastTwo = n % 100;

        if (lastTwo >= 11 && lastTwo <= 14) {
            return forms[2];
        }

        const last = n % 10;

        if (last === 1) return forms[0];
        if (last >= 2 && last <= 4) return forms[1];

        return forms[2];
    }

    let result = [];

    const billions = Math.floor(num / 1000000000);
    const millions = Math.floor((num % 1000000000) / 1000000);
    const thousands = Math.floor((num % 1000000) / 1000);
    const rest = num % 1000;

    if (billions) {
        result.push(
            group(billions, false) + ' ' +
            ending(billions, ['миллиард', 'миллиарда', 'миллиардов'])
        );
    }

    if (millions) {
        result.push(
            group(millions, false) + ' ' +
            ending(millions, ['миллион', 'миллиона', 'миллионов'])
        );
    }

    if (thousands) {
        result.push(
            group(thousands, true) + ' ' +
            ending(thousands, ['тысяча', 'тысячи', 'тысяч'])
        );
    }

    if (rest) {
        result.push(group(rest, false));
    }

    return result.join(' ') + ' ' +
        ending(num, ['тенге', 'тенге', 'тенге']);
}


// =====================================
// ФОРМАТИРОВАНИЕ ДЕНЕГ
// =====================================

function formatMoney(amount) {
    return Math.round(amount).toLocaleString('ru-RU') + ' ₸';
}


// =====================================
// АВТОМАТИЧЕСКИЙ РАСЧЁТ ОПЛАТЫ
// =====================================

function updatePayments() {

    const totalInput = document.querySelector('[data-save="total"]');
    const prepaymentInput = document.querySelector('[data-save="prepayment"]');
    const balanceInput = document.querySelector('[data-save="balance"]');

    const total = Math.max(0, Number(totalInput.value) || 0);

    let percent = Number(prepaymentInput.value) || 0;

    percent = Math.min(100, Math.max(0, percent));

    const balancePercent = 100 - percent;

    const prepaymentAmount = Math.round(total * percent / 100);

    const balanceAmount = total - prepaymentAmount;

    balanceInput.value = balancePercent;

    // Сумма прописью

    const wordsElement = document.getElementById('totalWords');

    if (total > 0) {
        const words = numberToWords(total);

        wordsElement.textContent = words
            ? '(' + words + ')'
            : '';
    } else {
        wordsElement.textContent = '';
    }

    // Предоплата и остаток

    document.getElementById('paymentDetails').innerHTML =
        'Предоплата (' + percent + '%): ' +
        formatMoney(prepaymentAmount) +
        '<br>' +
        'Остаток (' + balancePercent + '%): ' +
        formatMoney(balanceAmount);
}


// =====================================
// ОБНОВЛЕНИЕ ИМЕНИ ЗАКАЗЧИКА
// =====================================

function updateNames() {

    document.getElementById('clientName').textContent =
        document.querySelector('[data-save="client"]').value;
}


// =====================================
// СОХРАНЕНИЕ ДОГОВОРА
// =====================================

function save() {

    const data = {};

    fields.forEach(x => {
        data[x.dataset.save] = x.value;
    });

    data.sig1 = document.getElementById('sig1').toDataURL();

    data.sig2 = document.getElementById('sig2').toDataURL();

    try {

        localStorage.setItem(
            'arthouse_furniture_contract',
            JSON.stringify(data)
        );

        alert('Договор сохранён в этом браузере.');

    } catch(e) {

        alert('Не удалось сохранить данные.');

    }
}


// =====================================
// ВОССТАНОВЛЕНИЕ ПОДПИСЕЙ
// =====================================

function restoreSignature(id, src) {

    const img = new Image();

    img.onload = () => {

        const c = document.getElementById(id);

        const ctx = c.getContext('2d');

        ctx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.drawImage(img, 0, 0, c.width, c.height);

        ctx.setTransform(2, 0, 0, 2, 0, 0);

    };

    img.src = src;
}


// =====================================
// ЗАГРУЗКА СОХРАНЁННЫХ ДАННЫХ
// =====================================

function load() {

    try {

        const data = JSON.parse(
            localStorage.getItem('arthouse_furniture_contract') || '{}'
        );

        fields.forEach(x => {

            if (data[x.dataset.save] !== undefined) {
                x.value = data[x.dataset.save];
            }

        });

        ['sig1', 'sig2'].forEach(id => {

            if (data[id]) {
                restoreSignature(id, data[id]);
            }

        });

    } catch(e) {

        console.error('Ошибка загрузки договора:', e);

    }

    updateNames();

    updatePayments();
}


// =====================================
// НАСТРОЙКА ПОЛЯ ПОДПИСИ
// =====================================

function setupCanvas(id) {

    const c = document.getElementById(id);

    const ctx = c.getContext('2d');

    let drawing = false;

    let last = null;

    function resize() {

        const old = c.toDataURL();

        const w = c.clientWidth;

        c.width = w * 2;

        c.height = 220;

        ctx.setTransform(2, 0, 0, 2, 0, 0);

        if (old !== 'data:,') {
            restoreSignature(id, old);
        }

        ctx.strokeStyle = '#111';

        ctx.lineWidth = 2;

        ctx.lineCap = 'round';

        ctx.lineJoin = 'round';
    }

    resize();

    window.addEventListener('resize', resize);

    function point(e) {

        const r = c.getBoundingClientRect();

        return {
            x: e.clientX - r.left,
            y: e.clientY - r.top
        };
    }

    c.addEventListener('pointerdown', e => {

        drawing = true;

        c.setPointerCapture(e.pointerId);

        last = point(e);

        ctx.beginPath();

        ctx.moveTo(last.x, last.y);

    });

    c.addEventListener('pointermove', e => {

        if (!drawing) return;

        const p = point(e);

        ctx.beginPath();

        ctx.moveTo(last.x, last.y);

        ctx.lineTo(p.x, p.y);

        ctx.stroke();

        last = p;

    });

    function stop() {

        drawing = false;

        last = null;

    }

    c.addEventListener('pointerup', stop);

    c.addEventListener('pointercancel', stop);

}


// =====================================
// ОЧИСТКА ПОДПИСИ
// =====================================

function clearSig(id) {

    const c = document.getElementById(id);

    const ctx = c.getContext('2d');

    ctx.clearRect(0, 0, c.width / 2, c.height / 2);

}


// =====================================
// ПОЛНАЯ ОЧИСТКА ДОГОВОРА
// =====================================

function resetAll() {

    if (confirm('Удалить все заполненные данные и подписи?')) {

        localStorage.removeItem('arthouse_furniture_contract');

        location.reload();

    }

}


// =====================================
// ЗАПУСК
// =====================================

// Обновление при вводе данных

fields.forEach(x => {

    x.addEventListener('input', () => {

        updateNames();

        updatePayments();

    });

});


// Настройка подписей

setupCanvas('sig1');

setupCanvas('sig2');


// Загрузка данных

load();


// Сохранение перед печатью

window.addEventListener('beforeprint', save);
