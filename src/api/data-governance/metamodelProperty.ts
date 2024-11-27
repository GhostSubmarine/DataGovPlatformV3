import service from '@/utils/request'

export const usePropertyApi = (id: number) => {
	return service.get('/data-governance/metamodel-property/' + id)
}

export const usePropertySubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/metamodel-property', dataForm)
	} else {
		return service.post('/data-governance/metamodel-property', dataForm)
	}
}