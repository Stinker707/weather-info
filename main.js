import conditions from './condition.js';
import error from './error.js';

const apiKey = 'e6051476c5664333a9f172047242011';
const form = document.querySelector('#form');
const input = document.querySelector('#inputCity');
const card = document.querySelector('#card');

async function getWeather(city) {
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&lang=ru`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

function showCard({name, country, temp, condition, imgPath}) {
    const htmlImg = imgPath ? `<img class="card-content__img" src="${imgPath}" alt=""></img>` : '';
    const html = `<h2 class="card-title"><span class="card-title__city">${name}</span><span class="card-title__country">${country}</span></h2>
        <div class="card-content">
            <div class="card-content-value">${temp}<sup class="card-content-value__sup">°c</sup></div>
            ${htmlImg}
        </div>
        ${condition}`;

    card.innerHTML = html;
}

async function checkImgSrc(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
            resolve(true);  // изображение загружено успешно
        };
        
        img.onerror = () => {
            resolve(false);  // ошибка при загрузке изображения
        };
        
        img.src = url;
    });
}

form.onsubmit = async function (e) {
    e.preventDefault(); //отмена отправки формы

    card.classList.add('card--hidden');

    const city = input.value.trim();  //trim обрезает пробелы и табы в конце и в начале

    const data = await getWeather(city);

    if(data.error) {
        card.innerText = error[data.error.code];
    } else {

        const info = conditions.find((obj) => obj.code === data.current.condition.code);
        
        const filePath = './img/' + (data.current.is_day ? 'day' : 'night') + '/';
        const fileName = (data.current.is_day ? info.day : info.night) + '.png';

        const localImgPath = filePath + fileName;

        const remoteImgPath = data.current.condition.icon;

        const imgPath = await checkImgSrc(localImgPath) ? localImgPath : (await checkImgSrc(remoteImgPath) ? remoteImgPath : '');
        const temp = Math.round(data.current.temp_c);
        const weatherData = {
            name: data.location.name,
            country: data.location.country,
            temp,
            condition: data.current.condition.text,
            imgPath,
        };

        showCard(weatherData);
    }
    card.classList.remove('card--hidden');
}
