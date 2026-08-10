// Types exports
export * from './three/three-viewer'


// =============================
// Print Project Types
// =============================

export type SourceFileType =
  | '3d_model'
  | 'image'
  | 'drawing'
  | 'document'
  | 'unknown'


export type ProjectStatus =
  | 'draft'
  | 'uploaded'
  | 'analyzing'
  | 'waiting_confirmation'
  | 'converted_3mf'
  | 'ready_for_calculation'
  | 'production'
  | 'finished'


export interface ProjectFile {
  id?: string

  name: string

  type: SourceFileType

  extension: string

  size: number

  url?: string

  uploadedAt?: string
}


export interface PrintMaterial {
  name: string

  color: string

  quantity?: number
}


export interface PrintRequirements {

  material: PrintMaterial[]

  dimensions: {
    x?: number
    y?: number
    z?: number
  }

  infill?: number

  wallThickness?: number

  layerHeight?: number

  quality?: 
    | 'draft'
    | 'standard'
    | 'high'

}


export interface PrintProject {

  id?: string


  status: ProjectStatus


  files: ProjectFile[]


  description?: string


  requirements: PrintRequirements


  masterModel?: {

    format: '3MF'

    fileUrl?: string

    version?: string

  }


  calculation?: {

    materialWeight?: number

    printTime?: number

    materialCost?: number

    electricityCost?: number

    machineCost?: number

    laborCost?: number

    taxes?: number

    totalPrice?: number

  }


  createdAt?: string

  updatedAt?: string

}