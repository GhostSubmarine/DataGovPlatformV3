<template>
	<el-card body-style="padding: 5px; height: 40px">
		<span style="margin-right: 15px;">
			<el-tag type="success" effect="light" round>模式切换</el-tag>
		</span>
		<el-switch
		    v-model="bloodModel"
		    size="large"
		    inline-prompt
		    style="--el-switch-on-color: #ff4949; --el-switch-off-color: #13ce66"
		    active-text="血缘数据关系图"
		    inactive-text="血缘数据列表"
		  />
	</el-card>
	<el-card v-show="bloodModel">
		<BloodStruct ref="bloodStructRef"></BloodStruct>
	</el-card>
	<div v-show="!bloodModel">
		<BloodPage ref="bloodPageRef"></BloodPage>
	</div>
</template>

<script setup lang="ts" name="Data-governanceData-bloodIndex">

import { reactive, ref } from 'vue'	
import BloodStruct from './blood-struct.vue'
import BloodPage from './blood-page.vue'

const bloodModel = ref(true)
const bloodStructRef = ref()
const bloodPageRef = ref()


</script>
