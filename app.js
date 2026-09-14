let exam=[], answers={}, idx=0, timerId=null, remaining=0, submitted=false;
let optionOrders={};
const $=id=>document.getElementById(id);
const EDIT_KEY='mech_inf_pure_text_edits_v4_rechecked';
let edits={}; try{edits=JSON.parse(localStorage.getItem(EDIT_KEY)||'{}')}catch(e){edits={}}
function shuffled(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function shuffledDifferent(a){
 const original=[...a];
 if(original.length<2)return original;
 let out=shuffled(original);
 for(let i=0;i<8&&out.every((v,n)=>v===original[n]);i++)out=shuffled(original);
 if(out.every((v,n)=>v===original[n]))out=[...original.slice(1),original[0]];
 return out;
}
function optionOrder(q){return optionOrders[q.id]||q.options}
function displayLetter(q,originalLetter){const i=optionOrder(q).indexOf(originalLetter);return i>=0?String.fromCharCode(65+i):originalLetter}
function normalizeMulti(s){return [...new Set((s||'').split(''))].sort().join('')}
function qText(q){return edits[q.id]?.text ?? q.text}
function cText(q,l){return edits[q.id]?.choices?.[l] ?? q.choices[l] ?? l}
function answered(q){const a=answers[q.id];return q.kind==='multi'?Array.isArray(a)&&a.length>0:q.kind==='sequence'?Array.isArray(a)&&a.length>0:!!a}
function isCorrect(q){const a=answers[q.id];if(!answered(q))return false;if(q.kind==='single')return a===q.answer;if(q.kind==='sequence')return a.join('')===q.answer;return normalizeMulti(a.join(''))===normalizeMulti(q.answer)}
function selectedString(q){const a=answers[q.id];if(!a||!a.length)return '未作答';return Array.isArray(a)?a.join(''):a}
function answerWithText(q,s){
 if(!s||s==='未作答')return s;
 let letters=s.split('');
 if(q.kind!=='sequence')letters.sort((a,b)=>optionOrder(q).indexOf(a)-optionOrder(q).indexOf(b));
 return letters.map(l=>`${displayLetter(q,l)}. ${cText(q,l)}`).join('；')
}
function makeExam(poolOverride=null){
 let pool=poolOverride?poolOverride:[...BANK];
 if(!poolOverride){const mode=$('mode').value;if(mode!=='all')pool=pool.filter(q=>q.section===mode);if($('shuffle').value==='1')pool=shuffled(pool);const c=$('count').value;if(c!=='all')pool=pool.slice(0,Math.min(+c,pool.length));}
 exam=pool;answers={};optionOrders={};exam.forEach(q=>optionOrders[q.id]=shuffledDifferent(q.options));idx=0;submitted=false;$('setup').classList.add('hidden');$('result').classList.add('hidden');$('exam').classList.remove('hidden');setupTimer();renderGrid();render();window.scrollTo({top:0,behavior:'smooth'});
}
function setupTimer(){clearInterval(timerId);const m=+$('minutes').value;if(!m){remaining=0;$('timer').textContent='不限時';return}remaining=m*60;tick();timerId=setInterval(()=>{remaining--;tick();if(remaining<=0){clearInterval(timerId);submitExam(true)}},1000)}
function tick(){const mm=Math.floor(remaining/60),ss=remaining%60;$('timer').textContent=`剩餘 ${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`}
function renderGrid(){const g=$('qgrid');g.innerHTML='';exam.forEach((q,i)=>{const b=document.createElement('button');b.className='qdot';b.textContent=i+1;b.onclick=()=>{idx=i;render()};g.appendChild(b)})}
function render(){
 const q=exam[idx];if(!q)return;
 $('counter').textContent=`第 ${idx+1} / ${exam.length} 題`;$('progress').style.width=`${(idx+1)/exam.length*100}%`;
 $('sourceLabel').textContent=`來源：${q.section==='single'?'單選':'複選'}原題 ${q.sourceNo}`;
 $('typePill').textContent=q.kind==='single'?'單選題':q.kind==='sequence'?'排序題':'複選題';
 $('qtext').textContent=qText(q);
 $('prevBtn').disabled=idx===0;$('nextBtn').disabled=idx===exam.length-1;
 $('hint').textContent=q.kind==='single'?'選一個答案；選項順序每次測驗都會重新打亂。':q.kind==='sequence'?'依正確順序點選選項；每個選項只能使用一次。選項順序每次測驗都會重新打亂。':'可選一個以上答案；全部選對才得分。選項順序每次測驗都會重新打亂。';
 $('seqArea').classList.toggle('hidden',q.kind!=='sequence');
 const box=$('options');box.innerHTML='';
 if(q.kind==='sequence'){const a=answers[q.id]||[];$('seqBox').innerHTML=a.length?a.map(x=>`<span class="seqToken">${displayLetter(q,x)}</span>`).join(''):'<span class="sub">尚未排列</span>';}
 optionOrder(q).forEach((originalLetter,pos)=>{const shownLetter=String.fromCharCode(65+pos);const b=document.createElement('button');b.className='opt';b.innerHTML=`<span class="letter">${shownLetter}</span><span>${escapeHtml(cText(q,originalLetter))}</span>`;const a=answers[q.id];if(q.kind==='single'&&a===originalLetter)b.classList.add('selected');if(q.kind==='multi'&&Array.isArray(a)&&a.includes(originalLetter))b.classList.add('selected');if(q.kind==='sequence'&&Array.isArray(a)&&a.includes(originalLetter))b.disabled=true;b.onclick=()=>choose(q,originalLetter);box.appendChild(b)});
 $('answerState').textContent=answered(q)?'已作答':'未作答';[...$('qgrid').children].forEach((b,i)=>{b.classList.toggle('answered',answered(exam[i]));b.classList.toggle('current',i===idx)});
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function choose(q,l){if(q.kind==='single')answers[q.id]=l;else if(q.kind==='multi'){let a=answers[q.id]||[];answers[q.id]=a.includes(l)?a.filter(x=>x!==l):[...a,l]}else{let a=answers[q.id]||[];if(!a.includes(l))answers[q.id]=[...a,l]}render()}
$('undoSeq').onclick=()=>{const q=exam[idx];let a=answers[q.id]||[];answers[q.id]=a.slice(0,-1);render()};$('clearSeq').onclick=()=>{answers[exam[idx].id]=[];render()};
$('prevBtn').onclick=()=>{if(idx>0){idx--;render()}};$('nextBtn').onclick=()=>{if(idx<exam.length-1){idx++;render()}};

$('editText').onclick=()=>{const q=exam[idx];const current={text:qText(q),choices:{}};q.options.forEach(l=>current.choices[l]=cText(q,l));const nt=prompt('修正題目文字：',current.text);if(nt===null)return;const nc={};for(const l of optionOrder(q)){const v=prompt(`修正 ${displayLetter(q,l)} 選項：`,current.choices[l]);if(v===null)return;nc[l]=v}edits[q.id]={text:nt,choices:nc};localStorage.setItem(EDIT_KEY,JSON.stringify(edits));render();};
$('clearEdits').onclick=()=>{if(confirm('確定清除所有自訂文字修正？')){edits={};localStorage.removeItem(EDIT_KEY);alert('已清除。')}};
function submitExam(auto=false){if(submitted)return;const blanks=exam.filter(q=>!answered(q)).length;if(!auto&&blanks&&!confirm(`還有 ${blanks} 題未作答，確定交卷嗎？`))return;submitted=true;clearInterval(timerId);const correct=exam.filter(isCorrect).length,wrong=exam.length-correct-blanks,score=Math.round(correct/exam.length*1000)/10;$('exam').classList.add('hidden');$('result').classList.remove('hidden');$('score').textContent=score.toFixed(1);$('correctN').textContent=correct;$('wrongN').textContent=wrong;$('blankN').textContent=blanks;$('resultText').textContent=`共 ${exam.length} 題，每題等值；本次正確率 ${(correct/exam.length*100).toFixed(1)}%。${auto?'（時間到，自動交卷）':''}`;renderReview();window.scrollTo({top:0,behavior:'smooth'})}
function renderReview(){const r=$('review');r.innerHTML='';const bads=exam.filter(q=>!isCorrect(q));if(!bads.length){r.innerHTML='<div class="note good">全對！這次沒有錯題。</div>';return}bads.forEach((q,i)=>{const d=document.createElement('div');d.className='reviewItem';const mine=selectedString(q);const choices=optionOrder(q).map((l,pos)=>`${String.fromCharCode(65+pos)}. ${cText(q,l)}`).join('　');d.innerHTML=`<b>${i+1}. ${q.section==='single'?'單選':'複選'}原題 ${q.sourceNo}</b><div class="reviewQuestion">${escapeHtml(qText(q))}</div><div class="reviewChoices">${escapeHtml(choices)}</div><div class="${answered(q)?'bad':'warn'}" style="margin-top:7px">你的答案：${escapeHtml(answerWithText(q,mine))}<br>正確答案：${escapeHtml(answerWithText(q,q.answer))}</div>`;r.appendChild(d)})}
$('submitBtn').onclick=()=>submitExam(false);$('startBtn').onclick=()=>makeExam();$('newExam').onclick=()=>{clearInterval(timerId);$('result').classList.add('hidden');$('setup').classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'})};$('retryWrong').onclick=()=>{const wrong=exam.filter(q=>!isCorrect(q));if(!wrong.length)return;makeExam(shuffled(wrong))};
