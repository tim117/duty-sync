const shiftPattern = ["林", "林", "陳", "林", "陳", "林", "林", "陳", "陳", "林", "陳", "林", "陳", "陳"];
const anchorDate = new Date(Date.UTC(2026, 6, 5)); 

const monthPicker = document.getElementById('month-picker');
const grid = document.getElementById('calendar-grid');

function generateCalendar(year, month) {
    grid.innerHTML = ''; 

    const daysInMonth = new Date(year, month, 0).getDate();
    const startDayOfWeek = new Date(year, month - 1, 1).getDay(); 

    const targetDate = new Date(Date.UTC(year, month - 1, 1));
    const diffTime = targetDate.getTime() - anchorDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let startIndex = (diffDays % 14 + 14) % 14;

    for(let i = 0; i < startDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell empty';
        grid.appendChild(emptyCell);
    }

    for (let i = 0; i < daysInMonth; i++) {
        let ruleIndex = (startIndex + i) % 14; 
        let defaultPerson = shiftPattern[ruleIndex];
        
        // 產生該日期的唯一 Key (例如: "2026-07-05")
        const dateString = `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
        
        // 檢查是否有手動調班的紀錄
        let savedPerson = localStorage.getItem(dateString);
        let finalPerson = savedPerson ? savedPerson : defaultPerson;
        let isModified = savedPerson && savedPerson !== defaultPerson;

        let uiClass = finalPerson === "林" ? "shift-lin" : "shift-chen";

        const currentDayOfWeek = (startDayOfWeek + i) % 7;
        const isWeekend = currentDayOfWeek === 0 || currentDayOfWeek === 6;
        const weekendClass = isWeekend ? "weekend-bg" : "";
        const modifiedClass = isModified ? "modified" : "";

        const cell = document.createElement('div');
        cell.className = `day-cell ${weekendClass} ${modifiedClass}`; 
        cell.innerHTML = `
            <div class="date-num">${i + 1}</div>
            <div class="shift-label ${uiClass}">${finalPerson}</div>
        `;

        // 加入點擊調班功能
        cell.addEventListener('click', () => {
            const newPerson = finalPerson === "林" ? "陳" : "林";
            localStorage.setItem(dateString, newPerson);
            generateCalendar(year, month); // 重新渲染畫面
        });

        grid.appendChild(cell);
    }
}

monthPicker.addEventListener('change', (e) => {
    const [year, month] = e.target.value.split('-');
    generateCalendar(parseInt(year), parseInt(month));
});

const [initYear, initMonth] = monthPicker.value.split('-');
generateCalendar(parseInt(initYear), parseInt(initMonth));
