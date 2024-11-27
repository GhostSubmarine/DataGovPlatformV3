<template>
  <div class="task-node" :style="properties.style">
		<div>
			<div v-if="properties.name.length <= 10"><b>名称：{{properties.name}}</b></div>
			<div :title="properties.name" v-else><b>名称：{{properties.name.substring(0,10) + '...'}}</b></div>
		</div>
		<div style="margin-top:10px">
			<div><b>类型：{{properties.taskTypeVal}}</b></div>
		</div>
  </div>
</template>

<script setup lang="ts">
	
const props = defineProps({
	//properties属性跟节点的properties绑定了
	properties: {
	  type: Object,
	  default: () => ({
			name: '',
			taskType: '',
			taskTypeVal: '',
			taskId: '',
			weight: 1,
			failGoOn: 0,
			style: {}
	  })
	},
})	
</script>
<style scoped>
.task-node {
  width: 220px;
  height: 100px;
	font-size: 15px;
	color: #737063;
	padding: 15px;
	border-radius: 15px;
  border: 3px solid #8bc9ff;
	background-color: #fffdfc;
  box-sizing: border-box;
}
</style>