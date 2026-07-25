// 1. 初始化 Firebase 雲端資料庫 (請把這裡替換成您在後台複製的金鑰！)
const firebaseConfig = {
  apiKey: "AIzaSyBmHUC1vB6U-u6gilIPUhRrDyjvOOyKfoQ",
  authDomain: "duty-sync-33ac9.firebaseapp.com",
  databaseURL: "https://duty-sync-33ac9-default-rtdb.firebaseio.com",
  projectId: "duty-sync-33ac9",
  storageBucket: "duty-sync-33ac9.firebasestorage.app",
  messagingSenderId: "389151039053",
  appId: "1:389151039053:web:f472cbfc306fa3933b4604",
  measurementId: "G-3GGC3438GD"
};

// 啟動雲端連線
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 2. 原本的排班核心邏輯
const shiftPattern = ["林", "林", "陳", "林", "陳", "林", "林", "陳", "陳", "林", "陳", "林", "陳", "陳"];
const anchorDate = new Date(Date.UTC(2026, 6, 5)); 

const monthPicker = document.getElementById('month-picker');
const grid = document.getElementById('calendar-grid');

let currentYear, currentMonth;
let dbSwaps = {}; // 用來存放從雲端抓下來的調班紀錄

// 3. ★ 核心靈魂：監聽雲端資料庫變更 ★
// 只要您或陳班任何一人點擊了格子，雲端資料一變動，這裡就會瞬間觸發並更新畫面
db.ref('duty_swaps').on('value', (snapshot) => {
    dbSwaps = snapshot.val() || {}; // 抓取最新的調班狀態
    
    // 如果畫面已經載入，就馬上重新渲染最新的網格
    if(currentYear && currentMonth) {
        renderGrid(currentYear, currentMonth);
    }
});

// 設定當前選擇的月份
function generateCalendar(year, month) {
    currentYear = year;
    currentMonth = month;
    renderGrid(year, month);
}

// 繪製日曆畫面的功能
function renderGrid(year, month) {
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
        
        // 產生該日期的唯一 Key (例如: "2026-07-25")
        const dateString = `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
        
        // 從雲端變數 dbSwaps 讀取這天是否有被調班
        let savedPerson = dbSwaps[dateString];
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

        // 點擊事件改為「寫入雲端」
        cell.addEventListener('click', () => {
            const newPerson = finalPerson === "林" ? "陳" : "林";
            
            // 如果調換回原本的預設班，就將雲端的紀錄刪除，保持資料庫乾淨
            if (newPerson === defaultPerson) {
                db.ref('duty_swaps/' + dateString).remove();
            } else {
                // 否則，將新的人員名稱寫入雲端
                db.ref('duty_swaps/' + dateString).set(newPerson);
            }
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
