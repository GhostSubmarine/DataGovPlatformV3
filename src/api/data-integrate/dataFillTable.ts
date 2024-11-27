import service from '@/utils/request'

export const useDataFillTableApi = (id: number) => {
	return service.get('/data-integrate/dataFillTable/' + id)
}

export const useDataFillTableSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-integrate/dataFillTable', dataForm)
	} else {
		return service.post('/data-integrate/dataFillTable', dataForm)
	}
}


export const releaseApi = (id: number) => {
	return service.post('/data-integrate/dataFillTable/release/' + id)
}

export const cancelApi = (id: number) => {
	return service.post('/data-integrate/dataFillTable/cancel/' + id)
}

export const getColumnsByTableIdApi = (id: number) => {
	return service.get('/data-integrate/dataFillTableColumn/columns/' + id)
}