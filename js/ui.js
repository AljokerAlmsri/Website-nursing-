// إدارة واجهة المستخدم
class UIManager {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        // القائمة المتنقلة للهواتف
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // إغلاق القائمة عند النقر على رابط
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // إظهار رسالة للمستخدم
    showMessage(message, type = 'info') {
        // إزالة أي رسالة سابقة
        this.removeMessage();

        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;

        // إضافة أنماط CSS للرسالة
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            z-index: 10000;
            font-weight: bold;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        // تخصيص الألوان حسب نوع الرسالة
        switch (type) {
            case 'success':
                messageDiv.style.backgroundColor = '#4caf50';
                break;
            case 'error':
                messageDiv.style.backgroundColor = '#f44336';
                break;
            case 'warning':
                messageDiv.style.backgroundColor = '#ff9800';
                break;
            default:
                messageDiv.style.backgroundColor = '#2196f3';
        }

        document.body.appendChild(messageDiv);

        // إزالة الرسالة تلقائياً بعد 5 ثواني
        setTimeout(() => {
            this.removeMessage();
        }, 5000);
    }

    // إزالة الرسالة
    removeMessage() {
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    // تحميل المحافظات والجامعات والكليات (بيانات وهمية للتوضيح)
    loadGovernorates(selectElement) {
        const governorates = [
            'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية',
            'الغربية', 'المنوفية', 'القليوبية', 'كفر الشيخ', 'الفيوم',
            'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان'
        ];

        governorates.forEach(gov => {
            const option = document.createElement('option');
            option.value = gov;
            option.textContent = gov;
            selectElement.appendChild(option);
        });
    }

    loadUniversities(selectElement, governorate) {
        // مسح الخيارات الحالية
        selectElement.innerHTML = '<option value="">اختر الجامعة</option>';

        // بيانات وهمية للجامعات حسب المحافظة
        const universities = {
            'القاهرة': ['جامعة القاهرة', 'جامعة عين شمس', 'جامعة حلوان'],
            'الجيزة': ['جامعة القاهرة', 'جامعة الأزهر'],
            'الإسكندرية': ['جامعة الإسكندرية'],
            // ... إضافة باقي المحافظات
        };

        const govUniversities = universities[governorate] || ['جامعة الإسكندرية'];
        govUniversities.forEach(univ => {
            const option = document.createElement('option');
            option.value = univ;
            option.textContent = univ;
            selectElement.appendChild(option);
        });
    }

    loadColleges(selectElement, university) {
        // مسح الخيارات الحالية
        selectElement.innerHTML = '<option value="">اختر الكلية</option>';

        // كليات التمريض في الجامعات المصرية
        const colleges = ['كلية التمريض'];
        
        colleges.forEach(college => {
            const option = document.createElement('option');
            option.value = college;
            option.textContent = college;
            selectElement.appendChild(option);
        });
    }

    loadYears(selectElement) {
        const years = ['الفرقة الأولى', 'الفرقة الثانية', 'الفرقة الثالثة', 'الفرقة الرابعة'];
        
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            selectElement.appendChild(option);
        });
    }

    // رفع صورة الملف الشخصي
    async uploadProfileImage(file) {
        try {
            // في بيئة الإنتاج، استخدم GitHub API أو Firebase Storage
            // هذا مثال باستخدام GitHub API
            const path = `profile-images/${Date.now()}-${file.name}`;
            const result = await contentManager.githubAPI.uploadFile(file, path);
            
            if (result.success) {
                return result.url;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error uploading profile image:', error);
            throw error;
        }
    }
}

// تهيئة مدير واجهة المستخدم
const uiManager = new UIManager();