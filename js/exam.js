// إدارة النظام المتقدم للاختبارات
class ExamManager {
    constructor() {
        this.currentExam = null;
        this.userAnswers = [];
        this.timer = null;
        this.timeLeft = 0;
    }

    // إنشاء اختبار جديد
    async createExam(examData) {
        try {
            const examRef = await db.collection('exams').add({
                ...examData,
                status: 'active',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: authManager.currentUser.uid
            });
            return { success: true, id: examRef.id };
        } catch (error) {
            console.error('Error creating exam:', error);
            return { success: false, error: error.message };
        }
    }

    // تحميل اختبار معين
    async loadExam(examId) {
        try {
            const examDoc = await db.collection('exams').doc(examId).get();
            if (examDoc.exists) {
                return { success: true, exam: { id: examDoc.id, ...examDoc.data() } };
            } else {
                return { success: false, error: 'الاختبار غير موجود' };
            }
        } catch (error) {
            console.error('Error loading exam:', error);
            return { success: false, error: error.message };
        }
    }

    // بدء الاختبار
    startExam(exam) {
        this.currentExam = exam;
        this.userAnswers = new Array(exam.questions.length).fill(null);
        this.timeLeft = (exam.duration || 30) * 60; // تحويل إلى ثواني
        
        this.setupExamUI();
        this.startTimer();
        this.displayQuestion(0);
    }

    // إعداد واجهة الاختبار
    setupExamUI() {
        document.getElementById('examTitle').textContent = this.currentExam.title;
        document.getElementById('totalQuestions').textContent = this.currentExam.questions.length;
        
        // إخفاء العناصر غير الضرورية
        document.querySelector('.exams-page').style.display = 'none';
        document.getElementById('examContainer').style.display = 'block';
    }

    // بدء المؤقت
    startTimer() {
        this.updateTimerDisplay();
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.endExam();
            }
        }, 1000);
    }

    // تحديث عرض المؤقت
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        document.getElementById('timeRemaining').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // عرض سؤال
    displayQuestion(index) {
        if (index < 0 || index >= this.currentExam.questions.length) return;

        const question = this.currentExam.questions[index];
        document.getElementById('questionText').textContent = question.text;
        document.getElementById('currentQuestion').textContent = index + 1;

        this.displayOptions(question.options, index);
        this.updateNavigationButtons(index);
        this.updateProgressBar(index);
    }

    // عرض خيارات السؤال
    displayOptions(options, questionIndex) {
        const optionsList = document.getElementById('optionsList');
        optionsList.innerHTML = options.map((option, i) => `
            <label class="option-item">
                <input type="radio" name="answer" value="${i}" 
                    ${this.userAnswers[questionIndex] === i ? 'checked' : ''}>
                <span class="option-text">${option}</span>
            </label>
        `).join('');
    }

    // تحديث أزرار التنقل
    updateNavigationButtons(currentIndex) {
        document.getElementById('prevQuestion').style.display = currentIndex > 0 ? 'block' : 'none';
        document.getElementById('nextQuestion').style.display = currentIndex < this.currentExam.questions.length - 1 ? 'block' : 'none';
        document.getElementById('submitExam').style.display = currentIndex === this.currentExam.questions.length - 1 ? 'block' : 'none';
    }

    // تحديث شريط التقدم
    updateProgressBar(currentIndex) {
        const progress = ((currentIndex + 1) / this.currentExam.questions.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }

    // حفظ الإجابة
    saveAnswer(questionIndex) {
        const selectedOption = document.querySelector('input[name="answer"]:checked');
        if (selectedOption) {
            this.userAnswers[questionIndex] = parseInt(selectedOption.value);
        }
    }

    // إنهاء الاختبار
    async endExam() {
        clearInterval(this.timer);
        
        const score = this.calculateScore();
        const timeSpent = this.formatTimeSpent((this.currentExam.duration || 30) * 60 - this.timeLeft);

        const result = {
            examId: this.currentExam.id,
            examTitle: this.currentExam.title,
            score: score,
            totalQuestions: this.currentExam.questions.length,
            correctAnswers: Math.round(score / 100 * this.currentExam.questions.length),
            timeSpent: timeSpent,
            answers: this.userAnswers
        };

        // حفظ النتيجة
        await this.saveExamResult(result);
        
        // عرض النتيجة
        this.showResult(result);
        
        // العودة إلى صفحة الاختبارات
        this.resetExamUI();
    }

    // حساب النتيجة
    calculateScore() {
        let correct = 0;
        this.currentExam.questions.forEach((question, index) => {
            if (this.userAnswers[index] === question.correctAnswer) {
                correct++;
            }
        });
        return Math.round((correct / this.currentExam.questions.length) * 100);
    }

    // حفظ نتيجة الاختبار
    async saveExamResult(result) {
        try {
            await db.collection('examResults').add({
                userId: authManager.currentUser.uid,
                examId: this.currentExam.id,
                result: result,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error saving exam result:', error);
        }
    }

    // عرض النتيجة
    showResult(result) {
        const resultContent = document.getElementById('resultContent');
        resultContent.innerHTML = `
            <div class="result-score">
                <h3>${result.score}%</h3>
                <p>${result.correctAnswers} إجابة صحيحة من ${result.totalQuestions}</p>
            </div>
            <div class="result-details">
                <p><strong>الوقت المستغرق:</strong> ${result.timeSpent}</p>
                <p><strong>الاختبار:</strong> ${result.examTitle}</p>
                ${this.getPerformanceMessage(result.score)}
            </div>
        `;
        document.getElementById('examResultModal').style.display = 'block';
    }

    // رسالة الأداء بناءً على النتيجة
    getPerformanceMessage(score) {
        if (score >= 90) return '<p style="color: var(--secondary-color); font-weight: bold;">أداء ممتاز! 🎉</p>';
        if (score >= 75) return '<p style="color: #4caf50; font-weight: bold;">أداء جيد جداً! 👍</p>';
        if (score >= 60) return '<p style="color: #ff9800; font-weight: bold;">أداء مقبول، يمكنك التحسين! 💪</p>';
        return '<p style="color: #f44336; font-weight: bold;">يحتاج إلى مزيد من الدراسة! 📚</p>';
    }

    // إعادة تعيين واجهة الاختبار
    resetExamUI() {
        document.querySelector('.exams-page').style.display = 'block';
        document.getElementById('examContainer').style.display = 'none';
        this.currentExam = null;
        this.userAnswers = [];
    }

    // تنسيق الوقت المستغرق
    formatTimeSpent(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes} دقيقة ${remainingSeconds} ثانية`;
    }

    // الحصول على إحصائيات الاختبارات
    async getExamStats() {
        try {
            const examsSnapshot = await db.collection('exams').get();
            const resultsSnapshot = await db.collection('examResults').get();

            return {
                totalExams: examsSnapshot.size,
                totalAttempts: resultsSnapshot.size,
                averageScore: this.calculateAverageScore(resultsSnapshot)
            };
        } catch (error) {
            console.error('Error getting exam stats:', error);
            return null;
        }
    }

    // حساب متوسط النتائج
    calculateAverageScore(resultsSnapshot) {
        let totalScore = 0;
        let count = 0;

        resultsSnapshot.forEach(doc => {
            const result = doc.data();
            totalScore += result.result.score;
            count++;
        });

        return count > 0 ? Math.round(totalScore / count) : 0;
    }
}

// تهيئة مدير الاختبارات
const examManager = new ExamManager();