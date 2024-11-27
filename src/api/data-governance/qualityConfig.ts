import service from '@/utils/request'

export const useQualityConfigApi = (id: number) => {
	return service.get('/data-governance/quality-config/' + id)
}

export const useQualityConfigSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/quality-config', dataForm)
	} else {
		return service.post('/data-governance/quality-config', dataForm)
	}
}

export const listQualityRuleApi = () => {
	return service.get('/data-governance/quality-rule/list')
}

export const onlineApi = (id?: number) => {
	return service.put('/data-governance/quality-config/online/'+id)
}

export const offlineApi = (id?: number) => {
	return service.put('/data-governance/quality-config/offline/'+id)
}

export const handRunApi = (id?: number) => {
	return service.put('/data-governance/quality-config/hand-run/'+id)
}