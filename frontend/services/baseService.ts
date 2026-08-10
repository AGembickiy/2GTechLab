export abstract class BaseService {

  protected get api() {
    const { $api } = useNuxtApp()
    return $api
  }

}