<template>
	<el-card :body-style="props.ifChild ? '':'height: calc(100vh - 170px )'">
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <el-input v-model="state.queryForm.title" placeholder="标题"></el-input>
			</el-form-item>
			<el-form-item>
			  <el-input v-model="state.queryForm.resourceName" placeholder="资产名称"></el-input>
			</el-form-item>
			<el-form-item>
			  <el-input v-model="state.queryForm.resourceMountName" placeholder="资源名称"></el-input>
			</el-form-item>
			<el-form-item>
				<fast-select v-model="state.queryForm.mountType" dict-type="mount_type" placeholder="类型" clearable filterable></fast-select>
			</el-form-item>
			<el-form-item>
				<el-date-picker
						 v-model="state.queryForm.applyStartTime"
						 type="datetime"
						 placeholder="申请开始时间"
						 format="YYYY-MM-DD hh:mm:ss"
						 value-format="YYYY-MM-DD hh:mm:ss"
				     />
			</el-form-item>
			<el-form-item>
				<el-date-picker
						 v-model="state.queryForm.applyEndTime"
						 type="datetime"
						 placeholder="申请结束时间"
						 format="YYYY-MM-DD hh:mm:ss"
						 value-format="YYYY-MM-DD hh:mm:ss"
				     />
			</el-form-item>
			<el-form-item>
				<fast-select v-model="state.queryForm.status" dict-type="check_status" placeholder="审核状态" clearable filterable></fast-select>
			</el-form-item>
			<el-form-item>
				<fast-select v-model="state.queryForm.ifAuth" dict-type="yes_or_no" placeholder="是否授权" clearable filterable></fast-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="getDataList()">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="danger" @click="deleteBatchHandle()">删除</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" max-height="calc(100vh - 400px )" @selection-change="selectionChangeHandle">
			<el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
			<!-- <el-table-column prop="id" label="主键id" header-align="center" align="center"></el-table-column> -->
			<el-table-column show-overflow-tooltip prop="title" label="标题" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="resourceName" label="资产名称" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="resourceMountName" label="资源名称" header-align="center" align="center"></el-table-column>
			<fast-table-column prop="mountType" label="类型" dict-type="mount_type" header-align="center" align="center"></fast-table-column>
			<el-table-column prop="phone" label="电话" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="email" label="邮箱" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="applyStartTime" label="开始时间" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="applyEndTime" label="结束时间" header-align="center" align="center"></el-table-column>
		<el-table-column prop="effective" label="是否在有效期" header-align="center" align="center">
				<template #default="scope">
					<el-tag v-show="scope.row.effective">是</el-tag>
					<el-tag v-show="!scope.row.effective" type="warning">否</el-tag>
				</template>
			</el-table-column>
			<!-- <el-table-column prop="applyUseTimes" label="调用次数" header-align="center" align="center"></el-table-column>
			<el-table-column prop="applyUserId" label="申请人id" header-align="center" align="center"></el-table-column> -->
			<el-table-column prop="status" label="审核状态" header-align="center" align="center">
				<template #default="scope">
					<el-tag v-show="scope.row.status=='0'">待审核</el-tag>
					<el-tag v-show="scope.row.status=='1'" type="success">已通过</el-tag>
					<el-tag v-show="scope.row.status=='2'" type="danger">未通过</el-tag>
				</template>
			</el-table-column>
			<el-table-column prop="ifAuth" label="授权状态" header-align="center" align="center">
				<template #default="scope">
					<el-tag v-show="scope.row.ifAuth=='0'" type="info">未授权</el-tag>
					<el-tag v-show="scope.row.ifAuth=='1'" type="success">已授权</el-tag>
				</template>
			</el-table-column>
			<fast-creator-column prop="applyUserId" label="申请人" header-align="center" align="center"></fast-creator-column>
			<el-table-column show-overflow-tooltip prop="createTime" label="申请时间" header-align="center" align="center"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="150">
				<template #default="scope">
					<el-button type="primary" link @click="lookInfo(scope.row)">查看</el-button>
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
		<ApplyInfo ref="applyInfoRef"></ApplyInfo>
	</el-card>
</template>

<script setup lang="ts" name="Data-marketMy-applyIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import AddOrUpdate from './add-or-update.vue'
import ApplyInfo from './apply-info.vue'
import { IHooksOptions } from '@/hooks/interface'

const props = defineProps({
	ifChild: {
		type: Boolean,
		required: false,
		default: () => false
	},
	ifCheck: {
		type: Boolean,
		required: false,
		default: () => false
	}
})	

const state: IHooksOptions = reactive({
	dataListUrl: '/data-assets/resource-apply/page',
	deleteUrl: '/data-assets/resource-apply',
	queryForm: {
		title: '',
		resourceName: '',
		resourceMountName: '',
		mountType: '',
		applyStartTime: '',
		applyEndTime: '',
		status: '',
		ifAuth: '',
		ifSelf: props.ifCheck? 0 : 1
	}
})

const addOrUpdateRef = ref()
const addOrUpdateHandle = (id?: number) => {
	addOrUpdateRef.value.init(id)
}

const applyInfoRef = ref()
const lookInfo = (row: any) => {
	applyInfoRef.value.init(row)
}

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
