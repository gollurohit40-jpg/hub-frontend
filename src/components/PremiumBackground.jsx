import React, { useRef, useEffect, useState } from 'react';

const PremiumBackground = () => {
    const canvasRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;
        let time = 0;
        let particles = [];
        let stars = [];
        let constellations = [];

        // ============================================
        // PREMIUM GRADIENT CONFIG
        // ============================================
        const colors = {
            primary: '#2563eb',
            secondary: '#7c3aed',
            accent: '#ec4899',
            gold: '#f59e0b',
            cyan: '#06b6d4',
            dark: '#0a0e1e',
            dark2: '#141b2d',
            dark3: '#1a2332'
        };

        // ============================================
        // RESIZE
        // ============================================
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // ============================================
        // MOUSE TRACKING
        // ============================================
        const handleMouseMove = (e) => {
            setMousePos({
                x: e.clientX / canvas.width,
                y: e.clientY / canvas.height
            });
        };
        window.addEventListener('mousemove', handleMouseMove);

        // ============================================
        // PARTICLE CLASS (Premium)
        // ============================================
        class PremiumParticle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.6 + 0.2;
                this.color = this.getColor();
                this.pulse = Math.random() * Math.PI * 2;
                this.pulseSpeed = 0.02 + Math.random() * 0.03;
                this.type = Math.random() > 0.7 ? 'star' : 'circle';
                this.sizeMultiplier = 0.5 + Math.random() * 0.5;
            }

            getColor() {
                const colors = [
                    `hsl(217, 91%, 60%)`,
                    `hsl(271, 91%, 65%)`,
                    `hsl(330, 81%, 60%)`,
                    `hsl(43, 96%, 56%)`,
                    `hsl(189, 94%, 53%)`,
                    `hsl(0, 0%, 100%)`
                ];
                return colors[Math.floor(Math.random() * colors.length)];
            }

            update(mouseX, mouseY) {
                this.pulse += this.pulseSpeed;
                const pulseFactor = Math.sin(this.pulse) * 0.3 + 0.7;

                // Mouse interaction - particles move away from mouse
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 200;

                if (distance < maxDist && distance > 0) {
                    const force = (1 - distance / maxDist) * 2;
                    this.x -= (dx / distance) * force * 0.5;
                    this.y -= (dy / distance) * force * 0.5;
                }

                this.x += this.speedX;
                this.y += this.speedY;

                // Wrap around edges with glow
                if (this.x < -50) this.x = canvas.width + 50;
                if (this.x > canvas.width + 50) this.x = -50;
                if (this.y < -50) this.y = canvas.height + 50;
                if (this.y > canvas.height + 50) this.y = -50;

                this.currentSize = this.size * pulseFactor * this.sizeMultiplier;
                this.currentOpacity = this.opacity * (0.8 + Math.sin(this.pulse) * 0.2);
            }

            draw(ctx) {
                const size = this.currentSize || this.size;

                if (this.type === 'star') {
                    // Draw star shape
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    ctx.rotate(this.pulse);
                    ctx.globalAlpha = this.currentOpacity || this.opacity;
                    
                    const spikes = 5;
                    const outerRadius = size * 2;
                    const innerRadius = size * 0.8;

                    ctx.beginPath();
                    for (let i = 0; i < spikes * 2; i++) {
                        const radius = i % 2 === 0 ? outerRadius : innerRadius;
                        const angle = (i / (spikes * 2)) * Math.PI * 2;
                        const px = Math.cos(angle) * radius;
                        const py = Math.sin(angle) * radius;
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    ctx.fillStyle = this.color;
                    ctx.shadowColor = this.color;
                    ctx.shadowBlur = 15;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.restore();
                } else {
                    // Draw glowing circle
                    const gradient = ctx.createRadialGradient(
                        this.x, this.y, 0,
                        this.x, this.y, size * 3
                    );
                    gradient.addColorStop(0, this.color);
                    gradient.addColorStop(0.3, this.color.replace(')', ',0.3)').replace('hsl', 'hsla'));
                    gradient.addColorStop(1, 'rgba(255,255,255,0)');

                    ctx.beginPath();
                    ctx.arc(this.x, this.y, size * 3, 0, Math.PI * 2);
                    ctx.fillStyle = gradient;
                    ctx.globalAlpha = this.currentOpacity || this.opacity;
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.shadowColor = this.color;
                    ctx.shadowBlur = 20;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.globalAlpha = 1;
                }
            }
        }

        // ============================================
        // CONSTELLATION / CONNECTION LINES
        // ============================================
        class Constellation {
            constructor() {
                this.points = [];
                this.opacity = 0.3;
                const numPoints = 3 + Math.floor(Math.random() * 4);
                for (let i = 0; i < numPoints; i++) {
                    this.points.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        size: Math.random() * 2 + 1,
                        phase: Math.random() * Math.PI * 2
                    });
                }
            }

            draw(ctx, time, mouseX, mouseY) {
                // Check if any point is near mouse
                let nearMouse = false;
                for (const p of this.points) {
                    const dx = p.x - mouseX;
                    const dy = p.y - mouseY;
                    if (dx * dx + dy * dy < 300 * 300) {
                        nearMouse = true;
                        break;
                    }
                }

                const alpha = nearMouse ? 0.6 : 0.3;

                // Draw connections
                for (let i = 0; i < this.points.length; i++) {
                    for (let j = i + 1; j < this.points.length; j++) {
                        const dx = this.points[i].x - this.points[j].x;
                        const dy = this.points[i].y - this.points[j].y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < 300) {
                            const distAlpha = 1 - dist / 300;
                            ctx.beginPath();
                            ctx.moveTo(this.points[i].x, this.points[i].y);
                            ctx.lineTo(this.points[j].x, this.points[j].y);
                            ctx.strokeStyle = `rgba(150, 200, 255, ${alpha * distAlpha * 0.5})`;
                            ctx.lineWidth = 0.5 + distAlpha * 0.5;
                            ctx.stroke();
                        }
                    }
                }

                // Draw points
                for (const p of this.points) {
                    const pulse = Math.sin(time * 0.5 + p.phase) * 0.3 + 0.7;
                    const size = p.size * pulse;

                    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 4);
                    gradient.addColorStop(0, `rgba(150, 200, 255, ${alpha * 0.8})`);
                    gradient.addColorStop(0.5, `rgba(150, 200, 255, ${alpha * 0.3})`);
                    gradient.addColorStop(1, 'rgba(150, 200, 255, 0)');

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, size * 4, 0, Math.PI * 2);
                    ctx.fillStyle = gradient;
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(200, 230, 255, ${alpha})`;
                    ctx.fill();
                }
            }
        }

        // ============================================
        // CREATE PREMIUM PARTICLES
        // ============================================
        const numParticles = 150;
        for (let i = 0; i < numParticles; i++) {
            particles.push(new PremiumParticle());
        }

        // Create constellations
        const numConstellations = 12;
        for (let i = 0; i < numConstellations; i++) {
            constellations.push(new Constellation());
        }

        // ============================================
        // DRAW PREMIUM BACKGROUND GRADIENT
        // ============================================
        function drawBackground(ctx, time) {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, colors.dark);
            gradient.addColorStop(0.3, colors.dark2);
            gradient.addColorStop(0.6, colors.dark3);
            gradient.addColorStop(0.8, colors.dark2);
            gradient.addColorStop(1, colors.dark);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Animated glow orbs
            const orbs = [
                { x: 0.2, y: 0.2, color: 'rgba(37, 99, 235, 0.08)', size: 400 },
                { x: 0.8, y: 0.3, color: 'rgba(124, 58, 237, 0.06)', size: 350 },
                { x: 0.5, y: 0.8, color: 'rgba(236, 72, 153, 0.05)', size: 300 },
                { x: 0.1, y: 0.7, color: 'rgba(6, 182, 212, 0.05)', size: 250 },
                { x: 0.9, y: 0.8, color: 'rgba(245, 158, 11, 0.04)', size: 200 }
            ];

            for (const orb of orbs) {
                const ox = orb.x * canvas.width + Math.sin(time * 0.1 + orb.x * 10) * 50;
                const oy = orb.y * canvas.height + Math.cos(time * 0.08 + orb.y * 10) * 50;

                const gradient2 = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.size);
                gradient2.addColorStop(0, orb.color);
                gradient2.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = gradient2;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }

        // ============================================
        // DRAW FLOATING GEOMETRIC SHAPES (Premium)
        // ============================================
        function drawGeometricShapes(ctx, time) {
            const shapes = [
                { x: 0.1, y: 0.1, size: 60, rotation: 0.2, speed: 0.3 },
                { x: 0.9, y: 0.15, size: 45, rotation: 0.5, speed: 0.4 },
                { x: 0.15, y: 0.85, size: 50, rotation: 0.8, speed: 0.25 },
                { x: 0.85, y: 0.9, size: 55, rotation: 0.3, speed: 0.35 },
                { x: 0.5, y: 0.05, size: 35, rotation: 0.6, speed: 0.45 }
            ];

            for (const shape of shapes) {
                const x = shape.x * canvas.width + Math.sin(time * shape.speed + shape.rotation) * 30;
                const y = shape.y * canvas.height + Math.cos(time * shape.speed * 0.7 + shape.rotation) * 30;
                const rot = shape.rotation + time * shape.speed * 0.1;

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rot);
                ctx.globalAlpha = 0.04;

                // Draw diamond
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const radius = i % 2 === 0 ? shape.size : shape.size * 0.6;
                    const px = Math.cos(angle) * radius;
                    const py = Math.sin(angle) * radius;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.strokeStyle = 'rgba(150, 200, 255, 0.15)';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Inner diamond
                ctx.beginPath();
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
                    const radius = shape.size * 0.4;
                    const px = Math.cos(angle) * radius;
                    const py = Math.sin(angle) * radius;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.strokeStyle = 'rgba(150, 200, 255, 0.08)';
                ctx.lineWidth = 0.8;
                ctx.stroke();

                ctx.restore();
            }
        }

        // ============================================
        // MAIN ANIMATION LOOP
        // ============================================
        function animate() {
            time += 0.01;
            const mouseX = mousePos.x * canvas.width;
            const mouseY = mousePos.y * canvas.height;

            // Draw background
            drawBackground(ctx, time);

            // Draw geometric shapes
            drawGeometricShapes(ctx, time);

            // Update and draw constellations
            for (const constellation of constellations) {
                constellation.draw(ctx, time, mouseX, mouseY);
            }

            // Update and draw particles
            for (const particle of particles) {
                particle.update(mouseX, mouseY);
                particle.draw(ctx);
            }

            // Draw connection lines between nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        const alpha = (1 - dist / 150) * 0.3;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(150, 200, 255, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            // Draw premium text watermark
            ctx.globalAlpha = 0.03;
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 120px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('📚', canvas.width / 2, canvas.height / 2);

            ctx.globalAlpha = 0.02;
            ctx.font = '18px Arial';
            ctx.fillText('ACADEMIC HUB', canvas.width / 2, canvas.height / 2 + 80);

            animationId = requestAnimationFrame(animate);
        }

        animate();

        // ============================================
        // CLEANUP
        // ============================================
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none'
            }}
        />
    );
};

export default PremiumBackground;