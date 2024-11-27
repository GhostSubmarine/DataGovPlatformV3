<template>
	<div :id="id"></div>
</template>

<script lang="ts" setup>
	import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
	import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
	import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
	import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
	import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
	import * as monaco from 'monaco-editor';
	import { nextTick,ref,onBeforeUnmount,onMounted,inject,toRaw } from 'vue'
	import { ElMessage } from 'element-plus'
	
	const props = defineProps({
		id: {
			type: String,
			required: true
		},
		value: {
			type: String,
			required: false,
			default: () => '{}'
		}
	})
	
	const text=ref('')
	const language=ref('json')
	const editorTheme = ref("vs-dark")
	
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
	 		if (label === 'json') {
	 			return new jsonWorker()
	 		}
	 		if (label === 'css' || label === 'scss' || label === 'less') {
	 			return new cssWorker()
	 		}
	 		if (label === 'html' || label === 'handlebars' || label === 'razor') {
	 			return new htmlWorker()
	 		}
	 		if (['typescript', 'javascript'].includes(label)) {
	 			return new tsWorker()
	 		}
	 		return new EditorWorker()
	 	},
	 }
	 
	let editor = null;
	
	const editorInit = () => {
			nextTick(()=>{	
					!editor ? editor = monaco.editor.create(document.getElementById(props.id) as HTMLElement, {
							value: text.value, // 编辑器初始显示文字
							language: language.value, // 语言支持自行查阅demo
							automaticLayout: true, // 自适应布局  
							theme: editorTheme.value,  // 官方自带三种主题vs, hc-black, or vs-dark
							foldingStrategy: 'indentation',
							renderLineHighlight: 'all', // 行亮
							selectOnLineNumbers: true, // 显示行号
							minimap:{
									enabled: false,
							},
							cursorStyle: 'line', //光标样式
							readOnly: false, // 只读
							fontSize: 16, // 字体大小
							autoIndent: true, //自动布局
							useTabStops: false,
							quickSuggestionsDelay: 100, //代码提示延时
							scrollBeyondLastLine: false, // 取消代码后面一大段空白 
							overviewRulerBorder: false, // 不要滚动条的边框  
					}) : 
					editor.setValue(props.value);
					editor.setValue(props.value);
					// console.log(editor)
			})
	}
	
	//格式化
	const handleFormat = () => {
		let content = editor.getValue()
		editor.trigger('anyString', 'editor.action.formatDocument')
		editor.setValue(content)
	}
	
	const setEditorValue = (value: any) => {
		editor.setValue(value)
	}
	
	const setEditorValueAndFormat = (value: any) => {
		editor.setValue(value)
		editor.trigger('anyString', 'editor.action.formatDocument')
	}
	
	const getEditorValue = () => {
		return editor.getValue()
	}
	
	/***
	 * editor.setValue(newValue)
	
	editor.getValue()
	
	editor.onDidChangeModelContent((val)=>{ //监听值的变化  })
	
	editor.getAction('editor.action.formatDocument').run()    //格式化代码
	
	editor.dispose()    //销毁实例
	
	editor.onDidChangeOptions　　//配置改变事件
	
	editor.onDidChangeLanguage　　//语言改变事件
	 */
	defineExpose({
		setEditorValue,
		getEditorValue,
		handleFormat,
		setEditorValueAndFormat
	})
</script>

<style>
</style>