const app = require('express')();
const bodyParser = require('body-parser');
const logger = require('morgan');
const axios = require('axios');

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}


const url = 'http://api.afrivessel.com/api/v1/';

const languageIndexArray = [1, 2, 3, 4, 5];
const languageArray = ['english', 'isizulu', 'sotho'];
const changeLanguage = [
    'Change Language',
    'Shintsha Ulimi',
    'Fetola Puo',
];

const backLAng = [
    'Back',
    'Emuva',
    'Morago',
];

const buyLang = [
    'Buy',
    'Thenga',
    'Reka',
];

const addToCartLang = [
    'Add to cart',
    'Engeza ekalishini',
    'Kenya lenaneng',
];


const buyTitleLang = [
    'Select options from the previous menu.\n e.g: 1-2-3 dash-separated for each item',
    'Khetha inketho kwimenyu edlule.\n isb. 1-2-3 ehlukaniswe ngodeshi wento ngayinye',
    'Khetha khetho ho tsoa lenaneng le fetileng.\n mohlala: 1-2-3 e arotsoe ka linoko bakeng sa ntho ka ngoe',
];


const languageMenu = async (sessionId, phoneNumber, serviceCode, user) => {

    const getLangs = await axios.get(url+'languages');
    const languages = getLangs.data.languages;

    let response = `CON Welcome ${ user.name } - ${phoneNumber}\n\nPlease select Language.`;

    let countSelect = 1;

    for ( const lang of languages ) {
        response+= `\n${countSelect}. ${lang.name}`;
        countSelect++;
    }

    return response;
};

const userExists = async (phoneNumber) => {
    const mainUrl = `${url}user/${phoneNumber}`;
    const getLangOptions = await axios.get(mainUrl);
    const user = getLangOptions.data.user;

    return user;
};

const createOrder = async (phoneNumber) => {

    const order = await axios.post(url+'order', {
        description: `${phoneNumber} ${localStorage.getItem('order')}`,
        product_id: 1,
        status: 1,
        date: '2021-08-28',
        items: localStorage.getItem('order'),
    });
};

const getVouchers = async (phoneNumber) => {
    const mainUrl = `${url}vouchers/${phoneNumber}`;
    const getLangOptions = await axios.get(mainUrl);
    const vouchers = getLangOptions.data.vouchers;

    return vouchers;
};

const port = process.env.PORT || 3030;

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('*', (req, res) => {
  res.send('Welcome to AfriVessal Online Store');
});

app.post('*', async (req, res) => {

    let {sessionId, serviceCode, phoneNumber, text} = req.body

    const tempNumber = phoneNumber.replace("+27", "0");

    const user = await userExists(tempNumber);

    if ( user === null ) {
        return res.send('END Sorry account not found, please go to portal to register');
    }

    if ( addToBasket(text) ) {
       goBack(text); 
    }

    if ( text.includes("77") ) {
        text = addToBasket(text);
    } else {
        text = goBack(goToMainMenu(text));
    }

    console.log(`text: ${text}`);

    // Language selection
    //

    if (text == '') {
        let response = await languageMenu(sessionId, phoneNumber, serviceCode, user);
        console.log(`response: ${response}`);
        res.send(response);

    //
    // Main Menu
    //

    } else if (text == '1' || text == '2' || text == '3' || text == '4' || text == '5') {
        let response = await generateLanguageMainMenu(Number(text));
        console.log(`response: ${response}`);
        res.send(response);

    //
    // Level 1 Menu Daily Calalog
    //
    }  else if (text == '1*1' || text == '2*1' || text == '3*1' || text == '4*1' || text == '5*1') {
        let response = await generateLanguageDailyCalalog(text);
        console.log(`response: ${response}`);
        res.send(response);
    //
    // Level 1 Menu Calalog
    //
    }  else if (text == '1*2' || text == '2*2' || text == '3*2' || text == '4*2' || text == '5*2') {
        let response = await generateLanguageCalalog(text);
        console.log(`response: ${response}`);
        res.send(response);
    //
    // Level 2 Menu Calalog Buy Option
    //
    }  else if (text == '1*2*77' || text == '2*2*77' || text == '3*2*77' || text == '4*2*77' || text == '5*2*77') {
        let response = await generateBuyMenu(text);
        console.log(`response: ${response}`);
        res.send(response);
    //
    // Level 1 Menu Daily Calalog   
    // 
    }  else if (text == '1*1*77' || text == '2*1*77' || text == '3*1*77' || text == '4*1*77' || text == '5*1*77') {
        let response = await generateBuyMenu(text);
        console.log(`response: ${response}`);
        res.send(response);

    //
    // Confirmation page
    //
    }  else if (text == '1*2*1' || text == '2*2*1' || text == '3*2*1' || text == '4*2*1' || text == '5*2*1' ||
        text == '1*1*1' || text == '2*1*1' || text == '3*1*1' || text == '4*1*1' || text == '5*1*1') {

        await createOrder(phoneNumber);

        res.send('END Thank you for shoping with us');
    //
    // Level 1 Menu Voucher
    //
    }  else if (text == '1*3' || text == '2*3' || text == '3*3' || text == '4*3' || text == '5*3') {
        let response = await generateLanguageVoucherMenu(text, phoneNumber);
        console.log(`response: ${response}`);
        res.send(response);

    //
    // Level 1 Menu My Account
    //
    }  else if (text == '1*4' || text == '2*4' || text == '3*4' || text == '4*4' || text == '5*4') {
        let response = await generateLanguageMyAccountMenu(text);
        console.log(`response: ${response}`);
        res.send(response);

    //
    // Level 1 Menu My Number
    //
    }  else if (text == '1*5' || text == '2*5' || text == '3*5' || text == '4*5' || text == '5*5') {
        let response = await generateLanguageMyNumberMenu(text, phoneNumber);
        console.log(`response: ${response}`);
        res.send(response);

    } else {
        res.send('END Sorry option not found');
    }  

    
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
});

function goBack(text){
    let elementArray = new String(text).split('*');        
    while(elementArray.indexOf("98") != -1){
        let index = elementArray.indexOf("98");
        elementArray.splice(index-1,2);
    }
    return elementArray.join("*");
}

function goToMainMenu(text){
    let elementArray = new String(text).split('*');
    while(elementArray.indexOf("99") != -1){
        let index = elementArray.indexOf("99");
        elementArray.splice(0,index+1);
    }
    return elementArray.join("*");
}

function generateFooter(lang, isMain, hasbuy=false) {

    let response = '\n\n98. ' + backLAng[languageArray.indexOf(lang)];

    if ( isMain ) {
        response+= `\n99. ${changeLanguage[languageArray.indexOf(lang)]}`;
    } 

    if( hasbuy ) {
        
        response+= `\n\n77. ${buyLang[languageArray.indexOf(lang)]}`;
    }

    return response;
}


async function generateLanguageMainMenu(text) {

    const type = text;
    const lang = languageArray[Number(type) - 1];

    const mainUrl = `${url}page/options/${lang}/${type}`;
    const getLangOptions = await axios.get(mainUrl);
    const options = getLangOptions.data.options;

    let response = 'CON Main Menu.';

    let countSelect = 1;

    for ( const option of options ) {
        response+= `\n${countSelect}. ${option.option}`;
        countSelect++;
    }

    response+= generateFooter(lang, true);

    return response;
}

// Level 1 Menu Daily Calalog
//
async function generateLanguageDailyCalalog(text) {

    let elementArray = new String(text).split('*'); 
    const lang = languageArray[Number(elementArray[0]) - 1];

    console.log(`lang: ${lang}`);

    let response = 'CON Daily Calalog.';

    const mainUrl = `${url}productsInSpecial/${lang}`;
    const getLangOptions = await axios.get(mainUrl);
    const products = getLangOptions.data.products;


    let countSelect = 1;

    for ( const product of products ) {
        response+= `\n${countSelect}. ${product.desc} - R ${product.price}`;
        countSelect++;
    }

    response+= generateFooter(lang, true, true);

    return response;
}

// Level 1 Menu All Calalog
//
async function generateLanguageCalalog(text) {

    let elementArray = new String(text).split('*'); 
    const lang = languageArray[Number(elementArray[0]) - 1];

    console.log(`lang: ${lang}`);

    let response = 'CON Calalog Menu.';

    const mainUrl = `${url}productsByLanguage/${lang}`;
    const getLangOptions = await axios.get(mainUrl);
    const products = getLangOptions.data.products;


    let countSelect = 1;

    for ( const product of products ) {
        response+= `\n${countSelect}. ${product.desc} - R ${product.price}`;
        countSelect++;
    }

    response+= generateFooter(lang, true, true);

    return response;
}

// Level 1 Menu Voucher Menu
//
async function generateLanguageVoucherMenu(text, phoneNumber) {

    let elementArray = new String(text).split('*'); 
    const lang = languageArray[Number(elementArray[0]) - 1];

    const tempNumber = phoneNumber.replace("+27", "0");

    const vouchers = await getVouchers(tempNumber);

    let response = 'CON Voucher Menu.';

    console.log(`vouchers.status: ${vouchers.status}`);

    if (vouchers && vouchers.length > 0) {
       let countSelect = 1;
        for ( const voucher of vouchers ) {
            response+= `\n${countSelect}. R ${voucher.amount}`;
            countSelect++;
        }     
    } else {
        response+= '\n\nNo Vouncher\n\n';
    }

    console.log(`vouchers: ${vouchers}`);

    response+= generateFooter(lang, true);

    return response;
}

// Level 1 Menu Voucher Menu
//
async function generateLanguageMyAccountMenu(text) {

    let elementArray = new String(text).split('*'); 
    const lang = languageArray[Number(elementArray[0]) - 1];

    console.log(`lang: ${lang}`);

    const mainUrl = `${url}balance/2`;
    const getBalance = await axios.get(mainUrl);
    const myBalance = getBalance.data.balance;

    let response = 'CON My Account Menu.';

    response+= '\n\nAccount Bal: ' + myBalance + '\n\n';
    response+= generateFooter(lang, true);

    return response;
}

// Level 1 Menu Voucher Menu
//
async function generateLanguageMyNumberMenu(text, phoneNumber) {

    let elementArray = new String(text).split('*'); 
    const lang = languageArray[Number(elementArray[0]) - 1];

    console.log(`lang: ${lang}`);

    let response = 'CON My Number Menu.';

    response+= '\n\nNumber: '+phoneNumber+'\n\n';

    response+= generateFooter(lang, true);

    return response;
}

async function generateBuyMenu(text) {

    let elementArray = new String(text).split('*'); 
    const lang = languageArray[Number(elementArray[0]) - 1];

    let response = 'CON ' + buyTitleLang[languageArray.indexOf(lang)] + '\n';

    response+= generateFooter(lang, true);

    return response;  
}

function addToBasket(text) {
    let elementArray = new String(text).split('*');
    let index = elementArray.indexOf("77");
    let inLen = elementArray.length;

    if ( inLen > (index + 1) ) {
        console.log(`selectedItem: ${elementArray[inLen-1]}`);
        localStorage.setItem('order', elementArray[inLen-1]);
        elementArray.splice(index);
        elementArray.push(1);
        console.log(`elementArray: ${elementArray}`);
        console.log(`elementArray.join("*"): ${elementArray.join("*")}`);
        return elementArray.join("*");
    }
    return elementArray.join("*");
}




