import type { PrintProject } from '~/types'

export const converterService = {
  async convert(project: PrintProject): Promise<PrintProject> {
    project.status = 'analyzing'
    project.updatedAt = new Date().toISOString()

    // Временная имитация обработки модели.
    // Позже здесь будет вызов Django API.
    await new Promise((resolve) => setTimeout(resolve, 1000))

    project.masterModel = {
      format: '3MF',
      version: '1.0',
      fileUrl: `/projects/${project.id}/master.3mf`,
    }

    project.status = 'converted_3mf'
    project.updatedAt = new Date().toISOString()

    return project
  },

  /**
   * Временная реализация.
   * Пока backend отсутствует, возвращаем исходный файл.
   *
   * Позже здесь будет:
   * STL/OBJ/3DS/PLY/... → GLB через Django API.
   */
  async convertToGlb(file: File): Promise<File> {
    return file
  },
}