<template>
	<el-card class="cluster" body-style="height: calc(100vh - 170px )">
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <el-input v-model="state.queryForm.name" placeholder="实例名称"></el-input>
			</el-form-item>
			<el-form-item>
			  <el-input v-model="state.queryForm.alias" placeholder="别名"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button @click="getDataList()">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-button v-auth="'data-development:cluster:save'" type="primary" @click="addOrUpdateHandle()">新增</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="heartbeat()">心跳检测</el-button>
			</el-form-item>
			<el-form-item>
				<el-button :loading="clearButton" type="primary" @click="clear()">回收</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" max-height="calc(100vh - 400px )" @selection-change="selectionChangeHandle" >
			<el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
			<el-table-column prop="name" label="实例名称" show-overflow-tooltip header-align="center" align="center"></el-table-column>
			<el-table-column prop="alias" label="别名" show-overflow-tooltip header-align="center" align="center"></el-table-column>
			<fast-table-org-column prop="orgId" label="所属机构" header-align="center" align="center"></fast-table-org-column>
			<fast-table-column prop="type" label="实例类型" header-align="center" align="center" dict-type="production_cluster_type"></fast-table-column>
			<!-- <el-table-column prop="hosts" label="集群地址" header-align="center" align="center"></el-table-column> -->
			<el-table-column prop="jobManagerHost" label="Job Manager地址" header-align="center" align="center" width="180"></el-table-column>
			<el-table-column prop="flinkVersion" label="flink版本" header-align="center" align="center"></el-table-column>
			<el-table-column prop="status" label="集群状态" header-align="center" align="center">
				<template #default="scope">
					{{scope.row.status?'正常':'断开'}}
				</template>
			</el-table-column>
			<el-table-column prop="autoRegisters" label="注册方式" header-align="center" align="center">
				<template #default="scope">
					{{scope.row.autoRegisters?'自动':'手动'}}
				</template>
			</el-table-column>
			<el-table-column prop="enabled" label="是否启用" header-align="center" align="center">
				<template #default="scope">
					{{scope.row.enabled?'是':'否'}}
				</template>
			</el-table-column>
			<fast-creator-column prop="creator" label="创建者" header-align="center" align="center"></fast-creator-column>
			<el-table-column prop="createTime" label="创建时间" header-align="center" align="center" width="200"></el-table-column>
			<el-table-column prop="updateTime" label="最近更新时间" header-align="center" align="center" width="200"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="200">
				<template #default="scope">
					<el-button v-auth="'data-development:cluster:update'" type="primary" link @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
					<el-button v-auth="'data-development:cluster:delete'" type="primary" link @click="deleteBatchHandle(scope.row.id)">删除</el-button>
					<el-button v-show="!!scope.row.jobManagerHost" type="primary" link><a :href="'http://'+scope.row.jobManagerHost"  target="_blank">Flink WebUI</a></el-button>
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

<script setup lang="ts" name="Data-developmentClusterIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import AddOrUpdate from './add-or-update.vue'
import { ElMessage,ElMessageBox } from 'element-plus/es'
import { IHooksOptions } from '@/hooks/interface'
import { heartbeatApi } from '@/api/data-development/cluster'
import { clearApi } from '@/api/data-development/cluster'

const state: IHooksOptions = reactive({
	dataListUrl: '/data-development/cluster/page',
	deleteUrl: '/data-development/cluster',
	queryForm: {
		name: '', 
		alias: ''
	}
})

const addOrUpdateRef = ref()
const addOrUpdateHandle = (id?: number) => {
	addOrUpdateRef.value.init(id)
}

const heartbeat = () => {
	let data = state.dataListSelections ? state.dataListSelections : []
	if (data.length === 0) {
		ElMessage.warning('请选择需要检测的实例')
		return
	}
	heartbeatApi(data).then(res => {
		getDataList()
		ElMessage.success('心跳检测完成，状态已更新！')
	})
}

const clearButton = ref(false)
const clear = () => {
	ElMessageBox.confirm('确定回收所有自动创建且过期无效的 Flink 实例吗？', '回收 Flink 实例', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	}).then(() => {
			clearButton.value = true
			clearApi().then(res => {
				getDataList()
				ElMessage.success("成功回收 "+ res.data +"个 Flink 实例")
				clearButton.value = false
			})
		})
}


const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>

<style lang="scss">
	
</style>