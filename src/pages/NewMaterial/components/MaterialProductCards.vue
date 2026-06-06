<template>
  <div class="material-product-cards" @wheel="handleWheel">
    <div
      v-for="layer in visibleLayers"
      :key="layer.key"
      class="material-product-card-layer"
      :style="getLayerStyle(layer)"
    >
      <aa-module-content
        :title="layer.module.title"
        :topItems="layer.module.topItems"
        :introductionTitle1="layer.module.introductionTitle1"
        :introductionTitle2="layer.module.introductionTitle2"
        :applyTexts="layer.module.applyTexts"
        :advantages="layer.module.advantages"
        :imageUrl="layer.module.imageUrl"
        :isRow="layer.module.isRow"
        :tabStyle="getTabStyleData(layer.index)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { throttle } from "lodash";
import AaModuleContent from "@/components/AaModuleContent";

const props = defineProps({
  modules: {
    type: Array,
    default: () => [],
  },
});

const moduleHeight = 800;
const scrollStep = 30;
const activeIndex = ref(0);
const targetIndex = ref(null);
const direction = ref(0);
const progress = ref(0);

const resetTransition = () => {
  targetIndex.value = null;
  direction.value = 0;
  progress.value = 0;
};

const commitTransition = () => {
  if (targetIndex.value === null) return;
  activeIndex.value = targetIndex.value;
  resetTransition();
};

const cancelTransition = () => {
  resetTransition();
};

const startTransition = (nextDirection) => {
  const nextIndex = activeIndex.value + nextDirection;
  if (nextIndex < 0 || nextIndex >= props.modules.length) return false;

  targetIndex.value = nextIndex;
  direction.value = nextDirection;
  progress.value = 0;
  return true;
};

const advanceTransition = (nextDirection) => {
  if (targetIndex.value === null && !startTransition(nextDirection)) return;

  if (nextDirection === direction.value) {
    progress.value = Math.min(moduleHeight, progress.value + scrollStep);
  } else {
    progress.value = Math.max(0, progress.value - scrollStep);
  }

  if (progress.value >= moduleHeight) {
    commitTransition();
  } else if (progress.value === 0) {
    cancelTransition();
  }
};

const throttledAdvance = throttle(advanceTransition, 30, {
  leading: true,
  trailing: false,
});

const canHandleWheel = (nextDirection) => {
  if (!nextDirection || props.modules.length <= 1) return false;
  if (targetIndex.value !== null) return true;

  const nextIndex = activeIndex.value + nextDirection;
  return nextIndex >= 0 && nextIndex < props.modules.length;
};

const handleWheel = (event) => {
  const nextDirection = event.deltaY > 0 ? 1 : event.deltaY < 0 ? -1 : 0;
  if (!canHandleWheel(nextDirection)) return;

  event.preventDefault();
  throttledAdvance(nextDirection);
};

const visibleLayers = computed(() => {
  if (!props.modules.length) return [];

  if (targetIndex.value === null) {
    const module = props.modules[activeIndex.value];
    return module
      ? [{ key: `active-${activeIndex.value}`, role: "active", index: activeIndex.value, module }]
      : [];
  }

  const current = {
    key: `current-${activeIndex.value}`,
    role: "current",
    index: activeIndex.value,
    module: props.modules[activeIndex.value],
  };
  const target = {
    key: `target-${targetIndex.value}`,
    role: "target",
    index: targetIndex.value,
    module: props.modules[targetIndex.value],
  };

  return (direction.value > 0 ? [current, target] : [target, current]).filter(
    (layer) => layer.module
  );
});

const getLayerStyle = (layer) => {
  let translateY = 0;
  let zIndex = 1;

  if (targetIndex.value !== null) {
    if (direction.value > 0) {
      translateY = layer.role === "target" ? moduleHeight - progress.value : 0;
      zIndex = layer.role === "target" ? 2 : 1;
    } else {
      translateY = layer.role === "current" ? progress.value : 0;
      zIndex = layer.role === "current" ? 2 : 1;
    }
  }

  return {
    transform: `translateY(${translateY}px)`,
    zIndex,
  };
};

const getTabStyleData = (index) => {
  const marginLeft = index === 0 ? "1%" : `${1 + index * 19.7}%`;
  return {
    marginLeft,
    zIndex: props.modules.length - index,
  };
};

watch(
  () => props.modules.length,
  (length) => {
    const maxIndex = Math.max(0, length - 1);
    if (activeIndex.value > maxIndex) activeIndex.value = maxIndex;
    resetTransition();
  }
);
</script>

<style scoped>
.material-product-cards {
  margin: 222px 0;
  position: relative;
  width: 100%;
  height: 740px;
  overflow: hidden;
}

.material-product-card-layer {
  position: absolute;
  width: 100%;
  height: 740px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s ease-out;
}
</style>
