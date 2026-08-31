/**
 * SAMUEL.A.I - Interactive Canvas Visualizers & Chart Renderer
 * Rumus Perpangkatan Universal 4.0
 * Author: Samuel Hasiholan Omega Purba, S. Tr. T.
 */

export class SamuelCanvasVisualizer {
    static drawRobotArm(canvas, theta1, theta2, theta3) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 25) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += 25) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }

        const baseX = width * 0.3;
        const baseY = height * 0.75;
        const scale = 0.8;

        const l1 = 80 * scale;
        const l2 = 65 * scale;
        const l3 = 45 * scale;

        const rad2 = -(theta2 * Math.PI) / 180;
        const rad3 = rad2 - (theta3 * Math.PI) / 180;

        const j1X = baseX;
        const j1Y = baseY;

        const j2X = j1X + l1 * Math.cos(rad2);
        const j2Y = j1Y + l1 * Math.sin(rad2);

        const j3X = j2X + l2 * Math.cos(rad3);
        const j3Y = j2Y + l2 * Math.sin(rad3);

        const eeX = j3X + l3 * Math.cos(rad3);
        const eeY = j3Y + l3 * Math.sin(rad3);

        ctx.fillStyle = '#334155';
        ctx.fillRect(baseX - 30, baseY, 60, 25);
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(baseX, baseY, 14, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(j1X, j1Y);
        ctx.lineTo(j2X, j2Y);
        ctx.stroke();

        ctx.fillStyle = '#0ea5e9';
        ctx.beginPath();
        ctx.arc(j2X, j2Y, 10, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(j2X, j2Y);
        ctx.lineTo(j3X, j3Y);
        ctx.stroke();

        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.arc(j3X, j3Y, 8, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(j3X, j3Y);
        ctx.lineTo(eeX, eeY);
        ctx.stroke();

        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(eeX, eeY, 6, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#f8fafc';
        ctx.font = '11px monospace';
        ctx.fillText(`EE: (${eeX.toFixed(1)}, ${eeY.toFixed(1)})`, eeX + 10, eeY - 10);
    }
}
