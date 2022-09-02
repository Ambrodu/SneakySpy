const { app, BrowserWindow, ipcMain, Tray} = require('electron');
const path = require('path');
const {EmbedBuilder, WebhookClient} = require('discord.js');
var powerSaveBlocker = require('electron').powerSaveBlocker;
powerSaveBlocker.start('prevent-app-suspension');

function sendWebhook(text, url){
	const webhookClient = new WebhookClient({url: url});

	const embed = new EmbedBuilder()
		.setTitle('SneakySpy')
		.setDescription(text)
		.setColor('#0099ff');

	webhookClient.send({
		username: 'SneakySpy',
		avatarURL: 'https://cdn.discordapp.com/attachments/476773158679216129/1015333932146884658/logo.png',
		embeds: [embed],
	});
}

ipcMain.on('setup', (event, arg) => {
	sendWebhook('SneakySpy is a software that will send you a message when someone is spying on you.', arg.url);
});

ipcMain.on('notif', (event, arg) => {
	sendWebhook('Someone is spying on you... Screen is now locked!', arg.url);
});

/* ipcMain.on('log', (event, arg) => {
	console.log(arg.log);
}); */

timerOn = false;

ipcMain.on('stoptimer', (event, arg) => {
	timerOn = false;
});

ipcMain.on('timer', (event, arg) => {
	time = 15;
	timerOn = true;
	function start(){
		/* console.log(time); */
		if (!timerOn){
			event.reply('timer', {time: time});
			return;
		}
		if (time == 0){
			event.reply('timer', {time: 0});
			return;
		}
		setTimeout(() => {
			time--;
			start();
		}, 1000);
	}
	start();
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
			nodeIntegrationInWorker: true,
		},
		icon: __dirname + '/logo.png',
	});
	/* devtools = new BrowserWindow();
	mainWindow.webContents.setDevToolsWebContents(devtools.webContents)
	mainWindow.webContents.openDevTools({ mode: 'detach' }) */

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
			if (timerOn == false){
				tray.destroy();
				app.quit();
			}else{
				mainWindow.show();
			}
		});
		return tray;
	}

	ipcMain.on('hide', (event, arg) => {
		mainWindow.hide();
	});

	mainWindow.on('close', event=>{
		mainWindow.hide();
		event.preventDefault();
	});

	mainWindow.removeMenu();
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

app.on("before-quit", ev => {
    mainWindow.removeAllListeners("close");
    mainWindow = null;
});