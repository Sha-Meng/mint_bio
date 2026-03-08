<template>
  <div class="module-container" @wheel="throttleWheel" @mousedown="handleDragStart" @mousemove="handleDrag"
    @mouseup="handleDragEnd" :ref="moduleContainer">
    <div v-for="(module, index) in modules" :key="index" :class="['module', `module-${index}`]"
      :ref="el => { if (el) setModuleRef(el, index) }" :style="getModuleStyle(index)">
      <div class="crisis-card">
        <div class="crisis-card-top"><span>{{ getText('mouseScroll.line1') }}</span>MiNT BiO<span></span><span>{{ getText('mouseScroll.line2') }}</span></div>
        <div class="crisis-card-title">{{ module.name }}</div>
        <div class="crisis-card-data">
          <img src="@/assets/images/crisis-back.png">
          <div class="crisis-card-data-text">{{ module.rate }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { throttle } from "lodash";
import { getText } from "@/utils/language";

export default {
  components: {
  },
  props: {
    modules: Array,
  },
  setup(props) {
    const scrollDistance = ref(0); // 初始滚动距离为0，加载时显示module1
    const activeIndex = ref(0);
    const moduleContainer = ref(null);
    const moduleRefs = ref([]);
    const difHeight = ref(0);

    const isDragging = ref(false);
    const dragStartY = ref(0);
    const initialScrollDistance = ref(0);

    const handleDragStart = (event) => {
      console.log('event', event);
      isDragging.value = true;
      dragStartY.value = event.clientY;
      initialScrollDistance.value = scrollDistance.value;
    };

    const handleDrag = (event) => {
      if (isDragging.value) {
        const deltaY = event.clientY - dragStartY.value;
        scrollDistance.value = initialScrollDistance.value + deltaY;
        // 阻止默认行为以防止页面滚动
        // event.preventDefault();
      }
    };

    const handleDragEnd = () => {
      isDragging.value = false;
      // 根据拖拽后的 scrollDistance 更新 activeIndex
      const index = Math.round(scrollDistance.value / difHeight.value);
      activeIndex.value = Math.min(Math.max(index, 0), 4);
    };

    const getDifHeight = () => {
      const module0 = document.querySelector('.module-0');
      const module0Rect = module0.getBoundingClientRect();
      const corner = document.querySelector('.crisis-card-top')
      const cornerRect = corner.getBoundingClientRect();
      const dif = (cornerRect.top - module0Rect.top) * 2 + cornerRect.height;
      difHeight.value = dif;
    };

    const getModuleTopDistance = (index, isEnter) => {
      const _index = index < 0 ? 0 : index

      const module0 = document.querySelector('.module-0');
      const moduleActive = document.querySelector(`.module-${_index}`);
      if (module0 && moduleActive) {
        const module0Rect = module0.getBoundingClientRect();
        const moduleActiveRect = moduleActive.getBoundingClientRect();
        const heightDifference = moduleActiveRect.top - module0Rect.top;
        if (heightDifference === (difHeight.value * _index)) {
          if (isEnter)
            activeIndex.value = _index + 1 < 5 ? _index + 1 : 4;
          else {
            setTimeout(() => {
              activeIndex.value = _index - 1 > 0 ? _index - 1 : 0;
            }, 600);
          }
        }
        console.log('moduleActiveRect.top, module0Rect.top, heightDifference,', _index, moduleActiveRect.top, module0Rect.top, heightDifference,);
      }
    }

    const handleWheel = (event) => {
      // event.preventDefault(); // 阻止浏览器滚动
      const deltaY = event.deltaY;
      getModuleTopDistance(activeIndex.value, deltaY > 0);
    };

    const throttleWheel = throttle(handleWheel, 600);
    const setModuleRef = (el, index) => {
      if (!moduleRefs.value[index]) {
        moduleRefs.value[index] = el;
      }
    };

    const getModuleStyle = (index) => {
      const translateY = index * difHeight.value - 435;
      console.log('translactiveIndexateY', activeIndex.value);
      if (index === 0)
        return {
          zIndex: index,
        };
      if (index === activeIndex.value || index < activeIndex.value)
        return {
          transform: `translateY(${translateY}px)`,
          zIndex: index,
        };
    };

    onMounted(() => {
      // 页面加载时，确保显示module1
      scrollDistance.value = 0;
      getDifHeight()
      console.log('moduleContainer', moduleContainer.value); // 调试信息
    });

    return {
      setModuleRef,
      scrollDistance,
      getModuleStyle,
      throttleWheel,
      handleDragStart,
      handleDrag,
      handleDragEnd,
      getText,
    };
  },
};
</script>

<style scoped lang="less">
.module-container {
  position: relative;
  height: 435px;
  overflow: hidden;
}

.module {
  position: absolute;
  left: 10px;
  width: calc(100% - 20px);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.5s ease-out;
}

.module-1,
.module-2,
.module-3,
.module-4 {
  top: 435px;
}



.crisis-card {
  padding: 10px;
  width: 370px;
  height: 284px;
  border-radius: 12px;
  background: #24272a;
  border: 1px solid;

  &-top {
    height: 10px;
    display: flex;
    justify-content: space-between;
    font-size: 8px;
    font-weight: 500;
    line-height: 10px;
    color: rgba(241, 243, 247, 0.5);
  }

  &-title {
    font-size: 20px;
    font-weight: 450;
    line-height: 26.52px;
    text-align: center;
    margin: 30px auto;
    color: white;
  }

  &-data {
    position: relative;
    width: 100%;
    height: 100%;

    img {
      width: 346px;
    }

    &-text {
      font-size: 40px;
      font-weight: 450;
      line-height: 22px;
      text-align: left;
      position: absolute;
      top: 52px;
      left: 105px;
      color: rgba(255, 114, 0, 1);
    }
  }
}
</style>