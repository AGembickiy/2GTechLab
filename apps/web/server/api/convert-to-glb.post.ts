import assimpjs from 'assimpjs';
import { defineEventHandler, readMultipartFormData, setHeader } from 'h3';

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event);
  const filePart = parts?.find((p) => p.type === 'file' && p.name === 'file');

  if (!filePart || !filePart.data || !filePart.filename) {
    event.node.res.statusCode = 400;
    return { error: 'Missing file' };
  }

  // assimpjs supports multi-file imports via FileList; we pass just one file.
  const ajs = await assimpjs();
  const fileList = new ajs.FileList();
  fileList.AddFile(filePart.filename, new Uint8Array(filePart.data));

  // Convert to binary glTF (GLB). This is broadly supported and easy to parse on the client.
  const result = ajs.ConvertFileList(fileList, 'glb2');
  if (!result.IsSuccess() || result.FileCount() === 0) {
    event.node.res.statusCode = 422;
    return {
      error: 'Conversion failed',
      code: result.GetErrorCode?.() ?? 'unknown',
    };
  }

  // Prefer first file (usually model.glb)
  const converted = result.GetFile(0);
  const outName = converted?.fileName ?? 'model.glb';
  const outData = converted?.fileContent ?? null;

  if (!outData) {
    event.node.res.statusCode = 500;
    return { error: 'Conversion produced no data' };
  }

  setHeader(event, 'Content-Type', 'model/gltf-binary');
  setHeader(event, 'Content-Disposition', `attachment; filename="${outName}"`);

  // Return raw bytes
  return Buffer.from(outData);
});

