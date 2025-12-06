// 博客功能JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const articleList = document.getElementById('article-list');
    const articleContent = document.getElementById('article-content');
    const tocContainer = document.getElementById('toc-container');
    const toc = document.getElementById('toc');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const articleCountBadge = document.getElementById('article-count'); // NEW: 获取文章总数显示元素
    
    // 存储从 JSON 加载的文章元数据
    let articles = [];
    // 修正路径：相对 pages/blog.html 应该在 ../data/articles.json
    const ARTICLE_INDEX_URL = '../data/articles.json'; 
    
    // 初始化页面
    function init() {
        loadArticleIndex()
            .then(() => {
                
                // NEW: 确保全局文章列表已按日期降序排序 (最新在前)，以保证 articles[0] 是最新文章
                articles.sort((a, b) => {
                    const dateA = a.updated_date || a.date;
                    const dateB = b.updated_date || b.date;
                    
                    // 降序排序 (最新日期在前)
                    if (dateA < dateB) return 1;
                    if (dateA > dateB) return -1;
                    return 0;
                });
                
                renderArticleList();
                setupEventListeners();
                
                // 默认加载第一篇文章
                if (articles.length > 0) {
                    // articles[0] 现在已经是最新排序后的第一篇文章
                    loadArticle(articles[0].id); 
                    
                    // 确保列表中的第一篇文章被标记为活动状态
                    const firstArticleLink = document.querySelector('.article-list a[data-id="' + articles[0].id + '"]');
                    if (firstArticleLink) {
                        firstArticleLink.classList.add('active');
                    }
                }
            });
    }

    // 加载文章索引文件
    async function loadArticleIndex() {
        articleList.innerHTML = '<li><i class="fas fa-spinner fa-spin"></i> 正在加载文章索引...</li>';
        try {
            const response = await fetch(ARTICLE_INDEX_URL);
            if (!response.ok) {
                throw new Error(`无法加载文章索引: ${response.statusText}`);
            }
            const data = await response.json();
            
            // 确保文章文件名路径正确
            articles = data.map(article => ({
                id: article.file.replace('.md', ''), // 使用文件名作为ID
                title: article.file.replace('.md', ''),
                // 修正 Markdown 文件路径：相对 pages/blog.html 应该在 ../data/articles/
                file: `../data/articles/${article.file}`, 
                date: article.date, // 原始创建日期
                updated_date: article.updated_date || article.date // NEW: 最后修改日期，如果不存在则使用创建日期
            }));

            // NEW: 更新文章总数
            if (articleCountBadge) {
                articleCountBadge.textContent = `(${articles.length})`;
            }

        } catch (error) {
            console.error('加载文章索引失败:', error);
            articleList.innerHTML = `<li>加载失败: ${error.message}</li>`;
            // 如果加载失败，保持 articles 为空数组
            if (articleCountBadge) { // NEW: 加载失败也更新徽章
                articleCountBadge.textContent = '(0)';
            }
        }
    }
    
    // 渲染文章列表
    function renderArticleList(filter = '') {
        articleList.innerHTML = '';
        
        // 如果文章数据为空，显示提示
        if (articles.length === 0) {
             articleList.innerHTML = '<li>目前没有可用的文章。</li>';
             return;
        }

        // 现在 articles 已经被排序，可以直接使用
        let filteredArticles = filter 
            ? articles.filter(article => article.title.toLowerCase().includes(filter.toLowerCase()))
            : articles;

        if (filteredArticles.length === 0) {
            articleList.innerHTML = '<li>没有找到匹配的文章</li>';
            // NEW: 更新筛选后的文章数量
            if (articleCountBadge) {
                articleCountBadge.textContent = `(0)`;
            }
            return;
        }

        // NEW: 更新筛选后的文章数量
        if (articleCountBadge) {
            articleCountBadge.textContent = `(${filteredArticles.length} / ${articles.length})`;
        }

        
        filteredArticles.forEach(article => {
            const li = document.createElement('li');
            // NEW: 在列表中显示最新的日期 (updated_date)
            const displayDate = article.updated_date || article.date;
            
            // 修复：将日期显示为右浮动的小标签，并在链接上添加 title 属性用于悬浮提示
            li.innerHTML = `<a href="#" data-id="${article.id}" title="${article.title}">${article.title}</a><span class="article-date">${displayDate}</span>`;
            articleList.appendChild(li);
            
            // 添加点击事件
            li.querySelector('a').addEventListener('click', function(e) {
                e.preventDefault();
                
                // 关键更改：在加载内容前，第一时间滚动到页面顶部
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth' // 使用平滑滚动，体验更好
                });
                
                loadArticle(article.id);
                
                // 更新活动状态
                document.querySelectorAll('.article-list a').forEach(a => a.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
    
    // 加载文章内容
    function loadArticle(articleId) {
        const article = articles.find(a => a.id === articleId);
        if (!article) return;
        
        // 移除滚动操作，已转移到点击事件监听器中。

        // 隐藏欢迎信息
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) welcomeMessage.style.display = 'none';

        // 显示加载状态
        articleContent.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 正在加载内容...</div>';
        tocContainer.style.display = 'none'; // 隐藏目录直到内容加载完成
        
        // 使用fetch加载Markdown文件
        fetch(article.file)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(text => {
            // 1. 修正图片相对路径 (满足本地编辑习惯)
            // 将 Markdown 中的相对路径 `(./` 替换为 `(../data/articles/`。
            // 这样在 pages/blog.html 中才能正确访问 data/articles/ 目录下的图片。
            let correctedText = text.replace(/\(\.\//g, '(../data/articles/');

            // 2. 处理 HTML 格式的绝对路径（如 <img src="D:\Data\...），将其替换为提示信息
            // 匹配 <img src="D:\..." ... /> 或 <img src="C:\..." ... />
            correctedText = correctedText.replace(/<img\s+src=["']([a-z]:\\|file:\/\/\/).*?["'](.*?)>/gi, 
                (match, p1, p2) => `<div class="image-load-error">图片使用了本地绝对路径或文件协议，无法显示。请上传图片文件并使用相对路径。</div>`
            );

            // 使用marked解析Markdown
            const html = marked.parse(correctedText);
            
            // NEW: 构造并预置文章日期信息 (创建日期和最后修改日期)
            const dateBlockHTML = `
                <div class="article-metadata">
                    <span class="created-date">创建于: ${article.date}</span>
                    <span class="updated-date">最后修改于: ${article.updated_date || article.date}</span>
                </div>
            `;
            
            // 将日期信息块预置在文章内容之前
            articleContent.innerHTML = dateBlockHTML + html;
            
            // 3. 图片错误处理 (针对 Marked 解析出的 <img> 标签)
            document.querySelectorAll('.article-content img').forEach(img => {
                // 添加一个错误处理，以便图片加载失败时显示提示
                img.onerror = function() {
                    console.error('Image failed to load:', img.src);
                    const altText = img.alt || '图片';
                    // 替换为自定义的错误提示 HTML
                    const parent = img.parentNode;
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'image-load-error';
                    errorDiv.innerHTML = `无法加载图片: ${altText}。请检查图片路径。`;
                    parent.replaceChild(errorDiv, img);
                };
            });
            
            // 高亮代码
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
            
            // 生成目录
            generateTOC(articleContent, correctedText); 
        })
            .catch(error => {
                articleContent.innerHTML = `<div class="error">加载文章失败: ${error.message}</div>`;
                tocContainer.style.display = 'none';
            });
    }
    
    // 生成目录 (修复：确保生成的锚点ID是唯一的)
    function generateTOC(contentElement, markdown) {
        const headers = [];
        const lines = markdown.split('\n');
        // NEW: 用于存储已生成的锚点ID及其出现次数，以确保唯一性
        const anchorMap = {}; 
        
        // 第一次遍历 Markdown 文本，提取标题文本
        lines.forEach(line => {
            if (line.startsWith('# ')) {
                headers.push({ level: 1, text: line.substring(2).trim() });
            } else if (line.startsWith('## ')) {
                headers.push({ level: 2, text: line.substring(3).trim() });
            } else if (line.startsWith('### ')) {
                headers.push({ level: 3, text: line.substring(4).trim() });
            }
        });
        
        if (headers.length > 0) {
            toc.innerHTML = '';
            
            // 第二次遍历，处理文章内容中的标题，并生成目录
            headers.forEach(header => {
                // 规范化标题文本，用于创建锚点ID
                let baseAnchor = header.text.toLowerCase()
                    .replace(/[^\w\s\u4e00-\u9fa5]/g, '') // 允许中文、字母、数字、空格
                    .replace(/\s+/g, '-');
                
                // 确保锚点ID唯一
                let anchor = baseAnchor;
                let count = anchorMap[baseAnchor] || 0;
                
                if (count > 0) {
                    anchor = `${baseAnchor}-${count}`;
                }
                anchorMap[baseAnchor] = count + 1; // 更新计数

                // 为文章中的标题元素添加ID
                // 必须在 DOM 中找到对应的标题元素并设置 ID
                const headerElements = contentElement.querySelectorAll(`h${header.level}`);
                let isIdSet = false;
                
                headerElements.forEach(el => {
                    // 只有当元素的文本内容与解析出的标题文本精确匹配时，才设置ID
                    // 并且确保该元素尚未被设置 ID
                    if (el.textContent.trim() === header.text && !isIdSet) {
                        el.id = anchor; // 使用唯一的 ID
                        isIdSet = true;
                    }
                });

                // 创建目录列表项
                const li = document.createElement('li');
                li.className = header.level === 3 ? 'toc-h3' : (header.level === 2 ? 'toc-h2' : 'toc-h1');
                
                li.innerHTML = `<a href="#${anchor}">${header.text}</a>`;
                toc.appendChild(li);
            });
            
            tocContainer.style.display = 'block';
        } else {
            tocContainer.style.display = 'none';
        }
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 搜索功能
        searchBtn.addEventListener('click', function() {
            const filter = searchInput.value.trim();
            renderArticleList(filter);
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // 阻止默认的表单提交行为
                const filter = searchInput.value.trim();
                renderArticleList(filter);
            }
        });
    }
    
    // 初始化
    init();
});