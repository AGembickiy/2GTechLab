export function getExtension(name: string): string {
  const parts = name.split('.');
  return (parts.length > 1 ? (parts.at(-1) ?? '') : '').toLowerCase();
}

export function is3dLikeExtension(ext: string): boolean {
  return [
    '3mf',
    'stl',
    'obj',
    'gltf',
    'glb',
    'fbx',
    'dae',
    'blend',
    'skp',
    'igs',
    'iges',
    'step',
    'stp',
    'wrl',
    'vrml',
  ].includes(ext.toLowerCase());
}

export function buildEditedStlName(sourceName: string): string {
  const baseName = sourceName.replace(/\.[^/.]+$/, '');
  if (baseName.endsWith('-edited')) return `${baseName}.stl`;
  return `${baseName}-edited.stl`;
}

export function buildEditedGlbName(sourceName: string): string {
  const baseName = sourceName.replace(/\.[^/.]+$/, '');
  if (baseName.endsWith('-edited')) return `${baseName}.glb`;
  return `${baseName}-edited.glb`;
}
