var timer;

const config = {
    initialForm: document.getElementById('initialForm'),
    mainGamePage: document.getElementById('mainGamePage'),
    settingPage: document.getElementById('settingPage')
}

const initSetting = {
    age: 20,
    money: 50000,
    days: 1,
    burgerCount: 0,
    gameSpeed: 1
}

function displayNone(ele){
    ele.classList.remove("d-block");
    ele.classList.add("d-none");
}

function displayBlock(ele){
    ele.classList.remove("d-none");
    ele.classList.add("d-block");
}

class Item {
    constructor(name, type, maxPurchases, price, priceIncreaseRate, incomeRate, imgURL, purchaseCount=0) {
        this.name = name;
        this.type = type;
        this.maxPurchases = maxPurchases;
        this.initPrice = price; // 初期状態の値段
        this.price = price;
        this.priceIncreaseRate = priceIncreaseRate;
        this.incomeRate = incomeRate; // クリックまたは1秒ごとに取得できる利益（￥ or percent）
        this.imgURL = imgURL;
        this.purchaseCount = purchaseCount; // 購入数
    }

    // 購入価格を購入回数に応じて値上げする
    increasePrice() {
        this.price = Math.floor(this.price * (1 + this.priceIncreaseRate / 100));
    }

    // 1s or 1clickごとの収入を計算する
    calculateIncome() {
        if (this.type === 'investment') return Math.floor(this.purchaseCount * this.price * this.incomeRate / 100);
        else if (this.type === 'realEstate') return this.purchaseCount * this.incomeRate;
        else if (this.type === 'ability') return this.purchaseCount * this.incomeRate;
    }

    // itemの説明文を作成する
    makeExplanation() {
        if (this.type === 'investment') return `Get ${this.incomeRate}% of stockholdings per second`
        else if (this.type === 'realEstate') return `Get extra ￥${this.incomeRate.toLocaleString()} per second `
        else if (this.type === 'ability') return `Get extra ￥${this.incomeRate.toLocaleString()} per click`
    }

    // 収益率の説明文を作成する
    makeIncomeRateExplanation() {
        if (this.type === 'investment') return `+ ${this.incomeRate}% / sec`
        else if (this.type === 'realEstate') return `+￥${this.incomeRate.toLocaleString()} / sec`;
        else if (this.type === 'ability') return `+￥${this.incomeRate.toLocaleString()} / click`
    }
}


class UserAccount {
    constructor(name, items, money, age, days, burgerCount){
        this.name = name;
        this.initAge = age;
        this.age = age;
        this.items = items;
        this.money = money;
        this.days = days;
        this.burgerCount = burgerCount;
    }

    buyItem(itemName, itemCount) {
        if (isNaN(itemCount)) {
            alert("Wrong input!");
            return false;
        } else {
            if (this.money - this.items[itemName].price * itemCount >= 0) {
                if (this.items[itemName].purchaseCount + itemCount <= this.items[itemName].maxPurchases) {
                    this.money -= this.items[itemName].price * itemCount;
                    this.items[itemName].purchaseCount += itemCount;
                    this.items[itemName].increasePrice(); // ユーザの所時金を減らした後に、値上げする。逆はだめ。
                    return true;
                } else {
                    alert('You cannot buy any more!');
                    return false;
                }
            } else {
                alert("You don't have enough money!");
                return false;
            }
        }
    }

    getIncomePerSec() {
        let incomeSummation = 0
        let itemsValue = Object.values(this.items);

        itemsValue.forEach(function (itemValue) {
            if (itemValue.type !== 'ability') incomeSummation += itemValue.calculateIncome();
        })

        this.money += incomeSummation;
        return incomeSummation;
    }

    getIncomePerClick() {
        let incomeSummation = 0
        let itemsValue = Object.values(this.items);

        itemsValue.forEach(function (itemValue) {
            if (itemValue.type === 'ability') incomeSummation += itemValue.calculateIncome();
        })

        this.money += incomeSummation;
        this.burgerCount += this.items['FlipMachine'].purchaseCount;
        return incomeSummation;
    }

    calculateAge() {
        this.age = this.initAge + Math.floor(this.days / 365);
        return this.age;
    }

    getAvailablePurchase(itemName) {
        let availablePurchase = Math.floor(this.money / this.items[itemName].price);
        if (availablePurchase + this.items[itemName].purchaseCount > this.items[itemName].maxPurchases) {
            return this.items[itemName].maxPurchases - this.items[itemName].purchaseCount;
        }
        return availablePurchase;
    }
}

function dispSettingPage(){
    displayNone(config.initialForm);
    displayBlock(config.settingPage);
    config.settingPage.append(settingPage());
}

function settingPage(){
    let container = document.createElement('div');
    container.classList.add('d-flex');
    container.innerHTML =
    `
    <div class="col-12 justify-content-center p-3">
        <h2 class="pb-3 text-center">Basic Settings</h2>
        <form onsubmit="confirmSetting(); event.preventDefault()">
            <div class="form-group row mb-2">
                <label for="age" class="col-2 col-form-label text-start">Age</label>
                <div class="col-10">
                    <input type="number" class="form-control form-control-sm text-right" min="0" id="age" required="required">
                </div>
            </div>
            <div class="form-group row mb-2">
                <label for="days" class="col-2 col-form-label text-start">Days</label>
                <div class="col-10">
                    <input type="number" class="form-control form-control-sm text-right" id="days" min="0" required="required"">
                </div>
            </div>
            <div class="form-group row mb-2">
                <label for="money" class="col-2 col-form-label text-start">Money ￥</label>
                <div class="col-10">
                    <input type="number" class="form-control form-control-sm text-right" id="money" min="0" required="required">
                </div>
            </div>
            <div class="form-group row">
                <label for="formRange3" class="col-2 form-label text-start">Game Speed ×<span id="gameSpeedSpan"></span></label>
                <div class="col-10">
                    <input id="gameSpeed" type="range" class="form-range" min="1" max="100">
                </div>
            </div>
            <div class="d-flex justify-content-center my-3">
                <div class="col-6 pe-1">
                    <button class="btn btn-outline-primary col-12 back-btn">Back</button>
                </div>
                <div class="col-6 ps-1">
                    <button type="submit" class="btn btn-primary col-12 next-btn">Confirm</button>
                </div>
            </div>
        </form>
    </div>
    `

    // Game Speed Sliderを変化させた時の動作を追加
    let gameSpeed = container.querySelectorAll("#gameSpeed")[0];
    let gameSpeedSpan = container.querySelectorAll("#gameSpeedSpan")[0];
    gameSpeed.addEventListener('change', function(){
        gameSpeedSpan.innerHTML = gameSpeed.value;
    });

    // 各inputのvalueを設定
    container.querySelectorAll("#age")[0].value = String(initSetting.age);
    container.querySelectorAll("#days")[0].value = String(initSetting.days);
    container.querySelectorAll("#money")[0].value = String(initSetting.money);
    container.querySelectorAll("#gameSpeed")[0].value = String(initSetting.gameSpeed);
    gameSpeedSpan.innerHTML = gameSpeed.value;

    // btnを押したときの操作
    let confirmBackBtn = container.querySelectorAll(".back-btn")[0];
    let confirmNextBtn = container.querySelectorAll(".next-btn")[0];

    confirmBackBtn.addEventListener('click', function(){
        config.settingPage.innerHTML = '';
        displayNone(config.settingPage);
        displayBlock(config.initialForm);
    })

    return container;
}

function confirmSetting() {
    initSetting.age = parseInt(document.getElementById('age').value);
    initSetting.days = parseInt(document.getElementById('days').value);
    initSetting.money = parseInt(document.getElementById('money').value);
    initSetting.gameSpeed = parseInt(document.getElementById('gameSpeed').value);

    config.settingPage.innerHTML = '';
    displayNone(config.settingPage);
    displayBlock(config.initialForm);
}

function dispMainGamePage(type) {
    let userAccount;
    if (type === 'new') userAccount = makeNewUserAccount();
    else if (type === 'load') userAccount = loadUserAccount();

    if (userAccount !== false) {
        //1ページ目を非表示にして、2ページ目を呼び出し
        displayNone(config.initialForm);
        displayBlock(config.mainGamePage);
        config.mainGamePage.append(mainGamePage(userAccount, itemList(userAccount)));
        updateInfoPerSec(userAccount, 1000/initSetting.gameSpeed);
    }
}

function makeNewUserAccount() {
    let items = {
        FlipMachine: new Item('Flip machine', 'ability', 500, 15000, 0, 25, 'https://cdn-icons-png.flaticon.com/512/823/823215.png', 1),
        ETFStock: new Item('ETF Stock', 'investment', Infinity, 300000, 10, 0.1, 'https://cdn-icons-png.flaticon.com/512/4222/4222019.png'),
        ETFBonds: new Item('ETF Bonds', 'investment', Infinity, 300000, 0, 0.07, 'https://cdn-icons-png.flaticon.com/512/2601/2601439.png'),
        LemonadeStand: new Item('Lemonade Stand', 'realEstate', 1000, 30000, 0, 30, 'https://cdn-icons-png.flaticon.com/512/941/941769.png'),
        IceCreamTruck: new Item('Ice Cream Truck', 'realEstate', 500, 100000, 0, 120, 'https://cdn-icons-png.flaticon.com/512/3181/3181382.png'),
        House: new Item('House', 'realEstate', 100, 20000000, 0, 32000, 'https://cdn-icons-png.flaticon.com/512/619/619153.png'),
        TownHouse: new Item('TownHouse', 'realEstate', 100, 40000000, 0, 64000, 'https://cdn-icons-png.flaticon.com/512/2590/2590620.png'),
        Mansion: new Item('Mansion', 'realEstate', 20, 250000000, 0, 500000, 'https://cdn-icons-png.flaticon.com/512/492/492058.png'),
        IndustrialSpace: new Item('Industrial Space', 'realEstate', 10, 1000000000, 0, 2200000, 'https://cdn-icons-png.flaticon.com/512/1258/1258543.png'),
        HotelSkyscraper: new Item('Hotel Skyscraper', 'realEstate', 5, 10000000000, 0, 25000000, 'https://cdn-icons-png.flaticon.com/512/683/683255.png'),
        BulletSpeedSkyRailway: new Item('Bullet-Speed Sky Railway', 'realEstate', 1, 10000000000000, 0, 30000000000, 'https://cdn-icons-png.flaticon.com/512/3112/3112932.png')
    };

    const form = document.getElementById('user-form');
    let userName = form.querySelectorAll(`input[name="userName"]`).item(0).value;

    let userAccount = new UserAccount(
        userName,
        items,
        initSetting.money,
        initSetting.age,
        initSetting.days,
        initSetting.burgerCount
    )

    return userAccount;
}

function loadUserAccount() {
    const form = document.getElementById('user-form');
    let userName = form.querySelectorAll(`input[name="userName"]`).item(0).value;

    if (localStorage.getItem(userName) === null) {
        alert('There are no data.');
        return false;
    }
    let jsonData  = localStorage.getItem(userName);
    let userJsonDecoded = JSON.parse(jsonData);
    console.log(userJsonDecoded);

    let items = {};
    let keyArray = Object.keys(userJsonDecoded.items);
    keyArray.forEach(function (element) {
        items[element] = new Item(
            userJsonDecoded.items[element].name,
            userJsonDecoded.items[element].type,
            userJsonDecoded.items[element].maxPurchases,
            userJsonDecoded.items[element].price,
            userJsonDecoded.items[element].priceIncreaseRate,
            userJsonDecoded.items[element].incomeRate,
            userJsonDecoded.items[element].imgURL,
            userJsonDecoded.items[element].purchaseCount
        );
    });

    let userAccount = new UserAccount(
        userJsonDecoded.name,
        items,
        userJsonDecoded.money,
        userJsonDecoded.age,
        userJsonDecoded.days,
        userJsonDecoded.burgerCount
    )
    console.log(items);
    return userAccount;
}

var timer;
function updateInfoPerSec(userAccount, sec) {
    // 1s毎に右上部の表示を更新する
    timer = setInterval(function(){
        let ageSpan = document.getElementById("age");
        let daysSpan = document.getElementById("days");
        let moneySpan = document.getElementById("money");
        userAccount.days += 1;
        userAccount.getIncomePerSec();
        ageSpan.innerHTML = `${userAccount.calculateAge()}`;
        daysSpan.innerHTML = `${userAccount.days}`;
        moneySpan.innerHTML = `${userAccount.money.toLocaleString()}`;
    }, sec);
}

function stopUpdateInfoPerSec() {
    clearInterval(timer);
}

function mainGamePage(userAccount, itemContaierDiv) {
    let container = document.createElement('div');
    container.classList.add('row');
    container.innerHTML =
    `
    <div class="col-md-3 justify-content-center text-center text-white bg-grey p-2 pb-0 pb-md-2">
        <div class="bg-dark px-3 py-2 h-100">
            <div class="d-flex flex-column justify-content-center align-items-center bg-grey p-2 mb-md-5 mb-3">
                <p class="rem1p4"><span id="burgerCount">${userAccount.burgerCount}</span> Burgers</p>
                <p>￥${(25 * userAccount.items['FlipMachine'].purchaseCount).toLocaleString()} per click</p>
            </div>
            <div class="d-flex flex-column justify-content-center align-items-center bg-dark h-40">
                <img id="burgerImg" class="cursor-pointer burger-img" src="https://cdn.pixabay.com/photo/2016/06/04/07/17/hamburger-1435092_960_720.png" >
            </div>
        </div>
    </div>

    <div class="col-md-9 justify-content-center text-center bg-grey p-2">
        <div class="bg-dark p-1 mb-2">
            <div class="d-flex flex-row justify-content-center flex-wrap text-white bg-grey">
                <div class="col-6 border border-dark border-2 p-2">
                    <p id="name">${userAccount.name}</p>
                </div>
                <div class="col-6 border border-dark border-2 p-2">
                    <p><span id="age">${userAccount.age}</span> yrs old</p>
                </div>
                <div class="col-6 border border-dark border-2 p-2">
                    <p><span id="days">${userAccount.days}</span> days</p>
                </div>
                <div class="col-6 border border-dark border-2 p-2">
                    <p>￥<span id="money">${userAccount.money.toLocaleString()}</span></p>
                </div>
            </div>
        </div>

        <div id="itemContaier">
        </div>

        <div class="p-2 mt-2 text-end text-white">
            <i id="reset" class="fas fa-redo-alt text-white rem1p8 border border-white p-2 me-2 cursor-pointer"></i>
            <i id="save" class="far fa-save text-white rem1p8 border border-white p-2 cursor-pointer"></i>
        </div>
    </div>
    `;

    let itemContainer = container.querySelectorAll('#itemContaier').item(0);
    itemContainer.innerHTML = '';
    itemContainer.append(itemContaierDiv);

    let burgerImg = container.querySelectorAll("#burgerImg").item(0);
    burgerImg.addEventListener('click', function(){
        userAccount.getIncomePerClick();
        let burgerSpan = document.getElementById("burgerCount");
        let moneySpan = document.getElementById("money");
        burgerSpan.innerHTML = `${userAccount.burgerCount.toLocaleString()}`;
        moneySpan.innerHTML = `${userAccount.money.toLocaleString()}`;
    })

    let resetI = container.querySelectorAll("#reset").item(0);
    resetI.addEventListener('click', function() {
        var result = window.confirm('Do you want to return to home?\nPlease confirm your data is saved.');
        if (result) {
            stopUpdateInfoPerSec();
            config.mainGamePage.innerHTML = '';
            displayNone(config.mainGamePage);
            displayBlock(config.initialForm);
        }
    })

    let saveI = container.querySelectorAll("#save").item(0);
    saveI.addEventListener('click', function(){
        saveUserData(userAccount);
    })

    return container;
}

function saveUserData(userAccount) {
    let jsonEncoded = JSON.stringify(userAccount);
    localStorage.setItem(userAccount.name, jsonEncoded);
    alert('Your data was saved! \nPlease set same name next time to use your saved data.');
}

function itemList(userAccount) {
    // itemのリスト作成
    let container = document.createElement('div');
    container.classList.add('bg-dark', 'p-2', 'overflow-auto', 'text-white', 'h-330px');

    let keyArray = Object.keys(userAccount.items);
    keyArray.forEach(function (element) {
        container.innerHTML +=
        `
        <div class="d-flex justify-content-center align-items-center bg-grey p-2 mb-1 cursor-pointer" data-item="${element}" id="item">
            <div class="col-2 text-center">
                <img src="${userAccount.items[element].imgURL}" class="img-fluid">
            </div>
            <div class="col-7 col-md-8 text-start p-3">
                <div class="d-flex flex-wrap">
                    <div class="col-12">
                        <p class="rem1p5">${userAccount.items[element].name}</p>
                    </div>
                    <div class="col-12 col-md-6">
                        <p>￥${userAccount.items[element].price.toLocaleString()}</p>
                    </div>
                    <div class="col-12 col-md-6">
                        <p class="text-green">${userAccount.items[element].makeIncomeRateExplanation()}</p>
                    </div>
                </div>
            </div>
            <div class="col-3 col-md-2 text-center">
                <p>${userAccount.items[element].purchaseCount}/${userAccount.items[element].maxPurchases}</p>
            </div>
        </div>
        `;
    })

    itemCards = container.querySelectorAll("#item");
    for (let i=0; i < itemCards.length; i++) {
        itemCards[i].addEventListener('click', function(){
            itemPageDiv = itemPage(userAccount, itemCards[i].getAttribute('data-item'));
            config.mainGamePage.innerHTML = '';
            config.mainGamePage.append(mainGamePage(userAccount, itemPageDiv));
        })
    }

    return container
}

function itemPage(userAccount, itemName){
    // itemの購入ページ作成
    let container = document.createElement('div');
    container.classList.add('bg-dark', 'p-2', 'overflow-auto', 'text-white', 'h-330px');

    container.innerHTML =
    `
    <div class="d-flex justify-content-center flex-wrap align-items-center bg-grey p-2">
        <div class="col-9 text-start">
            <p class="rem1p8">${itemName}</p>
            <p>Max Purchase: ${userAccount.items[itemName].maxPurchases}</p>
            <p>Purchased: ${userAccount.items[itemName].purchaseCount}</p>
            <p>Price: ￥${userAccount.items[itemName].price.toLocaleString()}</p>
            <p>${userAccount.items[itemName].makeExplanation()}</p>
        </div>
        <div class="col-3 text-center">
            <img src="${userAccount.items[itemName].imgURL}" class="img-fluid p-2">
        </div>

        <div class="col-12 text-start mt-3 mb-2">
            <label for="exampleFormControlInput1">How Many would you like to purchase? (Max: ${userAccount.getAvailablePurchase(itemName)})</label>
            <input type="number" class="form-control form-control-sm text-right" id="buy-item" min="0" value="0">
        </div>

        <div class="col-12 text-end my-2">
            <p>Total: ￥<span id="total-price">0</span></p>
        </div>

        <div class="col-6 pe-1">
            <button type="button" class="btn btn-outline-primary col-12 back-btn">Go Back</button>
        </div>
        <div class="col-6 ps-1">
            <button class="btn btn-primary col-12 next-btn">Purchase</button>
        </div>
    </div>
    `;

    // Totalの表示がinputに合わせて変更されるようにする処理
    countInput = container.querySelectorAll('#buy-item').item(0);
    console.log(countInput);
    countInput.addEventListener('change', function(){
        document.getElementById('total-price').innerHTML = String((userAccount.items[itemName].price * countInput.value).toLocaleString());
    })

    // back-btnを押したときの動作
    let confirmBackBtn = container.querySelectorAll(".back-btn")[0];
    let confirmNextBtn = container.querySelectorAll(".next-btn")[0];

    confirmBackBtn.addEventListener('click', function(){
        config.mainGamePage.innerHTML = '';
        itemListDiv = itemList(userAccount);
        config.mainGamePage.append(mainGamePage(userAccount, itemListDiv));
    });

    confirmNextBtn.addEventListener('click', function(){
        if (userAccount.buyItem(itemName, parseInt(countInput.value))){
            var result = window.confirm('Do you really want to buy?');
            if (result) {
                config.mainGamePage.innerHTML = '';
                itemListDiv = itemList(userAccount);
                config.mainGamePage.append(mainGamePage(userAccount, itemListDiv));
            }
        }
    })

    return container;
}

