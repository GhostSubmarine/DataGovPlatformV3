<template>
	<div v-if="market">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px">
			<el-form-item label="评分" prop="level" label-width="auto">
				<el-rate
				  :texts="['极差', '失望', '一般', '满意', '惊喜']"
				  v-model="dataForm.level"
				  show-text>
				</el-rate>
			</el-form-item>
			<el-form-item label="内容" prop="comment" label-width="auto">
				<el-input type="textarea" v-model="dataForm.comment"></el-input>
			</el-form-item>
		</el-form>
	</div>
	<div style="margin-bottom:10px;" v-if="market">
		<el-button type="success" @click="submitHandle()" size="small">提交</el-button>
	</div>
	<div>
		<el-form :inline="true" :model="state.queryForm">
			<el-form-item>
			  <el-input v-model="state.queryForm.comment" placeholder="内容"></el-input>
			</el-form-item>
			<el-form-item>
			  <fast-select v-model="state.queryForm.level" dict-type="comment_level" placeholder="等级" clearable filterable></fast-select>
			</el-form-item>
			<el-form-item>
			  <el-button @click="getDataList()" type="primary">查询</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" max-height="300">
			<el-table-column prop="createTime" label="评价时间" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="comment" label="评价" header-align="center" align="center"></el-table-column>
			<fast-table-column prop="level" label="等级" dict-type="comment_level" header-align="center" align="center"></fast-table-column>
			<fast-creator-column prop="creator" label="评价人" header-align="center" align="center"></fast-creator-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="150" v-if="!market">
				<template #default="scope">
					<el-button type="primary" link @click="deleteBatchHandle(scope.row.id)" >删除</el-button>
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
	</div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted} from 'vue'
import { ElMessage } from 'element-plus/es'
import { useResourceCommentApi, useResourceCommentSubmitApi } from '@/api/data-market/resourceComment'
import { IHooksOptions } from '@/hooks/interface'
import { useCrud } from '@/hooks'

const dataFormRef = ref()

const dataForm = reactive({
	level: 5,
	comment: ''
})

const market = ref(false)
const init = (resourceItem) => {
	dataForm.resourceId = resourceItem.id
	state.queryForm.resourceId = resourceItem.id
	market.value = resourceItem.market
	getDataList()
}

const dataRules = ref({
	level: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	comment: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}

		useResourceCommentSubmitApi(dataForm).then(() => {
			ElMessage.success({
				message: '评价成功',
				duration: 500,
				onClose: () => {
					getDataList()
				}
			})
		})
	})
}

const state: IHooksOptions = reactive({
	createdIsNeed: false,
	dataListUrl: '/data-assets/resource-comment/page',
	deleteUrl: '/data-assets/resource-comment',
	queryForm: {
		resourceId: '',
		level: '',
		comment: ''
	}
})

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)

defineExpose({
	init
})	

</script>

<style>
</style>