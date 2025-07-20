const {
	app,
	BrowserWindow,
	ipcMain
} = require('electron')
const path = require('path')
const fs = require('fs-extra')

let mainWindow

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1400,
		height: 900,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			webSecurity: false
		}
	})

	mainWindow.loadFile('NewsEditor.html')
	mainWindow.webContents.openDevTools()
}

function getDataPath() {
	return path.join(__dirname, '../public/data')
}

ipcMain.handle('read-news-list', async () => {
	const filePath = path.join(getDataPath(), 'news_list.json')
	try {
		return await fs.readJson(filePath)
	} catch {
		return []
	}
})

ipcMain.handle('read-news-detail', async (event, id) => {
	const filePath = path.join(getDataPath(), `news_${id}.json`)
	try {
		return await fs.readJson(filePath)
	} catch {
		return {
			id,
			title: '',
			time: new Date().toLocaleDateString('zh-CN'),
			categorylabel: '#Mint 进行时',
			sections: [{
				headPic: [],
				footerPic: [],
				contents: []
			}]
		}
	}
})

ipcMain.handle('save-news', async (event, {
	detail,
	list
}) => {
	const dataPath = getDataPath()

	try {
		await fs.ensureDir(dataPath)

		// 完全安全的JSON格式化
		const formatJSON = (obj) => {
			let jsonStr = JSON.stringify(obj, null, 2)
			// 使用字符串替换实现格式化
			jsonStr = jsonStr.replace(/\"sections\": $$\n\s*\{/g, '"sections": [\n        {')
			jsonStr = jsonStr.replace(/\"contents\": \[\n\s*\{/g, '"contents": [\n          {')
			jsonStr = jsonStr.replace(/\"headPic\": \[\n\s*/g, '"headPic": [\n          ')
			jsonStr = jsonStr.replace(/\"footerPic\": \[\n\s*/g, '"footerPic": [\n          ')
			return jsonStr
		}

		await Promise.all([
			fs.writeFile(path.join(dataPath, `news_${detail.id}.json`), formatJSON(detail)),
			fs.writeFile(path.join(dataPath, 'news_list.json'), formatJSON(list))
		])

		return {
			success: true
		}
	} catch (error) {
		return {
			success: false,
			error: error.message
		}
	}
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow()
})