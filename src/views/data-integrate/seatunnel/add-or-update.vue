<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" width="60%">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
			<el-form-item prop="orgId" label="所属机构">
				<el-tree-select
					clearable
					v-model="dataForm.orgId"
					:data="orgList"
					check-strictly
					value-key="id"
					:props="{ label: 'name', children: 'children' }"
					style="width: 100%"
				/>
			</el-form-item>
			<el-form-item label="任务名称" prop="taskName" >
				<el-input v-model="dataForm.taskName" placeholder="任务名称"></el-input>
			</el-form-item>
			<el-form-item label="调度类型" prop="taskType">
				<fast-radio-group v-model="dataForm.taskType" dict-type="seatunnel_task_type"></fast-radio-group>
			</el-form-item>
			<el-form-item label="cron表达式" prop="cron" v-if="dataForm.taskType=='3'">
				<el-input v-model="dataForm.cron" placeholder="cron表达式"></el-input>
			</el-form-item>
			<el-form-item label="seatunnel配置" prop="dataAccessJson" label-width="auto">
				<div style="margin-bottom: 10px;">
					<el-tag><span>具体配置方式请点击下方链接参考官方文档 — 提交作业</span></el-tag><br>
					<el-link underline type="success" href="https://seatunnel.apache.org/zh-CN/docs/2.3.6/seatunnel-engine/rest-api" target="_blank" style="color: limegreen;">seatunnel rest-api json 配置文档</el-link>
				</div>
				<div style="height:400px;width: 1100px;">
					<JsonStudio ref="jsonStudioRef" id="seatunnelJson"></JsonStudio>
				</div>
			</el-form-item>
			<el-form-item label="描述" prop="description">
				<el-input type="textarea" rows="2" v-model="dataForm.description" placeholder="描述"></el-input>
			</el-form-item>
			<el-form-item label="备注" prop="note">
				<el-input type="textarea" rows="2" v-model="dataForm.note" placeholder="备注"></el-input>
			</el-form-item>
	    </el-form>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" @click="submitHandle()">确定</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus/es'
import { useSeatunnelAccessApi, useSeatunnelAccessSubmitApi } from '@/api/data-integrate/seatunnelAccess'
import { useOrgListApi } from '@/api/sys/orgs'
import JsonStudio from './json-studio.vue'

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()
const orgList = ref([])
const jsonStudioRef = ref()

const dataForm = reactive({
	orgId: '',
	taskName: '',
	description: '',
	taskType: '',
	cron: '',
	dataAccessJson: '',
	note: '',
})

const init = (id?: number) => {
	visible.value = true
	dataForm.id = ''

	setTimeout(()=>{
			jsonStudioRef.value.setEditorValue('{}')
		},300)
	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
		for (let key in dataForm) {
			dataForm[key] = ''
		}
	}

	//获取部门列表
	useOrgListApi().then(res => {
		orgList.value = res.data
	})

	if (id) {
		getSeatunnelAccess(id)
	}
}

const getSeatunnelAccess = (id: number) => {
	useSeatunnelAccessApi(id).then(res => {
		Object.assign(dataForm, res.data)
		setTimeout(()=>{
			jsonStudioRef.value.setEditorValue(dataForm.dataAccessJson)
		},300)
	})
}

const dataRules = ref({
	orgId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	taskName: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	taskType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	cron: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	dataAccessJson: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

// 表单提交
const submitHandle = () => {
	dataForm.dataAccessJson = jsonStudioRef.value.getEditorValue()
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}

		useSeatunnelAccessSubmitApi(dataForm).then(() => {
			ElMessage.success({
				message: '操作成功',
				duration: 500,
				onClose: () => {
					visible.value = false
					emit('refreshDataList')
				}
			})
		})
	})
}

defineExpose({
	init
})
</script>
