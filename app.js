// 1. 根據您提供的 7/5~7/18 排班，建立 14 天的絕對人名陣列
// 前7天(7/5-7/11): 林林陳林陳林林
// 後7天(7/12-7/18): 陳陳林陳林陳陳
const shiftPattern = ["林", "林", "陳", "林", "陳", "林", "林", "陳", "陳", "林", "陳", "林", "陳", "陳"];

// 2. 基準日設定為 2026-07-05 (這天剛好對應陣列的第 0 項：林)
// 使用 UTC 時間計算確保不會因為時區產生天數誤差
const anchorDate = new Date(Date.UTC(2026, 6, 5)); 

const monthPicker = document.getElementById('month-picker');
const grid = document.getElementById('calendar-grid');

function generateCalendar(year, month) {
    grid.innerHTML = ''; // 清空網格

    const daysInMonth = new Date(year, month, 0).getDate();
    const startDayOfWeek = new Date(year, month - 1, 1).getDay(); 

    // 計算目標月份 1 號距離 2026-07-05 的天數差
    const targetDate = new Date(Date.UTC(year, month - 1, 1));
    const diffTime = targetDate.getTime() - anchorDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // 求出該月 1 號在 shiftPattern 中的起始索引
    let startIndex = (diffDays % 14 + 14) % 14;

    // 補齊月初空白
    for(let i = 0; i < startDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell empty';
        grid.appendChild(emptyCell);
    }

    // 生成每日格子
    for (let i = 0; i < daysInMonth; i++) {
        let ruleIndex = (startIndex + i) % 14; 
        let person = shiftPattern[ruleIndex];
        let uiClass = person === "林" ? "shift-lin" : "shift-chen";

        // 判斷是否為六、日 (0是日, 6是六)
        const currentDayOfWeek = (startDayOfWeek + i) % 7;
        const isWeekend = currentDayOfWeek === 0 || currentDayOfWeek === 6;
        const weekendClass = isWeekend ? "weekend-bg" : "";

        const cell = document.createElement('div');
        cell.className = `day-cell ${weekendClass}`; // 加入週末專屬CSS
        cell.innerHTML = `
            <div class="date-num">${i + 1}</div>
            <div class="shift-label ${uiClass}">${person}</div>
        `;
        grid.appendChild(cell);
    }
}

// 監聽月份選擇
monthPicker.addEventListener('change', (e) => {
    const [year, month] = e.target.value.split('-');
    generateCalendar(parseInt(year), parseInt(month));
});

// 初始化畫面 (讀取 HTML 內的 2026-07)
const [initYear, initMonth] = monthPicker.value.split('-');
generateCalendar(parseInt(initYear), parseInt(initMonth));
