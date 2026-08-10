import { defineStore } from 'pinia'
import type { PrintProject, ProjectFile, PrintRequirements } from '~/types'


interface OrderState {

  orders: any[]

  currentOrder: any | null


  currentProject: PrintProject | null


  loading: boolean

  error: string | null

}


export const useOrderStore = defineStore('order', {

  state: (): OrderState => ({

    orders: [],

    currentOrder: null,


    currentProject: null,


    loading: false,

    error: null,

  }),



  actions: {


    // =====================
    // Existing order logic
    // =====================


    setOrders(orders: any[]) {

      this.orders = orders

    },


    setCurrentOrder(order: any | null) {

      this.currentOrder = order

    },


    setLoading(loading: boolean) {

      this.loading = loading

    },


    setError(error: string | null) {

      this.error = error

    },


    clearOrder() {

      this.currentOrder = null

      this.currentProject = null

      this.error = null

    },



    // =====================
    // Print Project Logic
    // =====================


    createProject() {


      const project: PrintProject = {

        status: 'draft',


        files: [],


        requirements: {

          material: [],


          dimensions: {}

        }

      }


      this.currentProject = project


      return project

    },



    addProjectFile(file: ProjectFile) {


      if (!this.currentProject) {

        this.createProject()

      }


      this.currentProject!.files.push(file)

    },



    updateRequirements(
      requirements: Partial<PrintRequirements>
    ) {


      if (!this.currentProject) {

        this.createProject()

      }


      this.currentProject!.requirements = {

        ...this.currentProject!.requirements,

        ...requirements

      }

    },



    setProjectStatus(status: PrintProject['status']) {


      if (!this.currentProject) {

        return

      }


      this.currentProject.status = status

    },



    resetProject() {

      this.currentProject = null

    }


  }

})