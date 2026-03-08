<template>
	<div class="part4layout-w">
		<div class="part4layout">

			<div class="content">
				<div class="columnbox">
					<div class="title">
						<span class="label"> {{ getText('bioIntelligent.platform.rawMaterial') }} </span>
					</div>
	
					<div class="detail">
						<div class="detail-list1">
							<span class="label">{{ getText('bioIntelligent.platform.chassis') }}</span>
						</div>
	
						<div class="detail-list2">
							<span class="label">{{ getText('bioIntelligent.platform.biomass') }}</span>
						</div>
					</div>
	
				</div>
				<div class="columnbox">
					<div class="title">
						<span class="label">{{ getText('bioIntelligent.platform.engine') }}<br />MiNT X Platform<br/>{{ getText('bioIntelligent.platform.engineDesc') }}</span>
					</div>
	
					<div class="detail">
						<div class="detail-list3">
							<span class="label">{{ getText('bioIntelligent.platform.strainOpt') }}</span>
						</div>
	
						<div class="detail-list4">
							<span class="label">{{ getText('bioIntelligent.platform.aiProtein') }}</span>
						</div>
	
						<div class="detail-list5">
							<span class="label">{{ getText('bioIntelligent.platform.screening') }}</span>
						</div>
					</div>
	
				</div>
				<div class="columnbox">
					<div class="title">
						<span class="label"> {{ getText('bioIntelligent.platform.base') }} </span>
					</div>
	
					<div class="detail">
						<div class="detail-list6">
							<span class="label">{{ getText('bioIntelligent.platform.extraction') }}</span>
						</div>
	
						<div class="detail-list7">
							<span class="label">{{ getText('bioIntelligent.platform.fermentation') }}</span>
						</div>
	
					</div>
				</div>
				<div class="columnbox">
					<div class="title">
						<span class="label"> {{ getText('bioIntelligent.platform.application') }} </span>
					</div>
					
					<div class="detail">
						<BioIntelligentApplication class="applicationlist1" :labeltext="getText('bioIntelligent.platform.feed')" picsrc="assets/Application/pig.png"></BioIntelligentApplication>
						<BioIntelligentApplication class="applicationlist2" :labeltext="getText('bioIntelligent.platform.packaging')" picsrc="assets/Application/package.png"></BioIntelligentApplication>
						<BioIntelligentApplication class="applicationlist3" :labeltext="getText('bioIntelligent.platform.mulchFilm')" picsrc="assets/Application/farm.png"></BioIntelligentApplication>
						<BioIntelligentApplication class="applicationlist4" :labeltext="getText('bioIntelligent.platform.appliance')" picsrc="assets/Application/electric.png"></BioIntelligentApplication>
						<BioIntelligentApplication class="applicationlist5" :labeltext="getText('bioIntelligent.platform.stationery')" picsrc="assets/Application/package.png"></BioIntelligentApplication>
						<BioIntelligentApplication class="applicationlist6" :labeltext="getText('bioIntelligent.platform.toy')" picsrc="assets/Application/toy.png"></BioIntelligentApplication>
					</div>
				</div>
	
			</div>
	
	
			<div class="progress">
	
				<MiNTProgress :coordinates="coordinates1" :uniqueId="'linearGradient1'" :widthheight="box"
					:strokeWidth="44.75" :axis="true" startcolor="#0082FB" endcolor="#FF7200" :startlinewidth="10">
				</MiNTProgress>
				<MiNTProgress :coordinates="coordinates2" :uniqueId="'linearGradient2'" :widthheight="box"
					:strokeWidth="44.75" :axis="true" startcolor="#0082FB" endcolor="#FF7200" :startlinewidth="10">
				</MiNTProgress>
				<MiNTProgress :coordinates="coordinates3" :uniqueId="'linearGradient3'" :widthheight="box"
					:strokeWidth="44.75" :axis="true" startcolor="#FF7200" endcolor="#64DD64"></MiNTProgress>
				<MiNTProgress :coordinates="coordinates4" :uniqueId="'linearGradient4'" :widthheight="box"
					:strokeWidth="44.75" :axis="true" startcolor="#64DD64" endcolor="#6E78DB"></MiNTProgress>
				<MiNTProgress :coordinates="coordinates5" :uniqueId="'linearGradient5'" :widthheight="box"
					:strokeWidth="44.75" :axis="true" startcolor="#64DD64" endcolor="#6E78DB"></MiNTProgress>
				<MiNTProgress :coordinates="coordinates6" :uniqueId="'linearGradient6'" :widthheight="box"
					:strokeWidth="44.75" :axis="true" startcolor="#64DD64" endcolor="#6E78DB"></MiNTProgress>
				<MiNTProgress :coordinates="coordinates7" :uniqueId="'linearGradient7'" :widthheight="box"
					:strokeWidth="44.75" :axis="true" startcolor="#64DD64" endcolor="#6E78DB"></MiNTProgress>
				<MiNTProgress :coordinates="coordinates8" :uniqueId="'linearGradient8'" :widthheight="box"
					:strokeWidth="44.75" :axis="true" startcolor="#64DD64" endcolor="#6E78DB"></MiNTProgress>
				<MiNTProgress :coordinates="coordinates9" :uniqueId="'linearGradient9'" :widthheight="box"
					:strokeWidth="44.75" :axis="true" startcolor="#64DD64" endcolor="#6E78DB"></MiNTProgress>
	
			</div>
		</div>
	</div>
</template>

<script setup>
	import {
		onMounted,
		ref,
		watch
	} from 'vue';

	import MiNTProgress from '@/components/MiNTProgress/MiNTProgress.vue'
	import BioIntelligentApplication from './BioIntelligentApplication.vue';

	const coordinates1 = ref([{
			x: 0 ,
			y: 108 
		},
		{
			x: 138.7 ,
			y: 56.88 
		},
	]);

	const coordinates2 = ref([{
			x: 0 ,
			y: 152.75 
		},
		{
			x: 138.7 ,
			y: 56.88 
		},
	]);

	const coordinates3 = ref([{
			x: 138.7 ,
			y: 202 
		},
		{
			x: 343.2 ,
			y: 64.55 
		},
	]);

	const coordinates4 = ref([{
			x: 343.2 ,
			y: 169.37 
		},
		{
			x: 526 ,
			y: 22.36 
		},
	]);

	const coordinates5 = ref([{
			x: 343.2 ,
			y: 169.37 
		},
		{
			x: 526 ,
			y: 89.77 
		},
	]);

	const coordinates6 = ref([{
			x: 343.2 ,
			y: 169.37 
		},
		{
			x: 526 ,
			y: 157.18 
		},
	]);

	const coordinates7 = ref([{
			x: 343.2 ,
			y: 169.37 
		},
		{
			x: 526 ,
			y: 224.59 
		},
	]);

	const coordinates8 = ref([{
			x: 343.2 ,
			y: 169.37 
		},
		{
			x: 526 ,
			y: 292 
		},
	]);

	const coordinates9 = ref([{
			x: 343.2 ,
			y: 169.37 
		},
		{
			x: 526 ,
			y: 359.41 
		},
	]);

	const box = ref({
		x: 550,
		y: 401.8,
	})
</script>

<style lang="scss" scoped>
	.part4layout {
		height: 100%;
		background-color: #111618;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;

		&-w{
			padding: 160px;
			height: 746px;
		}

		.progress {
			position: absolute;

			top: 27%;
			/* 设置第二个盒子的顶部位置与容器顶部对齐 */
			left: 38%;
			/* 设置第二个盒子的左侧位置与容器左侧对齐 */
			width: 58%;
			/* 设置第二个盒子的宽度 */
			height: 56%;

			/* 设置第二个盒子的背景色 */
			z-index: 1;
			/* 设置第二个盒子的z-index，确保它在第一个盒子之上 */
			opacity: 0.8;
			/* 可选：设置第二个盒子的透明度，以便可以看到下面的盒子 */
		}

		.content {
			width: 84%;
			height: 80%;
			display: grid;
			// grid-template-columns: repeat(4, 1fr);
			grid-template-columns: 1fr 1.2fr 1.2fr 0.9fr;
			z-index: 2;

			.columnbox {
				height: 100%;
				position: relative;
				// border: red solid 1px;

				.label {
					position: absolute;
					color: #F1F3F7;
					font-size: 20px;
					bottom: 0;
					white-space: pre;
					text-align: center;
				}

				.title {
					position: absolute;
					height: 10%;
					width: 100%;
					text-align: left;
					line-height: 26.5px;
				}

				.detail {
					position: absolute;
					top: 10%;
					height: 97%;
					width: 100%;
					
					.detail-list1 {
						position: absolute;
						width: 100%;
						left: 2%;
						top: 32%;
						text-align: left;
						// border: green 1px solid;
					}

					.detail-list2 {
						position: absolute;
						width: 100%;
						left: 2%;
						text-align: left;
						top: 40%;
					}

					.detail-list3 {
						position: absolute;
						width: 100%;
						left: 8%;
						text-align: left;
						top: 18%;
					}

					.detail-list4 {
						position: absolute;
						width: 100%;
						left: 8%;
						text-align: left;
						top: 35%;
					}

					.detail-list5 {
						position: absolute;
						width: 100%;
						left: 8%;
						text-align: left;
						top: 53%;
					}

					.detail-list6 {
						position: absolute;
						width: 100%;
						left: 10%;
						text-align: left;
						top: 20%;
					}

					.detail-list7 {
						position: absolute;
						width: 100%;
						left: 10%;
						text-align: left;
						top: 45%;
					}
					.applicationlist1 {
						position: absolute;
						top: 3%;
						left: 10px;
					}
					
					.applicationlist2 {
						position: absolute;
						top: 19%;
						left: 10px;
					}
					
					.applicationlist3 {
						position: absolute;
						top: 35%;
						left: 10px;
					}
					
					.applicationlist4 {
						position: absolute;
						top: 53%;
						left: 10px;
					}
					
					.applicationlist5 {
						position: absolute;
						top: 69%;
						left: 10px;
					}
					
					.applicationlist6 {
						position: absolute;
						top: 85%;
						left: 10px;
					}
				}



			}
		}
	}
</style>