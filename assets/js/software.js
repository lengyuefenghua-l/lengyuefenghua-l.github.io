// 软件收集功能JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const softwareGrid = document.getElementById('software-grid');
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    // 存储从 JSON 加载的软件数据
    let softwareList = [];
    // 修正路径：相对 pages/software.html 应该在 ../data/software.json
    const SOFTWARE_DATA_URL = '../data/software.json';

    // --- Tooltip Manager Functions (与 home.js 相同，确保一致性) ---
    // 负责创建、更新和定位全局 Tooltip
    function createAndShowTooltip(card, software) {
        // 1. 获取现有 Tooltip 或创建一个新的全局 Tooltip
        let tooltip = document.getElementById('global-software-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'global-software-tooltip';
            tooltip.className = 'custom-tooltip';
            document.body.appendChild(tooltip);
        }
        
        // 2. 设置 Tooltip 内容
        const tooltipContent = software.details || software.description;
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <div class="tooltip-icon"><img src="${software.icon}" alt="${software.name}"></div>
                <div class="tooltip-title">${software.name}</div>
            </div>
            <div class="tooltip-body">${tooltipContent}</div>
        `;

        // 3. 计算 Tooltip 位置 (相对于卡片居中，并位于卡片上方)
        const rect = card.getBoundingClientRect();
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        
        // Tooltip 的左侧定位点 (卡片中心点的 X 坐标)
        const tooltipX = rect.left + rect.width / 2 + scrollX;
        // Tooltip 的顶部定位点 (卡片顶部的 Y 坐标)
        const tooltipY = rect.top + scrollY;

        // 应用定位 (CSS transform 负责将 Tooltip 向上和向左移动其自身宽度/高度的一半)
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${tooltipX}px`;
        tooltip.style.top = `${tooltipY}px`;

        // 4. 显示 Tooltip
        tooltip.classList.add('visible');
    }

    function hideTooltip() {
        const tooltip = document.getElementById('global-software-tooltip');
        if (tooltip) {
            tooltip.classList.remove('visible');
        }
    }
    // --- End Tooltip Manager Functions ---
    
    // 初始化页面
    function init() {
        loadSoftwareData().then(() => {
            renderSoftwareList();
            setupEventListeners();
        });
        
        // 添加一个全局事件监听器，用于在鼠标移出软件网格时隐藏 Tooltip
        softwareGrid.addEventListener('mouseleave', hideTooltip);
    }

    // 加载软件数据
    async function loadSoftwareData() {
        softwareGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 正在加载软件数据...</div>';
        try {
            const response = await fetch(SOFTWARE_DATA_URL);
            if (!response.ok) {
                throw new Error(`无法加载软件数据: ${response.statusText}`);
            }
            softwareList = await response.json();
        } catch (error) {
            console.error('加载软件数据失败:', error);
            softwareGrid.innerHTML = `<div class="error">软件加载失败: ${error.message}</div>`;
        }
    }
    
    // 渲染软件列表
    function renderSoftwareList(category = 'all') {
        softwareGrid.innerHTML = '';
        
        // 如果数据为空，显示提示
        if (softwareList.length === 0) {
             softwareGrid.innerHTML = '<div class="loading">目前没有可用的软件记录。</div>';
             return;
        }

        const filteredSoftware = category === 'all' 
            ? softwareList 
            // 筛选时直接使用 category 字段进行比较（支持中文）
            : softwareList.filter(software => software.category === category);
        
        if (filteredSoftware.length === 0) {
            softwareGrid.innerHTML = '<div class="loading">没有找到匹配的软件</div>';
            return;
        }
        
        filteredSoftware.forEach(software => {
            const card = document.createElement('div');
            card.className = 'software-card';

            // 构造 Tooltip 内容
            const tooltipContent = software.details || software.description;

            card.innerHTML = `
                <div class="software-icon">
                    <img src="${software.icon}" alt="${software.name}" onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMTIgMkwyIDEySDVWMjBIMTlaTTcgMTguNUEyLjUgMi41IDAgMCAwIDkuNSAyMSAyLjUgMi41IDAgMCAwIDEyIDI0YTIuNSAyLjUgMCAwIDAgMi41LTIuNUExIDUgMCAwIDAgMTkgMjFIMTJaTTExIDExLjVMNyA3LjVIMTJWMTUuNUgxNFY2SDExWiIgZmlsbD0iIzY2NjY2NiIvPjwvc3ZnPg=='">
                </div>
                <div class="software-info">
                    <h3>${software.name}</h3>
                    <p>${software.description}</p>
                    <div class="software-links">
                        <a href="${software.website}" target="_blank"><i class="fas fa-download"></i> 官网下载</a>
                    </div>
                </div>
            `;
            
            softwareGrid.appendChild(card);
            
            // NEW: 添加悬浮事件监听器，使用 data 属性存储信息
            card.setAttribute('data-software-info', JSON.stringify(software));

            card.addEventListener('mouseenter', function() {
                const softwareData = JSON.parse(this.getAttribute('data-software-info'));
                createAndShowTooltip(this, softwareData);
            });
            
            card.addEventListener('mouseleave', hideTooltip);
        });
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 分类筛选
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                
                // 更新活动状态
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // 渲染筛选后的列表
                renderSoftwareList(category);
            });
        });
    }
    
    // 初始化
    init();
});