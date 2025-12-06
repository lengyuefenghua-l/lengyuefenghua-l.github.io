// 主页动态内容加载
document.addEventListener('DOMContentLoaded', function() {
    const latestArticlesContainer = document.getElementById('latest-articles');
    const latestSoftwareContainer = document.getElementById('latest-software');
    
    // --- 1. 软件数据 (从 software.js 复制所有数据，并取前 3 个) ---
    // NOTE: This list is likely outdated if data/software.json is updated. 
    // It's better to fetch the data dynamically if it changes, but keeping it simple for home.js for now.
    const softwareList = [
        {
            id: 1,
            name: '开发工具1',
            description: '轻量级代码编辑器。',
            icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMTggN2gtMTRjLTEuMSAwLTIgMC45LTIgMnYxMGMwIDEuMSAwLjkgMiAyIDJoMTRjMS4xIDAgMi0wLjkgMi0yVjlDNDAgNy45IDM5LjEgNyAxOCA3eiIgZmlsbD0iIzMzNzFDRiIvPjxwYXRoIGQ9Ik0xMCAxM2g0djJoLTR2LTJ6bTAtNGg0djJoLTR2LTJ6TTYgMTNoMnYyaC0ydi0yek02IDloMnYyaC0ydi0yek0xNCAxN2gtNGgtMnYtMmgyIDJoNHYyem0wLTZoLTQtMnYtMmgyIDRoMnYyeiIgZmlsbD0iIzMzNzFDRiIvPjwvc3ZnPg==',
            category: 'development',
            website: '#'
        },
        {
            id: 2,
            name: '开发工具2',
            description: '代码托管平台。',
            icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwLTQuNDgtMTAtMTAtMTB6bTEwIDhMMTIgMTJMNCAxMGg4djJ6bTAgMGg4di0yaC04di00aDJ2Mmg2eiIgZmlsbD0iIzMzMzMzMyIvPjwvc3ZnPg==',
            category: 'development',
            website: '#'
        },
        {
            id: 3,
            name: '浏览器',
            description: '流行网页浏览器。',
            icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwLTQuNDgtMTAtMTAtMTB6bTEwIDhMMTIgMTJMNCAxMGg4djJ6bTAgMGg4di0yaC04di00aDJ2Mmg2eiIgZmlsbD0iI0ZGRiIvPjxwYXRoIGQ9Ik0xMiA0QzcuNTggNCA0IDcuNTggNCAxMnM0LjU4IDEwIDEwIDEwIDEwLTQuNTggMTAtMTAtNC41OC0xMC0xMC0xMHoiIGZpbGw9IiMzMzMzMzMiLz48cGF0aCBkPSJNMTIgNnM0Ljk3IDAgOSA0LjAzIDkgOXMtNCA0LjAzLTkgOS05LTQtOS05eiIgZmlsbD0iI0ZGRiIvPjxwYXRoIGQ9Ik0xMiA2czQuOTcgMCA5IDQuMDMgOSA5cy00IDQuMDMtOSA5LTktNC05LTktNC4wMy05LTktOXoiIGZpbGw9IiMzMzMzMzMiLz48cGF0aCBkPSJNMTIgNnM0Ljk3IDAgOSA0LjAzIDkgOXMtNCA0LjAzLTkgOS05LTQtOS05LS4wMy05LTktOXoiIGZpbGw9IiNGRkYiLz48cGF0aCBkPSJNMTIgNnM0Ljk3IDAgOSA0LjAzIDkgOXMtNCA0LjAzLTkgOS05LTQtOS05LTQuMDMtOS05LTl6IiBmaWxsPSIjMzMzMzMzIi8+PHBhdGggZD0iTTEyIDZzNC45NyAwOSA0LjAzIDkgOXMtNCA0LjAzLTkgOS05LTQtOS05LTQuMDMtOS05LTl6IiBmaWxsPSIjRkZGIi8+PHBhdGggZD0iTTEyIDZzNC45NyAwOSA0LjAzIDkgOXMtNCA0LjAzLTkgOS05LTQtOS05LTQuMDMtOS05LTl6IiBmaWxsPSIjMzMzMzMzIiIvPjwvc3ZnPg==',
            category: 'browser',
            website: '#'
        }
    ];
    
    // --- 2. 加载最新文章 ---
    async function loadLatestArticles() {
        // 相对路径：articles/index.json
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
                // 修复：将日期显示为右浮动的小标签
                li.innerHTML = `<a href="./pages/blog.html">${title}</a><span class="article-date">${article.date}</span>`;
                latestArticlesContainer.appendChild(li);
            });

        } catch (error) {
            console.error('加载文章索引失败:', error);
            latestArticlesContainer.innerHTML = `<li class="error">文章加载失败: ${error.message}</li>`;
        }
    }
    
    // --- 3. 渲染最新软件 ---
    function renderLatestSoftware() {
        // 软件列表只有 3 个，所以全部显示
        const latestSoftware = softwareList.slice(0, 3);
        latestSoftwareContainer.innerHTML = ''; // 清空加载状态

        if (latestSoftware.length === 0) {
            latestSoftwareContainer.innerHTML = '<div class="loading">没有可用的软件记录。</div>';
            return;
        }

        latestSoftware.forEach(software => {
            const card = document.createElement('div');
            card.className = 'software-card-home'; 
            card.innerHTML = `
                <div class="software-icon">
                    <img src="${software.icon}" alt="${software.name}">
                </div>
                <div class="software-info">
                    <h4>${software.name}</h4>
                    <p>${software.description}</p>
                    <a href="${software.website}" target="_blank" class="btn-sm"><i class="fas fa-download"></i> 下载</a>
                </div>
            `;
            latestSoftwareContainer.appendChild(card);
        });
    }

    // 执行
    loadLatestArticles();
    renderLatestSoftware();
});