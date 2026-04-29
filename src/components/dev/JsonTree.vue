<template>
  <div class="font-mono text-sm">
    <JsonTreeItem :data="data" :name="'root'" :depth="0" />
  </div>
</template>

<script setup lang="ts">
import JsonTreeItem from './JsonTreeItem.vue'

defineProps<{
  data: any
}>()
</script>
