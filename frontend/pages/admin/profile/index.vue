<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth-check',
});
</script>

<template>
  <ProfileForm />
</template>
