// إدارة قاعدة البيانات
class DatabaseManager {
    constructor() {
        this.db = db;
    }

    // إضافة محتوى جديد
    async addContent(contentData, isAdmin = false) {
        try {
            const contentRef = await db.collection('content').add({
                ...contentData,
                status: isAdmin ? 'approved' : 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: authManager.currentUser.uid
            });
            return { success: true, id: contentRef.id };
        } catch (error) {
            console.error('Error adding content:', error);
            return { success: false, error: error.message };
        }
    }

    // الحصول على المحتوى بناءً على صلاحيات المستخدم
    async getContent(filters = {}) {
        try {
            let query = db.collection('content');
            
            // تطبيق الفلاتر
            if (filters.type) {
                query = query.where('type', '==', filters.type);
            }
            
            if (filters.governorate && authManager.currentUser) {
                const userData = await authManager.getUserData(authManager.currentUser.uid);
                if (userData) {
                    query = query.where('governorate', '==', userData.governorate);
                }
            }
            
            // الأدمن يرى كل المحتوى، المستخدم يرى فقط المحتوى المعتمد
            if (!(await authManager.isAdmin(authManager.currentUser.uid))) {
                query = query.where('status', '==', 'approved');
            }
            
            const snapshot = await query.orderBy('createdAt', 'desc').get();
            const content = [];
            snapshot.forEach(doc => {
                content.push({ id: doc.id, ...doc.data() });
            });
            
            return content;
        } catch (error) {
            console.error('Error getting content:', error);
            return [];
        }
    }

    // الحصول على المقالات الطبية (متاحة للجميع)
    async getMedicalArticles() {
        try {
            const snapshot = await db.collection('medicalArticles')
                .where('status', '==', 'published')
                .orderBy('createdAt', 'desc')
                .get();
            
            const articles = [];
            snapshot.forEach(doc => {
                articles.push({ id: doc.id, ...doc.data() });
            });
            
            return articles;
        } catch (error) {
            console.error('Error getting medical articles:', error);
            return [];
        }
    }

    // إضافة مقال طبي (للأدمن فقط)
    async addMedicalArticle(articleData) {
        try {
            const articleRef = await db.collection('medicalArticles').add({
                ...articleData,
                status: 'published',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: authManager.currentUser.uid
            });
            return { success: true, id: articleRef.id };
        } catch (error) {
            console.error('Error adding medical article:', error);
            return { success: false, error: error.message };
        }
    }

    // إدارة الاختبارات
    async addExam(examData) {
        try {
            const examRef = await db.collection('exams').add({
                ...examData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: authManager.currentUser.uid
            });
            return { success: true, id: examRef.id };
        } catch (error) {
            console.error('Error adding exam:', error);
            return { success: false, error: error.message };
        }
    }

    async getExams() {
        try {
            const snapshot = await db.collection('exams')
                .where('status', '==', 'active')
                .orderBy('createdAt', 'desc')
                .get();
            
            const exams = [];
            snapshot.forEach(doc => {
                exams.push({ id: doc.id, ...doc.data() });
            });
            
            return exams;
        } catch (error) {
            console.error('Error getting exams:', error);
            return [];
        }
    }

    // حفظ نتائج الاختبارات
    async saveExamResult(examId, result) {
        try {
            const userId = authManager.currentUser.uid;
            const resultRef = await db.collection('examResults').add({
                examId,
                userId,
                result,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true, id: resultRef.id };
        } catch (error) {
            console.error('Error saving exam result:', error);
            return { success: false, error: error.message };
        }
    }

    // الحصول على نتائج المستخدم
    async getUserExamResults(userId) {
        try {
            const snapshot = await db.collection('examResults')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();
            
            const results = [];
            snapshot.forEach(doc => {
                results.push({ id: doc.id, ...doc.data() });
            });
            
            return results;
        } catch (error) {
            console.error('Error getting user exam results:', error);
            return [];
        }
    }

    // إدارة المفضلة
    async addToFavorites(contentId, contentType) {
        try {
            const userId = authManager.currentUser.uid;
            const favoriteRef = await db.collection('favorites').add({
                userId,
                contentId,
                contentType,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true, id: favoriteRef.id };
        } catch (error) {
            console.error('Error adding to favorites:', error);
            return { success: false, error: error.message };
        }
    }

    async removeFromFavorites(favoriteId) {
        try {
            await db.collection('favorites').doc(favoriteId).delete();
            return { success: true };
        } catch (error) {
            console.error('Error removing from favorites:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserFavorites(userId) {
        try {
            const snapshot = await db.collection('favorites')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();
            
            const favorites = [];
            snapshot.forEach(doc => {
                favorites.push({ id: doc.id, ...doc.data() });
            });
            
            return favorites;
        } catch (error) {
            console.error('Error getting user favorites:', error);
            return [];
        }
    }

    // الموافقة على المحتوى (للأدمن فقط)
    async approveContent(contentId) {
        try {
            await db.collection('content').doc(contentId).update({
                status: 'approved',
                approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
                approvedBy: authManager.currentUser.uid
            });
            return { success: true };
        } catch (error) {
            console.error('Error approving content:', error);
            return { success: false, error: error.message };
        }
    }

    // رفض المحتوى (للأدمن فقط)
    async rejectContent(contentId) {
        try {
            await db.collection('content').doc(contentId).update({
                status: 'rejected',
                rejectedAt: firebase.firestore.FieldValue.serverTimestamp(),
                rejectedBy: authManager.currentUser.uid
            });
            return { success: true };
        } catch (error) {
            console.error('Error rejecting content:', error);
            return { success: false, error: error.message };
        }
    }
}

// تهيئة مدير قاعدة البيانات
const dbManager = new DatabaseManager();