import service from '@/utils/request'

export const useLabelTypeApi = (id: number) => {
	return service.get('/data-governance/label-type/' + id)
}

export const useLabelTypeSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/label-type', dataForm)
	} else {
		return service.post('/data-governance/label-type', dataForm)
	}
}