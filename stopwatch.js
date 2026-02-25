        class Stopwatch {
            constructor() {
                this.isRunning = false;
                this.isPaused = false;
                this.startTime = 0;
                this.elapsedTime = 0;
                this.pausedTime = 0;
                this.laps = [];
                this.lastLapTime = 0;
                this.intervalId = null;
                
                this.initElements();
                this.initEventListeners();
            }

            initElements() {
                // Time display elements
                this.hoursEl = document.getElementById('hours');
                this.minutesEl = document.getElementById('minutes');
                this.secondsEl = document.getElementById('seconds');
                this.millisecondsEl = document.getElementById('milliseconds');

                // Button elements
                this.startBtn = document.getElementById('startBtn');
                this.lapBtn = document.getElementById('lapBtn');
                this.resetBtn = document.getElementById('resetBtn');

                // Other elements
                this.lapList = document.getElementById('lapList');
                this.stopwatchIcon = document.getElementById('stopwatchIcon');
                this.statsContainer = document.getElementById('statsContainer');
                this.totalLapsEl = document.getElementById('totalLaps');
                this.avgLapEl = document.getElementById('avgLap');
            }

            initEventListeners() {
                // Button click events
                this.startBtn.addEventListener('click', () => this.toggleStartPause());
                this.lapBtn.addEventListener('click', () => this.recordLap());
                this.resetBtn.addEventListener('click', () => this.reset());

                // Keyboard events
                document.addEventListener('keydown', (e) => {
                    if (e.code === 'Space') {
                        e.preventDefault();
                        this.toggleStartPause();
                    } else if (e.key.toLowerCase() === 'l' && this.isRunning) {
                        e.preventDefault();
                        this.recordLap();
                    } else if (e.key.toLowerCase() === 'r') {
                        e.preventDefault();
                        this.reset();
                    }
                });
            }

            toggleStartPause() {
                if (!this.isRunning) {
                    this.start();
                } else {
                    this.pause();
                }
            }

            start() {
                if (!this.isRunning) {
                    this.isRunning = true;
                    this.startTime = Date.now() - this.elapsedTime;
                    this.intervalId = setInterval(() => this.updateDisplay(), 10);
                    
                    this.startBtn.textContent = 'Pause';
                    this.startBtn.classList.remove('start-btn');
                    this.startBtn.classList.add('pause-btn');
                    this.lapBtn.disabled = false;
                    this.stopwatchIcon.classList.add('running');
                }
            }

            pause() {
                if (this.isRunning) {
                    this.isRunning = false;
                    clearInterval(this.intervalId);
                    
                    this.startBtn.textContent = 'Resume';
                    this.startBtn.classList.remove('pause-btn');
                    this.startBtn.classList.add('start-btn');
                    this.stopwatchIcon.classList.remove('running');
                }
            }

            reset() {
                this.isRunning = false;
                this.elapsedTime = 0;
                this.laps = [];
                this.lastLapTime = 0;
                clearInterval(this.intervalId);
                
                this.updateDisplay();
                this.startBtn.textContent = 'Start';
                this.startBtn.classList.remove('pause-btn');
                this.startBtn.classList.add('start-btn');
                this.lapBtn.disabled = true;
                this.stopwatchIcon.classList.remove('running');
                
                this.lapList.innerHTML = '<div class="no-laps">No laps recorded yet</div>';
                this.statsContainer.style.display = 'none';
            }

            updateDisplay() {
                this.elapsedTime = Date.now() - this.startTime;
                
                const time = this.formatTime(this.elapsedTime);
                this.hoursEl.textContent = time.hours;
                this.minutesEl.textContent = time.minutes;
                this.secondsEl.textContent = time.seconds;
                this.millisecondsEl.textContent = time.milliseconds;
            }

            formatTime(ms) {
                const totalSeconds = Math.floor(ms / 1000);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                const milliseconds = Math.floor((ms % 1000) / 10);

                return {
                    hours: String(hours).padStart(2, '0'),
                    minutes: String(minutes).padStart(2, '0'),
                    seconds: String(seconds).padStart(2, '0'),
                    milliseconds: String(milliseconds).padStart(2, '0')
                };
            }

            formatTimeString(ms) {
                const time = this.formatTime(ms);
                if (parseInt(time.hours) > 0) {
                    return `${time.hours}:${time.minutes}:${time.seconds}.${time.milliseconds}`;
                }
                return `${time.minutes}:${time.seconds}.${time.milliseconds}`;
            }

            recordLap() {
                if (!this.isRunning) return;

                const lapTime = this.elapsedTime - this.lastLapTime;
                this.lastLapTime = this.elapsedTime;

                this.laps.push({
                    number: this.laps.length + 1,
                    time: lapTime,
                    totalTime: this.elapsedTime
                });

                this.displayLaps();
                this.updateStats();
            }

            displayLaps() {
                if (this.laps.length === 0) return;

                // Find fastest and slowest laps
                const times = this.laps.map(lap => lap.time);
                const fastest = Math.min(...times);
                const slowest = Math.max(...times);

                this.lapList.innerHTML = '';
                
                // Display laps in reverse order (newest first)
                [...this.laps].reverse().forEach(lap => {
                    const li = document.createElement('li');
                    li.className = 'lap-item';
                    
                    if (this.laps.length > 1) {
                        if (lap.time === fastest) {
                            li.classList.add('fastest-lap');
                        } else if (lap.time === slowest) {
                            li.classList.add('slowest-lap');
                        }
                    }

                    // Calculate difference from previous lap
                    let diffHtml = '';
                    if (lap.number > 1) {
                        const prevLap = this.laps[lap.number - 2];
                        const diff = lap.time - prevLap.time;
                        const diffStr = this.formatTimeString(Math.abs(diff));
                        const sign = diff > 0 ? '+' : '-';
                        diffHtml = `<div class="lap-diff">${sign}${diffStr}</div>`;
                    }

                    li.innerHTML = `
                        <span class="lap-number">Lap ${lap.number}</span>
                        <div style="text-align: right;">
                            <div class="lap-time">${this.formatTimeString(lap.time)}</div>
                            ${diffHtml}
                        </div>
                    `;
                    
                    this.lapList.appendChild(li);
                });
            }

            updateStats() {
                if (this.laps.length === 0) {
                    this.statsContainer.style.display = 'none';
                    return;
                }

                this.statsContainer.style.display = 'grid';
                
                // Total laps
                this.totalLapsEl.textContent = this.laps.length;

                // Average lap time
                const totalLapTime = this.laps.reduce((sum, lap) => sum + lap.time, 0);
                const avgTime = totalLapTime / this.laps.length;
                this.avgLapEl.textContent = this.formatTimeString(avgTime);
            }
        }

        // Initialize stopwatch
        const stopwatch = new Stopwatch();

        // Console message
        console.log('%c Stopwatch Web Application ', 'background: #00f2ff; color: #000; font-size: 20px; font-weight: bold; padding: 10px;');
        console.log('%c Built with vanilla JavaScript ', 'background: #16213e; color: #00f2ff; font-size: 14px; padding: 5px;');
        console.log('Features: Start/Pause, Lap Tracking, Reset, Keyboard Controls, Statistics');