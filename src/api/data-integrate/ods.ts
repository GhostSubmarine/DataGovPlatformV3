import service from '@/utils/request'

export const useOdsApi = (id: number) => {
	return service.get('/data-integrate/ods/' + id)
}

export const useOdsSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-integrate/ods', dataForm)
	} else {
		return service.post('/data-integrate/ods', dataForm)
	}
}

export const getColumnInfoApi = (tableName: any) => {
	return service.get('/data-integrate/ods/' + tableName + '/column-info')
}

export const getTableDataApi = (tableName: any) => {
	return service.get('/data-integrate/ods/' + tableName + '/table-data')
}