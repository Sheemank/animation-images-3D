/**
 * ==========================================================================
 * 3D CINEMATIC VISUAL INSTALLATION — CORE JAVASCRIPT ENGINE
 * ==========================================================================
 * Pure HTML5, CSS3, & Vanilla JavaScript (No Frameworks or External Libraries)
 * 100% Text-Free, Image-Driven Interactive 3D Dimension
 * Features: Multi-Image Upload, Shareable Links, 3D Video Recording & Download
 */

(function () {
    'use strict';

    /* ==========================================================================
       1. CONFIGURATION & STATE
       ========================================================================== */

    const CONFIG = {
        imageCountDesktop: 160,
        imageCountMobile: 80,
        cubeCount: 6,
        particleCount: 220,
        cameraLerp: 0.065,
        dragInertia: 0.92,
        wheelSensitivity: 1.2,
        autoCruiseInterval: 14000, // 14s per scene
        enableParticles: true,
        enableSound: false,
        performanceMode: 'auto',
        randomizeImages: true
    };

    const STATE = {
        sceneIndex: 0,
        totalScenes: 9,
        isAutoCruise: true,
        isAudioPlaying: false,
        isFullscreen: false,
        isInspecting: false,
        inspectedCardIndex: -1,
        hoveredCardIndex: -1,
        isRecording: false,
        userImages: [], // Custom uploaded image Data URLs

        // Pointer & Interaction
        pointer: {
            x: 0, y: 0,
            targetX: 0, targetY: 0,
            normX: 0, normY: 0,
            isDown: false,
            startX: 0, startY: 0,
            vx: 0, vy: 0
        },

        // Touch Pinch
        touch: {
            initialPinchDist: 0,
            isPinching: false
        },

        // Camera Transforms
        camera: {
            x: 0, y: 0, z: 0,
            targetX: 0, targetY: 0, targetZ: 0,
            rotX: 0, rotY: 0, rotZ: 0,
            targetRotX: 0, targetRotY: 0, targetRotZ: 0
        },

        // Atmospheric Color Themes
        atmospheres: [
            { name: 'Awakening',   color: '#00f5d4', rgb: [0, 245, 212] },
            { name: 'Void',        color: '#00d2ff', rgb: [0, 210, 255] },
            { name: 'Tunnel',      color: '#9d4edd', rgb: [157, 78, 221] },
            { name: 'Sphere',      color: '#00f5d4', rgb: [0, 245, 212] },
            { name: 'Spiral',      color: '#7209b7', rgb: [114, 9, 183] },
            { name: 'Cubes',       color: '#4cc9f0', rgb: [76, 201, 240] },
            { name: 'Explosion',   color: '#ff007f', rgb: [255, 0, 127] },
            { name: 'Archive',     color: '#ffbe0b', rgb: [255, 190, 11] },
            { name: 'Universe',    color: '#3a0ca3', rgb: [58, 12, 163] }
        ],

        lastInteractionTime: Date.now()
    };

    /* ==========================================================================
       2. IMAGE SYSTEM & PROCEDURAL CANVAS FALLBACKS
       ========================================================================== */

    const CURATED_IMAGE_URLS = [
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1507908708918-778587c9e563?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80'
    ];

    function createProceduralArtwork(seed) {
        const c = document.createElement('canvas');
        c.width = 280;
        c.height = 380;
        const ctx = c.getContext('2d');
        
        const hue1 = (seed * 137.5) % 360;
        const hue2 = (hue1 + 75) % 360;
        const hue3 = (hue1 + 160) % 360;

        const grad = ctx.createLinearGradient(0, 0, 280, 380);
        grad.addColorStop(0, `hsl(${hue1}, 80%, 8%)`);
        grad.addColorStop(0.5, `hsl(${hue2}, 75%, 14%)`);
        grad.addColorStop(1, `hsl(${hue3}, 90%, 6%)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 280, 380);

        ctx.lineWidth = 2.5;
        for (let i = 0; i < 8; i++) {
            ctx.strokeStyle = `hsla(${(hue1 + i * 25) % 360}, 100%, 65%, ${0.2 + i * 0.08})`;
            ctx.beginPath();
            const cx = 140 + Math.sin(seed + i) * 60;
            const cy = 190 + Math.cos(seed + i * 1.5) * 80;
            const radius = 30 + i * 18;
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.strokeStyle = `hsla(${hue2}, 100%, 75%, 0.15)`;
        ctx.lineWidth = 1;
        for (let x = 0; x < 280; x += 28) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 380);
            ctx.stroke();
        }
        for (let y = 0; y < 380; y += 28) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(280, y);
            ctx.stroke();
        }

        const glowGrad = ctx.createRadialGradient(140, 190, 5, 140, 190, 120);
        glowGrad.addColorStop(0, `hsla(${hue1}, 100%, 85%, 0.7)`);
        glowGrad.addColorStop(0.5, `hsla(${hue2}, 90%, 55%, 0.3)`);
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, 280, 380);

        return c.toDataURL('image/jpeg', 0.85);
    }

    const proceduralArtworks = [];
    for (let i = 0; i < 24; i++) {
        proceduralArtworks.push(createProceduralArtwork(i));
    }

    function getImageSrc(index) {
        // If user uploaded custom images, prioritize them!
        if (STATE.userImages.length > 0) {
            return STATE.userImages[index % STATE.userImages.length];
        }
        if (CURATED_IMAGE_URLS.length > 0) {
            return CURATED_IMAGE_URLS[index % CURATED_IMAGE_URLS.length];
        }
        return proceduralArtworks[index % proceduralArtworks.length];
    }

    function refreshAllImages() {
        cards.forEach((c, idx) => {
            if (c.img) {
                c.img.src = getImageSrc(idx);
            }
        });
        cubes.forEach((cube, cIdx) => {
            const faces = cube.dom.querySelectorAll('.cube-face img');
            faces.forEach((fImg, fIdx) => {
                fImg.src = getImageSrc(cIdx * 6 + fIdx);
            });
        });

        // Update upload count badge
        const badge = document.getElementById('upload-badge');
        if (badge) {
            if (STATE.userImages.length > 0) {
                badge.innerText = STATE.userImages.length > 99 ? '99+' : STATE.userImages.length;
                badge.classList.add('visible');
            } else {
                badge.classList.remove('visible');
            }
        }
    }

    /* ==========================================================================
       3. ENTITY MANAGERS (3D CARDS & CUBES)
       ========================================================================== */

    const cards = [];
    const cubes = [];

    class CardEntity {
        constructor(index, total) {
            this.index = index;
            this.total = total;
            
            this.current = {
                x: (Math.random() - 0.5) * 3000,
                y: (Math.random() - 0.5) * 3000,
                z: -2500 - Math.random() * 2000,
                rx: (Math.random() - 0.5) * 180,
                ry: (Math.random() - 0.5) * 180,
                rz: (Math.random() - 0.5) * 180,
                scale: 0.1,
                opacity: 0
            };

            this.target = {
                x: 0, y: 0, z: 0,
                rx: 0, ry: 0, rz: 0,
                scale: 1,
                opacity: 1
            };

            this.floatPhase = Math.random() * Math.PI * 2;
            this.floatSpeed = 0.8 + Math.random() * 0.8;
            this.floatAmp = 15 + Math.random() * 20;

            this.dom = null;
            this.img = null;
            this.createDOM();
        }

        createDOM() {
            const el = document.createElement('div');
            el.className = 'img-card';
            el.dataset.index = this.index;

            const inner = document.createElement('div');
            inner.className = 'img-inner';

            const img = document.createElement('img');
            img.loading = 'lazy';
            img.src = getImageSrc(this.index);
            
            img.onerror = () => {
                img.src = proceduralArtworks[this.index % proceduralArtworks.length];
            };

            const glare = document.createElement('div');
            glare.className = 'img-glare';

            inner.appendChild(img);
            inner.appendChild(glare);
            el.appendChild(inner);

            el.addEventListener('pointerenter', () => onCardPointerEnter(this.index));
            el.addEventListener('pointerleave', () => onCardPointerLeave(this.index));
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                onCardClick(this.index);
            });

            this.dom = el;
            this.img = img;
        }

        update(dt, time, lerpFactor) {
            const ease = Math.min(lerpFactor * 1.2, 0.25);
            this.current.x += (this.target.x - this.current.x) * ease;
            this.current.y += (this.target.y - this.current.y) * ease;
            this.current.z += (this.target.z - this.current.z) * ease;
            this.current.rx += (this.target.rx - this.current.rx) * ease;
            this.current.ry += (this.target.ry - this.current.ry) * ease;
            this.current.rz += (this.target.rz - this.current.rz) * ease;
            this.current.scale += (this.target.scale - this.current.scale) * ease;
            this.current.opacity += (this.target.opacity - this.current.opacity) * ease;

            let floatY = 0;
            let floatRot = 0;
            if (!STATE.isInspecting || STATE.inspectedCardIndex !== this.index) {
                floatY = Math.sin(time * this.floatSpeed + this.floatPhase) * this.floatAmp;
                floatRot = Math.cos(time * this.floatSpeed * 0.7 + this.floatPhase) * 4;
            }

            const x = this.current.x;
            const y = this.current.y + floatY;
            const z = this.current.z;
            const rx = this.current.rx + floatRot * 0.5;
            const ry = this.current.ry + floatRot * 0.5;
            const rz = this.current.rz;
            const s = this.current.scale;

            this.dom.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale3d(${s.toFixed(3)}, ${s.toFixed(3)}, ${s.toFixed(3)})`;
            this.dom.style.opacity = this.current.opacity.toFixed(3);
        }
    }

    class CubeEntity {
        constructor(index, total) {
            this.index = index;
            this.total = total;
            this.current = { x: 0, y: 0, z: -1200, rx: 0, ry: 0, rz: 0, scale: 0, opacity: 0 };
            this.target = { x: 0, y: 0, z: -1200, rx: 0, ry: 0, rz: 0, scale: 0, opacity: 0 };
            this.rotSpeedX = (Math.random() - 0.5) * 40;
            this.rotSpeedY = (Math.random() - 0.5) * 50;
            this.dom = null;
            this.createDOM();
        }

        createDOM() {
            const el = document.createElement('div');
            el.className = 'cube-3d';

            const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
            faces.forEach((faceName, fIdx) => {
                const face = document.createElement('div');
                face.className = `cube-face ${faceName}`;
                const img = document.createElement('img');
                img.loading = 'lazy';
                img.src = getImageSrc((this.index * 6 + fIdx));
                img.onerror = () => {
                    img.src = proceduralArtworks[(this.index * 6 + fIdx) % proceduralArtworks.length];
                };
                face.appendChild(img);
                el.appendChild(face);
            });

            this.dom = el;
        }

        update(dt, time, lerpFactor) {
            const ease = Math.min(lerpFactor * 1.2, 0.25);
            this.current.x += (this.target.x - this.current.x) * ease;
            this.current.y += (this.target.y - this.current.y) * ease;
            this.current.z += (this.target.z - this.current.z) * ease;
            this.current.scale += (this.target.scale - this.current.scale) * ease;
            this.current.opacity += (this.target.opacity - this.current.opacity) * ease;

            if (this.current.opacity > 0.01) {
                this.current.rx += this.rotSpeedX * dt;
                this.current.ry += this.rotSpeedY * dt;
                
                this.dom.style.transform = `translate3d(${this.current.x.toFixed(1)}px, ${this.current.y.toFixed(1)}px, ${this.current.z.toFixed(1)}px) rotateX(${this.current.rx.toFixed(1)}deg) rotateY(${this.current.ry.toFixed(1)}deg) scale3d(${this.current.scale.toFixed(3)}, ${this.current.scale.toFixed(3)}, ${this.current.scale.toFixed(3)})`;
                this.dom.style.opacity = this.current.opacity.toFixed(3);
                this.dom.style.display = 'block';
            } else {
                this.dom.style.display = 'none';
            }
        }
    }

    /* ==========================================================================
       4. SCENE GEOMETRY GENERATORS (MATHEMATICAL 3D LAYOUTS)
       ========================================================================== */

    const SCENES = [
        // 0. Awakening Void
        function calcAwakening(cards, cubes) {
            const N = cards.length;
            cards.forEach((c, i) => {
                const ratio = i / N;
                const angle = ratio * Math.PI * 16;
                const radius = 80 + ratio * 450;
                c.target.x = Math.cos(angle) * radius;
                c.target.y = Math.sin(angle) * radius;
                c.target.z = -1200 + ratio * 1400;
                c.target.rx = Math.sin(angle) * 35;
                c.target.ry = Math.cos(angle) * 35;
                c.target.rz = angle * (180 / Math.PI) * 0.15;
                c.target.scale = 0.3 + ratio * 0.7;
                c.target.opacity = 0.85;
            });
            cubes.forEach(cube => {
                cube.target.opacity = 0;
                cube.target.scale = 0;
            });
        },

        // 1. Floating Image Void / Starfield
        function calcVoid(cards, cubes) {
            const N = cards.length;
            cards.forEach((c, i) => {
                const u = Math.sin(i * 99.7) * 0.5 + 0.5;
                const v = Math.cos(i * 33.3) * 0.5 + 0.5;
                const theta = u * 2.0 * Math.PI;
                const phi = Math.acos(2.0 * v - 1.0);
                const r = 400 + Math.cbrt((i + 1) / N) * 1100;

                c.target.x = r * Math.sin(phi) * Math.cos(theta) * 1.3;
                c.target.y = r * Math.sin(phi) * Math.sin(theta) * 0.8;
                c.target.z = r * Math.cos(phi) - 600;
                c.target.rx = (Math.sin(i * 1.2) * 20);
                c.target.ry = (Math.cos(i * 1.7) * 25);
                c.target.rz = (Math.sin(i * 0.8) * 15);
                c.target.scale = 0.85;
                c.target.opacity = 0.9;
            });
            cubes.forEach(cube => {
                cube.target.opacity = 0;
                cube.target.scale = 0;
            });
        },

        // 2. Cylindrical Hyper-Tunnel
        function calcTunnel(cards, cubes) {
            const N = cards.length;
            const rings = 18;
            const perRing = Math.ceil(N / rings);
            const radius = 460;
            const tunnelDepth = 2600;

            cards.forEach((c, i) => {
                const ringIndex = Math.floor(i / perRing);
                const itemInRing = i % perRing;
                const theta = (itemInRing / perRing) * Math.PI * 2 + (ringIndex * 0.35);
                const z = -tunnelDepth + (ringIndex / rings) * tunnelDepth * 1.3;

                c.target.x = Math.cos(theta) * radius;
                c.target.y = Math.sin(theta) * radius;
                c.target.z = z;
                c.target.rx = 0;
                c.target.ry = (theta * (180 / Math.PI)) + 90;
                c.target.rz = (theta * (180 / Math.PI)) - 90;
                c.target.scale = 0.95;
                c.target.opacity = 1;
            });
            cubes.forEach(cube => {
                cube.target.opacity = 0;
                cube.target.scale = 0;
            });
        },

        // 3. Geodesic Image Sphere (Fibonacci Golden Ratio)
        function calcSphere(cards, cubes) {
            const N = cards.length;
            const radius = 720;
            const goldenAngle = Math.PI * (3 - Math.sqrt(5));

            cards.forEach((c, i) => {
                const y = 1 - (i / (N - 1)) * 2;
                const radiusAtY = Math.sqrt(1 - y * y);
                const theta = goldenAngle * i;

                const x = Math.cos(theta) * radiusAtY;
                const z = Math.sin(theta) * radiusAtY;

                c.target.x = x * radius;
                c.target.y = y * radius;
                c.target.z = z * radius - 200;

                const ry = Math.atan2(x, z) * (180 / Math.PI);
                const rx = -Math.asin(y) * (180 / Math.PI);
                c.target.rx = rx;
                c.target.ry = ry;
                c.target.rz = 0;
                c.target.scale = 0.88;
                c.target.opacity = 0.95;
            });
            cubes.forEach(cube => {
                cube.target.opacity = 0;
                cube.target.scale = 0;
            });
        },

        // 4. Infinite Double Helix Spiral
        function calcSpiral(cards, cubes) {
            const N = cards.length;
            const turns = 5;
            const heightSpan = 2200;

            cards.forEach((c, i) => {
                const ratio = i / N;
                const theta = ratio * Math.PI * 2 * turns;
                const radius = 320 + ratio * 380;
                const z = -heightSpan / 2 + ratio * heightSpan;

                c.target.x = Math.cos(theta) * radius;
                c.target.y = Math.sin(theta) * radius;
                c.target.z = z;
                c.target.rx = 15;
                c.target.ry = (theta * (180 / Math.PI)) + 90;
                c.target.rz = ratio * 180;
                c.target.scale = 0.9;
                c.target.opacity = 0.95;
            });
            cubes.forEach(cube => {
                cube.target.opacity = 0;
                cube.target.scale = 0;
            });
        },

        // 5. 3D Polyhedral Cubes Dimension
        function calcCubes(cards, cubes) {
            const N = cards.length;
            cards.forEach((c, i) => {
                const angle = (i / N) * Math.PI * 8;
                const ring = Math.floor(i / (N / 4));
                const radius = 650 + ring * 220;
                c.target.x = Math.cos(angle) * radius;
                c.target.y = Math.sin(angle) * (radius * 0.45);
                c.target.z = -1200 + (i % 5) * 280;
                c.target.rx = 25;
                c.target.ry = (angle * (180 / Math.PI));
                c.target.rz = 0;
                c.target.scale = 0.7;
                c.target.opacity = 0.55;
            });

            const numCubes = cubes.length;
            cubes.forEach((cube, i) => {
                const angle = (i / numCubes) * Math.PI * 2;
                const dist = 520;
                cube.target.x = Math.cos(angle) * dist;
                cube.target.y = Math.sin(angle) * (dist * 0.6) + (Math.sin(i) * 50);
                cube.target.z = -350 + Math.sin(angle * 2) * 180;
                cube.target.scale = 1;
                cube.target.opacity = 1;
            });
        },

        // 6. Supernova Explosion
        function calcExplosion(cards, cubes) {
            const N = cards.length;
            cards.forEach((c, i) => {
                const u = Math.sin(i * 12.9898) * 0.5 + 0.5;
                const v = Math.cos(i * 78.233) * 0.5 + 0.5;
                const theta = u * 2.0 * Math.PI;
                const phi = Math.acos(2.0 * v - 1.0);
                const blastDist = 900 + Math.sin(i * 5.3) * 700;

                c.target.x = blastDist * Math.sin(phi) * Math.cos(theta);
                c.target.y = blastDist * Math.sin(phi) * Math.sin(theta);
                c.target.z = blastDist * Math.cos(phi) - 400;
                c.target.rx = (Math.sin(i * 4.1) * 180);
                c.target.ry = (Math.cos(i * 3.7) * 180);
                c.target.rz = (Math.sin(i * 2.9) * 180);
                c.target.scale = 0.5 + Math.sin(i) * 0.4;
                c.target.opacity = 0.8;
            });
            cubes.forEach(cube => {
                cube.target.opacity = 0;
                cube.target.scale = 0;
            });
        },

        // 7. Curved IMAX Archive Wall
        function calcArchiveWall(cards, cubes) {
            const N = cards.length;
            const cols = 22;
            const rows = Math.ceil(N / cols);
            const radius = 1150;
            const fovAngle = Math.PI * 1.1;
            const rowHeight = 210;

            cards.forEach((c, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const theta = -fovAngle / 2 + (col / (cols - 1)) * fovAngle;
                const y = (row - (rows - 1) / 2) * rowHeight;

                c.target.x = Math.sin(theta) * radius;
                c.target.y = y;
                c.target.z = Math.cos(theta) * radius - radius - 100;
                c.target.rx = -(y / radius) * 15;
                c.target.ry = -theta * (180 / Math.PI);
                c.target.rz = 0;
                c.target.scale = 0.95;
                c.target.opacity = 1;
            });
            cubes.forEach(cube => {
                cube.target.opacity = 0;
                cube.target.scale = 0;
            });
        },

        // 8. Multiverse Matrix Universe
        function calcMatrixUniverse(cards, cubes) {
            const N = cards.length;
            const gridSize = Math.cbrt(N);
            const gx = Math.ceil(gridSize * 1.4);
            const gy = Math.ceil(gridSize * 0.9);
            const gz = Math.ceil(gridSize * 0.9);
            const spacingX = 320;
            const spacingY = 280;
            const spacingZ = 340;

            cards.forEach((c, i) => {
                const ix = i % gx;
                const iy = Math.floor(i / gx) % gy;
                const iz = Math.floor(i / (gx * gy));
                const wave = Math.sin(ix * 0.6 + iy * 0.6) * 60;

                c.target.x = (ix - (gx - 1) / 2) * spacingX;
                c.target.y = (iy - (gy - 1) / 2) * spacingY + wave;
                c.target.z = (iz - (gz - 1) / 2) * spacingZ - 400;
                c.target.rx = Math.sin(ix) * 15;
                c.target.ry = Math.cos(iy) * 15;
                c.target.rz = 0;
                c.target.scale = 0.85;
                c.target.opacity = 0.95;
            });
            cubes.forEach(cube => {
                cube.target.opacity = 0;
                cube.target.scale = 0;
            });
        }
    ];

    function applySceneGeometry(index) {
        if (index < 0 || index >= SCENES.length) return;
        STATE.sceneIndex = index;
        SCENES[index](cards, cubes);
        updateAtmosphere(index);
        AudioEngine.triggerWhoosh();
        updateHUDIndicators(index);
    }

    function updateAtmosphere(index) {
        const atm = STATE.atmospheres[index % STATE.atmospheres.length];
        const lightingOverlay = document.getElementById('lighting-overlay');
        if (lightingOverlay) {
            lightingOverlay.style.background = `radial-gradient(circle at center, transparent 35%, rgba(${atm.rgb[0]}, ${atm.rgb[1]}, ${atm.rgb[2]}, 0.08) 70%, rgba(2, 2, 6, 0.92) 100%)`;
        }
    }

    /* ==========================================================================
       5. USER IMAGE UPLOAD & DRAG-AND-DROP SYSTEM
       ========================================================================== */

    function initImageUploadSystem() {
        const fileInput = document.getElementById('image-file-input');
        const btnUpload = document.getElementById('btn-upload');
        const dropOverlay = document.getElementById('drop-overlay');

        if (btnUpload && fileInput) {
            btnUpload.addEventListener('click', (e) => {
                e.stopPropagation();
                fileInput.click();
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    handleSelectedFiles(Array.from(e.target.files));
                }
            });
        }

        // Global Drag & Drop over the entire window
        window.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (dropOverlay) dropOverlay.classList.add('is-active');
        });

        window.addEventListener('dragleave', (e) => {
            if (e.relatedTarget === null && dropOverlay) {
                dropOverlay.classList.remove('is-active');
            }
        });

        window.addEventListener('drop', (e) => {
            e.preventDefault();
            if (dropOverlay) dropOverlay.classList.remove('is-active');
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const imageFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                if (imageFiles.length > 0) {
                    handleSelectedFiles(imageFiles);
                }
            }
        });
    }

    function handleSelectedFiles(files) {
        let loadedCount = 0;
        const newImages = [];

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                newImages.push(event.target.result);
                loadedCount++;
                if (loadedCount === files.length) {
                    // Update state with user images
                    STATE.userImages = newImages;
                    refreshAllImages();
                    showToastNotification();
                    saveImagesToLocalStorage(newImages);

                    // Trigger dramatic explosion morph to show off the newly uploaded imagery
                    applySceneGeometry(6);
                    setTimeout(() => applySceneGeometry(3), 1600);
                }
            };
            reader.readAsDataURL(file);
        });
    }

    function saveImagesToLocalStorage(images) {
        try {
            // Save up to 12 images to local storage for persistent sharing
            const subset = images.slice(0, 12);
            localStorage.setItem('user_3d_gallery', JSON.stringify(subset));
        } catch (e) {}
    }

    function loadSavedGallery() {
        try {
            const saved = localStorage.getItem('user_3d_gallery');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    STATE.userImages = parsed;
                    refreshAllImages();
                }
            }
        } catch (e) {}
    }

    /* ==========================================================================
       6. SHAREABLE LINK & GALLERY SHARING
       ========================================================================== */

    function initShareSystem() {
        const btnShare = document.getElementById('btn-share');
        if (btnShare) {
            btnShare.addEventListener('click', (e) => {
                e.stopPropagation();
                copyShareLink();
            });
        }
    }

    function copyShareLink() {
        const shareUrl = window.location.href.split('#')[0] + '#gallery=' + Date.now();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareUrl).then(() => {
                triggerShareSuccessFeedback();
            }).catch(() => fallbackCopy(shareUrl));
        } else {
            fallbackCopy(shareUrl);
        }
    }

    function fallbackCopy(text) {
        const temp = document.createElement('input');
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        triggerShareSuccessFeedback();
    }

    function triggerShareSuccessFeedback() {
        const btnShare = document.getElementById('btn-share');
        const iconShare = btnShare ? btnShare.querySelector('.icon-share') : null;
        const iconCheck = btnShare ? btnShare.querySelector('.icon-check') : null;

        if (iconShare && iconCheck) {
            iconShare.style.display = 'none';
            iconCheck.style.display = 'block';
            setTimeout(() => {
                iconShare.style.display = 'block';
                iconCheck.style.display = 'none';
            }, 2500);
        }

        showToastNotification();
        AudioEngine.triggerChime(4);
    }

    function showToastNotification() {
        const toast = document.getElementById('toast-notify');
        if (toast) {
            toast.classList.add('visible');
            setTimeout(() => toast.classList.remove('visible'), 2400);
        }
    }

    /* ==========================================================================
       7. CINEMATIC 3D VIDEO RECORDING & DOWNLOAD ENGINE (MediaRecorder)
       ========================================================================== */

    const VideoRecorder = {
        mediaRecorder: null,
        recordedChunks: [],
        recordDuration: 12000, // 12 second cinematic recording sequence
        startTime: 0,
        timerInterval: null,

        init() {
            const btnRecord = document.getElementById('btn-record');
            if (btnRecord) {
                btnRecord.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (!STATE.isRecording) {
                        this.startRecording();
                    } else {
                        this.stopRecording();
                    }
                });
            }
        },

        startRecording() {
            const canvas = document.getElementById('ambient-canvas');
            if (!canvas) return;

            try {
                const stream = canvas.captureStream(60);
                const options = { mimeType: 'video/webm;codecs=vp9' };
                
                try {
                    this.mediaRecorder = new MediaRecorder(stream, options);
                } catch (err) {
                    this.mediaRecorder = new MediaRecorder(stream);
                }

                this.recordedChunks = [];
                this.mediaRecorder.ondataavailable = (e) => {
                    if (e.data && e.data.size > 0) {
                        this.recordedChunks.push(e.data);
                    }
                };

                this.mediaRecorder.onstop = () => {
                    this.exportVideoFile();
                };

                this.mediaRecorder.start(100);
                STATE.isRecording = true;

                // UI updates
                const btnRecord = document.getElementById('btn-record');
                if (btnRecord) btnRecord.classList.add('is-recording');

                const overlay = document.getElementById('recording-overlay');
                if (overlay) overlay.classList.add('visible');

                // Animate cinematic scene sequence during recording
                applySceneGeometry(2); // Tunnel
                setTimeout(() => applySceneGeometry(3), 3000); // Sphere
                setTimeout(() => applySceneGeometry(4), 6000); // Spiral
                setTimeout(() => applySceneGeometry(6), 9000); // Supernova

                this.startTime = performance.now();
                this.timerInterval = setInterval(() => {
                    const elapsed = performance.now() - this.startTime;
                    const progress = Math.min((elapsed / this.recordDuration) * 100, 100);
                    const progressBar = document.getElementById('rec-progress-bar');
                    if (progressBar) {
                        progressBar.setAttribute('stroke-dasharray', `${progress.toFixed(1)}, 100`);
                    }
                    if (elapsed >= this.recordDuration) {
                        this.stopRecording();
                    }
                }, 100);

            } catch (e) {
                console.error('Recording initialization failed:', e);
            }
        },

        stopRecording() {
            if (!STATE.isRecording) return;
            STATE.isRecording = false;
            clearInterval(this.timerInterval);

            if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
            }

            const btnRecord = document.getElementById('btn-record');
            if (btnRecord) btnRecord.classList.remove('is-recording');

            const overlay = document.getElementById('recording-overlay');
            if (overlay) overlay.classList.remove('visible');

            const progressBar = document.getElementById('rec-progress-bar');
            if (progressBar) progressBar.setAttribute('stroke-dasharray', '0, 100');
        },

        exportVideoFile() {
            if (this.recordedChunks.length === 0) return;
            const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `cinematic-3d-experience-${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);

            showToastNotification();
            AudioEngine.triggerInspectChord();
        }
    };

    /* ==========================================================================
       8. INTERACTION & CAMERA ENGINE (6-DOF & PHYSICS)
       ========================================================================== */

    function initInteractions() {
        window.addEventListener('resize', onWindowResize, { passive: true });
        window.addEventListener('pointermove', onPointerMove, { passive: false });
        window.addEventListener('pointerdown', onPointerDown, { passive: false });
        window.addEventListener('pointerup', onPointerUp, { passive: true });
        window.addEventListener('pointercancel', onPointerUp, { passive: true });
        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('touchstart', onTouchStart, { passive: false });
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd, { passive: true });

        setupHUDControls();
        initImageUploadSystem();
        initShareSystem();
        VideoRecorder.init();

        const closeBtn = document.getElementById('btn-close-inspect');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                exitInspectionMode();
            });
        }

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && STATE.isInspecting) {
                exitInspectionMode();
            }
        });
    }

    function onPointerMove(e) {
        STATE.lastInteractionTime = Date.now();
        const w = window.innerWidth;
        const h = window.innerHeight;

        STATE.pointer.targetX = e.clientX;
        STATE.pointer.targetY = e.clientY;
        STATE.pointer.normX = (e.clientX / w) * 2 - 1;
        STATE.pointer.normY = (e.clientY / h) * 2 - 1;

        if (STATE.pointer.isDown && !STATE.touch.isPinching) {
            const dx = e.clientX - STATE.pointer.startX;
            const dy = e.clientY - STATE.pointer.startY;

            STATE.pointer.vx = dx * 0.18;
            STATE.pointer.vy = dy * 0.18;

            STATE.camera.targetRotY += STATE.pointer.vx;
            STATE.camera.targetRotX -= STATE.pointer.vy;
            STATE.camera.targetRotX = Math.max(-75, Math.min(75, STATE.camera.targetRotX));

            STATE.pointer.startX = e.clientX;
            STATE.pointer.startY = e.clientY;
        }

        const cursor = document.getElementById('custom-cursor');
        if (cursor) {
            cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        }
    }

    function onPointerDown(e) {
        if (e.target.closest('#hud') || e.target.closest('#btn-close-inspect') || e.target.closest('#recording-overlay')) return;

        STATE.pointer.isDown = true;
        STATE.pointer.startX = e.clientX;
        STATE.pointer.startY = e.clientY;
        STATE.pointer.vx = 0;
        STATE.pointer.vy = 0;
        document.body.classList.add('is-dragging');

        if (STATE.isInspecting && !e.target.closest('.img-card')) {
            exitInspectionMode();
        }
    }

    function onPointerUp() {
        STATE.pointer.isDown = false;
        document.body.classList.remove('is-dragging');
    }

    function onWheel(e) {
        e.preventDefault();
        STATE.lastInteractionTime = Date.now();

        const delta = e.deltaY * CONFIG.wheelSensitivity;
        STATE.camera.targetZ -= delta;

        if (STATE.camera.targetZ > 800) {
            STATE.camera.targetZ = -400;
            const nextScene = (STATE.sceneIndex + 1) % STATE.totalScenes;
            applySceneGeometry(nextScene);
        } else if (STATE.camera.targetZ < -1600) {
            STATE.camera.targetZ = -400;
            const prevScene = (STATE.sceneIndex - 1 + STATE.totalScenes) % STATE.totalScenes;
            applySceneGeometry(prevScene);
        }
    }

    function onTouchStart(e) {
        if (e.touches.length === 2) {
            STATE.touch.isPinching = true;
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            STATE.touch.initialPinchDist = Math.hypot(dx, dy);
        }
    }

    function onTouchMove(e) {
        if (STATE.touch.isPinching && e.touches.length === 2) {
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.hypot(dx, dy);
            const delta = (dist - STATE.touch.initialPinchDist) * 3.5;
            STATE.camera.targetZ += delta;
            STATE.touch.initialPinchDist = dist;
        }
    }

    function onTouchEnd(e) {
        if (e.touches.length < 2) {
            STATE.touch.isPinching = false;
        }
    }

    function onCardPointerEnter(index) {
        if (STATE.isInspecting) return;
        STATE.hoveredCardIndex = index;
        document.body.classList.add('is-hovering-card');

        const hoveredCard = cards[index];
        if (hoveredCard) {
            hoveredCard.dom.classList.add('is-hovered');
            AudioEngine.triggerChime(index);
        }
    }

    function onCardPointerLeave(index) {
        if (STATE.isInspecting) return;
        STATE.hoveredCardIndex = -1;
        document.body.classList.remove('is-hovering-card');

        const card = cards[index];
        if (card) {
            card.dom.classList.remove('is-hovered');
        }
    }

    function onCardClick(index) {
        if (STATE.isInspecting) {
            if (STATE.inspectedCardIndex === index) {
                exitInspectionMode();
            } else {
                enterInspectionMode(index);
            }
            return;
        }
        enterInspectionMode(index);
    }

    function enterInspectionMode(index) {
        STATE.isInspecting = true;
        STATE.inspectedCardIndex = index;
        STATE.isAutoCruise = false;

        const playBtn = document.getElementById('btn-play');
        if (playBtn) playBtn.classList.add('is-paused');

        const closeBtn = document.getElementById('btn-close-inspect');
        if (closeBtn) closeBtn.classList.add('visible');

        AudioEngine.triggerInspectChord();

        cards.forEach((c, i) => {
            if (i === index) {
                c.dom.classList.add('is-inspected');
                c.dom.classList.remove('is-dimmed');
                c.target.x = 0;
                c.target.y = 0;
                c.target.z = 480;
                c.target.rx = 0;
                c.target.ry = 0;
                c.target.rz = 0;
                c.target.scale = 1.6;
                c.target.opacity = 1;
            } else {
                c.dom.classList.add('is-dimmed');
                c.dom.classList.remove('is-inspected');
                const angle = (i / cards.length) * Math.PI * 2;
                c.target.x = Math.cos(angle) * 900;
                c.target.y = Math.sin(angle) * 550;
                c.target.z = -600;
                c.target.scale = 0.5;
                c.target.opacity = 0.2;
            }
        });
    }

    function exitInspectionMode() {
        STATE.isInspecting = false;
        STATE.inspectedCardIndex = -1;

        const closeBtn = document.getElementById('btn-close-inspect');
        if (closeBtn) closeBtn.classList.remove('visible');

        cards.forEach(c => {
            c.dom.classList.remove('is-inspected');
            c.dom.classList.remove('is-dimmed');
            c.dom.classList.remove('is-hovered');
        });

        applySceneGeometry(STATE.sceneIndex);
    }

    /* ==========================================================================
       9. HUD CONTROLS & EVENT BINDINGS
       ========================================================================== */

    function setupHUDControls() {
        const btnAudio = document.getElementById('btn-audio');
        if (btnAudio) {
            btnAudio.addEventListener('click', (e) => {
                e.stopPropagation();
                STATE.isAudioPlaying = !STATE.isAudioPlaying;
                btnAudio.classList.toggle('is-playing', STATE.isAudioPlaying);
                if (STATE.isAudioPlaying) {
                    AudioEngine.start();
                } else {
                    AudioEngine.stop();
                }
            });
        }

        const sceneBtns = document.querySelectorAll('.scene-btn');
        sceneBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const sceneIdx = parseInt(btn.dataset.scene, 10);
                if (!isNaN(sceneIdx)) {
                    applySceneGeometry(sceneIdx);
                }
            });
        });

        const btnPlay = document.getElementById('btn-play');
        if (btnPlay) {
            btnPlay.addEventListener('click', (e) => {
                e.stopPropagation();
                STATE.isAutoCruise = !STATE.isAutoCruise;
                btnPlay.classList.toggle('is-paused', !STATE.isAutoCruise);
            });
        }

        const btnReset = document.getElementById('btn-reset');
        if (btnReset) {
            btnReset.addEventListener('click', (e) => {
                e.stopPropagation();
                STATE.camera.targetX = 0;
                STATE.camera.targetY = 0;
                STATE.camera.targetZ = 0;
                STATE.camera.targetRotX = 0;
                STATE.camera.targetRotY = 0;
                STATE.camera.targetRotZ = 0;
            });
        }

        const btnFullscreen = document.getElementById('btn-fullscreen');
        if (btnFullscreen) {
            btnFullscreen.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFullscreen();
            });
        }
    }

    function updateHUDIndicators(activeScene) {
        const sceneBtns = document.querySelectorAll('.scene-btn');
        sceneBtns.forEach(btn => {
            const idx = parseInt(btn.dataset.scene, 10);
            btn.classList.toggle('active', idx === activeScene);
        });
    }

    function toggleFullscreen() {
        const btnFullscreen = document.getElementById('btn-fullscreen');
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            if (btnFullscreen) btnFullscreen.classList.add('is-fullscreen');
            STATE.isFullscreen = true;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }
            if (btnFullscreen) btnFullscreen.classList.remove('is-fullscreen');
            STATE.isFullscreen = false;
        }
    }

    function onWindowResize() {
        CanvasEngine.resize();
    }

    /* ==========================================================================
       10. AMBIENT CANVAS ENGINE (3D PARTICLES, SPEED STREAKS & RECORDING STREAM)
       ========================================================================== */

    const CanvasEngine = {
        canvas: null,
        ctx: null,
        stars: [],

        init() {
            this.canvas = document.getElementById('ambient-canvas');
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.resize();

            const count = (window.innerWidth < 640) ? 120 : CONFIG.particleCount;
            this.stars = [];
            for (let i = 0; i < count; i++) {
                this.stars.push({
                    x: (Math.random() - 0.5) * 2400,
                    y: (Math.random() - 0.5) * 2400,
                    z: Math.random() * 2000 + 10,
                    pz: 0,
                    radius: 1 + Math.random() * 2
                });
            }
        },

        resize() {
            if (!this.canvas) return;
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        },

        render(time, cameraSpeed) {
            if (!this.ctx) return;
            const w = this.canvas.width;
            const h = this.canvas.height;
            const cx = w / 2;
            const cy = h / 2;

            this.ctx.fillStyle = 'rgba(2, 2, 6, 0.35)';
            this.ctx.fillRect(0, 0, w, h);

            const atm = STATE.atmospheres[STATE.sceneIndex % STATE.atmospheres.length];

            const nebulaGrad = this.ctx.createRadialGradient(
                cx + STATE.pointer.normX * 180,
                cy + STATE.pointer.normY * 140,
                50,
                cx, cy, Math.max(w, h) * 0.75
            );
            nebulaGrad.addColorStop(0, `rgba(${atm.rgb[0]}, ${atm.rgb[1]}, ${atm.rgb[2]}, 0.12)`);
            nebulaGrad.addColorStop(0.5, `rgba(${atm.rgb[0]}, ${atm.rgb[1]}, ${atm.rgb[2]}, 0.03)`);
            nebulaGrad.addColorStop(1, 'transparent');
            this.ctx.fillStyle = nebulaGrad;
            this.ctx.fillRect(0, 0, w, h);

            const fov = 400;
            const speed = 2.5 + Math.abs(cameraSpeed) * 4;

            this.stars.forEach(star => {
                star.pz = star.z;
                star.z -= speed;
                if (star.z <= 10) {
                    star.z = 2000;
                    star.pz = 2000;
                    star.x = (Math.random() - 0.5) * 2400;
                    star.y = (Math.random() - 0.5) * 2400;
                }

                const sx = (star.x / star.z) * fov + cx;
                const sy = (star.y / star.z) * fov + cy;
                const psx = (star.x / star.pz) * fov + cx;
                const psy = (star.y / star.pz) * fov + cy;

                if (sx >= 0 && sx <= w && sy >= 0 && sy <= h) {
                    const depthAlpha = (1 - star.z / 2000);
                    this.ctx.strokeStyle = `rgba(${atm.rgb[0]}, ${atm.rgb[1]}, ${atm.rgb[2]}, ${depthAlpha * 0.8})`;
                    this.ctx.lineWidth = star.radius * (1 - star.z / 2000) * 1.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(psx, psy);
                    this.ctx.lineTo(sx, sy);
                    this.ctx.stroke();
                }
            });

            // If recording, composite 3D image cards directly into the canvas frame
            if (STATE.isRecording) {
                this.render3DCardsToCanvas(cx, cy);
            }
        },

        render3DCardsToCanvas(cx, cy) {
            // Render top 36 sorted foreground cards onto canvas stream for crystal clear video
            const sortedCards = [...cards].filter(c => c.current.opacity > 0.1)
                .sort((a, b) => (a.current.z - b.current.z));

            sortedCards.forEach(c => {
                const z = c.current.z - STATE.camera.z + 1000;
                if (z > 50) {
                    const scale = (800 / z) * c.current.scale;
                    const sx = (c.current.x - STATE.camera.x) * (800 / z) + cx;
                    const sy = (c.current.y - STATE.camera.y) * (800 / z) + cy;
                    const cw = 110 * scale;
                    const ch = 150 * scale;

                    if (sx + cw > 0 && sx - cw < this.canvas.width && sy + ch > 0 && sy - ch < this.canvas.height) {
                        this.ctx.save();
                        this.ctx.translate(sx, sy);
                        this.ctx.rotate(c.current.rz * Math.PI / 180);
                        this.ctx.globalAlpha = Math.min(c.current.opacity, 0.95);
                        
                        if (c.img && c.img.complete && c.img.naturalWidth > 0) {
                            try {
                                this.ctx.drawImage(c.img, -cw / 2, -ch / 2, cw, ch);
                            } catch (e) {}
                        }

                        // Border glow
                        this.ctx.strokeStyle = 'rgba(0, 245, 212, 0.6)';
                        this.ctx.lineWidth = 1.5 * scale;
                        this.ctx.strokeRect(-cw / 2, -ch / 2, cw, ch);
                        this.ctx.restore();
                    }
                }
            });
        }
    };

    /* ==========================================================================
       11. GENERATIVE WEB AUDIO API SYNTHESIZER
       ========================================================================== */

    const AudioEngine = {
        ctx: null,
        masterGain: null,
        subOsc: null,
        harmonicOsc: null,
        filter: null,
        lfo: null,
        isInit: false,

        init() {
            if (this.isInit) return;
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            this.ctx = new AudioCtx();

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            this.filter = this.ctx.createBiquadFilter();
            this.filter.type = 'lowpass';
            this.filter.frequency.setValueAtTime(260, this.ctx.currentTime);
            this.filter.Q.setValueAtTime(4.0, this.ctx.currentTime);
            this.filter.connect(this.masterGain);

            this.subOsc = this.ctx.createOscillator();
            this.subOsc.type = 'sine';
            this.subOsc.frequency.setValueAtTime(55, this.ctx.currentTime);
            this.subOsc.connect(this.filter);
            this.subOsc.start();

            this.harmonicOsc = this.ctx.createOscillator();
            this.harmonicOsc.type = 'triangle';
            this.harmonicOsc.frequency.setValueAtTime(110.2, this.ctx.currentTime);
            const harmGain = this.ctx.createGain();
            harmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
            this.harmonicOsc.connect(harmGain);
            harmGain.connect(this.filter);
            this.harmonicOsc.start();

            this.lfo = this.ctx.createOscillator();
            this.lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.setValueAtTime(120, this.ctx.currentTime);
            this.lfo.connect(lfoGain);
            lfoGain.connect(this.filter.frequency);
            this.lfo.start();

            this.isInit = true;
        },

        start() {
            this.init();
            if (!this.ctx) return;
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.masterGain.gain.exponentialRampToValueAtTime(0.3, this.ctx.currentTime + 2.0);
        },

        stop() {
            if (!this.ctx || !this.isInit) return;
            this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
        },

        triggerWhoosh() {
            if (!this.ctx || !STATE.isAudioPlaying) return;
            try {
                const dur = 1.2;
                const bufferSize = this.ctx.sampleRate * dur;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
                }

                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;

                const bandpass = this.ctx.createBiquadFilter();
                bandpass.type = 'bandpass';
                bandpass.Q.setValueAtTime(2.5, this.ctx.currentTime);
                bandpass.frequency.setValueAtTime(300, this.ctx.currentTime);
                bandpass.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + dur * 0.5);
                bandpass.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + dur);

                const whooshGain = this.ctx.createGain();
                whooshGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
                whooshGain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + dur * 0.4);
                whooshGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);

                noise.connect(bandpass);
                bandpass.connect(whooshGain);
                whooshGain.connect(this.masterGain);

                noise.start();
            } catch (e) {}
        },

        triggerChime(index) {
            if (!this.ctx || !STATE.isAudioPlaying) return;
            try {
                const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
                const freq = pentatonic[index % pentatonic.length];

                const osc = this.ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);

                osc.connect(gain);
                gain.connect(this.masterGain);

                osc.start();
                osc.stop(this.ctx.currentTime + 0.65);
            } catch (e) {}
        },

        triggerInspectChord() {
            if (!this.ctx || !STATE.isAudioPlaying) return;
            try {
                const chord = [261.63, 392.00, 523.25, 659.25];
                chord.forEach(freq => {
                    const osc = this.ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

                    const gain = this.ctx.createGain();
                    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.8);

                    osc.connect(gain);
                    gain.connect(this.masterGain);

                    osc.start();
                    osc.stop(this.ctx.currentTime + 1.9);
                });
            } catch (e) {}
        }
    };

    /* ==========================================================================
       12. MAIN ANIMATION & DIRECTOR LOOP (60 FPS GPU PIPELINE)
       ========================================================================== */

    let lastTime = performance.now();
    let autoCruiseTimer = 0;

    function animate(currentTime) {
        requestAnimationFrame(animate);

        const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
        lastTime = currentTime;
        const timeSec = currentTime * 0.001;

        if (STATE.isAutoCruise && !STATE.isInspecting && !STATE.isRecording) {
            autoCruiseTimer += dt * 1000;
            if (autoCruiseTimer >= CONFIG.autoCruiseInterval) {
                autoCruiseTimer = 0;
                const nextScene = (STATE.sceneIndex + 1) % STATE.totalScenes;
                applySceneGeometry(nextScene);
            }
            STATE.camera.targetRotY += 0.05;
        }

        const lerpFactor = CONFIG.cameraLerp;
        STATE.camera.x += (STATE.camera.targetX - STATE.camera.x) * lerpFactor;
        STATE.camera.y += (STATE.camera.targetY - STATE.camera.y) * lerpFactor;
        STATE.camera.z += (STATE.camera.targetZ - STATE.camera.z) * lerpFactor;
        STATE.camera.rotX += (STATE.camera.targetRotX - STATE.camera.rotX) * lerpFactor;
        STATE.camera.rotY += (STATE.camera.targetRotY - STATE.camera.rotY) * lerpFactor;
        STATE.camera.rotZ += (STATE.camera.targetRotZ - STATE.camera.rotZ) * lerpFactor;

        const parallaxX = STATE.pointer.normX * 18;
        const parallaxY = -STATE.pointer.normY * 14;

        const cameraEl = document.getElementById('camera');
        if (cameraEl) {
            const camTx = -STATE.camera.x;
            const camTy = -STATE.camera.y;
            const camTz = -STATE.camera.z;
            const camRx = STATE.camera.rotX + parallaxY;
            const camRy = STATE.camera.rotY + parallaxX;
            const camRz = STATE.camera.rotZ;

            cameraEl.style.transform = `translate3d(${camTx.toFixed(1)}px, ${camTy.toFixed(1)}px, ${camTz.toFixed(1)}px) rotateX(${camRx.toFixed(2)}deg) rotateY(${camRy.toFixed(2)}deg) rotateZ(${camRz.toFixed(2)}deg)`;
        }

        for (let i = 0; i < cards.length; i++) {
            cards[i].update(dt, timeSec, lerpFactor);
        }

        for (let i = 0; i < cubes.length; i++) {
            cubes[i].update(dt, timeSec, lerpFactor);
        }

        CanvasEngine.render(timeSec, STATE.camera.targetZ - STATE.camera.z);

        const hud = document.getElementById('hud');
        if (hud) {
            const idleTime = Date.now() - STATE.lastInteractionTime;
            if (idleTime > 3500 && !STATE.isInspecting && !STATE.isRecording) {
                hud.classList.add('is-idle');
            } else {
                hud.classList.remove('is-idle');
            }
        }
    }

    /* ==========================================================================
       13. BOOTSTRAP & INITIALIZATION
       ========================================================================== */

    function init() {
        const isMobile = window.innerWidth <= 768;
        const totalCards = isMobile ? CONFIG.imageCountMobile : CONFIG.imageCountDesktop;

        const imageContainer = document.getElementById('image-container');
        const cubeContainer = document.getElementById('cube-container');

        for (let i = 0; i < totalCards; i++) {
            const card = new CardEntity(i, totalCards);
            cards.push(card);
            if (imageContainer) imageContainer.appendChild(card.dom);
        }

        for (let i = 0; i < CONFIG.cubeCount; i++) {
            const cube = new CubeEntity(i, CONFIG.cubeCount);
            cubes.push(cube);
            if (cubeContainer) cubeContainer.appendChild(cube.dom);
        }

        CanvasEngine.init();
        initInteractions();
        loadSavedGallery();

        applySceneGeometry(0);
        requestAnimationFrame(animate);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
