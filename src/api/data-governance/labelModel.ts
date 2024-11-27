import service from '@/utils/request'

export const useLabelModelApi = (id: number) => {
	return service.get('/data-governance/label-model/' + id)
}

export const useLabelModelSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/label-model', dataForm)
	} else {
		return service.post('/data-governance/label-model', dataForm)
	}
}

export const checkSqlApi = (sqlText: any) => {
	return service.post('/data-governance/label-model/check-sql', {'sql':sqlText})
}