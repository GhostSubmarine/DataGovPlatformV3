<template>
	<el-dialog v-model="dialogVisible" title="sql语法和逻辑检查" width="80%">
		  <el-scrollbar>
				<div style="font-size:16px" v-show="waitShow">
					<span>语法校验中。。。</span>
				</div>
				<div :style="{color: resultColor}" v-show="!waitShow">
					<p style="font-size: 16px">{{resultColor == 'green'? '全部正确':'存在错误'}}</p>
				</div><br>
				<div v-for="(item, index) in explainResult" :key="index++">
					<span><b>{{index}}</b></span>&emsp;
					<el-tag>{{item.type?item.type:'errorType'}}</el-tag>&emsp;
					<el-tag :type="item.explainTrue?'success':'danger'">{{item.explainTrue?'语法正确':'语法错误'}}</el-tag>&emsp;
					<el-tag :type="item.parseTrue?'success':'danger'">{{item.parseTrue?'逻辑正确':'逻辑错误'}}</el-tag>&emsp;
					<span>{{item.explainTime}}</span>
					<div style="padding:15px;line-height:30px">
						<p >
							{{item.sql?item.sql:'没有识别到有效sql'}}
						</p>
					</div>
					<div style="font-size:15px;line-height:35px" v-if="item.error">
						<p>
							错误日志：
						</p>
						<ReadonlyStudio :id="'explainErrorMsgId'+ index " :value="item.error" style="height:500px"></ReadonlyStudio>
					</div>
				</div>
			</el-scrollbar>
	    <template #footer>
	      <span class="dialog-footer">
	        <el-button @click="dialogVisible = false">关闭</el-button>
	      </span>
	    </template>
	</el-dialog>
</template>

<script lang="ts" setup>
	
	import { ref } from 'vue'
	import { ElMessage, ElMessageBox } from 'element-plus/es'
	import ReadonlyStudio from './readonly-studio.vue'
	
	const dialogVisible = ref(false)
	
	const resultColor = ref("green")
	const explainResult = ref([])
	const waitShow = ref(true)
	
	const init = () => {
		waitShow.value = true
		dialogVisible.value = true
		explainResult.value = []
		resultColor.value = "green"
	}
	
	const finishExplain = (explains: []) => {
		let explainRs = true
		for(let i in explains) {
			let result = explains[i]
			if(!result.explainTrue || !result.parseTrue) {
				resultColor.value = "red"
				explainRs = false
				break
			}
		}
		explainResult.value = explains
		console.log(explainResult.value)
		waitShow.value = false
		return explainRs
	}
	
	const showError = () => {
		dialogVisible.value = true
		ElMessage.error('sql有误，请检查！')
	}
	
	defineExpose({
		init,finishExplain,showError
	})
	
</script>

<style>
</style>