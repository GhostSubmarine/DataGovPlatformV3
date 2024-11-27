import service from '@/utils/request'

export const useQualityTopicApi = (id: number) => {
	return service.get('/data-governance/quality-topic/' + id)
}

export const useQualityTopicSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/quality-topic', dataForm)
	} else {
		return service.post('/data-governance/quality-topic', dataForm)
	}
}

export const correctTopicApi = (dataForm: any) => {
	return service.put('/data-governance/quality-topic/correct', dataForm)
}