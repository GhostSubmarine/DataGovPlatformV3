import service from '@/utils/request'

export const useAccessApi = (id: number) => {
	return service.get('/data-integrate/access/' + id)
}

export const useAccessSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-integrate/access', dataForm)
	} else {
		return service.post('/data-integrate/access', dataForm)
	}
}

export const previewTableNameMap = (map: any) => {
	return service.post('/data-integrate/access/preview-table-name-map', map)
}

export const previewColumnNameMap = (map: any) => {
	return service.post('/data-integrate/access/preview-column-name-map', map)
}

export const accessRelease = (id: number) => {
	return service.post('/data-integrate/access/release/' + id)
}

export const accessCancle = (id: number) => {
	return service.post('/data-integrate/access/cancle/' + id)
}

export const handRun = (id: number) => {
	return service.post('/data-integrate/access/hand-run/' + id)
}

export const getTaskByIdApi = (id: number) => {
	return service.get('/data-integrate/access/task/' + id)
}

export const stopTaskApi = (executeNo: any) => {
	return service.post('/data-integrate/access/stop-task/' + executeNo)
}