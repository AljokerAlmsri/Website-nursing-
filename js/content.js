// إدارة المحتوى والعرض
class ContentManager {
    constructor() {
        this.githubAPI = new GitHubAPI();
    }

    // تحميل المحتوى حسب النوع
    async loadContent(type, containerId) {
        const content = await dbManager.getContent({ type });
        const container = document.getElementById(containerId);
        
        if (!container) return;
        
        container.innerHTML = '';
        
        if (content.length === 0) {
            container.innerHTML = '<p>لا يوجد محتوى متاح حالياً</p>';
            return;
        }
        
        content.forEach(item => {
            const contentElement = this.createContentElement(item, type);
            container.appendChild(contentElement);
        });
    }

    // إنشاء عنصر محتوى
    createContentElement(item, type) {
        const element = document.createElement('div');
        element.className = 'content-item';
        
        let contentHTML = '';
        
        switch (type) {
            case 'book':
                contentHTML = this.createBookElement(item);
                break;
            case 'video':
                contentHTML = this.createVideoElement(item);
                break;
            case 'audio':
                contentHTML = this.createAudioElement(item);
                break;
            case 'exam':
                contentHTML = this.createExamElement(item);
                break;
            default:
                contentHTML = this.createGenericElement(item);
        }
        
        element.innerHTML = contentHTML;
        return element;
    }

    // إنشاء عنصر كتاب
    createBookElement(item) {
        return `
            <div class="content-card">
                <div class="content-icon">📚</div>
                <h3>${item.title}</h3>
                <p>${item.description || ''}</p>
                <div class="content-actions">
                    <a href="${item.fileUrl}" target="_blank" class="btn btn-primary">عرض الكتاب</a>
                    <button class="btn btn-outline favorite-btn" data-id="${item.id}">إضافة للمفضلة</button>
                </div>
            </div>
        `;
    }

    // إنشاء عنصر فيديو
    createVideoElement(item) {
        return `
            <div class="content-card">
                <div class="content-icon">🎬</div>
                <h3>${item.title}</h3>
                <p>${item.description || ''}</p>
                <div class="video-player">
                    <video controls style="width: 100%; max-width: 500px;">
                        <source src="${item.fileUrl}" type="video/mp4">
                        متصفحك لا يدعم تشغيل الفيديو.
                    </video>
                </div>
                <div class="content-actions">
                    <a href="${item.fileUrl}" download class="btn btn-primary">تحميل الفيديو</a>
                    <button class="btn btn-outline favorite-btn" data-id="${item.id}">إضافة للمفضلة</button>
                </div>
            </div>
        `;
    }

    // إنشاء عنصر صوتي
    createAudioElement(item) {
        return `
            <div class="content-card">
                <div class="content-icon">🎧</div>
                <h3>${item.title}</h3>
                <p>${item.description || ''}</p>
                <div class="audio-player">
                    <audio controls style="width: 100%;">
                        <source src="${item.fileUrl}" type="audio/mpeg">
                        متصفحك لا يدعم تشغيل الصوت.
                    </audio>
                </div>
                <div class="content-actions">
                    <a href="${item.fileUrl}" download class="btn btn-primary">تحميل الصوت</a>
                    <button class="btn btn-outline favorite-btn" data-id="${item.id}">إضافة للمفضلة</button>
                </div>
            </div>
        `;
    }

    // إنشاء عنصر اختبار
    createExamElement(item) {
        return `
            <div class="content-card">
                <div class="content-icon">📝</div>
                <h3>${item.title}</h3>
                <p>${item.description || ''}</p>
                <div class="exam-info">
                    <p>عدد الأسئلة: ${item.questions ? item.questions.length : 0}</p>
                    <p>مدة الاختبار: ${item.duration || 'غير محدد'} دقيقة</p>
                </div>
                <div class="content-actions">
                    <a href="exam.html?id=${item.id}" class="btn btn-primary">بدء الاختبار</a>
                </div>
            </div>
        `;
    }

    // إنشاء عنصر عام
    createGenericElement(item) {
        return `
            <div class="content-card">
                <h3>${item.title}</h3>
                <p>${item.description || ''}</p>
                <div class="content-actions">
                    <a href="${item.fileUrl}" target="_blank" class="btn btn-primary">عرض المحتوى</a>
                    <button class="btn btn-outline favorite-btn" data-id="${item.id}">إضافة للمفضلة</button>
                </div>
            </div>
        `;
    }

    // تحميل المقالات الطبية
    async loadMedicalArticles(containerId) {
        const articles = await dbManager.getMedicalArticles();
        const container = document.getElementById(containerId);
        
        if (!container) return;
        
        container.innerHTML = '';
        
        if (articles.length === 0) {
            container.innerHTML = '<p>لا توجد مقالات متاحة حالياً</p>';
            return;
        }
        
        articles.forEach(article => {
            const articleElement = this.createArticleElement(article);
            container.appendChild(articleElement);
        });
    }

    // إنشاء عنصر مقال
    createArticleElement(article) {
        const element = document.createElement('div');
        element.className = 'article-card';
        
        element.innerHTML = `
            <div class="article-image">
                ${article.imageUrl ? 
                    `<img src="${article.imageUrl}" alt="${article.title}">` : 
                    '📄'
                }
            </div>
            <div class="article-content">
                <h3>${article.title}</h3>
                <div class="article-meta">
                    <span>${this.formatDate(article.createdAt)}</span>
                </div>
                <p class="article-excerpt">${article.excerpt || article.content.substring(0, 150)}...</p>
                <a href="article.html?id=${article.id}" class="read-more">قراءة المزيد</a>
            </div>
        `;
        
        return element;
    }

    // تنسيق التاريخ
    formatDate(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleDateString('ar-EG');
    }
}

// مدير GitHub API
class GitHubAPI {
    constructor() {
        this.token = githubConfig.token;
        this.repo = githubConfig.repo;
        this.branch = githubConfig.branch;
    }

    // رفع ملف إلى GitHub
    async uploadFile(file, path) {
        try {
            const content = await this.fileToBase64(file);
            
            const response = await fetch(`https://api.github.com/repos/${this.repo}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Upload ${file.name}`,
                    content: content,
                    branch: this.branch
                })
            });

            if (!response.ok) {
                throw new Error('Failed to upload file to GitHub');
            }

            const data = await response.json();
            return { success: true, url: data.content.download_url };
        } catch (error) {
            console.error('Error uploading file to GitHub:', error);
            return { success: false, error: error.message };
        }
    }

    // تحويل الملف إلى base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }
}

// تهيئة مدير المحتوى
const contentManager = new ContentManager();

// تحميل المقالات الأخيرة للصفحة الرئيسية
async function loadLatestArticles() {
    await contentManager.loadMedicalArticles('latestArticles');
}