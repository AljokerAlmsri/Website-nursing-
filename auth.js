// إدارة المصادقة والمستخدمين
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // الاستماع لتغير حالة المستخدم
        auth.onAuthStateChanged(user => {
            if (user) {
                this.currentUser = user;
                this.getUserData(user.uid);
            } else {
                this.currentUser = null;
                updateAuthUI();
            }
        });
    }

    // تسجيل مستخدم جديد
    async register(userData) {
        try {
            const { email, password, name, governorate, university, college, year, profileImage } = userData;
            
            // إنشاء المستخدم في Firebase Auth
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // حفظ بيانات المستخدم في Firestore
            await db.collection('users').doc(user.uid).set({
                name,
                email,
                governorate,
                university,
                college,
                year,
                profileImage: profileImage || '',
                role: 'user',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true, user };
        } catch (error) {
            console.error('Error registering user:', error);
            return { success: false, error: error.message };
        }
    }

    // تسجيل الدخول
    async login(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Error logging in:', error);
            return { success: false, error: error.message };
        }
    }

    // تسجيل الخروج
    async logout() {
        try {
            await auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('Error logging out:', error);
            return { success: false, error: error.message };
        }
    }

    // الحصول على بيانات المستخدم
    async getUserData(uid) {
        try {
            const userDoc = await db.collection('users').doc(uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                this.currentUser = { ...this.currentUser, ...userData };
                updateAuthUI();
                return userData;
            }
            return null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }

    // تحديث بيانات المستخدم
    async updateUserProfile(uid, updates) {
        try {
            await db.collection('users').doc(uid).update(updates);
            return { success: true };
        } catch (error) {
            console.error('Error updating user profile:', error);
            return { success: false, error: error.message };
        }
    }

    // التحقق من صلاحيات الأدمن
    async isAdmin(uid) {
        try {
            const userDoc = await db.collection('users').doc(uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                return userData.role === 'admin';
            }
            return false;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }
}

// تهيئة مدير المصادقة
const authManager = new AuthManager();

// تحديث واجهة المستخدم بناءً على حالة المصادقة
function updateAuthUI() {
    const authLinks = document.getElementById('authLinks');
    const userMenu = document.getElementById('userMenu');
    const adminMenu = document.getElementById('adminMenu');

    if (authManager.currentUser) {
        if (authLinks) authLinks.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        
        // التحقق من صلاحيات الأدمن
        authManager.isAdmin(authManager.currentUser.uid).then(isAdmin => {
            if (adminMenu) adminMenu.style.display = isAdmin ? 'block' : 'none';
        });
    } else {
        if (authLinks) authLinks.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
        if (adminMenu) adminMenu.style.display = 'none';
    }
}