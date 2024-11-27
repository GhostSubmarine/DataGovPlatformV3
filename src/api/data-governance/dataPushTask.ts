import service from '@/utils/request'

export const useDataPushTaskApi = (id: number) => {
	return service.get('/data-governance/dataPushTask/' + id)
}

export const useDataPushTaskSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/dataPushTask', dataForm)
	} else {
		return service.post('/data-governance/dataPushTask', dataForm)
	}
}

export const release = (id: number) => {
	return service.post('/data-governance/dataPushTask/release/' + id)
}

export const cancel = (id: number) => {
	return service.post('/data-governance/dataPushTask/cancel/' + id)
}

export const handRun = (id: number) => {
	return service.post('/data-governance/dataPushTask/hand-run/' + id)
}

export const listDataPushConfigs = () => {
	return service.get('/data-governance/dataPushConfig/page?page=1&limit=1000')
}


