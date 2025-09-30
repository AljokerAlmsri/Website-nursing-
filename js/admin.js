// إدارة لوحة الإدارة
class AdminManager {
    constructor() {
        this.initModals();
    }

    initModals() {
        // إغلاق المودال عند النقر على X
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });

        // إغلاق المودال عند النقر خارج المحتوى
        window.addEventListener('click', function(event) {
            document.querySelectorAll('.modal').forEach(modal => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }

    // تحميل الإحصائيات
    async loadStats() {
        try {
            // إجمالي المستخدمين
            const usersSnapshot = await db.collection('users').get();
            document.getElementById('totalUsers').textContent = usersSnapshot.size;

            // المحتوى المنتظر الموافقة
            const pendingSnapshot = await db.collection('content').where('status', '==', 'pending').get();
            document.getElementById('pendingContent').textContent = pendingSnapshot.size;

            // إجمالي المقالات
            const articlesSnapshot = await db.collection('medicalArticles').get();
            document.getElementById('totalArticles').textContent = articlesSnapshot.size;

            // الاختبارات النشطة
            const examsSnapshot = await db.collection('exams').where('status', '==', 'active').get();
            document.getElementById('activeExams').textContent = examsSnapshot.size;
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    // تحميل المحتوى المنتظر الموافقة
    async loadPendingContent() {
        const pendingList = document.getElementById('pendingContentList');
        
        try {
            const snapshot = await db.collection('content')
                .where('status', '==', 'pending')
                .orderBy('createdAt', 'desc')
                .get();

            if (snapshot.empty) {
                pendingList.innerHTML = '<p>لا يوجد محتوى منتظر الموافقة</p>';
                return;
            }

            pendingList.innerHTML = '';
            snapshot.forEach(doc => {
                const content = doc.data();
                const contentElement = this.createPendingContentElement(doc.id, content);
                pendingList.appendChild(contentElement);
            });
        } catch (error) {
            console.error('Error loading pending content:', error);
            pendingList.innerHTML = '<p>حدث خطأ في تحميل المحتوى</p>';
        }
    }

    // إنشاء عنصر محتوى منتظر الموافقة
    createPendingContentElement(id, content) {
        const element = document.createElement('div');
        element.className = 'content-item';
        element.innerHTML = `
            <div class="content-info">
                <h4>${content.title}</h4>
                <div class="content-meta">
                    <span>النوع: ${content.type}</span>
                    <span> | </span>
                    <span>تم الإضافة: ${this.formatDate(content.createdAt)}</span>
                </div>
            </div>
            <div class="content-actions">
                <button class="btn btn-primary btn-sm" onclick="approveContent('${id}')">موافقة</button>
                <button class="btn btn-outline btn-sm" onclick="rejectContent('${id}')">رفض</button>
                <button class="btn btn-outline btn-sm" onclick="viewContent('${id}')">عرض</button>
            </div>
        `;
        return element;
    }

    // تحميل كل المحتوى
    async loadAllContent() {
        const contentList = document.getElementById('allContentList');
        
        try {
            const snapshot = await db.collection('content')
                .orderBy('createdAt', 'desc')
                .get();

            if (snapshot.empty) {
                contentList.innerHTML = '<p>لا يوجد محتوى</p>';
                return;
            }

            contentList.innerHTML = '';
            snapshot.forEach(doc => {
                const content = doc.data();
                const contentElement = this.createContentElement(doc.id, content);
                contentList.appendChild(contentElement);
            });
        } catch (error) {
            console.error('Error loading all content:', error);
            contentList.innerHTML = '<p>حدث خطأ في تحميل المحتوى</p>';
        }
    }

    // إنشاء عنصر محتوى
    createContentElement(id, content) {
        const element = document.createElement('div');
        element.className = 'content-item';
        
        let statusBadge = '';
        switch(content.status) {
            case 'approved':
                statusBadge = '<span style="color: green;">✓ معتمد</span>';
                break;
            case 'pending':
                statusBadge = '<span style="color: orange;">⏳ منتظر</span>';
                break;
            case 'rejected':
                statusBadge = '<span style="color: red;">✗ مرفوض</span>';
                break;
        }

        element.innerHTML = `
            <div class="content-info">
                <h4>${content.title}</h4>
                <div class="content-meta">
                    <span>النوع: ${content.type}</span>
                    <span> | </span>
                    <span>الحالة: ${statusBadge}</span>
                    <span> | </span>
                    <span>تم الإضافة: ${this.formatDate(content.createdAt)}</span>
                </div>
            </div>
            <div class="content-actions">
                ${content.status === 'pending' ? `
                    <button class="btn btn-primary btn-sm" onclick="approveContent('${id}')">موافقة</button>
                    <button class="btn btn-outline btn-sm" onclick="rejectContent('${id}')">رفض</button>
                ` : ''}
                <button class="btn btn-outline btn-sm" onclick="viewContent('${id}')">عرض</button>
                <button class="btn btn-outline btn-sm" onclick="deleteContent('${id}')">حذف</button>
            </div>
        `;
        return element;
    }

    // تحميل كل المقالات
    async loadAllArticles() {
        const articlesList = document.getElementById('allArticlesList');
        
        try {
            const snapshot = await db.collection('medicalArticles')
                .orderBy('createdAt', 'desc')
                .get();

            if (snapshot.empty) {
                articlesList.innerHTML = '<p>لا توجد مقالات</p>';
                return;
            }

            articlesList.innerHTML = '';
            snapshot.forEach(doc => {
                const article = doc.data();
                const articleElement = this.createArticleElement(doc.id, article);
                articlesList.appendChild(articleElement);
            });
        } catch (error) {
            console.error('Error loading all articles:', error);
            articlesList.innerHTML = '<p>حدث خطأ في تحميل المقالات</p>';
        }
    }

    // إنشاء عنصر مقال
    createArticleElement(id, article) {
        const element = document.createElement('div');
        element.className = 'content-item';
        element.innerHTML = `
            <div class="content-info">
                <h4>${article.title}</h4>
                <div class="content-meta">
                    <span>التصنيف: ${article.category || 'عام'}</span>
                    <span> | </span>
                    <span>تم النشر: ${this.formatDate(article.createdAt)}</span>
                </div>
            </div>
            <div class="content-actions">
                <button class="btn btn-outline btn-sm" onclick="editArticle('${id}')">تعديل</button>
                <button class="btn btn-outline btn-sm" onclick="deleteArticle('${id}')">حذف</button>
            </div>
        `;
        return element;
    }

    // تحميل كل الاختبارات
    async loadAllExams() {
        const examsList = document.getElementById('allExamsList');
        
        try {
            const snapshot = await db.collection('exams')
                .orderBy('createdAt', 'desc')
                .get();

            if (snapshot.empty) {
                examsList.innerHTML = '<p>لا توجد اختبارات</p>';
                return;
            }

            examsList.innerHTML = '';
            snapshot.forEach(doc => {
                const exam = doc.data();
                const examElement = this.createExamElement(doc.id, exam);
                examsList.appendChild(examElement);
            });
        } catch (error) {
            console.error('Error loading all exams:', error);
            examsList.innerHTML = '<p>حدث خطأ في تحميل الاختبارات</p>';
        }
    }

    // إنشاء عنصر اختبار
    createExamElement(id, exam) {
        const element = document.createElement('div');
        element.className = 'content-item';
        
        const statusBadge = exam.status === 'active' ? 
            '<span style="color: green;">✓ نشط</span>' : 
            '<span style="color: red;">✗ غير نشط</span>';

        element.innerHTML = `
            <div class="content-info">
                <h4>${exam.title}</h4>
                <div class="content-meta">
                    <span>الحالة: ${statusBadge}</span>
                    <span> | </span>
                    <span>عدد الأسئلة: ${exam.questions ? exam.questions.length : 0}</span>
                    <span> | </span>
                    <span>تم الإنشاء: ${this.formatDate(exam.createdAt)}</span>
                </div>
            </div>
            <div class="content-actions">
                <button class="btn btn-outline btn-sm" onclick="toggleExamStatus('${id}', ${exam.status === 'active'})">
                    ${exam.status === 'active' ? 'إيقاف' : 'تفعيل'}
                </button>
                <button class="btn btn-outline btn-sm" onclick="editExam('${id}')">تعديل</button>
                <button class="btn btn-outline btn-sm" onclick="deleteExam('${id}')">حذف</button>
            </div>
        `;
        return element;
    }

    // تحميل كل المستخدمين
    async loadAllUsers() {
        const usersList = document.getElementById('usersList');
        
        try {
            const snapshot = await db.collection('users')
                .orderBy('createdAt', 'desc')
                .get();

            if (snapshot.empty) {
                usersList.innerHTML = '<p>لا يوجد مستخدمين</p>';
                return;
            }

            usersList.innerHTML = '';
            snapshot.forEach(doc => {
                const user = doc.data();
                const userElement = this.createUserElement(doc.id, user);
                usersList.appendChild(userElement);
            });
        } catch (error) {
            console.error('Error loading all users:', error);
            usersList.innerHTML = '<p>حدث خطأ في تحميل المستخدمين</p>';
        }
    }

    // إنشاء عنصر مستخدم
    createUserElement(id, user) {
        const element = document.createElement('div');
        element.className = 'content-item';
        
        const roleBadge = user.role === 'admin' ? 
            '<span style="color: red;">👑 أدمن</span>' : 
            '<span style="color: blue;">👤 مستخدم</span>';

        element.innerHTML = `
            <div class="content-info">
                <h4>${user.name}</h4>
                <div class="content-meta">
                    <span>${user.email}</span>
                    <span> | </span>
                    <span>${roleBadge}</span>
                    <span> | </span>
                    <span>${user.governorate} - ${user.university}</span>
                    <span> | </span>
                    <span>${user.year}</span>
                </div>
            </div>
            <div class="content-actions">
                ${user.role !== 'admin' ? `
                    <button class="btn btn-outline btn-sm" onclick="makeAdmin('${id}')">تعيين كأدمن</button>
                ` : ''}
                <button class="btn btn-outline btn-sm" onclick="deleteUser('${id}')">حذف</button>
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

// تهيئة مدير الإدارة
const adminManager = new AdminManager();

// الدوال العامة للاستخدام في HTML
async function approveContent(contentId) {
    const result = await dbManager.approveContent(contentId);
    if (result.success) {
        uiManager.showMessage('تمت الموافقة على المحتوى', 'success');
        adminManager.loadPendingContent();
        adminManager.loadAllContent();
        adminManager.loadStats();
    } else {
        uiManager.showMessage('حدث خطأ أثناء الموافقة', 'error');
    }
}

async function rejectContent(contentId) {
    const result = await dbManager.rejectContent(contentId);
    if (result.success) {
        uiManager.showMessage('تم رفض المحتوى', 'success');
        adminManager.loadPendingContent();
        adminManager.loadAllContent();
        adminManager.loadStats();
    } else {
        uiManager.showMessage('حدث خطأ أثناء الرفض', 'error');
    }
}

function viewContent(contentId) {
    // عرض المحتوى (يمكن تنفيذه حسب الحاجة)
    uiManager.showMessage('عرض المحتوى - تحت التطوير', 'info');
}

async function deleteContent(contentId) {
    if (confirm('هل أنت متأكد من حذف هذا المحتوى؟')) {
        try {
            await db.collection('content').doc(contentId).delete();
            uiManager.showMessage('تم حذف المحتوى', 'success');
            adminManager.loadAllContent();
            adminManager.loadStats();
        } catch (error) {
            uiManager.showMessage('حدث خطأ أثناء الحذف', 'error');
        }
    }
}

async function deleteArticle(articleId) {
    if (confirm('هل أنت متأكد من حذف هذا المقال؟')) {
        try {
            await db.collection('medicalArticles').doc(articleId).delete();
            uiManager.showMessage('تم حذف المقال', 'success');
            adminManager.loadAllArticles();
            adminManager.loadStats();
        } catch (error) {
            uiManager.showMessage('حدث خطأ أثناء الحذف', 'error');
        }
    }
}

async function toggleExamStatus(examId, isActive) {
    try {
        await db.collection('exams').doc(examId).update({
            status: isActive ? 'inactive' : 'active'
        });
        uiManager.showMessage(`تم ${isActive ? 'إيقاف' : 'تفعيل'} الاختبار`, 'success');
        adminManager.loadAllExams();
        adminManager.loadStats();
    } catch (error) {
        uiManager.showMessage('حدث خطأ أثناء تغيير حالة الاختبار', 'error');
    }
}

async function deleteExam(examId) {
    if (confirm('هل أنت متأكد من حذف هذا الاختبار؟')) {
        try {
            await db.collection('exams').doc(examId).delete();
            uiManager.showMessage('تم حذف الاختبار', 'success');
            adminManager.loadAllExams();
            adminManager.loadStats();
        } catch (error) {
            uiManager.showMessage('حدث خطأ أثناء الحذف', 'error');
        }
    }
}

async function makeAdmin(userId) {
    if (confirm('هل تريد تعيين هذا المستخدم كأدمن؟')) {
        try {