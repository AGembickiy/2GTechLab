import type {
  PrintProject,
  ProjectFile,
  SourceFileType,
} from '~/types'

function detectType(ext: string): SourceFileType {
  const e = ext.toLowerCase()

  if (
    [
      'stl',
      'obj',
      '3mf',
      'step',
      'stp',
      'iges',
      'igs',
      'fbx',
      'gltf',
      'glb',
      'blend',
    ].includes(e)
  ) {
    return '3d_model'
  }

  if (
    [
      'png',
      'jpg',
      'jpeg',
      'bmp',
      'webp',
      'svg',
    ].includes(e)
  ) {
    return 'image'
  }

  if (
    [
      'pdf',
      'dwg',
      'dxf',
      'cdr',
      'ai',
    ].includes(e)
  ) {
    return 'drawing'
  }

  return 'unknown'
}

export const projectService = {
  createProject(file: File): PrintProject {
    const ext = file.name.split('.').pop() ?? ''
    const now = new Date().toISOString()

    const projectFile: ProjectFile = {
      name: file.name,
      extension: ext,
      size: file.size,
      type: detectType(ext),
    }

    return {
      id: crypto.randomUUID(),
      status: 'uploaded',
      files: [projectFile],

      requirements: {
        material: [],
        dimensions: {},
        quality: 'standard',
      },

      createdAt: now,
      updatedAt: now,
    }
  },
}