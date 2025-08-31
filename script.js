

class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.moves = 0;
        this.score = 0;
        this.gameStarted = false;
        this.timer = null;
        this.startTime = 0;
        this.currentTime = 0;
        this.soundEnabled = true;
        this.achievements = [];
        this.particles = [];
        
        this.symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜'];
        
        this.difficultySettings = {
            easy: { rows: 4, cols: 4, symbols: 8 },
            medium: { rows: 6, cols: 6, symbols: 18 },
            hard: { rows: 8, cols: 8, symbols: 32 }
        };
        
        this.achievementList = [
            { id: 'first_win', name: 'الفوز الأول', description: 'فزت لأول مرة', unlocked: false },
            { id: 'speed_demon', name: 'سريع كالبرق', description: 'أكمل اللعبة في أقل من دقيقة', unlocked: false },
            { id: 'perfect_match', name: 'تطابق مثالي', description: 'أكمل اللعبة بدون أخطاء', unlocked: false },
            { id: 'memory_master', name: 'سيد الذاكرة', description: 'فزت في المستوى الصعب', unlocked: false },
            { id: 'persistent', name: 'مثابر', description: 'لعبت 10 مرات', unlocked: false }
        ];
        
        this.currentDifficulty = 'medium';
        this.initializeGame();
        this.setupEventListeners();
        this.createParticles();
        this.loadAchievements();
    }
    
    initializeGame() {
        this.updateDisplay();
        this.createBoard();
        this.updateProgressBar();
    }
    
    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.currentDifficulty = e.target.value;
            this.resetGame();
        });
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('shareBtn').addEventListener('click', () => this.shareResult());
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundBtn = document.getElementById('soundToggle');
        soundBtn.textContent = this.soundEnabled ? '🔊' : '🔇';
        soundBtn.style.background = this.soundEnabled ? 
            'linear-gradient(45deg, #f39c12, #e67e22)' : 
            'linear-gradient(45deg, #95a5a6, #7f8c8d)';
    }
    
    playSound(soundId) {
        if (this.soundEnabled) {
            const audio = document.getElementById(soundId);
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(e => console.log('Audio play failed:', e));
            }
        }
    }
    
    createParticles() {
        const particlesContainer = document.getElementById('particles');
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 3 + 's';
            particle.style.animationDuration = (Math.random() * 2 + 2) + 's';
            particlesContainer.appendChild(particle);
        }
    }
    
    startGame() {
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.startTime = Date.now();
            this.startTimer();
            const startBtn = document.getElementById('startBtn');
            startBtn.textContent = '🎮 اللعبة جارية...';
            startBtn.disabled = true;
            startBtn.classList.remove('animate__pulse', 'animate__infinite');
        }
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.currentTime = Date.now() - this.startTime;
            this.updateTimer();
        }, 1000);
    }
    
    updateTimer() {
        const minutes = Math.floor(this.currentTime / 60000);
        const seconds = Math.floor((this.currentTime % 60000) / 1000);
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateProgressBar() {
        const progress = (this.matchedPairs / this.totalPairs) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
    }
    
    createBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        const settings = this.difficultySettings[this.currentDifficulty];
        this.totalPairs = settings.symbols;
        
        // إنشاء مصفوفة البطاقات
        const selectedSymbols = this.symbols.slice(0, settings.symbols);
        this.cards = [...selectedSymbols, ...selectedSymbols];
        this.shuffleArray(this.cards);
        
        // تعيين تخطيط الشبكة
        gameBoard.style.gridTemplateColumns = `repeat(${settings.cols}, 1fr)`;
        gameBoard.style.gridTemplateRows = `repeat(${settings.rows}, 1fr)`;
        
        // إنشاء البطاقات
        this.cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'card hidden animate__animated animate__fadeIn';
            card.style.animationDelay = (index * 0.1) + 's';
            card.dataset.symbol = symbol;
            card.dataset.index = index;
            card.textContent = '?';
            
            card.addEventListener('click', () => this.flipCard(card));
            gameBoard.appendChild(card);
        });
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    flipCard(card) {
        if (!this.gameStarted) {
            this.startGame();
        }
        
        // منع قلب البطاقة إذا كانت مكشوفة أو متطابقة
        if (card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }
        
        // منع قلب أكثر من بطاقتين في نفس الوقت
        if (this.flippedCards.length >= 2) {
            return;
        }
        
        // قلب البطاقة
        card.classList.remove('hidden');
        card.classList.add('flipped', 'flipping');
        card.textContent = card.dataset.symbol;
        this.flippedCards.push(card);
        
        this.playSound('flipSound');
        
        // إزالة تأثير القلب بعد انتهاء الحركة
        setTimeout(() => {
            card.classList.remove('flipping');
        }, 300);
        
        // فحص التطابق عند قلب بطاقتين
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateDisplay();
            this.updateProgressBar();
            this.checkMatch();
        }
    }
    
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const match = card1.dataset.symbol === card2.dataset.symbol;
        
        setTimeout(() => {
            if (match) {
                // تطابق صحيح
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                card1.classList.add('matched');
                card2.classList.add('matched');
                
                this.matchedPairs++;
                this.score += 20;
                this.showMessage('تطابق صحيح! 🎉', 'success');
                this.playSound('matchSound');
                this.createConfetti();
                
                // فحص انتهاء اللعبة
                if (this.matchedPairs === this.totalPairs) {
                    this.gameWon();
                }
            } else {
                // تطابق خاطئ
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                card1.classList.add('hidden');
                card2.classList.add('hidden');
                card1.textContent = '?';
                card2.textContent = '?';
                
                this.score = Math.max(0, this.score - 5);
                this.showMessage('حاول مرة أخرى! 💪', 'error');
            }
            
            this.flippedCards = [];
            this.updateDisplay();
        }, 1000);
    }
    
    createConfetti() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.left = Math.random() * window.innerWidth + 'px';
                confetti.style.top = '-10px';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.background = ['#ff6b6b', '#4ecdc4', '#f39c12', '#667eea'][Math.floor(Math.random() * 4)];
                confetti.style.borderRadius = '50%';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '9999';
                confetti.style.animation = 'fall 3s linear forwards';
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 3000);
            }, i * 50);
        }
    }
    
    showMessage(text, type) {
        const message = document.getElementById('message');
        message.textContent = text;
        message.className = `message ${type}`;
        
        setTimeout(() => {
            message.style.display = 'none';
        }, 2000);
    }
    
    gameWon() {
        clearInterval(this.timer);
        
        // حساب النقاط النهائية
        const timeBonus = Math.max(0, 100 - Math.floor(this.currentTime / 1000));
        this.score += timeBonus;
        
        // عرض النتائج النهائية
        document.getElementById('finalTime').textContent = document.getElementById('timer').textContent;
        document.getElementById('finalMoves').textContent = this.moves;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalDifficulty').textContent = this.getDifficultyName();
        
        // إضافة النجوم
        this.addStars();
        
        // عرض نافذة الفوز
        document.getElementById('winModal').style.display = 'flex';
        
        this.playSound('winSound');
        this.createConfetti();
        
        // حفظ أعلى نتيجة
        this.saveHighScore();
        
        // فحص الإنجازات
        this.checkAchievements();
    }
    
    addStars() {
        const starsContainer = document.getElementById('starsContainer');
        starsContainer.innerHTML = '';
        
        const starCount = this.calculateStars();
        
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('div');
            star.className = `star ${i < starCount ? 'filled' : ''}`;
            star.textContent = '⭐';
            star.style.animationDelay = (i * 0.2) + 's';
            starsContainer.appendChild(star);
        }
    }
    
    calculateStars() {
        const timeScore = Math.max(0, 5 - Math.floor(this.currentTime / 60000));
        const moveScore = Math.max(0, 5 - Math.floor(this.moves / 10));
        const difficultyBonus = this.currentDifficulty === 'hard' ? 1 : 0;
        
        return Math.min(5, Math.floor((timeScore + moveScore) / 2) + difficultyBonus);
    }
    
    getDifficultyName() {
        const names = {
            easy: 'سهل',
            medium: 'متوسط',
            hard: 'صعب'
        };
        return names[this.currentDifficulty] || 'متوسط';
    }
    
    checkAchievements() {
        const gameStats = JSON.parse(localStorage.getItem('gameStats') || '{}');
        const totalGames = (gameStats.totalGames || 0) + 1;
        const totalWins = (gameStats.totalWins || 0) + 1;
        
        // تحديث الإحصائيات
        gameStats.totalGames = totalGames;
        gameStats.totalWins = totalWins;
        localStorage.setItem('gameStats', JSON.stringify(gameStats));
        
        // فحص الإنجازات
        if (totalWins === 1) this.unlockAchievement('first_win');
        if (this.currentTime < 60000) this.unlockAchievement('speed_demon');
        if (this.score === this.totalPairs * 20) this.unlockAchievement('perfect_match');
        if (this.currentDifficulty === 'hard') this.unlockAchievement('memory_master');
        if (totalGames >= 10) this.unlockAchievement('persistent');
    }
    
    unlockAchievement(achievementId) {
        const achievement = this.achievementList.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.saveAchievements();
            this.showMessage(`🏆 إنجاز جديد: ${achievement.name}!`, 'success');
            this.updateAchievementDisplay();
        }
    }
    
    loadAchievements() {
        const saved = localStorage.getItem('achievements');
        if (saved) {
            const savedAchievements = JSON.parse(saved);
            this.achievementList.forEach(achievement => {
                const saved = savedAchievements.find(a => a.id === achievement.id);
                if (saved) achievement.unlocked = saved.unlocked;
            });
        }
        this.updateAchievementDisplay();
    }
    
    saveAchievements() {
        localStorage.setItem('achievements', JSON.stringify(this.achievementList));
    }
    
    updateAchievementDisplay() {
        const achievementList = document.getElementById('achievementList');
        achievementList.innerHTML = '';
        
        this.achievementList.forEach(achievement => {
            const div = document.createElement('div');
            div.className = `achievement ${achievement.unlocked ? 'unlocked' : ''}`;
            div.textContent = achievement.name;
            div.title = achievement.description;
            achievementList.appendChild(div);
        });
    }
    
    shareResult() {
        const text = `🎉 فزت في لعبة الذكاء!\n⭐ النقاط: ${this.score}\n⏱️ الوقت: ${document.getElementById('timer').textContent}\n🔄 الحركات: ${this.moves}\n🏆 المستوى: ${this.getDifficultyName()}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'نتيجة لعبة الذكاء',
                text: text
            });
        } else {
            // نسخ إلى الحافظة
            navigator.clipboard.writeText(text).then(() => {
                this.showMessage('تم نسخ النتيجة! 📋', 'success');
            });
        }
    }
    
    saveHighScore() {
        const highScores = JSON.parse(localStorage.getItem('memoryHighScores') || '[]');
        const newScore = {
            score: this.score,
            moves: this.moves,
            time: this.currentTime,
            difficulty: this.currentDifficulty,
            date: new Date().toLocaleDateString('ar-SA')
        };
        
        highScores.push(newScore);
        highScores.sort((a, b) => b.score - a.score);
        
        // الاحتفاظ بأعلى 10 نتائج فقط
        highScores.splice(10);
        
        localStorage.setItem('memoryHighScores', JSON.stringify(highScores));
    }
    
    resetGame() {
        // إيقاف المؤقت
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // إعادة تعيين المتغيرات
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.moves = 0;
        this.score = 0;
        this.gameStarted = false;
        this.startTime = 0;
        this.currentTime = 0;
        
        // إعادة تعيين الواجهة
        const startBtn = document.getElementById('startBtn');
        startBtn.textContent = '🎮 ابدأ اللعبة';
        startBtn.disabled = false;
        startBtn.classList.add('animate__pulse', 'animate__infinite');
        document.getElementById('timer').textContent = '00:00';
        document.getElementById('winModal').style.display = 'none';
        document.getElementById('message').style.display = 'none';
        
        // إعادة إنشاء اللوحة
        this.createBoard();
        this.updateDisplay();
        this.updateProgressBar();
    }
    
    updateDisplay() {
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('score').textContent = this.score;
    }
}

// إضافة CSS للجزيئات المتساقطة
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// بدء اللعبة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
