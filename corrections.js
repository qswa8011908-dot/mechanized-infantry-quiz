// 題庫校正：複選題 3、單選題 15、單選題 18
const m3 = BANK.find(q => q.id === 'M3');
if (m3) m3.choices.E = '對錶';

const s15 = BANK.find(q => q.id === 'S15');
if (s15) s15.choices.E = '對錶';

const s18 = BANK.find(q => q.id === 'S18');
if (s18) s18.choices.A = '警戒遲滯地區';
