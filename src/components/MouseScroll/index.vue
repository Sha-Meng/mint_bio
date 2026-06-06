<template>
  <div class="module-container" @wheel="handleWheel">
    <div
      v-for="(module, index) in modules"
      :key="index"
      :class="['module', `module-${index}`]"
      :style="getModuleStyle(index)"
    >
      <aa-module-content
        :title="module.title"
        :topItems="module.topItems"
        :introductionTitle1="module.introductionTitle1"
        :introductionTitle2="module.introductionTitle2"
        :applyTexts="module.applyTexts"
        :advantages="module.advantages"
        :imageUrl="module.imageUrl"
        :isRow="module.isRow"
        :tabStyle="getTabStyleData(index)"
      ></aa-module-content>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import AaModuleContent from "@/components/AaModuleContent";
import { throttle } from "lodash";

export default {
  components: {
    AaModuleContent,
  },
  props: {
    modules: Array,
  },
  setup(props) {
    const scrollDistance = ref(0); // 初始滚动距离为0，加载时显示module1
    const moduleHeight = 800; // 每个模块的高度

    const maxScrollDistance = computed(() => {
      // 最大滚动距离为模块总高度
      return (props.modules.length - 1) * moduleHeight;
    });

    // 处理滚动事件，添加防止默认滚动的逻辑
    const handleWheel = (event) => {
		let delta = event.deltaY;
		if ((delta > 0 && scrollDistance.value < maxScrollDistance.value) ||
		(delta < 0 && scrollDistance.value > 0) ) {
		  event.preventDefault(); // 阻止浏览器滚动
		  // 节流控制逻辑
		  throttleWheel(event);
		} 
    };

    // 使用节流函数包装
    const throttleWheel = throttle((event) => {
      const delta = event.deltaY;
      const step = 30; // 每次滚动的步长
      if (delta > 0 && scrollDistance.value < maxScrollDistance.value) {
        scrollDistance.value = Math.min(
          scrollDistance.value + step,
          maxScrollDistance.value
        );
      } else if (delta < 0 && scrollDistance.value > 0) {
        scrollDistance.value = Math.max(scrollDistance.value - step, 0);
      }
    }, 30);

    const getModuleStyle = (index) => {
      // 计算每个模块相对于 scrollDistance 的偏移量
      const offset = index * moduleHeight - scrollDistance.value;

      // 计算模块的 translateY，确保模块滑入
      const translateY = offset >= 0 ? Math.min(offset, moduleHeight) : 0;

      // 动态调整模块的层级，确保当前模块处于上层
      const zIndex = offset >= 0 ? props.modules.length - index : 0;

      return {
        transform: `translateY(${translateY}px)`, // 控制模块的滑动位置
        zIndex: zIndex, // 控制模块层级，使当前模块显示在最上层
      };
    };

    const getTabStyleData = (index) => {
      const marginLeft = index === 0 ? "1%" : `${1 + index * 19.7}%`;
      const offset = index * moduleHeight - scrollDistance.value;
      const zIndex = offset >= 0 ? props.modules.length - index : 0;

      return {
        marginLeft: marginLeft,
        zIndex: zIndex,
      };
    };

    onMounted(() => {
      // 页面加载时，确保显示module1
      scrollDistance.value = 0;
    });

    return {
      scrollDistance,
      maxScrollDistance,
      // debouncedHandleWheel,
      getModuleStyle,
      getTabStyleData,
      handleWheel,
    };
  },
};
</script>

<style scoped>
.module-container {
  margin: 222px 0;
  position: relative;
  width: 100%;
  height: 740px;
  overflow: hidden;
}

.module {
  position: absolute;
  width: 100%;
  height: 740px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s ease-out;
}
</style>
