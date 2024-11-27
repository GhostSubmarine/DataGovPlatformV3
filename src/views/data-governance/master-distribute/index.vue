<template>
	<el-card body-style="height: calc(100vh - 170px )">
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <el-input v-model="state.queryForm.name" placeholder="名称"></el-input>
			</el-form-item>
			<el-form-item>
			  <fast-select v-model="state.queryForm.distributeType" dict-type="distribute_type" placeholder="派发类型" clearable></fast-select>
			</el-form-item>
			<el-form-item>
			  <fast-select v-model="state.queryForm.status" dict-type="release_status" placeholder="状态" clearable></fast-select>
			</el-form-item>
			<el-form-item>
				<el-button @click="getDataList()">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="addOrUpdateHandle()">新增</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" max-height="calc(100vh - 400px )" @selection-change="selectionChangeHandle">
			<!-- <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column> -->
			<!-- <el-table-column prop="id" label="主键id" header-align="center" align="center"></el-table-column> -->
			<!-- <el-table-column prop="masterModelId" label="主数据id" header-align="center" align="center"></el-table-column> -->
			<el-table-column prop="name" label="名称" header-align="center" align="center"></el-table-column>
			<fast-table-org-column prop="orgId" label="所属机构" header-align="center" align="center"></fast-table-org-column>
			<fast-table-column prop="distributeType" label="派发类型" header-align="center" align="center" dict-type='distribute_type'></fast-table-column>
			<fast-table-column prop="status" label="状态" header-align="center" align="center" dict-type='release_status'></fast-table-column>
			<el-table-column prop="taskType" label="类型" header-align="center" align="center" width="160">
				<template #default="scope">
					<el-tag v-show="scope.row.taskType == 2" >{{ getDictLabel(store.appStore.dictList, "distribute_task_type",  scope.row.taskType ) }}</el-tag>
					<el-tag v-show="scope.row.taskType == 3" type="warning">{{ getDictLabel(store.appStore.dictList, "distribute_task_type",  scope.row.taskType ) }}</el-tag>
				</template>
			</el-table-column>
			<el-table-column prop="cron" label="cron表达式" header-align="center" align="center" width="120">
				<template #default="scope">
					<el-tag>{{scope.row.cron?scope.row.cron:'无'}}</el-tag>
				</template>
			</el-table-column>
			<el-table-column prop="description" show-overflow-tooltip label="描述" header-align="center" align="center"></el-table-column>
			<el-table-column prop="releaseTime" label="发布时间" header-align="center" align="center" show-overflow-tooltip></el-table-column>
			<fast-creator-column prop="releaseUserId" label="发布人" header-align="center" align="center"></fast-creator-column>
			<fast-creator-column prop="creator" label="创建者" header-align="center" align="center"></fast-creator-column>
			<el-table-column prop="createTime" label="创建时间" header-align="center" align="center" show-overflow-tooltip></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="150">
				<template #default="scope">
					<el-dropdown>
					   <span class="el-dropdown-link">
					     操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
					   </span>
					   <template #dropdown>
					     <el-dropdown-menu>	
							<el-dropdown-item @click="seeLog(scope.row.id)">执行记录</el-dropdown-item>
							<el-dropdown-item @click="release(scope.row.id)" :disabled="scope.row.status == 1">发布</el-dropdown-item>
							<el-dropdown-item @click="cancel(scope.row.id)" :disabled="scope.row.status == 0">取消发布</el-dropdown-item>
							<el-dropdown-item @click="handRun(scope.row.id)">手动执行</el-dropdown-item>
							<el-dropdown-item @click="addOrUpdateHandle(scope.row.id)" :disabled="scope.row.status == 1">修改</el-dropdown-item>
							<el-dropdown-item @click="deleteBatchHandle(scope.row.id)" :disabled="scope.row.status == 1">删除</el-dropdown-item>
					     </el-dropdown-menu>
					   </template>
					 </el-dropdown>
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

		<!-- 弹窗, 新增 / 修改 -->
		<add-or-update ref="addOrUpdateRef" @refreshDataList="getDataList"></add-or-update>
		<PageLog ref="pageLogRef"></PageLog>
	</el-card>
</template>

<script setup lang="ts" name="Data-governanceMaster-distributeIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import AddOrUpdate from './add-or-update.vue'
import { IHooksOptions } from '@/hooks/interface'
import store from '@/store'
import { getDictLabel } from '@/utils/tool'
import { releaseApi,cancelApi,handRunApi } from '@/api/data-governance/masterDistribute'
import { ElMessage,ElMessageBox } from 'element-plus/es'
import PageLog from './page-log.vue'

const state: IHooksOptions = reactive({
	dataListUrl: '/data-governance/master-distribute/page',
	deleteUrl: '/data-governance/master-distribute',
	queryForm: {
		name: '',
		distributeType: '',
		status: ''
	}
})

const addOrUpdateRef = ref()
const addOrUpdateHandle = (id?: number) => {
	addOrUpdateRef.value.init(id)
}
const release = (id: number) => {
	ElMessageBox.confirm('确定发布吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
	.then(() => {
		releaseApi(id).then(res=>{
			ElMessage.success("发布成功")
			getDataList()
		})
	})
	.catch(() => {})
}
const cancel = (id: number) => {
	ElMessageBox.confirm('确定取消发布吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
	.then(() => {
		cancelApi(id).then(res=>{
			ElMessage.success("取消发布成功")
			getDataList()
		})
	})
	.catch(() => {})
}
const handRun = (id: number) => {
	ElMessageBox.confirm('确定执行吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
	.then(() => {
		handRunApi(id).then(res=>{
			ElMessage.success("执行成功")
		})
	})
	.catch(() => {})
}

const pageLogRef = ref()
const seeLog = (id: number) => {
	pageLogRef.value.init(id)
}

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>

<style scoped lang="scss">
.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
}
</style>