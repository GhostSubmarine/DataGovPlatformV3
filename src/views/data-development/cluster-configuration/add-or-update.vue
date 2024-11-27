<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false">
				<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
					<el-form-item prop="orgId" label="所属机构" label-width="auto">
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
					<el-form-item label="类型" prop="type" label-width="auto">
						<fast-select v-model="dataForm.type" dict-type="production_cluster_configuration_type" placeholder="请选择" clearable></fast-select>
					</el-form-item>
					<el-divider><span style="font-size: 17px"><b>Hadoop 配置</b></span></el-divider>
					<el-form-item label="Hadoop 配置文件路径" prop="hadoopConfigPath" label-width="auto">
						<el-input v-model="dataForm.hadoopConfigPath" placeholder="指定配置文件路径（末尾无/）,需要包含以下文件：core-site.xml,hdfs-site.xml,yarn-site.xml !"></el-input>
					</el-form-item>
					<el-divider><span style="font-size: 17px"><b>Flink 配置</b></span></el-divider>
					<el-form-item label="lib 路径" prop="flinkLibPath" label-width="auto">
						<el-input v-model="dataForm.flinkLibPath" placeholder="指定 lib 的 hdfs 路径（末尾无/）,需要包含 Flink 运行时的依赖, 如 hdfs://192.168.40.135:9000/flinkJar"></el-input>
					</el-form-item>
					<el-form-item label="Flink 配置文件路径" prop="flinkConfigPath" label-width="auto">
						<el-input v-model="dataForm.flinkConfigPath" placeholder="请输入 flink-conf.yaml 所在的路径, 如 /server/deployment/flink-1.14.3/conf !"></el-input>
					</el-form-item>
					<el-divider content-position='left'><span style="font-size: 16px"><b>自定义配置</b></span></el-divider>
					<el-form-item label="taskmanager.numberOfTaskSlots" prop="taskmanager.numberOfTaskSlots" label-width="auto">
						<el-input-number v-model="dataForm['taskmanager.numberOfTaskSlots']" :min="1" :max="10"/>
					</el-form-item>
					<el-form-item label="state.savepoints.dir" prop="state.savepoints.dir" label-width="auto">
						<el-input v-model="dataForm['state.savepoints.dir']" placeholder="如 hdfs://192.168.40.135:9000/savepoints"></el-input>
					</el-form-item>
					<el-form-item label="state.checkpoints.dir" prop="state.checkpoints.dir" label-width="auto">
						<el-input v-model="dataForm['state.checkpoints.dir']" placeholder="如 hdfs://192.168.40.135:9000/checkpoints"></el-input>
					</el-form-item>
					<el-divider><span style="font-size: 17px"><b>基本配置</b></span></el-divider>
					<el-form-item label="集群配置名称" prop="name" label-width="auto">
						<el-input v-model="dataForm.name" placeholder="集群配置名称"></el-input>
					</el-form-item>
					<el-form-item label="别名" prop="alias" label-width="auto">
						<el-input v-model="dataForm.alias" placeholder="别名"></el-input>
					</el-form-item>
					<el-form-item label="备注" prop="note" label-width="auto">
						<el-input v-model="dataForm.note" placeholder="备注"></el-input>
					</el-form-item>
					<el-form-item label="启用" prop="enabled" label-width="auto">
						<el-switch
									v-model="dataForm.enabled"
									:active-value="true"
									:inactive-value="false"
								/>
					</el-form-item>
				</el-form>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" @click="testConnect()">测试</el-button>
			<el-button type="primary" @click="submitHandle()">确定</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus/es'
import { useConfigurationApi, useConfigurationSubmitApi,testConnectApi } from '@/api/data-development/clusterConfiguration'
import { useOrgListApi } from '@/api/sys/orgs'

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()
const orgList = ref([])

const dataForm = reactive({
	orgId: '',
	type: '',
	hadoopConfigPath: '',
	flinkLibPath: '',
	flinkConfigPath: '',
	"taskmanager.numberOfTaskSlots": 1,
	"state.savepoints.dir": '',
	"state.checkpoints.dir": '',
	 name: '',
	 alias: '',
	 note: '',
	 enabled: true,
	 configJson: ''
})

const init = (id?: number) => {
	visible.value = true
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}

	//获取部门列表
	useOrgListApi().then(res => {
		orgList.value = res.data
	})

	if (id) {
		getConfiguration(id)
	}
}

const getConfiguration = (id: number) => {
	useConfigurationApi(id).then(res => {
		Object.assign(dataForm, JSON.parse(res.data.configJson))
		Object.assign(dataForm, res.data)
	})
}

const dataRules = ref({
	orgId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	type: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	hadoopConfigPath: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	flinkLibPath: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	flinkConfigPath: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	alias: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	enabled: [{ required: true, message: '必填项不能为空', trigger: 'blur' }]
})

const testConnect = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		buildConfigJson()
		testConnectApi(dataForm).then(() => {
			ElMessage.success({
				message: '测试连接成功',
				duration: 500,
				onClose: () => {
					emit('refreshDataList')
				}
			})
		})
	})
}

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		buildConfigJson()
		useConfigurationSubmitApi(dataForm).then(() => {
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

const buildConfigJson = () => {
	let configJson = {}
	configJson.hadoopConfigPath = dataForm.hadoopConfigPath
	configJson.flinkLibPath = dataForm.flinkLibPath
	configJson.flinkConfigPath = dataForm.flinkConfigPath
	configJson["taskmanager.numberOfTaskSlots"] = dataForm["taskmanager.numberOfTaskSlots"]
	configJson["state.savepoints.dir"] = dataForm["state.savepoints.dir"]
	configJson["state.checkpoints.dir"] = dataForm["state.checkpoints.dir"]
	dataForm.configJson = JSON.stringify(configJson)
}

defineExpose({
	init
})
</script>
