// 主页动态内容加载
document.addEventListener('DOMContentLoaded', function() {
    const latestArticlesContainer = document.getElementById('latest-articles');
    const latestSoftwareContainer = document.getElementById('latest-software');
    
    // --- Tooltip Manager Functions (与 software.js 相同，支持全局 Tooltip) ---
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
    
    // --- 1. 加载最新文章 (从 data/articles.json) ---
    async function loadLatestArticles() {
        // 相对路径：index.html 应该在 ./data/articles.json
        const ARTICLE_INDEX_URL = './data/articles.json';
        latestArticlesContainer.innerHTML = '<li class="loading"><i class="fas fa-spinner fa-spin"></i> 正在加载文章...</li>';

        try {
            const response = await fetch(ARTICLE_INDEX_URL);
            if (!response.ok) {
                throw new Error(`无法加载文章索引: ${response.statusText}`);
            }
            const data = await response.json();
            
            // **修复：显式按日期降序排序 (最新在前) - NEW: 使用 updated_date 排序**
            data.sort((a, b) => {
                // 使用 updated_date 进行排序，如果不存在则回退到 date
                const dateA = a.updated_date || a.date;
                const dateB = b.updated_date || b.date;
                
                // 假设日期格式 YYYY-MM-DD 允许字符串比较
                if (dateA < dateB) return 1;
                if (dateA > dateB) return -1;
                return 0;
            });
            
            // 获取前 3 篇
            const latestArticles = data.slice(0, 3); 

            if (latestArticles.length === 0) {
                latestArticlesContainer.innerHTML = '<li>目前没有可用的博客文章。</li>';
                return;
            }

            latestArticlesContainer.innerHTML = ''; // 清空加载状态
            latestArticles.forEach(article => {
                const li = document.createElement('li');
                // 标题从文件名中去除 .md
                const title = article.file.replace('.md', '');
                
                // NEW: 显示最新的日期 (updated_date)
                const displayDate = article.updated_date || article.date;
                
                // 链接到博客页面 (pages/blog.html)，并添加 title 属性用于悬浮提示
                li.innerHTML = `<a href="./pages/blog.html" title="${title}">${title}</a><span class="article-date">${displayDate}</span>`;
                latestArticlesContainer.appendChild(li);
            });

        } catch (error) {
            console.error('加载文章索引失败:', error);
            latestArticlesContainer.innerHTML = `<li class="error">文章加载失败: ${error.message}</li>`;
        }
    }
    
    // --- 2. 渲染最新软件 (从 data/software.json 动态加载) ---
    async function renderLatestSoftware() {
        // 修正路径：相对 index.html 应该在 ./data/software.json
        const SOFTWARE_DATA_URL = './data/software.json';
        latestSoftwareContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 正在加载软件...</div>';
        let softwareList = [];

        try {
            const response = await fetch(SOFTWARE_DATA_URL);
            if (!response.ok) {
                throw new Error(`无法加载软件数据: ${response.statusText}`);
            }
            softwareList = await response.json();
        } catch (error) {
            console.error('加载软件数据失败:', error);
            latestSoftwareContainer.innerHTML = `<div class="error">软件加载失败: ${error.message}</div>`;
            return;
        }

        // **修复：显式按日期降序排序 (最新在前)**
        softwareList.sort((a, b) => {
            // 假设日期格式 YYYY-MM-DD 允许字符串比较
            if (a.date < b.date) return 1;
            if (a.date > b.date) return -1;
            return 0;
        });

        // 获取前 3 个
        const latestSoftware = softwareList.slice(0, 3);
        latestSoftwareContainer.innerHTML = ''; // 清空加载状态

        if (latestSoftware.length === 0) {
            latestSoftwareContainer.innerHTML = '<div class="loading">没有可用的软件记录。</div>';
            return;
        }

        latestSoftware.forEach(software => {
            const card = document.createElement('div');
            card.className = 'software-card-home';
            
            // 使用 data 属性存储软件信息，用于全局 Tooltip
            card.setAttribute('data-software-info', JSON.stringify(software));

            // NEW: 调整结构，将图标和标题放在同一行
            card.innerHTML = `
                <div class="software-title-line-home">
                    <div class="software-icon-home">
                        <img src="${software.icon}" alt="${software.name}" onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMTIgMkwyIDEySDVWMjBIMTlaTTcgMTguNUEyLjUgMi41IDAgMCAwIDkuNSAyMSAyLjUgMi41IDAgMCAwIDEyIDI0YTIuNSAyLjUgMCAwIDAgMi41LTIuNUExIDUgMCAwIDAgMTkgMjFIMTJaTTExIDExLjVMNyA3LjVIMTJWMTUuNUgxNFY2SDExWiIgZmlsbD0iIzY2NjY2NiIvPjwvc3ZnPg=='">
                    </div>
                    <h4>${software.name}</h4>
                </div>
                <div class="software-info-body">
                    <p>${software.description}</p>
                    <a href="${software.website}" target="_blank" class="btn-sm"><i class="fas fa-download"></i> 下载</a>
                </div>
            `;
            
            latestSoftwareContainer.appendChild(card);
            
            // 添加悬浮事件监听器 (使用全局 Tooltip 函数)
            card.addEventListener('mouseenter', function() {
                const softwareData = JSON.parse(this.getAttribute('data-software-info'));
                createAndShowTooltip(this, softwareData);
            });
            
            card.addEventListener('mouseleave', hideTooltip);
        });
    }

    // 执行
    loadLatestArticles();
    renderLatestSoftware();
});