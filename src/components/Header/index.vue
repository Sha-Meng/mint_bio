<template>
	<div class="header" :class="{ 'blur-background': shouldBlur }">
		<div class="header-left">
			<div class="header-left-logo" :style="{ cursor: 'pointer' }">
				<img src="@/assets/images/logo.png" alt="Logo" @click="handleJumps('home')" />
			</div>
		</div>

		<div class="header-middle">
			<div class="header-middle-left">
				<ul class="nav">
					<li class="nav-item" v-for="item in navData" :key="item.key" :class="{
			    'nav-item_current': item.state,
			    'has-submenu': item.submenu && item.submenu.length > 0,
			  }" @mouseover="setMouseOver(item)" @mouseleave="setMouseLeave(item)" @click.prevent="handleClick(item)">
						<router-link class="nav-item-link" :to="item.submenu.length
			      ? 'javascript:void(0)'
			      : { name: item.router }
			      " v-if="!item.submenu.length">
							{{ item.name }}
						</router-link>
						<span class="nav-item-link" v-else>
							{{ item.name }}
							<img :src="item.state ? item.iconUp : item.iconDown" alt="Toggle Icon"
								class="submenu-icon" />
						</span>

						<ul v-if="item.submenu && item.submenu.length" class="submenu">
							<li class="submenu-item" v-for="subItem in item.submenu" :key="subItem.key"
								@mouseover="setMouseOver(subItem)" @mouseleave="setMouseLeave(subItem)">
								<router-link :to="{ name: subItem.router }" class="submenu-item-link">
									{{ subItem.name }}
								</router-link>
							</li>
						</ul>
					</li>
				</ul>
			</div>

			<div class="header-middle-right">
				<div class="contactnav" @click="openContact">
					<div class="contactnav-item">
						<span>联系我们</span>
					</div>

				</div>
			</div>

		</div>

		<div class="header-right">
			<el-popover placement="bottom" width="891" trigger="manual" :visible="visible" :show-arrow="false"
				effect="dark" popper-class="header-popover" :popper-options="popperOptions">
				<div class="popover-content">
					<div class="popover-content-close" @click="visible = !visible">
						<img src="./images/close.png" alt="close" />
					</div>
					<div class="popover-content-menu">
						<div class="popover-content-menu-item">
							<p class="pointer" @click="handleJumps('bioIntelligent')">
								生物智造
							</p>
						</div>
						<div class="popover-content-menu-item">
							<p>产品</p>
							<p class="pointer" @click="handleJumps('material')">
								生物降解新材料
							</p>
							<p class="pointer" @click="handleJumps('aminoAcid')">
								生物合成氨基酸
							</p>
							<p class="pointer" @click="handleJumps('knotWeed')">
								节豆日粮解决方案
							</p>
						</div>
						<div class="popover-content-menu-item">
							<p>关于我们</p>
							<p class="pointer" @click="handleJumps('corporate')">企业介绍</p>
							<p class="pointer" @click="handleJumps('vision')">愿景与责任</p>
						</div>
						<div class="popover-content-menu-item">
							<p class="pointer" @click="handleJumps('mintNews')">发展动态</p>
						</div>
						<!-- <div class="popover-content-menu-item">
              <p>加入我们</p>
            </div>
            <div class="popover-content-menu-item">
              <p>下载中心</p>
            </div> -->
					</div>
					<div class="popover-content-language">
						<p class="popover-content-language-cn">简体中文</p>
						<!-- <p class="popover-content-language-en">ENGLISH</p>
            <div class="popover-content-download">
              <p>下载品牌手册</p>
              <img src="./images/download.png" alt="download" />
            </div> -->
					</div>
				</div>
				<template #reference>
					<div class="menu" @click="visible = !visible">
						<img src="./images/menu.png" alt="Menu" />
					</div>
				</template>
			</el-popover>
			<div v-if="visible" class="popover-overlay" @click="visible = false"></div>
		</div>
	</div>
</template>

<script setup>
	import {
		ref,
		inject,
		onMounted,
		onUnmounted,
		computed,
		effect
	} from "vue";
	import {
		useRouter,
		useRoute
	} from "vue-router";
	import {
		debounce
	} from "lodash";
	import emitter from "@/event/event";

	const router = useRouter();
	const route = useRoute();

	const navData = ref([{
			key: 0,
			name: "生物智造",
			router: "bioIntelligent",
			state: false,
			submenu: [],
			disabled: true,
		},
		{
			key: 1,
			name: "产品",
			router: "/",
			state: false,
			submenu: [{
					key: 1,
					name: "生物降解新材料",
					router: "material"
				},
				{
					key: 2,
					name: "生物合成氨基酸",
					router: "aminoAcid"
				},
				{
					key: 3,
					name: "节豆日粮解决方案",
					router: "knotWeed"
				},
			],
			iconUp: require("@/components/Header/images/arrow_up.png"),
			iconDown: require("@/components/Header/images/arrow_down.png"),
		},
		{
			key: 2,
			name: "关于我们",
			router: "/",
			state: false,
			submenu: [{
					key: 21,
					name: "企业介绍",
					router: "corporate"
				},
				{
					key: 22,
					name: "愿景与责任",
					router: "vision"
				},
			],
			iconUp: require("@/components/Header/images/arrow_up.png"),
			iconDown: require("@/components/Header/images/arrow_down.png"),
		},
		{
			key: 3,
			name: "发展动态",
			router: "mintNews",
			state: false,
			submenu: [],
			disabled: true,
		}
	]);
	const visible = ref(false);

	const bannerHeight = inject('bannerHeight');

	const isOverHeight = ref(false);

	const toggleBlurRoutes = ['/', 'home', 'bioIntelligent', 'corporate'];

	const openContact = () => {
		emitter.emit('open-popover')
	}

	const handleScroll = debounce(() => {
		// 如果当前路由不是首页，直接退出
		if (!toggleBlurRoutes.includes(route.name)) {
			return;
		}

		if (bannerHeight && bannerHeight.value !== undefined) {
			// 获取当前滚动位置
			const scrollY = window.scrollY;

			// 检查滚动位置是否超过 bannerHeight
			isOverHeight.value = scrollY > bannerHeight.value;
		}
	}, 500);

	const shouldBlur = computed(() => {
		return !toggleBlurRoutes.includes(route.name) || isOverHeight.value;
	});

	onMounted(() => {
		window.addEventListener('scroll', handleScroll);
	});

	onUnmounted(() => {
		window.removeEventListener('scroll', handleScroll);
	});

	const setMouseOver = (item) => {
		navData.value.forEach((navItem) => (navItem.state = false));
		item.state = true;
	};

	const setMouseLeave = (item) => {
		item.state = false;
	};

	const handleClick = (item) => {
		// 如果菜单项被禁用，阻止点击
		if (item.disabled) {
			return;
		}
		// 如果主菜单项有子菜单，阻止点击事件
		if (item.submenu && item.submenu.length > 0) {
			return;
		}
		// 如果没有子菜单，正常跳转
		const targetPath = item.router;
		if (router.currentRoute.value.path !== targetPath) {
			// 只有在目标路径与当前路径不同时才导航
			router.push({
				name: item.router
			});
		}
	};
	const handleJumps = (item) => {
		router.push({
			name: item
		});
	};

	const popperOptions = ref({
		modifiers: [{
			name: "offset",
			options: {
				offset: [-415, 30], // 控制水平和垂直偏移
			},
		}, ],
	});
</script>

<style lang="less">
	.el-popover.el-popper.header-popover {
		padding: 24px 26px 95px 72px;
		border-radius: 20px;
		background-color: #12161b;
	}

	.popover-content {

		&-close {
			margin-bottom: 62px;
			text-align: right;

			img {
				width: 54px;
				height: 54px;
			}
		}

		&-menu {
			display: flex;
			gap: 80px;

			&-item {
				display: flex;
				flex-direction: column;
				gap: 39px;

				p {
					font-size: 16px;
					font-weight: 500;
					color: #f1f3f7;
				}
			}
		}

		&-language {
			margin-top: 118px;
			display: flex;
			align-items: center;
			gap: 80px;

			&-cn,
			&-en {
				font-size: 16px;
				font-weight: 500;
				color: #f1f3f7;
			}
		}

		&-download {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 158px;
			height: 67px;
			color: #f1f3f7;
			border: 1px solid #ffffff1a;
			border-radius: 999px;
		}
	}

	.popover-overlay {
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
	@import "@/style/variable.less";

	.header {
		z-index: 10;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: space-around;
		padding-top: 16px;

		&-left {
			&-logo {
				width: 122px;
				height: 60px;

				img {
					width: 100%;
					height: 100%;
				}
			}
		}

		&-middle {
			width: 40%;
			display: flex;
			justify-content: space-between;

			&-left {
				width: 78%;

				.nav {
					width: 100%;
					display: flex;

					align-items: center;
					padding: 0;
					margin: 0;
					list-style: none;
					// border: 1px solid #fff;
					border-radius: 16px;
					// background-color: #2828289f;
					border: 1px solid transparent;
					background-image: linear-gradient(#282828, #292b2d),
						linear-gradient(185deg,
							rgba(255, 255, 255, 0.4) 2.12%,
							rgba(255, 255, 255, 0.3) 50%,
							rgba(255, 255, 255, 0.2) 70%,
							rgba(255, 255, 255, 0.1) 93.02%);
					background-origin: border-box;
					background-clip: content-box, border-box;

					.nav-item {
						position: relative;
						width: 25%;
						height: 54px;
						line-height: 54px;
						text-align: center;
						font-size: 16px;
						font-weight: 500;
						color: #fff;
						transition: background-color 0.3s ease, color 0.3s ease;
						cursor: pointer;

						&-link {
							display: block;
							width: 100%;
							height: 100%;
							text-decoration: none;
							color: inherit;
						}

						&-current {
							color: #ff7200;
						}

						&:hover {
							background-color: #ff7200;
							color: #fff;
							cursor: pointer;
						}

						&:first-child {
							border-top-left-radius: 16px;
							border-bottom-left-radius: 16px;
						}

						&:last-child {
							border-top-right-radius: 16px;
							border-bottom-right-radius: 16px;
						}

						&.nav-item_current {
							background-color: #ff7200;
							color: #fff;
						}

						&.has-submenu:hover {
							background-color: #ff7200;
						}

						.submenu {
							display: none;
							list-style: none;
							padding: 0;
							margin-top: 1px;
							position: absolute;
							top: 100%;
							left: 0;
							background-color: #2828289f;
							border-radius: 12px;
							opacity: 0;
							transition: opacity 0.3s ease;
							z-index: 10;
							white-space: nowrap;
						}

						&:hover .submenu {
							padding: 19px 26px;
							display: flex;
							box-sizing: border-box;
							gap: 8px;
							opacity: 1;
						}

						.submenu-icon {
							margin-left: 4px;
							width: 12px;
							vertical-align: middle;
						}
					}

					.submenu-item {
						// padding: 0 30px;
						// width: 100%;
						height: 72px;
						line-height: 72px;
						text-align: center;
						font-size: 16px;
						border-radius: 12px;
						background-color: #02030833;

						&-link {
							// margin: 0 30px;
							padding-right: 30px;
							display: block;
							width: 100%;
							height: 100%;
							text-decoration: none;
							color: inherit;
						}

						&:hover {
							background-color: #ff7200;
							color: #fff;
						}
					}
				}
			}

			&-right {
				width: 12%;
				display: flex;

				.contactnav {
					width: 100%;
					display: flex;

					align-items: center;
					padding: 0;
					margin: 0;
					list-style: none;
					// border: 1px solid #fff;
					border-radius: 16px;
					// background-color: #2828289f;
					border: 1px solid transparent;
					background-image: linear-gradient(#282828, #292b2d),
						linear-gradient(185deg,
							rgba(255, 255, 255, 0.4) 2.12%,
							rgba(255, 255, 255, 0.3) 50%,
							rgba(255, 255, 255, 0.2) 70%,
							rgba(255, 255, 255, 0.1) 93.02%);
					background-origin: border-box;
					background-clip: content-box, border-box;

					&-item {
						display: block;
						width: 100%;
						height: 100%;
						position: relative;
						
						line-height: 54px;
						text-align: center;
						font-size: 16px;
						font-weight: 500;
						color: #fff;
						transition: background-color 0.3s ease, color 0.3s ease;
						cursor: pointer;
					}
				}


			}

			&-right {
				.menu {
					width: 54px;

					img {
						width: 100%;
						height: 100%;
					}
				}
			}
		}

		.header::after {
			content: "";
			position: absolute;
			top: 0;
			/* 位于边框下方 */
			left: 50%;
			/* 水平居中 */
			width: 80%;
			/* 光晕的宽度 */
			height: 450px;
			/* 光晕的高度 */
			background: radial-gradient(55% 50% at 50% 0%,
					rgba(255, 255, 255, 0.5) 0%,
					rgba(255, 255, 255, 0) 100%);
			transform: translateX(-50%);
			filter: blur(20px);
			opacity: 0.1;
			pointer-events: none;
			/* 光晕不影响交互 */
		}

		.blur-background {
			backdrop-filter: blur(5px);
		}
	}
</style>