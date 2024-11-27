<template>
	<div>
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
				<el-input v-model="state.queryForm.name" placeholder="名称"></el-input>
			</el-form-item>
			<el-form-item>
				<fast-select v-model="state.queryForm.previlege" dict-type="yes_or_no" placeholder="是否私有" clearable filterable></fast-select>
			</el-form-item>
			<el-form-item>
				<el-select v-model="state.queryForm.sqlDbType" clearable filterable placeholder="sql库类型">
						<el-option :key="1" label="数据库" :value="1"></el-option>
						<el-option :key="2" label="中台库" :value="2"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-select v-model="state.queryForm.databaseId"
									 clearable
									 filterable 
						   placeholder="数据库">
				  <el-option v-for="(item,index) in state.databaseList"
							 :key="item.id"
							 :label="`[${item.id}]${item.name}`"
							 :value="item.id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button @click="getDataList()" type="primary">查询</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" highlight-current-row  @current-change="apiCurrentChange">
			<el-table-column show-overflow-tooltip label="分组" header-align="center" align="center" width="150">{{state.path}}</el-table-column>
			<el-table-column prop="path" show-overflow-tooltip label="api地址" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="name" label="名称" header-align="center" align="center"></el-table-column>
			<el-table-column prop="status" label="状态" header-align="center" align="center">
				<template #default="scope">
					<el-tag v-show="scope.row.status == 0" type="info">未发布</el-tag>
					<el-tag v-show="scope.row.status == 1" type="success">已发布</el-tag>
				</template>
			</el-table-column>
			<fast-table-column prop="previlege" label="私有" dict-type="yes_or_no" header-align="center" align="center"></fast-table-column>
			<fast-creator-column prop="creator" label="创建者" header-align="center" align="center"></fast-creator-column>
			<el-table-column show-overflow-tooltip prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
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
</template>

<script setup lang="ts" name="Data-serviceApi-configIndex">
import { useCrud } from '@/hooks'
import { reactive, ref, onMounted,inject } from 'vue'
import { IHooksOptions } from '@/hooks/interface'
import { listDatabase } from '@/api/data-integrate/database'

onMounted(()=>{
	getDatabaseList()
})

const databaseList = ref([])

const getDatabaseList = () => {
	listDatabase().then(res => {
		state.databaseList = res.data
	})
}

const state: IHooksOptions = reactive({
	createdIsNeed: false,
	databaseList: [],
	dataListUrl: '/data-service/api-config/page',
	deleteUrl: '/data-service/api-config',
	path: '',
	queryForm: {
		groupId: '',
		name: '',
		path: '',
		contentType: '',
		status: 1,
		sqlDbType: '',
		databaseId: '',
		previlege: '',
		openTrans: ''
	}
})

const init = (groupId: number, path: any) => {
	state.queryForm.groupId = groupId
	state.path = path
	getDataList()
}

const apiMountInfo = inject("apiMountInfo")
const apiCurrentChange = (row) => {
	row.parentPath = state.path
	console.log(row)
	apiMountInfo.value = row
}

 
const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle, downloadHandle } = useCrud(state)

defineExpose({
	init
})
</script>

<style>
	
</style>