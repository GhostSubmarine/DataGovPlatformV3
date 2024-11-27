<template>
	<el-card body-style="height: calc(100vh - 220px )">
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <el-input v-model="state.queryForm.fromDbName" placeholder="来源库名称"></el-input>
			</el-form-item>
			<el-form-item>
			  <el-input v-model="state.queryForm.fromTableName" placeholder="来源表名称"></el-input>
			</el-form-item>
			<el-form-item>
			  <el-input v-model="state.queryForm.toDbName" placeholder="目的库名称"></el-input>
			</el-form-item>
			<el-form-item>
			  <el-input v-model="state.queryForm.toTableName" placeholder="目的表名称"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="getDataList()">查询</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" @selection-change="selectionChangeHandle">
			<el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
			<el-table-column show-overflow-tooltip="" prop="fromDbName" label="来源库名称" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="fromDbRemark" label="来源库注释" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="fromTableName" label="来源表名称" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="fromTableRemark" label="来源表注释" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="dataAccessName" label="数据接入名称" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="dataProductionTaskName" label="数据生产名称" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="toDbName" label="目的库名称" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="toDbRemark" label="目的库注释" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="toTableName" label="目的表名称" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="toTableRemark" label="目的表注释" header-align="center" align="center"></el-table-column>
			<fast-creator-column prop="creator" label="创建者" header-align="center" align="center"></fast-creator-column>
			<el-table-column show-overflow-tooltip prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
			<!-- <el-table-column show-overflow-tooltip prop="updater" label="更新者" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="updateTime" label="更新时间" header-align="center" align="center"></el-table-column> -->
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="150">
				<template #default="scope">
					<el-button type="primary" link @click="bloodColumn(scope.row.id)">字段血缘</el-button>
					<!-- <el-button type="primary" link @click="deleteBatchHandle(scope.row.id)">删除</el-button> -->
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
		
		<el-dialog v-model="columnsBlood" title="字段血缘" width="50%">
			<el-table :data="columnsBloodData" border style="width: 100%" @selection-change="selectionChangeHandle">
				<el-table-column prop="fromColumnName" label="来源字段名称" header-align="center" align="center"></el-table-column>
				<el-table-column prop="fromColumnRemark" label="来源字段注释" header-align="center" align="center"></el-table-column>
				<el-table-column prop="toColumnName" label="目的字段名称" header-align="center" align="center"></el-table-column>
				<el-table-column prop="toColumnRemark" label="目的字段注释" header-align="center" align="center"></el-table-column>
			</el-table>
		</el-dialog>
	</el-card>
</template>

<script setup lang="ts" name="Data-governanceData-bloodBlood-page">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import { IHooksOptions } from '@/hooks/interface'
import { listCloumnBloodByTbId } from '@/api/data-governance/dataBloodTb'

const columnsBlood = ref(false)
const columnsBloodData = ref([])

const state: IHooksOptions = reactive({
	dataListUrl: '/data-governance/dataBloodTb/page',
	deleteUrl: '/data-governance/dataBloodTb',
	queryForm: {
		fromDbName: '',
		fromTableName: '',
		toDbName: '',
		toTableName: '',
	}
})

const bloodColumn = (tbId: number) => {
	listCloumnBloodByTbId(tbId).then(res=>{
		columnsBloodData.value = res.data
		columnsBlood.value = true
	})
}

const addOrUpdateRef = ref()
const addOrUpdateHandle = (id?: number) => {
	addOrUpdateRef.value.init(id)
}

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
