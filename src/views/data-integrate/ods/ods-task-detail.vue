<template>
	<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
		<el-form-item>
			<fast-select v-model="state.queryForm.ifSuccess" placeholder="是否成功" dict-type="yes_or_no" clearable></fast-select>
		</el-form-item>
		<el-form-item>
			<el-button type="primary" @click="getDataList()">查询</el-button>
		</el-form-item>
	</el-form>
	<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" @selection-change="selectionChangeHandle">
		<el-table-column prop="id" label="执行序号" header-align="center" align="center"  width="130px"></el-table-column>
		<el-table-column show-overflow-tooltip prop="sourceSchemaName" label="源端库名" header-align="center" align="center" width="150px"></el-table-column>
		<el-table-column show-overflow-tooltip prop="targetSchemaName" label="目的端库名" header-align="center" align="center" width="130px"></el-table-column>
		<el-table-column show-overflow-tooltip prop="sourceTableName" label="源端表名" header-align="center" align="center" width="130px"></el-table-column>
		<el-table-column show-overflow-tooltip prop="targetTableName" label="目的端表名" header-align="center" align="center" width="130px"></el-table-column>
		<el-table-column prop="syncCount" label="同步记录数" header-align="center" align="center" width="150px"></el-table-column>
		<el-table-column prop="syncBytes" label="同步数据量" header-align="center" align="center" width="150px"></el-table-column>
		<fast-table-column prop="ifSuccess" label="是否成功" header-align="center" align="center" dict-type="yes_or_no" width="130px"></fast-table-column>
		<el-table-column show-overflow-tooltip prop="successMsg" label="成功信息" header-align="center" align="center" width="150px"></el-table-column>
		<el-table-column show-overflow-tooltip prop="errorMsg" label="失败信息" header-align="center" align="center" width="150px"></el-table-column>
		<el-table-column prop="createTime" label="创建时间" header-align="center" align="center" width="130px"></el-table-column>
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
</template>

<script setup lang="ts" name="OdsTaskDetailIndex">
	import { useCrud } from '@/hooks'
	import { reactive, ref } from 'vue'
	import { IHooksOptions } from '@/hooks/interface'
	
	const state: IHooksOptions = reactive({
		createdIsNeed: false,
		dataListUrl: '/data-integrate/access/task-detail-page',
		queryForm: {
			ifSuccess: '',
			tableName: '',
			projectId: ''
		}
	})

	const init = (projectId: number, tableName?: any) => {
		state.queryForm.projectId = projectId
		state.queryForm.tableName = tableName
		getDataList()
	}
	
	const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
	
	defineExpose({
		init
	})
	
</script>

<style>
</style>