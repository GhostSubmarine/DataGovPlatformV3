import service from '@/utils/request'

export const useStandardCleanLogApi = (id: number) => {
	return service.get('/data-governance/standard-clean-log/' + id)
}

export const useStandardCleanLogSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/standard-clean-log', dataForm)
	} else {
		return service.post('/data-governance/standard-clean-log', dataForm)
	}
}