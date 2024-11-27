import service from '@/utils/request'

export const useTaskApi = (id: number) => {
	return service.get('/data-development/task/' + id)
}

export const useTaskSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-development/task', dataForm)
	} else {
		return service.post('/data-development/task', dataForm)
	}
}

export const explainSqlApi = (data: any) => {
	return service.post('/data-development/task/explain-sql', data)
}

export const executeSqlApi = (data: any) => {
	return service.post('/data-development/task/execute-sql', data)
}

export const justExecuteSqlApi = (data: any) => {
	return service.post('/data-development/task/just-execute-sql', data)
}

export const submitTaskToClusterApi = (id: number) => {
	return service.post('/data-development/task/submit/'+ id)
}

export const getConsoleLogApi = () => {
	return service.get('/data-development/task/console-log')
}

export const clearConsoleLogApi = () => {
	return service.get('/data-development/task/clear-log')
}

export const clearConsoleLogWithOutKeyApi = () => {
	return service.get('/data-development/task/clear-log-without-key')
}

export const endConsoleLogApi = () => {
	return service.get('/data-development/task/end-log')
}

export const getJobDataApi = (jobId: any) => {
	return service.get('/data-development/task/job-data?jobId='+jobId)
}

export const getInstanceErrorApi = (historyId: any) => {
	return service.get('/data-development/task/history/instance-error?historyId='+historyId)
}

export const getHisClusterInfoApi = (historyId: number) => {
	return service.get('/data-development/task/history/cluster-info?historyId='+historyId)
}

export const savepointApi = (taskId: number, historyId: number, savepointType: any) => {
	return service.get('/data-development/task/savepoint?id='+taskId+'&historyId='+historyId+'&type='+savepointType)
}

export const getEnvListApi = () => {
	return service.get('/data-development/task/env-list')
}
