<template>
  <div v-if="$toast.hasNotifications" class="messages">
    <span v-for="notification in $toast.notifications" :key="notification.id">{{
      notification.message
    }}</span>
  </div>
</template>

<script setup>
import { useToastStore } from '../store/toastStore';
const $toast = useToastStore();
</script>

<style lang="scss">
.messages {
  font-size: 14px;
  text-align: center;
  background: var(--app-bg);
  opacity: 0.9;
  width: 100%;
  position: fixed;
  left: 0;
  bottom: 5px;
  z-index: 1;
  padding: 10px;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  span {
    color: $text-color-2;
  }

  &:not(:empty) {
    margin: 0;
  }
}
</style>
