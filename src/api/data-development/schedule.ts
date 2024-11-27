import service from '@/utils/request'

export const useScheduleApi = (id: number) => {
	return service.get('/data-development/schedule/' + id)
}

export const useScheduleSubmitApi = (dataForm: any) => {
	return service.post('/data-development/schedule', dataForm)
}

export const runFlowApi = (id: number) => {
	return service.post('/data-development/schedule/run/' + id)
}

export const getConsoleLogApi = (recordId: number) => {
	return service.get('/data-development/schedule/log/' + recordId)
}

export const getNodeInfoApi = (recordId: number) => {
	return service.get('/data-development/schedule/node-info/' + recordId)
}

export const getNodeRecordApi = (nodeRecordId: number) => {
	return service.get('/data-development/schedule/node-record/' + nodeRecordId)
}

export const releaseApi = (id: number) => {
	return service.post('/data-development/schedule/release/' + id)
}

export const cancleApi = (id: number) => {
	return service.post('/data-development/schedule/cancle/' + id)
}