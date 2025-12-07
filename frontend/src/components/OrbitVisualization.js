import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function OrbitVisualization({ orbitData }) {
  const containerRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const earthRef = useRef();
  const orbitLinesRef = useRef([]);
  const [hoverInfo, setHoverInfo] = React.useState(null);
  const [cameraInfo, setCameraInfo] = React.useState({ x: 20000, y: 20000, z: 20000 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      1,
      100000
    );
    camera.position.set(20000, 20000, 20000);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10000, 10000, 10000);
    scene.add(pointLight);

    // Earth
    const earthGeometry = new THREE.SphereGeometry(6371, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e88e5,
      metalness: 0.4,
      roughness: 0.7
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    earthRef.current = earth;

    // Add grid helper
    const gridHelper = new THREE.GridHelper(40000, 20, 0x4fc3f7, 0x2a3150);
    scene.add(gridHelper);

    // Add axis helper (X=red, Y=green, Z=blue)
    const axesHelper = new THREE.AxesHelper(15000);
    scene.add(axesHelper);

    // Add scale labels using sprites
    const createTextLabel = (text, position, color = '#ffffff') => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 64;
      context.fillStyle = color;
      context.font = 'Bold 32px Arial';
      context.textAlign = 'center';
      context.fillText(text, 128, 40);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(position);
      sprite.scale.set(2000, 500, 1);
      return sprite;
    };

    // Add axis labels
    scene.add(createTextLabel('X: 15000 km', new THREE.Vector3(15000, 0, 0), '#ff5252'));
    scene.add(createTextLabel('Y: 15000 km', new THREE.Vector3(0, 15000, 0), '#4caf50'));
    scene.add(createTextLabel('Z: 15000 km', new THREE.Vector3(0, 0, 15000), '#4fc3f7'));
    
    // Add distance markers
    scene.add(createTextLabel('7000 km', new THREE.Vector3(7000, 0, 0), '#4fc3f7'));
    scene.add(createTextLabel('10000 km', new THREE.Vector3(10000, 0, 0), '#4fc3f7'));

    // Add orbit rings for reference
    const ringGeometry1 = new THREE.RingGeometry(7000, 7050, 64);
    const ringMaterial1 = new THREE.MeshBasicMaterial({ 
      color: 0x4fc3f7, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2
    });
    const ring1 = new THREE.Mesh(ringGeometry1, ringMaterial1);
    ring1.rotation.x = Math.PI / 2;
    scene.add(ring1);

    const ringGeometry2 = new THREE.RingGeometry(10000, 10050, 64);
    const ringMaterial2 = new THREE.MeshBasicMaterial({ 
      color: 0x4fc3f7, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15
    });
    const ring2 = new THREE.Mesh(ringGeometry2, ringMaterial2);
    ring2.rotation.x = Math.PI / 2;
    scene.add(ring2);

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraDistance = Math.sqrt(
      camera.position.x ** 2 + camera.position.y ** 2 + camera.position.z ** 2
    );

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    // Raycaster for hover detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (e) => {
      // Update mouse position for raycasting
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!isDragging) {
        // Check for hover on Earth
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(earth);
        
        if (intersects.length > 0) {
          const point = intersects[0].point;
          setHoverInfo({
            x: point.x.toFixed(2),
            y: point.y.toFixed(2),
            z: point.z.toFixed(2),
            distance: Math.sqrt(point.x ** 2 + point.y ** 2 + point.z ** 2).toFixed(2)
          });
        } else {
          setHoverInfo(null);
        }
        return;
      }

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      const theta = (deltaX * 0.01);
      const phi = (deltaY * 0.01);

      const x = camera.position.x;
      const y = camera.position.y;
      const z = camera.position.z;

      camera.position.x = x * Math.cos(theta) - z * Math.sin(theta);
      camera.position.z = x * Math.sin(theta) + z * Math.cos(theta);

      const r = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
      camera.position.y = y * Math.cos(phi) - r * Math.sin(phi);

      camera.lookAt(0, 0, 0);
      previousMousePosition = { x: e.clientX, y: e.clientY };
      
      // Update camera info
      setCameraInfo({
        x: camera.position.x.toFixed(0),
        y: camera.position.y.toFixed(0),
        z: camera.position.z.toFixed(0)
      });
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      cameraDistance += e.deltaY * 10;
      cameraDistance = Math.max(10000, Math.min(50000, cameraDistance));
      
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      direction.multiplyScalar(-cameraDistance);
      camera.position.copy(direction);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (earthRef.current) {
        earthRef.current.rotation.y += 0.001;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update orbits when data changes
  useEffect(() => {
    if (!sceneRef.current || !orbitData || orbitData.length === 0) return;

    // Remove old orbit lines
    orbitLinesRef.current.forEach(line => {
      sceneRef.current.remove(line);
    });
    orbitLinesRef.current = [];

    // Add new orbit lines
    const colors = [0xff5252, 0x4fc3f7, 0xffeb3b, 0x4caf50];
    
    orbitData.forEach((orbit, idx) => {
      const points = orbit.orbit_points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: colors[idx % colors.length],
        linewidth: 2
      });
      const line = new THREE.Line(geometry, material);
      sceneRef.current.add(line);
      orbitLinesRef.current.push(line);
    });
  }, [orbitData]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          position: 'absolute', 
          top: 0, 
          left: 0 
        }}
      />
      
      {/* Camera Info Overlay */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(26, 31, 58, 0.9)',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #2a3150',
        fontSize: '12px',
        color: '#8b92b0',
        minWidth: '200px'
      }}>
        <div style={{ marginBottom: '10px', color: '#4fc3f7', fontWeight: 'bold' }}>
          Camera Position
        </div>
        <div>X: {cameraInfo.x} km</div>
        <div>Y: {cameraInfo.y} km</div>
        <div>Z: {cameraInfo.z} km</div>
      </div>

      {/* Hover Info Tooltip */}
      {hoverInfo && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(26, 31, 58, 0.95)',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #4fc3f7',
          fontSize: '12px',
          color: '#fff',
          minWidth: '200px'
        }}>
          <div style={{ marginBottom: '10px', color: '#4fc3f7', fontWeight: 'bold' }}>
            🌍 Hover Coordinates
          </div>
          <div>X: {hoverInfo.x} km</div>
          <div>Y: {hoverInfo.y} km</div>
          <div>Z: {hoverInfo.z} km</div>
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #2a3150' }}>
            Distance: {hoverInfo.distance} km
          </div>
        </div>
      )}

      {/* Controls Info */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(26, 31, 58, 0.8)',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #2a3150',
        fontSize: '11px',
        color: '#666'
      }}>
        <div>🖱️ Drag to rotate</div>
        <div>🔍 Scroll to zoom</div>
      </div>
    </div>
  );
}

export default OrbitVisualization;
