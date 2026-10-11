(function(){'use strict';
var $=function(id){return document.getElementById(id)},C=window.ClaimCalc;
var money=function(n){return 'NT$ '+Math.round(n||0).toLocaleString('zh-TW')};
var val=function(id){return Math.max(0,Number(String($(id).value).replace(/[^\d.]/g,''))||0)};
var fmt=function(el){var d=el.value.replace(/[^\d]/g,'');el.value=d?Number(d).toLocaleString('zh-TW'):''};
var gross=0,cur='damage';
var FIELDS=[['medical','醫療費用（已發生）','掛號、部分負擔、自費檢查、復健等。'],['futureMedical','未來必要醫療及復健費','依醫囑之後續回診、復健或手術費用。'],['lostIncome','工作損失（不能工作之損失）','例如日薪 × 醫囑「宜休養」天數；需薪資或請假證明。'],['care','看護費','需醫囑記載「需專人看護○日」；家屬看護也可參考一般看護行情主張。'],['transport','交通費及其他必要支出','就醫交通、停車費、護具等。'],['property','車輛及其他財產損失','修車費（零件扣折舊後）、拖吊、物品損壞等；車輛貶值通常需鑑價。'],['solatium','精神慰撫金','由法院依傷勢程度、雙方身分地位與經濟狀況等酌定，實際判賠常低於主張金額。']];
$('claimFields').innerHTML=FIELDS.map(function(f){return '<div class="field"><label for="'+f[0]+'">'+f[1]+'</label><small>'+f[2]+'</small><div class="money"><span>NT$</span><input id="'+f[0]+'" class="amt claim-in" inputmode="numeric" placeholder="0"></div></div>'}).join('');
document.querySelectorAll('.amt').forEach(function(el){el.addEventListener('input',function(){fmt(el);if(el.classList.contains('claim-in')||el.id==='paid')updateClaim();})});
$('paid').classList.add('claim-in');
function setFault(p,v){v=Math.max(0,Math.min(100,Math.round(Number(String(v).replace(/[^\d]/g,''))||0)));$(p).value=v;$(p+'R').value=v;$(p+'V').textContent=v+'%';if(p==='claimFault')updateClaim();}
['damageFault','claimFault'].forEach(function(p){$(p+'R').addEventListener('input',function(){setFault(p,this.value)});$(p).addEventListener('change',function(){setFault(p,this.value)});$(p).addEventListener('input',function(){if(this.value!=='')setFault(p,this.value)});});
function tab(t){cur=t;document.querySelectorAll('.tab').forEach(function(b){b.classList.toggle('active',b.dataset.tab===t)});document.querySelectorAll('.panel').forEach(function(x){x.classList.toggle('active',x.id===t)});sticky();}
document.querySelectorAll('.tab').forEach(function(b){b.addEventListener('click',function(){tab(b.dataset.tab)})});
function sticky(){if(cur==='guide'&&window.ACGuideSticky){var g=window.ACGuideSticky();$('stickyLabel').textContent=g[0];$('stickyVal').textContent=g[1];return}if(cur==='damage'){$('stickyLabel').textContent='依肇責參考金額';$('stickyVal').textContent=$('dClaim').textContent}else{$('stickyLabel').textContent='尚未獲賠參考金額';$('stickyVal').textContent=$('cRemaining').textContent}}
function err(m){$('damageError').textContent=m;$('damageError').hidden=!m}
function calc(scroll){err('');var v=$('vehicle').value,fr=$('firstDate').value,ar=$('accDate').value;
if(!v||!fr||!ar){if(scroll)err('請完整填寫車種與日期。');return}
var f=new Date(fr+'T00:00:00'),a=new Date(ar+'T00:00:00');if(a<f){err('事故日期不得早於第一次領牌日期。');return}
var parts=val('parts'),labor=val('labor'),fault=val('damageFault'),months=C.monthsUsed(f,a),rate=C.RATES[v];
var after=C.depValue(parts,months,rate),y=Math.floor(months/12),m=months%12;gross=after+labor;
$('dAge').textContent=(y?y+' 年 ':'')+(m?m+' 個月':'');$('dRate').textContent=(rate*100).toFixed(1)+'%';$('dParts').textContent=money(parts);$('dDep').textContent=money(parts-after);$('dAfter').textContent=money(after);$('dLabor').textContent=money(labor);$('dGross').textContent=money(gross);$('dClaim').textContent=money(gross*fault/100);
$('sendToClaim').disabled=false;sticky();
localStorage.setItem('acDamage',JSON.stringify({v:v,fr:fr,ar:ar,parts:$('parts').value,labor:$('labor').value,fault:fault}));
if(scroll)$('damageResult').scrollIntoView({behavior:'smooth',block:'start'});}
$('calcDamage').addEventListener('click',function(){calc(true)});
$('sendToClaim').addEventListener('click',function(){$('property').value=Math.round(gross).toLocaleString('zh-TW');setFault('claimFault',$('damageFault').value);tab('claim');updateClaim();window.scrollTo({top:0,behavior:'smooth'})});
$('clearDamage').addEventListener('click',function(){['vehicle','firstDate','accDate','parts','labor'].forEach(function(id){$(id).value=''});setFault('damageFault',100);['dAge','dRate','dParts','dDep','dAfter','dLabor','dGross','dClaim'].forEach(function(id){$(id).textContent='—'});gross=0;$('sendToClaim').disabled=true;err('');localStorage.removeItem('acDamage');sticky();});
function updateClaim(){var total=FIELDS.reduce(function(s,f){return s+val(f[0])},0),fault=val('claimFault'),paid=val('paid'),fd=total*fault/100,rem=Math.max(0,fd-paid);
$('cTotal').textContent=money(total);$('cFaulted').textContent=money(fd);$('cPaid').textContent='− '+money(paid);$('cRemaining').textContent=money(rem);
$('claimTable').innerHTML='<table class="claim-table"><thead><tr><th>請求項目</th><th>金額</th></tr></thead><tbody>'+FIELDS.map(function(f){return '<tr><td>'+f[1]+'</td><td>'+money(val(f[0]))+'</td></tr>'}).join('')+'<tr><th>合計</th><th style="text-align:right">'+money(total)+'</th></tr></tbody></table>';
var s={fault:fault,paid:$('paid').value};FIELDS.forEach(function(f){s[f[0]]=$(f[0]).value});localStorage.setItem('acClaim',JSON.stringify(s));sticky();}
function toast(m){var t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},2200)}
$('copyClaim').addEventListener('click',function(){var L=['車禍民事損害賠償請求清單'];FIELDS.forEach(function(f){L.push(f[1]+'：'+money(val(f[0])))});L.push('合計請求金額：'+$('cTotal').textContent,'對方肇責比例：'+val('claimFault')+'%','依肇責比例後：'+$('cFaulted').textContent,'已領理賠／補償：'+money(val('paid')),'尚未獲賠參考金額：'+$('cRemaining').textContent,'（本清單僅供參考，實際以判決或和解為準）');var txt=L.join('\n');
function fb(){var ta=$('copyFallback');ta.hidden=false;ta.value=txt;ta.focus();ta.select();var ok=false;try{ok=document.execCommand('copy')}catch(e){}toast(ok?'✅ 已複製清單':'請長按下方文字手動複製')}
if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(txt).then(function(){toast('✅ 已複製清單')},fb);else fb();});
window.ACTab=tab;window.ACClaimText=function(){var L=['車禍民事損害賠償請求清單'];FIELDS.forEach(function(f){L.push(f[1]+'：'+money(val(f[0])))});L.push('合計請求金額：'+$('cTotal').textContent,'對方肇責比例：'+val('claimFault')+'%','尚未獲賠參考金額：'+$('cRemaining').textContent);return L.join('\n')};
$('printClaim').addEventListener('click',function(){window.print()});
$('clearClaim').addEventListener('click',function(){FIELDS.forEach(function(f){$(f[0]).value=''});$('paid').value='';$('copyFallback').hidden=true;localStorage.removeItem('acClaim');setFault('claimFault',100);});
// restore
try{var d=JSON.parse(localStorage.getItem('acDamage')||'null');if(d){$('vehicle').value=d.v;$('firstDate').value=d.fr;$('accDate').value=d.ar;$('parts').value=d.parts;$('labor').value=d.labor;setFault('damageFault',d.fault);calc(false)}
var c=JSON.parse(localStorage.getItem('acClaim')||'null');if(c){FIELDS.forEach(function(f){$(f[0]).value=c[f[0]]||''});$('paid').value=c.paid||'';setFault('claimFault',c.fault)}else setFault('claimFault',100);}catch(e){}
if(!$('accDate').value){var t=new Date();$('accDate').value=t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0')}
updateClaim();sticky();})();
