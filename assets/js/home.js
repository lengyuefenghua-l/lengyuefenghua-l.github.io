// 主页动态内容加载
document.addEventListener('DOMContentLoaded', function() {
    const latestArticlesContainer = document.getElementById('latest-articles');
    const latestSoftwareContainer = document.getElementById('latest-software');
    
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
            
            // 假设文章索引已经按日期排序（最新在前），获取前 3 篇
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
                // 链接到博客页面 (pages/blog.html)，并添加 title 属性用于悬浮提示
                li.innerHTML = `<a href="./pages/blog.html" title="${title}">${title}</a><span class="article-date">${article.date}</span>`;
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

        // 假设软件列表已经按某种顺序排序，获取前 3 个
        const latestSoftware = softwareList.slice(0, 3);
        latestSoftwareContainer.innerHTML = ''; // 清空加载状态

        if (latestSoftware.length === 0) {
            latestSoftwareContainer.innerHTML = '<div class="loading">没有可用的软件记录。</div>';
            return;
        }

        latestSoftware.forEach(software => {
            const card = document.createElement('div');
            card.className = 'software-card-home';
            
            // 构造 Tooltip 内容
            const tooltipContent = software.details || software.description;

            card.innerHTML = `
                <div class="software-icon">
                    <img src="${software.icon}" alt="${software.name}" onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMTIgMkwyIDEySDVWMjBIMTlaTTcgMTguNUEyLjUgMi41IDAgMCAwIDkuNSAyMSAyLjUgMi41IDAgMCAwIDEyIDI0YTIuNSAyLjUgMCAwIDAgMi41LTIuNUExIDUgMCAwIDAgMTkgMjFIMTJaTTExIDExLjVMNyA3LjVIMTJWMTUuNUgxNFY2SDExWiIgZmlsbD0iIzY2NjY2NiIvPjwvc3ZnPg=='">
                </div>
                <div class="software-info">
                    <h4>${software.name}</h4>
                    <p>${software.description}</p>
                    <a href="${software.website}" target="_blank" class="btn-sm"><i class="fas fa-download"></i> 下载</a>
                </div>
                <!-- NEW: 自定义 Tooltip 结构 -->
                <div class="custom-tooltip">
                    <div class="tooltip-header">
                        <div class="tooltip-icon"><img src="${software.icon}" alt="${software.name}"></div>
                        <div class="tooltip-title">${software.name}</div>
                    </div>
                    <div class="tooltip-body">${tooltipContent}</div>
                </div>
            `;
            
            latestSoftwareContainer.appendChild(card);
            
            // NEW: 添加悬浮事件监听器
            const tooltip = card.querySelector('.custom-tooltip');
            card.addEventListener('mouseenter', () => {
                tooltip.classList.add('visible');
            });
            
            card.addEventListener('mouseleave', () => {
                tooltip.classList.remove('visible');
            });
        });
    }

    // 执行
    loadLatestArticles();
    renderLatestSoftware();
});