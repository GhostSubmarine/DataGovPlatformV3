import service from '@/utils/request'

export const useMasterDistributeApi = (id: number) => {
	return service.get('/data-governance/master-distribute/' + id)
}

export const useMasterDistributeSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/master-distribute', dataForm)
	} else {
		return service.post('/data-governance/master-distribute', dataForm)
	}
}

export const releaseApi = (id: number) => {
	return service.put('/data-governance/master-distribute/release/' + id)
}

export const cancelApi = (id: number) => {
	return service.put('/data-governance/master-distribute/cancel/' + id)
}

export const handRunApi = (id: number) => {
	return service.put('/data-governance/master-distribute/hand-run/' + id)
}

