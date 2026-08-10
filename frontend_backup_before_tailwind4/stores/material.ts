import { defineStore } from 'pinia';

interface MaterialState {
  materials: any[];
  currentMaterial: any | null;
  loading: boolean;
  error: string | null;
}

export const useMaterialStore = defineStore('material', {
  state: (): MaterialState => ({
    materials: [],
    currentMaterial: null,
    loading: false,
    error: null,
  }),
  actions: {
    setMaterials(materials: any[]) {
      this.materials = materials;
    },
    setCurrentMaterial(material: any | null) {
      this.currentMaterial = material;
    },
    setLoading(loading: boolean) {
      this.loading = loading;
    },
    setError(error: string | null) {
      this.error = error;
    },
    clearMaterial() {
      this.currentMaterial = null;
      this.error = null;
    },
  },
});
