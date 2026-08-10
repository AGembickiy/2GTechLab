import type { UploadSlot, UploadStats } from '~/types/upload';
import type { PrintProject } from '~/types'
import { projectService } from '~/services/projectService'
import { converterService } from '~/services/converterService'

export function useUploadModel() {

  const showPreview = ref(false);

  const jobId = ref<number | null>(null);

  const is3D = ref(false);

  const previewUrl = ref<string | null>(null);

  const imagePreviewUrl = ref<string | null>(null);

  const uploadStatus = ref<string | null>(null);

  const currentProject = ref<PrintProject | null>(null);


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

  async function createProject(file: File) {

    const project = projectService.createProject(file)

    currentProject.value = project

    uploadStatus.value = project.status


    const convertedProject = await converterService.convert(project)


    currentProject.value = convertedProject

    uploadStatus.value = convertedProject.status


    return convertedProject

  }

  function updateProjectStatus(status: PrintProject['status']) {

    if (!currentProject.value)
      return

    currentProject.value.status = status

    currentProject.value.updatedAt = new Date().toISOString()

    uploadStatus.value = status

  }


  function reset() {

    currentProject.value = null;

    uploadStatus.value = null;

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

    currentProject,

    createProject,

    updateProjectStatus,

    slots,

    selectedSurfaces,

    stats,

    openPreview,

    closePreview,

    reset,

  }
}
