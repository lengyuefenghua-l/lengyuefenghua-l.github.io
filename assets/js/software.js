// 软件收集功能JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const softwareGrid = document.getElementById('software-grid');
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    // 存储从 JSON 加载的软件数据
    let softwareList = [];
    // 修正路径：相对 pages/software.html 应该在 ../data/software.json
    const SOFTWARE_DATA_URL = '../data/software.json';
    
    // 初始化页面
    function init() {
        loadSoftwareData().then(() => {
            renderSoftwareList();
            setupEventListeners();
        });
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
            : softwareList.filter(software => software.category === category);
        
        if (filteredSoftware.length === 0) {
            softwareGrid.innerHTML = '<div class="loading">没有找到匹配的软件</div>';
            return;
        }
        
        filteredSoftware.forEach(software => {
            const card = document.createElement('div');
            card.className = 'software-card';
            card.innerHTML = `
                <div class="software-icon">
                    <!-- 添加了 onerror 容错处理，如果图标 URL 失效，则使用一个通用的 SVG 图标 -->
                    <img src="${software.icon}" alt="${software.name}" onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMTIgMkwyIDEySDVWMjBIMTlaTTcgMTguNUEyLjUgMi41IDAgMCAwIDkuNSAyMSAyLjUgMi41IDAgMCAwIDEyIDI0YTIuNSAyLjUgMCAwIDAgMi41LTIuNUExIDUgMCAwIDAgMTkgMjFIMTJaTTExIDExLjVMNyA3LjVIMTJWMTUuNUgxNFY2SDExWiIgZmlsbD0iIzY2NjY2NiIvPjwvc3ZnPg=='">
                </div>
                <div class="software-info">
                    <h3>${software.name}</h3>
                    <p>${software.description}</p>
                    <div class="software-links">
                        <a href="${software.website}" target="_blank"><i class="fas fa-download"></i> 下载</a>
                    </div>
                </div>
            `;
            softwareGrid.appendChild(card);
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