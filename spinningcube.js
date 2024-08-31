document.getElementById('cube-container').addEventListener('click', async () => {
  const THREE = await import('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js');

  const container = document.getElementById('cube-container');
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  const cube = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ color: 0x00ff00 }));
  cube.castShadow = true;
  scene.add(cube);

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.ShadowMaterial({ opacity: 0.5 }));
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -1.5;
  plane.receiveShadow = true;
  scene.add(plane);

  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(10, 20, 10);
  spotLight.castShadow = true;
  scene.add(spotLight);

  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);

  (function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  })();
}, { once: true });
