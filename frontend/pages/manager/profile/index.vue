<script setup lang="ts">
definePageMeta({
  layout: 'manager',
  middleware: 'auth-check',
});
</script>

<template>
  <ProfileForm />
</template>
