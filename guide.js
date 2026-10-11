(function(){'use strict';var $=function(i){return document.getElementById(i)},C=window.ClaimCalc;
var pad=function(n){return String(n).padStart(2,'0')},iso=function(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
var W='日一二三四五六',show=function(d){return d.getFullYear()+'/'+pad(d.getMonth()+1)+'/'+pad(d.getDate())+'（'+W[d.getDay()]+'）'};
function today(){var t=new Date();return new Date(t.getFullYear(),t.getMonth(),t.getDate())}
var nextInfo=['下一個期限','請輸入事故日期'];
function renderTL(){var v=$('gDate').value;if(!v){$('timeline').innerHTML='';nextInfo=['下一個期限','請輸入事故日期'];return}
var acc=new Date(v+'T00:00:00'),t=today(),next=null;
$('timeline').innerHTML=C.deadlines(acc).map(function(x){var diff=Math.round((x.d-t)/864e5),st,cls;
 if(x.from){if(diff<=0){st='現在可申請';cls='ok'}else{st='還有 '+diff+' 天';cls='wait'}}
 else{if(diff<0){st='已超過 '+(-diff)+' 天';cls='late'}else{st='剩 '+diff+' 天';cls=diff<=30?'soon':'wait';if(!next)next=[x,diff]}}
 if(x.from&&diff>0&&!next)next=[x,diff];
 return '<li class="'+cls+'"><div class="tl-date">'+show(x.d)+'</div><div class="tl-t">'+x.t+' <span class="badge '+cls+'">'+st+'</span></div><div class="tl-s">'+x.s+'</div></li>'}).join('');
nextInfo=next?[next[0].t.replace(/（估）/,''),'剩 '+next[1]+' 天']:['重要期限','均已到期，請儘速諮詢'];
localStorage.setItem('acGuideDate',v);}
window.ACGuideSticky=function(){return nextInfo};
$('gDate').addEventListener('input',function(){renderTL();if(window.ACTab)window.ACTab('guide')});
var DOCS=[['基本','理賠申請書（保險公司提供）','身分證、駕照、行照（車主與駕駛不同時兩人都要）','道路交通事故當事人登記聯單','現場圖／初步分析研判表','印章、銀行存摺封面'],
['有人受傷','診斷證明書（記得請醫師寫休養、看護天數）','醫療費用收據','看護證明及收據','就醫交通費收據','薪資證明、請假紀錄'],
['車損','修車估價單、維修發票','車損照片（修車前拍）','拖吊收據']];
var saved=JSON.parse(localStorage.getItem('acDocs')||'{}');
$('docList').innerHTML=DOCS.map(function(g,gi){return '<h3>'+g[0]+'</h3>'+g.slice(1).map(function(d,i){var id='doc'+gi+'_'+i;return '<label><input type="checkbox" id="'+id+'"'+(saved[id]?' checked':'')+'> '+d+'</label>'}).join('')}).join('')+'<p class="muted small" id="docCount"></p>';
function cnt(){var all=document.querySelectorAll('#docList input'),c=0,s={};all.forEach(function(x){if(x.checked){c++;s[x.id]=1}});$('docCount').textContent='已備齊 '+c+' / '+all.length+' 項';localStorage.setItem('acDocs',JSON.stringify(s))}
$('docList').addEventListener('change',cnt);cnt();
$('resetDocs').addEventListener('click',function(){document.querySelectorAll('#docList input').forEach(function(x){x.checked=false});cnt()});
$('printDocs').addEventListener('click',function(){document.body.classList.add('print-guide');window.print();setTimeout(function(){document.body.classList.remove('print-guide')},500)});
// share claim summary (user picks recipient)
$('shareClaim').addEventListener('click',function(){var txt='我整理了車禍求償清單，請幫我看看：\n'+window.ACClaimText();
 if(navigator.share){navigator.share({text:txt}).catch(function(){})}else{window.open('https://line.me/R/msg/text/?'+encodeURIComponent(txt),'_blank')}});
// init: use saved guide date, else damage accident date
var g=localStorage.getItem('acGuideDate')||$('accDate').value;if(g)$('gDate').value=g;renderTL();
})();
