// 博客功能JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const articleList = document.getElementById('article-list');
    const articleContent = document.getElementById('article-content');
    const tocContainer = document.getElementById('toc-container');
    const toc = document.getElementById('toc');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    // 存储从 JSON 加载的文章元数据
    let articles = [];
    const ARTICLE_INDEX_URL = '../articles/index.json';
    
    // 初始化页面
    function init() {
        loadArticleIndex()
            .then(() => {
                renderArticleList();
                setupEventListeners();
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
                file: `../articles/${article.file}`, // 修正路径到实际的Markdown文件
                date: article.date 
            }));

        } catch (error) {
            console.error('加载文章索引失败:', error);
            articleList.innerHTML = `<li>加载失败: ${error.message}</li>`;
            // 如果加载失败，保持 articles 为空数组
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

        const filteredArticles = filter 
            ? articles.filter(article => article.title.toLowerCase().includes(filter.toLowerCase()))
            : articles;
        
        if (filteredArticles.length === 0) {
            articleList.innerHTML = '<li>没有找到匹配的文章</li>';
            return;
        }
        
        filteredArticles.forEach(article => {
            const li = document.createElement('li');
            // 显示标题和日期
            li.innerHTML = `<a href="#" data-id="${article.id}">${article.title} <span class="article-date">(${article.date})</span></a>`;
            articleList.appendChild(li);
            
            // 添加点击事件
            li.querySelector('a').addEventListener('click', function(e) {
                e.preventDefault();
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
            // 将 Markdown 中的相对路径 `(./` 替换为 `(../articles/`。
            // 这样在 pages/blog.html 中才能正确访问 articles/ 目录下的图片。
            let correctedText = text.replace(/\(\.\//g, '(../articles/');

            // 2. 处理 HTML 格式的绝对路径（如 <img src="D:\Data\...），将其替换为提示信息
            // 匹配 <img src="D:\..." ... /> 或 <img src="C:\..." ... />
            correctedText = correctedText.replace(/<img\s+src=["']([a-z]:\\|file:\/\/\/).*?["'](.*?)>/gi, 
                (match, p1, p2) => `<div class="image-load-error">图片使用了本地绝对路径，无法显示。请上传图片文件并使用相对路径。</div>`
            );

            // 使用marked解析Markdown
            const html = marked.parse(correctedText);
            articleContent.innerHTML = html;
            
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
            generateTOC(articleContent, correctedText); // 使用 correctedText 来生成目录
        })
            .catch(error => {
                articleContent.innerHTML = `<div class="error">加载文章失败: ${error.message}</div>`;
                tocContainer.style.display = 'none';
            });
    }
    
    // 生成目录
    function generateTOC(contentElement, markdown) {
        const headers = [];
        const lines = markdown.split('\n');
        
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
                // 规范化标题文本，用于创建唯一的锚点ID
                const anchor = header.text.toLowerCase()
                    .replace(/[^\w\s\u4e00-\u9fa5]/g, '') // 允许中文、字母、数字、空格
                    .replace(/\s+/g, '-');
                
                // 为文章中的标题元素添加ID
                // 必须在 DOM 中找到对应的标题元素并设置 ID
                const headerElements = contentElement.querySelectorAll(`h${header.level}`);
                let isIdSet = false;
                
                headerElements.forEach(el => {
                    // 只有当元素的文本内容与解析出的标题文本精确匹配时，才设置ID
                    // 这样可以避免给其他不相关的同级标题设置ID
                    if (el.textContent.trim() === header.text && !isIdSet) {
                        el.id = anchor;
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