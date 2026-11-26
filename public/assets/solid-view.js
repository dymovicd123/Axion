(function () {
    const M = ProjectMath;
    const face = (points, color, stroke = null) => ({ points, color, stroke });
    const quad = (a, b, c, d, color) => face([a, b, c, d], color);
    const blue = '#5088ac', teal = '#408b82', amber = '#dd9b4d';
    class SolidView {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.yaw = -.65;
            this.pitch = .43;
            this.zoom = 1;
            this.scene = { faces: [], lines: [], points: [] };
            this.drag = null;
            canvas.addEventListener('pointerdown', e => {
                this.drag = { x: e.clientX, y: e.clientY, moved: false };
                canvas.setPointerCapture(e.pointerId);
            });
            canvas.addEventListener(
                'pointermove',
                e => {
                    if (!this.drag)
                        return;
                    const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
                    if (Math.abs(dx) + Math.abs(dy) > 2)
                        this.drag.moved = true;
                    this.yaw += dx * .009;
                    this.pitch = M.clamp(this.pitch + dy * .009, -1.5, 1.5);
                    this.drag.x = e.clientX;
                    this.drag.y = e.clientY;
                    this.draw();
                });
            canvas.addEventListener(
                'pointerup',
                e => {
                    if (this.drag && !this.drag.moved && this.onClick) {
                        const rect = canvas.getBoundingClientRect();
                        this.onClick(e.clientX - rect.left, e.clientY - rect.top);
                    }
                    this.drag = null;
                });
            canvas.addEventListener('pointercancel', () => {
                this.drag = null;
            });
            canvas.addEventListener('wheel', e => {
                e.preventDefault();
                this.zoom = M.clamp(this.zoom * Math.exp(-e.deltaY * .001), .45, 3);
                this.draw();
            }, { passive: false });
            this.resizeObserver = new ResizeObserver(() => this.draw());
            this.resizeObserver.observe(canvas);
            this.themeListener = () => this.draw();
            document.addEventListener('axion-theme', this.themeListener);
        }
        dispose() {
            this.resizeObserver.disconnect();
            document.removeEventListener('axion-theme', this.themeListener);
        }
        reset(mode = 'orbit') {
            this.yaw = mode === 'front' ? 0 : this.scene.fit ? .36 : -.65;
            this.pitch = mode === 'top' ? 1.55 : mode === 'front' ? 0 : this.scene.fit ? .5 : .43;
            this.zoom = 1;
            this.draw();
        }
        set(scene) {
            const firstFit = scene.fit && !this.scene.fit;
            this.scene = scene;
            if (firstFit)
                this.reset();
            else
                this.draw();
        }
        project(p) {
            const [x, y, z] = p, c = Math.cos(this.yaw), s = Math.sin(this.yaw), cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
            const u = c * x + s * z, w = -s * x + c * z;
            return [this.w / 2 + u * this.factor, this.h / 2 - (cp * y - sp * w) * this.factor, sp * y + cp * w];
        }
        draw() {
            const c = this.canvas, ctx = this.ctx;
            this.w = c.clientWidth;
            this.h = c.clientHeight;
            if (!this.w || !this.h)
                return;
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            c.width = Math.round(this.w * dpr);
            c.height = Math.round(this.h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const scene = this.scene,
                theme = getComputedStyle(document.documentElement),
                color = theme.getPropertyValue('--ink').trim(),
                bg = theme.getPropertyValue('--surface-soft').trim();
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, this.w, this.h);
            this.factor = Math.min(this.w, this.h) / (scene.extent || 5) * .86 * this.zoom;
            if (scene.fit && scene.points?.length) {
                this.factor = 1;
                const projected = scene.points.map(q => this.project(q.p));
                const dx = Math.max(...projected.map(q => Math.abs(q[0] - this.w / 2))), dy = Math.max(...projected.map(q => Math.abs(q[1] - this.h / 2)));
                this.factor = Math.min(Math.max(30, this.w - 112) / (2 * dx || 1), Math.max(30, this.h - 112) / (2 * dy || 1)) * this.zoom;
            }
            const drawPath = (points, fill, stroke, width = 1) => {
                if (!points.length)
                    return;
                ctx.beginPath();
                points.forEach((p, i) => {
                    if (i)
                        ctx.lineTo(p[0], p[1]);
                    else
                        ctx.moveTo(p[0], p[1]);
                });
                if (fill) {
                    ctx.closePath();
                    ctx.fillStyle = fill;
                    ctx.fill();
                }
                if (stroke) {
                    ctx.strokeStyle = stroke;
                    ctx.lineWidth = width;
                    ctx.stroke();
                }
            };
            const projected = scene.faces.map(f => {
                const points = f.points.map(p => this.project(p));
                return { ...f, points, depth: points.reduce((s, p) => s + p[2], 0) / points.length };
            }).sort((a, b) => a.depth - b.depth);
            for (const f of projected) {
                drawPath(f.points, f.color, null);
                if (f.stroke)
                    drawPath([...f.points, f.points[0]], null, f.stroke, .65);
            }
            for (const l of scene.lines || [])
                drawPath(l.points.map(p => this.project(p)), null, l.color || color, l.width || 1.3);
            for (const item of scene.points || []) {
                const [x, y] = this.project(item.p);
                ctx.beginPath();
                ctx.arc(x, y, 4.5, 0, Math.PI * 2);
                ctx.fillStyle = item.color || amber;
                ctx.fill();
                ctx.font = '12px system-ui';
                ctx.fillStyle = color;
                ctx.strokeStyle = bg;
                ctx.lineWidth = 4;
                ctx.strokeText(item.label || '', x + 7, y - 7);
                ctx.fillText(item.label || '', x + 7, y - 7);
            }
            const occupied = [];
            for (const item of scene.points || []) {
                const [x, y] = this.project(item.p);
                occupied.push([x - 6, y - 20, x + 38, y + 8]);
            }
            for (const a of scene.annotations || []) {
                const [u, v] = a.points.map(p => this.project(p)),
                    x = (u[0] + v[0]) / 2,
                    y = (u[1] + v[1]) / 2,
                    dx = v[0] - u[0],
                    dy = v[1] - u[1],
                    len = Math.hypot(dx, dy) || 1;
                ctx.font = '600 12px system-ui';
                const w = ctx.measureText(a.label).width + 10, h = 20;
                const candidates = [18, -18, 32, -32, 46, -46].map(k => [x - dy / len * k, y + dx / len * k]);
                const place = candidates.find(([cx, cy]) => cx - w / 2 > 2 && cx + w / 2 < this.w - 2 && cy - h / 2 > 2 && cy + h / 2 < this.h - 28 && !occupied.some(b => cx - w / 2 < b[2] && cx + w / 2 > b[0] && cy - h / 2 < b[3] && cy + h / 2 > b[1])) || candidates[0];
                const cx = M.clamp(place[0], w / 2 + 3, this.w - w / 2 - 3), cy = M.clamp(place[1], h / 2 + 3, this.h - h / 2 - 25);
                occupied.push([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2]);
                drawPath([[x, y], [cx, cy]], null, a.color || color, .7);
                ctx.fillStyle = bg;
                ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
                ctx.fillStyle = a.color || color;
                ctx.fillText(a.label, cx - w / 2 + 5, cy + 4);
            }
            ctx.font = '12px system-ui';
            ctx.fillStyle = color;
            ctx.globalAlpha = .7;
            ctx.fillText('Drag to rotate · Scroll to zoom', 12, this.h - 12);
            ctx.globalAlpha = 1;
            const o = [0, 0, 0], origin = this.project(o);
            for (const [v, label, col] of [[[1, 0, 0], 'x', '#bd6759'], [[0, 1, 0], 'y', '#4a9879'], [[0, 0, 1], 'z', '#6b88d7']]) {
                const p = this.project(v), dx = p[0] - origin[0], dy = p[1] - origin[1], length = Math.hypot(dx, dy) || 1;
                const end = [this.w - 42 + dx / Math.max(this.factor, length) * 25, 37 + dy / Math.max(this.factor, length) * 25];
                drawPath([[this.w - 42, 37], end], null, col, 1.8);
                ctx.fillStyle = col;
                ctx.fillText(label, end[0] + 3, end[1]);
            }
        }
        pickEdge(edges, x, y) {
            let closest = null, best = 16;
            for (const [a, b] of edges) {
                const u = this.project(a), v = this.project(b), d = [v[0] - u[0], v[1] - u[1]], q = [x - u[0], y - u[1]];
                const t = M.clamp(M.dot(q, d) / (M.dot(d, d) || 1), 0, 1), error = Math.hypot(q[0] - d[0] * t, q[1] - d[1] * t);
                if (error < best) {
                    best = error;
                    closest = M.add(a, M.scale(M.sub(b, a), t));
                }
            }
            return closest;
        }
    }
    function vesselScene(profile, sectionHeight = 6) {
        const rings = profile.map(([h, r]) => Array.from({ length: 48 }, (_, i) => [r * Math.cos(i * Math.PI / 24), h - 6, r * Math.sin(i * Math.PI / 24)]));
        const faces = [], lines = [];
        for (let j = 1; j < rings.length; j++)
            for (let i = 0; i < 48; i++) {
                const k = (i + 1) % 48, light = 49 + Math.round(8 * Math.cos(i * Math.PI / 24));
                faces.push(quad(rings[j - 1][i], rings[j - 1][k], rings[j][k], rings[j][i], `hsla(202, 43%, ${light}%, .82)`));
            }
        faces.push(face([...rings[0]].reverse(), blue));
        for (const ring of [rings[0], rings.at(-1), rings[Math.round(sectionHeight / 12 * (rings.length - 1))]])
            lines.push({ points: [...ring, ring[0]], color: ring === rings.at(-1) ? '#24536d' : '#d99443', width: 1.5 });
        const r = profile[Math.round(sectionHeight / 12 * (profile.length - 1))][1];
        lines.push({ points: [[0, sectionHeight - 6, 0], [r, sectionHeight - 6, 0]], color: amber, width: 2 });
        return { faces, lines, extent: Math.max(15, Math.max(...profile.map(p => p[1])) * 2.6) };
    }
    function boxScene(cut, fold = 1) {
        const { width, depth } = M.box(cut),
            x = width / 2,
            z = depth / 2,
            theta = fold * Math.PI / 2,
            h = cut * Math.sin(theta),
            d = cut * Math.cos(theta);
        const a = [-x, 0, -z], b = [x, 0, -z], c = [x, 0, z], e = [-x, 0, z];
        const faces = [
            quad(a, b, c, e, '#bf9c67'),
            quad(a, b, [x, h, -z - d], [-x, h, -z - d], '#d2b78d'),
            quad(b, c, [x + d, h, z], [x + d, h, -z], '#bd945b'),
            quad(c, e, [-x, h, z + d], [x, h, z + d], '#e0c69f'),
            quad(e, a, [-x - d, h, -z], [-x - d, h, z], '#c7a473')
        ];
        const lines = faces.map(f => ({ points: [...f.points, f.points[0]], color: '#88683e', width: 1.3 }));
        const centered = p => [p[0], p[1] - h / 2, p[2]];
        return { faces: faces.map(f => ({ ...f, points: f.points.map(centered) })), lines: lines.map(l => ({ ...l, points: l.points.map(centered) })), extent: 29 };
    }
    function cubeScene(model, points) {
        const lines = M.edges.map(points => ({ points, color: '#738a9b' }));
        const faces = [];
        if (model.polygon.length >= 3) {
            faces.push(face(model.polygon, 'rgba(45,155,142,.72)'));
            lines.push({ points: [...model.polygon, model.polygon[0]], color: '#269b8d', width: 3 });
        }
        return { faces, lines, points: points.map((p, i) => ({ p, label: 'P' + (i + 1) })), extent: 4 };
    }
    window.AxionSolid = { SolidView, vesselScene, boxScene, cubeScene };
})();
