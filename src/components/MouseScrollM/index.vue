<template>

  <div class="module-container" @wheel="handleWheel" @mouseleave="stopDrag" ref="draggable"
    @touchstart="startDrag($event, index)" @touchmove="onDrag" @touchend="stopDrag" @touchcancel="stopDrag">
    <div v-for="(module, index) in modules" :key="index" :class="['module', `module-${index}`]"
      :style="getModuleStyle(index)">
      <div class="module-container">
        <slot name="item-content" :module="module" :index="index">
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { throttle } from "lodash";

export default {
  components: {
  },
  props: {
    modules: Array,
    originHeight: {
      type: Number,
      default: 430,
    },
  },
  setup(props) {
    const scrollDistance = ref(0); // 初始滚动距离为0，加载时显示module1
    const moduleHeight = props.originHeight; // 每个模块的高度
    const isDragging = ref(false);
    const dragStartY = ref(0);
    const dragStartOffsetY = ref(0);
    const draggingModuleIndex = ref(null);
    const difHeight = ref(30);


    const maxScrollDistance = computed(() => {
      // 最大滚动距离为模块总高度
      return (props.modules.length - 1) * moduleHeight;
    });

    const startDrag = (event, index) => {
	  // event.preventDefault(); // 阻止浏览器滚动
	  isDragging.value = true;
	  draggingModuleIndex.value = index;
	  const touch = event.touches[0];
	  dragStartY.value = touch.clientY;
	  const rect = event.target.getBoundingClientRect();
	  dragStartOffsetY.value = touch.clientY - rect.top;
    };

    const onDrag = (event) => {
	  if (!isDragging.value || draggingModuleIndex.value === null) return;
	  const touch = event.touches[0];
	  const dy = dragStartY.value - touch.clientY;
		
	  if ((dy > 0 && scrollDistance.value < maxScrollDistance.value) ||
	  (dy < 0 && scrollDistance.value > 0) ) {
		event.preventDefault(); // 阻止浏览器滚动
	    // 更新 scrollDistance
	    scrollDistance.value = Math.max(
	    		  Math.min(scrollDistance.value + dy, maxScrollDistance.value),
	    		  0
	    );
	    		
	    // 重置 dragStartY 以便连续拖拽
	    dragStartY.value = touch.clientY;	
	  } 
    };

    const stopDrag = () => {
      isDragging.value = false;
      draggingModuleIndex.value = null;
    };

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
    const getDifHeight = () => {
      const module0 = document.querySelector('.module-0');
      const corner = document.querySelector('.crisis-card-top')
      if (module0 && corner) {
        const module0Rect = module0.getBoundingClientRect();
        const cornerRect = corner.getBoundingClientRect();
        const dif = (cornerRect.top - module0Rect.top) * 2 + cornerRect.height;
        difHeight.value = dif;
      } else {
        difHeight.value = 0;
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
      const translateY = offset >= index * difHeight.value ? Math.min(offset, moduleHeight) : index * difHeight.value;

      // 动态调整模块的层级，确保当前模块处于上层
      const zIndex = offset >= 0 ? props.modules.length - index : 0;
      // console.log('translateY', translateY);


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
      getDifHeight()
    });

    return {
      scrollDistance,
      maxScrollDistance,
      // debouncedHandleWheel,
      getModuleStyle,
      getTabStyleData,
      handleWheel,
      startDrag,
      onDrag,
      stopDrag,
    };
  },
};
</script>

<style scoped lang="less">
.module-container {
  position: relative;
  width: 100%;
  max-width: 390px;
  height: 100%;
  overflow: hidden;
  margin: 0 auto;
  box-sizing: border-box;
}

.module {
  height: 100%;
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s ease-out;
}
</style>
