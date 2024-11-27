<template>
	<el-card>
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <el-input v-model="state.queryForm.name" placeholder="名称"></el-input>
			</el-form-item>
			<el-form-item>
				<el-select v-model="state.queryForm.typeId"
						  clearable
						  filterable
				          placeholder="标签类型">
				  <el-option v-for="(item,index) in labelTypeList"
				             :key="item.id"
				             :label="`[${item.id}]${item.name}`"
				             :value="item.id">
				  </el-option>
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-select v-model="state.queryForm.labelModelId"
						  clearable
						  filterable
				          placeholder="标签实体">
				  <el-option v-for="(item,index) in labelModelList"
				             :key="item.id"
				             :label="`[${item.id}]${item.name}`"
				             :value="item.id">
				  </el-option>
				</el-select>
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
		</el-form><br>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" @selection-change="selectionChangeHandle">
			<el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
			<el-table-column prop="categoryId" label="标签类目" header-align="center" align="center" show-overflow-tooltip>
				<template #default="scope">
					{{ getNameById(categoryList, scope.row.categoryId) }}
				</template>
			</el-table-column>
			<el-table-column prop="typeId" label="标签类型" header-align="center" align="center" show-overflow-tooltip>
				<template #default="scope">
					{{ getNameById(labelTypeList, scope.row.typeId) }}
				</template>
			</el-table-column>
			<el-table-column prop="labelModelId" label="标签实体" header-align="center" align="center" show-overflow-tooltip>
				<template #default="scope">
					{{ getNameById(labelModelList, scope.row.labelModelId) }}
				</template>
			</el-table-column>
			<el-table-column prop="name" label="标签名称" header-align="center" align="center" show-overflow-tooltip></el-table-column>
			<el-table-column prop="description" label="说明" header-align="center" align="center" show-overflow-tooltip></el-table-column>
			<fast-table-org-column prop="orgId" label="所属机构" header-align="center" align="center" show-overflow-tooltip></fast-table-org-column>
			<el-table-column prop="orderNo" label="排序号" header-align="center" align="center" show-overflow-tooltip></el-table-column>
			<fast-table-column prop="status" label="是否启用" header-align="center" align="center" dict-type="yes_or_no" show-overflow-tooltip></fast-table-column>
			<fast-creator-column prop="creator" label="创建者" header-align="center" align="center" show-overflow-tooltip></fast-creator-column>
			<el-table-column prop="createTime" label="创建时间" header-align="center" align="center" width="160" show-overflow-tooltip></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="200">
				<template #default="scope">
					<el-button type="primary" v-if="scope.row.status==0" link @click="on(scope.row.id)">启用</el-button>
					<el-button type="primary" v-if="scope.row.status==1" link @click="off(scope.row.id)">禁用</el-button>
					<el-button type="primary" link @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
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

		<!-- 弹窗, 新增 / 修改 -->
		<add-or-update ref="addOrUpdateRef" @refreshDataList="getDataList"></add-or-update>
	</el-card>
</template>

<script setup lang="ts" name="Data-governanceLabelLabel">
import { useCrud } from '@/hooks'
import { ElMessage,ElMessageBox } from 'element-plus/es'
import { reactive, ref, onMounted, provide } from 'vue'
import AddOrUpdate from './label-edit.vue'
import { IHooksOptions } from '@/hooks/interface'
import { getCategoryListApi, getLabelTypesApi, getLabelModelsApi,onLabelApi,offLabelApi } from '@/api/data-governance/label'
import { getNameById } from '@/utils/tool'



onMounted(()=>{
	getCategoryListApi().then(res=>{
		categoryList.value = res.data
	})
	getLabelTypesApi().then(res=>{
		labelTypeList.value = res.data
	})
	getLabelModelsApi().then(res=>{
		labelModelList.value = res.data
	})
})

const categoryId = ref(0)
const categoryList = ref([])
const labelTypeList = ref([])
const labelModelList = ref([])


provide("labelTypeList",labelTypeList)
provide("labelModelList",labelModelList)
provide("categoryId", categoryId)

const init = (categroy: any) => {
	state.queryForm.categoryId = categroy.id
	categoryId.value = categroy.id
	getDataList()
}

const on = (id) => {
	ElMessageBox.confirm('确认启用吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	}).then(() => {
		onLabelApi(id).then(res=> {
			getDataList()
			ElMessage.success("启用成功")
		})
	})
}

const off = (id) => {
	ElMessageBox.confirm('确认禁用吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	}).then(() => {
		offLabelApi(id).then(res=> {
			getDataList()
			ElMessage.success("禁用成功")
		})
	})
}

const state: IHooksOptions = reactive({
	createdIsNeed: false,
	dataListUrl: '/data-governance/label/page',
	deleteUrl: '/data-governance/label',
	queryForm: {
		categoryId: '',
		name: '',
		typeId: '',
		labelModelId: '',
	}
})

const addOrUpdateRef = ref()
const addOrUpdateHandle = (id?: number) => {
	addOrUpdateRef.value.init(id)
}

defineExpose({
	init
})

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
