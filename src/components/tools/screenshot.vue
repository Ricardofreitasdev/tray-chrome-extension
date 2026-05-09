<template>
  <div>
    <button class="button" @click="handleCaptureScreenshot">
      Capturar print da aba
    </button>
  </div>
</template>

<script setup>
import useBrowserAction from '../../composables/useBrowserAction';

const { captureScreenshot } = useBrowserAction();

const handleCaptureScreenshot = async () => {
  await captureScreenshot();
};
</script>

<style lang="scss" scoped>
.button {
  background: $bg-color-2;
  border: none;
  padding: 8px;
  color: $text-color;
  cursor: pointer;
  border-radius: 4px;
  transition: ease-in-out 0.3s;

  &:hover {
    background: #383d44;
  }
}
</style>
