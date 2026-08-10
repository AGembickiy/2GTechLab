import type { UploadSlot, UploadStats } from '~/types/upload';

export function useUploadModel() {

  const showPreview = ref(false);

  const jobId = ref<number | null>(null);

  const is3D = ref(false);

  const previewUrl = ref<string | null>(null);

  const imagePreviewUrl = ref<string | null>(null);

  const uploadStatus = ref<string | null>(null);


  const slots = reactive<UploadSlot[]>([
    {
      index: 1,
      materialId: null,
      material: null,
    },
    {
      index: 2,
      materialId: null,
      material: null,
    },
    {
      index: 3,
      materialId: null,
      material: null,
    },
    {
      index: 4,
      materialId: null,
      material: null,
    },
  ]);


  const selectedSurfaces = ref<any[]>([]);


  const stats = ref<UploadStats>({
    selectedCount: 0,
    paintedFaces: 0,
    totalFaces: 0,
  });


  function openPreview(data: {
    jobId: number;
    is3D: boolean;
    previewUrl?: string | null;
  }) {

    jobId.value = data.jobId;

    is3D.value = data.is3D;

    previewUrl.value = data.previewUrl ?? null;

    showPreview.value = true;
  }


  function closePreview() {
    showPreview.value = false;
  }


  function reset() {

    jobId.value = null;

    previewUrl.value = null;

    imagePreviewUrl.value = null;

    selectedSurfaces.value = [];

    slots.forEach(slot => {
      slot.materialId = null;
      slot.material = null;
    });

    showPreview.value = false;
  }


  return {

    showPreview,

    jobId,

    is3D,

    previewUrl,

    imagePreviewUrl,

    uploadStatus,

    slots,

    selectedSurfaces,

    stats,

    openPreview,

    closePreview,

    reset,

  };
}
