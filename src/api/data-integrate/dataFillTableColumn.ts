import service from '@/utils/request'

export const useDataFillTableColumnApi = (id: number) => {
	return service.get('/data-integrate/dataFillTableColumn/' + id)
}

export const useDataFillTableColumnSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-integrate/dataFillTableColumn', dataForm)
	} else {
		return service.post('/data-integrate/dataFillTableColumn', dataForm)
	}
}