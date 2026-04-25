# -*- coding: utf-8 -*-
import re

# 读取文件
with open(r'C:\Users\1\Desktop\题库\6.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 删除hover动画
content = re.sub(r'\.question-item:hover\s*\{[^}]*transform:[^}]*\}', '', content, flags=re.DOTALL)

# 2. 添加标签图谱页面HTML
tag_graph_page = '''
        <!-- 标签知识图谱页面 -->
        <div id="tag-graph" class="page hidden">
            <div class="container">
                <h2>🏷️ 标签知识图谱</h2>
                <div class="tag-graph-controls">
                    <label>筛选题库：</label>
                    <select id="tag-graph-bank-filter" onchange="filterTagGraph()">
                        <option value="all">全部题库</option>
                    </select>
                    <button class="btn btn-primary" onclick="showPage('main')">返回题库</button>
                </div>
                <div class="tag-graph-container">
                    <canvas id="tag-canvas"></canvas>
                </div>
                <div id="tag-questions-panel" class="tag-questions-panel hidden">
                    <div class="tag-questions-header">
                        <h3 id="tag-questions-title">标签题目</h3>
                        <button class="btn btn-sm btn-secondary" onclick="closeTagQuestions()">关闭</button>
                    </div>
                    <div id="tag-questions-list"></div>
                </div>
            </div>
        </div>
'''

# 插入标签图谱页面（在错误本页面之后）
content = content.replace(
    '</div>\n        <!-- 错题本页面 -->',
    '</div>' + tag_graph_page + '\n        <!-- 错题本页面 -->'
)

# 3. 添加日历页面HTML
calendar_page = '''
        <!-- 日历系统页面 -->
        <div id="calendar" class="page hidden">
            <div class="container">
                <h2>📅 学习日历</h2>
                <div class="calendar-container">
                    <div class="calendar-left">
                        <div class="calendar-header">
                            <button class="btn btn-sm btn-secondary" onclick="changeMonth(-1)">◀</button>
                            <h3 id="calendar-title"></h3>
                            <button class="btn btn-sm btn-secondary" onclick="changeMonth(1)">▶</button>
                        </div>
                        <div class="calendar-grid">
                            <div class="calendar-day-header">日</div>
                            <div class="calendar-day-header">一</div>
                            <div class="calendar-day-header">二</div>
                            <div class="calendar-day-header">三</div>
                            <div class="calendar-day-header">四</div>
                            <div class="calendar-day-header">五</div>
                            <div class="calendar-day-header">六</div>
                            <div id="calendar-days"></div>
                        </div>
                        <div class="calendar-stats">
                            <p>本月打卡：<span id="month-checkin-count">0</span> 天</p>
                        </div>
                    </div>
                    <div class="calendar-right">
                        <div class="schedule-header">
                            <h3 id="schedule-date-title">今日日程</h3>
                        </div>
                        <div class="checkin-section">
                            <button id="checkin-btn" class="btn btn-success" onclick="checkInToday()">📌 今日打卡</button>
                        </div>
                        <div class="task-input-section">
                            <input type="text" id="task-input" class="form-control" placeholder="输入计划内容...">
                            <button class="btn btn-primary" onclick="addTask()">➕ 添加计划</button>
                        </div>
                        <div id="task-list" class="task-list"></div>
                        <div class="daily-stats" id="daily-stats">
                            <p>今日做题数：<span id="today-question-count">0</span></p>
                            <p>今日正确率：<span id="today-accuracy">0%</span></p>
                        </div>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="showPage('main')" style="margin-top: 20px;">返回题库</button>
            </div>
        </div>
'''

# 插入日历页面（在标签图谱页面之后）
content = content.replace(
    '</div>\n        <!-- 日历系统页面 -->',
    '</div>' + calendar_page + '\n        <!-- 日历系统页面 -->'
)

# 4. 添加CSS样式
css_styles = '''
        /* 标签知识图谱样式 */
        .tag-graph-controls {
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .tag-graph-container {
            width: 100%;
            height: 600px;
            border: 2px solid #ddd;
            border-radius: 8px;
            background: #fafafa;
            position: relative;
            overflow: hidden;
        }
        #tag-canvas {
            width: 100%;
            height: 100%;
        }
        .tag-questions-panel {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            max-width: 800px;
            max-height: 80vh;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 1000;
            display: flex;
            flex-direction: column;
        }
        .tag-questions-header {
            padding: 15px 20px;
            border-bottom: 1px solid #ddd;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f5f5f5;
            border-radius: 8px 8px 0 0;
        }
        .tag-questions-header h3 {
            margin: 0;
        }
        #tag-questions-list {
            padding: 20px;
            overflow-y: auto;
            flex: 1;
        }
        .tag-question-item {
            padding: 15px;
            border: 1px solid #eee;
            border-radius: 6px;
            margin-bottom: 10px;
            background: #fafafa;
        }
        .tag-question-bank {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }
        .tag-question-content {
            font-weight: bold;
            margin-bottom: 8px;
        }
        .tag-question-answer {
            color: #2ecc71;
        }

        /* 日历系统样式 */
        .calendar-container {
            display: flex;
            gap: 30px;
            margin-top: 20px;
        }
        .calendar-left {
            flex: 1;
        }
        .calendar-right {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 5px;
        }
        .calendar-day-header {
            text-align: center;
            font-weight: bold;
            padding: 10px;
            background: #f0f0f0;
            border-radius: 4px;
        }
        .calendar-day {
            text-align: center;
            padding: 15px 10px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
            position: relative;
            transition: all 0.2s;
        }
        .calendar-day:hover {
            background: #e3f2fd;
            border-color: #2196F3;
        }
        .calendar-day.today {
            background: #e8f5e9;
            border-color: #4CAF50;
            font-weight: bold;
        }
        .calendar-day.selected {
            background: #2196F3;
            color: white;
            border-color: #2196F3;
        }
        .calendar-day.empty {
            background: transparent;
            border: none;
            cursor: default;
        }
        .calendar-day.checked-in::after {
            content: '✓';
            position: absolute;
            top: 2px;
            right: 2px;
            font-size: 10px;
            color: #4CAF50;
        }
        .task-dot {
            position: absolute;
            bottom: 3px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 6px;
            border-radius: 50%;
        }
        .task-dot.uncompleted {
            background: #f44336;
        }
        .task-dot.completed {
            background: #4CAF50;
        }
        .calendar-stats {
            margin-top: 15px;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 6px;
        }
        .schedule-header {
            text-align: center;
            margin-bottom: 10px;
        }
        .checkin-section {
            text-align: center;
        }
        .task-input-section {
            display: flex;
            gap: 10px;
        }
        .task-input-section input {
            flex: 1;
        }
        .task-list {
            flex: 1;
            overflow-y: auto;
            max-height: 300px;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 10px;
            background: #fafafa;
        }
        .task-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: white;
            border-radius: 4px;
            margin-bottom: 8px;
            border-left: 3px solid #f44336;
        }
        .task-item.completed {
            border-left-color: #4CAF50;
            opacity: 0.7;
        }
        .task-item.completed .task-text {
            text-decoration: line-through;
        }
        .task-actions {
            display: flex;
            gap: 5px;
        }
        .daily-stats {
            padding: 15px;
            background: #e3f2fd;
            border-radius: 6px;
            text-align: center;
        }
        .daily-stats p {
            margin: 5px 0;
            font-weight: bold;
        }
        .daily-stats span {
            color: #2196F3;
            font-size: 18px;
        }
'''

# 在</style>前添加CSS
style_end = content.rfind('</style>')
content = content[:style_end] + css_styles + '\n' + content[style_end:]

# 5. 添加JavaScript函数
js_functions = '''
        // ==================== 标签知识图谱功能 ====================
        let graphNodes = [];
        let graphEdges = [];
        let currentGraphBankFilter = 'all';

        // 显示标签知识图谱
        function showTagGraph() {
            showPage('tag-graph');
            initTagGraph();
        }

        // 初始化标签知识图谱
        function initTagGraph() {
            const canvas = document.getElementById('tag-canvas');
            const ctx = canvas.getContext('2d');
            
            // 设置canvas尺寸
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
            
            // 获取题库列表
            const banks = JSON.parse(localStorage.getItem('question-banks') || '[]');
            
            // 更新题库筛选器
            const filterSelect = document.getElementById('tag-graph-bank-filter');
            const currentFilter = filterSelect.value;
            filterSelect.innerHTML = '<option value="all">全部题库</option>';
            banks.forEach((bank, index) => {
                const option = document.createElement('option');
                option.value = index.toString();
                option.textContent = bank.name;
                filterSelect.appendChild(option);
            });
            filterSelect.value = currentGraphBankFilter;
            
            // 收集所有标签
            const allTags = new Map();
            
            banks.forEach((bank, bankIndex) => {
                if (currentGraphBankFilter !== 'all' && currentGraphBankFilter !== bankIndex.toString()) {
                    return;
                }
                
                if (!bank.questions || !Array.isArray(bank.questions)) {
                    return;
                }
                
                bank.questions.forEach(q => {
                    if (q.tags && Array.isArray(q.tags)) {
                        q.tags.forEach(tag => {
                            const tagParts = tag.split('>');
                            let currentPath = '';
                            tagParts.forEach((part, level) => {
                                currentPath = currentPath ? currentPath + '>' + part : part;
                                if (!allTags.has(currentPath)) {
                                    allTags.set(currentPath, {
                                        name: part,
                                        path: currentPath,
                                        level: level,
                                        questions: [],
                                        bankName: bank.name
                                    });
                                }
                                allTags.get(currentPath).questions.push(q);
                            });
                        });
                    }
                });
            });
            
            // 创建节点
            graphNodes = [];
            graphEdges = [];
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(canvas.width, canvas.height) * 0.35;
            
            allTags.forEach((tag, path) => {
                const angle = (graphNodes.length * 2 * Math.PI) / allTags.size;
                const nodeRadius = 25 + (tag.level * 10);
                
                const node = {
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle),
                    radius: nodeRadius,
                    name: tag.name,
                    path: path,
                    level: tag.level,
                    color: tag.level === 0 ? '#9b59b6' : (tag.level === 1 ? '#34495e' : '#3498db'),
                    questions: tag.questions,
                    bankName: tag.bankName
                };
                
                graphNodes.push(node);
            });
            
            // 创建边（父子关系）
            allTags.forEach((tag, path) => {
                const parentPath = path.substring(0, path.lastIndexOf('>'));
                if (parentPath && allTags.has(parentPath)) {
                    const parentNode = graphNodes.find(n => n.path === parentPath);
                    const childNode = graphNodes.find(n => n.path === path);
                    if (parentNode && childNode) {
                        graphEdges.push({ from: parentNode, to: childNode });
                    }
                }
            });
            
            // 绘制图谱
            drawGraph(canvas, ctx);
            
            // 添加点击事件
            canvas.onclick = (e) => {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                graphNodes.forEach(node => {
                    const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
                    if (dist <= node.radius) {
                        showQuestionsByTag(node);
                    }
                });
            };
        }

        // 绘制图谱
        function drawGraph(canvas, ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 绘制边
            ctx.strokeStyle = '#bdc3c7';
            ctx.lineWidth = 2;
            graphEdges.forEach(edge => {
                ctx.beginPath();
                ctx.moveTo(edge.from.x, edge.from.y);
                ctx.lineTo(edge.to.x, edge.to.y);
                ctx.stroke();
            });
            
            // 绘制节点
            graphNodes.forEach(node => {
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fillStyle = node.color;
                ctx.fill();
                ctx.strokeStyle = '#2c3e50';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                ctx.fillStyle = 'white';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(node.name, node.x, node.y);
            });
        }

        // 筛选标签图谱
        function filterTagGraph() {
            currentGraphBankFilter = document.getElementById('tag-graph-bank-filter').value;
            initTagGraph();
        }

        // 显示标签对应的题目
        function showQuestionsByTag(node) {
            const panel = document.getElementById('tag-questions-panel');
            const title = document.getElementById('tag-questions-title');
            const list = document.getElementById('tag-questions-list');
            
            title.textContent = node.path + ' (' + node.questions.length + '道题)';
            
            let html = '';
            node.questions.forEach((q, index) => {
                html += '<div class="tag-question-item">';
                html += '<div class="tag-question-bank">题库：' + node.bankName + '</div>';
                html += '<div class="tag-question-content">' + (index + 1) + '. ' + q.question + '</div>';
                html += '<div class="tag-question-answer">答案：' + q.answer + '</div>';
                html += '</div>';
            });
            
            list.innerHTML = html;
            panel.classList.remove('hidden');
        }

        // 关闭标签题目面板
        function closeTagQuestions() {
            document.getElementById('tag-questions-panel').classList.add('hidden');
        }

        // ==================== 日历系统功能 ====================
        let currentDate = new Date();
        let selectedDate = new Date();
        const calendarKey = 'calendar-data';

        // 显示日历页面
        function showCalendar() {
            showPage('calendar');
            initCalendar();
        }

        // 初始化日历
        function initCalendar() {
            renderCalendar();
            loadSchedule();
            updateCheckInStatus();
            updateTodayStats();
        }

        // 渲染日历
        function renderCalendar() {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            
            document.getElementById('calendar-title').textContent = 
                year + '年' + (month + 1) + '月';
            
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            const daysContainer = document.getElementById('calendar-days');
            daysContainer.innerHTML = '';
            
            // 空白格子
            for (let i = 0; i < firstDay; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'calendar-day empty';
                daysContainer.appendChild(emptyDay);
            }
            
            // 日期格子
            for (let day = 1; day <= daysInMonth; day++) {
                const dayDiv = document.createElement('div');
                dayDiv.className = 'calendar-day';
                dayDiv.textContent = day;
                
                const dateStr = formatDate(year, month, day);
                const today = new Date();
                const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());
                
                if (dateStr === todayStr) {
                    dayDiv.classList.add('today');
                }
                
                if (dateStr === formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())) {
                    dayDiv.classList.add('selected');
                }
                
                // 检查是否打卡
                const calendarData = JSON.parse(localStorage.getItem(calendarKey) || '{}');
                if (calendarData.checkins && calendarData.checkins[dateStr]) {
                    dayDiv.classList.add('checked-in');
                }
                
                // 检查是否有计划
                const tasks = calendarData.tasks && calendarData.tasks[dateStr] || [];
                if (tasks.length > 0) {
                    const hasUncompleted = tasks.some(t => !t.completed);
                    const hasCompleted = tasks.some(t => t.completed);
                    
                    if (hasUncompleted && !hasCompleted) {
                        const dot = document.createElement('div');
                        dot.className = 'task-dot uncompleted';
                        dayDiv.appendChild(dot);
                    } else if (hasCompleted && !hasUncompleted) {
                        const dot = document.createElement('div');
                        dot.className = 'task-dot completed';
                        dayDiv.appendChild(dot);
                    } else {
                        const dot1 = document.createElement('div');
                        dot1.className = 'task-dot uncompleted';
                        dot1.style.left = '40%';
                        dayDiv.appendChild(dot1);
                        
                        const dot2 = document.createElement('div');
                        dot2.className = 'task-dot completed';
                        dot2.style.left = '60%';
                        dayDiv.appendChild(dot2);
                    }
                }
                
                dayDiv.onclick = () => selectDate(year, month, day);
                daysContainer.appendChild(dayDiv);
            }
            
            // 更新本月打卡统计
            updateMonthCheckInCount();
        }

        // 选择日期
        function selectDate(year, month, day) {
            selectedDate = new Date(year, month, day);
            renderCalendar();
            loadSchedule();
            updateCheckInStatus();
            updateTodayStats();
        }

        // 切换月份
        function changeMonth(delta) {
            currentDate.setMonth(currentDate.getMonth() + delta);
            renderCalendar();
        }

        // 加载日程
        function loadSchedule() {
            const dateStr = formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            document.getElementById('schedule-date-title').textContent = 
                selectedDate.getFullYear() + '年' + (selectedDate.getMonth() + 1) + '月' + selectedDate.getDate() + '日 日程';
            
            const calendarData = JSON.parse(localStorage.getItem(calendarKey) || '{}');
            const tasks = calendarData.tasks && calendarData.tasks[dateStr] || [];
            
            const taskList = document.getElementById('task-list');
            taskList.innerHTML = '';
            
            tasks.forEach((task, index) => {
                const taskItem = document.createElement('div');
                taskItem.className = 'task-item' + (task.completed ? ' completed' : '');
                taskItem.innerHTML = `
                    <span class="task-text">${task.text}</span>
                    <div class="task-actions">
                        <button class="btn btn-sm ${task.completed ? 'btn-warning' : 'btn-success'}" 
                                onclick="toggleTask('${dateStr}', ${index})">
                            ${task.completed ? '撤销' : '完成'}
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteTask('${dateStr}', ${index})">
                            删除
                        </button>
                    </div>
                `;
                taskList.appendChild(taskItem);
            });
        }

        // 添加计划
        function addTask() {
            const input = document.getElementById('task-input');
            const text = input.value.trim();
            
            if (!text) {
                alert('请输入计划内容！');
                return;
            }
            
            const dateStr = formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            
            const calendarData = JSON.parse(localStorage.getItem(calendarKey) || '{}');
            if (!calendarData.tasks) {
                calendarData.tasks = {};
            }
            if (!calendarData.tasks[dateStr]) {
                calendarData.tasks[dateStr] = [];
            }
            
            calendarData.tasks[dateStr].push({
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            });
            
            localStorage.setItem(calendarKey, JSON.stringify(calendarData));
            
            input.value = '';
            loadSchedule();
            renderCalendar();
        }

        // 切换任务状态
        function toggleTask(dateStr, index) {
            const calendarData = JSON.parse(localStorage.getItem(calendarKey) || '{}');
            if (calendarData.tasks && calendarData.tasks[dateStr] && calendarData.tasks[dateStr][index]) {
                calendarData.tasks[dateStr][index].completed = !calendarData.tasks[dateStr][index].completed;
                localStorage.setItem(calendarKey, JSON.stringify(calendarData));
                loadSchedule();
                renderCalendar();
            }
        }

        // 删除任务
        function deleteTask(dateStr, index) {
            if (!confirm('确定要删除这个计划吗？')) {
                return;
            }
            
            const calendarData = JSON.parse(localStorage.getItem(calendarKey) || '{}');
            if (calendarData.tasks && calendarData.tasks[dateStr]) {
                calendarData.tasks[dateStr].splice(index, 1);
                localStorage.setItem(calendarKey, JSON.stringify(calendarData));
                loadSchedule();
                renderCalendar();
            }
        }

        // 今日打卡
        function checkInToday() {
            const today = new Date();
            const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());
            
            const calendarData = JSON.parse(localStorage.getItem(calendarKey) || '{}');
            if (!calendarData.checkins) {
                calendarData.checkins = {};
            }
            
            if (calendarData.checkins[todayStr]) {
                alert('今天已经打卡过了！');
                return;
            }
            
            calendarData.checkins[todayStr] = {
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem(calendarKey, JSON.stringify(calendarData));
            
            updateCheckInStatus();
            renderCalendar();
            
            alert('打卡成功！🎉');
        }

        // 更新打卡状态
        function updateCheckInStatus() {
            const today = new Date();
            const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());
            
            const calendarData = JSON.parse(localStorage.getItem(calendarKey) || '{}');
            const isCheckedIn = calendarData.checkins && calendarData.checkins[todayStr];
            
            const checkinBtn = document.getElementById('checkin-btn');
            if (isCheckedIn) {
                checkinBtn.textContent = '✓ 已打卡';
                checkinBtn.classList.remove('btn-success');
                checkinBtn.classList.add('btn-secondary');
                checkinBtn.disabled = true;
            } else {
                checkinBtn.textContent = '📌 今日打卡';
                checkinBtn.classList.remove('btn-secondary');
                checkinBtn.classList.add('btn-success');
                checkinBtn.disabled = false;
            }
        }

        // 更新本月打卡统计
        function updateMonthCheckInCount() {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            const calendarData = JSON.parse(localStorage.getItem(calendarKey) || '{}');
            let count = 0;
            
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = formatDate(year, month, day);
                if (calendarData.checkins && calendarData.checkins[dateStr]) {
                    count++;
                }
            }
            
            document.getElementById('month-checkin-count').textContent = count;
        }

        // 更新今日做题统计
        function updateTodayStats() {
            const dateStr = formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            
            const history = JSON.parse(localStorage.getItem('practice-history') || '[]');
            
            // 筛选选中日期的记录
            const dayRecords = history.filter(h => h.date === dateStr);
            
            let totalCount = 0;
            let correctCount = 0;
            
            dayRecords.forEach(record => {
                totalCount += 1;
                if (record.isCorrect) {
                    correctCount += 1;
                }
            });
            
            const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
            
            document.getElementById('today-question-count').textContent = totalCount;
            document.getElementById('today-accuracy').textContent = accuracy + '%';
        }

        // 格式化日期
        function formatDate(year, month, day) {
            return year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
        }

        // ==================== 一键修复格式错误题目 ====================
        function autoFixInvalidQuestions() {
            const input = document.getElementById('question-input').value.trim();
            if (!input) {
                alert('请先输入题目内容！');
                return;
            }
            
            const questions = parseQuestions(input);
            const fixableQuestions = [];
            const unfixableQuestions = [];
            
            questions.forEach((q, index) => {
                if (!q._hasError) {
                    return;
                }
                
                let canFix = true;
                let fixes = [];
                
                // 修复1: 判断题缺少选项
                if (q.type === 'judge' && (!q.options || q.options.length === 0)) {
                    q.options = ['正确', '错误'];
                    fixes.push('补充判断题选项');
                    q._hasError = false;
                    q._errorMsg = [];
                }
                
                // 修复2: 判断题选项数量不为2
                if (q.type === 'judge' && q.options && q.options.length !== 2) {
                    q.options = ['正确', '错误'];
                    fixes.push('修正判断题选项数量');
                    q._hasError = false;
                    q._errorMsg = [];
                }
                
                // 修复3: 单选题答案包含逗号
                if (q.type === 'single' && q.answer && q.answer.includes(',')) {
                    q.answer = q.answer.split(',')[0].trim();
                    fixes.push('修正单选题答案格式');
                    q._hasError = false;
                    q._errorMsg = [];
                }
                
                // 修复4: 答案包含竖线分隔符
                if (q.answer && q.answer.includes('|')) {
                    q.answer = q.answer.replace(/\|/g, ',');
                    fixes.push('修正答案分隔符');
                }
                
                // 修复5: 答案包含中文逗号
                if (q.answer && q.answer.includes('，')) {
                    q.answer = q.answer.replace(/，/g, ',');
                    fixes.push('修正答案中文逗号');
                }
                
                // 修复6: 缺少题型自动检测
                if (!q.type) {
                    q.type = detectQuestionType(q);
                    q._autoDetected = true;
                    fixes.push('自动检测题型');
                    q._hasError = false;
                    q._errorMsg = [];
                }
                
                // 修复7: 题目为空
                if (!q.question || !q.question.trim()) {
                    canFix = false;
                }
                
                // 修复8: 答案为空
                if (!q.answer || !q.answer.trim()) {
                    canFix = false;
                }
                
                // 重新验证
                if (q.type === 'judge') {
                    if (!q.options || q.options.length !== 2) {
                        q.options = ['正确', '错误'];
                    }
                    const judgeKeywords = ['正确', '错误', '对', '错', '是', '否', '√', '×'];
                    if (!judgeKeywords.some(kw => q.answer && q.answer.includes(kw))) {
                        canFix = false;
                    }
                }
                
                if (q.type === 'single' && q.answer && q.answer.includes(',')) {
                    canFix = false;
                }
                
                if (canFix) {
                    fixableQuestions.push({ index: index + 1, fixes: fixes, question: q });
                } else {
                    unfixableQuestions.push({ index: index + 1, errors: q._errorMsg, question: q });
                }
            });
            
            let message = '';
            
            if (fixableQuestions.length > 0) {
                message += '成功修复 ' + fixableQuestions.length + ' 道题目！\n';
                fixableQuestions.forEach(f => {
                    message += '  - 第' + f.index + '题: ' + f.fixes.join('、') + '\n';
                });
            }
            
            if (unfixableQuestions.length > 0) {
                message += '\n无法修复 ' + unfixableQuestions.length + ' 道题目：\n';
                unfixableQuestions.forEach(f => {
                    message += '  - 第' + f.index + '题: ' + f.errors.join('、') + '\n';
                });
            }
            
            if (fixableQuestions.length === 0 && unfixableQuestions.length === 0) {
                message = '没有发现可修复的格式错误！';
            }
            
            alert(message);
            
            // 更新预览
            updateQuestionPreview();
        }
'''

# 在</script>前添加JavaScript
script_end = content.rfind('</script>')
content = content[:script_end] + js_functions + '\n' + content[script_end:]

# 6. 添加标签系统按钮（在题库管理下）
tag_system_btn = '''                            <button class="btn btn-info" onclick="showTagGraph()">🏷️ 标签图谱</button>'''

# 在题库管理按钮后添加标签按钮
content = content.replace(
    'onclick="showErrorBook()">❌ 错题本</button>',
    'onclick="showErrorBook()">❌ 错题本</button>\n' + tag_system_btn
)

# 7. 添加日历系统按钮
calendar_btn = '''                            <button class="btn btn-info" onclick="showCalendar()">📅 学习日历</button>'''

# 在标签按钮后添加日历按钮
content = content.replace(
    'onclick="showTagGraph()">🏷️ 标签图谱</button>',
    'onclick="showTagGraph()">🏷️ 标签图谱</button>\n' + calendar_btn
)

# 8. 在错误题目预览区域添加一键修复按钮
auto_fix_btn = '''                            <button class="btn btn-warning" onclick="autoFixInvalidQuestions()">🔧 一键修复错误题目</button>'''

# 在错误统计区域添加修复按钮
content = content.replace(
    'id="preview-stats"',
    'id="preview-stats"' + auto_fix_btn
)

# 9. 修复showPage函数以支持新页面
content = content.replace(
    "function showPage(pageId) {\n        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));\n        document.getElementById(pageId).classList.remove('hidden');\n    }",
    "function showPage(pageId) {\n        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));\n        const targetPage = document.getElementById(pageId);\n        if (targetPage) {\n            targetPage.classList.remove('hidden');\n        } else {\n            console.error('Page not found:', pageId);\n        }\n    }"
)

# 保存文件
with open(r'C:\Users\1\Desktop\题库\6.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('6.html created successfully!')
print('All features have been added:')
print('- Tag knowledge graph (with bank filtering and question viewing)')
print('- Calendar system (with check-in and task planning)')
print('- Auto-fix for format errors')
print('- Hover animation removed')
print('- Statistics update on date selection')