const { app, BrowserWindow, ipcMain, Tray} = require('electron');
const path = require('path');
const {EmbedBuilder, WebhookClient} = require('discord.js');

function sendWebhook(text, url){
	const webhookClient = new WebhookClient({url: url});

	const embed = new EmbedBuilder()
		.setTitle('SneakySpy')
		.setDescription(text)
		.setColor('#0099ff');

	webhookClient.send({
		username: 'SneakySpy',
		embeds: [embed],
	});
}

ipcMain.on('setup', (event, arg) => {
	sendWebhook('SneakySpy is a software that will send you a message when someone is spying on you.', arg.url);
});

ipcMain.on('notif', (event, arg) => {
	sendWebhook('Someone is spying on you... Screen is now locked!', arg.url);
});

if (require('electron-squirrel-startup')) {
	app.quit();
}

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 480,
		height: 600,
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
		icon: __dirname + '/logo.png',
	});

	const tray = createTray();
	mainWindow.loadFile(path.join(__dirname, 'loading.html'));
    setTimeout(() => mainWindow.loadFile(path.join(__dirname, 'index.html')), 3000);


	function createTray() {
		const iconPath = __dirname + '/logo.png';
		const tray = new Tray(iconPath);
		tray.setToolTip('SneakySpy');
		tray.on('click', () => {
			mainWindow.show();
		});
		tray.on('double-click', function (event) {
			tray.destroy();
			app.quit();
		});
		return tray;
	}

	ipcMain.on('hide', (event, arg) => {
		mainWindow.hide();
	});

	mainWindow.on('close', event=>{
		event.preventDefault();
		mainWindow.hide();
	});

	/* mainWindow.webContents.openDevTools(); */
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
