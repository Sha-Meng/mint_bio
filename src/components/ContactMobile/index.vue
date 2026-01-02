<template>
	<div class="contact">
		<el-popover placement="left-end" width="370" trigger="manual" :visible="visible" :show-arrow="false"
			popper-class="contact-popover-w" :popper-options="popperOptions">
			<div class="contact-popover">
				<div class="contact-popover-close" @click="visible = !visible">
					<img src="@/assets/images/close.png" alt="close" />
				</div>
				<div class="contact-popover-content">
					<div class="contact-popover-content-left">
						<p class="contact-popover-content-left-title">{{ getText('contact.title') }}</p>
						<p class="contact-popover-content-left-tip">
							{{ getText('contact.subtitle') }}
							<br />{{ getText('contact.instruction') }}
						</p>
						<div class="contact-popover-content-left-form">
							<div class="contact-popover-content-left-form-item">

								<div class="contact-popover-content-left-form-item-input">
									<input type="text" :placeholder="getText('common.forms.placeholders.name')" v-model="formData.name" />
								</div>

								<div class="contact-popover-content-left-form-item-input">
									<input type="text" :placeholder="getText('common.forms.placeholders.email')" v-model="formData.email" />
								</div>

								<div class="contact-popover-content-left-form-item-input">
									<input type="text" :placeholder="getText('common.forms.placeholders.phone')" v-model="formData.phone" />
								</div>

								<div class="contact-popover-content-left-form-item-input">
									<input type="text" :placeholder="getText('common.forms.placeholders.messageWithDesc')" v-model="formData.message" />
								</div>
							</div>
							<div class="contact-popover-content-left-form-submit" @click="debouncedSubmit"
								:class="{ 'loading': isLoading }">
								<p class="contact-popover-content-left-form-submit-btn">{{ getText('common.buttons.submit') }}</p>
							</div>
						</div>
					</div>

					<div class="contact-popover-content-connection">
						<p class="contact-popover-content-connection-title">
							{{ getText('contact.alternativeContact') }}
						</p>
						<p class="contact-popover-content-connection-email">
							{{ getText('contact.email') }}
						</p>
						<div class="contact-popover-content-connection-bottom">
							<img class="contact-popover-content-connection-qrcode" src="./images/QRcode.png"
								alt="QRcode" />
						<div class="bottom-right">
								<div>{{ getText('contact.followUsItems.companyUpdates') }}</div>
								<div>{{ getText('contact.followUsItems.productInfo') }}</div>
								<div>{{ getText('contact.followUsItems.industryNews') }}</div>
								<div>{{ getText('contact.followUsItems.frontierProgress') }}</div>
							</div>

						</div>
						<div>
							<p class="contact-popover-content-connection-desc mt30">
								{{ getText('contact.advisors.aminoAcid') }}
							</p>
							<p class="contact-popover-content-connection-desc counselor">
								TEL: 15937287752
							</p>
							<p class="contact-popover-content-connection-desc counselor">
								WECHAT: {{ getText('contact.wechat') }}
							</p>
							<img class="contact-popover-content-connection-qrcode" src="@/assets/images/wxCode.png" />

						</div>

						<div>
							<p class="contact-popover-content-connection-desc mt30">
								{{ getText('contact.advisors.materials') }}
							</p>
							<p class="contact-popover-content-connection-desc counselor">
								TEL: 19129376767
							</p>
							<p class="contact-popover-content-connection-desc counselor">
								WECHAT: {{ getText('contact.wechat') }}
							</p>
							<img class="contact-popover-content-connection-qrcode" src="@/assets/images/wxCode2.jpg" />

						</div>

						<div>
							<p class="contact-popover-content-connection-desc mt30">Oversea Business Contact:</p>
							<p>aminosales@mint-bio.com</p>
						</div>

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
	import {
		ref,
		reactive
	} from "vue";
	import axios from "axios";
	import {
		debounce
	} from "lodash";
	import { getText } from "@/utils/language";


	const visible = ref(false);
	const isLoading = ref(false);
	const formData = reactive({
		name: "",
		email: "",
		phone: "",
		message: "",
	});

	const popperOptions = ref({
		modifiers: [{
			name: "offset",
			options: {
				offset: [250, 0], // 控制水平和垂直偏移
			},
		}, ],
	});
	// 提交函数
	const submit = async () => {
		try {
			isLoading.value = true;
			if (!formData.name || !formData.email || !formData.phone || !formData.message) {
				alert(getText('common.forms.validation.required'));
				return;
			}
			// 校验 email 格式
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.email)) {
				alert(getText('common.forms.validation.invalidEmail'));
				return;
			}

			// 校验 phone 格式
			const phoneRegex = /^1[3-9]\d{9}$/;
			if (!phoneRegex.test(formData.phone)) {
				alert(getText('common.forms.validation.invalidPhone'));
				return;
			}
			const res = axios.post("http://8.155.35.138:8080/api/contact/submit", JSON.stringify(formData));
			if (res) {
				alert(getText('common.forms.validation.submitSuccess'));
				formData.name = '';
				formData.email = '';
				formData.phone = '';
				formData.message = '';
				visible.value = false; // 关闭弹窗
			}
		} catch (error) {
			if (error.response && error.response.status === 400) {
				alert(getText('common.forms.validation.formatError'));
			}
		} finally {
			isLoading.value = false;
		}
	};
	const debouncedSubmit = debounce(submit, 500); // 500 毫秒的防抖时间
</script>

<style lang="less">
	@media (max-width: 992px) {
		.el-popper.el-popover.contact-popover-w {
			background-color: #12161b !important;
			border-radius: 20px;
			border: 1px solid transparent;
			left: 10px !important;
			height: 80vh !important;
			overflow-y: auto !important;
			margin-bottom: 20px !important;

		}

		.contact-popover {
			white-space: normal;

			&-close {
				text-align: right;

				img {
					width: 54px;
					height: 54px;
				}
			}

			&-content {
				display: flex;
				flex-direction: column;
				align-items: flex-start;


				&-left {
					width: 370px;

					&-title {
						margin-bottom: 15px;
						font-size: 17px;
						font-weight: 500;
						color: #f1f3f7;
					}

					&-tip {
						font-size: 13px;
						font-weight: 500;
						color: #F1F3F780;
					}

					&-form {
						margin-top: 25px;

						&-item {
							&-label {
								margin-top: 15px;
								font-size: 15px;
								color: #f1f3f766;
							}

							&-input {
								input {
									width: 100%;
									border: none;
									border-bottom: 0.5px solid #f1f3f733;
									background-color: transparent;
									padding-top: 15px;
									padding-bottom: 10px;
									outline: none;
								}

								input::placeholder {
									color: #F1F3F7CC;
									opacity: 1;
								}
							}
						}

						&-submit {
							display: flex;
							justify-content: flex-start !important;
							margin-top: 20px !important;

							&-btn {
								width: 96px;
								height: 37px;
								line-height: 37px;
								text-align: center;
								color: #f1f3f7;
								border-radius: 8px;
								border: 1px solid #ffffff1a;
							}
						}
					}
				}



				&-connection {
					margin-top: 20px;
					color: #f1f3f7;

					&-title {
						font-size: 17px;
						font-weight: 500;
					}

					&-bottom {
						display: flex;
						justify-content: flex-start;
						gap: 5px;

						.bottom-right {
							display: flex;
							flex-direction: column;
							justify-content: space-between;
							color: #F1F3F780;
						}
					}

					&-email {
						margin-top: 30px;
						margin-bottom: 30px;
						font-size: 15px;
						font-weight: 500;
					}

					&-qrcode {
						width: 100px;
						height: 100px;
						margin: 0;
					}

					&-desc {
						margin-top: 37px;
						font-size: 12px;
						font-weight: 500;
					}
				}
			}

		}

		.contact-popover-overlay {
			position: fixed !important;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: rgba(0, 0, 0, 0.6);
			/* Semi-transparent background */
			z-index: 9;
			/* Ensure it's above the page content but below the popover */
		}
	}
</style>
<style lang="less" scoped>
	.contact {
		position: fixed;
		right: 0.5%;
		top: 60%;
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