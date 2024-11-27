import service from '@/utils/request'

export const useMetadataPropertyApi = (id: number) => {
	return service.get('/data-governance/metadata-property/' + id)
}

export const useMetadataPropertySubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/metadata-property', dataForm)
	} else {
		return service.post('/data-governance/metadata-property', dataForm)
	}
}