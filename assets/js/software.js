// Software Page Dynamic Content Logic

document.addEventListener('DOMContentLoaded', function() {
    const SOFTWARE_DATA_URL = '../data/software.json';
    const softwareGrid = document.getElementById('software-grid');
    const categoryFilter = document.getElementById('category-filter');
    let softwareData = [];

    // --- Tooltip Manager Functions (与 home.js 相同) ---
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
                <div class="tooltip-icon"><img src="${software.icon}" alt="${software.name}" onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMTIgMkwyIDEySDVWMjBIMTlaTTcgMTguNUEyLjUgMi41IDAgMCAwIDkuNSAyMSAyLjUgMi41IDAgMCAwIDEyIDI0YTIuNSAyLjUgMCAwIDAgMi41LTIuNUExIDUgMCAwIDAgMTkgMjFIMTJaTTExIDExLjVMNyA3LjVIMTJWMTUuNUgxNFY2SDExWiIgZmlsbD0iIzY2NjY2NiIvPjwvc3ZnPg=='"></div>
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


    // 创建单个软件卡片
    function createSoftwareCard(software) {
        const card = document.createElement('div');
        card.className = 'software-card';

        // 检查 icon 是否可用，提供备用图标
        const iconSrc = software.icon;
        const fallbackIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMTIgMkwyIDEySDVWMjBIMTlaTTcgMTguNUEyLjUgMi41IDAgMCAwIDkuNSAyMSAyLjUgMi41IDAgMCAwIDEyIDI0YTIuNSAyLjUgMCAwIDAgMi41LTIuNUExIDUgMCAwIDAgMTkgMjFIMTJaTTExIDExLjVMNyA3LjVIMTJWMTUuNUgxNFY2SDExWiIgZmlsbD0iIzY2NjY2NiIvPjwvc3ZnPg==';
        
        // 使用 onerror 属性处理图片加载失败
        const iconHtml = `<img src="${iconSrc}" alt="${software.name} Icon" onerror="this.onerror=null; this.src='${fallbackIcon}'">`;

        card.innerHTML = `
            <div class="software-icon">
                ${iconHtml}
            </div>
            <div class="software-info">
                <h3>${software.name}</h3>
                <!-- NEW: 添加收录日期信息 -->
                <span class="software-date-full">收录于: ${software.date}</span>
                <p>${software.description}</p>
                <div class="software-links">
                    <a href="${software.website}" target="_blank"><i class="fas fa-download"></i> 官网下载</a>
                </div>
            </div>
        `;

        // 添加悬浮事件监听器
        card.setAttribute('data-software-info', JSON.stringify(software));

        card.addEventListener('mouseenter', function() {
            const softwareData = JSON.parse(this.getAttribute('data-software-info'));
            createAndShowTooltip(this, softwareData);
        });
        
        card.addEventListener('mouseleave', hideTooltip);

        return card;
    }

    // 渲染软件列表
    function renderSoftware(filterCategory = 'All') {
        softwareGrid.innerHTML = ''; // 清空现有内容
        const filteredList = (filterCategory === 'All') 
            ? softwareData
            : softwareData.filter(software => software.category === filterCategory);

        if (filteredList.length === 0) {
            softwareGrid.innerHTML = '<p class="loading">此类别下暂无软件推荐。</p>';
            return;
        }
        
        // NEW: 默认按日期降序排序 (最新在前)
        filteredList.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA; // 降序
        });

        filteredList.forEach(software => {
            softwareGrid.appendChild(createSoftwareCard(software));
        });
    }

    // 渲染分类按钮
    function renderCategories() {
        const categories = ['All'];
        softwareData.forEach(software => {
            if (!categories.includes(software.category)) {
                categories.push(software.category);
            }
        });

        categoryFilter.innerHTML = ''; // 清空现有按钮

        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-btn';
            button.textContent = category;
            
            button.addEventListener('click', () => {
                // 移除所有按钮的 active 类
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                // 给当前点击的按钮添加 active 类
                button.classList.add('active');
                renderSoftware(category);
            });
            
            categoryFilter.appendChild(button);
        });
        
        // 默认激活第一个按钮
        if (categoryFilter.firstElementChild) {
            categoryFilter.firstElementChild.classList.add('active');
        }
    }

    // 初始化加载
    async function init() {
        softwareGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 正在加载软件列表...</div>';
        
        try {
            const response = await fetch(SOFTWARE_DATA_URL);
            if (!response.ok) {
                throw new Error(`无法加载软件数据: ${response.statusText}`);
            }
            softwareData = await response.json();
            
            renderCategories();
            renderSoftware('All'); // 默认渲染所有软件
            
        } catch (error) {
            console.error('加载软件数据失败:', error);
            softwareGrid.innerHTML = `<div class="error">软件列表加载失败: ${error.message}</div>`;
        }
    }

    init();
});