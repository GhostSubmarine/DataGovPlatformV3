<template>
	<el-dialog :close-on-click-modal="false" title="资源详情" append-to-body v-model="visible" width="65%">
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <el-input v-model="state.queryForm.mountName" placeholder="资源名称"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button @click="getDataList()" v-if="market" type="primary">查询</el-button>
				<el-button @click="getDataList()" v-else>查询</el-button>
			</el-form-item>
			<el-form-item v-if="!market">
				<el-button type="primary" @click="addOrUpdateHandle()" v-if="!market">挂载资源</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="warning" @click="checkStatus()" v-if="!market">有效性检测</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="warning" @click="getDbInfo()" v-if="!market">数据库表</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="warning" @click="getApiInfo()" v-if="!market">API</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="warning" @click="getFileInfo()" v-if="!market">文件</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" >
			<el-table-column align="center" type="index" label="序号" width="60" />
			<fast-table-column prop="mountType" label="资源类型" dict-type="mount_type" header-align="center" align="center"></fast-table-column>
			<el-table-column show-overflow-tooltip align="center" prop="mountName" label="资源名称"/>
			<el-table-column align="center" prop="status" label="状态">
				<template #default="scope">
					<el-tag type="success" v-if="scope.row.status==1">有效</el-tag>
					<el-tag type="danger" v-if="scope.row.status==0">失效</el-tag>
				</template>
			</el-table-column>
			<el-table-column show-overflow-tooltip align="center" prop="checkLog" label="检测日志"/>
			<fast-creator-column prop="creator" label="操作人" header-align="center" align="center"></fast-creator-column>
			<el-table-column show-overflow-tooltip prop="updateTime" label="挂载时间" header-align="center" align="center"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="150">
				<template #default="scope">
					<el-button type="primary" link @click="deleteHandle(scope.row.id)" v-if="!market">解绑</el-button>
					<el-button type="primary" link @click="apply(scope.row)" v-if="market">申请</el-button>
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
		<AddMount ref="addMountRef" @refreshDataList="refreshDataList"></AddMount>
		<ApplyAddOrUpdate ref="applyRef" @refreshDataList="getDataList"></ApplyAddOrUpdate>
	</el-dialog>
</template>

<script setup lang="ts">
import { useCrud } from '@/hooks'
import { useRouter } from 'vue-router'
import { reactive, ref } from 'vue'
import AddMount from './add-mount.vue'
import { IHooksOptions } from '@/hooks/interface'
import { ElMessage, ElMessageBox } from 'element-plus/es'
import service from '@/utils/request'
import { checkStatusApi } from '@/api/data-assets/resourceMount'
import ApplyAddOrUpdate from '../../data-market/my-apply/add-or-update.vue'

const emit = defineEmits(['refreshDataList'])

const refreshDataList = () => {
	getDataList()
	emit("refreshDataList")
}

const deleteHandle = (id: number) => {
	ElMessageBox.confirm('确定解绑?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
	.then(() => {
		if (state.deleteUrl) {
			service.delete(state.deleteUrl + "/" + id).then(() => {
				ElMessage.success('解绑成功')
				getDataList()
				emit("refreshDataList")
			})
		}
	})
	.catch(() => {})
}

const router = useRouter()
const visible = ref(false)
const state: IHooksOptions = reactive({
	createdIsNeed: false,
	dataListUrl: '/data-assets/resource-mount/page',
	deleteUrl: '/data-assets/resource-mount',
	queryForm: {
		resourceId: '',
		mountName: ''
	}
})

const market = ref()
const init = (resourceItem: any) => {
	market.value = resourceItem.market
	visible.value = true
	state.queryForm.resourceId = resourceItem.id
	getDataList()
}

const addMountRef = ref()
const addOrUpdateHandle = (id?: number) => {
	addMountRef.value.init(id, state.queryForm.resourceId)
}
const getDbInfo = () => {
	visible.value = false
	sessionStorage.setItem("queryApply", 0)
	sessionStorage.setItem("resourceId", state.queryForm.resourceId)
	router.push({ path: '/data-assets/resource/db-resource', query: { id: state.queryForm.resourceId } })
}

const getApiInfo = () => {
	visible.value = false
	sessionStorage.setItem("queryApply", 0)
	sessionStorage.setItem("apiResourceId", state.queryForm.resourceId)
	router.push({ path: '/data-assets/resource/api-resource'})
}

const getFileInfo = () => {
	visible.value = false
	sessionStorage.setItem("queryApply", 0)
	sessionStorage.setItem("fileResourceId", state.queryForm.resourceId)
	router.push({ path: '/data-assets/resource/file-resource' })
}

const applyRef = ref()
const apply = (resourceMount) => {
	applyRef.value.init(resourceMount)
}

const checkStatus = () => {
	checkStatusApi(state.queryForm.resourceId).then(res=>{
		ElMessage.success("检测完成！")
		getDataList()
	})
}

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)

defineExpose({
	init
})	
</script>
