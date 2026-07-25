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


// ==========================================
// 2. 核心排班邏輯與變數宣告
// ==========================================
// 14 天絕對排班矩陣 (以 2026-07-05 為第 0 項基準)
const shiftPattern = ["林", "林", "陳", "林", "陳", "林", "林", "陳", "陳", "林", "陳", "林", "陳", "陳"];
const anchorDate = new Date(Date.UTC(2026, 6, 5)); 

const monthPicker = document.getElementById('month-picker');
const grid = document.getElementById('calendar-grid');

let currentYear, currentMonth;
let dbSwaps = {}; // 用來存放從雲端抓下來的調班紀錄


// ==========================================
// 3. 監聽雲端資料庫變更 (即時同步核心)
// ==========================================
// 只要任何人點擊格子，雲端資料庫一變動，這裡就會瞬間觸發並重新繪製畫面
db.ref('duty_swaps').on('value', (snapshot) => {
    dbSwaps = snapshot.val() || {}; // 抓取最新的調班狀態
    
    // 如果畫面已經載入，就馬上重新渲染最新的網格
    if(currentYear && currentMonth) {
        renderGrid(currentYear, currentMonth);
    }
});


// ==========================================
// 4. 日曆生成與渲染功能
// ==========================================
// 設定當前選擇的月份並觸發渲染
function generateCalendar(year, month) {
    currentYear = year;
    currentMonth = month;
    renderGrid(year, month);
}

// 實際繪製日曆網格
function renderGrid(year, month) {
    grid.innerHTML = ''; // 清空舊網格

    const daysInMonth = new Date(year, month, 0).getDate();
    const startDayOfWeek = new Date(year, month - 1, 1).getDay(); 

    // 計算目標月份 1 號距離 2026-07-05 基準日的天數差
    const targetDate = new Date(Date.UTC(year, month - 1, 1));
    const diffTime = targetDate.getTime() - anchorDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // 求出該月 1 號在 shiftPattern 中的起始索引
    let startIndex = (diffDays % 14 + 14) % 14;

    // 補齊月初的空白天數
    for(let i = 0; i < startDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell empty';
        grid.appendChild(emptyCell);
    }

    // 生成每日排班格子
    for (let i = 0; i < daysInMonth; i++) {
        let ruleIndex = (startIndex + i) % 14; 
        let defaultPerson = shiftPattern[ruleIndex];
        
        // 產生該日期的唯一 Key (例如: "2026-07-25")
        const dateString = `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
        
        // 從雲端變數 dbSwaps 讀取這天是否有被手動調班過
        let savedPerson = dbSwaps[dateString];
        let finalPerson = savedPerson ? savedPerson : defaultPerson;
        let isModified = savedPerson && savedPerson !== defaultPerson;

        // 判斷視覺樣式
        let uiClass = finalPerson === "林" ? "shift-lin" : "shift-chen";
        const currentDayOfWeek = (startDayOfWeek + i) % 7;
        const isWeekend = currentDayOfWeek === 0 || currentDayOfWeek === 6;
        const weekendClass = isWeekend ? "weekend-bg" : "";
        const modifiedClass = isModified ? "modified" : "";

        // 建立格子 DOM 元素
        const cell = document.createElement('div');
        cell.className = `day-cell ${weekendClass} ${modifiedClass}`; 
        cell.innerHTML = `
            <div class="date-num">${i + 1}</div>
            <div class="shift-label ${uiClass}">${finalPerson}</div>
        `;

        // ==========================================
        // 5. 點擊調班事件綁定 (寫入 Firebase 並發送 Email)
        // ==========================================
        cell.addEventListener('click', () => {
            const newPerson = finalPerson === "林" ? "陳" : "林";
            let actionText = "";
            
            // 邏輯 A：更新雲端資料庫
            if (newPerson === defaultPerson) {
                // 如果調換回原本的預設班，就將雲端的紀錄刪除，保持資料庫乾淨
                db.ref('duty_swaps/' + dateString).remove();
                actionText = `已取消調班，恢復預設為【${defaultPerson}】`;
            } else {
                // 否則，將新的人員名稱寫入雲端
                db.ref('duty_swaps/' + dateString).set(newPerson);
                actionText = `已申請調換，該日改由【${newPerson}】值班`;
            }

            // 邏輯 B：發送 Email 通知
            // ★ 請將下方引號內的網址，替換成您剛剛拿到的 GAS 網頁應用程式網址 ★
            const gasUrl = "https://script.google.com/macros/s/AKfycbx5dE93SohpB1QGE0yRWQr2C-tCs9xcveV-mZHDHUj3a5bH-PTenzwDcEeVL3MnBBLg3g/exec";
            
            const notifySubject = "🔔【排班系統】班表異動通知";
            const notifyMessage = `系統偵測到班表異動，詳細資訊如下：\n\n・日期：${dateString}\n・狀態：${actionText}\n\n(此為系統自動發送之信件，請勿直接回覆)`;

            fetch(gasUrl, {
                method: "POST",
                mode: "no-cors",
                body: JSON.stringify({ message: notifyMessage }),
                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                }
            }).catch(err => console.error("Email 發送失敗", err));
        });

        // 將格子加入日曆網格中
        grid.appendChild(cell);
    }
}


// ==========================================
// 6. 系統初始化與事件監聽
// ==========================================
// 監聽頂部月份選擇器的變更
monthPicker.addEventListener('change', (e) => {
    const [year, month] = e.target.value.split('-');
    generateCalendar(parseInt(year), parseInt(month));
});

// 網頁載入時，讀取 HTML 上的預設月份並初始化畫面
const [initYear, initMonth] = monthPicker.value.split('-');
generateCalendar(parseInt(initYear), parseInt(initMonth));
