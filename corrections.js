// 題庫校正：複選題 3、單選題 15
const m3 = BANK.find(q => q.id === 'M3');
if (m3) m3.choices.E = '對錶';

const s15 = BANK.find(q => q.id === 'S15');
if (s15) s15.choices.E = '對錶';
