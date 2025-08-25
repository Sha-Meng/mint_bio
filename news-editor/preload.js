// preload.js
const {
	contextBridge,
	ipcRenderer
} = require('electron');
const path = require('path');
const {
	pathToFileURL
} = require('url');

let ASSETS_BASE = '';
try {
	ASSETS_BASE = ipcRenderer.sendSync('assets:getBaseSync'); // 开发=proj/src/assets；运行=exeDir/../../src/assets
} catch (e) {
	console.error('[preload] assets:getBaseSync failed, fallback:', e);
	ASSETS_BASE = path.resolve(__dirname, '../../src/assets'); // 兜底
}

/** 兼容 a.jpg / News/a.jpg / assets/News/a.jpg / src/assets/News/a.jpg */
function normalizeAssetRelative(p) {
	if (!p) return '';
	let s = String(p).trim();
	s = s.replace(/^[./\\]+/, ''); // 去掉 ./ ../
	s = s.replace(/\\/g, '/'); // 统一分隔符
	s = s.replace(/^assets\//i, ''); // 去掉 assets/
	s = s.replace(/^src\/assets\//i, ''); // 去掉 src/assets/
	if (!/^News\//i.test(s)) s = 'News/' + s;
	return s;
}

function toAssetFileUrl(relativePath, forceRefresh = false) {
	if (!relativePath) return '';
	const rel = normalizeAssetRelative(relativePath);
	const abs = path.join(ASSETS_BASE, rel); // -> .../src/assets/News/xxx
	let url = pathToFileURL(abs).toString(); // -> file:///.../src/assets/News/xxx
	if (forceRefresh) {
		url += (url.includes('?') ? '&' : '?') + 't=' + Date.now();
	}
	return url;
}

contextBridge.exposeInMainWorld('assets', {
	toUrl: (p, forceRefresh = false) => {
		try {
			return toAssetFileUrl(p, forceRefresh);
		} catch (e) {
			console.error('[preload] toUrl error:', e, 'input=', p);
			return '';
		}
	}
});

contextBridge.exposeInMainWorld('electronAPI', {
	readNewsList: () => ipcRenderer.invoke('read-news-list'),
	readNewsDetail: (id) => ipcRenderer.invoke('read-news-detail', id),
	saveNews: (detail, list) => ipcRenderer.invoke('save-news', {
		detail,
		list
	})
});