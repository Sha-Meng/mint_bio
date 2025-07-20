const {
	contextBridge,
	ipcRenderer
} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
	readNewsList: () => ipcRenderer.invoke('read-news-list'),
	readNewsDetail: (id) => ipcRenderer.invoke('read-news-detail', id),
	saveNews: (detail, list) => ipcRenderer.invoke('save-news', {
		detail,
		list
	})
})