<template>
	<div class="part5layout">
		<div class="title">
			<div class="percentblock">
				<span class="percent">60</span>
				<span class="sub">%</span> 
			</div>
			<div class="titledetailblock">
				<span class="titledetailcontent">{{ getText('bioIntelligent.future.line1') }}</span><br />
				<span class="titledetailcontent">{{ getText('bioIntelligent.future.line2') }}</span>
			</div>
			
		</div>
		
		<div class="detail">
			<div class="detail1">
				<div class="box box11">
					<img :src="require('@/assets/BioIntelligent/productsolution.jfif')" />
				</div>
				<div class="box box12">
					<img :src="require('@/assets/BioIntelligent/newmaterial.png')" />
				</div>
				<div class="box box13">
					<img :src="require('@/assets/BioIntelligent/aminoacidsynthesis.jfif')" />
				</div>
			</div>
			
			<div class="detail2">
				<div class="box box21">
					<img src="@/assets/BioIntelligent/customsolution.png" />
				</div>
				
				<div class="box box22">
					<img src="@/assets/BioIntelligent/flow.png" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>

</script>

<style lang="scss">
	.part5layout {
		width: 1728px;
		height: 1668px;
		background-color: #111618;
		position: relative;
		
		.title{
			width: 100%;
			height: 30%;
			display: flex;
			align-items: center;
			justify-content: center;
			text-align: center;
			.percentblock{
				.percent{
					font-size: 200px;
					color: #ff7200;	
				}
				.sub{
					font-size: 100px;
					color: #ff7200;
					vertical-align: sub;
				}
			}
			
			.titledetailblock{
				width: 480px;
				height: 100px;
				text-align: left;
				line-height: 63.65px;
				margin-left: 50px;
				
				.titledetailcontent{
					color: white;
					font-size: 48px;
					
				}
			}
			
		}
		
		.detail{
			width: 82.4%;
			height: 60%;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			margin: auto;
			
			.box{
				width: 100%;
				height: 100%;
				border-radius: 15px;
				
				img{
					width: 100%;
					height: 100%;
					border-radius: 15px;
				}
			}
			
			.detail1{
				width: 100%;
				height: 46%;
				display: grid;
				grid-template-rows: repeat(2, 1fr);
				grid-template-columns: repeat(3, 1fr);
				gap: 10px;
				
				.box11{
					grid-row: 1 / 3;
					grid-column: 1 / 3;
				}

			}
			
			.detail2{
				width: 100%;
				height: 46%;
				display: grid;
				grid-template-rows: repeat(2, 1fr);
				grid-template-columns: repeat(3, 1fr);
				gap: 10px;
				
				.box21{
					grid-row: 1 / 3;
					grid-column: 1 / 3;
				}
				
				.box22{
					grid-row: 1 / 3;
				}
			}
			
		}
	}
</style>