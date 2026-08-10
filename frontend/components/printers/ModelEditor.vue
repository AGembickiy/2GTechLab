<script setup lang="ts">
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const props = defineProps<{
  modelUrl: string
  activeMaterials: any[]
}>()

const container = ref<HTMLElement | null>(null)
let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer

onMounted(() => {
  if (!container.value) return

  // Инициализация сцены
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#f3f4f6')

  camera = new THREE.PerspectiveCamera(75, container.value.clientWidth / container.value.clientHeight, 0.1, 1000)
  camera.position.z = 5

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  container.value.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  
  // Свет
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  const directionalLight = new THREE.DirectionLight(0xffffff, 0.8)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)

  // Загрузка модели
  const loader = new GLTFLoader()
  loader.load(props.modelUrl, (gltf) => {
    scene.add(gltf.scene)
    
    // Центрирование
    const box = new THREE.Box3().setFromObject(gltf.scene)
    const center = box.getCenter(new THREE.Vector3())
    gltf.scene.position.sub(center)
  })

  const animate = () => {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()
})

// Очистка при удалении
onUnmounted(() => {
  renderer?.dispose()
})
</script>

<template>
  <div class="relative w-full h-[400px] bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
    <div ref="container" class="w-full h-full"></div>
    <div class="absolute bottom-4 left-4 flex gap-2">
      <span v-for="m in activeMaterials" :key="m.id" :style="{ backgroundColor: m.color }" class="text-white shadow-sm">
        {{ m.type }}
      </span>
    </div>
  </div>
</template>
