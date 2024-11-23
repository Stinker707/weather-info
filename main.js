import conditions from './condition.js';


const apiKey = 'e6051476c5664333a9f172047242011';
const form = document.querySelector('#form');
const input = document.querySelector('#inputCity');
const header = document.querySelector('.header')

async function getWeather(city) {
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    return data;
}

function removeCard() {
    const prevCard = document.querySelector('.card');
    if (prevCard) {
        prevCard.remove();
     }
}

function showError(errorMessage) {
    const html = `<div class="card">${errorMessage}</div>`;
    header.insertAdjacentHTML('afterend', html);
}

function showCard({name, country, temp, condition, imgPath}) {
    const htmlImg = imgPath ? `<img class="card-img" src="${imgPath}" alt=""></img>` : ''
    const html = `<div class="card">
                        <h2 class="card-city">${name} <span>${country}</span></h2>

                        <div class="card-weather">
                            <div class="card-value">${temp}<sup>°c</sup></div>
                            <div>${htmlImg}</div>
                            </div class="card-description">${condition}</div>
                        </div>
                    </div>`

    header.insertAdjacentHTML('afterend', html);
}

async function checkImgSrc(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
            resolve(true);  // Изображение загружено успешно
        };
        
        img.onerror = () => {
            resolve(false);  // Ошибка при загрузке изображения
        };
        
        img.src = url;
    });
}

form.onsubmit = async function (e) {
    e.preventDefault(); //отмена отправки формы

    let city = input.value.trim();  //trim обрезает пробелы и табы в конце и в начале

    const data = await getWeather(city);

    if(data.error) {
        removeCard();
        showError(data.error.message);
    } else {

        removeCard();

        console.log(data.current.condition.code);

        const info = conditions.find((obj) => obj.code === data.current.condition.code)
        
        const filePath = './img/' + (data.current.is_day ? 'day' : 'night') + '/';
        const fileName = (data.current.is_day ? info.day : info.night) + '.png';

        const localImgPath = filePath + fileName;

        const remoteImgPath = data.current.condition.icon;

        let imgPath = await checkImgSrc(localImgPath) ? localImgPath : (await checkImgSrc(remoteImgPath) ? remoteImgPath : '')
        
        const condition = data.current.is_day ? info.languages[23]['day_text'] : info.languages[23]['night_text']; // 23 индекс русского языка

        const weatherData = {
            name: data.location.name,
            country: data.location.country,
            temp: data.current.temp_c,
            condition: condition,
            imgPath: imgPath,

        };

        showCard(weatherData);
    }
}
