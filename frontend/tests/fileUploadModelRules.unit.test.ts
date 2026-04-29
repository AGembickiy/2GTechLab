import { describe, expect, it } from 'vitest';
import {
  buildEditedGlbName,
  buildEditedStlName,
  getExtension,
  is3dLikeExtension,
} from '../utils/fileUploadModelRules';

describe('fileUploadModelRules', () => {
  it('поддерживает 3MF для загрузки и расчета', () => {
    expect(is3dLikeExtension('3mf')).toBe(true);
    expect(is3dLikeExtension('3MF')).toBe(true);
    expect(getExtension('detail.MODEL.3MF')).toBe('3mf');
  });

  it('не принимает не-3D расширения', () => {
    expect(is3dLikeExtension('pdf')).toBe(false);
    expect(is3dLikeExtension('png')).toBe(false);
  });

  it('создает стабильные имена edited-файлов', () => {
    expect(buildEditedStlName('model.3mf')).toBe('model-edited.stl');
    expect(buildEditedStlName('model-edited.3mf')).toBe('model-edited.stl');
    expect(buildEditedGlbName('part.stl')).toBe('part-edited.glb');
    expect(buildEditedGlbName('part-edited.stl')).toBe('part-edited.glb');
  });
});
