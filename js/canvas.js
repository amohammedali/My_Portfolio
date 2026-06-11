// ==========================================
// 1. DYNAMIC HIGH-VISIBILITY SCENE SETUP
// ==========================================
const targetContainer = document.getElementById('webgl-hybrid-container');
const primaryScene = new THREE.Scene();
primaryScene.fog = new THREE.FogExp2('#020207', 0.015);

const globalCamera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
globalCamera.position.set(0, 0, 32);

const coreRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
coreRenderer.setSize(window.innerWidth, window.innerHeight);
coreRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
coreRenderer.setClearColor(primaryScene.fog.color);
targetContainer.appendChild(coreRenderer.domElement);

// Bright Core Illuminators
const spatialPointLight = new THREE.PointLight(0x00f3ff, 4, 60);
spatialPointLight.position.set(0, 15, 20);
primaryScene.add(spatialPointLight);

const fillPointLight = new THREE.PointLight(0x8a2be2, 3, 60);
fillPointLight.position.set(0, -15, 10);
primaryScene.add(fillPointLight);

// Interaction States
const normalizedPointer = new THREE.Vector2(0, 0);
const interpolatedPointer = new THREE.Vector2(0, 0);
let trackedScrollPixels = 0;
let runningScrollVelocity = 0;

// ==========================================
// 2. AMPLIFIED BACKDROP SYSTEMS: WORMHOLE
// ==========================================
const maxTunnelParticles = 2800; // Increased density for high visibility
const tunnelGeometry = new THREE.BufferGeometry();
const tunnelPositions = new Float32Array(maxTunnelParticles * 3);
const tunnelColors = new Float32Array(maxTunnelParticles * 3);

const systemPalette = [
    new THREE.Color('#00f3ff'), // Cyan
    new THREE.Color('#8a2be2'), // Violet
    new THREE.Color('#39ff14'), // Green
    new THREE.Color('#0d011f')  // Deep Void Indigo
];

const tunnelMetadata = [];

for (let i = 0; i < maxTunnelParticles; i++) {
    const currentAngle = Math.random() * Math.PI * 2;
    const targetRadius = Math.random() * 26 + 12;
    const placementDepthZ = (Math.random() - 0.5) * 140;

    tunnelPositions[i * 3] = Math.cos(currentAngle) * targetRadius;
    tunnelPositions[i * 3 + 1] = Math.sin(currentAngle) * targetRadius;
    tunnelPositions[i * 3 + 2] = placementDepthZ;

    const assignmentColor = systemPalette[Math.floor(Math.random() * systemPalette.length)];
    tunnelColors[i * 3] = assignmentColor.r;
    tunnelColors[i * 3 + 1] = assignmentColor.g;
    tunnelColors[i * 3 + 2] = assignmentColor.b;

    tunnelMetadata.push({
        angle: currentAngle,
        radius: targetRadius,
        depthZ: placementDepthZ,
        rotationalSpeed: (Math.random() - 0.5) * 0.008,
        forwardSpeed: Math.random() * 0.22 + 0.1
    });
}

tunnelGeometry.setAttribute('position', new THREE.BufferAttribute(tunnelPositions, 3));
tunnelGeometry.setAttribute('color', new THREE.BufferAttribute(tunnelColors, 3));

const tunnelMaterial = new THREE.PointsMaterial({
    size: 0.42, // Increased particle footprint size
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
});

const tunnelPointsMesh = new THREE.Points(tunnelGeometry, tunnelMaterial);
primaryScene.add(tunnelPointsMesh);

// ==========================================
// 3. AMPLIFIED MESH SYSTEM: NEURAL NODE
// ==========================================
const totalNodes = 140; // Increased nodes count
const spatialRange = 28;
const neuralGeometry = new THREE.BufferGeometry();
const nodePositionArray = new Float32Array(totalNodes * 3);
const baselineDriftVectors = [];

for (let i = 0; i < totalNodes; i++) {
    nodePositionArray[i * 3] = (Math.random() - 0.5) * spatialRange * 1.8;
    nodePositionArray[i * 3 + 1] = (Math.random() - 0.5) * spatialRange;
    nodePositionArray[i * 3 + 2] = (Math.random() - 0.5) * 20 + 8; // Extended coordinate bounds

    baselineDriftVectors.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        seed: Math.random() * 120
    });
}

neuralGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositionArray, 3));

const nodeMaterial = new THREE.PointsMaterial({
    size: 0.55, // Enriched structural clarity
    color: 0x00f3ff,
    transparent: true,
    opacity: 0.85
});

const neuralPointsMesh = new THREE.Points(neuralGeometry, nodeMaterial);
primaryScene.add(neuralPointsMesh);

const proximityThreshold = 7.5; // Wider connections tracking bounds
const connectionMaterial = new THREE.LineBasicMaterial({
    color: 0x39ff14,
    transparent: true,
    opacity: 0.22 // Enriched line contrast profile
});

let lineSegmentsMesh = new THREE.LineSegments(new THREE.BufferGeometry(), connectionMaterial);
primaryScene.add(lineSegmentsMesh);

// ==========================================
// 4. PIPELINE EVENTS MATRIX
// ==========================================
window.addEventListener('mousemove', (e) => {
    normalizedPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    normalizedPointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('scroll', () => {
    const shiftDelta = window.scrollY - trackedScrollPixels;
    trackedScrollPixels = window.scrollY;
    runningScrollVelocity = Math.min(Math.abs(shiftDelta) * 0.1, 4.0);
});

// ==========================================
// 5. PIPELINE EXECUTION SCHEDULER LOOP
// ==========================================
const runtimeClock = new THREE.Clock();

function processGraphicsPipeline() {
    requestAnimationFrame(processGraphicsPipeline);

    const frameTime = runtimeClock.getElapsedTime();
    interpolatedPointer.lerp(normalizedPointer, 0.06);
    runningScrollVelocity *= 0.94;

    // Wormhole Processing Loops
    const tunnelPositionsArray = tunnelPointsMesh.geometry.attributes.position.array;
    for (let i = 0; i < maxTunnelParticles; i++) {
        const spec = tunnelMetadata[i];
        spec.depthZ += spec.forwardSpeed + (runningScrollVelocity * 2.5);
        spec.angle += spec.rotationalSpeed + (interpolatedPointer.x * 0.004);

        if (spec.depthZ > 50) spec.depthZ = -90;

        const ptrX = i * 3;
        const ptrY = i * 3 + 1;
        const ptrZ = i * 3 + 2;

        tunnelPositionsArray[ptrX] = Math.cos(spec.angle) * (spec.radius + Math.sin(frameTime + spec.depthZ * 0.05) * 2);
        tunnelPositionsArray[ptrY] = Math.sin(spec.angle) * (spec.radius + Math.cos(frameTime + spec.depthZ * 0.05) * 2);
        tunnelPositionsArray[ptrZ] = spec.depthZ;
    }
    tunnelPointsMesh.geometry.attributes.position.needsUpdate = true;

    // Neural Repulsion Processing Loops
    const nodePositionsArray = neuralPointsMesh.geometry.attributes.position.array;
    const unprojectedRaycaster = new THREE.Vector3(interpolatedPointer.x * 20, interpolatedPointer.y * 12, 10);
    const dynamicSegmentPositions = [];

    for (let i = 0; i < totalNodes; i++) {
        const pX = i * 3;
        const pY = i * 3 + 1;
        const pZ = i * 3 + 2;

        nodePositionsArray[pX] += Math.sin(frameTime + baselineDriftVectors[i].seed) * 0.005 + baselineDriftVectors[i].x;
        nodePositionsArray[pY] += Math.cos(frameTime + baselineDriftVectors[i].seed) * 0.005 + baselineDriftVectors[i].y;

        if (Math.abs(nodePositionsArray[pX]) > spatialRange * 1.6) nodePositionsArray[pX] *= -0.9;
        if (Math.abs(nodePositionsArray[pY]) > spatialRange) nodePositionsArray[pY] *= -0.9;

        const diffX = nodePositionsArray[pX] - unprojectedRaycaster.x;
        const diffY = nodePositionsArray[pY] - unprojectedRaycaster.y;
        const geometricDist = Math.sqrt(diffX * diffX + diffY * diffY);

        if (geometricDist < 8.5) {
            const pushingForce = (8.5 - geometricDist) * 0.015;
            nodePositionsArray[pX] += diffX * pushingForce;
            nodePositionsArray[pY] += diffY * pushingForce;
        }

        for (let j = i + 1; j < totalNodes; j++) {
            const targetPX = j * 3;
            const targetPY = j * 3 + 1;
            const targetPZ = j * 3 + 2;

            const lDiffX = nodePositionsArray[pX] - nodePositionsArray[targetPX];
            const lDiffY = nodePositionsArray[pY] - nodePositionsArray[targetPY];
            const lDiffZ = nodePositionsArray[pZ] - nodePositionsArray[targetPZ];

            const linkDistance = Math.sqrt(lDiffX * lDiffX + lDiffY * lDiffY + lDiffZ * lDiffZ);

            if (linkDistance < proximityThreshold) {
                dynamicSegmentPositions.push(
                    nodePositionsArray[pX], nodePositionsArray[pY], nodePositionsArray[pZ],
                    nodePositionsArray[targetPX], nodePositionsArray[targetPY], nodePositionsArray[targetPZ]
                );
            }
        }
    }
    neuralPointsMesh.geometry.attributes.position.needsUpdate = true;

    primaryScene.remove(lineSegmentsMesh);
    const lineStructureGeometry = new THREE.BufferGeometry();
    lineStructureGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dynamicSegmentPositions, 3));
    lineSegmentsMesh = new THREE.LineSegments(lineStructureGeometry, connectionMaterial);
    primaryScene.add(lineSegmentsMesh);

    // Camera Viewport Matrix Adjustments
    globalCamera.position.z = 32 - (trackedScrollPixels * 0.006);
    primaryScene.rotation.y = interpolatedPointer.x * 0.15;
    primaryScene.rotation.x = -interpolatedPointer.y * 0.1 + (trackedScrollPixels * 0.0004);

    coreRenderer.render(primaryScene, globalCamera);
}


