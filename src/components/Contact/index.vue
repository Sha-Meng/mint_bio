<template>
  <div class="contact">
    <el-popover placement="left-start" trigger="manual" :visible="visible" :show-arrow="false"
      popper-class="contact-popover-w" :popper-options="popperOptions">
      <div class="contact-popover">
        <div class="contact-popover-close" @click="visible = !visible">
          <img src="@/assets/images/close.png" alt="close" />
        </div>
        <div class="contact-popover-content">
          <div class="contact-popover-content-left">
            <p class="contact-popover-content-left-title">洽谈合作</p>
            <p class="contact-popover-content-left-tip">
              感谢您对元素驱动的关注，如您对生物智造产品 &
              解决方案有兴趣或疑问，<br />使用1分钟填写下方表格，我们将尽快安排工作人员与您建联。
            </p>
            <div class="contact-popover-content-left-form">
              <div class="contact-popover-content-left-form-item">
                <div class="contact-popover-content-left-form-item-label">
                  姓名
                </div>
                <div class="contact-popover-content-left-form-item-input">
                  <input type="text" placeholder="您的姓名..." v-model="formData.name" />
                </div>
                <div class="contact-popover-content-left-form-item-label">
                  邮箱
                </div>
                <div class="contact-popover-content-left-form-item-input">
                  <input type="text" placeholder="您的邮箱..." v-model="formData.email" />
                </div>
                <div class="contact-popover-content-left-form-item-label">
                  电话
                </div>
                <div class="contact-popover-content-left-form-item-input">
                  <input type="text" placeholder="您的电话..." v-model="formData.phone" />
                </div>
                <div class="contact-popover-content-left-form-item-label">
                  请简单描述您的问题
                </div>
                <div class="contact-popover-content-left-form-item-input">
                  <input type="text" placeholder="您的留言..." v-model="formData.message" />
                </div>
              </div>
              <!-- <div class="contact-popover-content-left-form-submit-w"> -->
              <div class="contact-popover-content-left-form-submit" @click="debouncedSubmit"
                :class="{ 'loading': isLoading }">
                <p class="contact-popover-content-left-form-submit-btn">提交</p>
              </div>
              <!-- </div> -->
            </div>
          </div>
          <div class="contact-popover-content-divider">
            <img src="./images/divider.png" alt="divider" />
          </div>
          <div class="contact-popover-content-connection">
            <p class="contact-popover-content-connection-title">
              您也可以通过以下渠道找到我们
            </p>
			<div class="contact-popover-content-connection-tel">
				<div class="contact-popover-content-connection-tel-left">
					<p class="contact-popover-content-connection-desc mt30">
					  氨基酸产品顾问
					</p>
					<p class="contact-popover-content-connection-desc counselor">
					  TEL: 15937287752
					</p>
					<p class="contact-popover-content-connection-desc counselor">
					  WECHAT: 扫码添加
					</p>
					<img class="contact-popover-content-connection-qrcode" src="@/assets/images/wxCode.png" />
				</div>
				<div class="contact-popover-content-connection">
					<p class="contact-popover-content-connection-desc mt30">
					  新材料产品顾问
					</p>
					<p class="contact-popover-content-connection-desc counselor">
					  TEL: 19129376767
					</p>
					<p class="contact-popover-content-connection-desc counselor">
					  WECHAT: 扫码添加
					</p>
					<img class="contact-popover-content-connection-qrcode" src="@/assets/images/wxCode2.jpg" />
				</div>
			</div>
			
            
            <p class="contact-popover-content-connection-item email">
              邮箱：mkt@mint-bio.com
            </p>
			<div class="contact-popover-content-connection-tel">
				<div class="contact-popover-content-connection-tel-left">
					<img class="contact-popover-content-connection-qrcode" src="./images/QRcode.png" alt="QRcode" />
				</div>
				<div class="contact-popover-content-connection">
					<p class="contact-popover-content-connection-desc">Oversea Business Contact:</p>
					<p class="contact-popover-content-connection-desc mt30">
					  aminosales@mint-bio.com
					</p>
				</div>
			</div>
			<p class="contact-popover-content-connection-desc">关注公众号了解</p>
			<p class="contact-popover-content-connection-desc mt30">
			  公司动向、产品信息、行业新闻、前沿进展
			</p>
            
          </div>
        </div>
      </div>
      <template #reference>
        <div class="contact-btn" @click="visible = !visible">
          <div class="contact-btn-icon">
            <img src="@/assets/images/contact.png" alt="contact" />
          </div>
        </div>
      </template>
    </el-popover>
    <div v-if="visible" class="contact-popover-overlay" @click="visible = false"></div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";
import { debounce } from "lodash";
import emitter from '@/event/event';


const visible = ref(false);
const isLoading = ref(false);
const formData = reactive({
  name: "",
  email: "",
  phone: "",
  message: "",
});

const popperOptions = ref({
  modifiers: [
    {
      name: "offset",
      options: {
        offset: [250, 0], // 控制水平和垂直偏移
      },
    },
  ],
});
// 提交函数
const submit = async () => {
  try {
    isLoading.value = true;
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      alert("请填写完整信息");
      return;
    }
    // 校验 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('请输入有效的邮箱地址')
      return;
    }

    // 校验 phone 格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert('请输入有效的手机号码');
      return;
    }
    const res = axios.post("http://8.155.35.138:8080/api/contact/submit", JSON.stringify(formData));
    if (res) {
      alert("提交成功");
      formData.name = '';
      formData.email = '';
      formData.phone = '';
      formData.message = '';
      visible.value = false; // 关闭弹窗
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      alert('请求格式错误，请检查输入信息');
    }
  } finally {
    isLoading.value = false;
  }
};
const openPopover = () => {
  visible.value = true;
};
const debouncedSubmit = debounce(submit, 500); // 500 毫秒的防抖时间
onMounted(() => {
  emitter.on('open-popover', openPopover);
});

onBeforeUnmount(() => {
  emitter.off('open-popover', openPopover);
});
</script>

<style lang="less">
.el-popper.el-popover.contact-popover-w {
  // margin-right: 40px;
  height: 800px;
  overflow-y: auto;
  padding: 16px 18px 67px 50px;
  background-color: #2828289f !important;
  border-radius: 20px;
  border: 1px solid transparent;
  backdrop-filter: blur(10px);
  width: 90% !important;
  max-width: 1400px !important;
}

.contact-popover {
  &-close {
    text-align: right;

    img {
      width: 54px;
      height: 54px;
    }
  }

  &-content {
    display: flex;

    &-left {
      width: 560px;

      &-title {
        margin-bottom: 20px;
        font-size: 30px;
        font-weight: 500;
        color: #f1f3f7;
      }

      &-tip {
        font-size: 14px;
        font-weight: 500;
        color: #f1f3f7;
        height: 70px;
      }

      &-form {
        &-item {
          display: flex;
          flex-direction: column;
          gap: 15px;

          &-label {
            // margin-top: 35px;
            font-size: 14px;
            color: #f1f3f766;
          }

          &-input {
            input {
              width: 100%;
              color: #f1f3f7;
              background-color: transparent;
              border: none;
              border-bottom: 0.5px solid #f1f3f733;
              // padding-top: 35px;
              padding-bottom: 10px;
              outline: none;
            }

            input::placeholder {
              color: #f1f3f7;
              opacity: 1;
            }
          }
        }

        &-submit {
          display: flex;
          justify-content: center;
          margin-top: 30px;
          cursor: pointer;

          &.loading {
            pointer-events: none; // 禁用点击事件

            .contact-popover-content-left-form-submit-btn {
              position: relative;
              color: #ffffff1a;

              &::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 20px;
                height: 20px;
                border: 2px solid #ffffff1a;
                border-top-color: #f1f3f7;
                border-radius: 50%;
                animation: spin 1s linear infinite;
              }
            }
          }

          &-btn {
            width: 96px;
            height: 67px;
            line-height: 67px;
            text-align: center;
            color: #f1f3f7;
            border-radius: 999px;
            border: 1px solid #ffffff1a;
          }


        }
      }
    }

    &-divider {
      width: 16px;
      height: 530px;
      margin-left: 45px;
      margin-right: 69px;

      img {
        width: 100%;
        height: 100%;
      }
    }

    &-connection {
      height: 100%;
      color: #f1f3f7;

      &-title {
        font-size: 24px;
        font-weight: 500;
      }

      &-item {
        font-size: 20px;
        font-weight: 500;
      }

      .counselor {
        margin: 10px 0px;
      }

      .email {
        margin: 30px 0px
      }

      &-qrcode {
        width: 122px;
        height: 123px;
      }

      &-desc {
        font-size: 12px;
        font-weight: 500;
      }
	  
	  &-tel {
		display: flex;
		
		&-left{
			width: 200px;
			
			&-item{
				display: flex;
				flex-direction: column;
				gap: 15px;
				font-size: 20px;
				font-weight: 500;
			}
		}
		
		&-right{
		    &-item{
				height: 100%;
				font-size: 20px;
				font-weight: 500;
			}
		}
	  }
    }
  }
}

.contact-popover-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  /* Semi-transparent background */
  z-index: 9;
  /* Ensure it's above the page content but below the popover */
}
</style>
<style lang="less" scoped>
.contact {
  position: fixed;
  right: 0.5%;
  top: 55%;
  z-index: 1000;

  &-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100px;
    height: 80px;
    position: relative;
    border-radius: 100px;
    background-color: #0a0b10b2;

    // transition: all 0.5s;
    &-icon {
      width: 24px;
      height: 24px;

      img {
        width: 100%;
      }
    }
  }

  &-btn::after,
  &-btn::before {
    content: "";
    position: absolute;
    border: 2px solid #808184;
    width: 100px;
    height: 80px;
    border-radius: 100px;
    /* 添加动画 */
    animation: ellipse-rotate 3s infinite linear;
  }

  @keyframes ellipse-rotate {

    0%,
    100% {
      clip-path: inset(0 0 65% 0);
    }

    25% {
      clip-path: inset(0 65% 0 0);
    }

    50% {
      clip-path: inset(65% 0 0 0);
    }

    75% {
      clip-path: inset(0 0 0 65%);
    }
  }
}

.mt30 {
  margin-top: 30px;
}
</style>