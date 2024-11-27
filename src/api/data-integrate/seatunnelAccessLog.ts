import service from '@/utils/request'

export const useSeatunnelAccessLogApi = (id: number) => {
	return service.get('/data-integrate/seatunnel-access-log/' + id)
}

export const useSeatunnelAccessLogSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-integrate/seatunnel-access-log', dataForm)
	} else {
		return service.post('/data-integrate/seatunnel-access-log', dataForm)
	}
}

export const getTaskByIdApi = (id: number) => {
	return service.get('/data-integrate/seatunnel-access-log/' + id)
}

export const stopTaskApi = (executeNo: any) => {
	return service.post('/data-integrate/seatunnel-access/stop-task/' + executeNo)
}