<template>
	<el-card body-style="height: calc(100vh - 170px )">
		<el-form ref="dataFormRef" :rules="dataRules" label-width="auto" :model="dataForm">	
			<el-form-item label="neo4j 访问地址" label-width="auto">
				<el-input :disabled="disabled" v-model="dataForm.neo4jUrl"></el-input>
			</el-form-item>
			<el-form-item label-width="auto">
				<el-button v-show="disabled" type="primary" @click="disabled = false">编辑</el-button>
				<el-button v-show="!disabled" type="success" @click="onSubmit">保存</el-button>
				<el-button type="primary" @click="lookUp">前往查看</el-button>
				<el-button v-show="!disabled" @click="disabled = true">取消</el-button>
			</el-form-item>
		</el-form>
	</el-card>
</template>

<script setup lang="ts" name="Data-developmentSys-configIndex">
	
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus/es'
import { updateNeo4jApi, getNeo4jApi } from '@/api/data-governance/metadata'

onMounted(()=>{
	getNeo4jApi().then(res=> {
		Object.assign(dataForm, res.data)
		if(!dataForm.neo4jUrl) {
			dataForm.neo4jUrl = 'http://localhost:7474/'
		}
	})
})

const dataFormRef = ref()
const dataRules = ref({
	neo4jUrl: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})
const disabled = ref(true)

const dataForm = reactive({
	neo4jUrl: 'http://localhost:7474/'
})

const onSubmit = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		updateNeo4jApi(dataForm).then(res => {
			ElMessage.success("提交成功")
			getNeo4jApi().then(res=> {
				Object.assign(dataForm, res.data)
			})
			disabled.value = true
		})
	})
}

const lookUp = () => {
	window.open(dataForm.neo4jUrl, '_blank') 
}

</script>
