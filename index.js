#!/usr/bin/env node

const {execSync} = require("child_process");
const fs = require('fs');
const path= require('path');
const archiver = require('archiver');
const args = process.argv.slice(2);
const envObj = {
    dev:`VUE_APP_HTTP_URL = http://172.18.21.211:8520/serve\nVUE_APP_WS_URL = ws://172.18.21.211:8520/serve`,
    test:`VUE_APP_HTTP_URL = http://172.18.21.150/ai_construction/serve\nVUE_APP_WS_URL = ws://172.18.21.150/ai_construction/serve`,
    lng:`VUE_APP_HTTP_URL = http://172.16.1.234/ai_construction/serve\nVUE_APP_WS_URL = ws://172.16.1.234/ai_construction/serve`,
    jiaxing:`VUE_APP_HTTP_URL = http://192.168.10.251/ai_construction/serve\nVUE_APP_WS_URL = ws://192.168.10.251/ai_construction/serve`,
    zhoushan:`VUE_APP_HTTP_URL = http://192.168.10.249/ai_construction/serve\nVUE_APP_WS_URL = ws://192.168.10.249/ai_construction/serve`,
    zhenhai:`VUE_APP_HTTP_URL = http://172.18.18.201/ai_construction/serve\nVUE_APP_WS_URL = ws://172.18.18.201/ai_construction/serve`,
    binhai:`VUE_APP_HTTP_URL = http://172.18.18.201/ai_construction/serve\nVUE_APP_WS_URL = ws://172.18.18.201/ai_construction/serve`,
    jinhua:`VUE_APP_HTTP_URL = http://172.18.18.118/ai_construction/serve\nVUE_APP_WS_URL = ws://172.18.18.118/ai_construction/serve`,
}

init();

function init(){
    checkBranch();
    writeEnv();
    build();
    toZip();
}
function writeEnv() {
    let willBuildEnv = args[1];
    if(!willBuildEnv){
        console.error('请指定打包的环境,如【lng】【dev】【test】');
        process.exit();
    }
    let envStr = envObj[willBuildEnv];
    if(!envStr) {
        console.error(`您指定的环境不存在，请检查或再【envObj】添加！`);
        process.exit();
    }
    fs.writeFileSync(path.join(__dirname,'.env'),envStr,'utf8');
    console.log(`环境配置完成,当前环境:【${willBuildEnv}】`)
}



function checkBranch() {
    let willBuildBranch = args[0];
    if(!willBuildBranch){
        console.error('请指定分支！如【dev】【test】【lng】');
        process.exit();
    }
    let  branchName =  execSync("git branch --show-current").toString().replace(/\n/g, "");
    if(branchName!== args[0]){
        try{
            console.log(`当前分支:【${branchName}】,打包分支:【${willBuildBranch}】,正在尝试切换分支...`);
            execSync("git checkout "+ args[0]);
            console.log(`切换分支成功,当前分支:【${willBuildBranch}】',开始打包...`);
            // build();
        }catch (e) {
            console.log('自动切换分支失败,请手动切换',e);
            process.exit();
        }
    }
    console.log(`开始打包...`)
}


function build(){
    console.log('正在打包中，请耐心等待...');
    execSync(`npm run build`);
    console.log(`打包完成，开始压缩...`);
}

function toZip() {
    let fileName = getFileName();
    const output = fs.createWriteStream(path.join(__dirname, `${fileName}.zip`));
    const archive = archiver('zip', {
        zlib: {level: 9}
    });
    archive.pipe(output);
    archive.directory(path.join(__dirname,'dist'),false);
    archive.finalize().then(res=>{
        output.on('close', function () {
            console.log(`压缩完成!文件名:${fileName}.zip,文件大小:${archive.pointer()} total bytes`);
        });
        archive.on('error', function (err) {
            console.error("压缩失败",err);
            throw err;
        });
    });
}

function getFileName() {
    let  branchName =  execSync("git branch --show-current").toString().replace(/\n/g, "");
    let env = args[1];
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
    const minute = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    const second = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
    return `${branchName}_${env ? env+'_' : ''}${year}_${month}_${day}_${hour}_${minute}_${second}`;
}






