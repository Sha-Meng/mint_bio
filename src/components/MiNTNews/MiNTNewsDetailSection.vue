<template>
  <div class="section-container">
    <div class="section-head" v-if="props.info.headPic">
      <div v-for="pic in props.info.headPic" :key="pic">
        <img :src="getImageUrl(pic)" />
      </div>
    </div>

    <div class="section-content">
      <div v-for="content in props.info.contents" :key="content.id">
        <div v-if="content.pic" class="pic">
          <img :src="getImageUrl(content.pic)" />
        </div>
		
		<div v-if="content.nopaddingpic" class="nopaddingpic">
		  <img :src="getImageUrl(content.nopaddingpic)" />
		</div>
		
		<div v-if="content.video" class="video">
			<video width="100%" controls :poster="getImageUrl(content.poster)">
			  <source :src="content.video" type="video/mp4" >
			您的浏览器不支持 video 标签。
			</video>
		</div>
		
		<!-- <div v-if="content.video" class="video">
			<video width="100%" controls :poster="getImageUrl(content.poster)">
			  <source :src="getVideoUrl(content.video)" type="video/mp4" >
			  您的浏览器不支持 video 标签。
			</video>
		</div> -->

		<div v-if="content.desc" class="section-desc">
		  <span > {{ content.desc }} </span>
		</div>
		
		<div v-if="content.strongText" class="section-desc">
		  <div v-html="content.strongText" class="new-strongText"></div>
		</div>

		<div v-if="content.richHtml" class="rich-html" v-html="content.richHtml"></div>

		<div v-if="content.quote && content.quote.length" class="section-quote" :style="{ borderLeftColor: props.categorycolor }">
		  <div v-for="(q, qi) in content.quote" :key="qi">
		    <div v-if="q.pic" class="pic">
		      <img :src="getImageUrl(q.pic)" loading="lazy" />
		    </div>

		    <div v-if="q.desc" class="section-desc">
		      <span>{{ q.desc }}</span>
		    </div>
		    <div v-if="q.strongText" class="section-desc">
		      <div v-html="q.strongText" class="new-strongText"></div>
		    </div>
		  </div>
		</div>

      </div>
    </div>

    <div class="section-footer" v-if="props.info.footerPic">
      <div v-for="pic in props.info.footerPic" :key="pic">
        <img :src="getImageUrl(pic)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { getImageUrl } from "@/utils/index";
import { getVideoUrl } from "@/utils/index";

const props = defineProps({
  info: {
    Object,
    required: true,
  },
  categorycolor: {
    type: String,
    default: '#e75a29',
  },
});
</script>
<style>
.new-strongText {
  font-size: 21px;
  line-height: 33px;
  font-family: MiSans VF;
}

.strong-text{
	font-weight: bold;
}

.orange-text {
  color: #e75a29;
  font-weight: 800;

}

.blue-text {
  color: #2d5bf6;
  font-weight: 800;

}

.green-text {
  color: #74d887;
  font-weight: 800;
}

.blue-green-text {
  color: #6bbea9;
  font-weight: 800;
}
</style>
<style lang="scss" scoped>
.section-container {
  width: 100%;

  .section-head,
  .section-footer {
    padding-bottom: 50px;

    img {
      width: 100%;
      object-fit: cover;
    }
  }

  .section-footer {
    margin-top: 100px;
  }

  .section-content {
    width: 100%;

    .pic {
      width: 100%;
      margin: 50px 0px;

      img {
        width: 100%;
        height: 100%;
      }
    }
	
	.nopaddingpic {
	  width: 100%;
	  margin: 0px 0px;
	
	  img {
	    width: 100%;
	    height: 100%;
	  }
	}
	
	.video{
		width: 100%;
		.video_fill{
			width: 100%;
			object-fit: fill;
		}
	}

    .section-desc {
      margin-top: 50px;
      white-space: pre-wrap;
      color: white;

      span {
        font-size: 21px;
        font-weight: 330;
        line-height: 33px;
        font-family: MiSans;
      }


    }

    .rich-html {
      margin-top: 50px;
      width: 100%;
    }

    .section-quote {
      margin-top: 50px;
      padding: 4px 0 4px 24px;
      border-left: 3px solid #e75a29;

      // 引用块内部第一个 desc/strongText 不再额外 margin-top，避免和 padding 叠加
      > div:first-child .section-desc,
      > div:first-child .pic {
        margin-top: 0;
      }

      // 引用块内块间距收紧
      .section-desc {
        margin-top: 20px;
      }

      .pic {
        margin: 20px 0;

        img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}

@media screen and (max-width: 922px) {
  .section-container {
    width: 100%;

    .section-head {
      font-size: 20px;
      font-weight: 520;
      line-height: 26.52px;
      text-align: left;
      padding-bottom: 0px;
      padding-top: 40px;
    }


    .section-content {
      margin: 20px 0;

      span {
        font-size: 12px;
        font-weight: 450;
        line-height: 23.87px;
        color: #f1f3f7;
      }

      .pic {
        height: 240px;
        border-radius: 12px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .newsinfo-time {
        margin-left: 24px;
      }

      .section-desc {
        margin-top: 20px;
        white-space: pre-wrap;

        span {
          color: white;
          font-size: 14px;
          line-height: 23px;
        }
      }

      .rich-html {
        margin-top: 20px;
        width: 100%;
      }

      .section-quote {
        margin-top: 20px;
        padding: 4px 0 4px 12px;
        border-left: 2px solid #e75a29;

        .section-desc {
          margin-top: 10px;
        }

        > div:first-child .section-desc,
        > div:first-child .pic {
          margin-top: 0;
        }

        .pic {
          margin: 10px 0;
        }
      }

    }





  }

}
</style>