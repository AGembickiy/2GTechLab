<template>
  <div class="threejs-container" style="pointer-events: auto;">
    <canvas ref="canvas" @click="onCanvasClick" style="pointer-events: auto;"></canvas>
  </div>
</template>

<script>
export default {
  name: 'ThreeJSModel',
  mounted() {
    this.init();
    this.animate();
  },
  methods: {
    init() {
      const container = this.$refs.canvas;

      // Создание сцены
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x111111);

      // Камера
      this.camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
      this.camera.position.set(0, 0, 5);

      // Рендерер
      this.renderer = new THREE.WebGLRenderer({ canvas: container, antialias: true });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);

      // Свет
      const ambientLight = new THREE.AmbientLight(0x404040);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(1, 1, 1).normalize();
      this.scene.add(directionalLight);

      // Mesh (куб)
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.position.set(0, 0, 0);
      this.scene.add(this.mesh);

      // Raycaster
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();

      // Обработчик изменения размера окна
      window.addEventListener('resize', this.onWindowResize);
    },
    animate() {
      requestAnimationFrame(this.animate);

      // Вращение mesh
      this.mesh.rotation.y += 0.005;

      this.renderer.render(this.scene, this.camera);
    },
    onWindowResize() {
      const container = this.$refs.canvas;
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    },
    onCanvasClick(event) {
      console.log('КЛИК ЗАФИКСИРОВАН! Координаты:', event.clientX, event.clientY);
      const container = this.$refs.canvas;
      const rect = container.getBoundingClientRect();

      // Нормализация координат мыши
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Обновление raycaster
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Проверка пересечений
      const intersects = this.raycaster.intersectObject(this.mesh);

      if (intersects.length > 0) {
        console.log('Клик по mesh!');
        // Изменение цвета при клике
        this.mesh.material.color.set(0xff0000);
        setTimeout(() => {
          this.mesh.material.color.set(0x00ff00);
        }, 200);
      } else {
        console.log('Клик вне mesh');
      }
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize);
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
};
</script>

<style scoped>
.threejs-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

canvas {
  display: block;
}
</style>