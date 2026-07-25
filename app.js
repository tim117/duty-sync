// 1. 定義排班核心邏輯與基準日
const ruleCode = "62626602626206"; 
const ruleArray = ruleCode.split('');
// 基準日設定為 2023-10-02 (使用 UTC 確保跨時區計算天數絕對精準)
const anchorDate = new Date(Date.UTC(2023, 9, 2)); 

// 2. 綁定 HTML 元素
const monthPicker = document.getElementById('month-picker');
const grid = document.getElementById('calendar-grid');
const linDaysEl = document.getElementById('lin-days');
const chenDaysEl = document.getElementById('chen-days');

// 3. 生成特定月份的排班表
function generateCalendar(year, month) {
    grid.innerHTML = ''; // 清空現有網格
    let linCount = 0;
    let chenCount = 0;

    const daysInMonth = new Date(year, month, 0).getDate(); // 取得該月總天數
    const startDayOfWeek = new Date(year, month - 1, 1).getDay(); // 取得該月1號是星期幾

    // 計算目標月份 1 號距離 2023-10-02 基準日經過了幾天
    const targetDate = new Date(Date.UTC(year, month - 1, 1));
    const diffTime = targetDate.getTime() - anchorDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // 計算該月 1 號在 14 天循環中的起始索引 (確保為正數)
    let startIndex = (diffDays % 14 + 14) % 14;

    // 補齊月初的空白天數
    for(let i = 0; i < startDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell empty';
        grid.appendChild(emptyCell);
    }

    // 填入排班資料
    for (let i = 0; i < daysInMonth; i++) {
        // 依照天數推進，循環讀取 14 碼
        let ruleIndex = (startIndex + i) % 14; 
        let currentCode = ruleArray[ruleIndex];
        
        let person = "";
        let uiClass = "";

        // 依據您的規則：6是林，2和0是陳
        if (currentCode === '6') {
            person = "林";
            uiClass = "shift-lin";
            linCount++;
        } else {
            person = "陳";
            uiClass = "shift-chen";
            chenCount++;
        }

        const cell = document.createElement('div');
        cell.className = 'day-cell';
        cell.innerHTML = `
            <div class="date-num">${i + 1}</div>
            <div class="shift-label ${uiClass}">${person}</div>
        `;
        grid.appendChild(cell);
    }

    // 更新統計數據
    linDaysEl.innerText = `${linCount}天`;
    chenDaysEl.innerText = `${chenCount}天`;
}

// 4. 監聽月份選擇器變更事件
monthPicker.addEventListener('change', (e) => {
    const [year, month] = e.target.value.split('-');
    generateCalendar(parseInt(year), parseInt(month));
});

// 5. 初始化：讀取預設值 (2026-07) 並生成畫面
const [initYear, initMonth] = monthPicker.value.split('-');
generateCalendar(parseInt(initYear), parseInt(initMonth));
