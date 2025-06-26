class WASADataManager {
    constructor() {
        // フライトデータ
        this.data = {
            // 基本データ
            date: "-",
            time: "-",
            latitude: 0,
            longitude: 0,
            altitude: 0,
            rpm: 0,
            
            // 速度・方位データ
            tacho: 0,           // 対気速度
            groundSpeed: 0,     // 対地速度
            gpsAltitude: 0,     // GPS高度
            gpsCourse: 0,       // GPS方位
            temperature: 0,     // 温度
            
            // 制御面データ
            elevatorAngle: 0,   // 水平舵角
            rudderAngle: 0,     // 垂直舵角
            rudderTrim: 0,      // トリム
            
            // 姿勢データ
            roll: 0,
            pitch: 0,
            yaw: 0,
            ROLL: 0,            // 調整済みロール
            PITCH: 0,           // 調整済みピッチ
            YAW: 0              // 調整済みヨー
        };
        
        // メモリ値（姿勢補正用）
        this.memoryRoll = 0;
        this.memoryPitch = 0;
        this.memoryYaw = 0;
        
        // データ履歴（グラフ用）
        this.historyLength = 20; // 20秒分
        this.altitudeHist = [];
        this.rpmHist = [];
        this.tasHist = [];       // 対気速度履歴
        this.groundHist = [];    // 対地速度履歴
        this.rollHist = [];
        this.pitchHist = [];
        
        // タイマー
        this.awsTimer = null;
        this.amedasTimer = null;
        
        // イベントハンドラー
        this.onDataUpdate = null;
        this.onError = null;
        
        // AWS API URL
        this.awsApiUrl = "https://62u95gbc60.execute-api.us-east-1.amazonaws.com/test/items/hpa/latest";
        
        // リクエスト状態
        this.isUpdating = false;
    }
    
    // 初期化
    init() {
        console.log('WASADataManager: 初期化中...');
        this.startTimers();
    }
    
    // タイマー開始
    startTimers() {
        // AWS APIタイマー（1秒間隔）
        this.awsTimer = setInterval(() => {
            this.updateAWSData();
        }, 1000);
        
        // アメダスタイマー（1分間隔）
        this.amedasTimer = setInterval(() => {
            this.updateAmedasData();
        }, 60000);
        
        // 初回データ取得
        this.updateAWSData();
    }
    
    // タイマー停止
    stopTimers() {
        if (this.awsTimer) {
            clearInterval(this.awsTimer);
            this.awsTimer = null;
        }
        if (this.amedasTimer) {
            clearInterval(this.amedasTimer);
            this.amedasTimer = null;
        }
    }
    
    // AWS APIからデータ取得・更新
    async updateAWSData() {
        if (this.isUpdating) return;
        
        this.isUpdating = true;
        
        try {
            const response = await fetch(this.awsApiUrl, {
                method: 'GET',
                timeout: 5000
            });
            
            if (response.ok) {
                const data = await response.json();
                this.processAWSData(data);
            } else {
                console.warn('AWS API エラー:', response.status);
                this.fallbackToSimulation();
            }
        } catch (error) {
            console.warn('AWS API接続エラー:', error);
            this.fallbackToSimulation();
        } finally {
            this.isUpdating = false;
        }
    }
    
    // AWS APIデータ処理
    processAWSData(apiData) {
        // データ更新
        this.data.latitude = parseFloat(apiData.Latitude || 0);
        this.data.longitude = parseFloat(apiData.Longitude || 0);
        this.data.gpsAltitude = parseFloat(apiData.GPSAltitude || 0);
        this.data.gpsCourse = parseFloat(apiData.GPSCourse || 0);
        this.data.groundSpeed = parseFloat(apiData.GPSSpeed || 0);
        this.data.tacho = parseFloat(apiData.AirSpeed || 0);
        this.data.rpm = parseInt(apiData.PropellerRotationSpeed || 0);
        this.data.yaw = parseFloat(apiData.Yaw_Mad6 || 0);
        this.data.temperature = parseFloat(apiData.Temperature || 0);
        this.data.elevatorAngle = parseFloat(apiData.Elevator || 0);
        this.data.rudderAngle = parseFloat(apiData.Rudder || 0);
        this.data.rudderTrim = parseFloat(apiData.Trim || 0);
        
        // 日時データ
        this.data.date = apiData.Date || "-";
        this.data.time = apiData.Time || "-";
        
        // 姿勢データ計算（メモリ値による補正）
        this.data.ROLL = this.data.roll - this.memoryRoll;
        this.data.PITCH = this.data.pitch - this.memoryPitch;
        this.data.YAW = this.data.yaw - this.memoryYaw;
        
        // 履歴に追加
        this.addToHistory();
        
        // UIに通知
        if (this.onDataUpdate) {
            this.onDataUpdate(this.data);
        }
    }
    
    // シミュレーションデータ生成（API接続できない場合）
    fallbackToSimulation() {
        const time = Date.now() / 1000;
        
        // フジ川の座標範囲でシミュレーション
        const fuzigawa = {
            lat_min: 35.1172,
            lat_max: 35.1247,
            lon_min: 138.6284,
            lon_max: 138.6353
        };
        
        // ランダムデータ生成
        this.data.altitude = Math.random() * 10;
        this.data.tacho = Math.random() * 10;
        this.data.roll = (Math.random() - 0.5) * 10;
        this.data.pitch = (Math.random() - 0.5) * 10;
        this.data.latitude = fuzigawa.lat_min + Math.random() * (fuzigawa.lat_max - fuzigawa.lat_min);
        this.data.longitude = fuzigawa.lon_min + Math.random() * (fuzigawa.lon_max - fuzigawa.lon_min);
        this.data.rpm = Math.floor(Math.random() * 200);
        this.data.groundSpeed = Math.random() * 10;
        this.data.gpsAltitude = Math.random() * 100;
        this.data.gpsCourse = Math.random() * 360;
        this.data.temperature = 20 + Math.random() * 10;
        this.data.elevatorAngle = (Math.random() - 0.5) * 20;
        this.data.rudderAngle = (Math.random() - 0.5) * 20;
        this.data.rudderTrim = (Math.random() - 0.5) * 10;
        this.data.yaw = Math.random() * 360;
        
        // 姿勢データ計算
        this.data.ROLL = this.data.roll - this.memoryRoll;
        this.data.PITCH = this.data.pitch - this.memoryPitch;
        this.data.YAW = this.data.yaw - this.memoryYaw;
        
        // 時刻
        const now = new Date();
        this.data.date = now.toLocaleDateString('ja-JP');
        this.data.time = now.toLocaleTimeString('ja-JP');
        
        // 履歴に追加
        this.addToHistory();
        
        // UIに通知
        if (this.onDataUpdate) {
            this.onDataUpdate(this.data);
        }
    }
    
    // データ履歴に追加
    addToHistory() {
        this.altitudeHist.push(this.data.altitude);
        this.rpmHist.push(this.data.rpm);
        this.tasHist.push(this.data.tacho);
        this.groundHist.push(this.data.groundSpeed);
        this.rollHist.push(this.data.ROLL);
        this.pitchHist.push(this.data.PITCH);
        
        // 履歴長制限
        const histories = [
            this.altitudeHist, this.rpmHist, this.tasHist,
            this.groundHist, this.rollHist, this.pitchHist
        ];
        
        histories.forEach(hist => {
            if (hist.length > this.historyLength) {
                hist.shift();
            }
        });
    }
    
    // アメダスデータ更新（風データ）
    updateAmedasData() {
        // 実装省略（元のPythonアプリではコメントアウトされている）
        console.log('アメダスデータ更新（未実装）');
    }
    
    // 現在のデータを取得
    getCurrentData() {
        return { ...this.data };
    }
    
    // グラフ用履歴データを取得
    getHistoryData() {
        const N = this.altitudeHist.length;
        const x = Array.from({length: N}, (_, i) => -(N-1-i) * 1.0);
        
        return {
            x: x,
            altitude: [...this.altitudeHist],
            rpm: [...this.rpmHist],
            tas: [...this.tasHist],
            ground: [...this.groundHist],
            roll: [...this.rollHist],
            pitch: [...this.pitchHist]
        };
    }
    
    // メモリ値リセット（姿勢ゼロリセット）
    resetMemoryValues() {
        this.memoryRoll = this.data.roll;
        this.memoryPitch = this.data.pitch;
        this.memoryYaw = this.data.yaw;
        console.log('メモリ値リセット:', {
            roll: this.memoryRoll,
            pitch: this.memoryPitch,
            yaw: this.memoryYaw
        });
    }
    
    // データ履歴クリア
    clearHistory() {
        this.altitudeHist = [];
        this.rpmHist = [];
        this.tasHist = [];
        this.groundHist = [];
        this.rollHist = [];
        this.pitchHist = [];
        console.log('データ履歴をクリアしました');
    }
    
    // 破棄
    destroy() {
        this.stopTimers();
        console.log('WASADataManager: 破棄されました');
    }
} 