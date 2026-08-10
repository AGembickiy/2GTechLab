import type { SourceFileType } from '~/types'

const MODEL_EXTENSIONS = [
  '3mf',
  'stl',
  'obj',
  'step',
  'stp',
  'iges',
  'igs',
  'amf',
  'ply',
  'fbx',
  'glb',
  'gltf',
]

const IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'bmp',
  'gif',
  'tif',
  'tiff',
]

const DRAWING_EXTENSIONS = [
  'dwg',
  'dxf',
  'svg',
]

const DOCUMENT_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
]

function getExtension(file: File): string {
  return file.name
    .split('.')
    .pop()
    ?.toLowerCase() ?? ''
}

function detectType(file: File): SourceFileType {
  const extension = getExtension(file)

  if (MODEL_EXTENSIONS.includes(extension))
    return '3d_model'

  if (IMAGE_EXTENSIONS.includes(extension))
    return 'image'

  if (DRAWING_EXTENSIONS.includes(extension))
    return 'drawing'

  if (DOCUMENT_EXTENSIONS.includes(extension))
    return 'document'

  return 'unknown'
}

function isSupported(file: File): boolean {
  return detectType(file) !== 'unknown'
}

function needsConversion(file: File): boolean {
  return getExtension(file) !== '3mf'
}

function getTargetFormat(): '3MF' {
  return '3MF'
}

function getFileInfo(file: File) {
  return {
    name: file.name,
    extension: getExtension(file),
    type: detectType(file),
    size: file.size,
    supported: isSupported(file),
    needsConversion: needsConversion(file),
    targetFormat: getTargetFormat(),
  }
}

export const fileAnalyzer = {
  getExtension,
  detectType,
  isSupported,
  needsConversion,
  getTargetFormat,
  getFileInfo,
}