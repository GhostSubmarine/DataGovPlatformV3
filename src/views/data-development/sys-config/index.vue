<template>
	<el-card body-style="height: calc(100vh - 170px )">
		<el-form ref="dataFormRef" :rules="dataRules" label-width="auto" :model="dataForm">
			<el-form-item label="application 模式的 flink-app.jar 文件路径" prop="sqlSubmitJarPath" label-width="auto">
				<el-input :disabled="disabled" v-model="dataForm.sqlSubmitJarPath"></el-input>
			</el-form-item>
			<el-form-item label="flink-app.jar 主类" prop="sqlSubmitJarMainAppClass" label-width="auto">
				<el-input :disabled="disabled" v-model="dataForm.sqlSubmitJarMainAppClass"></el-input>
			</el-form-item>
			<el-form-item label="FlinkSQL 语句分隔符" prop="sqlSeparator" label-width="auto">
				<el-input :disabled="disabled" v-model="dataForm.sqlSeparator"></el-input>
			</el-form-item>
			<el-form-item label="获取 Job ID 的最大等待时间（秒）" prop="jobIdWait" label-width="auto">
				<el-input :disabled="disabled" v-model="dataForm.jobIdWait"></el-input>
			</el-form-item>
			<el-form-item label-width="auto">
				<el-button v-show="disabled" type="primary" @click="disabled = false">编辑</el-button>
				<el-button v-show="!disabled" type="primary" @click="onSubmit">提交</el-button>
				<el-button v-show="!disabled" @click="disabled = true">取消</el-button>
			</el-form-item>
		</el-form>
	</el-card>
</template>

<script setup lang="ts" name="Data-developmentSys-configIndex">
	
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus/es'
import { updateSysConfigApi, getAllApi } from '@/api/data-development/sysConfig'

onMounted(()=>{
	getAllApi().then(res=> {
		Object.assign(dataForm, res.data)
	})
})

const dataFormRef = ref()
const dataRules = ref({
	sqlSubmitJarPath: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	sqlSubmitJarMainAppClass: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	sqlSeparator: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	jobIdWait: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})
const disabled = ref(true)

const dataForm = reactive({
	sqlSubmitJarPath: "hdfs:///flink-app/jar/flink-app.jar",
	sqlSubmitJarMainAppClass: "net.srt.flink.app.MainApp",
	sqlSeparator: ";\\n",
	jobIdWait: "30"
})

const onSubmit = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		updateSysConfigApi(dataForm).then(res => {
			ElMessage.success("提交成功")
			getAllApi().then(res=> {
				Object.assign(dataForm, res.data)
			})
			disabled.value = true
		})
	})
}

</script>
