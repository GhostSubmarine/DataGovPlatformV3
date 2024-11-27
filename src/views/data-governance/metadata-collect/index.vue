<template>
	<el-card body-style="height: calc(100vh - 170px )">
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <el-input v-model="state.queryForm.name" placeholder="名称"></el-input>
			</el-form-item>
			<el-form-item>
			   <fast-select v-model="state.queryForm.strategy" dict-type="metadata_collect_strategy" placeholder="入库策略" clearable filterable></fast-select>
			</el-form-item>
			<el-form-item>
			   <fast-select v-model="state.queryForm.taskType" dict-type="metadata_collect_type" placeholder="任务类型" clearable filterable></fast-select>
			</el-form-item>
			<el-form-item>
				<el-button @click="getDataList()">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-button v-auth="'data-governance:metadata-collect:save'" type="primary" @click="addOrUpdateHandle()">新增</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" max-height="calc(100vh - 400px )" @selection-change="selectionChangeHandle">
			<!-- <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column> -->
			<!-- <el-table-column prop="id" label="主键id" header-align="center" align="center"></el-table-column> -->
			<el-table-column prop="name" label="任务名称" header-align="center" align="center"></el-table-column>
			<fast-table-org-column prop="orgId" label="所属机构" header-align="center" align="center"></fast-table-org-column>
			<fast-table-column prop="dbType" label="数据库类型" header-align="center" align="center" dict-type="db_type"></fast-table-column>
			<el-table-column prop="strategy" label="入库策略" header-align="center" align="center">
				<template #default="scope">
					<span>
						<el-tag v-if="scope.row.strategy == 0" type="success">全量</el-tag>
						<el-tag v-if="scope.row.strategy == 1" type="warning">增量</el-tag>
					</span>
				</template>
			</el-table-column>
			<fast-table-column prop="taskType" label="任务类型" header-align="center" align="center" dict-type="metadata_collect_type"></fast-table-column>
			<el-table-column prop="cron" label="cron表达式" header-align="center" align="center"></el-table-column>
			<el-table-column prop="status" label="发布状态" header-align="center" align="center">
				<template #default="scope">
					<span>
						<el-tag v-if="scope.row.status == 0" type="info">未发布</el-tag>
						<el-tag v-if="scope.row.status == 1" type="success">已发布</el-tag>
					</span>
				</template>
			</el-table-column>
			<el-table-column show-overflow-tooltip prop="releaseTime" label="发布时间" header-align="center" align="center"></el-table-column>
			<fast-creator-column prop="creator" label="创建者" header-align="center" align="center"></fast-creator-column>
			<el-table-column show-overflow-tooltip prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="330">
				<template #default="scope">
					<el-button type="primary" link @click="getInfo(scope.row.id)">查看</el-button>
					<el-button type="primary" link @click="getCollectRecord(scope.row.id)">采集记录</el-button>
					<el-button v-auth="'data-governance:metadata-collect:hand-run'" type="primary" link @click="handRun(scope.row.id)">执行</el-button>
					<el-button v-if="scope.row.status == 0" v-auth="'data-governance:metadata-collect:release'" type="primary" link @click="release(scope.row.id)">发布</el-button>
					<el-button v-if="scope.row.status == 1" v-auth="'data-governance:metadata-collect:cancel'" type="primary" link @click="cancel(scope.row.id)">取消发布</el-button>
					<el-button v-if="scope.row.status == 0" v-auth="'data-governance:metadata-collect:update'" type="primary" link @click="addOrUpdateHandle(scope.row.id)">编辑</el-button>
					<el-button v-if="scope.row.status == 0" v-auth="'data-governance:metadata-collect:delete'" type="primary" link @click="deleteBatchHandle(scope.row.id)">删除</el-button>
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
		<info ref="infoRef"></info>
		<Record ref="recordRef"></Record>
	</el-card>
</template>

<script setup lang="ts" name="Data-governanceMetadata-collectIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import AddOrUpdate from './add-or-update.vue'
import Info from './info.vue'
import Record from './record.vue'
import { ElMessageBox,ElMessage } from 'element-plus/es'
import { IHooksOptions } from '@/hooks/interface'
import { releaseApi, cancelApi,handRunApi } from '@/api/data-governance/metadataCollect'

const state: IHooksOptions = reactive({
	dataListUrl: '/data-governance/metadata-collect/page',
	deleteUrl: '/data-governance/metadata-collect',
	queryForm: {
		name: '',
		strategy: '',
		taskType: ''
	}
})

const addOrUpdateRef = ref()
const addOrUpdateHandle = (id?: number) => {
	addOrUpdateRef.value.init(id)
}

const release = (id) => {
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

const cancel = (id) => {
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
const infoRef = ref()
const getInfo = (id) => {
	infoRef.value.init(id)
}

const recordRef = ref()
const getCollectRecord = (id) => {
	recordRef.value.init(id)
}

const handRun = (id) => {
	ElMessageBox.confirm('确定执行吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
		.then(() => {
			handRunApi(id).then(res => {
				ElMessage.success("手动执行成功")
			})
		})
		.catch(() => {})
}


const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
