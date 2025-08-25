// main.js
const {
	app,
	BrowserWindow,
	ipcMain,
	dialog
} = require('electron');
const path = require('path');
const fse = require('fs-extra');

let mainWindow;

// ---- 简单的配置持久化（记住项目根路径） ----
function getUserConfigPath() {
	return path.join(app.getPath('userData'), 'config.json');
}

function loadUserConfig() {
	try {
		return JSON.parse(fse.readFileSync(getUserConfigPath(), 'utf8'));
	} catch {
		return {};
	}
}

function saveUserConfig(cfg) {
	fse.ensureDirSync(path.dirname(getUserConfigPath()));
	fse.writeFileSync(getUserConfigPath(), JSON.stringify(cfg, null, 2), 'utf8');
}

// ---- 解析“项目根”路径（mint_bio_news_editor） ----
// 优先级：命令行 --app-root > 环境变量 NEWS_APP_ROOT > 记住的 config > 自动探测 > 开发态默认
async function resolveProjRoot() {
	// 1) 命令行参数
	const cliArg = process.argv.find(a => a.startsWith('--app-root='));
	if (cliArg) {
		const p = cliArg.split('=')[1].replace(/^"+|"+$/g, '');
		if (p && fse.existsSync(p) && await isValidProjRoot(p)) return rememberRoot(p);
	}

	// 2) 环境变量
	const env = process.env.NEWS_APP_ROOT || process.env.EDITORAPP_ROOT;
	if (env && fse.existsSync(env) && await isValidProjRoot(env)) return rememberRoot(env);

	// 3) 已保存的
	const saved = loadUserConfig().appRoot;
	if (saved && fse.existsSync(saved) && await isValidProjRoot(saved)) return saved;

	// 4) 自动探测（从 exeDir 往上找）
	const exeDir = path.dirname(process.execPath);
	const probe = await findProjRootFrom(exeDir);
	if (probe) return rememberRoot(probe);

	// 5) 开发态默认
	if (!app.isPackaged) {
		const dev = path.resolve(__dirname, '..'); // news-editor -> 上一级是 mint_bio_news_editor
		if (await isValidProjRoot(dev)) return dev;
	}

	// 6) 实在找不到：弹窗让你选一次，并记住
	const picked = await pickProjRoot();
	if (picked) return rememberRoot(picked);

	// 7) 还不选就退出
	throw new Error('未能解析项目根目录。请使用 --app-root 或 NEWS_APP_ROOT 指定，或在提示中选择。');
}

function rememberRoot(p) {
	const cfg = loadUserConfig();
	cfg.appRoot = p;
	saveUserConfig(cfg);
	return p;
}

// 判断一个路径是否是我们要的“项目根”
async function isValidProjRoot(root) {
	// 任意命中都算：public/data/news_list.json 或 src/assets/News 目录存在
	const dataHint = path.join(root, 'public', 'data', 'news_list.json');
	const assetsHint = path.join(root, 'src', 'assets', 'News');
	return (await fse.pathExists(dataHint)) || (await fse.pathExists(assetsHint));
}

// 从某目录开始往上 5 层尝试
async function findProjRootFrom(startDir) {
	const candidates = [
		startDir,
		path.resolve(startDir, '..'),
		path.resolve(startDir, '..', '..'),
		path.resolve(startDir, '..', '..', '..'),
		path.resolve(startDir, '..', '..', '..', '..'),
	];
	for (const root of candidates) {
		if (await isValidProjRoot(root)) return root;
	}
	return null;
}

// 让你手动选一次项目根（只在找不到时触发）
async function pickProjRoot() {
	const r = await dialog.showOpenDialog({
		title: '请选择项目根目录（应包含 public/data 与 src/assets）',
		properties: ['openDirectory']
	});
	const chosen = r.canceled ? '' : r.filePaths?.[0];
	if (!chosen) return '';
	if (!(await isValidProjRoot(chosen))) {
		await dialog.showMessageBox({
			type: 'warning',
			message: '所选目录未检测到 public/data 或 src/assets/News，请重新选择。'
		});
		return await pickProjRoot();
	}
	return chosen;
}

// ---- 基于项目根，计算数据与图片基准目录 ----
async function resolveDataDir() {
	const root = await resolveProjRoot();
	return path.join(root, 'public', 'data');
}
async function resolveAssetsBase() {
	const root = await resolveProjRoot();
	return path.join(root, 'src', 'assets');
}

// ---- preload 同步获取图片根目录（尽量用同步快速返回）----
ipcMain.on('assets:getBaseSync', (event) => {
	try {
		// 尝试：命令行/环境变量/已保存；否则从 exeDir 向上找；最后开发态默认
		const exeDir = path.dirname(process.execPath);
		const cfg = loadUserConfig();
		const prefer = cfg.appRoot ||
			(process.argv.find(a => a.startsWith('--app-root='))?.split('=')[1]) ||
			process.env.NEWS_APP_ROOT ||
			process.env.EDITORAPP_ROOT;
		const roots = [
			prefer,
			exeDir,
			path.resolve(exeDir, '..'),
			path.resolve(exeDir, '..', '..'),
			path.resolve(exeDir, '..', '..', '..'),
			path.resolve(exeDir, '..', '..', '..', '..'),
			path.resolve(__dirname, '..'), // dev fallback
		].filter(Boolean);

		for (const r of roots) {
			const base = path.join(r, 'src', 'assets');
			try {
				if (fse.existsSync(base)) {
					event.returnValue = base;
					return;
				}
			} catch {}
		}
		// 最后的兜底
		event.returnValue = path.resolve(__dirname, '../src/assets');
	} catch {
		event.returnValue = path.resolve(__dirname, '../src/assets');
	}
});

// ---- 窗口 ----
function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1400,
		height: 900,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			sandbox: false,
		}
	});

	mainWindow.loadFile(path.join(__dirname, 'NewsEditor.html'));

	// 调试用：安装版也打开 DevTools；确认无误后可改成仅开发态打开
	mainWindow.webContents.openDevTools();
}

// ---- IPC：读写 ----
ipcMain.handle('read-news-list', async () => {
	const dir = await resolveDataDir();
	const filePath = path.join(dir, 'news_list.json');
	try {
		if (!(await fse.pathExists(filePath))) {
			dialog.showMessageBox({
				type: 'warning',
				message: `未找到新闻列表：\n${filePath}`
			});
			return [];
		}
		return await fse.readJson(filePath);
	} catch (e) {
		dialog.showErrorBox('读取列表失败', `${filePath}\n\n${String(e)}`);
		return [];
	}
});

ipcMain.handle('read-news-detail', async (_event, id) => {
	const dir = await resolveDataDir();
	const filePath = path.join(dir, `news_${id}.json`);
	try {
		if (!(await fse.pathExists(filePath))) {
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
			};
		}
		return await fse.readJson(filePath);
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
		};
	}
});

ipcMain.handle('save-news', async (_event, {
	detail,
	list
}) => {
	const dir = await resolveDataDir();
	try {
		await fse.ensureDir(dir);
		await Promise.all([
			fse.writeFile(path.join(dir, `news_${detail.id}.json`), JSON.stringify(detail, null, 2),
				'utf8'),
			fse.writeFile(path.join(dir, 'news_list.json'), JSON.stringify(list, null, 2), 'utf8')
		]);
		return {
			success: true
		};
	} catch (error) {
		dialog.showErrorBox('保存失败', `${dir}\n\n${String(error)}`);
		return {
			success: false,
			error: error.message
		};
	}
});

// ---- 生命周期 ----
app.whenReady().then(async () => {
	const root = await resolveProjRoot();
	console.log('[main] PROJ_ROOT :', root);
	console.log('[main] ASSETS_BASE:', path.join(root, 'src', 'assets'));
	console.log('[main] DATA_DIR  :', path.join(root, 'public', 'data'));
	createWindow();
});
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});