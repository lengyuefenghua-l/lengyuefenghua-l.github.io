// 软件收集功能JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const softwareGrid = document.getElementById('software-grid');
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    // 软件数据
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
            icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwLTQuNDgtMTAtMTAtMTB6bTEwIDhMMTIgMTJMNCAxMGg4djJ6bTAgMGg4di0yaC04di00aDJ2Mmg2eiIgZmlsbD0iI0ZGRiIvPjxwYXRoIGQ9Ik0xMiA0QzcuNTggNCA0IDcuNTggNCAxMnM0LjU4IDEwIDEwIDEwIDEwLTQuNTggMTAtMTAtNC41OC0xMC0xMC0xMHoiIGZpbGw9IiMzMzMzMzMiLz48cGF0aCBkPSJNMTIgNnM0Ljk3IDAgOSA0LjAzIDkgOXMtNCA0LjAzLTkgOS05LTQtOS05eiIgZmlsbD0iI0ZGRiIvPjxwYXRoIGQ9Ik0xMiA2czQuOTcgMCA5IDQuMDMgOSA5cy00IDQuMDMtOSA5LTktNC05LTktNC4wMy05LTktOXoiIGZpbGw9IiMzMzMzMzMiLz48cGF0aCBkPSJNMTIgNnM0Ljk3IDAgOSA0LjAzIDkgOXMtNCA0LjAzLTkgOS05LTQtOS05eiIgZmlsbD0iI0ZGRiIvPjxwYXRoIGQ9Ik0xMiA2czQuOTcgMCA5IDQuMDMgOSA5cy00IDQuMDMtOSA5LTktNC05LTktNC4wMy05LTktOXoiIGZmlsbD0iIzMzMzMzMyIvPjxwYXRoIGQ9Ik0xMiA2czQuOTcgMCA5IDQuMDMgOSA5cy00IDQuMDMtOSA5LTktNC05LTktNC4wMy05LTktOXoiIGZmlsbD0iI0ZGRiIvPjxwYXRoIGQ9Ik0xMiA2czQuOTcgMCA5IDQuMDMgOSA5cy00IDQuMDMtOSA5LTktNC05LTktNC4wMy05LTktOXoiIGZpbGw9IiMzMzMzMzMiLz48L3N2Zz4=',
            category: 'browser',
            website: '#'
        }
    ];
    
    // 初始化页面
    function init() {
        renderSoftwareList();
        setupEventListeners();
    }
    
    // 渲染软件列表
    function renderSoftwareList(category = 'all') {
        softwareGrid.innerHTML = '';
        
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
                    <img src="${software.icon}" alt="${software.name}">
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