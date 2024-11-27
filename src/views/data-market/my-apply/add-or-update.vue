<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" destroy-on-close :close-on-click-modal="false">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
			<el-form-item label="标题" prop="title" label-width="auto">
				<el-input v-model="dataForm.title" placeholder="标题"></el-input>
			</el-form-item>
			<el-form-item label="电话" prop="phone" label-width="auto">
				<el-input v-model="dataForm.phone" placeholder="电话"></el-input>
			</el-form-item>
			<el-form-item  label="邮箱" prop="email" label-width="auto">
				<el-input v-model="dataForm.email" placeholder="邮箱"></el-input>
			</el-form-item>
			<el-form-item label="开始时间" prop="applyStartTime" label-width="auto">
				<el-date-picker
						 v-model="dataForm.applyStartTime"
						 type="datetime"
						 placeholder="开始时间"
						 format="YYYY-MM-DD hh:mm:ss"
						 value-format="YYYY-MM-DD hh:mm:ss"
				     />
			</el-form-item>
			<el-form-item label="结束时间" prop="applyEndTime" label-width="auto">
				<el-date-picker
						 v-model="dataForm.applyEndTime"
						 type="datetime"
						 placeholder="结束时间"
						 format="YYYY-MM-DD hh:mm:ss"
						 value-format="YYYY-MM-DD hh:mm:ss"
				     />
			</el-form-item>
			<el-form-item label="调用类型" prop="applyUseType" v-if="dataForm.mountType==2" label-width="auto">
				<el-select v-model="dataForm.applyUseType" placeholder="调用类型">
					<el-option :key="0" label="不限次数" :value="0"/>
					<el-option :key="1" label="指定次数" :value="1"/>
				</el-select>
			</el-form-item>
			<el-form-item label="调用次数" prop="applyUseTimes" v-if="dataForm.applyUseType == 1 && dataForm.mountType==2" label-width="auto">
				<el-input-number :min='1' :max='9999' v-model="dataForm.applyUseTimes" placeholder="调用次数"></el-input-number>
			</el-form-item>
			<el-form-item  label="申请说明" prop="applyNote" label-width="auto">
				<el-input type="textarea" :rows="2" v-model="dataForm.applyNote" placeholder="申请说明"></el-input>
			</el-form-item>
	    </el-form>
		<div v-if="dataForm.mountType == 2 && appShow">
			<AppPage></AppPage>
		</div>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" @click="submitHandle()">确定</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref,provide } from 'vue'
import { ElMessage } from 'element-plus/es'
import { useApplyApi, useApplySubmitApi } from '@/api/data-market/resourceApply'
import { useApiConfigApi} from '@/api/data-service/apiConfig'
import AppPage from './app-page.vue'

const appApplyInfo = ref()
provide("appApplyInfo", appApplyInfo)
const applyId = ref()
provide("applyId", applyId)
const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()

const dataForm = reactive({
	title: '',
	mountType: '',
	phone: '',
	email: '',
	applyStartTime: '',
	applyEndTime: '',
	applyUseType: '',
	applyUseTimes: 0,
	applyNote: ''
})

const appShow = ref(false)
const init = (resourceMount: any) => {
	visible.value = true
	dataForm.mountType = resourceMount.mountType
	dataForm.resourceId = resourceMount.resourceId
	dataForm.resourceMountId = resourceMount.id
	dataForm.mountId = resourceMount.mountId
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}
	
	//如果是私有api，需要选择授权的app
	if(dataForm.mountType==2) {
		//获取api
		useApiConfigApi(dataForm.mountId).then(res=> {
			console.log(res.data)
			if(res.data.previlege == 1) {
				appShow.value = true
			} else {
				appShow.value = false
			}
		})
	} else {
		appShow.value = false
	}
}

/* const getApply = (id: number) => {
	useApplyApi(id).then(res => {
		Object.assign(dataForm, res.data)
	})
} */

const dataRules = ref({
	title: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	phone: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	email: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	applyStartTime: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	applyEndTime: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	applyUseType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	applyUseTimes: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	applyNote: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		
		//如果是api
		if(dataForm.mountType==2) {
			//不限次数
			if(dataForm.applyUseType == 0) {
				dataForm.applyUseTimes = null
			}
		} else {
			dataForm.applyUseType = null
			dataForm.applyUseTimes = null
		}
		
		if(appShow.value) {
			if(!appApplyInfo.value) {
				ElMessage.warning('请点击列表选择一个 APP 授权访问 API')
				return
			} else {
				dataForm.appId = appApplyInfo.value.id
			}
		}
		
		useApplySubmitApi(dataForm).then(() => {
			ElMessage.success({
				message: '申请成功，请等待管理员审核',
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
