<template>
	<div style="display: flex; flex-direction: column; height: calc(100vh - 120px)">
		<div class="mb15 flex-between-top box" style="background-color: #fff; border-radius: 4px; padding: 15px 15px 0">
			<div class="flex-start" style="margin-left: 20px; flex: 1">
				<el-form :inline="true">
					<template v-for="(item, index) in state.columns" :key="index">
						<el-form-item v-if="!showMore ? index < 6 : true">
							<el-date-picker
								v-if="item.filedTypeClassName == 'java.sql.Timestamp'"
								v-model="item.conditionVal"
								style="width: 210px"
								type="datetime"
								:placeholder="item.remarks ? `${item.fieldName}(${item.remarks})` : `${item.fieldName}`"
								format="YYYY-MM-DD hh:mm:ss"
								value-format="YYYY-MM-DD hh:mm:ss"
							/>
							<el-date-picker
								v-if="item.filedTypeClassName == 'java.sql.Time'"
								v-model="item.conditionVal"
								style="width: 210px"
								type="datetime"
								:placeholder="item.remarks ? `${item.fieldName}(${item.remarks})` : `${item.fieldName}`"
								format="hh:mm:ss"
								value-format="hh:mm:ss"
							/>
							<el-date-picker
								v-if="item.filedTypeClassName == 'java.sql.Date'"
								v-model="item.conditionVal"
								style="width: 210px"
								type="datetime"
								:placeholder="item.remarks ? `${item.fieldName}(${item.remarks})` : `${item.fieldName}`"
								format="YYYY-MM-DD"
								value-format="YYYY-MM-DD"
							/>
							<el-input
								v-if="
									item.filedTypeClassName != 'java.sql.Timestamp' &&
									item.filedTypeClassName != 'java.sql.Time' &&
									item.filedTypeClassName != 'java.sql.Date'
								"
								v-model="item.conditionVal"
								style="width: 210px"
								:placeholder="item.remarks ? `${item.fieldName}(${item.remarks})` : `${item.fieldName}`"
							></el-input>
						</el-form-item>
					</template>
				</el-form>
			</div>
			<div style="width: 200px; margin-right: 50px" class="mb15 flex-end-top">
				<el-button type="primary" @click="adHocQuery">查询</el-button>
				<div class="ml10">
					<div class="flex-end" style="color: #667afa" @click="showMore = !showMore">
						<span class="cursorP">{{ showMore ? '收起' : '展开' }}</span>
						<Icon class="cursorP" :icon="showMore ? 'icon-park:up' : 'icon-park:down'" style="color: #667afa; font-size: 26px" />
					</div>
				</div>
			</div>
		</div>
		<!-- 表格数据 -->
		<div class="mb15" style="background-color: #fff; border-radius: 4px; padding: 15px; flex: 1">
			<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%">
				<el-table-column
					v-for="(column, index) in state.columns"
					:key="index"
					show-overflow-tooltip
					:prop="column.fieldName"
					:label="column.remarks ? `${column.fieldName}(${column.remarks})` : `${column.fieldName}`"
				>
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
		</div>
	</div>
</template>
<script setup lang="ts" name="Data-governanceLabel-queryIndex">
import { useCrud } from '@/hooks'
import { reactive, ref, onMounted } from 'vue'
import { getLabelTypesApi, getColumnsByLabelIdApi, getLabelPageApi } from '@/api/data-governance/label'
import { IHooksOptions } from '@/hooks/interface'
import { Icon } from '@iconify/vue'
const init = (data) => {
	state.queryForm.labelId = data.id
	getColumnsByLabelIdApi(state.queryForm.labelId).then(res => {
		state.columns = res.data
	})
	adHocQuery()
}
const showMore = ref(true)
const state: IHooksOptions = reactive({
	requestMethod: 'post',
	createdIsNeed: false,
	dataListUrl: '/data-governance/label/table-data',
	queryForm: {
		typeId: '',
		labelId: '',
		conditionConfigs: []
	},
	columns: []
})
const adHocQuery = () => {
	state.queryForm.conditionConfigs = state.columns
	state.dataList = []
	getDataList()
}
defineExpose({
	init
})
const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
<style lang="less" scoped>
:deep(.box .el-form--inline .el-form-item) {
	margin-bottom: 14px !important;
}
</style>