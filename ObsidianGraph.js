// Obsidian风格知识图谱 - 插入到15.html中
// 在15.html的</script>标签前插入这段代码，并删除原有的知识图谱相关函数

// ==================== 标签图谱功能 - Obsidian风格 ====================
function showTagGraph() {
    showPage('tag-graph');
    initTagGraph();
}

function filterTagGraph() {
    const filter = document.getElementById('tag-graph-bank-filter').value;
    currentGraphBankFilter = filter;
    initTagGraph();
}

function resetGraphView() {
    graphScale = 1;
    graphOffsetX = 0;
    graphOffsetY = 0;
    initTagGraph();
}

// Obsidian风格颜色配置 - 更淡更灰
const graphColors = {
    background: '#f8f9fc',
    level1: {
        fill: '#d8d0e8',
        stroke: '#b8b0d0',
        text: '#ffffff'
    },
    level2: {
        fill: '#c0d8f0',
        stroke: '#a0c0e0',
        text: '#ffffff'
    },
    level3: {
        fill: '#b8e0d0',
        stroke: '#98d0b8',
        text: '#ffffff'
    },
    edge: '#94a3b8',
    edgeHover: '#c4b5fd',
    nodeHover: '#ffffff'
};

// 图形状态
let graphScale = 1;
let graphOffsetX = 0;
let graphOffsetY = 0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

function initTagGraph() {
    // 设置弹窗点击处理器
    setupModalClickHandler();
    
    const canvas = document.getElementById('graph-canvas');
    const container = document.getElementById('tag-graph-canvas');
    
    // 高分辨率渲染
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    const banks = storage.getBanks();
    
    // 填充题库筛选器
    const filterSelect = document.getElementById('tag-graph-bank-filter');
    const currentValue = filterSelect.value;
    filterSelect.innerHTML = '<option value="">全部题库</option>';
    banks.forEach(bank => {
        const option = document.createElement('option');
        option.value = bank.name;
        option.textContent = bank.name;
        filterSelect.appendChild(option);
    });
    filterSelect.value = currentValue;
    
    const nodes = [];
    const edges = [];
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const allTags = new Map();
    
    // 调试：统计总题数
    let totalQuestions = 0;
    let questionsWithTags = 0;
    
    // 先创建"知识点"根节点
    allTags.set('知识点', {
        name: '知识点',
        levels: ['知识点'],
        count: 0,
        questions: [],
        bankName: ''
    });
    
    banks.forEach((bank, bankIndex) => {
        if (currentGraphBankFilter && currentGraphBankFilter !== '' && bank.name !== currentGraphBankFilter) {
            return;
        }
        
        if (!bank.questions || !Array.isArray(bank.questions)) {
            return;
        }
        
        console.log(`题库: ${bank.name}, 题目数: ${bank.questions.length}`);
        
        bank.questions.forEach((q, qIndex) => {
            totalQuestions++;
            
            // 如果题目没有ID，使用题目内容生成唯一ID
            if (!q.id) {
                q.id = q.question.substring(0, 50) + '_' + q.answer;
            }
            
            console.log(`题目 ${qIndex + 1} ID: ${q.id}`);
            
            // 将所有题目添加到"知识点"根节点
            const rootTag = allTags.get('知识点');
            if (!rootTag.questions.some(qq => qq.id === q.id)) {
                rootTag.count++;
                rootTag.questions.push(q);
            }
            
            if (q.tags && Array.isArray(q.tags) && q.tags.length > 0) {
                questionsWithTags++;
                const tagPaths = q.tags.map(t => t.fullPath).join(', ');
                console.log(`题目 ${qIndex + 1}: ${tagPaths}`);
                
                q.tags.forEach((tag, tagIndex) => {
                    if (!tag || !tag.fullPath) {
                        return;
                    }
                    
                    const fullPath = tag.fullPath;
                    const levels = fullPath.split('/');
                    
                    console.log(`  添加到标签: ${fullPath}, levels: ${levels.join(' -> ')}`);
                    
                    // 添加到当前标签
                    if (!allTags.has(fullPath)) {
                        allTags.set(fullPath, {
                            name: fullPath,
                            levels: levels,
                            count: 0,
                            questions: [],
                            bankName: bank.name
                        });
                    }
                    
                    // 检查是否已经添加过这道题（避免重复）
                    const currentTag = allTags.get(fullPath);
                    console.log(`    检查题目 ${q.id} 是否已在 ${fullPath} 中`);
                    console.log(`    当前标签已有题目: ${currentTag.questions.map(qq => qq.id).join(', ')}`);
                    if (!currentTag.questions.some(qq => qq.id === q.id)) {
                        currentTag.count++;
                        currentTag.questions.push(q);
                        console.log(`    添加成功！当前标签题目数: ${currentTag.count}`);
                    } else {
                        console.log(`    题目已存在，跳过`);
                    }
                    
                    // 同时添加到所有父标签（这样一级标签会包含所有二级和三级标签的题目）
                    for (let i = 0; i < levels.length - 1; i++) {
                        const parentPath = levels.slice(0, i + 1).join('/');
                        console.log(`  添加到父标签: ${parentPath}`);
                        if (!allTags.has(parentPath)) {
                            allTags.set(parentPath, {
                                name: parentPath,
                                levels: levels.slice(0, i + 1),
                                count: 0,
                                questions: [],
                                bankName: bank.name
                            });
                        }
                        // 检查是否已经添加过这道题（避免重复）
                        const parentTag = allTags.get(parentPath);
                        if (!parentTag.questions.some(qq => qq.id === q.id)) {
                            parentTag.count++;
                            parentTag.questions.push(q);
                            console.log(`    父标签题目数: ${parentTag.count}`);
                        }
                    }
                });
            } else {
                console.log(`题目 ${qIndex + 1}: 无标签`);
            }
        });
    });
    
    console.log(`=== 统计信息 ===`);
    console.log(`总题数: ${totalQuestions}`);
    console.log(`有标签的题数: ${questionsWithTags}`);
    console.log(`无标签的题数: ${totalQuestions - questionsWithTags}`);
    console.log(`=== 统计信息结束 ===`);
    
    // 调试：打印allTags中的数据
    console.log('=== 标签统计调试信息 ===');
    allTags.forEach((tag, fullPath) => {
        console.log(`标签: ${fullPath}, 题目数: ${tag.count}`);
    });
    console.log('=== 标签统计调试信息结束 ===');
    
    if (allTags.size === 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('暂无标签数据', centerX, centerY);
        ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('请先为题目添加标签', centerX, centerY + 30);
        return;
    }
    
    const level1Nodes = [];
    const level2Nodes = [];
    const level3Nodes = [];
    
    // 收集所有父节点路径
    const allParentPaths = new Set();
    
    allTags.forEach((tag, fullPath) => {
        if (!tag.levels || !Array.isArray(tag.levels)) {
            return;
        }
        
        for (let i = 0; i < tag.levels.length - 1; i++) {
            const parentPath = tag.levels.slice(0, i + 1).join('/');
            allParentPaths.add(parentPath);
        }
    });
    
    // 创建所有需要的节点
    allTags.forEach((tag, fullPath) => {
        if (!tag.levels || !Array.isArray(tag.levels)) {
            return;
        }
        
        const level = tag.levels.length;
        
        const node = {
            id: fullPath,
            name: tag.levels[level - 1],
            fullPath: fullPath,
            level: level,
            count: tag.count,
            questions: [...tag.questions],
            bankName: tag.bankName,
            x: 0,
            y: 0,
            radius: level === 1 ? 40 : level === 2 ? 28 : 25
        };
        
        if (level === 1) {
            level1Nodes.push(node);
        } else if (level === 2) {
            level2Nodes.push(node);
        } else {
            level3Nodes.push(node);
        }
        
        nodes.push(node);
    });
    
    // 创建缺失的父节点 - 直接从allTags中获取
    allParentPaths.forEach(parentPath => {
        const existingNode = nodes.find(n => n.fullPath === parentPath);
        if (!existingNode) {
            const levels = parentPath.split('/');
            const parentTag = allTags.get(parentPath);
            const parentNode = {
                id: parentPath,
                name: levels[levels.length - 1],
                fullPath: parentPath,
                level: levels.length,
                count: parentTag ? parentTag.count : 0,
                questions: parentTag ? [...parentTag.questions] : [],
                bankName: parentTag ? parentTag.bankName : '',
                x: 0,
                y: 0,
                radius: levels.length === 1 ? 40 : 35
            };
            nodes.push(parentNode);
            if (levels.length === 1) {
                level1Nodes.push(parentNode);
            } else if (levels.length === 2) {
                level2Nodes.push(parentNode);
            }
        }
    });
    
    // 计算节点位置 - 使用扇形分区确保连线不交叉
    const maxRadius = Math.min(rect.width, rect.height) * 0.45;
    
    // Level 1节点 - 放在中心
    level1Nodes.forEach((node, i) => {
        if (level1Nodes.length === 1) {
            node.x = centerX;
            node.y = centerY;
        } else {
            const angle = (2 * Math.PI * i) / level1Nodes.length - Math.PI / 2; // 从上方开始
            const radius = Math.min(maxRadius * 0.3, 80);
            node.x = centerX + radius * Math.cos(angle);
            node.y = centerY + radius * Math.sin(angle);
        }
        node.targetX = node.x;
        node.targetY = node.y;
        node.currentX = centerX;
        node.currentY = centerY;
    });
    
    // 为每个一级标签分配扇形区域
    const sectors = level1Nodes.map((node, i) => {
        if (level1Nodes.length === 1) {
            return { node, startAngle: 0, endAngle: 2 * Math.PI };
        }
        const sectorAngle = (2 * Math.PI) / level1Nodes.length;
        const startAngle = i * sectorAngle - Math.PI / 2;
        const endAngle = (i + 1) * sectorAngle - Math.PI / 2;
        return { node, startAngle, endAngle };
    });
    
    // Level 2节点 - 在父节点的扇形区域内
    level2Nodes.forEach((node) => {
        const parentPath = node.fullPath.split('/').slice(0, -1).join('/');
        const parent = nodes.find(n => n.fullPath === parentPath);
        if (parent) {
            // 找到父节点所属的扇形
            const sector = sectors.find(s => s.node.fullPath === parentPath);
            if (!sector) return;
            
            const siblings = level2Nodes.filter(n => 
                n.fullPath.split('/').slice(0, -1).join('/') === parentPath
            );
            const siblingIndex = siblings.indexOf(node);
            
            // 在扇形区域内均匀分布
            const sectorAngle = sector.endAngle - sector.startAngle;
            const angleStep = sectorAngle / (siblings.length + 1);
            const angle = sector.startAngle + angleStep * (siblingIndex + 1);
            
            const radius = Math.max(120, Math.min(160, maxRadius * 0.5));
            
            node.x = centerX + radius * Math.cos(angle);
            node.y = centerY + radius * Math.sin(angle);
            node.targetX = node.x;
            node.targetY = node.y;
            node.currentX = centerX;
            node.currentY = centerY;
            node.angleFromCenter = angle;
            edges.push({ from: parent, to: node });
        }
    });
    
    // Level 3节点 - 严格限制在祖父节点的扇形区域内
    level3Nodes.forEach((node) => {
        const parentPath = node.fullPath.split('/').slice(0, -1).join('/');
        const parent = nodes.find(n => n.fullPath === parentPath);
        if (parent) {
            // 找到祖父节点所属的扇形
            const grandParentPath = parent.fullPath.split('/').slice(0, -1).join('/');
            const sector = sectors.find(s => s.node.fullPath === grandParentPath);
            if (!sector) return;
            
            const siblings = level3Nodes.filter(n => 
                n.fullPath.split('/').slice(0, -1).join('/') === parentPath
            );
            const siblingIndex = siblings.indexOf(node);
            
            // 计算父节点在扇形区域内的相对位置
            const sectorAngle = sector.endAngle - sector.startAngle;
            const parentRelativeAngle = parent.angleFromCenter - sector.startAngle;
            
            // 在父节点角度附近小范围内分布，确保不超出扇形区域
            const maxOffsetAngle = Math.min(Math.PI / 12, sectorAngle / 4); // 15度或扇形的1/4
            const offsetAngle = (siblingIndex - (siblings.length - 1) / 2) * (maxOffsetAngle * 2 / Math.max(1, siblings.length - 1));
            let angle = parent.angleFromCenter + offsetAngle;
            
            // 确保角度在扇形区域内
            if (angle < sector.startAngle + 0.05) angle = sector.startAngle + 0.05;
            if (angle > sector.endAngle - 0.05) angle = sector.endAngle - 0.05;
            
            const radius = Math.max(200, Math.min(250, maxRadius * 0.7));
            
            node.x = centerX + radius * Math.cos(angle);
            node.y = centerY + radius * Math.sin(angle);
            node.targetX = node.x;
            node.targetY = node.y;
            node.currentX = centerX;
            node.currentY = centerY;
            edges.push({ from: parent, to: node });
        }
    });
    
    graphNodes = nodes;
    graphEdges = edges;
    
    // 动画和渲染 - 增加动画帧数使动画更连贯，添加物理碰撞检测
    let animationProgress = 0;
    const animationDuration = 120;
    let hoveredNode = null;
    
    // 物理碰撞检测参数 - 减少迭代次数使动画更平滑
    const collisionIterations = 10; // 碰撞检测迭代次数（从50减少到10）
    const repulsionStrength = 0.3; // 斥力强度（从0.5减少到0.3）
    const damping = 0.8; // 阻尼系数，使运动更平滑
    
    function resolveCollisions() {
        for (let iter = 0; iter < collisionIterations; iter++) {
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const nodeA = nodes[i];
                    const nodeB = nodes[j];
                    
                    const dx = nodeB.currentX - nodeA.currentX;
                    const dy = nodeB.currentY - nodeA.currentY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = nodeA.radius + nodeB.radius + 15; // 最小间距
                    
                    if (distance < minDistance && distance > 0) {
                        const overlap = minDistance - distance;
                        const nx = dx / distance;
                        const ny = dy / distance;
                        
                        const force = overlap * repulsionStrength * damping;
                        
                        nodeA.currentX -= nx * force;
                        nodeA.currentY -= ny * force;
                        nodeB.currentX += nx * force;
                        nodeB.currentY += ny * force;
                    }
                }
            }
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, rect.width, rect.height);
        
        // 应用缩放和平移
        ctx.save();
        ctx.translate(graphOffsetX, graphOffsetY);
        ctx.scale(graphScale, graphScale);
        
        // 背景渐变 - 更浅的色调
        const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(rect.width, rect.height));
        bgGradient.addColorStop(0, '#fafbfd');
        bgGradient.addColorStop(1, '#f8f9fc');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(-rect.width, -rect.height, rect.width * 3, rect.height * 3);
        
        // 更新动画进度
        if (animationProgress < animationDuration) {
            animationProgress++;
            const progress = animationProgress / animationDuration;
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            
            nodes.forEach(node => {
                node.currentX = centerX + (node.targetX - centerX) * easeProgress;
                node.currentY = centerY + (node.targetY - centerY) * easeProgress;
            });
            
            // 在动画过程中应用碰撞检测
            if (animationProgress > 30) {
                resolveCollisions();
            }
        } else {
            // 动画完成后持续应用碰撞检测
            resolveCollisions();
        }
        
// 绘制边 - 增加透明度和宽度使连线更明显
        edges.forEach(edge => {
            ctx.beginPath();
            ctx.moveTo(edge.from.currentX, edge.from.currentY);
            ctx.lineTo(edge.to.currentX, edge.to.currentY);
            ctx.strokeStyle = graphColors.edge;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.7;
            ctx.stroke();
            ctx.globalAlpha = 1;
        });
        
        // 绘制节点
        nodes.forEach(node => {
            const isHovered = hoveredNode === node;
            const radius = node.radius * (isHovered ? 1.15 : 1);
            
            if (!isFinite(node.currentX) || !isFinite(node.currentY)) {
                return;
            }
            
            // 节点阴影
            ctx.shadowColor = 'rgba(0,0,0,0.1)';
            ctx.shadowBlur = isHovered ? 15 : 8;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 2;
            
            // 节点背景
            ctx.beginPath();
            ctx.arc(node.currentX, node.currentY, radius, 0, 2 * Math.PI);
            
            let fillColor;
            if (node.level === 1) {
                fillColor = graphColors.level1.fill;
            } else if (node.level === 2) {
                fillColor = graphColors.level2.fill;
            } else {
                fillColor = graphColors.level3.fill;
            }
            
            ctx.fillStyle = fillColor;
            ctx.fill();
            
            // 节点边框
            ctx.shadowColor = 'transparent';
            ctx.strokeStyle = isHovered ? graphColors.nodeHover : (node.level === 1 ? graphColors.level1.stroke : node.level === 2 ? graphColors.level2.stroke : graphColors.level3.stroke);
            ctx.lineWidth = isHovered ? 3 : 2;
            ctx.stroke();
            
            // 节点文字 - 调整大小以适应更大的节点
            // 所有标签都用黑色字体，字体更细
            ctx.fillStyle = '#2c3e50';
            const fontSize = node.level === 1 ? 14 : node.level === 2 ? 12 : 11;
            ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            let displayName = node.name;
            if (displayName.length > 5) {
                displayName = displayName.substring(0, 4) + '..';
            }
            ctx.fillText(displayName, node.currentX, node.currentY);
            
            // 题目数量 - 使用黑色字体，字体更细
            if (node.count > 0) {
                ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
                ctx.fillStyle = '#2c3e50';
                ctx.fillText(node.count, node.currentX, node.currentY + radius - 10);
            }
        });
        
        ctx.restore();
        
        if (animationProgress < animationDuration) {
            requestAnimationFrame(animate);
        } else {
            // 动画完成后继续渲染以维持碰撞检测
            requestAnimationFrame(animate);
        }
    }
    
    animate();
    
    // 鼠标移动事件 - 悬停效果
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - graphOffsetX) / graphScale;
        const y = (e.clientY - rect.top - graphOffsetY) / graphScale;
        
        // 拖动功能
        if (isDragging) {
            graphOffsetX = e.clientX - rect.left - lastMouseX;
            graphOffsetY = e.clientY - rect.top - lastMouseY;
        }
        
        // 悬停检测
        let foundHovered = null;
        nodes.forEach(node => {
            const radius = node.radius;
            const distance = Math.sqrt((x - node.currentX) ** 2 + (y - node.currentY) ** 2);
            
            if (distance <= radius) {
                foundHovered = node;
            }
        });
        
        if (foundHovered !== hoveredNode) {
            hoveredNode = foundHovered;
            canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
        }
    });
    
    // 鼠标按下事件 - 开始拖动
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - graphOffsetX) / graphScale;
        const y = (e.clientY - rect.top - graphOffsetY) / graphScale;
        
        // 检查是否点击了节点
        let clickedNode = null;
        nodes.forEach(node => {
            const radius = node.radius;
            const distance = Math.sqrt((x - node.currentX) ** 2 + (y - node.currentY) ** 2);
            if (distance <= radius) {
                clickedNode = node;
            }
        });
        
        if (!clickedNode) {
            isDragging = true;
            lastMouseX = e.clientX - rect.left - graphOffsetX;
            lastMouseY = e.clientY - rect.top - graphOffsetY;
            canvas.style.cursor = 'grabbing';
        }
    });
    
    // 鼠标松开事件 - 结束拖动
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        canvas.style.cursor = 'default';
    });
    
    // 鼠标离开事件 - 结束拖动
    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
        canvas.style.cursor = 'default';
    });
    
    // 滚轮事件 - 缩放
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const zoomIntensity = 0.1;
        const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
        const newScale = Math.max(0.5, Math.min(3, graphScale + delta));
        
        // 以鼠标位置为中心缩放
        const scaleChange = newScale / graphScale;
        graphOffsetX = mouseX - (mouseX - graphOffsetX) * scaleChange;
        graphOffsetY = mouseY - (mouseY - graphOffsetY) * scaleChange;
        graphScale = newScale;
        
        // 持续渲染以维持碰撞检测
        animate();
    });
    
    // 点击事件 - 显示题目详情
    canvas.addEventListener('click', (e) => {
        if (isDragging) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - graphOffsetX) / graphScale;
        const y = (e.clientY - rect.top - graphOffsetY) / graphScale;
        
        nodes.forEach(node => {
            const radius = node.radius;
            const distance = Math.sqrt((x - node.currentX) ** 2 + (y - node.currentY) ** 2);
            
            if (distance <= radius) {
                showQuestionsByTag(node);
                e.stopPropagation();
            }
        });
    });
}

function showQuestionsByTag(node) {
    // 先删除已存在的modal
    const existingModal = document.getElementById('tag-questions-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const questions = node.questions;
    
    if (questions.length === 0) {
        // 使用自定义弹窗替代alert
        let modalHtml = '<div id="tag-empty-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2600; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(4px);">';
        modalHtml += '<div style="background: white; width: 400px; padding: 30px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center;">';
        modalHtml += '<div style="font-size: 48px; margin-bottom: 16px;">📭</div>';
        modalHtml += '<h3 style="margin: 0 0 12px 0; color: #2c3e50; font-size: 18px;">该标签下没有题目</h3>';
        modalHtml += '<p style="margin: 0 0 24px 0; color: #6c757d; font-size: 14px;">标签：' + node.fullPath + '</p>';
        modalHtml += '<button onclick="window.closeTagEmptyModal();" id="tag-empty-close-btn" style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); border: none; color: white; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">确定</button>';
        modalHtml += '</div>';
        modalHtml += '</div>';
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        return;
    }
    
    const histories = storage.getHistory();
    let totalAttempts = 0;
    let correctAttempts = 0;
    
    questions.forEach(q => {
        const questionHistories = histories.filter(h => h.questionId === q.id);
        totalAttempts += questionHistories.length;
        correctAttempts += questionHistories.filter(h => h.isCorrect).length;
    });
    
    const accuracy = totalAttempts > 0 ? ((correctAttempts / totalAttempts) * 100).toFixed(1) : 0;
    
    // 精致的弹窗设计
    let modalHtml = '<div id="tag-questions-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 2600; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(4px);">';
    modalHtml += '<div style="background: white; width: 85%; max-width: 1000px; max-height: 85vh; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); display: flex; flex-direction: column; overflow: hidden;">';
    
    // 头部 - 使用蓝色主题
    modalHtml += '<div style="padding: 24px 28px; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; display: flex; justify-content: space-between; align-items: center;">';
    modalHtml += '<div>';
    modalHtml += '<h3 style="margin: 0; font-size: 20px; font-weight: 600;">🏷️ ' + node.fullPath + '</h3>';
    modalHtml += '<p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">题库：' + node.bankName + ' | 共 ' + questions.length + ' 道题</p>';
    modalHtml += '</div>';
    modalHtml += '<button onclick="window.closeTagQuestionsModal();" style="position: relative; z-index: 9999; background: rgba(255,255,255,0.2); border: none; color: white; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s; pointer-events: auto !important;" onmouseover="this.style.background=\'rgba(255,255,255,0.3)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.2)\'">✕ 关闭</button>';
    modalHtml += '</div>';
    
    // 统计信息
    modalHtml += '<div style="padding: 20px 28px; background: #f8f9fa; border-bottom: 1px solid #e9ecef; display: flex; gap: 24px;">';
    modalHtml += '<div style="flex: 1; text-align: center; padding: 16px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">';
    modalHtml += '<div style="font-size: 32px; font-weight: 700; color: #3498db;">' + questions.length + '</div>';
    modalHtml += '<div style="font-size: 13px; color: #6c757d; margin-top: 4px;">题目总数</div>';
    modalHtml += '</div>';
    modalHtml += '<div style="flex: 1; text-align: center; padding: 16px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">';
    modalHtml += '<div style="font-size: 32px; font-weight: 700; color: #28a745;">' + accuracy + '%</div>';
    modalHtml += '<div style="font-size: 13px; color: #6c757d; margin-top: 4px;">正确率</div>';
    modalHtml += '</div>';
    modalHtml += '<div style="flex: 1; text-align: center; padding: 16px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">';
    modalHtml += '<div style="font-size: 32px; font-weight: 700; color: #ffc107;">' + totalAttempts + '</div>';
    modalHtml += '<div style="font-size: 13px; color: #6c757d; margin-top: 4px;">刷题次数</div>';
    modalHtml += '</div>';
    modalHtml += '</div>';
    
    // 题目列表
    modalHtml += '<div style="flex: 1; overflow-y: auto; padding: 24px 28px; background: #fafbfc;">';
    
    questions.forEach((q, index) => {
        modalHtml += '<div onclick="showQuestionDetailModal(' + JSON.stringify(q).replace(/"/g, '&quot;') + ', true);" style="padding: 18px; margin-bottom: 12px; background: white; border-radius: 12px; border-left: 4px solid #3498db; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 6px rgba(0,0,0,0.04);" onmouseover="this.style.background=\'#f8fafc\'; this.style.boxShadow=\'0 4px 12px rgba(0,0,0,0.08)\';" onmouseout="this.style.background=\'white\'; this.style.boxShadow=\'0 2px 6px rgba(0,0,0,0.04)\';">';
        modalHtml += '<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">';
        modalHtml += '<span style="padding: 6px 12px; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; border-radius: 6px; font-size: 12px; font-weight: 600;">' + getTypeText(q.type) + '</span>';
        modalHtml += '<strong style="color: #2c3e50; font-size: 15px;">题目 ' + (index + 1) + '</strong>';
        modalHtml += '</div>';
        
        const previewText = q.question.split(String.fromCharCode(10))[0];
        const displayText = previewText.length > 100 ? previewText.substring(0, 100) + '...' : previewText;
        modalHtml += '<div style="color: #475569; margin-bottom: 10px; font-size: 14px; line-height: 1.5;">' + displayText + '</div>';
        modalHtml += '<div style="color: #28a745; font-size: 13px; font-weight: 500;">答案：' + q.answer + '</div>';
        modalHtml += '</div>';
    });
    
    modalHtml += '</div>';
    modalHtml += '</div>';
    modalHtml += '</div>';
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

window.closeTagQuestionsModal = function() {
    const modal = document.getElementById('tag-questions-modal');
    if (modal) {
        modal.remove();
    }
    
    // 确保关闭空modal
    const emptyModal = document.getElementById('tag-empty-modal');
    if (emptyModal) {
        emptyModal.remove();
    }
};

window.closeTagEmptyModal = function() {
    const modal = document.getElementById('tag-empty-modal');
    if (modal) {
        modal.remove();
    }
    
    // 同时关闭题目详情modal
    const detailModal = document.getElementById('question-detail-modal');
    if (detailModal) {
        detailModal.style.display = 'none';
    }
};

// 弹窗关闭处理 - 完全重写
function setupModalClickHandler() {
    // 移除所有已存在的监听器
    const oldHandler = window._modalClickHandler;
    if (oldHandler) {
        document.removeEventListener('click', oldHandler, true);
        window._modalClickHandler = null;
    }
}

// 导出知识图谱为图片
function exportTagGraphImage() {
    const canvas = document.getElementById('graph-canvas');
    if (!canvas) {
        alert('找不到画布！');
        return;
    }

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext('2d');

    // 填充背景 - 更浅的色调
    ctx.fillStyle = '#f8f9fc';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // 绘制所有内容
    ctx.drawImage(canvas, 0, 0);

    // 添加标题
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('标签知识图谱', exportCanvas.width / 2, 40);

    // 添加日期
    ctx.fillStyle = '#64748b';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(new Date().toLocaleDateString('zh-CN'), exportCanvas.width / 2, exportCanvas.height - 30);

    setTimeout(() => {
        const dataURL = exportCanvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = '知识图谱_' + new Date().toLocaleDateString().replace(/\//g, '-') + '.png';
        link.href = dataURL;
        link.click();
        
        showSuccess('图片导出成功！');
    }, 100);
}
