// 博客功能JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const articleList = document.getElementById('article-list');
    const articleContent = document.getElementById('article-content');
    const tocContainer = document.getElementById('toc-container');
    const toc = document.getElementById('toc');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    // 模拟文章数据
    const articles = [
        { id: 'article1', title: '示例文章 1', file: 'articles/article1.md' },
        { id: 'article2', title: '示例文章 2', file: 'articles/article2.md' },
        { id: 'article3', title: '示例文章 3', file: 'articles/article3.md' }
    ];
    
    // 初始化页面
    function init() {
        renderArticleList();
        setupEventListeners();
    }
    
    // 渲染文章列表
    function renderArticleList(filter = '') {
        articleList.innerHTML = '';
        
        const filteredArticles = filter 
            ? articles.filter(article => article.title.toLowerCase().includes(filter.toLowerCase()))
            : articles;
        
        if (filteredArticles.length === 0) {
            articleList.innerHTML = '<li>没有找到匹配的文章</li>';
            return;
        }
        
        filteredArticles.forEach(article => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="#" data-id="${article.id}">${article.title}</a>`;
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
        articleContent.innerHTML = '<div class="loading">加载中...</div>';
        
        // 使用fetch加载Markdown文件
        fetch(article.file)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(text => {
                // 使用marked解析Markdown
                const html = marked.parse(text);
                articleContent.innerHTML = html;
                
                // 高亮代码
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
                
                // 生成目录
                generateTOC(text);
            })
            .catch(error => {
                articleContent.innerHTML = `<div class="error">加载文章失败: ${error.message}</div>`;
                tocContainer.style.display = 'none';
            });
    }
    
    // 生成目录
    function generateTOC(markdown) {
        const headers = [];
        const lines = markdown.split('\n');
        
        lines.forEach(line => {
            if (line.startsWith('# ')) {
                headers.push({
                    level: 1,
                    text: line.substring(2).trim()
                });
            } else if (line.startsWith('## ')) {
                headers.push({
                    level: 2,
                    text: line.substring(3).trim()
                });
            } else if (line.startsWith('### ')) {
                headers.push({
                    level: 3,
                    text: line.substring(4).trim()
                });
            }
        });
        
        if (headers.length > 0) {
            toc.innerHTML = '';
            headers.forEach(header => {
                const li = document.createElement('li');
                li.className = header.level === 3 ? 'toc-h3' : '';
                
                // 创建锚点
                const anchor = header.text.toLowerCase()
                    .replace(/[^\w\s]/g, '')
                    .replace(/\s+/g, '-');
                
                li.innerHTML = `<a href="#${anchor}">${header.text}</a>`;
                toc.appendChild(li);
                
                // 为文章中的标题添加ID
                const headerElements = articleContent.querySelectorAll(`h${header.level}`);
                headerElements.forEach(el => {
                    if (el.textContent.trim() === header.text) {
                        el.id = anchor;
                    }
                });
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
                const filter = searchInput.value.trim();
                renderArticleList(filter);
            }
        });
    }
    
    // 初始化
    init();
});