const {app, ipcMain} = require('electron')
const fs = require("fs")
const path = require('path');

app.whenReady().then(() => {
    const {net} = require('electron');
    const getHasRefererImageBase64 = (url, referer = "https://weibo.com/") => {
        return new Promise((resolve, reject) => {
            const request = net.request(url);
            request.setHeader('Referer', referer);
            request.on('response', (response) => {
                let chunks = [];
                response.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                response.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const base64 = buffer.toString('base64');
                    resolve(base64);
                });
            });
            request.on('error', (error) => {
                reject(error);
            });
            request.end();
        });
    };
    ipcMain.handle('getHasRefererImageBase64', (event, url, referer) => {
        return getHasRefererImageBase64(url, referer);
    })
    const getLocalFileText = (path) => {
        return new Promise((resolve, reject) => {
            fs.readFile(path, {encoding: "utf-8"}, (err, data) => {
                console.log(err)
                console.log(data)
                if (err) {
                    reject(err)
                }
                resolve(data)
            })
        })
    }
    // 获取文件
    ipcMain.handle('getLocalFileText', function (event, path) {
        return getLocalFileText(path)
    });
})
