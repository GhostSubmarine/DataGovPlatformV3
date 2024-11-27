<template>
	<el-dialog v-model="visible" title="添加项目成员" :close-on-click-modal="false">
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()" >
			<el-form-item>
				<el-input v-model="state.queryForm.username" placeholder="用户名" clearable></el-input>
			</el-form-item>
			<el-form-item>
				<el-input v-model="state.queryForm.mobile" placeholder="手机号" clearable></el-input>
			</el-form-item>
			<el-form-item>
				<fast-select v-model="state.queryForm.gender" dict-type="user_gender" clearable placeholder="性别"></fast-select>
			</el-form-item>
			<el-form-item>
				<el-button @click="getDataList()">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="addProjectUser()">添加</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" @selection-change="selectionChangeHandle">
			<el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
			<el-table-column prop="username" label="用户名" header-align="center" align="center"></el-table-column>
			<el-table-column prop="realName" label="姓名" header-align="center" align="center"></el-table-column>
			<fast-table-column prop="gender" label="性别" dict-type="user_gender"></fast-table-column>
			<el-table-column prop="mobile" label="手机号" header-align="center" align="center"></el-table-column>
			<el-table-column prop="email" label="邮箱" header-align="center" align="center"></el-table-column>
			<el-table-column prop="orgName" label="所属机构" header-align="center" align="center"></el-table-column>
			<fast-table-column prop="status" label="状态" dict-type="user_status"></fast-table-column>
			<el-table-column prop="createTime" label="创建时间" header-align="center" align="center" width="180"></el-table-column>
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
	</el-dialog>
</template>

<script setup lang="ts">
import { useCrud } from '@/hooks'
import { ElMessage,ElMessageBox } from 'element-plus'
import { reactive, ref } from 'vue'
import { IHooksOptions } from '@/hooks/interface'
import { addUserApi } from '@/api/data-integrate/project'

const visible = ref(false)

const state: IHooksOptions = reactive({
	dataListUrl: '/sys/user/page',
	deleteUrl: '/sys/user',
	queryForm: {
		username: '',
		mobile: '',
		gender: ''
	},
	projectId: ''
})

const init = (id?: number) => {
	visible.value = true
	state.projectId = id
	getDataList()
}

const addProjectUser = () => {
		let data: any[] = []
		
		data = state.dataListSelections ? state.dataListSelections : []

		if (data.length === 0) {
			ElMessage.warning('请选择记录添加')
			return
		}
		
		ElMessageBox.confirm('确定添加吗?', '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		})
			.then(() => {
				if (state.projectId) {
					addUserApi(state.projectId, data).then(() => {
						ElMessage.success('添加成功')
					})
				}
			})
			.catch(() => {})
	}

defineExpose({
	init
})

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
