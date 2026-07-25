// 1. 定義排班核心邏輯
const ruleCode = "62626602626206"; 
const ruleArray = ruleCode.split(''); // 將字串拆成陣列
const daysInMonth = 31; // 假設以 7 月為例 (31天)
const startDayOfWeek = 3; // 假設 7/1 是星期三 (0=日, 1=一... 3=三)

// 2. 準備資料容器
let scheduleData = [];
let linCount = 0;
let chenCount = 0;

// 3. 生成當月排班資料
for (let i = 0; i < daysInMonth; i++) {
    // 找出對應的 14 天循環索引
    let ruleIndex = i % 14; 
    let currentCode = ruleArray[ruleIndex];
    
    // 依照您的需求指派人員與原始班別
    let person = "";
    let shiftType = "";
    let uiClass = "";

    if (currentCode === '6') {
        person = "林";
        shiftType = "全天";
        uiClass = "shift-lin";
        linCount++;
    } else {
        // 2 (白班) 或 0 (休假)
        person = "陳";
        shiftType = currentCode === '2' ? "白班" : "休假";
        uiClass = "shift-chen";
        chenCount++;
    }

    scheduleData.push({
        date: i + 1,
        person: person,
        originalShift: shiftType,
        uiClass: uiClass,
        isSwapped: false // 預設無調班
    });
}

// 4. 渲染統計數據
document.getElementById('lin-days').innerText = `${linCount} 天`;
document.getElementById('chen-days').innerText = `${chenCount} 天`;

// 5. 渲染日曆畫面
const grid = document.getElementById('calendar-grid');

// 補齊月初的空白天數 (對齊星期幾)
for(let i = 0; i < startDayOfWeek; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'day-cell';
    emptyCell.style.border = 'none';
    grid.appendChild(emptyCell);
}

// 填入排班資料
scheduleData.forEach(day => {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    
    cell.innerHTML = `
        <div class="date-num">${day.date}</div>
        <div class="shift-label ${day.uiClass}">${day.person}</div>
    `;
    
    // 預留點擊事件以供日後開發「申請調班」功能
    cell.addEventListener('click', () => {
        alert(`這天是 ${day.date} 號，原本由 ${day.person} 負責 (${day.originalShift})。\n調班確認功能將於下一階段實作！`);
    });

    grid.appendChild(cell);
});
