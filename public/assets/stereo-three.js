(function () {
    window.createStereoView = async function (host, onPick) {
        const T = await import('/vendor/three/three.module.js');
        const { OrbitControls } = await import('/vendor/three-addons/controls/OrbitControls.js');
        const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.domElement.className = 'stereo-webgl';
        host.replaceChildren(renderer.domElement);
        const overlay = document.createElement('div');
        overlay.className = 'stereo-labels';
        host.append(overlay);
        const scene = new T.Scene(),
            camera = new T.OrthographicCamera(-3, 3, 3, -3, .01, 1000),
            controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.minZoom = .45;
        controls.maxZoom = 4;
        let group = new T.Group(), extent = 5, labels = [], pickables = [], annotations = [];
        scene.add(group);
        const ray = new T.Raycaster();
        function render() {
            renderer.render(scene, camera);
            const w = host.clientWidth, h = host.clientHeight, occupied = [];
            const screen = p => {
                const v = p.clone().project(camera);
                return [(v.x + 1) * w / 2, (1 - v.y) * h / 2];
            };
            for (const [el, p] of labels) {
                const [x, y] = screen(p);
                el.style.left = x + 'px';
                el.style.top = y + 'px';
                occupied.push([x - 5, y - 20, x + 35, y + 8]);
            }
            for (const [el, a, b] of annotations) {
                const u = screen(a),
                    v = screen(b),
                    x = (u[0] + v[0]) / 2,
                    y = (u[1] + v[1]) / 2,
                    dx = v[0] - u[0],
                    dy = v[1] - u[1],
                    len = Math.hypot(dx, dy) || 1,
                    ew = el.offsetWidth || 60,
                    eh = el.offsetHeight || 20;
                const candidates = [18, -18, 32, -32, 46, -46].map(k => [x - dy / len * k, y + dx / len * k]);
                const pos = candidates.find(([cx, cy]) => cx - ew / 2 > 2 && cx + ew / 2 < w - 2 && cy - eh / 2 > 2 && cy + eh / 2 < h - 2 && !occupied.some(b => cx - ew / 2 < b[2] && cx + ew / 2 > b[0] && cy - eh / 2 < b[3] && cy + eh / 2 > b[1])) || candidates[0];
                const cx = Math.max(ew / 2, Math.min(w - ew / 2, pos[0])), cy = Math.max(eh / 2, Math.min(h - eh / 2, pos[1]));
                el.style.left = cx + 'px';
                el.style.top = cy + 'px';
                occupied.push([cx - ew / 2, cy - eh / 2, cx + ew / 2, cy + eh / 2]);
            }
        }
        function resize() {
            const w = host.clientWidth, h = host.clientHeight;
            if (!w || !h)
                return;
            renderer.setSize(w, h);
            const aspect = w / h, half = extent * .55 / Math.min(1, aspect);
            camera.left = -half * aspect;
            camera.right = half * aspect;
            camera.top = half;
            camera.bottom = -half;
            camera.updateProjectionMatrix();
            render();
        }
        function reset(mode = 'orbit') {
            camera.position.set(...(mode === 'top' ? [0, extent * 3, .001] : mode === 'front' ? [0, 0, extent * 3] : [-extent * 1.1, extent * 1.25, extent * 2.5]));
            camera.zoom = 1;
            controls.target.set(0, 0, 0);
            controls.update();
            resize();
        }
        controls.addEventListener('change', render);
        const observer = new ResizeObserver(resize);
        observer.observe(host);
        let down;
        renderer.domElement.addEventListener('pointerdown', e => down = [e.clientX, e.clientY]);
        renderer.domElement.addEventListener(
            'pointerup',
            e => {
                if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5)
                    return;
                const b = renderer.domElement.getBoundingClientRect();
                ray.setFromCamera(new T.Vector2((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1), camera);
                const hit = ray.intersectObjects(pickables)[0];
                if (hit) {
                    onPick(hit.object.userData.id);
                    return;
                }
                let nearest = null, best = 18;
                for (const [el, p] of labels) {
                    const v = p.clone().project(camera), d = Math.hypot((v.x + 1) * b.width / 2 - (e.clientX - b.left), (1 - v.y) * b.height / 2 - (e.clientY - b.top));
                    if (d < best) {
                        best = d;
                        nearest = el.textContent;
                    }
                }
                if (nearest)
                    onPick(nearest);
            });
        const vec = p => new T.Vector3(...p);
        function set(data) {
            const changed = extent !== data.extent;
            extent = data.extent || 5;
            for (const o of group.children) {
                o.geometry?.dispose();
                o.material?.dispose();
            }
            scene.remove(group);
            group = new T.Group();
            scene.add(group);
            overlay.replaceChildren();
            labels = [];
            pickables = [];
            annotations = [];
            for (const f of data.faces) {
                const positions = [];
                for (let i = 1; i < f.points.length - 1; i++)
                    positions.push(...f.points[0], ...f.points[i], ...f.points[i + 1]);
                const geo = new T.BufferGeometry();
                geo.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
                const active = f.color?.includes('25,');
                const material = new T.MeshBasicMaterial({ color: active ? 0x169b84 : 0x6e9fc7, transparent: true, opacity: active ? .19 : .055, side: T.DoubleSide, depthWrite: false });
                group.add(new T.Mesh(geo, material));
            }
            for (const l of data.lines) {
                const color = l.color || '#718397';
                const geometry = new T.BufferGeometry().setFromPoints(l.points.map(vec));
                group.add(new T.Line(geometry, new T.LineBasicMaterial({ color, depthTest: false })));
            }
            for (const p of data.points) {
                const mesh = new T.Mesh(new T.SphereGeometry(extent * .012, 12, 10), new T.MeshBasicMaterial({ color: p.color || '#d98c3f', depthTest: false }));
                mesh.position.copy(vec(p.p));
                mesh.userData.id = p.label;
                mesh.renderOrder = 3;
                group.add(mesh);
                pickables.push(mesh);
                const el = document.createElement('span');
                el.textContent = p.label;
                overlay.append(el);
                labels.push([el, mesh.position]);
            }
            for (const a of data.annotations || []) {
                const el = document.createElement('span');
                el.className = 'stereo-dimension';
                el.textContent = a.label;
                if (a.color)
                    el.style.color = a.color;
                overlay.append(el);
                annotations.push([el, ...a.points.map(vec)]);
            }
            if (changed)
                reset();
            else
                resize();
        }
        reset();
        return {
            set,
            reset,
            dispose() {
                observer.disconnect();
                controls.dispose();
                for (const o of group.children) {
                    o.geometry?.dispose();
                    o.material?.dispose();
                }
                renderer.dispose();
            },
            zoomBy(f) {
                camera.zoom = Math.max(.45, Math.min(4, camera.zoom * f));
                camera.updateProjectionMatrix();
                render();
            }
        };
    };
})();
