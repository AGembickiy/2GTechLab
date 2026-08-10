<script setup lang="ts">
import FileUpload from './FileUpload.vue'
import PrintSettings from './PrintSettings.vue'

const { form, derived } = useOrderForm()
</script>

<template>
  <form class="space-y-4">

    <FileUpload
      v-model="form.file"
      v-model:original-file="form.originalFile"
    />

    <PrintSettings
      v-model="form"
    />

  </form>
</template>