<template>
	<div v-if="!showAocQuery">
		<el-card class="mb15">
			<div class="flex-between">
				<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
					<el-form-item>
						<el-input v-model="state.queryForm.name" style="width: 320px" placeholder="标签名称" clearable></el-input>
					</el-form-item>
					<el-form-item>
						<el-select v-model="state.queryForm.labelModelId" style="width: 320px" clearable filterable placeholder="标签实体">
							<el-option v-for="(item, index) in labelModelList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-form-item label="" prop="type">
							<fast-select
								v-model="state.queryForm.labelModelType"
								style="width: 320px"
								dict-type="label_model_type"
								placeholder="类型"
								clearable
								filterable
							></fast-select>
						</el-form-item>
					</el-form-item>
				</el-form>
				<div>
					<el-button @click="resetClick()">重置</el-button>
					<el-button type="primary" @click="getDataList()">查询</el-button>
				</div>
			</div>
		</el-card>
		<div class="flex-between mb15" style="background-color: #fff; padding: 4px 15px; border: 2px">
			<div v-if="isGrid">
				<span class="mr20" style="color: #7c7c7c">默认</span>
				<span>更新时间 </span>
				<span class="caret-wrapper">
					<i class="sort-caret ascending"></i>
					<i class="sort-caret descending"></i>
				</span>
			</div>
			<div v-else class="mr20" style="height: 34px; line-height: 34px">即席查询列表</div>
			<div style="font-size: 16px">
				<!-- <span style="color: #7c7c7c">为你找到{{ state.dataList.length }}条结果</span> -->
				<div class="cursorP" @click="changeGrid()">
					<el-icon v-if="isGrid"><Grid /></el-icon>
					<el-icon v-else><List /></el-icon>
				</div>
			</div>
		</div>
		<div v-if="isGrid" class="flex-start-top cardBox">
			<el-card v-for="(item, index) in state.dataList" :key="index" class="cardItem cursorP" shadow="hover" @click="adHocView(item)">
				<div class="imgBox"></div>
				<p class="lableText">即席查询</p>
				<div class="footer">
					<div class="line1 flex-between" style="margin: 4px 0">
						<span>{{ item.name }}</span>
						<Icon
							class="cursorP"
							:icon="!item.collect ? 'tabler:star' : 'tabler:star-filled'"
							:style="{ color: item.collect ? '#ffac33' : '#000', fontSize: '18px' }"
							@click.stop="collectClick(item)"
						/>
					</div>
					<div class="line2 flex-between">
						<span>
							<el-tag v-if="item.labelModelType == 1" type="success">数据表</el-tag>
							<el-tag v-if="item.labelModelType == 2" type="success">自定义 SQL</el-tag>
						</span>
						<p>{{ item.updateTime }}</p>
					</div>
				</div>
			</el-card>
		</div>
		<el-table v-else v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%">
			<el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
			<el-table-column prop="categoryId" label="标签类目" header-align="center" align="center" show-overflow-tooltip>
				<template #default="scope">
					{{ getNameById(categoryList, scope.row.categoryId) }}
				</template>
			</el-table-column>
			<el-table-column prop="labelModelId" label="标签实体" header-align="center" align="center" show-overflow-tooltip>
				<template #default="scope">
					{{ getNameById(labelModelList, scope.row.labelModelId) }}
				</template>
			</el-table-column>
			<el-table-column prop="name" label="标签名称" header-align="center" align="center" show-overflow-tooltip></el-table-column>
			<fast-table-org-column prop="orgId" label="所属机构" header-align="center" align="center" show-overflow-tooltip></fast-table-org-column>
			<el-table-column prop="labelModelType" label="类型" header-align="center" align="center" show-overflow-tooltip>
				<template #default="scope">
					<el-tag v-if="scope.row.labelModelType == 1" type="success">数据表</el-tag>
					<el-tag v-if="scope.row.labelModelType == 2" type="warning">自定义 SQL</el-tag>
				</template>
			</el-table-column>
			<fast-creator-column prop="creator" label="创建者" header-align="center" align="center" show-overflow-tooltip></fast-creator-column>
			<el-table-column prop="description" label="描述" header-align="center" align="center" show-overflow-tooltip></el-table-column>
			<el-table-column prop="updateTime" label="更新时间" header-align="center" align="center" width="160" show-overflow-tooltip></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="180">
				<template #default="scope">
					<el-button type="primary" link @click="overview(scope.row.id)">查看</el-button>
					<el-button type="primary" link @click="adHocView(scope.row)">即席查询</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-pagination
			:current-page="state.page"
			:page-sizes="state.pageSizes"
			:page-size="state.limit"
			:total="state.total"
			layout="total, sizes, prev, pager, next, jumper"
			@size-change="sizeChangeHandle"
			@current-change="currentChangeHandle"
		>
		</el-pagination>
		<Overview ref="overviewRef"></Overview>
	</div>
	<div v-if="showAocQuery" style="position: relative" class="animate__animated animate__slideInRight animate__faster">
		<el-icon @click="showAocQuery = false" class="cursorP" style="position: absolute; right: 10px; top: 10px; font-size: 18px"><CloseBold /></el-icon>
		<AocQuery ref="aocQueryRef"></AocQuery>
	</div>
</template>

<script setup lang="ts" name="Data-governanceLabel-queryIndex">
import { useCrud } from '@/hooks'
import { reactive, ref, onMounted, provide } from 'vue'
import { getCategoryListApi, getLabelTypesApi, getLabelModelsApi, onLabelApi, offLabelApi } from '@/api/data-governance/label'
import { IHooksOptions } from '@/hooks/interface'
import { Icon } from '@iconify/vue'
import { getNameById } from '@/utils/tool'
import Overview from '@/views/data-governance/label/label-edit.vue'
import AocQuery from './aoc-query.vue'

onMounted(() => {
	getLabelModelsApi().then(res => {
		labelModelList.value = res.data
	})
	getCategoryListApi().then(res => {
		categoryList.value = res.data
	})
})
const collectClick = item => {
	item.collect = !item.collect
}
const categoryList = ref([])
const labelModelList = ref([])
provide('labelModelList', labelModelList)
const state: IHooksOptions = reactive({
	dataListUrl: '/data-governance/label/page',
	deleteUrl: '/data-governance/label',
	queryForm: {
		limit: 999,
		categoryId: '',
		name: '',
		typeId: '',
		labelModelId: '',
		status: '1',
		labelModelType: ''
	}
})
const isGrid = ref(true)
const changeGrid = () => {
	isGrid.value = !isGrid.value
}

const overviewRef = ref()
const overview = id => {
	overviewRef.value.init(id, true)
}
const aocQueryRef = ref()
const showAocQuery = ref(false)
const adHocView = row => {
	// router.push({ path: '/data-governance/label-query/aoc-query', query: { name: row.name } })
	showAocQuery.value = true
	setTimeout(() => {
		aocQueryRef.value.init(row)
	}, 100)
}
const resetClick = () => {
	state.queryForm.categoryId = ''
	state.queryForm.name = ''
	state.queryForm.typeId = ''
	state.queryForm.labelModelId = ''
	state.queryForm.labelModelType = ''
	state.queryForm.status = ''
}
const { getDataList, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>

<style lang="less" scoped>
:deep(.el-button--primary.cardBtn) {
	background-color: #d8e9ff;
	color: #0059ff;
	border: 1px solid #d8e9ff;
}
:deep(.el-form--inline .el-form-item) {
	margin-bottom: 0 !important;
}
.contentBox {
	padding: 15px;
}
.caret-wrapper {
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	height: 34px;
	width: 24px;
	vertical-align: middle;
	cursor: pointer;
	overflow: initial;
	position: relative;
}
.sort-caret {
	width: 0;
	height: 0;
	border: 5px solid transparent;
	position: absolute;
	left: 7px;
}
.sort-caret.ascending {
	border-bottom-color: #c0c4cc;
	top: 5px;
}
.descending .sort-caret.descending {
	border-top-color: #409eff;
}
.sort-caret.descending {
	border-top-color: #c0c4cc;
	bottom: 7px;
}
.cardBox {
	flex-wrap: wrap;
	// justify-content: space-between !important
	// background: #fff;
	position: relative;
	.cardItem {
		width: calc(20% - 12px);
		height: 234px;
		margin-bottom: 15px;
		box-sizing: border-box;
		position: relative;
	}
	.lableText {
		position: absolute;
		top: 69px;
		left: 106px;
		color: #fff;
		font-size: 26px;
	}
	.imgBox {
		width: 100%;
		height: 166px;
		background-image: url('@/assets/cardBg.png');
		background-size: 100% auto;
		background-repeat: no-repeat;
	}
	.footer {
		padding: 2px 15px;
	}
	/* 设置默认间距为15px */
	.cardItem:nth-child(1n),
	.cardItem:nth-child(2n),
	.cardItem:nth-child(3n),
	.cardItem:nth-child(4n) {
		margin-right: 15px;
	}

	/* 将第5个元素及其倍数的间距设为0 */
	.cardItem:nth-child(5n) {
		margin-right: 0;
	}
	.cardItem:hover {
		box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09);
	}
	:deep(.el-card__body) {
		padding: 0 !important;
	}
	.nameBox {
		.name {
			font-weight: 700;
		}
		.desc {
			width: 120px;
			font-size: 12px;
			white-space: nowrap; /*强制内容在一行显示*/
			overflow: hidden; /*超出部分溢出*/
			text-overflow: ellipsis; /*溢出的部分使用省略号*/
		}
	}
}
.rd-datas {
	margin-top: 8px;
	> div {
		display: inline-block;
		label {
			width: 100px;
			font-size: 12px;
			// font-family: Alibaba-PuHuiTi-R, Alibaba-PuHuiTi;
			font-weight: normal;
			// color: rgba(2, 14, 25, 0.55);
		}
		p {
			display: inline-block;
			font-size: 12px;
			// font-family: Alibaba-PuHuiTi-R, Alibaba-PuHuiTi;
			font-weight: normal;
			// color: #020e19;
		}
	}
}
:deep(.el-card.bottom-part) {
	background: #f0f2f5 !important;
	border: 1px solid #f0f2f5;
}

</style>
