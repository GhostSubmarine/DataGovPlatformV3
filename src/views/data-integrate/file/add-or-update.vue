<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
	    	<el-form-item label="名称" prop="name">
					<el-input disabled v-model="dataForm.name" ></el-input>
				</el-form-item>
				<el-form-item label="上传文件">
					<el-upload
						ref="upload"
					    class="upload-demo"
					    :action="constant.uploadUrl"
						:before-upload="beforeUpload" :on-success="handleSuccess"
					     multiple
					    :on-change="handleChangePic"
					  >
					    <template #trigger>
					      <el-button type="primary">选择文件</el-button>
					    </template>
					  </el-upload>
				</el-form-item>
				<el-form-item label="所属分组" prop="path">
					<el-input disabled v-model="dataForm.path" placeholder="所属分组"></el-input>
				</el-form-item>
				<el-form-item label="描述" prop="description">
					<el-input :rows="2" type="textarea" v-model="dataForm.description" placeholder="描述"></el-input>
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
import constant from '@/utils/constant'
import { useFileApi, useFileSubmitApi } from '@/api/data-integrate/file'
import type { UploadInstance, UploadProps } from 'element-plus'

const emit = defineEmits(['refreshDataList'])

const upload = ref<UploadInstance>()
const visible = ref(false)
const dataFormRef = ref()

const dataForm = reactive({
	name: '',
	fileCategoryId: '',
	path: '',
	type: '',
	fileUrl: '',
	size: '',
	description: '',
	projectId: ''})

const init = (id?: number, fileCategoryId: number, path: any, projectId: any) => {
	visible.value = true
	dataForm.id = ''
	if(upload.value) {
		upload.value.clearFiles()
	}

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}
	
	if (id) {
		getFile(id)
	}
	
	dataForm.fileCategoryId = fileCategoryId
	dataForm.path = path
	dataForm.projectId = projectId
}

const getFile = (id: number) => {
	useFileApi(id).then(res => {
		Object.assign(dataForm, res.data)
		dataForm.fileUrl = ''
		dataForm.name = ''
	})
}

const dataRules = ref({
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})


const beforeUpload: UploadProps['beforeUpload'] = file => {
	if (file.size / 1024 / 1024 / 1024 / 1024 > 1) {
		ElMessage.error('文件大小不能超过100M')
		return false
	}
	return true
}

const handleChangePic = (file:any, fileList:any) => {
	if (fileList.length > 1) {
	    fileList.splice(0, 1);
	}
}
/**
 * 上传成功触发
 */
const handleSuccess: UploadProps['onSuccess'] = (res, file) => {
	if (res.code !== 0) {
		ElMessage.error('上传失败：' + res.message)
		return false
	}
	console.log(res.data)
	dataForm.name = res.data.name
	dataForm.type =  res.data.suffix
	dataForm.fileUrl = res.data.url
	dataForm.size = res.data.size

}


// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		if(!dataForm.fileUrl) {
			ElMessage.warning({
				message: '请选择文件上传后再提交！',
			})
			return
		}

		useFileSubmitApi(dataForm).then(() => {
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
