import service from '@/utils/request'

export const useStandardCodeApi = (id: number) => {
	return service.get('/data-governance/standard-code/' + id)
}

export const useStandardCodeSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/standard-code', dataForm)
	} else {
		return service.post('/data-governance/standard-code', dataForm)
	}
}