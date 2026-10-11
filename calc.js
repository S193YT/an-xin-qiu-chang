(function(g){
// 使用月數：滿月以日判斷；有剩餘天數則進位一個月；剛好整月不加；最少 1 個月
function addMonths(d,n){var y=d.getFullYear(),m=d.getMonth()+n,day=d.getDate();var last=new Date(y,m+1,0).getDate();return new Date(y,m,Math.min(day,last));}
function monthsUsed(a,b){var n=(b.getFullYear()-a.getFullYear())*12+(b.getMonth()-a.getMonth());if(addMonths(a,n)>b)n--;if(addMonths(a,n)<b)n++;return Math.max(1,n);}
function depValue(cost,months,rate){var v=cost,y=Math.floor(months/12),x=months%12;for(var i=0;i<y;i++)v*=1-rate;if(x)v*=1-rate*x/12;return Math.max(v,cost*.1);}
function addDays(d,n){return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);}
function deadlines(acc){return [
 {k:'scene',d:addDays(acc,7),t:'可申請現場圖、現場照片',s:'事故滿 7 日後，向處理的警察機關申請。',from:true},
 {k:'report',d:addDays(acc,30),t:'可申請初步分析研判表',s:'事故滿 30 日後申請；研判表僅供參考。',from:true},
 {k:'appraise',d:addMonths(acc,6),t:'行車事故鑑定申請期限',s:'肇責有爭議，原則上須於事故日起 6 個月內申請。'},
 {k:'criminal',d:addMonths(acc,6),t:'過失傷害刑事告訴期限（估）',s:'有人受傷時，自知悉犯人起 6 個月內提出。'},
 {k:'civil',d:addMonths(acc,24),t:'民事求償、強制險請求時效（估）',s:'自知有損害及賠償義務人（保險人）起 2 年。'}];}
var C={deadlines:deadlines,addMonths:addMonths,monthsUsed:monthsUsed,depValue:depValue,RATES:{car:.369,moto:.536}};
if(typeof module!=='undefined')module.exports=C;else g.ClaimCalc=C;})(this);
