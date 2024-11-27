<template>
	<el-card>
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <el-input v-model="state.queryForm.tableEngName" placeholder="表名"></el-input>
			</el-form-item>
			<el-form-item>
			  <el-input v-model="state.queryForm.tableCnName" placeholder="表中文名"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button @click="getDataList()" type="primary">查询</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" @selection-change="selectionChangeHandle">
			<!-- <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column> -->
			<!-- <el-table-column prop="id" label="主键id" header-align="center" align="center"></el-table-column> -->
			<el-table-column prop="tableEngName" show-overflow-tooltip label="表名" header-align="center" align="center"></el-table-column>
			<el-table-column prop="tableCnName" show-overflow-tooltip label="表中文名" header-align="center" align="center"></el-table-column>
			<fast-table-column prop="status" label="发布状态" header-align="center" align="center" dict-type='release_status'></fast-table-column>
			<el-table-column prop="releaseTime" label="发布时间" header-align="center" align="center" width="160" show-overflow-tooltip></el-table-column>
			<fast-creator-column prop="releaseUserId" label="发布人" header-align="center" align="center"></fast-creator-column>
			<el-table-column prop="description" show-overflow-tooltip label="描述" header-align="center" align="center"></el-table-column>
			<fast-table-org-column prop="orgId" label="所属机构" header-align="center" align="center"></fast-table-org-column>
			<fast-creator-column prop="creator" label="创建者" header-align="center" align="center"></fast-creator-column>
			<el-table-column prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="300">
				<template #default="scope">
					<el-button type="primary" link @click="fillData(scope.row)">数据填报</el-button>
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

		<!-- 字段配置-->
		<TableFillData ref="tableFillDataRef"></TableFillData>
	</el-card>
</template>

<script setup lang="ts" name="Data-integrateData-fill-tableIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import TableFillData from './table-fill-data.vue'
import { IHooksOptions } from '@/hooks/interface'

const state: IHooksOptions = reactive({
	dataListUrl: '/data-integrate/dataFillTable/page',
	deleteUrl: '/data-integrate/dataFillTable',
	queryForm: {
		status: 1,
		tableEngName: '',
		tableCnName: '',
	}
})

const tableFillDataRef = ref()
const fillData = (table) => {
	tableFillDataRef.value.init(table)
}



const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
