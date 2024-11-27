<template>
	<el-card>
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
					<el-form-item>
			  <el-input v-model="state.queryForm.name" placeholder="项目名称"></el-input>
			</el-form-item>
			<el-form-item>
			  <el-input v-model="state.queryForm.engName" placeholder="英文名称"></el-input>
			</el-form-item>
			<el-form-item>
			  <fast-radio-group v-model="state.queryForm.status" dict-type="project_status"></fast-radio-group>
			</el-form-item>
			<el-form-item>
			  <el-input v-model="state.queryForm.dutyPerson" placeholder="负责人"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button @click="getDataList()">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-button v-auth="'data-integrate:project:save'" type="primary" @click="addOrUpdateHandle()">新增</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" @selection-change="selectionChangeHandle">
			<el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
			<el-table-column prop="name" label="项目名称" header-align="center" align="center"></el-table-column>
			<el-table-column prop="engName" label="英文名称" header-align="center" align="center"></el-table-column>
			<fast-table-column prop="dbType" label="数仓类型" dict-type="data_house_type"></fast-table-column>
			<el-table-column show-overflow-tooltip prop="description" label="描述" header-align="center" align="center"></el-table-column>
			<fast-table-column prop="status" label="状态" dict-type="project_status"></fast-table-column>
			<el-table-column prop="dutyPerson" label="负责人" header-align="center" align="center"></el-table-column>
			<el-table-column prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="260">
				<template #default="scope">
					<el-button v-auth="'data-integrate:project:adduser'" type="primary" link @click="addProjectUserHandle(scope.row.id)">添加成员</el-button>
					<el-button v-auth="'data-integrate:project:users'" type="primary" link @click="projectUsersHandle(scope.row.id)">成员列表</el-button>
					<el-button v-auth="'data-integrate:project:update'" type="primary" link @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
					<el-button v-auth="'data-integrate:project:delete'" type="primary" link @click="deleteBatchHandle(scope.row.id)">删除</el-button>
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
		<!-- 项目成员 -->
		<project-user ref="projectUserRef"></project-user>
		<!-- 添加项目成员 -->
		<add-project-user ref="addProjectUserRef"></add-project-user>
	</el-card>
</template>

<script setup lang="ts" name="Global-manageProjectIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import AddOrUpdate from './add-or-update.vue'
import ProjectUser from './project-user.vue'
import AddProjectUser from './add-project-user.vue'
import { IHooksOptions } from '@/hooks/interface'

const state: IHooksOptions = reactive({
	dataListUrl: '/data-integrate/project/page',
	deleteUrl: '/data-integrate/project',
	queryForm: {
		name: '', 
		engName: '', 
		status: '', 
		dutyPerson: ''
	}
})

const addOrUpdateRef = ref()
const addOrUpdateHandle = (id?: number) => {
	addOrUpdateRef.value.init(id)
}

const projectUserRef = ref()
const projectUsersHandle = (id?: number) => {
	projectUserRef.value.init(id)
}

const addProjectUserRef = ref()
const addProjectUserHandle = (id?: number) => {
	addProjectUserRef.value.init(id)
}

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
