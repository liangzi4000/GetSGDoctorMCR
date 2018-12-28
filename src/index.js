const puppeteer = require('puppeteer');
const config = require('./config.json');
const db = require('./database');
const common = require('./common');

(async () => {
    const browser = await puppeteer.launch({
        headless: false, args: [
            '--start-maximized',
            //'--kiosk',
            //'--start-fullscreen',
            '--no-default-browser-check',
            '--no-first-run',
            '--disable-infobars',
            //'--disable-session-crashed-bubble',
            //'--incognito'
            '--aggressive-cache-discard',
            '--disable-cache',
            '--disable-application-cache',
            '--disable-offline-load-stale-cache',
            '--disk-cache-size=0',
        ],
        //slowMo:120
    });
    const page = await browser.newPage();
    await page.setViewport({ width: config.environment.resolution.width, height: config.environment.resolution.height });
   
    //Open page http://www.healthprofessionals.gov.sg/smc
    //Click on Search (For Regisitered Doctors)
    
    console.log('Get record from database');
    let result = await db.GetNextNovaptusSurgeonName();

    while (result.recordset.length == 1) {
        console.log('Open landing page');
        await page.goto(config.startupurl);

        console.log('Enter doctor name');
        await common.typeOn(page, "#getSearchSummary_psearchParamVO_name", result.recordset[0].Name);

        console.log('Click on search');
        await common.clickOn(page, 'input[name="btnSearch"]', false);

        await page.waitForNavigation();

        let rows = await page.$$('#searchResultHead > table:nth-child(1) > tbody > tr');
        let returnresult = "", mcr = "";
        if (rows.length == 1) {
            console.log('found record ...');
            let elem = await page.$('#searchResultHead > table:nth-child(1) > tbody > tr:nth-child(1) > td > div:nth-child(1)');
            returnresult = await page.evaluate(el => el.innerText, elem);
            console.log(returnresult);
            mcr = (result.recordset[0].ReturnResult.match(/\(([a-zA-Z0-9]{7})\)/))[1];
            console.log(mcr);
        }else{
            console.log('unable to find record ...');
        }
        console.log('Update record to database');
        await db.UpdateNovaptusSurgeonMCR(result.recordset[0].ID, mcr, result.recordset[0].ReturnResult);

        console.log('Get record from database');
        result = await db.GetNextNovaptusSurgeonName();
    }
    console.log('Done');
})();