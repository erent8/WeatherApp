# WeatherApp 🌤️

A modern and user-friendly weather application. View current and 5-day weather forecasts for cities around the world.

## Features ✨

- **Instant Weather**: Detailed weather information for the selected city
- **5 Day Forecast**: Daily and hourly weather forecasts
- **Location Detection**: Weather forecast of your current location with automatic location detection
- **Favorite Cities**: Adding your favorite cities to favorites
- **Recent Calls**: Auto save your last 5 calls
- **City Suggestions**: Automatic city suggestions as you type
- **Theme Options**: Light/Dark theme support
- **Unit Options**: Temperature (°C/°F) and wind speed (km/h/knot) units
- **Animations**: Special animations according to the weather
- **Responsive Design**: Interface compatible with all devices

## Technologies Used 🛠️

- HTML5
-CSS3
- JavaScript (ES6+)
- OpenWeatherMap API
- Chart.js (For graphic display)
- Font Awesome (for Icons)

## Installation 📦

1. Clone the project:
```bash
git clone https://github.com/erent8/WeatherApp.git
```

2. Go to the project directory:
```bash
cd WeatherApp.git
```

3. `config.js` dosyası oluşturun ve OpenWeatherMap API anahtarınızı ekleyin:
```javascript
const config = {
    apiKey: 'YOUR_API_KEY',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    units: 'metric',
    lang: 'tr'
};
```

4. Bir web sunucusu ile projeyi çalıştırın (örneğin Live Server)

## Kullanım 💡

- Şehir adı yazarak arama yapın
- Konum butonuna tıklayarak mevcut konumunuzun hava durumunu görün
- Yıldız ikonuna tıklayarak şehirleri favorilere ekleyin
- Tema değiştirme butonu ile aydınlık/karanlık tema arasında geçiş yapın
- Ayarlar menüsünden birim tercihlerinizi değiştirin
- Tahmin kartlarına tıklayarak saatlik detayları görün

## Ekran Görüntüleri 📸

![Ekran görüntüsü 2025-02-05 005131](https://github.com/user-attachments/assets/fc572af9-3466-4c22-a839-d7b6a601489e)



## Katkıda Bulunma 🤝

1. Bu projeyi fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/yeniOzellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik: XYZ'`)
4. Branch'inizi push edin (`git push origin feature/yeniOzellik`)
5. Pull Request oluşturun

## Lisans 📄

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim 📧

erenterzi@protonmail.com <br>
https://x.com/therenn8

---
⭐️ Bu projeyi beğendiyseniz yıldızlamayı unutmayın!
