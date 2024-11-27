<template>
	<div style="padding-left: 20px;">
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <el-input v-model="state.queryForm.name" placeholder="名称"></el-input>
			</el-form-item>
			<el-form-item>
			  <fast-select v-model="state.queryForm.status" dict-type="yes_or_no" placeholder="是否启用" clearable></fast-select>
			</el-form-item>
			<el-form-item>
			  <fast-select v-model="state.queryForm.taskType" dict-type="quality_config_task_type" placeholder="任务类型" clearable></fast-select>
			</el-form-item>
			<el-form-item>
			  <fast-select v-model="state.queryForm.qualityType" dict-type="quality_type" placeholder="检测类型" clearable></fast-select>
			</el-form-item>
			<el-form-item>
			  <el-input v-model="state.queryForm.dataProv" placeholder="数据提供方"></el-input>
			</el-form-item>
			<el-form-item>
			  <el-input v-model="state.queryForm.dutyUser" placeholder="负责人"></el-input>
			</el-form-item>
			<el-form-item>
			  <el-input v-model="state.queryForm.dutyPhone" placeholder="负责人电话"></el-input>
			</el-form-item>
			<el-form-item>
			  <el-input v-model="state.queryForm.dutyEmail" placeholder="负责人邮箱"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button @click="getDataList()">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="addOrUpdateHandle()">新增</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="danger" @click="deleteBatchHandle()">删除</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%">
			<el-table-column prop="name" label="名称" header-align="center" align="center" show-overflow-tooltip=""></el-table-column>
			<el-table-column prop="status" label="启用状态" header-align="center" align="center">
				<template #default="scope">
					<span><el-tag v-show="scope.row.status==0" type="danger">已关闭</el-tag></span>
					<span><el-tag v-show="scope.row.status==1" type="success">已启用</el-tag></span>
				</template>
			</el-table-column>
			<el-table-column prop="taskType" label="任务类型" header-align="center" align="center">
				<template #default="scope">
					<span><el-tag v-show="scope.row.taskType==1" type="info">一次性任务</el-tag></span>
					<span><el-tag v-show="scope.row.taskType==2" type="warning">周期性任务</el-tag></span>
				</template>
			</el-table-column>
			<fast-table-column show-overflow-tooltip prop="qualityType" dict-type="quality_type" label="检测类型" header-align="center" align="center"></fast-table-column>
			<el-table-column show-overflow-tooltip prop="cron" label="cron表达式" header-align="center" align="center"></el-table-column>
			<el-table-column prop="dataProv" label="数据提供方" header-align="center" align="center" show-overflow-tooltip></el-table-column>
			<el-table-column prop="dutyUser" label="负责人" header-align="center" align="center" show-overflow-tooltip></el-table-column>
			<el-table-column prop="dutyPhone" label="负责人电话" header-align="center" align="center" show-overflow-tooltip></el-table-column>
			<el-table-column prop="dutyEmail" label="负责人邮箱" header-align="center" align="center" show-overflow-tooltip></el-table-column>
			<fast-creator-column prop="creator" label="创建者" header-align="center" align="center"></fast-creator-column>
			<el-table-column show-overflow-tooltip prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="300">
				<template #default="scope">
					<el-button type="primary" link @click="handRun(scope.row.id)">执行</el-button>
					<el-button type="primary" link @click="reportClick(scope.row)">评估报告</el-button>
					<el-button type="primary" v-if="scope.row.status==0" link @click="online(scope.row.id)">启用</el-button>
					<el-button type="primary" v-if="scope.row.status==1" link @click="offline(scope.row.id)">关闭</el-button>
					<el-button type="primary" v-if="scope.row.status==0" link @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
					<el-button type="primary" link @click="deleteBatchHandle(scope.row.id)">删除</el-button>
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
		<Report ref="reportRef"></Report>
		<!-- 弹窗, 新增 / 修改 -->
		<add-or-update ref="addOrUpdateRef" @refreshDataList="getDataList"></add-or-update>
	</div>
</template>

<script setup lang="ts" name="Data-governanceQuality-configIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import AddOrUpdate from './add-or-update.vue'
import { IHooksOptions } from '@/hooks/interface'
import { onlineApi,offlineApi,handRunApi } from '@/api/data-governance/qualityConfig'
import { ElMessage,ElMessageBox } from 'element-plus/es'
import Report from './report.vue'

const state: IHooksOptions = reactive({
	createdIsNeed: false,
	dataListUrl: '/data-governance/quality-config/page',
	deleteUrl: '/data-governance/quality-config',
	queryForm: {
		name: '',
		status: '',
		qualityType: '',
		taskType: '',
		startTime: '',
		endTime: '',
	}
})

const addOrUpdateRef = ref()
const addOrUpdateHandle = (id?: number) => {
	addOrUpdateRef.value.init(id, state.queryForm.categoryId)
}

const reportRef = ref()
const reportClick = (row) => {
	reportRef.value.init(row)
}

const handRun = (id?: number) =>{
	ElMessageBox.confirm('确定手动执行吗?', '提示', {
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

const online = (id?: number) =>{
	ElMessageBox.confirm('确定上线吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
	.then(() => {
		onlineApi(id).then(res=>{
			ElMessage.success("上线成功")
			getDataList()
		})
	})
	.catch(() => {})
	
}

const offline = (id?: number) =>{
	ElMessageBox.confirm('确定下线吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
	.then(() => {
		offlineApi(id).then(res=>{
			ElMessage.success("下线成功")
			getDataList()
		})
	})
	.catch(() => {})
}

const init = (categroy: any) => {
	state.queryForm.categoryId = categroy.id
	getDataList()
}

defineExpose({
	init
})

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
