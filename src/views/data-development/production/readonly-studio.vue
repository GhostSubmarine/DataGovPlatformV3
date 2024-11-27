<template>
		<div :id="id"></div>
</template>

<script lang="ts" setup>
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import * as monaco from 'monaco-editor';
import { language as sqlLanguage } from 'monaco-editor/esm/vs/basic-languages/sql/sql.js';
import { nextTick,ref,onBeforeUnmount,onMounted } from 'vue'
 
import {ElMessage} from 'element-plus'
const language=ref('sql')
const editorTheme = ref("vs-dark")

const props = defineProps({
	id: {
		type: String,
		required: true
	},
	value: {
		type: String,
		required: false,
		default: () => ''
	}
})
// 
// MonacoEditor start
//
onBeforeUnmount(()=>{
	 editor.dispose() 
	 console.log("editor dispose")
 })
 
onMounted(()=>{
 editorInit()
 console.log("editor init")
})
 
// @ts-ignore
self.MonacoEnvironment = {
	getWorker(_: string, label: string) {
		return new EditorWorker()
	}
}
 
let editor = null;

const editorInit = () => {
		nextTick(()=>{
				!editor ? editor = monaco.editor.create(document.getElementById(props.id) as HTMLElement, {
						value: props.value, // 编辑器初始显示文字
						language: language.value, // 语言支持自行查阅demo
						automaticLayout: true, // 自适应布局  
						theme: editorTheme.value,  // 官方自带三种主题vs, hc-black, or vs-dark
						//foldingStrategy: 'indentation',
						renderLineHighlight: 'all', // 行亮
						selectOnLineNumbers: true, // 显示行号
						minimap:{
								enabled: true
						},
						cursorStyle: 'line', //光标样式
						readOnly: true, // 只读
						fontSize: 16, // 字体大小
						autoIndent: true, //自动布局
						useTabStops: false,
						scrollBeyondLastLine: false, // 取消代码后面一大段空白 
						overviewRulerBorder: false, // 不要滚动条的边框  
				}) : 
				editor.setValue(props.value);
		})
}

const setEditorValue = (value: any) => {
	editor.setValue(value)
}
const getEditorValue = () => {
	return editor.getValue()
}


defineExpose({
	setEditorValue,
	getEditorValue
})
</script>

<style scoped>
	
</style>