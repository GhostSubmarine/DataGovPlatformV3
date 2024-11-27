<template>
	<el-dialog v-model="visible" title="标准检测结果" :close-on-click-modal="false">
		<el-tabs type="border-card">
		    <el-tab-pane label="属性比对">
				 <el-table :data="checkData.compareResults" style="width: 100%">
				    <el-table-column prop="property" label="属性名称" />
				    <el-table-column prop="metadataVal" label="元数据属性值"/>
				    <el-table-column prop="standardVal" label="标准属性值" />
					<el-table-column prop="standard" label="符合标准" >
						<template #default="scope">
							<span v-show="scope.row.standard"><el-tag round type="success">符合</el-tag></span>
							<span v-show="!scope.row.standard"><el-tag round type="danger">不符合</el-tag></span>
						</template>
					</el-table-column>
				  </el-table>
			</el-tab-pane>
		    <el-tab-pane label="标准数据比对">
				<div v-if="!checkData.relStandardCode">
					<span><el-tag>标准字段未关联标准数据，无比对结果！</el-tag></span>
				</div>
				<div v-else>
					<div v-if="checkData.hasStandardCode">
						<el-form label-width="100px">
							<el-form-item label="符合标准数量" prop="fillNum" label-width="auto">
								<span>{{checkData.fillNum}}</span>
							</el-form-item>
							<el-form-item label="不符合标准数量" prop="notFullNum" label-width="auto">
								<span>{{checkData.notFullNum}}</span>
							</el-form-item>
							<el-form-item label="库中字段值集合" prop="columnValues" label-width="auto">
								<span>{{checkData.columnValues}}</span>
							</el-form-item>
							<el-form-item label="标准检测sql" prop="fillNum" label-width="auto">
								<ReadOnlyStudio id="standardCheckSql" ref="standardCheckSqlRef" style="height:100px;width: 100%;"></ReadOnlyStudio>
							</el-form-item>
						</el-form>
					</div>
					<div v-else>
						<span><el-tag>标准字段没有配置标准数据，无比对结果！</el-tag></span>
					</div>
				</div>
				
			</el-tab-pane>
		  </el-tabs>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import ReadOnlyStudio from '../../data-development/production/readonly-studio.vue'

const visible = ref(false)
const standardCheckSqlRef = ref()
const checkData = reactive({
})
const init = (data: any) => {
	visible.value = true
	Object.assign(checkData, data)
	let checkSql = '-- 符合标准检测sql：\n'+ checkData.fillNumSql + '\n-- 不符合标准检测sql：\n'+ checkData.notFillNumSql
	setTimeout(()=> {
		standardCheckSqlRef.value.setEditorValue(checkSql)
	},500)
	
}

defineExpose({
	init
})
</script>


<style>
	/* .el-tree-select__popper .el-select-dropdown__item {
		
	} */
</style>
