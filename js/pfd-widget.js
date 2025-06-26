class WASAPFDWidget {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // フライトデータ
        this.roll = 0.0;
        this.pitch = 0.0;
        this.altitude = 0.0;
        this.airspeed = 0.0;
        this.heading = 0.0;
        this.verticalSpeed = 0.0;
        this.turnRate = 0.0;
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 初期描画
        this.render();
    }
    
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    
    updateData(roll, pitch, altitude, airspeed, heading, verticalSpeed = 0.0, turnRate = 0.0) {
        this.roll = roll;
        this.pitch = pitch;
        this.altitude = altitude;
        this.airspeed = airspeed;
        this.heading = heading;
        this.verticalSpeed = verticalSpeed;
        this.turnRate = turnRate;
        this.render();
    }
    
    render() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // 背景を灰色に塗りつぶし
        this.ctx.fillStyle = '#505050';
        this.ctx.fillRect(0, 0, width, height);
        
        const centerX = width / 2;
        const centerY = height / 2;
        const pfdSize = Math.min(width, height) * 0.65 * 1.2; // サイズを65%から1.2倍に調整
        const adjustedCenterY = pfdSize / 2 + 10; // 上部ぎりぎりに配置
        
        // --- 人工水平儀（中央四角） ---
        this.drawAttitudeIndicatorBoxed(centerX, adjustedCenterY, pfdSize);
        
        // --- 速度テープ（左） ---
        const tapeW = width / 7 * 1.2; // テープ幅も1.2倍に調整
        const tapeH = pfdSize; // 高さも人工水平儀に合わせる
        const tapeY = adjustedCenterY - tapeH / 2;
        
        this.drawTapeIndicator(
            centerX - pfdSize / 2 - tapeW - 10,
            tapeY,
            tapeW,
            tapeH,
            this.airspeed,
            0, 10, 1,
            'SPD',
            '#00ff00'
        );
        
        // --- 高度テープ（右） ---
        this.drawTapeIndicator(
            centerX + pfdSize / 2 + 10,
            tapeY,
            tapeW,
            tapeH,
            this.altitude,
            0, 15, 1,
            'ALT',
            '#00ffff'
        );
        
        // --- 方位インジケータ（下部円弧）- 重なりを防ぎつつ表示を確保 ---
        const headingArcY = height + (pfdSize / 3); // 少し上に調整して表示を確保
        this.drawHeadingArc(centerX, headingArcY, pfdSize / 2);
    }
    
    // テープ型インジケーター描画
    drawTapeIndicator(x, y, w, h, value, minValue, maxValue, step, label, color) {
        this.ctx.save();
        
        // 枠
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(x, y, w, h);
        this.ctx.strokeRect(x, y, w, h);
        
        // テープ目盛
        const center = y + h / 2;
        
        for (let i = -5; i <= 5; i++) {
            const v = Math.round(value + i * step);
            if (minValue <= v && v <= maxValue) {
                const yPos = center - (v - value) * (h / 10 / step);
                if (y <= yPos && yPos <= y + h) {
                    this.ctx.strokeStyle = '#c8c8c8';
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + 5, yPos);
                    this.ctx.lineTo(x + w - 5, yPos);
                    this.ctx.stroke();
                    
                    this.ctx.fillStyle = '#c8c8c8';
                    this.ctx.font = '10px Arial';
                    this.ctx.fillText(v.toString(), x + 8, yPos - 2);
                }
            }
        }
        
        // 現在値表示
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x, center - 18, w, 36);
        this.ctx.strokeRect(x, center - 18, w, 36);
        
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillText(value.toFixed(1), x + 10, center + 6);
        
        // ラベル
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.fillText(label, x + 5, y + 15);
        
        this.ctx.restore();
    }
    
    // 方位円弧描画
    drawHeadingArc(x, y, radius) {
        this.ctx.save();
        
        const arcSpan = 180; // degree
        const arcColor = '#ffffff';
        
        // 背景を黒で塗りつぶし
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 円弧
        this.ctx.strokeStyle = arcColor;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, Math.PI * (90 - arcSpan/2) / 180, Math.PI * (90 + arcSpan/2) / 180);
        this.ctx.stroke();
        
        // 目盛
        for (let i = -arcSpan/2; i <= arcSpan/2; i += 10) {
            const angle = (this.heading + i) % 360;
            const rad = Math.PI * (90 - i) / 180;
            const x1 = x + (radius - 5) * Math.cos(rad);
            const y1 = y - (radius - 5) * Math.sin(rad);
            const x2 = x + radius * Math.cos(rad);
            const y2 = y - radius * Math.sin(rad);
            
            this.ctx.strokeStyle = arcColor;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            
            if (i % 30 === 0) {
                const label = Math.round(angle).toString();
                const lx = x + (radius - 25) * Math.cos(rad);
                const ly = y - (radius - 25) * Math.sin(rad);
                this.ctx.fillStyle = arcColor;
                this.ctx.font = '10px Arial';
                this.ctx.fillText(label, lx - 10, ly + 5);
            }
        }
        
        // 現在方位三角
        this.ctx.fillStyle = arcColor;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - radius - 10);
        this.ctx.lineTo(x - 10, y - radius + 10);
        this.ctx.lineTo(x + 10, y - radius + 10);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    // 四角形クリッピング人工水平儀描画
    drawAttitudeIndicatorBoxed(x, y, size) {
        this.ctx.save();
        
        // 四角形クリッピング
        const rect = {
            x: x - size/2,
            y: y - size/2,
            width: size,
            height: size
        };
        
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
        this.ctx.clip();
        
        // 地平線の描画
        this.ctx.translate(x, y);
        this.ctx.rotate(this.roll * Math.PI / 180);
        
        const pitchOffset = this.pitch * (size/2) / 45.0;
        this.ctx.translate(0, pitchOffset); // ピッチ分だけ上下に平行移動
        
        // 上部（空）
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(-size/2, -size, size, size);
        
        // 下部（地面）
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(-size/2, 0, size, size);
        
        // 地平線
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(-size/2, 0);
        this.ctx.lineTo(size/2, 0);
        this.ctx.stroke();
        
        // ピッチマーカー
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = '#ffffff';
        
        for (let i = -4; i <= 4; i++) {
            if (i === 0) continue;
            
            const yPos = i * (size/2) / 4.0;
            if (-size/2 < yPos && yPos < size/2) {
                const length = Math.abs(i) % 2 === 0 ? 40 : 20;
                this.ctx.beginPath();
                this.ctx.moveTo(-length, yPos);
                this.ctx.lineTo(length, yPos);
                this.ctx.stroke();
                
                if (Math.abs(i) % 2 === 0) {
                    this.ctx.fillText((Math.abs(i) * 10).toString(), length + 5, yPos + 5);
                }
            }
        }
        
        this.ctx.restore();
        
        // 外枠
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        
        // 航空機シンボル
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 20, y);
        this.ctx.lineTo(x + 20, y);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 20);
        this.ctx.lineTo(x, y + 20);
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
} 