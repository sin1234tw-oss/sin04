let deductions = [{ name: '稅金', amount: 0 }];
const days = ['一', '二', '三', '四', '五', '六', '日'];

function init() {
    const grid = document.getElementById('daysGrid');
    grid.innerHTML = '';
    days.forEach((day, i) => {
        grid.innerHTML += `<div><label>週${day}</label><input type="number" id="day${i}" placeholder="0" oninput="calculate()"></div>`;
    });
    let d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1);
    document.getElementById('weekMonday').value = d.toISOString().split('T')[0];
    renderDeductions();
    calculate();
}

function addDeductionFromSelect(select) {
    if (select.value && !deductions.find(d => d.name === select.value)) {
        deductions.push({ name: select.value, amount: 0 });
    }
    select.value = "";
    renderDeductions();
    calculate();
}

function renderDeductions() {
    const area = document.getElementById('deductionArea');
    const store = document.getElementById('storeName').value;
    area.innerHTML = '';
    deductions.forEach((d, i) => {
        let isTax = (d.name === '稅金' && store === '威士登');
        area.innerHTML += `<div style="display:flex; justify-content:space-between; margin-bottom:8px; align-items:center;">
            <span style="color:${isTax ? '#00f2ff' : '#aaa'}">${d.name}${isTax ? '(自動5%)' : ''}</span>
            <input type="number" inputmode="numeric" value="${d.amount}" ${isTax ? 'readonly' : ''} 
                onchange="deductions[${i}].amount=Number(this.value);calculate()" 
                style="width:80px; background:#222; color:#fff; border:1px solid #444; padding:5px; text-align:right;">
            ${!isTax ? `<button onclick="deductions.splice(${i},1);renderDeductions();calculate()" style="background:none; border:none; color:red; cursor:pointer;">✕</button>` : ''}
        </div>`;
    });
}

function calculate() {
    let totalUnits = 0, dailyDetail = "";
    for(let i=0; i<7; i++) {
        let val = Number(document.getElementById(`day${i}`).value) || 0;
        totalUnits += val;
        dailyDetail += `${days[i]}：${val > 0 ? val : '休'}\n`;
    }
    let price = Number(document.getElementById('unitPrice').value);
    let subtotal = totalUnits * price;
    const store = document.getElementById('storeName').value;
    deductions.forEach(d => { if(d.name === '稅金' && store === '威士登') d.amount = (subtotal > 0) ? Math.max(800, Math.min(3600, Math.round(subtotal * 0.05))) : 0; });
    
    let totalDeduction = deductions.reduce((s, d) => s + d.amount, 0);
    let bill = `------------------\n每週薪資明細\n------------------\n藝名：${document.getElementById('name').value || '未填'}\n週期：${document.getElementById('weekMonday').value}\n店家：${store}\n------------------\n${dailyDetail}------------------\n總數：${totalUnits}\n檯價：${price}\n應領：$${subtotal.toLocaleString()}\n------------------\n扣項：\n`;
    deductions.forEach(d => { if(d.amount > 0) bill += `${d.name}($${d.amount})\n`; });
    bill += `------------------\n💰 實領金額：$${(subtotal - totalDeduction).toLocaleString()}\n------------------\n辛苦囉！\n現在的努力都是未來的果實！\n加油！愛自己！`;
    document.getElementById('finalBill').innerText = bill;
}

function switchMode(m) {
    document.getElementById('tab-club').classList.toggle('active', m === 'club');
    document.getElementById('tab-report').classList.toggle('active', m === 'report');
    document.getElementById('tab-history').classList.toggle('active', m === 'history');

    document.getElementById('input-section').classList.toggle('hidden', m !== 'club');
    document.getElementById('report-section').classList.toggle('hidden', m !== 'report');
    
    if (m === 'history') {
        document.getElementById('report-section').classList.remove('hidden');
        showHistory();
    }
}

function saveSalaryRecord() {
    let history = JSON.parse(localStorage.getItem('salaryHistory') || '[]');
    history.push({ date: new Date().getTime(), content: document.getElementById('finalBill').innerText });
    localStorage.setItem('salaryHistory', JSON.stringify(history));
    alert("紀錄已保存！");
}

function showHistory() {
    let history = JSON.parse(localStorage.getItem('salaryHistory') || '[]');
    let reportArea = document.getElementById('finalBill');
    if(history.length === 0) { reportArea.innerText = "目前沒有紀錄"; return; }
    
    reportArea.innerHTML = "--- 歷史紀錄 ---\n\n";
    history.forEach((h, i) => {
        let div = document.createElement('div');
        div.style.cssText = "background:#1a1a1a; border:1px solid #333; margin-bottom:10px; padding:12px; border-radius:8px;";
        div.innerHTML = `<div onclick="this.nextElementSibling.style.display=(this.nextElementSibling.style.display==='none'?'block':'none')" style="cursor:pointer; color:#00f2ff;">[${new Date(h.date).toLocaleDateString()}] 點擊展開詳情 <button onclick="event.stopPropagation(); deleteSingleRecord(${i})" style="color:red; background:none; border:none; cursor:pointer;">✕</button></div><pre style="display:none; white-space:pre-wrap;">${h.content}</pre>`;
        reportArea.appendChild(div);
    });
}

function deleteSingleRecord(index) {
    if(!confirm("確定刪除？")) return;
    let history = JSON.parse(localStorage.getItem('salaryHistory') || '[]');
    history.splice(index, 1);
    localStorage.setItem('salaryHistory', JSON.stringify(history));
    showHistory();
}

function copyBill() { navigator.clipboard.writeText(document.getElementById('finalBill').innerText).then(() => alert("已複製！")); }
init();